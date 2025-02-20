import React, { useState, useEffect } from 'react';
import * as constants from '../utils/constants';
import { TaxReliefResult } from '../types/tax';

// Import CPF rates for each table
import { computeMonthlyCpfTable1 } from './Table1.ts';
import { computeMonthlyCpfTable2 } from './Table2.ts';
import { computeMonthlyCpfTable3 } from './Table3.ts';
import { computeMonthlyCpfTable4 } from './Table4.ts';
import { computeMonthlyCpfTable5 } from './Table5.ts';
import { getAwRates } from './AwRates'; // Import the new function
//import { getAgeKey } from './CpfUtils'; // Adjust the path as needed
import { calculateTax } from './TaxLogic'; // Adjust the path as needed
import { calculateTaxReliefs } from '../utils/TaxReliefCalculator';
import { calculateTaxDeductions } from '../utils/TaxDeductionCalculator';
import { SingaporeTaxCalculatorView } from './SingaporeTaxCalculatorView';
import {
  TaxDeductions,
  ParentRelief,
  IncomeSources,
  RsuCycle,
  EsopCycle
} from '../types/tax';
import { getCPFAllocation } from './cpfAllocation';

// Global variable for popover max width
//const POPOVER_MAX_WIDTH = '480px';

// Add this interface near the top of the file, after imports
interface ParentDependant {
  staysWithMe: boolean;
  hasDisability: boolean;
}

/***********************************************************
 * Round to Nearest Dollar
 ***********************************************************/
function roundToNearestDollar(val: number): number {
    const cents = val - Math.floor(val);
    return cents >= 0.5 ? Math.ceil(val) : Math.floor(val);
}

/***********************************************************
 * 4) computeCpfOnBonus
 *    - For entire "annual bonus" as AW
 *    - Subtract "annualOW" from 102k to find leftover
 ***********************************************************/
function computeCpfOnBonus(sprTable: string, age: number, monthlySalary: number, bonus: number, annualOWSoFar: number) {
  // 1) AW Ceiling leftover
  const awCeilingLeft = 102000 - annualOWSoFar; 
  const cpfableBonus = Math.max(0, Math.min(bonus, awCeilingLeft));

  // 2) Retrieve AW rate from the table
  const { awTotalPct, awEmpPct } = getAwRates(sprTable, age, monthlySalary);

  // 3) Compute raw amounts
  const rawTotal = (awTotalPct / 100) * cpfableBonus;
  const rawEmp   = (awEmpPct   / 100) * cpfableBonus;

  // 4) Rounding
  const totalRounded = roundToNearestDollar(rawTotal);
  const empRounded   = roundToNearestDollar(rawEmp);
  const erRounded    = totalRounded - empRounded;
  
  return {
    empCPF: empRounded,
    erCPF:  Math.max(erRounded, 0),
    totalCPF: totalRounded,
  };
}


/***********************************************************
 * Main React Component
 ***********************************************************/
