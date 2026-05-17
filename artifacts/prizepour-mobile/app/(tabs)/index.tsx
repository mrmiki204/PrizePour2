import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { AppText as Text } from "@/components/AppText";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useListGiveaways } from "@workspace/api-client-react";
import type { Giveaway } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { GiveawayCard } from "@/components/GiveawayCard";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: giveaways, isLoading, isError, refetch, isFetching } = useListGiveaways();

  const handlePress = useCallback(
    (giveaway: Giveaway) => {
      router.push(`/giveaway/${giveaway.id}`);
    },
    [router]
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, "transparent"]}
        style={[styles.headerGradient, { height: topPad + 70 }]}
        pointerEvents="none"
      />

      <FlatList
        data={giveaways ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <GiveawayCard giveaway={item} onPress={() => handlePress(item)} />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingTop: topPad + 70, paddingBottom: bottomPad + 100 },
        ]}
        scrollEnabled={!!giveaways && giveaways.length > 0}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            ACTIVE DRAWS
          </Text>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Loading draws...
              </Text>
            </View>
          ) : isError ? (
            <View style={styles.center}>
              <Ionicons name="wifi-outline" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Couldn't load draws
              </Text>
              <Text
                style={[styles.retryText, { color: colors.primary }]}
                onPress={() => refetch()}
              >
                Try again
              </Text>
            </View>
          ) : (
            <View style={styles.center}>
              <Ionicons name="wine-outline" size={44} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No active draws right now
              </Text>
              <Text style={[styles.emptySubText, { color: colors.mutedForeground }]}>
                Check back soon for new giveaways
              </Text>
            </View>
          )
        }
      />

      <View
        style={[
          styles.headerBar,
          { top: topPad, paddingTop: 8 },
        ]}
        pointerEvents="none"
      >
        <Ionicons name="wine" size={22} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>PrizePour</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerBar: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 11,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
  },
  list: {
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  center: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500" as const,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    textAlign: "center",
  },
  retryText: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginTop: 4,
  },
});
