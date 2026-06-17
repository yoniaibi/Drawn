export function getCountdownTo9pm(): { h: string; m: string; s: string } {
  const now = new Date();
  const target = new Date();
  target.setHours(21, 0, 0, 0);
  if (now >= target) target.setDate(target.getDate() + 1);
  const diff = target.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return { h: pad(h), m: pad(m), s: pad(s) };
}

export function formatTicketPrice(pence: number): string {
  return pence < 100 ? `${pence}p` : `£${(pence / 100).toFixed(2)}`;
}

export function formatPounds(pence: number): string {
  return `£${(pence / 100).toFixed(0)}`;
}
