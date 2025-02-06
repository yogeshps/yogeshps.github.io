import { Dispatch, SetStateAction } from 'react';

// Tax Deduction Types
export interface TaxDeductions {
  charitableDeductions: {
    enabled: boolean;
    amount: string;
  };
  charitableAmount: string;
  charitableError?: string;
  parenthoodTaxRebate: boolean;
  parenthoodTaxRebateType: string;
  parenthoodTaxRebateAmount: string;
  rentalIncomeDeductions: boolean;
  rentalDeductionType?: 'flat' | 'actual';
  mortgageInterest?: string;
  actualRentalExpenses?: string;
  employmentExpenseDeductions: boolean;
  employmentExpenseAmount: string;
}

export interface TaxDeductionResult {
  charitableDeductions: number;
  parenthoodTaxRebate: number;
  rentalIncomeDeductions: number;
  employmentExpenseDeductions: number;
  totalDeductions: number;
}

// CPF Related Types
export interface CpfTopUp {
  enabled: boolean;
  self: boolean;
  family: boolean;
  selfAmount: string;
  familyAmount: string;
}

// Parent Relief Types
export interface ParentDependant {
  staysWithMe: boolean;
  hasDisability: boolean;
}

export interface ParentRelief {
  enabled: boolean;
  dependants: string;
  dependantDetails: ParentDependant[];
}

// Income Types
export interface IncomeSources {
  employment: boolean;
  pension: boolean;
  pensionAmount: string | undefined;
  prevPensionAmount: string | undefined;
  trade: boolean;
  tradeAmount: string | undefined;
  prevTradeAmount: string | undefined;
  rental: boolean;
  rentalAmount: string | undefined;
  prevRentalAmount: string | undefined;
  royalties: boolean;
  royaltiesAmount: string | undefined;
  prevRoyaltiesAmount: string | undefined;
}

// Stock Options Types
export interface RsuCycle {
  shares: string;
  vestingPrice: string;
  expanded: boolean;
}

export interface EsopCycle {
  shares: string;
  exercisePrice: string;
  vestingPrice: string;
  expanded: boolean;
}

// Relief Types
export interface SiblingRelief {
  enabled: boolean;
  dependants: string;
}

export interface TaxReliefResult {
  earnedIncomeRelief: number;
  earnedIncomeReliefDisability: number;
  cpfRelief: number;
  cpfTopUpRelief: number;
  nsmanRelief: number;
  spouseRelief: number;
  totalReliefs: number;
  rawTotalReliefs: number;
  parentRelief: number;
  siblingDisabilityRelief: number;
  grandparentCaregiverRelief: number;
  qualifyingChildRelief: number;
  qualifyingChildReliefDisability: number;
  workingMothersChildRelief: number;
  srsContributionRelief: number;
  lifeInsuranceRelief: number;
}

// Add the props interface
export interface SingaporeTaxCalculatorViewProps {
  extraInputs: {
    age: string;
    sprStatus: string;
  };
  inputs: {
    monthlySalary: string;
    annualSalary: string;
    annualBonus: string;
  };
  results: {
    monthlyTakeHome: number;
    annualTakeHome: number;
    totalRsuGains: number;
    totalEsopGains: number;
    annualTax: number;
    totalTaxableIncome: number;
    employeeMonthlyCPF: number;
    employeeAnnualCPF: number;
    employeeBonusCPF: number;
    totalEmployeeCPF: number;
    employerMonthlyCPF: number;
    employerAnnualCPF: number;
    employerBonusCPF: number;
    totalEmployerCPF: number;
    baseIncome: number;
    eligibleIncome: number;
    annualBonus: number;
    pensionIncome: number;
    businessIncome: number;
    rentalIncome: number;
    royaltiesIncome: number;
    annualSalary: number;
    totalIncome: number;
    totalCPF: number;
    cpfAllocation: {
      ordinaryAccountAllocation: number;
      specialAccountAllocation: number;
      retirementAccountAllocation: number;
      mediSaveAccountAllocation: number;
    };
  };
  taxReliefResults: TaxReliefResult;
  taxDeductionResults: TaxDeductionResult;
  ageError: string;
  agePopoverAnchor: HTMLElement | null;
  residencyPopoverAnchor: HTMLElement | null;
  monthlySalaryPopoverAnchor: HTMLElement | null;
  annualSalaryPopoverAnchor: HTMLElement | null;
  annualBonusPopoverAnchor: HTMLElement | null;
  rsuSharesPopoverAnchor: HTMLElement | null;
  rsuVestingPopoverAnchor: HTMLElement | null;
  esopSharesPopoverAnchor: HTMLElement | null;
  esopExercisePopoverAnchor: HTMLElement | null;
  esopVestingPopoverAnchor: HTMLElement | null;
  parentRelief: ParentRelief;
  spouseRelief: { enabled: boolean; disability: boolean };
  cpfTopUp: CpfTopUp;
  incomeSources: IncomeSources;
  rsuCycles: RsuCycle[];
  esopCycles: EsopCycle[];
  taxReliefs: { earnedIncomeRelief: boolean; earnedIncomeReliefDisability: boolean; cpfRelief: boolean };
  cpfTopUpErrors: { selfAmount: string; familyAmount: string };
  nsmanRelief: { enabled: boolean; general: boolean; key: boolean; wife: boolean; parent: boolean };
  siblingRelief: SiblingRelief;
  grandparentCaregiverRelief: { enabled: boolean };
  qualifyingChildRelief: { enabled: boolean; count: string };
  qualifyingChildReliefDisability: { enabled: boolean; count: string };
  workingMothersChildRelief: { enabled: boolean; amount: string; error: string };
  srsContributionRelief: SrsContributionRelief;
  lifeInsuranceRelief: LifeInsuranceRelief;
  courseFeesRelief: CourseFeesRelief;
  fdwlRelief: FdwlRelief;
  taxDeductions: TaxDeductions;

