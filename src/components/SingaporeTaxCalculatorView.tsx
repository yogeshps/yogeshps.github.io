import React, { useState } from 'react';
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
  FormControl
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { MAX_SRS_CONTRIBUTION_EP, MAX_SRS_CONTRIBUTION_CITIZEN_PR } from '../utils/constants';

interface CpfTopUp {
  enabled: boolean;
  self: boolean;
  family: boolean;
  selfAmount: string;
  familyAmount: string;
}

interface ParentRelief {
  enabled: boolean;
  dependants: string;
  stayTypes: ("with" | "without")[];
}

interface IncomeSources {
  employment: boolean;
  pension: boolean;
  trade: boolean;
  rental: boolean;
  royalties: boolean;
}

interface RsuCycle {
  shares: string;
  vestingPrice: string;
  expanded: boolean;
}

interface EsopCycle {
  shares: string;
  exercisePrice: string;
  vestingPrice: string;
  expanded: boolean;
}

interface SiblingRelief {
  enabled: boolean;
  dependants: string;
}

interface TaxReliefResult {
  earnedIncomeRelief: number;
  earnedIncomeReliefDisability: number;
  cpfRelief: number;
  cpfTopUpRelief: number;
  nsmanRelief: number;
  totalReliefs: number;
  spouseRelief: number;
  parentRelief: number;
  parentDisabilityRelief: number;
  siblingDisabilityRelief: number;
  grandparentCaregiverRelief: number;
  qualifyingChildRelief: number;
  qualifyingChildReliefDisability: number;
  workingMothersChildRelief: number;
  srsContributionRelief: number;
}

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
    employeeMonthlyCPF: number;
    employeeAnnualCPF: number;
    employeeBonusCPF: number;
    totalEmployeeCPF: number;
    employerMonthlyCPF: number;
    employerAnnualCPF: number;
    employerBonusCPF: number;
    totalEmployerCPF: number;
    totalTaxableIncome: number;
    annualTax: number;
    baseIncome: number;
  };
  taxReliefResults: TaxReliefResult;
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
  parentReliefDisability: {
    enabled: boolean;
    dependants: string;
    stayTypes: string[];
  };
  spouseRelief: {
    enabled: boolean;
    disability: boolean;
  };
  cpfTopUp: CpfTopUp;
  incomeSources: IncomeSources;
  rsuCycles: Array<RsuCycle>;
  esopCycles: Array<EsopCycle>;
  taxReliefs: {
    earnedIncomeRelief: boolean;
    earnedIncomeReliefDisability: boolean;
    cpfRelief: boolean;
  };
  cpfTopUpErrors: {
    selfAmount?: string;
    familyAmount?: string;
  };
  nsmanRelief: {
    enabled: boolean;
    general: boolean;
    key: boolean;
    wife: boolean;
    parent: boolean;
  };
  siblingRelief: SiblingRelief;
  handleSiblingReliefChange: (checked: boolean) => void;
  setSiblingRelief: React.Dispatch<React.SetStateAction<SiblingRelief>>;
  grandparentCaregiverRelief: {
    enabled: boolean;
    dependants: string;
  };
  handleGrandparentCaregiverReliefChange: (checked: boolean) => void;
  qualifyingChildRelief: {
    enabled: boolean;
    dependants: string;
  };
  setQualifyingChildRelief: React.Dispatch<React.SetStateAction<{ enabled: boolean; dependants: string }>>;
  qualifyingChildReliefDisability: {
    enabled: boolean;
    dependants: string;
  };
  setQualifyingChildReliefDisability: React.Dispatch<React.SetStateAction<{
    enabled: boolean;
    dependants: string;
  }>>;
  workingMothersChildRelief: {
    enabled: boolean;
    amount: string;
    error: string;
  };
  setWorkingMothersChildRelief: React.Dispatch<React.SetStateAction<{
    enabled: boolean;
    amount: string;
    error: string;
  }>>;
  srsContributionRelief: {
    enabled: boolean;
    amount: string;
    error: string;
  };
  setSrsContributionRelief: React.Dispatch<React.SetStateAction<{
    enabled: boolean;
    amount: string;
    error: string;
  }>>;
  // Handler functions
  handleClose: () => void;
  handlePopoverClick: (
    event: React.MouseEvent<HTMLButtonElement>,
    setAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>
  ) => void;
  setExtraInputs: (value: any) => void;
  handleSalaryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setInputs: (value: any) => void;
  handleParentReliefChange: (checked: boolean) => void;
  handleParentReliefDisabilityChange: (checked: boolean) => void;
  setParentRelief: (value: any) => void;
  setParentReliefDisability: (value: any) => void;
  handleIncomeSourceChange: (source: keyof IncomeSources) => void;
  handleRsuChange: (index: number, name: keyof RsuCycle, value: string) => void;
  handleEsopChange: (index: number, name: keyof EsopCycle, value: string) => void;
  addRsuCycle: () => void;
  addEsopCycle: () => void;
  toggleRsuExpanded: (index: number) => void;
  toggleEsopExpanded: (index: number) => void;
  formatCurrency: (amount: number) => string;
  setAgePopoverAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setResidencyPopoverAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setMonthlySalaryPopoverAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setAnnualSalaryPopoverAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setAnnualBonusPopoverAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  handleDisabilityReliefChange: (checked: boolean) => void;
  handleCpfTopUpChange: (checked: boolean) => void;
  setCpfTopUp: React.Dispatch<React.SetStateAction<CpfTopUp>>;
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
  handleParentStayTypeChange: (index: number, stayType: "with" | "without", isDisability: boolean) => void;
}

