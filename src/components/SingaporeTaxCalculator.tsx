import React, { useState, useEffect } from 'react';
import * as constants from '../utils/constants';

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
import { SingaporeTaxCalculatorView } from './SingaporeTaxCalculatorView';

// Global variable for popover max width
//const POPOVER_MAX_WIDTH = '480px';

// Add this interface near the top of the file, after imports
interface IncomeSources {
  employment: boolean;
  pension: boolean;
  trade: boolean;
  rental: boolean;
  royalties: boolean;
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

// Define the type for RSU/ESOP cycle
interface RsuCycle {
  shares: string;
  exercisePrice: string;
  vestingPrice: string;
  expanded: boolean;
}

interface EsopCycle {
  shares: string;
  exercisePrice: string;
  vestingPrice: string;
  expanded: boolean;
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
    employeeBonusCPF: 0,
    totalEmployeeCPF: 0,
    employerMonthlyCPF: 0,
    employerAnnualCPF: 0,
    employerBonusCPF: 0,
    totalEmployerCPF: 0,
    baseIncome: 0
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
  const [incomeSources, setIncomeSources] = useState({
    employment: true,  // Default to true
    pension: false,
    trade: false,
    rental: false,
    royalties: false,
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
  const [taxReliefResults, setTaxReliefResults] = useState({
    earnedIncomeRelief: 0,
    earnedIncomeReliefDisability: 0,
    cpfRelief: 0,
    cpfTopUpRelief: 0,
    nsmanRelief: 0,
    spouseRelief: 0,
    totalReliefs: 0,
    parentRelief: 0,
    parentDisabilityRelief: 0,
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
    dependants: "1"
  });

  // Add this state declaration
  const [qualifyingChildReliefDisability, setQualifyingChildReliefDisability] = useState({
    enabled: false,
    dependants: "1"
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

  // Effect to handle initial EIR setup and income source changes
  useEffect(() => {
    const hasEligibleIncome = incomeSources.employment || 
                             incomeSources.pension || 
                             incomeSources.trade;

    if (!hasEligibleIncome) {
      setTaxReliefs(prev => ({
        ...prev,
        earnedIncomeRelief: false,
        earnedIncomeReliefDisability: false
      }));
    } else {
      // Restore previous state or set default when eligible income is selected
      setTaxReliefs(prev => ({
        ...prev,
        earnedIncomeRelief: !preferDisabilityRelief,
        earnedIncomeReliefDisability: preferDisabilityRelief
      }));
    }
  }, [incomeSources, preferDisabilityRelief]);

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
      // Correct RSU gains calculation
      rsuCycles.reduce((acc, cycle) => {
        const shares = Number(cycle.shares || 0);
        const vestingPrice = Number(cycle.vestingPrice || 0);
        return acc + (shares * vestingPrice);
      }, 0) +
      // Correct ESOP gains calculation
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
  }, [inputs.monthlySalary, inputs.annualBonus, rsuCycles, esopCycles]);

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
      srsContributionRelief: srsContributionRelief,
      lifeInsuranceRelief
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
    lifeInsuranceRelief
  ]);

  // Finally calculate taxable income after all reliefs
  useEffect(() => {
    if (results.baseIncome > 0) {
      const finalTaxableIncome = Math.max(0, results.baseIncome - taxReliefResults.totalReliefs);
      
      setResults(prev => ({
        ...prev,
        totalTaxableIncome: finalTaxableIncome,
        annualTax: calculateTax(finalTaxableIncome)
      }));
    }
  }, [results.baseIncome, taxReliefResults.totalReliefs]);

