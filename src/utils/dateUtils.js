export function formatTime(dateStr) {
  const d = new Date(dateStr);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export function formatTimeRange(startStr, endStr) {
  if (!endStr) return `${formatTime(startStr)} – running`;
  return `${formatTime(startStr)} – ${formatTime(endStr)}`;
}

export function getDuration(startStr, endStr) {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : new Date();
  const mins = Math.floor((end - start) / 60000);
  if (mins < 0) return null;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatShortDate(date) {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function isToday(date) {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return d.getTime() === today.getTime();
}

export function startOfDay(date) {
  const d = new Date(date); d.setHours(0, 0, 0, 0); return d;
}

export function endOfDay(date) {
  const d = new Date(date); d.setHours(23, 59, 59, 999); return d;
}

export function addDays(date, n) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d;
}

export function getDogAge(birthDateStr) {
  if (!birthDateStr) return 'Age unknown';
  const birth = new Date(birthDateStr);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) { years--; months += 12; }
  const weeks = Math.floor((now - birth) / (7 * 24 * 60 * 60 * 1000));
  if (years > 0) return months > 0 ? `${years}y ${months}mo` : `${years} year${years === 1 ? '' : 's'}`;
  if (months > 0) return `${months} month${months === 1 ? '' : 's'}`;
  return `${weeks} week${weeks === 1 ? '' : 's'}`;
}

export function previewDuration(startDate, endDate) {
  const mins = Math.floor((endDate - startDate) / 60000);
  if (mins < 1) return '< 1 min';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
