import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, Edit2, Dumbbell } from "lucide-react-native";
import Colors from "@/constants/colors";
import { WorkoutSession } from "@/types/fitness";
import { ExerciseRow } from "./ExerciseRow";
import { useLanguage } from "@/context/LanguageProvider";

interface SessionCardProps {
  session: WorkoutSession;
  isExpanded: boolean;
  showEditOptions: boolean;
  onToggleExpanded: () => void;
  onToggleCompletion: () => void;
  onToggleExerciseCompletion: (exerciseId: string) => void;
  onEditExercise: (exercise: any) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onToggleEditOptions: () => void;
  onStartWorkout: () => void;
  onAddExercise: () => void;
  onRegenerateSession: () => void;
  isAuthenticated: boolean;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  isExpanded,
  showEditOptions,
  onToggleExpanded,
  onToggleCompletion,
  onToggleExerciseCompletion,
  onEditExercise,
  onDeleteExercise,
  onToggleEditOptions,
  onStartWorkout,
  onAddExercise,
  onRegenerateSession,
  isAuthenticated,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.sessionCard}>
      <TouchableOpacity onPress={onToggleExpanded}>
        <View style={styles.sessionHeader}>
          <View style={styles.sessionHeaderLeft}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onToggleCompletion();
              }}
            >
              {session.completed ? (
                <CheckCircle2 size={24} color={Colors.success} />
              ) : (
                <Circle size={24} color={Colors.textLight} />
              )}
            </TouchableOpacity>
            <View>
              <Text style={styles.sessionDay}>{session.day}</Text>
              <Text style={styles.sessionName}>{session.name}</Text>
            </View>
          </View>
          <View style={styles.sessionHeaderRight}>
            <View style={styles.durationBadge}>
              <Clock size={14} color={Colors.textSecondary} />
              <Text style={styles.durationText}>{session.duration}min</Text>
            </View>
            {isExpanded ? (
              <ChevronUp size={20} color={Colors.textSecondary} />
            ) : (
              <ChevronDown size={20} color={Colors.textSecondary} />
            )}
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <>
          {session.restNote && (
            <View style={styles.restNoteContainer}>
              <Text style={styles.restNoteText}>{session.restNote}</Text>
            </View>
          )}

          <View style={styles.exercisesContainer}>
            {session.exercises.map((exercise) => (
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                isCompleted={session.completedExercises?.includes(exercise.id) || false}
                showEditOptions={showEditOptions}
                onToggleCompletion={() => onToggleExerciseCompletion(exercise.id)}
                onEdit={() => onEditExercise(exercise)}
                onDelete={() => onDeleteExercise(exercise.id)}
              />
            ))}
          </View>

          {showEditOptions && (
            <View style={styles.editOptionsContainer}>
              <TouchableOpacity style={styles.inlineEditOptionButton} onPress={onAddExercise}>
                <Dumbbell size={20} color={Colors.primary} />
                <View style={styles.inlineEditOptionTextContainer}>
                  <Text style={styles.inlineEditOptionTitle}>{t.plan.addExercise}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.inlineEditOptionButton} onPress={onRegenerateSession}>
                <Clock size={20} color={Colors.primary} />
                <View style={styles.inlineEditOptionTextContainer}>
                  <Text style={styles.inlineEditOptionTitle}>{t.plan.regenerateSession}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.editSessionButton} onPress={onToggleEditOptions}>
            <Edit2 size={18} color={Colors.primary} />
            <Text style={styles.editSessionButtonText}>
              {showEditOptions ? t.plan.hideEdits : t.plan.editSession}
            </Text>
          </TouchableOpacity>

          {!session.completed && (
            <TouchableOpacity style={styles.startButton} onPress={onStartWorkout}>
              <Dumbbell size={18} color={Colors.background} />
              <Text style={styles.startButtonText}>
                {isAuthenticated ? t.plan.startWorkout : t.plan.loginToStart}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sessionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sessionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sessionDay: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  exercisesContainer: {
    gap: 12,
  },
  restNoteContainer: {
    backgroundColor: "#FFF3CD",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFE69C",
    marginBottom: 12,
  },
  restNoteText: {
    fontSize: 13,
    color: "#856404",
    textAlign: "center",
  },
  editOptionsContainer: {
    gap: 8,
    marginBottom: 8,
  },
  inlineEditOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inlineEditOptionTextContainer: {
    flex: 1,
  },
  inlineEditOptionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  editSessionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginTop: 8,
  },
  editSessionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  startButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.background,
  },
});