  // Handler functions
  handleClose: () => void;
  handlePopoverClick: (
    event: React.MouseEvent<HTMLElement | HTMLButtonElement>,
    setAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>
  ) => void;
  setExtraInputs: (value: any) => void;
  handleSalaryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setInputs: (value: any) => void;
  handleParentReliefChange: (checked: boolean) => void;
  handleParentDependantChange: (index: number, field: keyof ParentDependant, value: boolean) => void;
  handleParentDependantsChange: (value: string) => void;
  handleIncomeSourceChange: (source: string, value?: string) => void;
  handleRsuChange: (index: number, field: keyof RsuCycle, value: string) => void;
  handleEsopChange: (index: number, field: keyof EsopCycle, value: string) => void;
  addRsuCycle: () => void;
  addEsopCycle: () => void;
  toggleRsuExpanded: (index: number) => void;
  toggleEsopExpanded: (index: number) => void;
  formatCurrency: (value: number) => string;
  setAgePopoverAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setResidencyPopoverAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setMonthlySalaryPopoverAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setAnnualSalaryPopoverAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setAnnualBonusPopoverAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  handleDisabilityReliefChange: (checked: boolean) => void;
  handleCpfTopUpChange: (checked: boolean) => void;
  setCpfTopUp: (value: CpfTopUp | ((prev: CpfTopUp) => CpfTopUp)) => void;
  handleCpfTopUpAmountChange: (field: 'selfAmount' | 'familyAmount', value: string) => void;
  handleNSmanReliefChange: (checked: boolean) => void;
  handleNSmanChange: (type: 'general' | 'key' | 'wife' | 'parent') => void;
  handleSpouseReliefChange: (checked: boolean) => void;
  handleSpouseDisabilityChange: (checked: boolean) => void;
  removeRsuCycle: (index: number) => void;
  setRsuSharesPopoverAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setRsuVestingPopoverAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  removeEsopCycle: (index: number) => void;
  setEsopSharesPopoverAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setEsopExercisePopoverAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setEsopVestingPopoverAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  handleSiblingReliefChange: (checked: boolean) => void;
  setSiblingRelief: (value: SiblingRelief | ((prev: SiblingRelief) => SiblingRelief)) => void;
  handleParentStayTypeChange: (index: number, stayType: 'with' | 'without') => void;
  handleGrandparentCaregiverReliefChange: (checked: boolean) => void;
  setQualifyingChildRelief: (value: any) => void;
  setQualifyingChildReliefDisability: (value: any) => void;
  setWorkingMothersChildRelief: (value: any) => void;
  setLifeInsuranceRelief: (value: any) => void;
  handleLifeInsuranceChange: (value: string) => void;
  setCourseFeesRelief: (value: any) => void;
  setFdwlRelief: (value: any) => void;
  setSrsContributionRelief: (value: any) => void;
  handleTaxDeductionChange: (field: keyof TaxDeductions, value: boolean | string) => void;
  setIncomeSources: React.Dispatch<React.SetStateAction<IncomeSources>>;
}

export interface QualifyingChildRelief {
  enabled: boolean;
  count: string;
}

export interface QualifyingChildReliefDisability {
  enabled: boolean;
  count: string;
}

export interface WorkingMothersChildRelief {
  enabled: boolean;
  amount: string;
  error: string;
}

export interface SrsContributionRelief {
  enabled: boolean;
  amount: string;
  error: string;
}

export interface LifeInsuranceRelief {
  enabled: boolean;
  amount: string;
  error?: string;
}

export interface CourseFeesRelief {
  enabled: boolean;
  amount: string;
  error: string;
}

export interface FdwlRelief {
  enabled: boolean;
  amount: string;
  error: string;
}

export interface Inputs {
  monthlySalary: string;
  annualSalary: string;
  annualBonus: string;
} 
