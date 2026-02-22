import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { X, CheckCircle2 } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageProvider";
import { WeeklyPlan } from "@/types/fitness";

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  currentWeekPlan: WeeklyPlan;
  completedSessions: number;
  totalSessions: number;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  onClose,
  currentWeekPlan,
  completedSessions,
  totalSessions,
}) => {
  const { t } = useLanguage();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t.plan.weekCalendar}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarGrid}>
            {currentWeekPlan.sessions.map((session) => {
              const completedCount = session.completedExercises?.length || 0;
              const totalCount = session.exercises.length;
              const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

              return (
                <View key={session.id} style={styles.calendarDay}>
                  <View style={styles.calendarDayHeader}>
                    <Text style={styles.calendarDayName}>{session.day.slice(0, 3)}</Text>
                    {session.completed && <CheckCircle2 size={16} color={Colors.success} />}
                  </View>
                  <Text style={styles.calendarWorkoutName}>{session.name}</Text>
                  <View style={styles.calendarProgressBar}>
                    <View style={[styles.calendarProgress, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.calendarProgressText}>
                    {completedCount}/{totalCount}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.calendarStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>
                {t.plan.weekNumber} {currentWeekPlan.weekNumber}
              </Text>
              <Text style={styles.statValue}>
                {completedSessions}/{totalSessions} {t.plan.completed}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarGrid: {
    gap: 12,
    marginBottom: 24,
  },
  calendarDay: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  calendarDayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  calendarDayName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  calendarWorkoutName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  calendarProgressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  calendarProgress: {
    height: "100%",
    backgroundColor: Colors.primary,
  },
  calendarProgressText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  calendarStats: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    gap: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
});
