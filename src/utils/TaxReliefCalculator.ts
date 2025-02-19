import * as constants from './constants';
import { MAX_TAX_RELIEF } from './constants';

interface TaxReliefResult {
  earnedIncomeRelief: number;
  earnedIncomeReliefDisability: number;
  cpfRelief: number;
  cpfTopUpRelief: number;
  nsmanRelief: number;
  spouseRelief: number;
  parentRelief: number;
  parentDisabilityRelief: number;
  siblingDisabilityRelief: number;
  grandparentCaregiverRelief: number;
  qualifyingChildRelief: number;
  qualifyingChildReliefDisability: number;
  workingMothersChildRelief: number;
  srsContributionRelief: number;
  lifeInsuranceRelief: number;
  courseFeesRelief: number;
  fdwlRelief: number;
  totalReliefs: number;
  totalTaxableIncome: number;
  rawTotalReliefs: number;
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
  parentRelief: {
    enabled: boolean;
    dependants: string;
    dependantDetails: ParentDependant[];
  };
  siblingRelief: { enabled: boolean; dependants: string };
  employeeCPF: number;
  annualIncome: number;
  sprStatus: string;
  grandparentCaregiverRelief: { enabled: boolean };
  qualifyingChildRelief: { enabled: boolean; count: string };
  qualifyingChildReliefDisability: { enabled: boolean; count: string };
  workingMothersChildRelief: {
    enabled: boolean;
    amount: string;
  };
  srsContributionRelief?: { enabled: boolean; amount: string };
  lifeInsuranceRelief: {
    enabled: boolean;
    amount: string;
  };
  courseFeesRelief: { enabled: boolean; amount: string };
  fdwlRelief: { enabled: boolean; amount: string };
}

interface ParentDependant {
  staysWithMe: boolean;
  hasDisability: boolean;
}

