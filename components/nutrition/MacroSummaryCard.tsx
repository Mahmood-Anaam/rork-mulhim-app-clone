/**
 * MacroSummaryCard – shows daily calorie and macro targets.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

interface MacroSummaryCardProps {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  labels: {
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
    target: string;
  };
}

export default function MacroSummaryCard({
  calories,
  protein,
  carbs,
  fats,
  labels,
}: MacroSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.caloriesRow}>
        <Text style={styles.caloriesValue}>{calories}</Text>
        <Text style={styles.caloriesUnit}> kcal {labels.target}</Text>
      </View>
      <View style={styles.macrosRow}>
        <MacroItem value={protein} label={labels.protein} color="#E74C3C" />
        <MacroItem value={carbs} label={labels.carbs} color="#3498DB" />
        <MacroItem value={fats} label={labels.fats} color="#F39C12" />
      </View>
    </View>
  );
}

function MacroItem({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.macroItem}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <View>
        <Text style={styles.macroValue}>{value}g</Text>
        <Text style={styles.macroLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  caloriesRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  caloriesValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  caloriesUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  macroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  macroValue: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  macroLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
