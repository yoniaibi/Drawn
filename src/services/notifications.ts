import * as Notifications from 'expo-notifications';

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyDrawReminder(highValueItem?: string, userTicketCount?: number): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync('draw-reminder').catch(() => {});

  const title = "Tonight's draws close in 15 mins 🔥";
  const body = highValueItem && userTicketCount
    ? `You're in ${userTicketCount} draw${userTicketCount !== 1 ? 's' : ''} — including a ${highValueItem}. Don't miss the 9pm reveal.`
    : "Check tonight's draws before 9pm — tickets from 10p.";

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 45 },
    identifier: 'draw-reminder',
  });
}

export async function cancelDrawReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync('draw-reminder').catch(() => {});
}
