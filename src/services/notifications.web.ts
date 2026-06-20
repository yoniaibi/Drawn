// Web stub — expo-notifications is not supported on web
export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}

export async function scheduleDailyDrawReminder(): Promise<void> {}

export async function cancelDrawReminder(): Promise<void> {}
