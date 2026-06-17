import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'drawn_streak_v1';
const LAST_VISIT_KEY = 'drawn_last_visit_v1';

export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [isNewDay, setIsNewDay] = useState(false);

  useEffect(() => {
    (async () => {
      const today = new Date().toDateString();
      const lastVisit = await AsyncStorage.getItem(LAST_VISIT_KEY);
      const stored = parseInt((await AsyncStorage.getItem(STREAK_KEY)) ?? '0');

      if (lastVisit === today) {
        setStreak(stored);
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = lastVisit === yesterday.toDateString();

      const newStreak = wasYesterday ? stored + 1 : 1;
      setStreak(newStreak);
      setIsNewDay(true);

      await AsyncStorage.setItem(LAST_VISIT_KEY, today);
      await AsyncStorage.setItem(STREAK_KEY, String(newStreak));
    })();
  }, []);

  return { streak, isNewDay };
}
