/**
 * Stat box used in the Profile screen – icon + value + label.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

interface StatBoxProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}

export default function StatBox({ icon, value, label }: StatBoxProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>{icon}</View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    gap: 4,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  label: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