interface ParentRelief {
  enabled: boolean;
  dependants: string;
  dependantDetails: ParentDependant[];
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

function calculateParentRelief(parentRelief: ParentRelief): number {
  return parentRelief.dependantDetails.reduce((total, dependant) => {
    let amount = 0;
    if (dependant.hasDisability) {
      amount = dependant.staysWithMe ? 14000 : 10000;
    } else {
      amount = dependant.staysWithMe ? 9000 : 5500;
    }
    return total + amount;
  }, 0);
}

function calculateSiblingRelief(siblingRelief?: { enabled: boolean; dependants: string }): number {
  if (!siblingRelief?.enabled) return 0;
  
  const dependantCount = Number(siblingRelief.dependants) || 0;
  return (dependantCount * constants.SIBLING_DISABILITY_RELIEF);
}

function calculateGrandparentCaregiverRelief(grandparentCaregiverRelief: { enabled: boolean }): number {
  return grandparentCaregiverRelief?.enabled ? constants.GRANDPARENT_CAREGIVER_RELIEF.AMOUNT : 0;
}

function calculateQualifyingChildRelief(qualifyingChildRelief?: { enabled: boolean; count: string }): number {
  if (!qualifyingChildRelief?.enabled) return 0;
  
  const dependantCount = Number(qualifyingChildRelief.count) || 0;
  return dependantCount * constants.QUALIFYING_CHILD_RELIEF.AMOUNT;
}

function calculateQualifyingChildReliefDisability(qualifyingChildReliefDisability?: { enabled: boolean; count: string }): number {
  if (!qualifyingChildReliefDisability?.enabled) return 0;
  
  const dependantCount = Number(qualifyingChildReliefDisability.count) || 0;
  return dependantCount * constants.QUALIFYING_CHILD_RELIEF.DISABILITY_AMOUNT;
}

function calculateWorkingMothersChildRelief(workingMothersChildRelief?: { enabled: boolean; amount: string }): number {
  if (!workingMothersChildRelief?.enabled) return 0;
  return Number(workingMothersChildRelief.amount) || 0;  // Convert to number during calculation
}

function calculateSrsContributionRelief(srsContributionRelief?: { enabled: boolean; amount: string }): number {
  if (!srsContributionRelief?.enabled) return 0;
  return Number(srsContributionRelief.amount) || 0;
}

export function calculateTaxReliefs({
  age,
  taxReliefs,
  cpfTopUpInputs,
  nsmanRelief,
  spouseRelief,
  parentRelief,
  siblingRelief,
  employeeCPF,
  annualIncome,
  sprStatus,
  grandparentCaregiverRelief,
  qualifyingChildRelief,
  qualifyingChildReliefDisability,
  workingMothersChildRelief,
  srsContributionRelief,
  lifeInsuranceRelief,
  courseFeesRelief,
  fdwlRelief
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

  const parentReliefAmount = parentRelief.enabled ? calculateParentRelief(parentRelief) : 0;

  const siblingDisabilityReliefValue = calculateSiblingRelief(siblingRelief);

  const grandparentCaregiverReliefValue = calculateGrandparentCaregiverRelief(grandparentCaregiverRelief);

  const qualifyingChildReliefValue = calculateQualifyingChildRelief(qualifyingChildRelief);
  const qualifyingChildReliefDisabilityValue = calculateQualifyingChildReliefDisability(qualifyingChildReliefDisability);

  const workingMothersChildReliefValue = calculateWorkingMothersChildRelief({
    enabled: workingMothersChildRelief.enabled,
    amount: workingMothersChildRelief.amount  // Keep as string, conversion happens inside calculateWorkingMothersChildRelief
  });

  const srsContributionReliefValue = calculateSrsContributionRelief(srsContributionRelief);

  const lifeInsuranceAmount = lifeInsuranceRelief.enabled ? 
    Math.min(Number(lifeInsuranceRelief.amount) || 0, constants.LIFE_INSURANCE_LIMIT) : 0;

  // Calculate Course Fees Relief
  let courseFeesReliefValue = 0;
  if (courseFeesRelief.enabled && courseFeesRelief.amount) {
    courseFeesReliefValue = Number(courseFeesRelief.amount) || 0;
  }

  // Calculate FDWL Relief
  let fdwlReliefValue = 0;
  if (fdwlRelief.enabled && fdwlRelief.amount) {
    fdwlReliefValue = Number(fdwlRelief.amount) || 0;
  }

  // Calculate total reliefs
  const totalReliefs = Math.min(MAX_TAX_RELIEF, 
    earnedIncomeRelief +
    earnedIncomeReliefDisability +
    cpfRelief +
    cpfTopUpRelief +
    nsmanDeduction +
    spouseReliefValue +
    parentReliefAmount +
    siblingDisabilityReliefValue +
    grandparentCaregiverReliefValue +
    qualifyingChildReliefValue +
    qualifyingChildReliefDisabilityValue +
    workingMothersChildReliefValue +
    srsContributionReliefValue +
    lifeInsuranceAmount +
    courseFeesReliefValue +
    fdwlReliefValue
  );

  const rawTotalReliefs = 
    earnedIncomeRelief +
    earnedIncomeReliefDisability +
    cpfRelief +
    cpfTopUpRelief +
    nsmanDeduction +
    spouseReliefValue +
    parentReliefAmount +
    siblingDisabilityReliefValue +
    grandparentCaregiverReliefValue +
    qualifyingChildReliefValue +
    qualifyingChildReliefDisabilityValue +
    workingMothersChildReliefValue +
    srsContributionReliefValue +
    lifeInsuranceAmount +
    courseFeesReliefValue +
    fdwlReliefValue;

  // Calculate taxable income
  const totalTaxableIncome = Math.max(0, annualIncome - totalReliefs);


  return {
    earnedIncomeRelief,
    earnedIncomeReliefDisability,
    cpfRelief,
    cpfTopUpRelief,
    nsmanRelief: nsmanDeduction,
    spouseRelief: spouseReliefValue,
    parentRelief: parentReliefAmount,
    parentDisabilityRelief: parentReliefAmount,
    siblingDisabilityRelief: siblingDisabilityReliefValue,
    grandparentCaregiverRelief: grandparentCaregiverReliefValue,
    qualifyingChildRelief: qualifyingChildReliefValue,
    qualifyingChildReliefDisability: qualifyingChildReliefDisabilityValue,
    workingMothersChildRelief: workingMothersChildReliefValue,
    srsContributionRelief: srsContributionReliefValue,
    lifeInsuranceRelief: lifeInsuranceAmount,
    courseFeesRelief: courseFeesReliefValue,
    fdwlRelief: fdwlReliefValue,
    totalReliefs,
    rawTotalReliefs,
    totalTaxableIncome
  };
} 