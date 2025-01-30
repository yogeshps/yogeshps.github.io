export function calculateTaxableIncome(
  baseIncome: number,
  bonus: number,
  rsuGains: number,
  esopGains: number,
  taxReliefs: number
): number {
  const totalIncome = baseIncome + bonus + rsuGains + esopGains;
  return Math.max(0, totalIncome - taxReliefs);
} 