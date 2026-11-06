// Shared Ukrainian wording for the A1-01 … A1-03 units.

/** Feedback for an answer that matches no reviewed variant (never a fake failure). */
export function U(reference: string): string {
  return `Цієї відповіді немає серед перевірених варіантів, тому вона не оцінюється ні як правильна, ні як помилкова. Зразок: ${reference}`;
}