const POPOVER_MAX_WIDTH = '480px';

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
  parentReliefDisability,
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
  handleParentReliefDisabilityChange,
  setParentRelief,
  setParentReliefDisability,
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
  setWorkingMothersChildRelief
}) => {


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
              id="annual-salary"
              name="annualSalary"
              fullWidth
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
            id="annual-bonus"
            name="annualBonus"
            fullWidth
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
                  id="income-employment"
                  name="incomeEmployment"
                  checked={incomeSources.employment}
                  onChange={() => handleIncomeSourceChange('employment')}
                />
              }
              label="Salaried employment"
            />
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
                    id="earned-income-relief"
                    name="earnedIncomeRelief"
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
                      id="earned-income-relief-disability"
                      name="earnedIncomeReliefDisability"
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
                        setCpfTopUp(prev => ({
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
          {/* Error Message for Parent Relief */}
          {parentRelief.enabled && parentReliefDisability.enabled && 
            Number(parentRelief.dependants) + Number(parentReliefDisability.dependants) > 2 && (
            <Box sx={{ ml: 4, color: '#D84747' }}>
              <Typography sx={{ fontSize: '0.75rem' }}>
                Total of 2 dependants allowed for Parent Relief/Parent Relief (Disability).
              </Typography>
            </Box>
          )}
          {parentRelief.enabled && (
            <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography>How many dependants do you support?</Typography>
              <Select
                id="parent-relief-dependants"
                name="parentReliefDependants"
                size="small"
                value={parentRelief.dependants}
                onChange={(e) => setParentRelief((prev: ParentRelief) => ({
                  ...prev,
                  dependants: e.target.value
                }))}
                sx={{ width: '120px' }}
              >
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
              </Select>
              
              {/* Parent Relief Stay Type Selection */}
              {Array.from({ length: Number(parentRelief.dependants) }).map((_, index) => (
                <FormControl key={index}>
                  <Typography sx={{ fontWeight: 'bold' }}>Dependant {index + 1}</Typography>
                  <RadioGroup
                    name={`parent-relief-stay-${index}`}
                    value={parentRelief.stayTypes[index]}
                    onChange={(e) => {
                      const newStayTypes = [...parentRelief.stayTypes];
                      newStayTypes[index] = e.target.value as "with" | "without";
                      setParentRelief((prev: ParentRelief) => ({
                        ...prev,
                        stayTypes: newStayTypes
                      }));
                    }}
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
                </FormControl>
              ))}
            </Box>
          )}

          {/* Parent Relief (Disability) Section */}
          <FormControlLabel
            control={
              <Checkbox
                id="parent-relief-disability"
                name="parentReliefDisability"
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
                Total of 2 dependants allowed for Parent Relief/Parent Relief (Disability).
              </Typography>
            </Box>
          )}
          {parentReliefDisability.enabled && (
            <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1}}>
              <Typography>How many dependants with disabilities do you support?</Typography>
              <Select
                id="parent-relief-disability-dependants"
                name="parentReliefDisabilityDependants"
                size="small"
                value={parentReliefDisability.dependants}
                onChange={(e) => setParentReliefDisability((prev: ParentRelief) => ({
                  ...prev,
                  dependants: e.target.value
                }))}
                sx={{ width: '120px' }}
              >
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
              </Select>
              
              {/* Parent Relief Stay Type Selection */}
              {Array.from({ length: Number(parentReliefDisability.dependants) }).map((_, index) => (
                <FormControl key={index}>
                  <Typography sx={{ fontWeight: 'bold' }}>Dependant {index + 1}</Typography>
                  <RadioGroup
                    name={`parent-relief-disability-stay-${index}`}
                    value={parentReliefDisability.stayTypes[index]}
                    onChange={(e) => {
                      const newStayTypes = [...parentReliefDisability.stayTypes];
                      newStayTypes[index] = e.target.value as "with" | "without";
                      setParentReliefDisability((prev: ParentRelief) => ({
                        ...prev,
                        stayTypes: newStayTypes
                      }));
                    }}
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
                </FormControl>
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
                id="sibling-disability-relief-dependants"
                name="siblingDisabilityReliefDependants"
                size="small"
                value={siblingRelief.dependants}
                onChange={(e) => setSiblingRelief((prev: SiblingRelief) => ({
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
                  setQualifyingChildRelief(prev => ({
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
                value={qualifyingChildRelief.dependants}
                onChange={(e) => setQualifyingChildRelief(prev => ({
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

          {/* Qualifying Child Relief (Disability) Section */}
          <FormControlLabel
            control={
              <Checkbox
                id="qualifying-child-relief-disability"
                name="qualifyingChildReliefDisability"
                checked={qualifyingChildReliefDisability.enabled}
                onChange={(e) => {
                  setQualifyingChildReliefDisability(prev => ({
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
                value={qualifyingChildReliefDisability.dependants}
                onChange={(e) => setQualifyingChildReliefDisability(prev => ({
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

          {/* Working Mother's Child Relief Section */}
          <FormControlLabel
            control={
              <Checkbox
                id="working-mothers-child-relief"
                name="workingMothersChildRelief"
                checked={workingMothersChildRelief.enabled}
                onChange={(e) => {
                  setWorkingMothersChildRelief(prev => ({
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
                    setWorkingMothersChildRelief(prev => ({
                      ...prev,
                      amount: value
                    }));
                  }
                }}
                inputProps={{ 
                  inputMode: 'decimal',
                  pattern: '[0-9]*\.?[0-9]{0,2}'
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
                onChange={(e) => setSrsContributionRelief(prev => ({
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
                    ? MAX_SRS_CONTRIBUTION_EP 
                    : MAX_SRS_CONTRIBUTION_CITIZEN_PR;

                  if (value === '' || /^(\d*\.?\d{0,2}|\.\d{0,2})$/.test(value)) {
                    if (value === '' || isNaN(numericValue) || numericValue <= maxAmount) {
                      setSrsContributionRelief(prev => ({
                        ...prev,
                        amount: value,
                        error: ''
                      }));
                    } else {
                      setSrsContributionRelief(prev => ({
                        ...prev,
                        error: `Max contribution allowed is ${formatCurrency(maxAmount)}`
                      }));

                      // Clear the error after 5 seconds
                      setTimeout(() => {
                        setSrsContributionRelief(current => ({
                          ...current,
                          error: ''
                        }));
                      }, 4000);
                    }
                  }
                }}
                inputProps={{ 
                  inputMode: 'decimal',
                  pattern: '[0-9]*\.?[0-9]{0,2}'
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
                  <IconButton onClick={() => toggleRsuExpanded(idx)}>
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
                    id={`rsu-shares-${idx}`}
                    name={`rsuShares${idx}`}
                    fullWidth
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
                    id={`rsu-vesting-price-${idx}`}
                    name={`rsuVestingPrice${idx}`}
                    fullWidth
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
                  <IconButton onClick={() => toggleEsopExpanded(idx)}>
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
                    id={`esop-shares-${idx}`}
                    name={`esopShares${idx}`}
                    fullWidth
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
                    id={`esop-exercise-price-${idx}`}
                    name={`esopExercisePrice${idx}`}
                    fullWidth
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
                    id={`esop-vesting-price-${idx}`}
                    name={`esopVestingPrice${idx}`}
                    fullWidth
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
                {spouseRelief.disability ? 'Spouse Relief (Disability)' : 'Spouse Relief'}: {formatCurrency(taxReliefResults.spouseRelief)}
              </Typography>
            )}
            {taxReliefResults.parentRelief > 0 && (
              <Typography>
                Parent Relief: {formatCurrency(taxReliefResults.parentRelief)}
              </Typography>
            )}
            {taxReliefResults.parentDisabilityRelief > 0 && (
              <Typography>
                Parent Relief (Disability): {formatCurrency(taxReliefResults.parentDisabilityRelief)}
              </Typography>
            )}
            {taxReliefResults.siblingDisabilityRelief > 0 && (
              <Typography>
                Sibling Relief (Disability): {formatCurrency(taxReliefResults.siblingDisabilityRelief)}
              </Typography>
            )}
            {grandparentCaregiverRelief.enabled && taxReliefResults.grandparentCaregiverRelief > 0 && (
              <Typography>
                Grandparent Caregiver Relief: {formatCurrency(taxReliefResults.grandparentCaregiverRelief)}
              </Typography>
            )}
            {qualifyingChildRelief.enabled && taxReliefResults.qualifyingChildRelief > 0 && (
              <Typography>
                Qualifying Child Relief: {formatCurrency(taxReliefResults.qualifyingChildRelief)}
              </Typography>
            )}
            {qualifyingChildReliefDisability.enabled && taxReliefResults.qualifyingChildReliefDisability > 0 && (
              <Typography>
                Qualifying Child Relief (Disability): {formatCurrency(taxReliefResults.qualifyingChildReliefDisability)}
              </Typography>
            )}

            {/* After Qualifying Child Relief (Disability) display */}
            {workingMothersChildRelief.enabled && taxReliefResults.workingMothersChildRelief > 0 && (
              <Typography>
                Working Mother's Child Relief: {formatCurrency(taxReliefResults.workingMothersChildRelief)}
              </Typography>
            )}

            {taxReliefResults.srsContributionRelief > 0 && (
              <Typography>
                SRS Contribution Relief: {formatCurrency(taxReliefResults.srsContributionRelief)}
              </Typography>
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