import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { Giveaway } from "@workspace/api-client-react";

const TICKET_PRICE = 4.99;

function getTimeLeft(drawDate: string): string {
  const diff = new Date(drawDate).getTime() - Date.now();
  if (diff <= 0) return "Draw closed";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

function CountdownBadge({ drawDate }: { drawDate: string }) {
  const colors = useColors();
  const [label, setLabel] = useState(() => getTimeLeft(drawDate));

  useEffect(() => {
    const timer = setInterval(() => setLabel(getTimeLeft(drawDate)), 30000);
    return () => clearInterval(timer);
  }, [drawDate]);

  return (
    <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.55)" }]}>
      <Ionicons name="time-outline" size={11} color={colors.primary} />
      <Text style={[styles.badgeText, { color: colors.foreground }]}>{label}</Text>
    </View>
  );
}

interface Props {
  giveaway: Giveaway;
  onPress: () => void;
}

export function GiveawayCard({ giveaway, onPress }: Props) {
  const colors = useColors();
  const capacityPct = Math.min(giveaway.entryCount / giveaway.maxEntries, 1);
  const spotsLeft = giveaway.maxEntries - giveaway.entryCount;
  const priceDisplay = `£${TICKET_PRICE.toFixed(2)} / ticket`;

  const filledColor = capacityPct > 0.85 ? "#e05050" : colors.primary;

  return (
    <Pressable
      testID={`giveaway-card-${giveaway.id}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={styles.imageContainer}>
        {giveaway.imageUrl ? (
          <Image source={{ uri: giveaway.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.muted }]}>
            <Ionicons name="wine-outline" size={40} color={colors.primary} />
          </View>
        )}
        <LinearGradient
          colors={["transparent", "rgba(17,14,12,0.92)"]}
          style={styles.imageGradient}
        />
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.primaryForeground, fontWeight: "700" as const }]}>
              {giveaway.prizeValue}
            </Text>
          </View>
          <CountdownBadge drawDate={giveaway.drawDate} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
          {giveaway.name}
        </Text>

        <View style={styles.capacityRow}>
          <View style={[styles.capacityTrack, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.capacityFill,
                { backgroundColor: filledColor, width: `${Math.max(capacityPct * 100, 2)}%` as `${number}%` },
              ]}
            />
          </View>
          <Text style={[styles.spotsText, { color: colors.mutedForeground }]}>
            {spotsLeft > 0 ? `${spotsLeft} left` : "Full"}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.price, { color: colors.mutedForeground }]}>{priceDisplay}</Text>
          <View style={[styles.enterBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.enterBtnText, { color: colors.primaryForeground }]}>Enter</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primaryForeground} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  imageContainer: {
    height: 180,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  badgeRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  body: {
    padding: 14,
    gap: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "700" as const,
    lineHeight: 22,
  },
  capacityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  capacityTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  capacityFill: {
    height: "100%",
    borderRadius: 3,
  },
  spotsText: {
    fontSize: 11,
    fontWeight: "500" as const,
    minWidth: 44,
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 13,
  },
  enterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  enterBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
});
