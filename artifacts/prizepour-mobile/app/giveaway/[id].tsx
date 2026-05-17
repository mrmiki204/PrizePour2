import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { AppText as Text } from "@/components/AppText";
import { AppTextInput as TextInput } from "@/components/AppTextInput";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import {
  useGetGiveaway,
  useCreateStripeCheckout,
  useListEntries,
  type Entry,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useEntries } from "@/context/EntriesContext";

const TICKET_PRICE = 4.99;
const TICKET_PRICE_PENCE = Math.round(TICKET_PRICE * 100);

function getTimeLeft(drawDate: string): string {
  const diff = new Date(drawDate).getTime() - Date.now();
  if (diff <= 0) return "Draw closed";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${mins}m remaining`;
  return `${mins}m remaining`;
}

function getReferralCode(entry: Entry, firstName: string): string {
  const fn = firstName.toLowerCase().replace(/\s+/g, "");
  const ticket = entry.ticketNumbers[0] ?? "";
  return `${fn}-${entry.giveawayId}-${ticket}`;
}

interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

function Stepper({ value, min, max, onChange }: StepperProps) {
  const colors = useColors();
  return (
    <View style={[styles.stepper, { borderColor: colors.border }]}>
      <Pressable
        testID="stepper-minus"
        onPress={() => { if (value > min) { onChange(value - 1); Haptics.selectionAsync(); } }}
        style={[styles.stepperBtn, { opacity: value <= min ? 0.4 : 1 }]}
      >
        <Ionicons name="remove" size={20} color={colors.primary} />
      </Pressable>
      <Text style={[styles.stepperValue, { color: colors.foreground }]}>{value}</Text>
      <Pressable
        testID="stepper-plus"
        onPress={() => { if (value < max) { onChange(value + 1); Haptics.selectionAsync(); } }}
        style={[styles.stepperBtn, { opacity: value >= max ? 0.4 : 1 }]}
      >
        <Ionicons name="add" size={20} color={colors.primary} />
      </Pressable>
    </View>
  );
}

export default function GiveawayDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const giveawayId = parseInt(id, 10);
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { saveEntry } = useEntries();

  const { data: giveaway, isLoading, isError } = useGetGiveaway(giveawayId);

  const [ticketQty, setTicketQty] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [showVerify, setShowVerify] = useState(false);
  const [lookupEmail, setLookupEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const { mutateAsync: createCheckoutMutation, isPending: isCheckingOut } = useCreateStripeCheckout();

  const { data: foundEntries, isLoading: isLookingUp, refetch: lookupEntries } = useListEntries(
    { email: submittedEmail },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { query: { enabled: !!submittedEmail } as any }
  );

  const giveawayEntries = foundEntries?.filter((e) => e.giveawayId === giveawayId) ?? [];

  const spotsLeft = giveaway ? giveaway.maxEntries - giveaway.entryCount : 0;
  const maxTickets = Math.min(10, spotsLeft);
  const total = (ticketQty * TICKET_PRICE).toFixed(2);
  const capacityPct = giveaway ? giveaway.entryCount / giveaway.maxEntries : 0;

  useEffect(() => {
    if (maxTickets > 0 && ticketQty > maxTickets) setTicketQty(maxTickets);
  }, [maxTickets, ticketQty]);

  const validateForm = () => {
    if (!firstName.trim()) { Alert.alert("Required", "Please enter your first name."); return false; }
    if (!lastName.trim()) { Alert.alert("Required", "Please enter your last name."); return false; }
    if (!email.trim() || !email.includes("@")) { Alert.alert("Required", "Please enter a valid email."); return false; }
    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await createCheckoutMutation({
        data: {
          giveawayId,
          ticketQty,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          amountCents: ticketQty * TICKET_PRICE_PENCE,
        },
      });
      if (result.url) {
        await WebBrowser.openBrowserAsync(result.url, {
          dismissButtonStyle: "close",
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        });
        setLookupEmail(email.trim().toLowerCase());
        setShowVerify(true);
      }
    } catch {
      Alert.alert("Error", "Couldn't create checkout session. Please check your connection.");
    }
  };

  const handleVerify = () => {
    const trimmed = lookupEmail.trim().toLowerCase();
    if (!trimmed.includes("@")) { Alert.alert("Invalid email", "Please enter your email."); return; }
    setSubmittedEmail(trimmed);
    lookupEntries();
  };

  const handleSaveEntry = async (entry: Entry) => {
    const code = getReferralCode(entry, firstName || entry.firstName);
    await saveEntry({
      id: String(entry.id),
      giveawayId: entry.giveawayId,
      giveawayName: giveaway?.name ?? `Draw #${giveawayId}`,
      firstName: entry.firstName,
      email: entry.email,
      ticketNumbers: entry.ticketNumbers,
      referralCode: code,
      amountPaid: entry.amountPaid,
      createdAt: entry.createdAt,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (isError || !giveaway) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Couldn't load this draw
        </Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { borderColor: colors.border }]}>
          <Text style={{ color: colors.primary }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 40 }}
      >
        <View style={styles.heroContainer}>
          {giveaway.imageUrl ? (
            <Image source={{ uri: giveaway.imageUrl }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroPlaceholder, { backgroundColor: colors.muted }]}>
              <Ionicons name="wine-outline" size={60} color={colors.primary} />
            </View>
          )}
          <LinearGradient
            colors={["transparent", colors.background]}
            style={styles.heroGradient}
          />
          <View style={[styles.backBtnOverlay, { top: topPad + 10 }]}>
            <Pressable
              testID="back-btn"
              onPress={() => router.back()}
              style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.5)" }]}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </Pressable>
          </View>
          <View style={[styles.prizeTag, { backgroundColor: colors.primary }]}>
            <Text style={[styles.prizeTagText, { color: colors.primaryForeground }]}>
              {giveaway.prizeValue}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.foreground }]}>{giveaway.name}</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {giveaway.description}
          </Text>

          <View style={styles.statsRow}>
            <View style={[styles.statChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.foreground }]}>
                {getTimeLeft(giveaway.drawDate)}
              </Text>
            </View>
            <View style={[styles.statChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="people-outline" size={14} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.foreground }]}>
                {spotsLeft} spots left
              </Text>
            </View>
          </View>

          <View style={styles.capacityRow}>
            <View style={[styles.capacityTrack, { backgroundColor: colors.muted }]}>
              <View
                style={[
                  styles.capacityFill,
                  {
                    backgroundColor: capacityPct > 0.85 ? "#e05050" : colors.primary,
                    width: `${Math.max(capacityPct * 100, 1)}%` as `${number}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.capacityLabel, { color: colors.mutedForeground }]}>
              {Math.round(capacityPct * 100)}% filled
            </Text>
          </View>

          {spotsLeft <= 0 ? (
            <View style={[styles.soldOutBanner, { backgroundColor: colors.muted }]}>
              <Ionicons name="close-circle-outline" size={20} color={colors.destructive} />
              <Text style={[styles.soldOutText, { color: colors.destructive }]}>
                This draw is fully booked
              </Text>
            </View>
          ) : (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Enter This Draw</Text>

              <View style={styles.ticketRow}>
                <View>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Tickets</Text>
                  <Text style={[styles.priceHint, { color: colors.mutedForeground }]}>
                    £{TICKET_PRICE.toFixed(2)} each
                  </Text>
                </View>
                <Stepper
                  value={ticketQty}
                  min={1}
                  max={Math.max(maxTickets, 1)}
                  onChange={setTicketQty}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>First Name</Text>
                <TextInput
                  testID="first-name-input"
                  style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="Jane"
                  placeholderTextColor={colors.mutedForeground}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Last Name</Text>
                <TextInput
                  testID="last-name-input"
                  style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="Smith"
                  placeholderTextColor={colors.mutedForeground}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Email</Text>
                <TextInput
                  testID="email-input"
                  style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="jane@example.com"
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="done"
                />
              </View>

              <View style={[styles.totalRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
                  {ticketQty} ticket{ticketQty !== 1 ? "s" : ""}
                </Text>
                <Text style={[styles.totalPrice, { color: colors.primary }]}>£{total}</Text>
              </View>

              <Pressable
                testID="checkout-btn"
                onPress={handleCheckout}
                disabled={isCheckingOut}
                style={[styles.checkoutBtn, { backgroundColor: colors.primary, opacity: isCheckingOut ? 0.7 : 1 }]}
              >
                {isCheckingOut ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <>
                    <Ionicons name="card-outline" size={18} color={colors.primaryForeground} />
                    <Text style={[styles.checkoutBtnText, { color: colors.primaryForeground }]}>
                      Pay with Stripe — £{total}
                    </Text>
                  </>
                )}
              </Pressable>

              {showVerify && (
                <View style={[styles.verifySection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.verifyHeader}>
                    <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
                    <Text style={[styles.verifyTitle, { color: colors.foreground }]}>
                      Payment completed?
                    </Text>
                  </View>
                  <Text style={[styles.verifyDesc, { color: colors.mutedForeground }]}>
                    After paying, find your tickets below.
                  </Text>

                  <View style={[styles.inputRow, { borderColor: colors.border }]}>
                    <TextInput
                      testID="verify-email-input"
                      style={[styles.verifyInput, { color: colors.foreground }]}
                      placeholder="Confirm your email"
                      placeholderTextColor={colors.mutedForeground}
                      value={lookupEmail}
                      onChangeText={setLookupEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      returnKeyType="search"
                      onSubmitEditing={handleVerify}
                    />
                    <Pressable
                      testID="verify-btn"
                      onPress={handleVerify}
                      style={[styles.verifyBtn, { backgroundColor: colors.primary }]}
                    >
                      {isLookingUp ? (
                        <ActivityIndicator size="small" color={colors.primaryForeground} />
                      ) : (
                        <Ionicons name="search" size={16} color={colors.primaryForeground} />
                      )}
                    </Pressable>
                  </View>

                  {giveawayEntries.length > 0 && (
                    <View style={styles.foundEntries}>
                      {giveawayEntries.map((entry) => {
                        const code = getReferralCode(entry, entry.firstName);
                        return (
                          <View key={entry.id} style={[styles.foundEntry, { backgroundColor: colors.muted }]}>
                            <View style={styles.foundEntryHeader}>
                              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                              <Text style={[styles.foundEntryTitle, { color: colors.foreground }]}>
                                {entry.ticketQty} ticket{entry.ticketQty !== 1 ? "s" : ""} confirmed
                              </Text>
                            </View>
                            <View style={styles.ticketChips}>
                              {entry.ticketNumbers.map((t, i) => (
                                <View key={i} style={[styles.ticketChip, { backgroundColor: colors.secondary }]}>
                                  <Text style={[styles.ticketChipText, { color: colors.primary }]}>{t}</Text>
                                </View>
                              ))}
                            </View>
                            <View style={[styles.codeRow, { borderColor: colors.border }]}>
                              <Text style={[styles.codeLabel, { color: colors.mutedForeground }]}>
                                Referral:
                              </Text>
                              <Text style={[styles.codeValue, { color: colors.foreground }]} numberOfLines={1}>
                                {code}
                              </Text>
                            </View>
                            <Pressable
                              onPress={() => handleSaveEntry(entry)}
                              style={[styles.saveBtn, { borderColor: colors.primary }]}
                            >
                              <Ionicons name="bookmark-outline" size={14} color={colors.primary} />
                              <Text style={[styles.saveBtnText, { color: colors.primary }]}>
                                Save to My Referrals
                              </Text>
                            </Pressable>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {submittedEmail && foundEntries && giveawayEntries.length === 0 && !isLookingUp && (
                    <View style={styles.notFoundRow}>
                      <Ionicons name="alert-circle-outline" size={16} color={colors.mutedForeground} />
                      <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>
                        No tickets found yet. It may take a moment to appear.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontSize: 16, textAlign: "center" },
  backBtn: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 },
  heroContainer: { height: 280, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroPlaceholder: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  heroGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: 120 },
  backBtnOverlay: { position: "absolute", left: 16 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  prizeTag: {
    position: "absolute",
    bottom: 20,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  prizeTagText: { fontSize: 16, fontWeight: "700" as const },
  content: { padding: 20, gap: 14 },
  title: { fontSize: 22, fontWeight: "700" as const, lineHeight: 28 },
  description: { fontSize: 15, lineHeight: 22 },
  statsRow: { flexDirection: "row", gap: 10 },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  statText: { fontSize: 13, fontWeight: "500" as const },
  capacityRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  capacityTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  capacityFill: { height: "100%", borderRadius: 3 },
  capacityLabel: { fontSize: 12, minWidth: 70, textAlign: "right" },
  soldOutBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 8,
  },
  soldOutText: { fontSize: 15, fontWeight: "600" as const },
  divider: { height: 1, marginVertical: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const },
  ticketRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  stepperBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  stepperValue: { width: 40, textAlign: "center", fontSize: 18, fontWeight: "700" as const },
  formGroup: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "600" as const, letterSpacing: 0.5 },
  priceHint: { fontSize: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  totalLabel: { fontSize: 15 },
  totalPrice: { fontSize: 22, fontWeight: "700" as const },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 10,
  },
  checkoutBtnText: { fontSize: 16, fontWeight: "700" as const },
  verifySection: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    gap: 10,
    marginTop: 4,
  },
  verifyHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  verifyTitle: { fontSize: 16, fontWeight: "600" as const },
  verifyDesc: { fontSize: 14 },
  inputRow: { flexDirection: "row", borderWidth: 1, borderRadius: 8, overflow: "hidden" },
  verifyInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },
  verifyBtn: { width: 44, alignItems: "center", justifyContent: "center" },
  foundEntries: { gap: 10 },
  foundEntry: { borderRadius: 8, padding: 12, gap: 8 },
  foundEntryHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  foundEntryTitle: { fontSize: 14, fontWeight: "600" as const },
  ticketChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  ticketChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  ticketChipText: { fontSize: 12, fontWeight: "600" as const },
  codeRow: { flexDirection: "row", alignItems: "center", gap: 6, borderTopWidth: 1, paddingTop: 8 },
  codeLabel: { fontSize: 12 },
  codeValue: {
    flex: 1,
    fontSize: 12,
    fontFamily: "PlayfairDisplay_400Regular",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: "flex-start",
  },
  saveBtnText: { fontSize: 13, fontWeight: "600" as const },
  notFoundRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  notFoundText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
