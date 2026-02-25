export function formatDateLabel(dataISO) {
  if (!dataISO) return "";

  const data = new Date(dataISO + "T00:00:00");

  return data
    .toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short"
    })
    .replace(".", "")
    .toUpperCase();
}
