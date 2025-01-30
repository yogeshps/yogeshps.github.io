interface TaxReliefResult {
  earnedIncomeRelief: number;
  earnedIncomeReliefDisability: number;
  cpfRelief: number;
  cpfTopUpRelief: number;
  nsmanRelief: number;
  totalReliefs: number;
  totalTaxableIncome: number;
}

interface CpfTopUpInputs {
  self: boolean;
  family: boolean;
  selfAmount: string;
  familyAmount: string;
}

interface NSmanReliefState {
  enabled: boolean;
  general: boolean;
  key: boolean;
  wife: boolean;
  parent: boolean;
}

interface TaxReliefInputs {
  age: number;
  taxReliefs: {
    earnedIncomeRelief: boolean;
    earnedIncomeReliefDisability: boolean;
    cpfRelief: boolean;
  };
  cpfTopUpInputs: {
    self: boolean;
    family: boolean;
    selfAmount: string;
    familyAmount: string;
  };
  nsmanRelief: {
    enabled: boolean;
    general: boolean;
    key: boolean;
    wife: boolean;
    parent: boolean;
  };
  employeeCPF: number;
  annualIncome: number;  // Add annual income to inputs
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

export function calculateCpfTopUpRelief(inputs: CpfTopUpInputs): number {
  // Parse amounts with decimals and default to 0
  const selfAmount = Number(parseFloat(inputs.selfAmount || '0').toFixed(2)) || 0;
  const familyAmount = Number(parseFloat(inputs.familyAmount || '0').toFixed(2)) || 0;
  
  const totalAmount = (inputs.self ? Math.min(selfAmount, 8000) : 0) + 
                     (inputs.family ? Math.min(familyAmount, 8000) : 0);
  
  return Number(totalAmount.toFixed(2));
}

export function calculateNSmanRelief(nsmanRelief: NSmanReliefState): number {
  if (!nsmanRelief.enabled) return 0;
  
  let totalRelief = 0;
  
  // General and Key are mutually exclusive
  if (nsmanRelief.general) {
    totalRelief += 1500;
  } else if (nsmanRelief.key) {
    totalRelief += 3500;
  }
  
  // Wife and Parent can be added independently
  if (nsmanRelief.wife) {
    totalRelief += 750;
  }
  if (nsmanRelief.parent) {
    totalRelief += 750;
  }
  
  return totalRelief;
}

export function calculateTaxReliefs({
  age,
  taxReliefs,
  cpfTopUpInputs,
  nsmanRelief,
  employeeCPF,
  annualIncome
}: TaxReliefInputs): TaxReliefResult {
  // Existing relief calculations
  let earnedIncomeRelief = 0;
  if (taxReliefs?.earnedIncomeRelief && annualIncome > 0) {
    const baseRelief = calculateEarnedIncomeRelief(age, false);
    earnedIncomeRelief = Math.min(annualIncome, baseRelief);
  }

  let earnedIncomeReliefDisability = 0;
  if (taxReliefs?.earnedIncomeReliefDisability && annualIncome > 0) {
    const baseRelief = calculateEarnedIncomeRelief(age, true);
    earnedIncomeReliefDisability = Math.min(annualIncome, baseRelief);
  }

  const cpfRelief = taxReliefs?.cpfRelief ? employeeCPF : 0;
  const cpfTopUpRelief = calculateCpfTopUpRelief(cpfTopUpInputs || {});

  // NSman Relief Calculation
  let nsmanReliefValue = 0;
  if (nsmanRelief?.enabled) {
    if (nsmanRelief.general) nsmanReliefValue += 1500;
    if (nsmanRelief.key) nsmanReliefValue += 3500;
    if (nsmanRelief.wife) nsmanReliefValue += 750;
    if (nsmanRelief.parent) nsmanReliefValue += 750;
  }

  // Ensure nsmanReliefValue doesn't exceed annual income
  const nsmanDeduction = Math.min(annualIncome, nsmanReliefValue);

  // Calculate total reliefs
  const totalReliefs = earnedIncomeRelief +
                       earnedIncomeReliefDisability +
                       cpfRelief +
                       cpfTopUpRelief +
                       nsmanDeduction;

  return {
    earnedIncomeRelief,
    earnedIncomeReliefDisability,
    cpfRelief,
    cpfTopUpRelief,
    nsmanRelief: nsmanDeduction,
    totalReliefs,
    totalTaxableIncome: annualIncome
  };
} 