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
  Popover
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

// Global variable for popover max width
const POPOVER_MAX_WIDTH = '480px';

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

  // Define the type for RSU cycle
  interface RsuCycle {
    shares: string;
    exercisePrice: string;
    vestingPrice: string;
    expanded: boolean;
  }

  // RSU & ESOP arrays
  const [rsuCycles, setRsuCycles] = useState([]); // Start with an empty array
  const [esopCycles, setEsopCycles] = useState([]); // Start with an empty array

  // Results
  const [results, setResults] = useState({
    monthlyTakeHome: 0,
    annualTakeHome: 0,
    stockGains: 0,
    esopGains: 0,
    annualTax: 0,
    totalTaxableIncome: 0,

    // For Employee
    employeeMonthlyCPF: 0,
    employeeAnnualCPF: 0,
    employeeBonusCPF: 0,
    totalEmployeeCPF: 0,

    // For Employer
    employerMonthlyCPF: 0,
    employerAnnualCPF: 0,
    employerBonusCPF: 0,
    totalEmployerCPF: 0,
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

    // tax
    const annualTax = calculateTax(totalTaxableIncome);

    // net
    const annualTakeHome = totalTaxableIncome - empAnnualBase - annualTax;
    const monthlyTakeHome = annualTakeHome / 12;

    // store in results
    setResults({
      monthlyTakeHome,
      annualTakeHome,
      totalRsuGains,
      totalEsopGains,
      annualTax,
      totalTaxableIncome,

      employeeMonthlyCPF: empMonth,
      employeeAnnualCPF: empAnnualBase,
      employeeBonusCPF: empBonus,
      totalEmployeeCPF: empAnnualBase + empBonus,

      employerMonthlyCPF: erMonth,
      employerAnnualCPF: erAnnualBase,
      employerBonusCPF: erBonus,
      totalEmployerCPF: erAnnualBase + erBonus
    });
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
  const handleEsopInputChange = (e, index: number) => {
    const { name, value } = e.target;
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
              Monthly Salary
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
              Annual Salary
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
          <Button variant="outlined" onClick={addRsuCycle}>+ Add RSU Vesting Cycle</Button>
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
                    onChange={(e) => handleEsopInputChange(e, idx)}
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
                    onChange={(e) => handleEsopInputChange(e, idx)}
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
                    onChange={(e) => handleEsopInputChange(e, idx)}
                  />
                </Box>
              </Collapse>
            </Box>
          ))}
          <Button variant="outlined" onClick={addEsopCycle}>+ Add ESOP Vesting Cycle</Button>
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

        {/* ESOP Gains Section */}
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
      </CardContent>
    </Card>
  );
};

export default SingaporeTakeHomeCalculator;