  // Add this new handler for checkbox changes
  const handleIncomeSourceChange = (source: keyof IncomeSources) => {
    setIncomeSources(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  const handlePopoverClick = (
    event: React.MouseEvent<HTMLButtonElement>,
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

  const isAgePopoverOpen = Boolean(agePopoverAnchor);
  const isResidencyPopoverOpen = Boolean(residencyPopoverAnchor);

  // Whenever inputs change, recalc
  useEffect(() => {
    if (Number(extraInputs.age) < 0 || Number(extraInputs.age) > 120) {
      setAgeError('Please enter a valid age.');
      return; // Skip calculations if age is invalid
    } else {
      setAgeError(''); // Clear error if age is valid
    }
    calculateResults();
    // Check if the selected residency status is EP / PEP / S Pass
    setShowCPF(extraInputs.sprStatus !== 'ep_pep_spass');
    // eslint-disable-next-line
  }, [inputs, extraInputs, rsuCycles, esopCycles]);

  // 6) Our main logic
  const calculateResults = () => {
    // unify monthly vs annual
    const monthlyBase = Number(inputs.monthlySalary) || (Number(inputs.annualSalary) / 12) || 0;
    const annualBase = monthlyBase * 12;
    const bonus = Number(inputs.annualBonus) || 0;
    
    // Set default age to 30 if not provided
    const ageNum = Number(extraInputs.age) || 30; // Default to 30 if age is not provided
    const sprTable = extraInputs.sprStatus;

    // compute monthly CPF for base pay
    let empMonth = 0;
    let erMonth = 0;
    let totalCPF = 0;

    if (sprTable === 'ep_pep_spass') {
      // Skip CPF calculations for EP / PEP / S Pass
      empMonth = 0;
      erMonth = 0;
      totalCPF = 0;
    } else if (sprTable === 'table1') {
      const cpfResult = computeMonthlyCpfTable1(monthlyBase, ageNum);
      empMonth = cpfResult.empCPF;
      erMonth = cpfResult.erCPF;
      totalCPF = cpfResult.totalCPF;
    } else if (sprTable === 'table2') {
      const cpfResult = computeMonthlyCpfTable2(monthlyBase, ageNum);
      empMonth = cpfResult.empCPF;
      erMonth = cpfResult.erCPF;
      totalCPF = cpfResult.totalCPF;
    } else if (sprTable === 'table3') {
      const cpfResult = computeMonthlyCpfTable3(monthlyBase, ageNum);
      empMonth = cpfResult.empCPF;
      erMonth = cpfResult.erCPF;
      totalCPF = cpfResult.totalCPF;
    } else if (sprTable === 'table4') {
      const cpfResult = computeMonthlyCpfTable4(monthlyBase, ageNum);
      empMonth = cpfResult.empCPF;
      erMonth = cpfResult.erCPF;
      totalCPF = cpfResult.totalCPF;
    } else if (sprTable === 'table5') {
      const cpfResult = computeMonthlyCpfTable5(monthlyBase, ageNum);
      empMonth = cpfResult.empCPF;
      erMonth = cpfResult.erCPF;
      totalCPF = cpfResult.totalCPF;
    }

    // Ensure results are set correctly even if no CPF is calculated
    const empAnnualBase = empMonth * 12;
    const erAnnualBase  = erMonth * 12;

    // For bonus, treat entire bonus as AW
    const cappedOW = Math.min(monthlyBase, 7400);
    const annualOW = cappedOW * 12;
    const bonusCpf = computeCpfOnBonus(sprTable, ageNum, monthlyBase, bonus, annualOW);
    const empBonus = bonusCpf.empCPF;
    const erBonus  = bonusCpf.erCPF;

    // Calculate stock gains from RSUs
    const stockGains = rsuCycles.map((cycle) => {
      const shares = Number(cycle.shares) || 0;
      const vestingPrice = Number(cycle.vestingPrice) || 0;
      return shares * vestingPrice; // Calculate stock gains for each RSU cycle
    });

    // Calculate ESOP gains
    const esopGains = esopCycles.map((cycle) => {
      const shares = Number(cycle.shares) || 0;
      const exercisePrice = Number(cycle.exercisePrice) || 0;
      const vestingPrice = Number(cycle.vestingPrice) || 0;
      const gain = shares * (vestingPrice - exercisePrice);
      return Math.max(gain, 0); // Ensure ESOP gains are not negative
    });

    // Total RSU and ESOP gains
    const totalRsuGains = stockGains.reduce((acc, gain) => acc + gain, 0);
    const totalEsopGains = esopGains.reduce((acc, gain) => acc + gain, 0);

    // Calculate total taxable income
    const totalTaxableIncome = annualBase + bonus + totalRsuGains + totalEsopGains;

    // Calculate total deductions
    const totalDeductions = results.totalEmployeeCPF + results.annualTax;

    // Calculate annual take-home pay
    const annualTakeHome = totalTaxableIncome - totalDeductions;
    const monthlyTakeHome = annualTakeHome / 12;

    // Store in results
    setResults(prev => ({
      ...prev,
      monthlyTakeHome,
      annualTakeHome,
      totalRsuGains,
      totalEsopGains,
      totalTaxableIncome,

      employeeMonthlyCPF: empMonth,
      employeeAnnualCPF: empAnnualBase,
      employeeBonusCPF: empBonus,
      totalEmployeeCPF: empAnnualBase + empBonus,

      employerMonthlyCPF: erMonth,
      employerAnnualCPF: erAnnualBase,
      employerBonusCPF: erBonus,
      totalEmployerCPF: erAnnualBase + erBonus,

      baseIncome: totalTaxableIncome,
      annualTax: results.annualTax
    }));
  };

  // Salary input changes
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'monthlySalary') {
      setInputs({
        ...inputs,
        monthlySalary: value,
        annualSalary: value ? (Number(value) * 12).toString() : ''
      });
    } else if (name === 'annualSalary') {
      setInputs({
        ...inputs,
        annualSalary: value,
        monthlySalary: value ? (Number(value) / 12).toString() : ''
      });
    }
  };

  // RSU inputs
  const handleRsuChange = (index: number, name: keyof RsuCycle, value: string) => {
    const arr = [...rsuCycles];
    arr[index][name] = value;
    setRsuCycles(arr);
  };
  const toggleRsuExpand = (index: number) => {
    const arr = [...rsuCycles];
    arr[index].expanded = !arr[index].expanded;
    setRsuCycles(arr);
  };
  const removeRsuCycle = (index: number) => {
    setRsuCycles(prev => prev.filter((_, i) => i !== index));
  };
  const addRsuCycle = () => {
    setRsuCycles([...rsuCycles, { shares: '', exercisePrice: '', vestingPrice: '', expanded: true }]);
  };

  // ESOP inputs
  const handleEsopChange = (index: number, name: keyof EsopCycle, value: string) => {
    const arr = [...esopCycles];
    arr[index][name] = value;
    setEsopCycles(arr);
  };
  const toggleEsopExpand = (index: number) => {
    const arr = [...esopCycles];
    arr[index].expanded = !arr[index].expanded;
    setEsopCycles(arr);
  };
  const removeEsopCycle = (index: number) => {
    setEsopCycles(prev => prev.filter((_, i) => i !== index));
  };
  const addEsopCycle = () => {
    setEsopCycles([...esopCycles, { shares: '', exercisePrice: '', vestingPrice: '', expanded: true }]);
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

  // Effect to calculate take-home pay after CPF and tax
  useEffect(() => {
    // Calculate take-home pay after CPF and tax
    const annualGross = Number(inputs.monthlySalary || 0) * 12 + 
                       Number(inputs.annualBonus || 0) +
                       results.totalRsuGains +
                       results.totalEsopGains;
                       
    const totalDeductions = results.totalEmployeeCPF + results.annualTax;
    const annualTakeHome = annualGross - totalDeductions;
    const monthlyTakeHome = annualTakeHome / 12;

    setResults(prev => ({
      ...prev,
      monthlyTakeHome,
      annualTakeHome
    }));
  }, [
    inputs.monthlySalary,
    inputs.annualBonus,
    results.totalRsuGains,
    results.totalEsopGains,
    results.totalEmployeeCPF,
    results.annualTax
  ]);

  // Handler for main spouse relief checkbox
  const handleSpouseReliefChange = (checked: boolean) => {
    setSpouseRelief(prev => ({ ...prev, enabled: checked }));
  };

  // Handler for spouse disability checkbox
  const handleSpouseDisabilityChange = (checked: boolean) => {
    setSpouseRelief(prev => ({ ...prev, disability: checked }));
  };

  // Calculate RSU and ESOP gains
  useEffect(() => {
    const totalRsuGains = rsuCycles.reduce((acc, cycle) => {
      const shares = Number(cycle.shares || 0);
      const vestingPrice = Number(cycle.vestingPrice || 0);
      return acc + (shares * vestingPrice);
    }, 0);

    const totalEsopGains = esopCycles.reduce((acc, cycle) => {
      const shares = Number(cycle.shares || 0);
      const exercisePrice = Number(cycle.exercisePrice || 0);
      const vestingPrice = Number(cycle.vestingPrice || 0);
      return acc + Math.max(0, shares * (vestingPrice - exercisePrice));
    }, 0);

    setResults(prev => ({
      ...prev,
      totalRsuGains,  // Store total RSU gains
      totalEsopGains, // Store total ESOP gains
    }));
  }, [rsuCycles, esopCycles]);

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

  return (
    <SingaporeTaxCalculatorView
      extraInputs={extraInputs}
      inputs={inputs}
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
    />
  );
};

export default SingaporeTakeHomeCalculator;
