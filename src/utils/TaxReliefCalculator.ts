interface TaxReliefResult {
  earnedIncomeRelief: number;
  earnedIncomeReliefDisability: number;
  totalReliefs: number;
}

export function calculateEarnedIncomeRelief(age: number, isDisability: boolean): number {
  if (isDisability) {
    if (age < 55) return 4000;
    if (age >= 55 && age < 60) return 10000;
    return 12000;
  } else {
    if (age < 55) return 1000;
    if (age >= 55 && age < 60) return 6000;
    return 8000;
  }
}

export function calculateTaxReliefs(age: number, taxReliefs: { 
  earnedIncomeRelief: boolean;
  earnedIncomeReliefDisability: boolean;
}): TaxReliefResult {
  const earnedIncomeRelief = taxReliefs.earnedIncomeRelief ? 
    calculateEarnedIncomeRelief(age, false) : 0;
    
  const earnedIncomeReliefDisability = taxReliefs.earnedIncomeReliefDisability ? 
    calculateEarnedIncomeRelief(age, true) : 0;

  return {
    earnedIncomeRelief,
    earnedIncomeReliefDisability,
    totalReliefs: earnedIncomeRelief + earnedIncomeReliefDisability
  };
} 