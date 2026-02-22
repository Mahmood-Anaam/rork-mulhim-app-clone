import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FitnessProfile } from '@/types/fitness';
import { remoteFitnessRepo } from '@/services/remoteFitnessRepo';

const PROFILE_KEY = "@mulhim_profile";

export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<FitnessProfile | null>(null);

  const saveProfile = useCallback(async (newProfile: FitnessProfile) => {
    try {
      if (!newProfile.fitnessLevel) {
        if (newProfile.activityLevel === "none" || newProfile.activityLevel === "light") {
          newProfile.fitnessLevel = "beginner";
        } else if (newProfile.activityLevel === "moderate") {
          newProfile.fitnessLevel = "intermediate";
        } else {
          newProfile.fitnessLevel = "advanced";
        }
      }

      if (userId) {
        console.log('[useProfile] Saving profile to Supabase');
        try {
          await remoteFitnessRepo.upsertProfile(userId, newProfile);
        } catch (error: any) {
          if (error?.message?.includes('Connection lost') || error?.message === 'NETWORK_ERROR') {
            console.warn('[useProfile] Network error saving profile, saved locally only');
          } else {
            throw error;
          }
        }
      }

      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error("[useProfile] Error saving profile:", error);
      throw error;
    }
  }, [userId]);

  const calculateBMR = useCallback((): number => {
    if (!profile) return 0;
    const { height, age, gender, weight } = profile;
    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }, [profile]);

  const calculateTDEE = useCallback((): number => {
    const bmr = calculateBMR();
    if (!profile) return bmr;

    const activityMultipliers: Record<number, number> = {
      0: 1.2, 1: 1.2, 2: 1.375, 3: 1.55, 4: 1.55, 5: 1.725, 6: 1.725, 7: 1.9,
    };
    const multiplier = activityMultipliers[profile.availableDays] || 1.55;
    return bmr * multiplier;
  }, [calculateBMR, profile]);

  const getTargetCalories = useCallback((): number => {
    const tdee = calculateTDEE();
    if (!profile) return tdee;
    switch (profile.goal) {
      case "fat_loss": return tdee - 500;
      case "muscle_gain": return tdee + 300;
      default: return tdee;
    }
  }, [calculateTDEE, profile]);

  return {
    profile,
    setProfile,
    saveProfile,
    calculateBMR,
    calculateTDEE,
    getTargetCalories,
  };
};
