/**
 * MealCard – displays a single meal with its macros and a completion toggle.
 */
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CheckCircle2, Circle, Trash2 } from "lucide-react-native";
import Colors from "@/constants/colors";
import { MealSuggestion } from "@/types/fitness";

interface MealCardProps {
  meal: MealSuggestion;
  isCompleted?: boolean;
  language?: string;
  onToggleComplete?: () => void;
  onRemove?: () => void;
}

export default function MealCard({
  meal,
  isCompleted = false,
  language = "ar",
  onToggleComplete,
  onRemove,
}: MealCardProps) {
  const displayName = language === "ar" && meal.nameAr ? meal.nameAr : meal.name;

  return (
    <View style={[styles.card, isCompleted && styles.cardCompleted]}>
      <View style={styles.row}>
        {onToggleComplete && (
          <TouchableOpacity onPress={onToggleComplete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            {isCompleted ? (
              <CheckCircle2 size={20} color={Colors.success} />
            ) : (
              <Circle size={20} color={Colors.textLight} />
            )}
          </TouchableOpacity>
        )}

        <View style={styles.info}>
          <Text style={[styles.name, isCompleted && styles.nameCompleted]}>
            {displayName}
          </Text>
          <Text style={styles.macros}>
            {meal.calories} kcal · P: {meal.protein}g · C: {meal.carbs}g · F:{" "}
            {meal.fats}g
          </Text>
        </View>

        {onRemove && (
          <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash2 size={18} color={Colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardCompleted: {
    opacity: 0.7,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  nameCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textLight,
  },
  macros: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
