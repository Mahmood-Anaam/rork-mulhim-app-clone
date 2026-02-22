/**
 * Full-screen loading indicator.
 */
import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    gap: 12,
  },
  text: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
