import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageProvider";

interface ProgressCardProps {
  completedSessions: number;
  totalSessions: number;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ completedSessions, totalSessions }) => {
  const { t } = useLanguage();
  const progressPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>{t.plan.weekProgress}</Text>
        <Text style={styles.progressValue}>
          {completedSessions}/{totalSessions}
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
      </View>
      <Text style={styles.progressLabel}>
        {totalSessions - completedSessions} {t.plan.workoutsRemaining}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
