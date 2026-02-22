/**
 * ExerciseItem – renders a single exercise row inside a workout session.
 */
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CheckCircle2, Circle, Edit2, Trash2 } from "lucide-react-native";
import Colors from "@/constants/colors";
import { WorkoutExercise } from "@/types/fitness";

interface ExerciseItemProps {
  exercise: WorkoutExercise;
  isCompleted: boolean;
  showEditActions: boolean;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ExerciseItem({
  exercise,
  isCompleted,
  showEditActions,
  onToggleComplete,
  onEdit,
  onDelete,
}: ExerciseItemProps) {
  const isBodyweight =
    exercise.equipment.length === 0 ||
    (exercise.assignedWeight?.toLowerCase().includes("body") ?? false);

  const weightLabel = exercise.assignedWeight
    ? isBodyweight
      ? "-"
      : exercise.assignedWeight
    : isBodyweight
    ? "-"
    : "N/A";

  const isWarmupOrCooldown =
    exercise.muscleGroup === "Warm-up" || exercise.muscleGroup === "Cool-down";

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={onToggleComplete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        {isCompleted ? (
          <CheckCircle2 size={20} color={Colors.success} />
        ) : (
          <Circle size={20} color={Colors.textLight} />
        )}
      </TouchableOpacity>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, isCompleted && styles.nameCompleted]}>
            {exercise.name}
          </Text>
          {showEditActions && (
            <View style={styles.actions}>
              <TouchableOpacity onPress={onEdit} style={styles.actionBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Edit2 size={15} color={Colors.primary} />
              </TouchableOpacity>
              {!isWarmupOrCooldown && (
                <TouchableOpacity onPress={onDelete} style={styles.actionBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Trash2 size={15} color={Colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <Text style={styles.details}>
          {exercise.sets} sets × {exercise.reps} reps · {exercise.rest}s rest ·{" "}
          {weightLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    flex: 1,
  },
  nameCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textLight,
  },
  details: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
});
