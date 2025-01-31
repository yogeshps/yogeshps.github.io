import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  Grid,
  Tooltip,
  IconButton,
  Button,
  Collapse,
  MenuItem,
  Select,
  Popover,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
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

// Global variable for popover max width
const POPOVER_MAX_WIDTH = '480px';

// Add this interface near the top of the file, after imports
interface IncomeSources {
  employment: boolean;
  pension: boolean;
  trade: boolean;
  rental: boolean;
  royalties: boolean;
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
  const [esopCycles, setEsopCycles] = useState<RsuCycle[]>([]);

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
    enabled: false,  // New parent checkbox state
    self: true,      // Default to true
    family: false,
    selfAmount: '',
    familyAmount: '',
  });

  // Add state for validation errors
  const [cpfTopUpErrors, setCpfTopUpErrors] = useState({
    selfAmount: '',
    familyAmount: '',
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
    earnedIncomeRelief: true, // Set to true by default
    earnedIncomeReliefDisability: false,
    cpfRelief: false
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
    totalReliefs: 0
  });

  // Add new state for Spouse Relief
  const [spouseRelief, setSpouseRelief] = useState({
    enabled: false,
    disability: false
  });

  // Update the state to include stayType
  const [parentRelief, setParentRelief] = useState({
    enabled: false,
    dependants: "1",
    stayType: "with"  // "with" or "without"
  });

  // Add new state for Parent Relief (Disability)
  const [parentReliefDisability, setParentReliefDisability] = useState({
    enabled: false,
    dependants: "1",
    stayType: "with"  // "with" or "without"
  });

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

  // Declare and initialize nsmanRelief
  const [nsmanRelief, setNsmanRelief] = useState({
    enabled: false,
    general: false,
    key: false,
    wife: false,
    parent: false
  });

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
      employeeCPF: results.totalEmployeeCPF || 0,
      annualIncome: results.baseIncome || 0,
      sprStatus: extraInputs.sprStatus
    });

    setTaxReliefResults(reliefs);
  }, [extraInputs.age, taxReliefs, cpfTopUp, nsmanRelief, spouseRelief, results.totalEmployeeCPF, results.baseIncome, extraInputs.sprStatus]);

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

  const handlePopoverClick = (event: React.MouseEvent<HTMLElement>, setter: React.Dispatch<React.SetStateAction<null | HTMLElement>>) => {
    setter(event.currentTarget);
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
    const arr = rsuCycles.filter((_, i) => i !== index);
    setRsuCycles(arr);
  };
  const addRsuCycle = () => {
    setRsuCycles([...rsuCycles, { shares: '', exercisePrice: '', vestingPrice: '', expanded: true }]);
  };

  // ESOP inputs
  const handleEsopChange = (index: number, name: keyof RsuCycle, value: string) => {
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
    const arr = esopCycles.filter((_, i) => i !== index);
    setEsopCycles(arr);
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
    setNsmanRelief(prev => ({
      ...prev,
      enabled: checked
    }));
  };

  // Handler for NSman relief type radio buttons
  const handleNsmanChange = (type: 'general' | 'key' | 'wife' | 'parent') => {
    setNsmanRelief(prev => {
      const newState = { ...prev };
      
      // Handle mutual exclusivity for general and key
      if (type === 'general' || type === 'key') {
        if (type === 'general') {
          newState.general = !prev.general;
          newState.key = false;
        } else {
          newState.key = !prev.key;
          newState.general = false;
        }
      } else {
        // For wife and parent, just toggle the value
        newState[type] = !prev[type];
      }
      
      return newState;
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
    setSpouseRelief(prev => ({
      ...prev,
      enabled: checked
    }));
  };

  // Handler for spouse disability checkbox
  const handleSpouseDisabilityChange = (checked: boolean) => {
    setSpouseRelief(prev => ({
      ...prev,
      disability: checked
    }));
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

  // Handler for Parent Relief (Disability)
  const handleParentReliefDisabilityChange = (checked: boolean) => {
    setParentReliefDisability(prev => ({
      ...prev,
      enabled: checked
    }));
  };

  // Render
  return (
    <Card sx={{ width: '100%', maxWidth: 1000, mx: 'auto', p: 4, borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontFamily: 'Helvetica' }}>
          Singapore Take Home Pay Calculator (All-in-One)
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Age */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Age
              <IconButton onClick={(e) => handlePopoverClick(e, setAgePopoverAnchor)} size="small">
                <InfoIcon fontSize="inherit" />
              </IconButton>
              <Popover
                open={Boolean(agePopoverAnchor)}
                anchorEl={agePopoverAnchor}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                sx={{ maxWidth: POPOVER_MAX_WIDTH }}
              >
                <Typography sx={{ p: 2, fontSize: '0.8rem', fontStyle: 'italic' }}>Your current age for CPF calculations.</Typography>
              </Popover>
            </Typography>
            <TextField
              fullWidth
              name="age"
              value={extraInputs.age}
              onChange={(e) => setExtraInputs({ ...extraInputs, age: e.target.value })}
              error={!!ageError}
              helperText={ageError}
            />
          </Grid>

          {/* Residency Status */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Residency Status
              <IconButton onClick={(e) => handlePopoverClick(e, setResidencyPopoverAnchor)} size="small">
                <InfoIcon fontSize="inherit" />
              </IconButton>
              <Popover
                open={Boolean(residencyPopoverAnchor)}
                anchorEl={residencyPopoverAnchor}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                sx={{ maxWidth: POPOVER_MAX_WIDTH }}
              >
                <Typography sx={{ p: 2, fontSize: '0.8rem', fontStyle: 'italic' }}>Your Singapore residency status.</Typography>
              </Popover>
            </Typography>
            <Select
              fullWidth
              value={extraInputs.sprStatus}
              onChange={(e) => setExtraInputs({ ...extraInputs, sprStatus: e.target.value })}
            >
              <MenuItem value="table1">Citizen / Permanent Resident</MenuItem>
              <MenuItem value="table2">PR 1st year (Graduated/Graduated)</MenuItem>
              <MenuItem value="table3">PR 2nd year (Graduated/Graduated)</MenuItem>
              <MenuItem value="table4">PR 1st year (Full/Graduated)</MenuItem>
              <MenuItem value="table5">PR 2nd year (Full/Graduated)</MenuItem>
              <MenuItem value="ep_pep_spass">EP / PEP / S Pass</MenuItem>
            </Select>
          </Grid>
        </Grid>

        {/* Salary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Monthly Income
              <IconButton onClick={(e) => handlePopoverClick(e, setMonthlySalaryPopoverAnchor)} size="small">
                <InfoIcon fontSize="inherit" />
              </IconButton>
              <Popover
                open={Boolean(monthlySalaryPopoverAnchor)}
                anchorEl={monthlySalaryPopoverAnchor}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                sx={{ maxWidth: POPOVER_MAX_WIDTH }}
              >
                <Typography sx={{ p: 2, fontSize: '0.8rem', fontStyle: 'italic' }}>Gross monthly salary before any deductions.</Typography>
              </Popover>
            </Typography>
            <TextField
              fullWidth
              name="monthlySalary"
              value={inputs.monthlySalary}
              onChange={handleSalaryChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Annual Income
              <IconButton onClick={(e) => handlePopoverClick(e, setAnnualSalaryPopoverAnchor)} size="small">
                <InfoIcon fontSize="inherit" />
              </IconButton>
              <Popover
                open={Boolean(annualSalaryPopoverAnchor)}
                anchorEl={annualSalaryPopoverAnchor}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                sx={{ maxWidth: POPOVER_MAX_WIDTH }}
              >
                <Typography sx={{ p: 2, fontSize: '0.8rem', fontStyle: 'italic' }}>Gross yearly salary, excluding bonuses, before any deductions.</Typography>
              </Popover>
            </Typography>
            <TextField
              fullWidth
              name="annualSalary"
              value={inputs.annualSalary}
              onChange={handleSalaryChange}
            />
          </Grid>
        </Grid>

        {/* Bonus */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            Annual Cash Bonus
            <IconButton onClick={(e) => handlePopoverClick(e, setAnnualBonusPopoverAnchor)} size="small">
              <InfoIcon fontSize="inherit" />
            </IconButton>
            <Popover
              open={Boolean(annualBonusPopoverAnchor)}
              anchorEl={annualBonusPopoverAnchor}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              sx={{ maxWidth: POPOVER_MAX_WIDTH }}
            >
              <Typography sx={{ p: 2, fontSize: '0.8rem', fontStyle: 'italic' }}>Annual cash bonuses before any deductions.</Typography>
            </Popover>
          </Typography>
          <TextField
            fullWidth
            name="annualBonus"
            value={inputs.annualBonus}
            onChange={(e) => setInputs({ ...inputs, annualBonus: e.target.value })}
            sx={{ mt: 1 }}
          />
        </Box>

        {/* Add this new section after RSU and before Annual Cash Bonus */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Income Sources
          </Typography>
          <Typography variant="body1" sx={{mb: 1 }}>
            Select all that apply.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={incomeSources.employment}
                  onChange={() => handleIncomeSourceChange('employment')}
                />
              }
              label="Salaried employment"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={incomeSources.pension}
                  onChange={() => handleIncomeSourceChange('pension')}
                />
              }
              label="Pension"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={incomeSources.trade}
                  onChange={() => handleIncomeSourceChange('trade')}
                />
              }
              label="Trade, business, profession or vocation"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={incomeSources.rental}
                  onChange={() => handleIncomeSourceChange('rental')}
                />
              }
              label="Rent from property ownership"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={incomeSources.royalties}
                  onChange={() => handleIncomeSourceChange('royalties')}
                />
              }
              label="Royalties, charge, estate/trust"
            />
          </Box>
        </Box>

        {/* Tax Reliefs */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Tax Reliefs
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          {/* EIR Section */}
          {(incomeSources.employment || incomeSources.pension || incomeSources.trade) && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={taxReliefs.earnedIncomeRelief}
                    disabled={true}  // Always disabled
                    onChange={() => {}} // No-op since it's disabled
                  />
                }
                label="Earned Income Relief"
              />
              <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={taxReliefs.earnedIncomeReliefDisability}
                      onChange={(e) => handleDisabilityReliefChange(e.target.checked)}
                    />
                  }
                  label="Earned Income Relief (Disability)"
                />
              </Box>
            </Box>
          )}
          {extraInputs.sprStatus !== 'ep_pep_spass' && (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={taxReliefs.cpfRelief}
                    disabled={true}
                  />
                }
                label="CPF/Provident Fund Relief"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={cpfTopUp.enabled}
                    onChange={(e) => handleCpfTopUpChange(e.target.checked)}
                  />
                }
                label="CPF Cash Top-Up Relief"
              />
              {cpfTopUp.enabled && (
                <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={cpfTopUp.self}
                        onChange={(e) => setCpfTopUp(prev => ({
                          ...prev,
                          self: e.target.checked
                        }))}
                      />
                    }
                    label="Contribution to my own CPF"
                  />
                  {cpfTopUp.self && (
                    <TextField
                      size="small"
                      value={cpfTopUp.selfAmount}
                      onChange={(e) => handleCpfTopUpAmountChange('selfAmount', e.target.value)}
                      placeholder="Enter amount"
                      error={!!cpfTopUpErrors.selfAmount}
                      helperText={cpfTopUpErrors.selfAmount}
                      inputProps={{ 
                        inputMode: 'decimal',
                        pattern: '[0-9]*\.?[0-9]{0,2}'
                      }}
                      sx={{ ml: 4, width: '200px' }}
                    />
                  )}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={cpfTopUp.family}
                        onChange={(e) => setCpfTopUp(prev => ({
                          ...prev,
                          family: e.target.checked
                        }))}
                      />
                    }
                    label="Contribution to my family member's CPF"
                  />
                  {cpfTopUp.family && (
                    <TextField
                      size="small"
                      value={cpfTopUp.familyAmount}
                      onChange={(e) => handleCpfTopUpAmountChange('familyAmount', e.target.value)}
                      placeholder="Enter amount"
                      error={!!cpfTopUpErrors.familyAmount}
                      helperText={cpfTopUpErrors.familyAmount}
                      inputProps={{ 
                        inputMode: 'decimal',
                        pattern: '[0-9]*\.?[0-9]{0,2}'
                      }}
                      sx={{ ml: 4, width: '200px' }}
                    />
                  )}
                </Box>
              )}
            </>
          )}
          {extraInputs.sprStatus !== 'ep_pep_spass' && (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={nsmanRelief.enabled}
                    onChange={(e) => handleNSmanReliefChange(e.target.checked)}
                  />
                }
                label="NSman Relief"
              />
              {nsmanRelief.enabled && (
                <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={nsmanRelief.general}
                        onChange={() => handleNsmanChange('general')}
                      />
                    }
                    label="NSman Self Relief (General population)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={nsmanRelief.key}
                        onChange={() => handleNsmanChange('key')}
                      />
                    }
                    label="NSman Self Relief (Key command/staff appointment holder)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={nsmanRelief.wife}
                        onChange={() => handleNsmanChange('wife')}
                      />
                    }
                    label="NSman Wife Relief"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={nsmanRelief.parent}
                        onChange={() => handleNsmanChange('parent')}
                      />
                    }
                    label="NSman Parent Relief"
                  />
                </Box>
              )}
            </>
          )}
          <FormControlLabel
            control={
              <Checkbox
                checked={spouseRelief.enabled}
                onChange={(e) => handleSpouseReliefChange(e.target.checked)}
              />
            }
            label="Spouse Relief"
          />
          {spouseRelief.enabled && (
            <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={spouseRelief.disability}
                    onChange={(e) => handleSpouseDisabilityChange(e.target.checked)}
                  />
                }
                label="I am eligible for Spouse Relief (Disability)"
              />
            </Box>
          )}
          <FormControlLabel
            control={
              <Checkbox
                checked={parentRelief.enabled}
                onChange={(e) => handleParentReliefChange(e.target.checked)}
              />
            }
            label="Parent Relief"
          />
          {/* Error Message for Parent Relief */}
          {parentRelief.enabled && parentReliefDisability.enabled && 
            Number(parentRelief.dependants) + Number(parentReliefDisability.dependants) > 2 && (
            <Box sx={{ ml: 4, color: '#D84747' }}>
              <Typography sx={{ fontSize: '0.75rem' }}>
                Max 2 dependants allowed for Parent Relief/Parent Relief (Disability).
              </Typography>
            </Box>
          )}
          {parentRelief.enabled && (
            <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography>How many dependants do you support?</Typography>
              <Select
                size="small"
                value={parentRelief.dependants}
                onChange={(e) => setParentRelief(prev => ({
                  ...prev,
                  dependants: e.target.value
                }))}
                sx={{ width: '120px' }}
              >
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
              </Select>
              
              {Array.from({ length: Number(parentRelief.dependants) }).map((_, index) => (
                <Box key={index} sx={{ mt: 1 }}>
                  {parentRelief.dependants === "2" && (
                    <Typography sx={{ fontWeight: 'bold' }}>Dependant {index + 1}</Typography>
                  )}
                  <RadioGroup
                    value={parentRelief.stayType}
                    onChange={(e) => setParentRelief(prev => ({
                      ...prev,
                      stayType: e.target.value
                    }))}
                  >
                    <FormControlLabel 
                      value="with" 
                      control={<Radio />} 
                      label="Dependant stays with me" 
                    />
                    <FormControlLabel 
                      value="without" 
                      control={<Radio />} 
                      label="Dependant does not stay with me" 
                    />
                  </RadioGroup>
                </Box>
              ))}
            </Box>
          )}

          {/* Parent Relief (Disability) Section */}
          <FormControlLabel
            control={
              <Checkbox
                checked={parentReliefDisability.enabled}
                onChange={(e) => handleParentReliefDisabilityChange(e.target.checked)}
              />
            }
            label="Parent Relief (Disability)"
          />
          {/* Error Message for Parent Relief (Disability) */}
          {parentRelief.enabled && parentReliefDisability.enabled && 
            Number(parentRelief.dependants) + Number(parentReliefDisability.dependants) > 2 && (
            <Box sx={{ ml: 4, color: '#D84747' }}>
              <Typography sx={{ fontSize: '0.75rem' }}>
                Max 2 dependants allowed for Parent Relief/Parent Relief (Disability).
              </Typography>
            </Box>
          )}
          {parentReliefDisability.enabled && (
            <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1}}>
              <Typography>How many dependants with disabilities do you support?</Typography>
              <Select
                size="small"
                value={parentReliefDisability.dependants}
                onChange={(e) => setParentReliefDisability(prev => ({
                  ...prev,
                  dependants: e.target.value
                }))}
                sx={{ width: '120px' }}
              >
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
              </Select>
              
              {Array.from({ length: Number(parentReliefDisability.dependants) }).map((_, index) => (
                <Box key={index} sx={{ mt: 1 }}>
                  {parentReliefDisability.dependants === "2" && (
                    <Typography sx={{ fontWeight: 'bold' }}>Dependant {index + 1}</Typography>
                  )}
                  <RadioGroup
                    value={parentReliefDisability.stayType}
                    onChange={(e) => setParentReliefDisability(prev => ({
                      ...prev,
                      stayType: e.target.value
                    }))}
                  >
                    <FormControlLabel 
                      value="with" 
                      control={<Radio />} 
                      label="Dependant stays with me" 
                    />
                    <FormControlLabel 
                      value="without" 
                      control={<Radio />} 
                      label="Dependant does not stay with me" 
                    />
                  </RadioGroup>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* RSU Section */}
        <Box sx={{ bgcolor: 'rgb(245, 240, 255)', p: 2, borderRadius: 1, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#9370DB', mb: 2 }}>
            Restricted Stock Units (RSU)
          </Typography>
          {rsuCycles.map((cycle, idx) => (
            <Box key={idx} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  RSU Vesting Cycle {idx + 1}
                </Typography>
                <Box>
                  <IconButton onClick={() => toggleRsuExpand(idx)}>
                    <ExpandMoreIcon />
                  </IconButton>
                  <IconButton onClick={() => removeRsuCycle(idx)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              <Collapse in={cycle.expanded}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    <span>Number of Shares</span>
                    <IconButton onClick={(e) => handlePopoverClick(e, setRsuSharesPopoverAnchor)} size="small">
                      <InfoIcon fontSize="inherit" />
                    </IconButton>
                    <Popover
                      open={Boolean(rsuSharesPopoverAnchor)}
                      anchorEl={rsuSharesPopoverAnchor}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                      sx={{ maxWidth: POPOVER_MAX_WIDTH }}
                    >
                      <Typography sx={{ p: 2, fontSize: '0.8rem', fontStyle: 'italic' }}>Total RSUs vesting in this cycle.</Typography>
                    </Popover>
                  </Typography>
                  <TextField
                    fullWidth
                    name="shares"
                    value={cycle.shares}
                    onChange={(e) => handleRsuChange(idx, 'shares', e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    <span>Price at Vesting</span>
                    <IconButton onClick={(e) => handlePopoverClick(e, setRsuVestingPopoverAnchor)} size="small">
                      <InfoIcon fontSize="inherit" />
                    </IconButton>
                    <Popover
                      open={Boolean(rsuVestingPopoverAnchor)}
                      anchorEl={rsuVestingPopoverAnchor}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                      sx={{ maxWidth: POPOVER_MAX_WIDTH }}
                    >
                      <Typography sx={{ p: 2, fontSize: '0.8rem', fontStyle: 'italic' }}>Stock price at the time of RSU vesting.</Typography>
                    </Popover>
                  </Typography>
                  <TextField
                    fullWidth
                    name="vestingPrice"
                    value={cycle.vestingPrice}
                    onChange={(e) => handleRsuChange(idx, 'vestingPrice', e.target.value)}
                  />
                </Box>
              </Collapse>
            </Box>
          ))}
          <Button variant="outlined" onClick={addRsuCycle} sx={{ color: '#9370DB', borderColor: '#9370DB' }}>+ Add RSU Vesting Cycle</Button>
        </Box>

        {/* ESOP Section */}
        <Box sx={{ bgcolor: 'rgb(242, 247, 255)', p: 2, borderRadius: 1, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
            Employee Share Options (ESOP)
          </Typography>
          {esopCycles.map((cycle, idx) => (
            <Box key={idx} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  ESOP Vesting Cycle {idx + 1}
                </Typography>
                <Box>
                  <IconButton onClick={() => toggleEsopExpand(idx)}>
                    <ExpandMoreIcon />
                  </IconButton>
                  <IconButton onClick={() => removeEsopCycle(idx)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              <Collapse in={cycle.expanded}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    <span>Number of Shares</span>
                    <IconButton onClick={(e) => handlePopoverClick(e, setEsopSharesPopoverAnchor)} size="small">
                      <InfoIcon fontSize="inherit" />
                    </IconButton>
                    <Popover
                      open={Boolean(esopSharesPopoverAnchor)}
                      anchorEl={esopSharesPopoverAnchor}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                      sx={{ maxWidth: POPOVER_MAX_WIDTH }}
                    >
                      <Typography sx={{ p: 2, fontSize: '0.8rem', fontStyle: 'italic' }}>Total number of options vesting in a given cycle.</Typography>
                    </Popover>
                  </Typography>
                  <TextField
                    fullWidth
                    name="shares"
                    value={cycle.shares}
                    onChange={(e) => handleEsopChange(idx, 'shares', e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    <span>Exercise Price</span>
                    <IconButton onClick={(e) => handlePopoverClick(e, setEsopExercisePopoverAnchor)} size="small">
                      <InfoIcon fontSize="inherit" />
                    </IconButton>
                    <Popover
                      open={Boolean(esopExercisePopoverAnchor)}
                      anchorEl={esopExercisePopoverAnchor}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                      sx={{ maxWidth: POPOVER_MAX_WIDTH }}
                    >
                      <Typography sx={{ p: 2, fontSize: '0.8rem', fontStyle: 'italic' }}>Price per share you must pay to exercise your stock options, usually set during contract signing, grant date, or annual reviews.</Typography>
                    </Popover>
                  </Typography>
                  <TextField
                    fullWidth
                    name="exercisePrice"
                    value={cycle.exercisePrice}
                    onChange={(e) => handleEsopChange(idx, 'exercisePrice', e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    <span>Price at Vesting</span>
                    <IconButton onClick={(e) => handlePopoverClick(e, setEsopVestingPopoverAnchor)} size="small">
                      <InfoIcon fontSize="inherit" />
                    </IconButton>
                    <Popover
                      open={Boolean(esopVestingPopoverAnchor)}
                      anchorEl={esopVestingPopoverAnchor}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                      sx={{ maxWidth: POPOVER_MAX_WIDTH }}
                    >
                      <Typography sx={{ p: 2, fontSize: '0.8rem', fontStyle: 'italic' }}>Stock price at the time of vesting, used to calculate gains.</Typography>
                    </Popover>
                  </Typography>
                  <TextField
                    fullWidth
                    name="vestingPrice"
                    value={cycle.vestingPrice}
                    onChange={(e) => handleEsopChange(idx, 'vestingPrice', e.target.value)}
                  />
                </Box>
              </Collapse>
            </Box>
          ))}
          <Button variant="outlined" onClick={addEsopCycle} sx={{ color: 'primary.main', borderColor: 'primary.main' }}>+ Add ESOP Vesting Cycle</Button>
        </Box>

        {/* Results */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Results
        </Typography>
        <Box sx={{ bgcolor: 'rgb(242, 255, 242)', p: 2, borderRadius: 1, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'green' }}>
            Take Home Pay
          </Typography>
          <Typography>Monthly: {formatCurrency(results.monthlyTakeHome)}</Typography>
          <Typography>Annual: {formatCurrency(results.annualTakeHome)}</Typography>
        </Box>

        {/* Results */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Detailed Income Breakdown
        </Typography>

        {/* RSU Gains Section */}
        {results.totalRsuGains > 0 && (
          <Box sx={{ bgcolor: 'rgb(242, 247, 255)', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                RSU Gains
            </Typography>
            {rsuCycles.map((cycle, idx) => {
                const shares = Number(cycle.shares) || 0;
                const vestingPrice = Number(cycle.vestingPrice) || 0;
                const gain = shares * vestingPrice;
                return (
                    <Typography key={idx}>
                        RSU Vesting Cycle {idx + 1}: {formatCurrency(gain)}
                    </Typography>
                );
            })}
            <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Total RSU Gains: {formatCurrency(results.totalRsuGains)}
                </Typography>
            </Box>
          </Box>
        )}

        {/* ESOP Gains Section */}
        {results.totalEsopGains > 0 && (
          <Box sx={{ bgcolor: 'rgb(242, 247, 255)', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                  ESOP Gains
              </Typography>
              {esopCycles.map((cycle, idx) => {
                  const shares = Number(cycle.shares) || 0;
                  const exercisePrice = Number(cycle.exercisePrice) || 0;
                  const vestingPrice = Number(cycle.vestingPrice) || 0;
                  const gain = Math.max(shares * (vestingPrice - exercisePrice), 0);
                  return (
                      <Typography key={idx}>
                          ESOP Vesting Cycle {idx + 1}: {formatCurrency(gain)}
                      </Typography>
                  );
              })}
              <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Total ESOP Gains: {formatCurrency(results.totalEsopGains)}
                  </Typography>
              </Box>
          </Box>
        )}

        {extraInputs.sprStatus !== 'ep_pep_spass' && (
          <>
            {/* CPF - Employee */}
            <Box sx={{ bgcolor: 'rgb(242, 247, 255)', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                CPF Employee Contribution
              </Typography>
              <Typography>Monthly CPF Contribution: {formatCurrency(results.employeeMonthlyCPF)}</Typography>
              <Typography>Annual CPF Contribution: {formatCurrency(results.employeeAnnualCPF)}</Typography>
              <Typography>Bonus CPF Contribution: {formatCurrency(results.employeeBonusCPF)}</Typography>
              <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Total CPF Contributions (Employee): {formatCurrency(results.totalEmployeeCPF)}
                </Typography>
              </Box>
            </Box>

            {/* CPF - Employer */}
            <Box sx={{ bgcolor: 'rgb(242, 247, 255)', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                CPF Employer Contribution
              </Typography>
              <Typography>Monthly CPF Contribution: {formatCurrency(results.employerMonthlyCPF)}</Typography>
              <Typography>Annual CPF Contribution: {formatCurrency(results.employerAnnualCPF)}</Typography>
              <Typography>Bonus CPF Contribution: {formatCurrency(results.employerBonusCPF)}</Typography>
              <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Total CPF Contributions (Employer): {formatCurrency(results.totalEmployerCPF)}
                </Typography>
              </Box>
            </Box>
          </>
        )}

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Annual Taxable Income</Typography>
        <Typography>{formatCurrency(results.totalTaxableIncome)}</Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Annual Tax</Typography>
        <Typography>{formatCurrency(results.annualTax)}</Typography>

        {extraInputs.sprStatus !== 'ep_pep_spass' && (
          <>
            {/* Updated Total CPF Contributions Section */}
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>Total CPF Contributions</Typography>
            <Typography>{formatCurrency(results.totalEmployeeCPF + results.totalEmployerCPF)}</Typography>
          </>
        )}

        {/* Add margin/padding between sections */}
        <Box sx={{ mb: 3 }} />

        {/* Tax Relief Summary Box */}
        {(results.baseIncome > 0 && taxReliefResults.totalReliefs > 0) && (
          <Box sx={{ bgcolor: 'rgb(242, 247, 255)', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
              Tax Reliefs
            </Typography>
            {taxReliefResults.earnedIncomeRelief > 0 && (
              <Typography>
                Earned Income Relief: {formatCurrency(taxReliefResults.earnedIncomeRelief)}
              </Typography>
            )}
            {taxReliefResults.earnedIncomeReliefDisability > 0 && (
              <Typography>
                Earned Income Relief (Disability): {formatCurrency(taxReliefResults.earnedIncomeReliefDisability)}
              </Typography>
            )}
            {taxReliefResults.cpfRelief > 0 && (
              <Typography>
                CPF Relief: {formatCurrency(taxReliefResults.cpfRelief)}
              </Typography>
            )}
            {cpfTopUp.enabled && taxReliefResults.cpfTopUpRelief > 0 && (
              <Typography>
                CPF Cash Top-Up Relief: {formatCurrency(taxReliefResults.cpfTopUpRelief)}
              </Typography>
            )}
            {taxReliefResults.nsmanRelief > 0 && (
              <Typography>
                NSman Relief: {formatCurrency(taxReliefResults.nsmanRelief)}
              </Typography>
            )}
            {spouseRelief.enabled && (
              <Typography>
                {spouseRelief.disability ? 
                "Spouse Relief (Disability): " + formatCurrency(5500) :
                "Spouse Relief: " + formatCurrency(2000)
              }
            </Typography>
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={parentRelief.enabled}
                  onChange={(e) => handleParentReliefChange(e.target.checked)}
                />
              }
              label="Parent Relief"
            />
            {/* Error Message for Parent Relief */}
            {parentRelief.enabled && parentReliefDisability.enabled && 
              Number(parentRelief.dependants) + Number(parentReliefDisability.dependants) > 2 && (
              <Box sx={{ ml: 4, color: '#D84747' }}>
                <Typography sx={{ fontSize: '0.75rem' }}>
                  Max 2 dependants allowed for Parent Relief/Parent Relief (Disability).
                </Typography>
              </Box>
            )}
            {parentRelief.enabled && (
              <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography>How many dependants do you support?</Typography>
                <Select
                  size="small"
                  value={parentRelief.dependants}
                  onChange={(e) => setParentRelief(prev => ({
                    ...prev,
                    dependants: e.target.value
                  }))}
                  sx={{ width: '120px' }}
                >
                  <MenuItem value="1">1</MenuItem>
                  <MenuItem value="2">2</MenuItem>
                </Select>
              </Box>
            )}
            <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Total Tax Reliefs: {formatCurrency(taxReliefResults.totalReliefs)}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Add margin/padding between sections */}
        <Box sx={{ mb: 3 }} />
      </CardContent>
    </Card>
  );
};

export default SingaporeTakeHomeCalculator;
