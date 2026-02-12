
export const fetchSpendingTip = async (
  categoryName: string,
  budget: number,
  spent: number
): Promise<string> => {
  const fallback = `It looks like you're getting close to your budget for ${categoryName}. Try to review your recent expenses to see where you can save.`;

  try {
    const response = await fetch('/api/spending-tip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryName, budget, spent }),
    });

    if (!response.ok) return fallback;

    const data = (await response.json()) as { tip?: string };
    const tip = data?.tip?.trim();
    return tip || fallback;
  } catch {
    return fallback;
  }
};
