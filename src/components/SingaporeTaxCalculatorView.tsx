import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Popover,
  FormControlLabel,
  Checkbox,
  Button,
  RadioGroup,
  Radio,
  Collapse,
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  FormHelperText,
  Divider
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import * as constants from '../utils/constants';
import { MAX_TAX_RELIEF } from '../utils/constants';
import type { 
  SingaporeTaxCalculatorViewProps,
  TaxDeductions,
  TaxDeductionResult,
  CpfTopUp,
  ParentRelief,
  IncomeSources,
  RsuCycle,
  EsopCycle,
  SiblingRelief,
  TaxReliefResult,
  QualifyingChildRelief,
  QualifyingChildReliefDisability,
  WorkingMothersChildRelief,
  SrsContributionRelief,
  LifeInsuranceRelief,
  CourseFeesRelief,
  FdwlRelief,
  Inputs
} from '../types/tax';
import { POPOVER_MAX_WIDTH } from '../utils/constants';

interface ParentDependant {
  staysWithMe: boolean;
  hasDisability: boolean;
}

export const SingaporeTaxCalculatorView: React.FC<SingaporeTaxCalculatorViewProps> = ({
  extraInputs,
  inputs,
  results,
  taxReliefResults,
  ageError,
  agePopoverAnchor,
  residencyPopoverAnchor,
  monthlySalaryPopoverAnchor,
  annualSalaryPopoverAnchor,
  annualBonusPopoverAnchor,
  rsuSharesPopoverAnchor,
  rsuVestingPopoverAnchor,
  esopSharesPopoverAnchor,
  esopExercisePopoverAnchor,
  esopVestingPopoverAnchor,
  parentRelief,
  spouseRelief,
  cpfTopUp,
  incomeSources,
  rsuCycles,
  esopCycles,
  taxReliefs,
  cpfTopUpErrors,
  nsmanRelief,
  siblingRelief,
  grandparentCaregiverRelief,
  qualifyingChildRelief,
  qualifyingChildReliefDisability,
  workingMothersChildRelief,
  srsContributionRelief,
  setSrsContributionRelief,
  handleClose,
  handlePopoverClick,
  setExtraInputs,
  handleSalaryChange,
  setInputs,
  handleParentReliefChange,
  handleParentDependantChange,
  handleParentDependantsChange,
  handleIncomeSourceChange,
  handleRsuChange,
  handleEsopChange,
  addRsuCycle,
  addEsopCycle,
  toggleRsuExpanded,
  toggleEsopExpanded,
  formatCurrency,
  setAgePopoverAnchor,
  setResidencyPopoverAnchor,
  setMonthlySalaryPopoverAnchor,
  setAnnualSalaryPopoverAnchor,
  setAnnualBonusPopoverAnchor,
  handleDisabilityReliefChange,
  handleCpfTopUpChange,
  setCpfTopUp,
  handleCpfTopUpAmountChange,
  handleNSmanReliefChange,
  handleNSmanChange,
  handleSpouseReliefChange,
  handleSpouseDisabilityChange,
  removeRsuCycle,
  setRsuSharesPopoverAnchor,
  setRsuVestingPopoverAnchor,
  removeEsopCycle,
  setEsopSharesPopoverAnchor,
  setEsopExercisePopoverAnchor,
  setEsopVestingPopoverAnchor,
  handleSiblingReliefChange,
  setSiblingRelief,
  handleParentStayTypeChange,
  handleGrandparentCaregiverReliefChange,
  setQualifyingChildRelief,
  setQualifyingChildReliefDisability,
  setWorkingMothersChildRelief,
  lifeInsuranceRelief,
  setLifeInsuranceRelief,
  handleLifeInsuranceChange,
  courseFeesRelief,
  setCourseFeesRelief,
  fdwlRelief,
  setFdwlRelief,
  taxDeductionResults,
  handleTaxDeductionChange,
  taxDeductions,
  mortgageInterestPopoverAnchor,
  setMortgageInterestPopoverAnchor,
  setIncomeSources
}) => {
  // Add state for tax relief section expansion
  const [taxReliefExpanded, setTaxReliefExpanded] = useState(false);
  const [taxDeductionsExpanded, setTaxDeductionsExpanded] = useState(false);
  const [employmentExpenseAmount, setEmploymentExpenseAmount] = useState(''); // State for the amount

  // Render
  return (
    <Card sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: 4, borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontFamily: 'Helvetica' }}>
          Singapore Take Home Pay Calculator
        </Typography>
        <Divider sx={{ my: 4 }} />

    <Grid container spacing={4}>
      {/* Left Column: Inputs */}
      <Grid item xs={12} md={5.5} sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Basic Information
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
              id="age"
              name="age"
              fullWidth
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
              id="residency-select"
              name="residency"
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
              id="monthly-salary"
              name="monthlySalary"
              fullWidth
              placeholder="Enter amount"
              value={inputs.monthlySalary}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                  setInputs((prev: Inputs) => ({
                    ...prev,
                    monthlySalary: value,
                    annualSalary: value ? (Number(value) * 12).toFixed(2) : ''
                  }));
                }
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { 
                  inputMode: 'decimal',
                  pattern: '[0-9]*\.?[0-9]{0,2}'
                }
              }}
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
              id="annual-salary"
              name="annualSalary"
              fullWidth
              placeholder="Enter amount"
              value={inputs.annualSalary}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                  setInputs((prev: Inputs) => ({
                    ...prev,
                    annualSalary: value,
                    monthlySalary: value ? (Number(value) / 12).toFixed(2) : ''
                  }));
                }
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { 
                  inputMode: 'decimal',
                  pattern: '[0-9]*\.?[0-9]{0,2}'
                }
              }}
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
            id="annual-bonus"
            name="annualBonus"
            fullWidth
            placeholder="Enter amount" 
            value={inputs.annualBonus}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                setInputs((prev: Inputs) => ({
                  ...prev,
                  annualBonus: value
                }));
              }
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              inputProps: { 
                inputMode: 'decimal',
                pattern: '[0-9]*\.?[0-9]{0,2}'
              }
            }}
          />
        </Box>
        <Divider sx={{ my: 4 }} />

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
                  id="income-employment"
                  name="incomeEmployment"
                  checked={incomeSources.employment}
                  onChange={() => handleIncomeSourceChange('employment')}
                />
              }
              label="Salaried employment"
            />
            {/* Pension */}
            <FormControlLabel
              control={
                <Checkbox
                  id="income-pension"
                  name="incomePension"
                  checked={incomeSources.pension}
                  onChange={() => handleIncomeSourceChange('pension')}
                />
              }
              label="Pension"
            />
            {incomeSources.pension && (
              <TextField
                id="pension-amount"
                name="pensionAmount"
                placeholder="Enter amount"
                value={incomeSources.pensionAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                    handleIncomeSourceChange('pensionAmount', value);
                  }
                }}
                inputProps={{
                  inputMode: 'decimal',
                  pattern: '[0-9]*\.?[0-9]{0,2}'
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                variant="outlined"
                size="small"
                sx={{ width: '200px', ml: 4 }}
              />
            )}
            
            {/* Trade */}
            <FormControlLabel
              control={
                <Checkbox
                  id="income-trade"
                  name="incomeTrade"
                  checked={incomeSources.trade}
                  onChange={() => handleIncomeSourceChange('trade')}
                />
              }
              label="Trade, business, profession or vocation"
            />
            {incomeSources.trade && (
              <TextField
                id="trade-amount"
                name="tradeAmount"
                placeholder="Enter amount"
                value={incomeSources.tradeAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                    handleIncomeSourceChange('tradeAmount', value);
                  }
                }}
                inputProps={{
                  inputMode: 'decimal',
                  pattern: '[0-9]*\.?[0-9]{0,2}'
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                variant="outlined"
                size="small"
                sx={{ width: '200px', ml: 4 }}
              />
            )}

            {/* Rental */}
            <FormControlLabel
              control={
                <Checkbox
                  id="income-rental"
                  name="incomeRental"
                  checked={incomeSources.rental}
                  onChange={() => handleIncomeSourceChange('rental')}
                />
              }
              label="Rent from property ownership"
            />
            {incomeSources.rental && (
              <Box sx={{ ml: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Annual Rental Income
                  <IconButton onClick={(e) => handlePopoverClick(e, setMortgageInterestPopoverAnchor)} size="small">
                  <InfoIcon fontSize="inherit" />
                  </IconButton>
                  </Typography>
                <TextField
                  id="rental-income-amount"
                  name="rentalIncomeAmount"
                  placeholder="Enter amount"
                  value={incomeSources.rentalAmount || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                      handleIncomeSourceChange('rentalAmount', value);
                    }
                  }}
                  inputProps={{ 
                    inputMode: 'decimal',
                    pattern: '[0-9]*\.?[0-9]{0,2}'
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                  variant="outlined"
                  size="small"
                  sx={{ width: '200px' }}
                />
              </Box>
            )}

            {/* Royalties */}
            <FormControlLabel
              control={
                <Checkbox
                  id="income-royalties"
                  name="incomeRoyalties"
                  checked={incomeSources.royalties}
                  onChange={() => handleIncomeSourceChange('royalties')}
                />
              }
              label="Royalties, charge, estate/trust"
            />
            {incomeSources.royalties && (
              <TextField
                id="royalties-amount"
                name="royaltiesAmount"
                placeholder="Enter amount"
                value={incomeSources.royaltiesAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                    handleIncomeSourceChange('royaltiesAmount', value);
                  }
                }}
                inputProps={{
                  inputMode: 'decimal',
                  pattern: '[0-9]*\.?[0-9]{0,2}'
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                variant="outlined"
                size="small"
                sx={{ width: '200px', ml: 4 }}
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* RSU and ESOP Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Equity Grants
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Provide details of your RSU/ESOP vesting cycles.
          </Typography>
        </Box>

        {/* RSU Section */}
        <Box sx={{ bgcolor: 'rgb(245, 240, 255)', p: 2, borderRadius: 1, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#9370DB', mb: 2 }}>
            Restricted Stock Units (RSU)
          </Typography>
          {rsuCycles.map((cycle, idx) => (
            <Box key={idx} sx={{ mb: 2 }}>
              <Box 
                onClick={() => toggleRsuExpanded(idx)} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  cursor: 'pointer'  // Add pointer cursor
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  RSU Vesting Cycle {idx + 1}
                </Typography>
                <Box>
                  <IconButton>
                    {cycle.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); removeRsuCycle(idx); }}>
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
                    id={`rsu-shares-${idx}`}
                    name={`rsuShares${idx}`}
                    fullWidth
                    placeholder="Enter number of shares"
                    value={cycle.shares}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string or valid number input
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        handleRsuChange(idx, 'shares', value); // Pass the value directly
                      }
                    }}
                    inputProps={{
                      inputMode: 'decimal',
                      pattern: '[0-9]*\.?[0-9]*'
                    }}
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
                    id={`rsu-vesting-price-${idx}`}
                    name={`rsuVestingPrice${idx}`}
                    fullWidth
                    placeholder="Enter price at vesting"
                    value={cycle.vestingPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        handleRsuChange(idx, 'vestingPrice', value);
                      }
                    }}
                    inputProps={{
                      inputMode: 'decimal',
                      pattern: '[0-9]*\.?[0-9]*'
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                    sx={{ mb: 2 }}
                  />
                
                </Box>
              </Collapse>
              {idx < rsuCycles.length - 1 && <Divider sx={{ my: 2 }} />} {/* Divider between RSU cycles */}
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
              <Box 
                onClick={() => toggleEsopExpanded(idx)} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  cursor: 'pointer'  // Add pointer cursor
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  ESOP Vesting Cycle {idx + 1}
                </Typography>
                <Box>
                  <IconButton>
                    {cycle.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); removeEsopCycle(idx); }}>
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
                    id={`esop-shares-${idx}`}
                    name={`esopShares${idx}`}
                    fullWidth
                    placeholder="Enter number of shares"
                    value={cycle.shares}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        handleEsopChange(idx, 'shares', value === '' ? '' : value); // Allow empty string
                      }
                    }}
                    inputProps={{
                      inputMode: 'decimal',
                      pattern: '[0-9]*\.?[0-9]*'
                    }}
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
                    id={`esop-vesting-price-${idx}`}
                    name={`esopVestingPrice${idx}`}
                    fullWidth
                    placeholder="Enter price at vesting"
                    value={cycle.vestingPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        handleEsopChange(idx, 'vestingPrice', value === '' ? '' : value); // Allow empty string
                      }
                    }}
                    inputProps={{
                      inputMode: 'decimal',
                      pattern: '[0-9]*\.?[0-9]*'
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
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
                    id={`esop-exercise-price-${idx}`}
                    name={`esopExercisePrice${idx}`}
                    fullWidth
                    placeholder="Enter exercise price"
                    value={cycle.exercisePrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        handleEsopChange(idx, 'exercisePrice', value === '' ? '' : value); // Allow empty string
                      }
                    }}
                    inputProps={{
                      inputMode: 'decimal',
                      pattern: '[0-9]*\.?[0-9]*'
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                    sx={{ mb: 2 }}
                  />
                </Box>
              </Collapse>
              {idx < esopCycles.length - 1 && <Divider sx={{ my: 2 }} />} {/* Divider between ESOP cycles */}
            </Box>
          ))}
          <Button variant="outlined" onClick={addEsopCycle} sx={{ color: 'primary.main', borderColor: 'primary.main' }}>+ Add ESOP Vesting Cycle</Button>
        </Box>
        <Divider sx={{ my: 4 }} /> {/* Divider added here */}

        {/* Tax Reliefs */}
        <Box sx={{ mb: 3 }}>
          <Box 
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setTaxReliefExpanded(!taxReliefExpanded)}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Tax Reliefs
            </Typography>
            <IconButton>
              {taxReliefExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={taxReliefExpanded}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              {/* EIR Section */}
              {(incomeSources.employment || incomeSources.pension || incomeSources.trade) && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="earned-income-relief"
                        name="earnedIncomeRelief"
                        checked={taxReliefs.earnedIncomeRelief}
                        disabled={true}
                      />
                    }
                    label="Earned Income Relief"
                  />
                  <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="earned-income-relief-disability"
                          name="earnedIncomeReliefDisability"
                          checked={taxReliefs.earnedIncomeReliefDisability}
                          onChange={(e) => handleDisabilityReliefChange(e.target.checked)}
                          disabled={results.eligibleIncome === 0}
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
                        id="cpf-relief"
                        name="cpfRelief"
                        checked={taxReliefs.cpfRelief}
                        disabled={true}
                      />
                    }
                    label="CPF/Provident Fund Relief"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="cpf-cash-topup-relief"
                        name="cpfCashTopupRelief"
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
                            id="cpf-cash-topup-self"
                            name="cpfCashTopupSelf"
                            checked={cpfTopUp.self}
                            onChange={(e) => setCpfTopUp((prev: CpfTopUp) => ({
                              ...prev,
                              self: e.target.checked
                            }))}
                          />
                        }
                        label="Contribution to my own CPF"
                      />
                      <TextField
                        id="cpf-topup-self-amount"
                        name="cpfTopUpSelfAmount"
                        size="small"
                        value={cpfTopUp.selfAmount}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                            setCpfTopUp((prev: CpfTopUp) => ({
                              ...prev,
                              selfAmount: value
                            }));
                          }
                        }}
                        placeholder="Enter amount"
                        inputProps={{ 
                          inputMode: 'decimal',
                          pattern: '[0-9]*\.?[0-9]{0,2}'
                        }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                        sx={{ ml: 4, width: '200px' }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            id="cpf-cash-topup-family"
                            name="cpfCashTopupFamily"
                            checked={cpfTopUp.family}
                            onChange={(e) => setCpfTopUp((prev: CpfTopUp) => ({
                              ...prev,
                              family: e.target.checked
                            }))}
                          />
                        }
                        label="Contribution to my family member's CPF"
                      />
                      <TextField
                        id="cpf-topup-family-amount"
                        name="cpfTopUpFamilyAmount"
                        size="small"
                        value={cpfTopUp.familyAmount}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                            setCpfTopUp(prev => ({
                              ...prev,
                              familyAmount: value
                            }));
                          }
                        }}
                        placeholder="Enter amount"
                        inputProps={{ 
                          inputMode: 'decimal',
                          pattern: '[0-9]*\.?[0-9]{0,2}'
                        }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                        sx={{ ml: 4, width: '200px' }}
                      />
                    </Box>
                  )}
                </>
              )}
              {extraInputs.sprStatus !== 'ep_pep_spass' && (
                <>
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="nsman-relief"
                        name="nsmanRelief"
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
                            onChange={(e) => handleNSmanChange('general')}
                          />
                        }
                        label="NSman Self Relief (General population)"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={nsmanRelief.key}
                            onChange={(e) => handleNSmanChange('key')}
                          />
                        }
                        label="NSman Self Relief (Key command/staff appointment holder)"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={nsmanRelief.wife}
                            onChange={(e) => handleNSmanChange('wife')}
                          />
                        }
                        label="NSman Wife Relief"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={nsmanRelief.parent}
                            onChange={(e) => handleNSmanChange('parent')}
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
                    id="spouse-relief"
                    name="spouseRelief"
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
                        id="spouse-relief-disability"
                        name="spouseReliefDisability"
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
                    id="parent-relief"
                    name="parentRelief"
                    checked={parentRelief.enabled}
                    onChange={(e) => handleParentReliefChange(e.target.checked)}
                  />
                }
                label="Parent Relief"
              />
              {parentRelief.enabled && (
                <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>How many dependants do you support?</Typography>
                  <Select
                    id="parent-relief-dependants"
                    name="parentReliefDependants"
                    size="small"
                    value={parentRelief.dependants}
                    onChange={(e) => handleParentDependantsChange(e.target.value)}
                    sx={{ width: '120px' }}
                  >
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                  </Select>
                  
                  {Array.from({ length: Number(parentRelief.dependants) }).map((_, index) => (
                    <Box key={index} sx={{ mt: 2 }}>
                      <Typography sx={{ fontWeight: 'bold' }}>Dependant {index + 1}</Typography>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={parentRelief.dependantDetails[index].staysWithMe}
                            onChange={(e) => handleParentDependantChange(index, 'staysWithMe', e.target.checked)}
                          />
                        }
                        label="Dependant lives with me"
                      />
                      <br />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={parentRelief.dependantDetails[index].hasDisability}
                            onChange={(e) => handleParentDependantChange(index, 'hasDisability', e.target.checked)}
                          />
                        }
                        label="Dependant has disabilities"
                      />
                    </Box>
                  ))}
                </Box>
              )}

              {/* Sibling Relief (Disability) Section */}
              <FormControlLabel
                control={
                  <Checkbox
                    id="sibling-disability-relief"
                    name="siblingDisabilityRelief"
                    checked={siblingRelief.enabled}
                    onChange={(e) => handleSiblingReliefChange(e.target.checked)}
                  />
                }
                label="Sibling Relief (Disability)"
              />
              {siblingRelief.enabled && (
                <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>How many siblings/sibling-in-laws will you claim reliefs for?</Typography>
                  <Select
                    id="sibling-relief-dependants"
                    name="siblingReliefDependants"
                    size="small"
                    value={siblingRelief.dependants}
                    onChange={(e) => setSiblingRelief(prev => ({
                      ...prev,
                      dependants: e.target.value
                    }))}
                    sx={{ width: '120px' }}
                  >
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                    <MenuItem value="3">3</MenuItem>
                    <MenuItem value="4">4</MenuItem>
                    <MenuItem value="5">5</MenuItem>
                  </Select>
                </Box>
              )}

              {/* Grandparent Caregiver Relief Section */}
              <FormControlLabel
                control={
                  <Checkbox
                    id="grandparent-caregiver-relief"
                    name="grandparentCaregiverRelief"
                    checked={grandparentCaregiverRelief.enabled}
                    onChange={(e) => handleGrandparentCaregiverReliefChange(e.target.checked)}
                  />
                }
                label="Grandparent Caregiver Relief"
              />

              {/* Qualifying Child Relief Section */}
              <FormControlLabel
                control={
                  <Checkbox
                    id="qualifying-child-relief"
                    name="qualifyingChildRelief"
                    checked={qualifyingChildRelief.enabled}
                    onChange={(e) => {
                      setQualifyingChildRelief((prev: QualifyingChildRelief) => ({
                        ...prev,
                        enabled: e.target.checked
                      }));
                    }}
                  />
                }
                label="Qualifying Child Relief"
              />
              {qualifyingChildRelief.enabled && (
                <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>How many children can you claim for?</Typography>
                  <Select
                    id="qualifying-child-relief-dependants"
                    name="qualifyingChildReliefDependants"
                    size="small"
                    value={qualifyingChildRelief.count}
                    onChange={(e) => setQualifyingChildRelief((prev: QualifyingChildRelief) => ({
                      ...prev,
                      count: e.target.value
                    }))}
                    sx={{ width: '120px' }}
                  >
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                    <MenuItem value="3">3</MenuItem>
                    <MenuItem value="4">4</MenuItem>
                    <MenuItem value="5">5</MenuItem>
                  </Select>
                </Box>
              )}

              {/* Qualifying Child Relief (Disability) Section */}
              <FormControlLabel
                control={
                  <Checkbox
                    id="qualifying-child-relief-disability"
                    name="qualifyingChildReliefDisability"
                    checked={qualifyingChildReliefDisability.enabled}
                    onChange={(e) => {
                      setQualifyingChildReliefDisability((prev: QualifyingChildReliefDisability) => ({
                        ...prev,
                        enabled: e.target.checked
                      }));
                    }}
                  />
                }
                label="Qualifying Child Relief (Disability)"
              />
              {qualifyingChildReliefDisability.enabled && (
                <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>How many children with disabilities can you claim for?</Typography>
                  <Select
                    id="qualifying-child-relief-disability-dependants"
                    name="qualifyingChildReliefDisabilityDependants"
                    size="small"
                    value={qualifyingChildReliefDisability.count}
                    onChange={(e) => setQualifyingChildReliefDisability((prev: QualifyingChildReliefDisability) => ({
                      ...prev,
                      count: e.target.value
                    }))}
                    sx={{ width: '120px' }}
                  >
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                    <MenuItem value="3">3</MenuItem>
                    <MenuItem value="4">4</MenuItem>
                    <MenuItem value="5">5</MenuItem>
                  </Select>
                </Box>
              )}

              {/* Working Mother's Child Relief Section */}
              <FormControlLabel
                control={
                  <Checkbox
                    id="working-mothers-child-relief"
                    name="workingMothersChildRelief"
                    checked={workingMothersChildRelief.enabled}
                    onChange={(e) => {
                      setWorkingMothersChildRelief((prev: WorkingMothersChildRelief) => ({
                        ...prev,
                        enabled: e.target.checked
                      }));
                    }}
                  />
                }
                label="Working Mother's Child Relief"
              />
              {workingMothersChildRelief.enabled && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField
                    id="working-mothers-child-relief-amount"
                    name="workingMothersChildReliefAmount"
                    placeholder="Enter amount"
                    value={workingMothersChildRelief.amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                        setWorkingMothersChildRelief((prev: WorkingMothersChildRelief) => ({
                          ...prev,
                          amount: value
                        }));
                      }
                    }}
                    inputProps={{ 
                      inputMode: 'decimal',
                      pattern: '[0-9]*\.?[0-9]{0,2}'
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                    variant="outlined"
                    size="small"
                    sx={{ ml: 4, width: '200px' }}
                  />
                </Box>
              )}

              {/* SRS Contribution Relief Section */}
              <FormControlLabel
                control={
                  <Checkbox
                    id="srs-contribution-relief"
                    name="srsContributionRelief"
                    checked={srsContributionRelief.enabled}
                    onChange={(e) => setSrsContributionRelief((prev: SrsContributionRelief) => ({
                      ...prev,
                      enabled: e.target.checked
                    }))}
                  />
                }
                label="SRS Contribution Relief"
              />
              {srsContributionRelief.enabled && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 4 }}>
                  <TextField
                    id="srs-contribution-amount"
                    name="srsContributionAmount"
                    placeholder="Enter amount"
                    value={srsContributionRelief.amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numericValue = parseFloat(value);
                      const maxAmount = extraInputs.sprStatus === 'ep_pep_spass' 
                        ? constants.MAX_SRS_CONTRIBUTION_EP 
                        : constants.MAX_SRS_CONTRIBUTION_CITIZEN_PR;

                      if (value === '' || /^(\d*\.?\d{0,2}|\.\d{0,2})$/.test(value)) {
                        if (value === '' || isNaN(numericValue) || numericValue <= maxAmount) {
                          setSrsContributionRelief((prev: SrsContributionRelief) => ({
                            ...prev,
                            amount: value,
                          }));
                        } else {
                          setSrsContributionRelief((prev: SrsContributionRelief) => ({
                            ...prev,
                            error: `Max contribution allowed is ${formatCurrency(maxAmount)}`
                          }));
                        }
                      }
                    }}
                    inputProps={{ 
                      inputMode: 'decimal',
                      pattern: '[0-9]*\.?[0-9]{0,2}'
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                    variant="outlined"
                    size="small"
                    sx={{ width: '200px' }}
                  />
                  {srsContributionRelief.error && (
                    <Typography variant="body2" sx={{ color: 'red', mt: 1 }}>
                      {srsContributionRelief.error}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Life Insurance Relief Section */}
              {results.totalEmployeeCPF <= constants.LIFE_INSURANCE_LIMIT && (
                <>
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="life-insurance-relief"
                        name="lifeInsuranceRelief"
                        checked={lifeInsuranceRelief.enabled}
                        onChange={(e) => setLifeInsuranceRelief((prev: LifeInsuranceRelief) => ({
                          ...prev,
                          enabled: e.target.checked
                        }))}
                      />
                    }
                    label="Life Insurance Relief"
                  />
                  {lifeInsuranceRelief.enabled && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 4 }}>
                      <TextField
                        id="life-insurance-amount"
                        name="lifeInsuranceAmount"
                        placeholder="Enter amount"
                        value={lifeInsuranceRelief.amount}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numericValue = Number(value);
                          if (value === '' || /^(\d*\.?\d{0,2}|\.\d{0,2})$/.test(value)) {
                            if (value === '' || isNaN(numericValue) || numericValue <= constants.LIFE_INSURANCE_LIMIT) {
                              setLifeInsuranceRelief((prev: LifeInsuranceRelief) => ({
                                ...prev,
                                amount: value,
                                error: ''
                              }));
                            } else {
                              setLifeInsuranceRelief((prev: LifeInsuranceRelief) => ({
                                ...prev,
                                error: `Max relief allowed is ${formatCurrency(constants.LIFE_INSURANCE_LIMIT)}`
                              }));

                              // Clear the error after 5 seconds
                              setTimeout(() => {
                                setLifeInsuranceRelief((prev: LifeInsuranceRelief) => ({
                                  ...prev,
                                  error: ''
                                }));
                              }, 5000);
                            }
                          }
                        }}
                        inputProps={{ 
                          inputMode: 'decimal',
                          pattern: '[0-9]*\.?[0-9]{0,2}'
                        }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                        variant="outlined"
                        size="small"
                        sx={{ width: '200px' }}
                      />
                      {lifeInsuranceRelief.error && (
                        <Typography variant="body2" sx={{ color: 'red', mt: 1 }}>
                          {lifeInsuranceRelief.error}
                        </Typography>
                      )}
                    </Box>
                  )}
                </>
              )}

              {/* Course Fees Relief Section */}
              <FormControlLabel
                control={
                  <Checkbox
                    id="course-fees-relief"
                    name="courseFeesRelief"
                    checked={courseFeesRelief.enabled}
                    onChange={(e) => setCourseFeesRelief((prev: CourseFeesRelief) => ({
                      ...prev,
                      enabled: e.target.checked
                    }))}
                  />
                }
                label="Course Fees Relief"
              />
              {courseFeesRelief.enabled && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 4 }}>
                  <TextField
                    id="course-fees-amount"
                    name="courseFeesAmount"
                    placeholder="Enter amount"
                    value={courseFeesRelief.amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                        setCourseFeesRelief((prev: CourseFeesRelief) => ({
                          ...prev,
                          amount: value,
                          error: ''
                        }));
                      }
                    }}
                    inputProps={{ 
                      inputMode: 'decimal',
                      pattern: '[0-9]*\.?[0-9]{0,2}'
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                    variant="outlined"
                    size="small"
                    sx={{ width: '200px' }}
                  />
                  {courseFeesRelief.error && (
                    <Typography variant="body2" sx={{ color: 'red', mt: 1 }}>
                      {courseFeesRelief.error}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Foreign Domestic Worker Levy (FDWL) Relief Section */}
              <FormControlLabel
                control={
                  <Checkbox
                    id="fdwl-relief"
                    name="fdwlRelief"
                    checked={fdwlRelief.enabled}
                    onChange={(e) => setFdwlRelief((prev: FdwlRelief) => ({
                      ...prev,
                      enabled: e.target.checked
                    }))}
                  />
                }
                label="Foreign Domestic Worker Levy (FDWL) Relief"
              />
              {fdwlRelief.enabled && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 4 }}>
                  <TextField
                    id="fdwl-amount"
                    name="fdwlAmount"
                    placeholder="Enter amount"
                    value={fdwlRelief.amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                        setFdwlRelief((prev: FdwlRelief) => ({
                          ...prev,
                          amount: value,
                          error: ''
                        }));
                      }
                    }}
                    inputProps={{ 
                      inputMode: 'decimal',
                      pattern: '[0-9]*\.?[0-9]{0,2}'
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                    variant="outlined"
                    size="small"
                    sx={{ width: '200px' }}
                  />
                  {fdwlRelief.error && (
                    <Typography variant="body2" sx={{ color: 'red', mt: 1 }}>
                      {fdwlRelief.error}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Collapse>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Tax Deductions & Rebates */}
        <Box sx={{ mb: 3 }}>
          <Box 
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setTaxDeductionsExpanded(!taxDeductionsExpanded)}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Tax Deductions & Rebates
            </Typography>
            <IconButton>
              {taxDeductionsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={taxDeductionsExpanded}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              {/* Charitable Deductions */}
              <FormControlLabel
                control={
                  <Checkbox
                    id="charitable-deductions"
                    name="charitableDeductions"
                    checked={taxDeductions.charitableDeductions.enabled}
                    onChange={(e) => handleTaxDeductionChange('charitableDeductions', e.target.checked)}
                  />
                }
                label="Charitable Deductions"
              />
              {taxDeductions.charitableDeductions.enabled && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 4 }}>
                  <TextField
                    id="charitable-amount"
                    name="charitableAmount"
                    placeholder="Enter amount"
                    value={taxDeductions.charitableAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                        handleTaxDeductionChange('charitableAmount', value);
                      }
                    }}
                    inputProps={{ 
                      inputMode: 'decimal',
                      pattern: '[0-9]*\.?[0-9]{0,2}'
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                    variant="outlined"
                    size="small"
                    sx={{ width: '200px' }}
                    error={!!taxDeductions.charitableError}
                    helperText={taxDeductions.charitableError}
                  />
                </Box>
              )}

              {/* Parenthood Tax Rebate */}
              <FormControlLabel
                control={
                  <Checkbox
                    id="parenthood-tax-rebate"
                    name="parenthoodTaxRebate"
                    checked={taxDeductions.parenthoodTaxRebate}
                    onChange={(e) => handleTaxDeductionChange('parenthoodTaxRebate', e.target.checked)}
                  />
                }
                label="Parenthood Tax Rebate"
              />
              {taxDeductions.parenthoodTaxRebate && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 4 }}>
                  <Select
                    id="parenthood-tax-rebate-type"
                    name="parenthoodTaxRebateType"
                    size="small"
                    value={taxDeductions.parenthoodTaxRebateType || 'first_child'}
                    onChange={(e) => handleTaxDeductionChange('parenthoodTaxRebateType', e.target.value)}
                    sx={{ width: '200px' }}
                    displayEmpty
                  >
                    <MenuItem value="first_child">1st child</MenuItem>
                    <MenuItem value="second_child">2nd child</MenuItem>
                    <MenuItem value="third_child">3rd child and beyond</MenuItem>
                    <MenuItem value="custom">Custom amount</MenuItem>
                  </Select>
                  {taxDeductions.parenthoodTaxRebateType === 'custom' && (
                    <TextField
                      id="parenthood-tax-rebate-amount"
                      name="parenthoodTaxRebateAmount"
                      placeholder="Enter amount"
                      value={taxDeductions.parenthoodTaxRebateAmount || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                          handleTaxDeductionChange('parenthoodTaxRebateAmount', value);
                        }
                      }}
                      inputProps={{ 
                        inputMode: 'decimal',
                        pattern: '[0-9]*\.?[0-9]{0,2}'
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      }}
                      variant="outlined"
                      size="small"
                      sx={{ width: '200px' }}
                    />
                  )}
                </Box>
              )}

              {/* Rental Income Deductions */}
              <FormControlLabel
                control={
                  <Checkbox
                    id="rental-income-deductions"
                    name="rentalIncomeDeductions"
                    checked={taxDeductions.rentalIncomeDeductions}
                    onChange={(e) => handleTaxDeductionChange('rentalIncomeDeductions', e.target.checked)}
                  />
                }
                label="Rental Income Deductions"
              />
              {taxDeductions.rentalIncomeDeductions && (
                <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Annual Mortgage Interest
                    <IconButton onClick={(e) => handlePopoverClick(e, setMortgageInterestPopoverAnchor)} size="small">
                      <InfoIcon fontSize="inherit" />
                    </IconButton>
                  </Typography>
                  <TextField
                    id="mortgage-interest"
                    name="mortgageInterest"
                    size="small"
                    value={taxDeductions.mortgageInterest || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                        handleTaxDeductionChange('mortgageInterest', value);
                      }
                    }}
                    placeholder="Enter amount"
                    inputProps={{ 
                      inputMode: 'decimal',
                      pattern: '[0-9]*\.?[0-9]{0,2}'
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                    sx={{ width: '200px' }}
                  />
                  <Box sx={{ mb: 2 }} />

                  <Typography>How do you calculate rental income deductions?</Typography>
                  <Box sx={{ mb: 1 }} />
                  <Select
                    id="rental-deduction-type"
                    name="rentalDeductionType"
                    size="small"
                    value={taxDeductions.rentalDeductionType || 'flat'}
                    onChange={(e) => handleTaxDeductionChange('rentalDeductionType', e.target.value)}
                    sx={{ width: '200px', mb: 1 }}
                  >
                    <MenuItem value="flat">Flat 15% deduction</MenuItem>
                    <MenuItem value="actual">Actual rental expenses</MenuItem>
                  </Select>
                  
                  <Box sx={{ mb: 1 }} />

                  {taxDeductions.rentalDeductionType === 'actual' && (
                    <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Actual Rental Expenses
                        <IconButton onClick={(e) => handlePopoverClick(e, setMortgageInterestPopoverAnchor)} size="small">
                        <InfoIcon fontSize="inherit" />
                      </IconButton>
                      </Typography>
                      <TextField
                        id="actual-rental-expenses"
                        name="actualRentalExpenses"
                        size="small"
                        value={taxDeductions.actualRentalExpenses || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                            handleTaxDeductionChange('actualRentalExpenses', value);
                          }
                        }}
                        placeholder="Enter amount"
                        inputProps={{ 
                          inputMode: 'decimal',
                          pattern: '[0-9]*\.?[0-9]{0,2}'
                        }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                        sx={{ width: '200px' }}
                      />
                    </>
                  )}
                </Box>
              )}

              {/* Employment Expense Deductions */}
              <FormControlLabel
                control={
                  <Checkbox
                    id="employment-expense-deductions"
                    name="employmentExpenseDeductions"
                    checked={taxDeductions.employmentExpenseDeductions}
                    onChange={(e) => {
                      handleTaxDeductionChange('employmentExpenseDeductions', e.target.checked);
                      if (!e.target.checked) {
                        setEmploymentExpenseAmount(''); // Reset amount when unchecked
                      }
                    }}
                  />
                }
                label="Employment Expense Deductions"
              />
              {taxDeductions.employmentExpenseDeductions && ( // Show input if checked
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 4 }}>
                  <TextField
                    id="employment-expense-amount"
                    name="employmentExpenseAmount"
                    placeholder="Enter amount"
                    value={employmentExpenseAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                        setEmploymentExpenseAmount(value);
                        handleTaxDeductionChange('employmentExpenseAmount', value); // Update parent state if needed
                      }
                    }}
                    inputProps={{
                      inputMode: 'decimal',
                      pattern: '[0-9]*\.?[0-9]{0,2}'
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                    variant="outlined"
                    size="small"
                    sx={{ width: '200px' }}
                  />
                </Box>
              )}
            </Box>
          </Collapse>
        </Box>
        <Divider sx={{ my: 4, display: { xs: 'block', md: 'none' } }} />

      </Grid>
      


      {/* Right Column: Outputs */}
      <Grid item xs={12} md={6.5} sx={{ display: 'flex' }}>
        <Divider orientation="vertical" sx={{ mr: 4, display: { xs: 'none', md: 'block' } }} />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Results */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Take Home Pay
          </Typography>
          <Box sx={{ bgcolor: 'rgb(242, 255, 242)', p: 2, borderRadius: 1, mb: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography sx={{ fontWeight: 'bold' }}>Annual</Typography>
                <Typography sx={{ color: 'green', fontWeight: 'bold' }}>{formatCurrency(results.annualTakeHome)}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 'bold' }}>Monthly</Typography>
                <Typography sx={{ color: 'green', fontWeight: 'bold' }}>{formatCurrency(results.annualTakeHome / 12)}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 'bold' }}>Hourly</Typography>
                <Typography sx={{ color: 'green', fontWeight: 'bold' }}>{formatCurrency(results.annualTakeHome / (52 * 40))}</Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ bgcolor: 'rgb(242, 255, 242)', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'green', mb: 1 }}>
              Take Home Pay Calculation
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Total Income</Typography>
              <Typography>{formatCurrency(results.totalIncome)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Employee CPF</Typography>
              <Typography>{`— ${formatCurrency(Math.abs(results.employeeAnnualCPF))}`}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Tax</Typography>
              <Typography>{`— ${formatCurrency(Math.abs(results.annualTax))}`}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 'bold' }}>Take Home Pay</Typography>
              <Typography sx={{ fontWeight: 'bold', color: 'green' }}>{formatCurrency(results.annualTakeHome)}</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />  {/* Increased spacing for better separation */}

          {extraInputs.sprStatus !== 'ep_pep_spass' && ( // Adjust the condition based on your actual status for foreigners
            <>

              {/* CPF Overview */}
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                CPF Contributions
              </Typography>
              <Box sx={{ bgcolor: 'rgb(242, 247, 255)', p: 2, borderRadius: 1, mb: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 'bold' }}>Employee</Typography>
                    <Typography sx={{ color: 'primary.main', fontWeight: 'bold' }}>{formatCurrency(results.employeeAnnualCPF)}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 'bold' }}>Employer</Typography>
                    <Typography sx={{ color: 'primary.main', fontWeight: 'bold' }}>{formatCurrency(results.employerAnnualCPF)}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 'bold' }}>Total</Typography>
                    <Typography sx={{ color: 'primary.main', fontWeight: 'bold' }}>{formatCurrency(results.employeeAnnualCPF + results.employerAnnualCPF)}</Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 4 }} />  {/* Increased spacing for better separation */}
            </>
          )}

          {/* Tax */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Tax
          </Typography>
          <Box sx={{ bgcolor: 'lightyellow', p: 2, borderRadius: 1, mb: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography sx={{ fontWeight: 'bold' }}>Taxable Income</Typography>
                <Typography sx={{ color: 'darkgoldenrod', fontWeight: 'bold' }}>{formatCurrency(results.totalTaxableIncome)}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 'bold' }}>Annual Tax</Typography>
                <Typography sx={{ color: 'darkgoldenrod', fontWeight: 'bold' }}>{formatCurrency(results.annualTax)}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 'bold' }}>Monthly Tax</Typography>
                <Typography sx={{ color: 'darkgoldenrod', fontWeight: 'bold' }}>{formatCurrency(results.annualTax / 12)}</Typography>
              </Box>
            </Box>
    
          </Box>

          <Box sx={{ bgcolor: 'lightyellow', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'darkgoldenrod', mb: 1 }}>
            Taxable Income Calculation
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Total Income</Typography>
              <Typography>{formatCurrency(results.totalIncome || 0)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Tax Deductions/Rebates</Typography>
              <Typography>— {formatCurrency(taxDeductionResults.totalDeductions)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Tax Reliefs</Typography>
              <Typography>— {formatCurrency(taxReliefResults.totalReliefs)}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Taxable Income</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{formatCurrency(results.totalTaxableIncome)}</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />  {/* Increased spacing for better separation */}


                    {/* Results */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Detailed Financial Breakdown
          </Typography>

          {/* Income Breakdown Section */}
          <Box sx={{ bgcolor: 'rgb(242, 255, 242)', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'green', mb: 1 }}>
              Income Streams
            </Typography>

            {/* Salary */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Annual Salary</Typography>
              <Typography>{formatCurrency(results.annualSalary || 0)}</Typography>
            </Box>

            {/* Bonus */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Annual Bonus</Typography>
              <Typography>{formatCurrency(results.annualBonus || 0)}</Typography>
            </Box>

            {/* Pension */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Pension</Typography>
              <Typography>{formatCurrency(results.pensionIncome || 0)}</Typography>
            </Box>

            {/* Business Income */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Business Income</Typography>
              <Typography>{formatCurrency(results.businessIncome || 0)}</Typography>
            </Box>

            {/* Rental Income */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Rental Income</Typography>
              <Typography>{formatCurrency(results.rentalIncome || 0)}</Typography>
            </Box>

            {/* Royalties */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Royalties, Charge, Estate, Trust</Typography>
              <Typography>{formatCurrency(results.royaltiesIncome || 0)}</Typography>
            </Box>

            {/* RSU Gains */}
            {rsuCycles.map((cycle, idx) => {
              const shares = Number(cycle.shares) || 0;
              const vestingPrice = Number(cycle.vestingPrice) || 0;
              const gain = shares * vestingPrice;
              return (
                <Box key={`rsu-${idx}`} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>RSU Vesting Cycle {idx + 1}</Typography>
                  <Typography>{formatCurrency(gain || 0)}</Typography>
                </Box>
              );
            })}

            {/* ESOP Gains */}
            {esopCycles.map((cycle, idx) => {
              const shares = Number(cycle.shares) || 0;
              const exercisePrice = Number(cycle.exercisePrice) || 0;
              const vestingPrice = Number(cycle.vestingPrice) || 0;
              const gain = Math.max(shares * (vestingPrice - exercisePrice), 0);
              return (
                <Box key={`esop-${idx}`} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>ESOP Vesting Cycle {idx + 1}</Typography>
                  <Typography>{formatCurrency(gain || 0)}</Typography>
                </Box>
              );
            })}

            <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total Income</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(Number(results.totalIncome) || 0)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {extraInputs.sprStatus !== 'ep_pep_spass' && (
            <>
              {/* CPF - Employee */}
              <Box sx={{ bgcolor: 'rgb(242, 247, 255)', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                  Employee CPF Contributions
                </Typography>
                
                {/* Employee Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Monthly</Typography>
                  <Typography>{formatCurrency(results.employeeMonthlyCPF)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Annual</Typography>
                  <Typography>{formatCurrency(results.employeeAnnualCPF)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Bonus</Typography>
                  <Typography>{formatCurrency(results.employeeBonusCPF)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}> {/* Added margin-top for spacing */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total Employee Contributions</Typography>
                  <Typography>{formatCurrency(results.totalEmployeeCPF)}</Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Employer Section */}
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                  Employee CPF Contributions
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Monthly</Typography>
                  <Typography>{formatCurrency(results.employerMonthlyCPF)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Annual</Typography>
                  <Typography>{formatCurrency(results.employerAnnualCPF)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Bonus</Typography>
                  <Typography>{formatCurrency(results.employerBonusCPF)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total Employer Contributions</Typography>
                  <Typography>{formatCurrency(results.totalEmployerCPF)}</Typography>
                </Box>
              </Box>
            </>
          )}

      
          {/* Tax Deductions & Rebates Box */}
          {(results.annualSalary > 0 && taxDeductionResults.totalDeductions > 0) && (
            <Box sx={{ bgcolor: 'lightyellow', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'darkgoldenrod', mb: 1 }}>
                Tax Deductions & Rebates
              </Typography>
              {taxDeductionResults.charitableDeductions > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Charitable Donations</Typography>
                  <Typography>{formatCurrency(taxDeductionResults.charitableDeductions)}</Typography>
                </Box>
              )}
              {taxDeductionResults.parenthoodTaxRebate > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Parenthood Tax Rebate</Typography>
                  <Typography>{formatCurrency(taxDeductionResults.parenthoodTaxRebate)}</Typography>
                </Box>
              )}
              {taxDeductionResults.rentalIncomeDeductions > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Rental Income Deductions</Typography>
                  <Typography>{formatCurrency(taxDeductionResults.rentalIncomeDeductions)}</Typography>
                </Box>
              )}
              {taxDeductionResults.employmentExpenseDeductions > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Employment Expense Deductions</Typography>
                  <Typography>{formatCurrency(taxDeductionResults.employmentExpenseDeductions)}</Typography>
                </Box>
              )}
              <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total Deductions & Rebates</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{formatCurrency(taxDeductionResults.totalDeductions)}</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Tax Relief Summary Box */}
          {(results.annualSalary > 0 && taxReliefResults.totalReliefs > 0) && (
            <Box sx={{ bgcolor: 'lightyellow', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'darkgoldenrod', mb: 1 }}>
                Tax Reliefs
              </Typography>
              {taxReliefResults.earnedIncomeRelief > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Earned Income Relief</Typography>
                  <Typography>{formatCurrency(taxReliefResults.earnedIncomeRelief)}</Typography>
                </Box>
              )}
              {taxReliefResults.earnedIncomeReliefDisability > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Earned Income Relief (Disability)</Typography>
                  <Typography>{formatCurrency(taxReliefResults.earnedIncomeReliefDisability)}</Typography>
                </Box>
              )}
              {taxReliefResults.cpfRelief > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>CPF Relief</Typography>
                  <Typography>{formatCurrency(taxReliefResults.cpfRelief)}</Typography>
                </Box>
              )}
              {cpfTopUp.enabled && taxReliefResults.cpfTopUpRelief > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>CPF Cash Top-Up Relief</Typography>
                  <Typography>{formatCurrency(taxReliefResults.cpfTopUpRelief)}</Typography>
                </Box>
              )}
              {taxReliefResults.nsmanRelief > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>NSman Relief</Typography>
                  <Typography>{formatCurrency(taxReliefResults.nsmanRelief)}</Typography>
                </Box>
              )}
              {spouseRelief.enabled && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>{spouseRelief.disability ? 'Spouse Relief (Disability)' : 'Spouse Relief'}</Typography>
                  <Typography>{formatCurrency(taxReliefResults.spouseRelief)}</Typography>
                </Box>
              )}
              {/* Parent Relief Section */}
              {taxReliefResults.parentRelief > 0 && (
                <>
                  {parentRelief.dependantDetails.some(d => !d.hasDisability) && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Parent Relief</Typography>
                      <Typography>
                        {formatCurrency(parentRelief.dependantDetails
                          .filter(d => !d.hasDisability)
                          .reduce((total, d) => total + (d.staysWithMe ? 9000 : 5500), 0)
                        )}
                      </Typography>
                    </Box>
                  )}
                  {parentRelief.dependantDetails.some(d => d.hasDisability) && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Parent Relief (Disability)</Typography>
                      <Typography>
                        {formatCurrency(parentRelief.dependantDetails
                          .filter(d => d.hasDisability)
                          .reduce((total, d) => total + (d.staysWithMe ? 14000 : 10000), 0)
                        )}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
              {taxReliefResults.siblingDisabilityRelief > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Sibling Disability Relief</Typography>
                  <Typography>{formatCurrency(taxReliefResults.siblingDisabilityRelief)}</Typography>
                </Box>
              )}
              {taxReliefResults.grandparentCaregiverRelief > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Grandparent Caregiver Relief</Typography>
                  <Typography>{formatCurrency(taxReliefResults.grandparentCaregiverRelief)}</Typography>
                </Box>
              )}
              {taxReliefResults.qualifyingChildRelief > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Qualifying Child Relief</Typography>
                  <Typography>{formatCurrency(taxReliefResults.qualifyingChildRelief)}</Typography>
                </Box>
              )}
              {taxReliefResults.qualifyingChildReliefDisability > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Qualifying Child Relief (Disability)</Typography>
                  <Typography>{formatCurrency(taxReliefResults.qualifyingChildReliefDisability)}</Typography>
                </Box>
              )}
              {workingMothersChildRelief.enabled && taxReliefResults.workingMothersChildRelief > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Working Mother's Child Relief</Typography>
                  <Typography>{formatCurrency(taxReliefResults.workingMothersChildRelief)}</Typography>
                </Box>
              )}
              {taxReliefResults.srsContributionRelief > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>SRS Contribution Relief</Typography>
                  <Typography>{formatCurrency(taxReliefResults.srsContributionRelief)}</Typography>
                </Box>
              )}
              {taxReliefResults.lifeInsuranceRelief > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Life Insurance Relief</Typography>
                  <Typography>{formatCurrency(taxReliefResults.lifeInsuranceRelief)}</Typography>
                </Box>
              )}
              {courseFeesRelief.enabled && courseFeesRelief.amount && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Course Fees Relief</Typography>
                  <Typography>{formatCurrency(parseFloat(courseFeesRelief.amount))}</Typography>
                </Box>
              )}
              {fdwlRelief.enabled && fdwlRelief.amount && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Foreign Domestic Worker Levy Relief</Typography>
                  <Typography>{formatCurrency(parseFloat(fdwlRelief.amount))}</Typography>
                </Box>
              )}
              <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }}>
                {taxReliefResults.totalReliefs == MAX_TAX_RELIEF && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Total Eligible Reliefs</Typography>
                      <Typography>{formatCurrency(taxReliefResults.rawTotalReliefs)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Tax Relief Limit</Typography>
                      <Typography>{formatCurrency(MAX_TAX_RELIEF)}</Typography>
                    </Box>
                    <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }} />
                  </>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total Tax Reliefs</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{formatCurrency(Math.min(taxReliefResults.totalReliefs, MAX_TAX_RELIEF))}</Typography>
                </Box>
              </Box>
            </Box>
          )}
      </Box>
      </Grid>
      </Grid>

          {/* Add margin/padding between sections */}
          <Box sx={{ mb: 3 }} />
      
      </CardContent>
    </Card>
  );
};