const SingaporeTakeHomeCalculator = () => {
  // Inputs
  const [inputs, setInputs] = useState({
    monthlySalary: '',
    annualSalary: '',
    annualBonus: ''
  });

  const [extraInputs, setExtraInputs] = useState({
    age: '30',
    sprStatus: 'table1'
  });

  const [showCPF, setShowCPF] = useState(true);

  // RSU & ESOP arrays
  const [rsuCycles, setRsuCycles] = useState<RsuCycle[]>([]);
  const [esopCycles, setEsopCycles] = useState<EsopCycle[]>([]);

  // Results
  const [results, setResults] = useState({
    monthlyTakeHome: 0,
    annualTakeHome: 0,
    totalRsuGains: 0,
    totalEsopGains: 0,
    annualTax: 0,
    totalTaxableIncome: 0,
    employeeMonthlyCPF: 0,
    employeeAnnualCPF: 0,
    totalIncome: 0,
    annualSalary: 0,
    annualBonus: 0,
    pensionIncome: 0,
    businessIncome: 0,
    rentalIncome: 0,
    royaltiesIncome: 0,
    employeeBonusCPF: 0,
    totalEmployeeCPF: 0,
    employerMonthlyCPF: 0,
    employerAnnualCPF: 0,
    employerBonusCPF: 0,
    totalEmployerCPF: 0,
    baseIncome: 0,
    eligibleIncome: 0,
    totalCPF: 0,
    cpfAllocation: {
      ordinaryAccountAllocation: 0,
      specialAccountAllocation: 0,
      retirementAccountAllocation: 0,
      mediSaveAccountAllocation: 0,
    },
  });

  // Inline error state for age
  const [ageError, setAgeError] = useState('');

  const [agePopoverAnchor, setAgePopoverAnchor] = useState<null | HTMLElement>(null);
  const [residencyPopoverAnchor, setResidencyPopoverAnchor] = useState<null | HTMLElement>(null);
  const [monthlySalaryPopoverAnchor, setMonthlySalaryPopoverAnchor] = useState<null | HTMLElement>(null);
  const [annualSalaryPopoverAnchor, setAnnualSalaryPopoverAnchor] = useState<null | HTMLElement>(null);
  const [annualBonusPopoverAnchor, setAnnualBonusPopoverAnchor] = useState<null | HTMLElement>(null);
  const [rsuSharesPopoverAnchor, setRsuSharesPopoverAnchor] = useState<null | HTMLElement>(null);
  const [rsuVestingPopoverAnchor, setRsuVestingPopoverAnchor] = useState<null | HTMLElement>(null);
  const [esopSharesPopoverAnchor, setEsopSharesPopoverAnchor] = useState<null | HTMLElement>(null);
  const [esopExercisePopoverAnchor, setEsopExercisePopoverAnchor] = useState<null | HTMLElement>(null);
  const [esopVestingPopoverAnchor, setEsopVestingPopoverAnchor] = useState<null | HTMLElement>(null);

  // Update incomeSources state to have employment checked by default
  const [incomeSources, setIncomeSources] = useState<IncomeSources>({
    employment: true,
    pension: false,
    pensionAmount: '',
    prevPensionAmount: '',
    trade: false,
    tradeAmount: '',
    prevTradeAmount: '',
    rental: false,
    rentalAmount: '',
    prevRentalAmount: '',
    royalties: false,
    royaltiesAmount: '',
    prevRoyaltiesAmount: ''
  });

  // Add new state for CPF top-up
  const [cpfTopUp, setCpfTopUp] = useState({
    enabled: false,
    self: true,
    family: false,
    selfAmount: '',
    familyAmount: ''
  });

  // Add state for validation errors
  const [cpfTopUpErrors, setCpfTopUpErrors] = useState({
    selfAmount: '',
    familyAmount: ''
  });

  // Update validation function to allow decimals
  const validateAmount = (value: string): string => {
    if (value === '') return '';
    // Allow numbers with up to 2 decimal places
    if (!/^\d*\.?\d{0,2}$/.test(value)) return 'Enter a valid amount.';
    if (Number(value) < 0) return 'Amount cannot be negative.';
    return '';
  };

  // Handler for CPF top-up amount changes
  const handleCpfTopUpAmountChange = (field: 'selfAmount' | 'familyAmount', value: string) => {
    const error = validateAmount(value);
    setCpfTopUpErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    if (!error) {
      setCpfTopUp(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Initial state for tax reliefs
  const [taxReliefs, setTaxReliefs] = useState({
    earnedIncomeRelief: true,
    earnedIncomeReliefDisability: false,
    cpfRelief: true
  });

  // Initial state for disability preference
  const [preferDisabilityRelief, setPreferDisabilityRelief] = useState(false);

  // Add this near the other state declarations (around line 115)
  const [taxReliefResults, setTaxReliefResults] = useState<TaxReliefResult>({
    earnedIncomeRelief: 0,
    earnedIncomeReliefDisability: 0,
    cpfRelief: 0,
    cpfTopUpRelief: 0,
    nsmanRelief: 0,
    spouseRelief: 0,
    totalReliefs: 0,
    rawTotalReliefs: 0,
    parentRelief: 0,
    siblingDisabilityRelief: 0,
    grandparentCaregiverRelief: 0,
    qualifyingChildRelief: 0,
    qualifyingChildReliefDisability: 0,
    workingMothersChildRelief: 0,
    srsContributionRelief: 0,
    lifeInsuranceRelief: 0
  });

  // Add new state for Spouse Relief
  const [spouseRelief, setSpouseRelief] = useState({
    enabled: false,
    disability: false
  });

  // Update the state to include stayType
  const [parentRelief, setParentRelief] = useState<ParentRelief>({
    enabled: false,
    dependants: "1",
    dependantDetails: [{ staysWithMe: false, hasDisability: false }]
  });

  // Add new state for NSman relief
  const [nsmanRelief, setNsmanRelief] = useState({
    enabled: false,
    general: false,
    key: false,
    wife: false,
    parent: false
  });

  // Add state
  const [siblingRelief, setSiblingRelief] = useState({
    enabled: false,
    dependants: "1"
  });

  // Add this state definition
  const [grandparentCaregiverRelief, setGrandparentCaregiverRelief] = useState({
    enabled: false,
    dependants: "1"
  });

  // Add this state declaration
  const [qualifyingChildRelief, setQualifyingChildRelief] = useState({
    enabled: false,
    count: "1"
  });

  // Add this state declaration
  const [qualifyingChildReliefDisability, setQualifyingChildReliefDisability] = useState({
    enabled: false,
    count: "1"
  });

  // Add this new state for Working Mother's Child Relief
  const [workingMothersChildRelief, setWorkingMothersChildRelief] = useState({
    enabled: false,
    amount: '',
    error: ''
  });

  // Add this new state for SRS Contribution Relief
  const [srsContributionRelief, setSrsContributionRelief] = useState({
    enabled: false,
    amount: '',
    error: ''
  });

  // Add new state for Life Insurance Relief
  const [lifeInsuranceRelief, setLifeInsuranceRelief] = useState<{ enabled: boolean; amount: string; error?: string }>({
    enabled: false,
    amount: '',
    error: ''
  });

  // Add state to remember previous life insurance relief settings
  const [previousLifeInsuranceState, setPreviousLifeInsuranceState] = useState<{
    enabled: boolean;
    amount: string;
  } | null>(null);

  // Add state for Course Fees Relief
  const [courseFeesRelief, setCourseFeesRelief] = useState({
    enabled: false,
    amount: '',
    error: ''
  });

  // Add state for FDWL Relief
  const [fdwlRelief, setFdwlRelief] = useState({
    enabled: false,
    amount: '',
    error: ''
  });

  // Add new state for tax deductions
  const [taxDeductionResults, setTaxDeductionResults] = useState({
    charitableDeductions: 0,
    parenthoodTaxRebate: 0,
    rentalIncomeDeductions: 0,
    employmentExpenseDeductions: 0,
    totalDeductions: 0
  });

  // Add new state for tax deductions
  const [taxDeductions, setTaxDeductions] = useState<TaxDeductions>({
    charitableDeductions: { enabled: false, amount: '' },
    charitableAmount: '',
    parenthoodTaxRebate: false,
    parenthoodTaxRebateType: '',
    parenthoodTaxRebateAmount: '',
    rentalIncomeDeductions: false,
    rentalDeductionType: 'flat',
    mortgageInterest: '',
    actualRentalExpenses: '',
    employmentExpenseDeductions: false,
    employmentExpenseAmount: ''
  });

  // 1. Modify the add cycle functions
  const addRsuCycle = () => {
    setRsuCycles(prevCycles => {
      const newCycle = { shares: '', vestingPrice: '', expanded: true }; // Empty strings for UI
      return [...prevCycles, newCycle];
    });
  };

  const addEsopCycle = () => {
    setEsopCycles(prevCycles => [
      ...prevCycles,
      {
        shares: '',
        exercisePrice: '',
        vestingPrice: '',
        expanded: true
      }
    ]);
  };

  // New consolidated calculation function
  const calculateAllResults = () => {
    // 1. Base income calculations
    const monthlyBase = Number(inputs.monthlySalary) || (Number(inputs.annualSalary) / 12) || 0;
    const annualBase = monthlyBase * 12;
    const bonus = Number(inputs.annualBonus) || 0;
    const ageNum = Number(extraInputs.age) || 30;
    const sprTable = extraInputs.sprStatus;

    // 2. RSU and ESOP calculations
    const totalRsuGains = rsuCycles
      .map((cycle) => {
        const shares = cycle.shares === '' ? 0 : Number(cycle.shares) || 0;
        const vestingPrice = cycle.vestingPrice === '' ? 0 : Number(cycle.vestingPrice) || 0;
        return shares * vestingPrice;
      })
      .reduce((acc, gain) => acc + gain, 0);

    const totalEsopGains = esopCycles
      .map((cycle) => {
        const shares = cycle.shares === '' ? 0 : Number(cycle.shares) || 0;
        const exercisePrice = cycle.exercisePrice === '' ? 0 : Number(cycle.exercisePrice) || 0;
        const vestingPrice = cycle.vestingPrice === '' ? 0 : Number(cycle.vestingPrice) || 0;
        
        const gain = shares * (vestingPrice - exercisePrice);
        return Math.max(gain, 0);
      })
      .reduce((acc, gain) => acc + gain, 0);

    // 3. CPF calculations (only on base salary and bonus)
    let empMonth = 0;
    let erMonth = 0;

    if (sprTable !== 'ep_pep_spass') {
      const cpfResult = 
        sprTable === 'table1' ? computeMonthlyCpfTable1(monthlyBase, ageNum) :
        sprTable === 'table2' ? computeMonthlyCpfTable2(monthlyBase, ageNum) :
        sprTable === 'table3' ? computeMonthlyCpfTable3(monthlyBase, ageNum) :
        sprTable === 'table4' ? computeMonthlyCpfTable4(monthlyBase, ageNum) :
        sprTable === 'table5' ? computeMonthlyCpfTable5(monthlyBase, ageNum) :
        { empCPF: 0, erCPF: 0 };
      
      empMonth = cpfResult.empCPF;
      erMonth = cpfResult.erCPF;
    }

    const empAnnualBase = empMonth * 12;
    const erAnnualBase = erMonth * 12;

    // Bonus CPF calculation
    const cappedOW = Math.min(monthlyBase, 7400);
    const annualOW = cappedOW * 12;
    const bonusCpf = computeCpfOnBonus(sprTable, ageNum, monthlyBase, bonus, annualOW);
    const empBonus = bonusCpf.empCPF;
    const erBonus = bonusCpf.erCPF;

    // 4. Additional income sources
    const additionalIncome = {
      pension: incomeSources.pension ? Number(incomeSources.pensionAmount) || 0 : 0,
      trade: incomeSources.trade ? Number(incomeSources.tradeAmount) || 0 : 0,
      rental: incomeSources.rental ? Number(incomeSources.rentalAmount) || 0 : 0,
      royalties: incomeSources.royalties ? Number(incomeSources.royaltiesAmount) || 0 : 0
    };

    const totalAdditionalIncome = Object.values(additionalIncome).reduce((sum, val) => sum + val, 0);

    // 5. Calculate total taxable income
    const totalTaxableIncome = annualBase + bonus + totalRsuGains + totalEsopGains + totalAdditionalIncome;

    // 6. Calculate tax reliefs
    const reliefs = calculateTaxReliefs({
      age: Number(extraInputs.age) || 0,
      taxReliefs,
      cpfTopUpInputs: cpfTopUp,
      nsmanRelief,
      spouseRelief,
      parentRelief: {
        enabled: parentRelief.enabled,
        dependants: parentRelief.dependants,
        dependantDetails: parentRelief.dependantDetails || [{ staysWithMe: false, hasDisability: false }]
      },
      siblingRelief,
      employeeCPF: results.totalEmployeeCPF || 0,
      annualIncome: results.baseIncome || 0,
      sprStatus: extraInputs.sprStatus,
      grandparentCaregiverRelief,
      qualifyingChildRelief,
      qualifyingChildReliefDisability,
      workingMothersChildRelief,
      srsContributionRelief,
      lifeInsuranceRelief,
      courseFeesRelief,
      fdwlRelief
    });

    // 7. Calculate tax deductions
    const deductions = calculateTaxDeductions({
      charitableDeductions: {
        enabled: taxDeductions.charitableDeductions.enabled,
        amount: taxDeductions.charitableAmount,
      },
      parenthoodTaxRebate: taxDeductions.parenthoodTaxRebate,
      parenthoodTaxRebateType: taxDeductions.parenthoodTaxRebateType,
      parenthoodTaxRebateAmount: taxDeductions.parenthoodTaxRebateAmount,
      rentalIncomeDeductions: taxDeductions.rentalIncomeDeductions,
      rentalDeductionType: taxDeductions.rentalDeductionType ?? 'flat',
      mortgageInterest: taxDeductions.mortgageInterest ?? '',
      actualRentalExpenses: taxDeductions.actualRentalExpenses ?? '',
      annualRentalIncome: additionalIncome.rental.toString(),
      employmentExpenseDeductions: taxDeductions.employmentExpenseDeductions,
      employmentExpenseAmount: taxDeductions.employmentExpenseAmount,
    });

    // 8. Calculate final tax
    const assessableIncome = totalTaxableIncome;
    const chargeableIncome = Math.max(0, assessableIncome - reliefs.totalReliefs - deductions.totalDeductions);
    const calculatedTax = calculateTax(chargeableIncome);

    // 9. Calculate take-home pay
    const monthlyTakeHomeFromSalary = monthlyBase - empMonth;
    const annualBaseTakeHome = monthlyTakeHomeFromSalary * 12;
    const bonusTakeHome = bonus - empBonus;
    const stockTakeHome = totalRsuGains + totalEsopGains;
    const additionalTakeHome = totalAdditionalIncome;

    const annualTakeHome = annualBaseTakeHome + bonusTakeHome + stockTakeHome + additionalTakeHome - calculatedTax;
    const monthlyTakeHome = annualTakeHome / 12;

    // 10. Update all states at once
    const totalIncome = 
      (Number(results.annualSalary) || 0) + 
      (Number(results.annualBonus) || 0) + 
      (Number(results.pensionIncome) || 0) + 
      (Number(results.businessIncome) || 0) + 
      (Number(results.rentalIncome) || 0) + 
      (Number(results.royaltiesIncome) || 0) + 
      (Number(results.totalRsuGains) || 0) + 
      (Number(results.totalEsopGains) || 0);

    const totalCPF = results.totalEmployeeCPF + results.totalEmployerCPF;
    const cpfAllocation = getCPFAllocation(Number(extraInputs.age) || 0, totalCPF);

    setResults({
      monthlyTakeHome,
      annualTakeHome,
      totalRsuGains,
      totalEsopGains,
      totalTaxableIncome: chargeableIncome,
      employeeMonthlyCPF: empMonth,
      employeeAnnualCPF: empAnnualBase,
      employeeBonusCPF: empBonus,
      totalEmployeeCPF: empAnnualBase + empBonus,
      employerMonthlyCPF: erMonth,
      employerAnnualCPF: erAnnualBase,
      employerBonusCPF: erBonus,
      totalEmployerCPF: erAnnualBase + erBonus,
      baseIncome: totalTaxableIncome,
      eligibleIncome: totalTaxableIncome,
      annualTax: calculatedTax,
      annualSalary: Number(inputs.monthlySalary) * 12 || 0,
      annualBonus: Number(inputs.annualBonus) || 0,
      pensionIncome: Number(incomeSources.pensionAmount) || 0,
      businessIncome: Number(incomeSources.tradeAmount) || 0,
      rentalIncome: Number(incomeSources.rentalAmount) || 0,
      royaltiesIncome: Number(incomeSources.royaltiesAmount) || 0,
      totalIncome,
      totalCPF,
      cpfAllocation
    });

    // Add missing properties to reliefs before setting state
    setTaxReliefResults({
      ...reliefs,
      siblingDisabilityRelief: reliefs.siblingDisabilityRelief || 0,
      grandparentCaregiverRelief: reliefs.grandparentCaregiverRelief || 0,
      qualifyingChildRelief: reliefs.qualifyingChildRelief || 0,
      qualifyingChildReliefDisability: reliefs.qualifyingChildReliefDisability || 0,
      workingMothersChildRelief: reliefs.workingMothersChildRelief || 0,
      srsContributionRelief: reliefs.srsContributionRelief || 0,
      lifeInsuranceRelief: reliefs.lifeInsuranceRelief || 0,
      rawTotalReliefs: reliefs.totalReliefs
    });

    setTaxDeductionResults(deductions);
  };

  // Single useEffect to trigger calculations
  useEffect(() => {
    calculateAllResults();
  }, [
    inputs,
    extraInputs,
    rsuCycles,
    esopCycles,
    incomeSources,
    taxReliefs,
    taxDeductions,
    cpfTopUp,
    nsmanRelief,
    spouseRelief,
    parentRelief,
    siblingRelief,
    grandparentCaregiverRelief,
    qualifyingChildRelief,
    qualifyingChildReliefDisability,
    workingMothersChildRelief,
    srsContributionRelief,
    lifeInsuranceRelief,
    courseFeesRelief,
    fdwlRelief
  ]);

  // Effect to handle initial EIR setup and income source changes
  useEffect(() => {
    // Check if there's actual income from eligible sources (including stocks)
    const hasEligibleIncome = results.eligibleIncome > 0;

    if (!hasEligibleIncome) {
      setTaxReliefs(prev => ({
        ...prev,
        earnedIncomeRelief: false,
        earnedIncomeReliefDisability: false
      }));
    } else {
      setTaxReliefs(prev => ({
        ...prev,
        earnedIncomeRelief: !preferDisabilityRelief,
        earnedIncomeReliefDisability: preferDisabilityRelief
      }));
    }
  }, [results.eligibleIncome, preferDisabilityRelief]);

  // Update the disability handler
  const handleDisabilityReliefChange = (checked: boolean) => {
    setPreferDisabilityRelief(checked);
    setTaxReliefs(prev => ({
      ...prev,
      earnedIncomeRelief: !checked,
      earnedIncomeReliefDisability: checked
    }));
  };

  // Add effect to handle CPF Relief based on residency status
  useEffect(() => {
    const isCitizenOrPR = extraInputs.sprStatus !== 'ep_pep_spass';
    setTaxReliefs(prev => ({
      ...prev,
      cpfRelief: isCitizenOrPR
    }));
  }, [extraInputs.sprStatus]);

  // Calculate base income first
  useEffect(() => {
    // Calculate base income (before reliefs)
    const baseIncome = Number(inputs.monthlySalary || 0) * 12 +
      Number(inputs.annualBonus || 0) +
      Number(incomeSources.rental ? incomeSources.rentalAmount : 0) +
      Number(incomeSources.pension ? incomeSources.pensionAmount : 0) +
      Number(incomeSources.trade ? incomeSources.tradeAmount : 0) +
      Number(incomeSources.royalties ? incomeSources.royaltiesAmount : 0) +
      // RSU gains calculation
      rsuCycles.reduce((acc, cycle) => {
        const shares = Number(cycle.shares || 0);
        const vestingPrice = Number(cycle.vestingPrice || 0);
        return acc + (shares * vestingPrice);
      }, 0) +
      // ESOP gains calculation
      esopCycles.reduce((acc, cycle) => {
        const shares = Number(cycle.shares || 0);
        const exercisePrice = Number(cycle.exercisePrice || 0);
        const vestingPrice = Number(cycle.vestingPrice || 0);
        return acc + Math.max(0, shares * (vestingPrice - exercisePrice));
      }, 0);
    
    setResults(prev => ({
      ...prev,
      baseIncome: baseIncome
    }));
  }, [
    inputs.monthlySalary, 
    inputs.annualBonus, 
    incomeSources.rental,
    incomeSources.rentalAmount,
    incomeSources.pension,
    incomeSources.pensionAmount,
    incomeSources.trade,
    incomeSources.tradeAmount,
    incomeSources.royalties,
    incomeSources.royaltiesAmount,
    rsuCycles, 
    esopCycles
  ]);

  // Then calculate tax reliefs based on base income
  useEffect(() => {
    const reliefs = calculateTaxReliefs({
      age: Number(extraInputs.age) || 0,
      taxReliefs,
      cpfTopUpInputs: cpfTopUp,
      nsmanRelief,
      spouseRelief,
      parentRelief: {
        enabled: parentRelief.enabled,
        dependants: parentRelief.dependants,
        dependantDetails: parentRelief.dependantDetails || [{ staysWithMe: false, hasDisability: false }]
      },
      siblingRelief,
      employeeCPF: results.totalEmployeeCPF || 0,
      annualIncome: results.baseIncome || 0,
      sprStatus: extraInputs.sprStatus,
      grandparentCaregiverRelief,
      qualifyingChildRelief,
      qualifyingChildReliefDisability,
      workingMothersChildRelief,
      srsContributionRelief,
      lifeInsuranceRelief,
      courseFeesRelief,
      fdwlRelief
    });

    setTaxReliefResults(prev => ({
      ...prev,
      ...reliefs
    }));
  }, [
    extraInputs.age,
    taxReliefs,
    cpfTopUp,
    nsmanRelief,
    spouseRelief,
    parentRelief,
    siblingRelief,
    results.totalEmployeeCPF,
    results.baseIncome,
    extraInputs.sprStatus,
    grandparentCaregiverRelief,
    qualifyingChildRelief,
    qualifyingChildReliefDisability,
    workingMothersChildRelief,
    srsContributionRelief,
    lifeInsuranceRelief,
    courseFeesRelief,
    fdwlRelief
  ]);

  // Add this new handler for checkbox changes
  const handleIncomeSourceChange = (source: string, value?: string) => {
    if (['pensionAmount', 'tradeAmount', 'royaltiesAmount'].includes(source)) {
      if (value === undefined) return;
      setIncomeSources(prev => ({
        ...prev,
        [source]: value
      }));
    } else if (source === 'rentalAmount') {
      // Keep existing rental amount logic separate
      if (value === undefined) return;
      setIncomeSources(prev => ({
        ...prev,
        rentalAmount: value
      }));
    } else {
      setIncomeSources(prev => {
        const newState = {
          ...prev,
          [source]: !prev[source as keyof IncomeSources]
        };

        // Handle rental toggle separately to preserve existing logic
        if (source === 'rental') {
          if (!prev.rental) {
            newState.rentalAmount = prev.prevRentalAmount || '';
          } else {
            newState.prevRentalAmount = prev.rentalAmount;
            newState.rentalAmount = '';
          }
        }

        // Handle other income sources
        if (source === 'pension' || source === 'trade' || source === 'royalties') {
          const amountField = `${source}Amount`;
          const prevAmountField = `prev${source.charAt(0).toUpperCase() + source.slice(1)}Amount`;
          
          if (!prev[source]) {
            (newState as any)[amountField] = prev[prevAmountField as keyof IncomeSources] || '';
          } else {
            (newState as any)[prevAmountField] = prev[amountField as keyof IncomeSources];
            (newState as any)[amountField] = '';
          }
        }

        return newState;
      });
    }
  };

  const handlePopoverClick = (
    event: React.MouseEvent<HTMLElement | HTMLButtonElement>,
    setAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>
  ) => {
    setAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAgePopoverAnchor(null);
    setResidencyPopoverAnchor(null);
    setMonthlySalaryPopoverAnchor(null);
    setAnnualSalaryPopoverAnchor(null);
    setAnnualBonusPopoverAnchor(null);
    setRsuSharesPopoverAnchor(null);
    setRsuVestingPopoverAnchor(null);
    setEsopSharesPopoverAnchor(null);
    setEsopExercisePopoverAnchor(null);
    setEsopVestingPopoverAnchor(null);
  };
  // Whenever inputs change, recalc
  useEffect(() => {
    if (Number(extraInputs.age) < 0 || Number(extraInputs.age) > 120) {
      setAgeError('Please enter a valid age.');
      return; // Skip calculations if age is invalid
    } else {
      setAgeError(''); // Clear error if age is valid
    }
    calculateAllResults();
    // Check if the selected residency status is EP / PEP / S Pass
    setShowCPF(extraInputs.sprStatus !== 'ep_pep_spass');
    // eslint-disable-next-line
  }, [inputs, extraInputs, rsuCycles, esopCycles]);

  // Salary input changes
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'monthlySalary') {
      const annual = (parseFloat(value) || 0) * 12;
      setInputs({
        ...inputs,
        monthlySalary: value,
        annualSalary: annual.toString()
      });
    } else if (name === 'annualSalary') {
      const monthly = (parseFloat(value) || 0) / 12;
      setInputs({
        ...inputs,
        annualSalary: value,
        monthlySalary: monthly.toString()
      });
    }
  };

  // RSU inputs
  const handleRsuChange = (index: number, field: keyof RsuCycle, value: string) => {
    setRsuCycles(prev => {
      const updatedCycles = [...prev];
      updatedCycles[index] = {
        ...updatedCycles[index],
        [field]: value // Update the specific field with the new value
      };
      return updatedCycles;
    });
  };
  const toggleRsuExpand = (index: number) => {
    const arr = [...rsuCycles];
    arr[index].expanded = !arr[index].expanded;
    setRsuCycles(arr);
  };
  const removeRsuCycle = (index: number) => {
    const newCycles = rsuCycles.filter((_, i) => i !== index);
    setRsuCycles(newCycles);
  };

  // ESOP inputs
  const handleEsopChange = (index: number, name: keyof EsopCycle, value: string) => {
    const arr = [...esopCycles];
    arr[index] = {
      ...arr[index],
      [name]: value  // Store as empty string, don't convert to '0'
    };
    setEsopCycles(arr);
  };
  const toggleEsopExpand = (index: number) => {
    const arr = [...esopCycles];
    arr[index].expanded = !arr[index].expanded;
    setEsopCycles(arr);
  };
  const removeEsopCycle = (index: number) => {
    const newCycles = esopCycles.filter((_, i) => i !== index);
    setEsopCycles(newCycles);
  };

  // currency format
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Handler for main CPF top-up checkbox
  const handleCpfTopUpChange = (checked: boolean) => {
    setCpfTopUp(prev => ({
      ...prev,
      enabled: checked
    }));
  };

  // Handler for NSman relief checkbox
  const handleNSmanReliefChange = (checked: boolean) => {
    setNsmanRelief(prev => ({ ...prev, enabled: checked }));
  };

  // Handler for NSman relief type radio buttons
  const handleNSmanChange = (type: 'general' | 'key' | 'wife' | 'parent') => {
    setNsmanRelief(prev => {
      // If clicking general, uncheck key
      if (type === 'general') {
        return { ...prev, general: !prev.general, key: false };
      }
      // If clicking key, uncheck general
      if (type === 'key') {
        return { ...prev, key: !prev.key, general: false };
      }
      // For other types (wife/parent), just toggle normally
      return { ...prev, [type]: !prev[type] };
    });
  };

  // Effect to calculate annual tax
  useEffect(() => {
    // Ensure we have a valid number
    const taxableIncome = Number(results.totalTaxableIncome) || 0;
    const annualTax = calculateTax(taxableIncome);
    setResults(prev => ({
      ...prev,
      annualTax
    }));
  }, [results.totalTaxableIncome]);

  // Handler for main spouse relief checkbox
  const handleSpouseReliefChange = (checked: boolean) => {
    setSpouseRelief(prev => ({ ...prev, enabled: checked }));
  };

  // Handler for spouse disability checkbox
  const handleSpouseDisabilityChange = (checked: boolean) => {
    setSpouseRelief(prev => ({ ...prev, disability: checked }));
  };

  // Handler for Parent Relief
  const handleParentReliefChange = (checked: boolean) => {
    setParentRelief(prev => ({
      ...prev,
      enabled: checked
    }));
  };

  // Add handler for stay type changes
  const handleParentStayTypeChange = (index: number, stayType: "with" | "without") => {
    setParentRelief(prev => ({
      ...prev,
      dependantDetails: prev.dependantDetails.map((dependant, i) =>
        i === index ? { ...dependant, staysWithMe: stayType === "with" } : dependant
      )
    }));
  };

  // Add handler for sibling relief checkbox
  const handleSiblingReliefChange = (checked: boolean) => {
    setSiblingRelief(prev => ({
      ...prev,
      enabled: checked
    }));
  };

  // Add this handler function
  const handleGrandparentCaregiverReliefChange = (checked: boolean) => {
    setGrandparentCaregiverRelief(prev => ({
      ...prev,
      enabled: checked
    }));
  };

  // Monitor CPF contributions
  useEffect(() => {
    if (results.totalEmployeeCPF > constants.LIFE_INSURANCE_LIMIT) {
      // Store current state before disabling
      setPreviousLifeInsuranceState({
        enabled: lifeInsuranceRelief.enabled,
        amount: lifeInsuranceRelief.amount
      });
      
      // Disable the relief
      setLifeInsuranceRelief(prev => ({
        ...prev,
        enabled: false,
        amount: '',
        error: ''
      }));
    } else if (previousLifeInsuranceState !== null) {
      // Restore previous state when becoming eligible again
      setLifeInsuranceRelief(prev => ({
        ...prev,
        enabled: previousLifeInsuranceState.enabled,
        amount: previousLifeInsuranceState.amount,
        error: ''
      }));
      // Clear the stored state
      setPreviousLifeInsuranceState(null);
    }
  }, [results.totalEmployeeCPF]);

  // Add the handler function
  const handleLifeInsuranceChange = (value: string) => {
    setLifeInsuranceRelief(prev => ({
      ...prev,
      enabled: value === 'true'
    }));
  };

  // For changing number of dependants in dropdown
  const handleParentDependantCount = (newCount: string) => {
    setParentRelief(prev => {
      const count = Number(newCount);
      const currentDetails = [...prev.dependantDetails];
      
      while (currentDetails.length < count) {
        currentDetails.push({ staysWithMe: false, hasDisability: false });
      }
      while (currentDetails.length > count) {
        currentDetails.pop();
      }
      
      return {
        ...prev,
        dependants: newCount,
        dependantDetails: currentDetails
      };
    });
  };

  // For changing individual dependant properties
  const handleParentDependantProperties = (index: number, field: keyof ParentDependant, value: boolean) => {
    setParentRelief(prev => ({
      ...prev,
      dependantDetails: prev.dependantDetails.map((dependant, i) => 
        i === index ? { ...dependant, [field]: value } : dependant
      )
    }));
  };

  // Add this new effect to calculate tax deductions
  useEffect(() => {
    const deductions = calculateTaxDeductions({
      charitableDeductions: {
        enabled: taxDeductions.charitableDeductions.enabled,
        amount: taxDeductions.charitableAmount
      },
      parenthoodTaxRebate: taxDeductions.parenthoodTaxRebate,
      parenthoodTaxRebateType: taxDeductions.parenthoodTaxRebateType,
      parenthoodTaxRebateAmount: taxDeductions.parenthoodTaxRebateAmount,
      rentalIncomeDeductions: taxDeductions.rentalIncomeDeductions,
      rentalDeductionType: taxDeductions.rentalDeductionType ?? 'flat',
      mortgageInterest: taxDeductions.mortgageInterest ?? '',
      actualRentalExpenses: taxDeductions.actualRentalExpenses ?? '',
      annualRentalIncome: incomeSources.rentalAmount || '',
      employmentExpenseDeductions: taxDeductions.employmentExpenseDeductions,
      employmentExpenseAmount: taxDeductions.employmentExpenseAmount
    });

    setTaxDeductionResults(deductions);
  }, [taxDeductions, incomeSources.rentalAmount]);

  const handleTaxDeductionChange = (field: string, value: any) => {
    setTaxDeductions(prev => {
      if (field === 'charitableDeductions') {
        return {
          ...prev,
          charitableDeductions: {
            ...prev.charitableDeductions,
            enabled: value
          }
        };
      }
      if (field === 'parenthoodTaxRebate') {
        return {
          ...prev,
          parenthoodTaxRebate: value,
          parenthoodTaxRebateType: value 
            ? (prev.parenthoodTaxRebateType || 'first_child')
            : prev.parenthoodTaxRebateType,
          parenthoodTaxRebateAmount: prev.parenthoodTaxRebateAmount
        };
      }
      if (field === 'employmentExpenseDeductions') {
        return {
          ...prev,
          employmentExpenseDeductions: value,
          employmentExpenseAmount: prev.employmentExpenseAmount
        };
      }
      if (field === 'rentalIncomeDeductions') {
        return {
          ...prev,
          rentalIncomeDeductions: value,
          rentalDeductionType: prev.rentalDeductionType,
          mortgageInterest: prev.mortgageInterest,
          actualRentalExpenses: prev.actualRentalExpenses
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Inside your component

  useEffect(() => {
    // Clear SRS contribution when SPR status changes
    setSrsContributionRelief(prev => ({
      ...prev,
      amount: '',
      error: '',
      enabled: false
    }));
    
    // Recalculate results with cleared SRS
    calculateAllResults();
  }, [extraInputs.sprStatus]);

  return (
    <SingaporeTaxCalculatorView
      extraInputs={extraInputs}
      inputs={inputs}
      setIncomeSources={setIncomeSources}
      results={results}
      taxReliefResults={taxReliefResults}
      ageError={ageError}
      agePopoverAnchor={agePopoverAnchor}
      residencyPopoverAnchor={residencyPopoverAnchor}
      monthlySalaryPopoverAnchor={monthlySalaryPopoverAnchor}
      annualSalaryPopoverAnchor={annualSalaryPopoverAnchor}
      annualBonusPopoverAnchor={annualBonusPopoverAnchor}
      parentRelief={parentRelief}
      spouseRelief={spouseRelief}
      cpfTopUp={cpfTopUp}
      rsuCycles={rsuCycles}
      esopCycles={esopCycles}
      handleClose={handleClose}
      handlePopoverClick={handlePopoverClick}
      setExtraInputs={setExtraInputs}
      handleSalaryChange={handleSalaryChange}
      setInputs={setInputs}
      handleParentReliefChange={handleParentReliefChange}
      handleParentDependantsChange={handleParentDependantCount}
      handleParentDependantChange={handleParentDependantProperties}
      handleIncomeSourceChange={handleIncomeSourceChange}
      handleRsuChange={handleRsuChange}
      handleEsopChange={handleEsopChange}
      addRsuCycle={addRsuCycle}
      addEsopCycle={addEsopCycle}
      toggleRsuExpanded={toggleRsuExpand}
      toggleEsopExpanded={toggleEsopExpand}
      formatCurrency={formatCurrency}
      setAgePopoverAnchor={setAgePopoverAnchor}
      setResidencyPopoverAnchor={setResidencyPopoverAnchor}
      setMonthlySalaryPopoverAnchor={setMonthlySalaryPopoverAnchor}
      setAnnualSalaryPopoverAnchor={setAnnualSalaryPopoverAnchor}
      setAnnualBonusPopoverAnchor={setAnnualBonusPopoverAnchor}
      taxReliefs={taxReliefs}
      handleCpfTopUpChange={handleCpfTopUpChange}
      setCpfTopUp={setCpfTopUp}
      handleCpfTopUpAmountChange={handleCpfTopUpAmountChange}
      cpfTopUpErrors={cpfTopUpErrors}
      nsmanRelief={nsmanRelief}
      handleNSmanReliefChange={handleNSmanReliefChange}
      handleNSmanChange={handleNSmanChange}
      handleSpouseReliefChange={handleSpouseReliefChange}
      handleSpouseDisabilityChange={handleSpouseDisabilityChange}
      removeRsuCycle={removeRsuCycle}
      setRsuSharesPopoverAnchor={setRsuSharesPopoverAnchor}
      setRsuVestingPopoverAnchor={setRsuVestingPopoverAnchor}
      removeEsopCycle={removeEsopCycle}
      setEsopSharesPopoverAnchor={setEsopSharesPopoverAnchor}
      setEsopExercisePopoverAnchor={setEsopExercisePopoverAnchor}
      setEsopVestingPopoverAnchor={setEsopVestingPopoverAnchor}
      rsuSharesPopoverAnchor={rsuSharesPopoverAnchor}
      rsuVestingPopoverAnchor={rsuVestingPopoverAnchor}
      esopSharesPopoverAnchor={esopSharesPopoverAnchor}
      esopExercisePopoverAnchor={esopExercisePopoverAnchor}
      esopVestingPopoverAnchor={esopVestingPopoverAnchor}
      incomeSources={incomeSources}
      handleDisabilityReliefChange={handleDisabilityReliefChange}
      handleParentStayTypeChange={handleParentStayTypeChange}
      siblingRelief={siblingRelief}
      handleSiblingReliefChange={handleSiblingReliefChange}
      setSiblingRelief={setSiblingRelief}
      grandparentCaregiverRelief={grandparentCaregiverRelief}
      handleGrandparentCaregiverReliefChange={handleGrandparentCaregiverReliefChange}
      qualifyingChildRelief={qualifyingChildRelief}
      setQualifyingChildRelief={setQualifyingChildRelief}
      qualifyingChildReliefDisability={qualifyingChildReliefDisability}
      setQualifyingChildReliefDisability={setQualifyingChildReliefDisability}
      workingMothersChildRelief={workingMothersChildRelief}
      setWorkingMothersChildRelief={setWorkingMothersChildRelief}
      srsContributionRelief={srsContributionRelief}
      setSrsContributionRelief={setSrsContributionRelief}
      lifeInsuranceRelief={lifeInsuranceRelief}
      setLifeInsuranceRelief={setLifeInsuranceRelief}
      handleLifeInsuranceChange={handleLifeInsuranceChange}
      courseFeesRelief={courseFeesRelief}
      setCourseFeesRelief={setCourseFeesRelief}
      fdwlRelief={fdwlRelief}
      setFdwlRelief={setFdwlRelief}
      taxDeductionResults={taxDeductionResults}
      handleTaxDeductionChange={handleTaxDeductionChange}
      taxDeductions={taxDeductions}

    />
  );
};

export default SingaporeTakeHomeCalculator;
