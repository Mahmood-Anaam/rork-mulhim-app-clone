/**
 * ProfileStats – row of statistics shown on the profile screen.
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import { Activity, TrendingUp, Scale, Calendar } from "lucide-react-native";
import StatBox from "@/components/ui/StatBox";
import Colors from "@/constants/colors";

interface ProfileStatsProps {
  streak: number;
  totalWorkouts: number;
  currentWeight: number;
  startWeight: number;
  labels: {
    consecutiveDays: string;
    workouts: string;
    currentWeight: string;
    weightChange: string;
  };
}

export default function ProfileStats({
  streak,
  totalWorkouts,
  currentWeight,
  startWeight,
  labels,
}: ProfileStatsProps) {
  const weightChange = currentWeight - startWeight;
  const weightChangeStr =
    weightChange >= 0
      ? `+${weightChange.toFixed(1)} kg`
      : `${weightChange.toFixed(1)} kg`;

  return (
    <View style={styles.row}>
      <StatBox
        icon={<Activity size={18} color={Colors.primary} />}
        value={streak}
        label={labels.consecutiveDays}
      />
      <StatBox
        icon={<TrendingUp size={18} color={Colors.success} />}
        value={totalWorkouts}
        label={labels.workouts}
      />
      <StatBox
        icon={<Scale size={18} color={Colors.accent} />}
        value={`${currentWeight} kg`}
        label={labels.currentWeight}
      />
      <StatBox
        icon={<Calendar size={18} color={Colors.secondary} />}
        value={weightChangeStr}
        label={labels.weightChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
});
