import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListEntries } from "@workspace/api-client-react";
import type { Entry } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useEntries, type SavedEntry } from "@/context/EntriesContext";

function getReferralCode(entry: Entry | SavedEntry): string {
  const firstName = entry.firstName.toLowerCase().replace(/\s+/g, "");
  const ticket = "ticketNumbers" in entry && entry.ticketNumbers.length > 0
    ? entry.ticketNumbers[0]
    : "";
  const giveawayId = "giveawayId" in entry ? entry.giveawayId : 0;
  return `${firstName}-${giveawayId}-${ticket}`;
}

function EntryRow({ entry, onCopy }: { entry: Entry | SavedEntry; onCopy: (code: string) => void }) {
  const colors = useColors();
  const code = getReferralCode(entry);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy(code);
  };

  const giveawayName = "giveawayName" in entry ? entry.giveawayName : `Draw #${entry.giveawayId}`;
  const tickets = "ticketNumbers" in entry ? entry.ticketNumbers : [];

  return (
    <View style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.entryHeader}>
        <Text style={[styles.entryName, { color: colors.foreground }]} numberOfLines={1}>
          {giveawayName}
        </Text>
        <View style={[styles.ticketCountBadge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.ticketCountText, { color: colors.primary }]}>
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {tickets.length > 0 && (
        <View style={styles.ticketRow}>
          {tickets.slice(0, 5).map((t, i) => (
            <View key={i} style={[styles.ticketChip, { backgroundColor: colors.muted }]}>
              <Text style={[styles.ticketChipText, { color: colors.mutedForeground }]}>{t}</Text>
            </View>
          ))}
          {tickets.length > 5 && (
            <Text style={[styles.moreText, { color: colors.mutedForeground }]}>
              +{tickets.length - 5}
            </Text>
          )}
        </View>
      )}

      <View style={[styles.referralRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Ionicons name="link-outline" size={13} color={colors.primary} />
        <Text style={[styles.referralCode, { color: colors.mutedForeground }]} numberOfLines={1}>
          {code}
        </Text>
        <Pressable
          testID="copy-referral-btn"
          onPress={handleCopy}
          style={[styles.copyBtn, { backgroundColor: copied ? colors.secondary : colors.primary }]}
        >
          <Ionicons
            name={copied ? "checkmark" : "copy-outline"}
            size={13}
            color={copied ? colors.primary : colors.primaryForeground}
          />
        </Pressable>
      </View>
    </View>
  );
}

export default function ReferralsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { savedEntries } = useEntries();
  const [emailInput, setEmailInput] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const { data: foundEntries, isLoading: isLookingUp, refetch: lookup } = useListEntries(
    { email: submittedEmail },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { query: { enabled: !!submittedEmail } as any }
  );

  const handleLookup = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    setSubmittedEmail(trimmed);
    lookup();
  };

  const allEntries: (Entry | SavedEntry)[] = [
    ...(foundEntries ?? []),
    ...savedEntries.filter(
      (se) => !foundEntries?.some((fe) => fe.referralCode === getReferralCode(se))
    ),
  ];

  const uniqueEntries = Array.from(
    new Map(allEntries.map((e) => [getReferralCode(e), e])).values()
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={uniqueEntries}
        keyExtractor={(item) => getReferralCode(item)}
        renderItem={({ item }) => (
          <EntryRow entry={item} onCopy={() => {}} />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingTop: topPad + 70, paddingBottom: bottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!uniqueEntries && uniqueEntries.length > 0}
        ListHeaderComponent={
          <View style={styles.lookupSection}>
            <Text style={[styles.lookupTitle, { color: colors.foreground }]}>Find My Tickets</Text>
            <Text style={[styles.lookupDesc, { color: colors.mutedForeground }]}>
              Enter your email to retrieve your entries and referral links.
            </Text>
            <View style={[styles.inputRow, { borderColor: colors.border }]}>
              <TextInput
                testID="email-lookup-input"
                style={[styles.emailInput, { color: colors.foreground }]}
                placeholder="your@email.com"
                placeholderTextColor={colors.mutedForeground}
                value={emailInput}
                onChangeText={setEmailInput}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="search"
                onSubmitEditing={handleLookup}
              />
              <Pressable
                testID="lookup-submit-btn"
                onPress={handleLookup}
                style={[styles.lookupBtn, { backgroundColor: colors.primary }]}
              >
                {isLookingUp ? (
                  <ActivityIndicator size="small" color={colors.primaryForeground} />
                ) : (
                  <Ionicons name="search" size={18} color={colors.primaryForeground} />
                )}
              </Pressable>
            </View>

            {submittedEmail && foundEntries?.length === 0 && !isLookingUp && (
              <View style={styles.noResults}>
                <Ionicons name="ticket-outline" size={24} color={colors.mutedForeground} />
                <Text style={[styles.noResultsText, { color: colors.mutedForeground }]}>
                  No entries found for {submittedEmail}
                </Text>
              </View>
            )}

            {uniqueEntries.length > 0 && (
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                YOUR ENTRIES
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          savedEntries.length === 0 && !submittedEmail ? (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No entries yet
              </Text>
              <Text style={[styles.emptySubText, { color: colors.mutedForeground }]}>
                Enter a draw to get your referral link and earn free tickets.
              </Text>
            </View>
          ) : null
        }
      />

      <View style={[styles.headerBar, { top: topPad, paddingTop: 8 }]} pointerEvents="none">
        <Ionicons name="share-social" size={20} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Referrals</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
  },
  list: {
    paddingHorizontal: 16,
  },
  lookupSection: {
    gap: 10,
    marginBottom: 20,
  },
  lookupTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  lookupDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 4,
  },
  emailInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  lookupBtn: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  noResults: {
    alignItems: "center",
    paddingVertical: 12,
    gap: 6,
  },
  noResultsText: {
    fontSize: 14,
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    letterSpacing: 1.2,
    marginTop: 8,
  },
  entryCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  entryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
  },
  ticketCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ticketCountText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  ticketRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  ticketChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ticketChipText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  moreText: {
    fontSize: 12,
    alignSelf: "center",
  },
  referralRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 6,
    paddingLeft: 10,
    paddingVertical: 2,
    gap: 6,
    overflow: "hidden",
  },
  referralCode: {
    flex: 1,
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  copyBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 40,
    gap: 12,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
