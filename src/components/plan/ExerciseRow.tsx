import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CheckCircle2, Circle, Edit2, Trash2 } from "lucide-react-native";
import Colors from "@/constants/colors";
import { WorkoutExercise } from "@/types/fitness";

interface ExerciseRowProps {
  exercise: WorkoutExercise;
  isCompleted: boolean;
  showEditOptions: boolean;
  onToggleCompletion: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ExerciseRow: React.FC<ExerciseRowProps> = ({
  exercise,
  isCompleted,
  showEditOptions,
  onToggleCompletion,
  onEdit,
  onDelete,
}) => {
  const isWarmupOrCooldown = exercise.muscleGroup === "Warm-up" || exercise.muscleGroup === "Cool-down";

  return (
    <View style={styles.exerciseRow}>
      <TouchableOpacity onPress={onToggleCompletion}>
        {isCompleted ? (
          <CheckCircle2 size={20} color={Colors.success} />
        ) : (
          <Circle size={20} color={Colors.textLight} />
        )}
      </TouchableOpacity>
      <View style={styles.exerciseInfo}>
        <View style={styles.exerciseNameRow}>
          <Text style={[styles.exerciseName, isCompleted && styles.exerciseCompleted]}>
            {exercise.name}
          </Text>
          {showEditOptions && (
            <View style={styles.exerciseActions}>
              <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                <Edit2 size={16} color={Colors.primary} />
              </TouchableOpacity>
              {!isWarmupOrCooldown && (
                <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                  <Trash2 size={16} color={Colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        <Text style={styles.exerciseDetails}>
          {exercise.sets} sets × {exercise.reps} reps · {exercise.rest}s rest ·{" "}
          {exercise.assignedWeight && exercise.assignedWeight.toLowerCase().includes("body")
            ? "-"
            : exercise.assignedWeight
            ? exercise.assignedWeight
            : exercise.equipment.length === 0
            ? "-"
            : "N/A"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  exerciseInfo: {
    flex: 1,
    gap: 4,
  },
  exerciseNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exerciseActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  exerciseDetails: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  exerciseCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
});
