/**
 * WeekProgressCard – displays weekly workout progress bar.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

interface WeekProgressCardProps {
  completed: number;
  total: number;
  workoutsRemainingLabel: string;
  weekProgressLabel: string;
}

export default function WeekProgressCard({
  completed,
  total,
  workoutsRemainingLabel,
  weekProgressLabel,
}: WeekProgressCardProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{weekProgressLabel}</Text>
        <Text style={styles.count}>
          {completed}/{total}
        </Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.remaining}>
        {total - completed} {workoutsRemainingLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  count: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  barBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  remaining: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
