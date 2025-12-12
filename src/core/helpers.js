export function safeNumber(n) {
  return Number(n || 0);
}

export function pad2(n) {
  return String(n).padStart(2, "0");
}
