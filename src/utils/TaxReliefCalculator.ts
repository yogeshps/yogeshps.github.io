interface TaxReliefResult {
  earnedIncomeRelief: number;
  earnedIncomeReliefDisability: number;
  cpfRelief: number;
  cpfTopUpRelief: number;
  nsmanRelief: number;
  spouseRelief: number;
  totalReliefs: number;
  totalTaxableIncome: number;
}

interface CpfTopUpInputs {
  enabled: boolean;
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
    enabled: boolean;
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
  spouseRelief: { enabled: boolean; disability: boolean };
  employeeCPF: number;
  annualIncome: number;  // Add annual income to inputs
  sprStatus: string;  // Add this parameter
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

export function calculateCpfTopUpRelief(inputs: CpfTopUpInputs, sprStatus: string): number {
  if (!inputs.enabled || sprStatus === 'ep_pep_spass') return 0;
  
  // Parse amounts with decimals and default to 0
  const selfAmount = Number(parseFloat(inputs.selfAmount || '0').toFixed(2)) || 0;
  const familyAmount = Number(parseFloat(inputs.familyAmount || '0').toFixed(2)) || 0;
  
  const totalAmount = (inputs.self ? Math.min(selfAmount, 8000) : 0) + 
                     (inputs.family ? Math.min(familyAmount, 8000) : 0);
  
  return Number(totalAmount.toFixed(2));
}

export function calculateNSmanRelief(nsmanRelief: NSmanReliefState, sprStatus: string): number {
  if (!nsmanRelief.enabled || sprStatus === 'ep_pep_spass') return 0;
  
  let totalRelief = 0;
  
  if (nsmanRelief.general) {
    totalRelief += 1500;
  } else if (nsmanRelief.key) {
    totalRelief += 3500;
  }
  
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
  spouseRelief,
  employeeCPF,
  annualIncome,
  sprStatus
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
  const cpfTopUpRelief = calculateCpfTopUpRelief(cpfTopUpInputs || {}, sprStatus);

  // NSman Relief Calculation
  let nsmanReliefValue = 0;
  if (nsmanRelief?.enabled && sprStatus !== 'ep_pep_spass') {
    if (nsmanRelief.general) nsmanReliefValue += 1500;
    if (nsmanRelief.key) nsmanReliefValue += 3500;
    if (nsmanRelief.wife) nsmanReliefValue += 750;
    if (nsmanRelief.parent) nsmanReliefValue += 750;
  }

  // Use the full NSman relief value without limiting it by annual income
  const nsmanDeduction = nsmanReliefValue;

  // Calculate spouse relief
  let spouseReliefValue = 0;
  if (spouseRelief?.enabled) {
    spouseReliefValue = spouseRelief.disability ? 5500 : 2000;
  }

  // Calculate total reliefs (ensure spouse relief is included)
  const totalReliefs = earnedIncomeRelief +
                       earnedIncomeReliefDisability +
                       cpfRelief +
                       cpfTopUpRelief +
                       nsmanDeduction +
                       spouseReliefValue;

  // Calculate taxable income
  const totalTaxableIncome = Math.max(0, annualIncome - totalReliefs);

  return {
    earnedIncomeRelief,
    earnedIncomeReliefDisability,
    cpfRelief,
    cpfTopUpRelief,
    nsmanRelief: nsmanDeduction,
    spouseRelief: spouseReliefValue,
    totalReliefs,
    totalTaxableIncome
  };
} 