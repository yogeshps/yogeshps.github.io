import { CHARITABLE_DEDUCTION_MULTIPLIER } from './constants';
import { TaxDeductionResult } from '../types/tax';
import { PARENTHOOD_TAX_REBATE } from './constants';
import { FLAT_DEDUCTION_PERCENTAGE } from './constants';

interface TaxDeductionInputs {
  charitableDeductions: {
    enabled: boolean;
    amount: string;
  };
  parenthoodTaxRebate: boolean;
  parenthoodTaxRebateType: string;
  parenthoodTaxRebateAmount: string;
  rentalIncomeDeductions: boolean;
  rentalDeductionType: 'flat' | 'actual';
  mortgageInterest: string;
  actualRentalExpenses: string;
  annualRentalIncome: string;
  employmentExpenseDeductions: boolean;
  employmentExpenseAmount: string;
}

export function calculateTaxDeductions({
  charitableDeductions,
  parenthoodTaxRebate,
  parenthoodTaxRebateType,
  parenthoodTaxRebateAmount,
  rentalIncomeDeductions,
  rentalDeductionType,
  mortgageInterest,
  actualRentalExpenses,
  annualRentalIncome,
  employmentExpenseDeductions,
  employmentExpenseAmount
}: TaxDeductionInputs): TaxDeductionResult {
  
  // Calculate Charitable Deductions
  let charitableDeductionsValue = 0;
  if (charitableDeductions.enabled && charitableDeductions.amount) {
    const baseAmount = Number(charitableDeductions.amount) || 0;
    charitableDeductionsValue = baseAmount * CHARITABLE_DEDUCTION_MULTIPLIER;
  }

  // Calculate Employment Expense Deductions
  let employmentExpenseDeductionsValue = 0;
  if (employmentExpenseDeductions && employmentExpenseAmount) {
    employmentExpenseDeductionsValue = Number(employmentExpenseAmount) || 0;
  }

  // Calculate Parenthood Tax Rebate
  let parenthoodTaxRebateValue = 0;
  if (parenthoodTaxRebate) {  // Only calculate if enabled
    switch (parenthoodTaxRebateType) {
      case 'first_child':
        parenthoodTaxRebateValue = PARENTHOOD_TAX_REBATE.FIRST_CHILD;
        break;
      case 'second_child':
        parenthoodTaxRebateValue = PARENTHOOD_TAX_REBATE.SECOND_CHILD;
        break;
      case 'third_child':
        parenthoodTaxRebateValue = PARENTHOOD_TAX_REBATE.THIRD_CHILD;
        break;
      case 'custom':
        parenthoodTaxRebateValue = parseFloat(parenthoodTaxRebateAmount || '0') || 0;
        break;
    }
  }

  // Calculate Rental Income Deductions
  let rentalIncomeDeductionsValue = 0;

  if (rentalIncomeDeductions) {  // Only calculate if enabled
    const mortgageInterestAmount = Number(mortgageInterest) || 0;
    const rentalIncome = Number(annualRentalIncome) || 0;

    if (rentalDeductionType === 'flat') {
      rentalIncomeDeductionsValue = (rentalIncome * FLAT_DEDUCTION_PERCENTAGE) + mortgageInterestAmount;
    } else {
      const actualExpenses = Number(actualRentalExpenses) || 0;
      rentalIncomeDeductionsValue = actualExpenses + mortgageInterestAmount;
    }
  }

  // Calculate total deductions
  const totalDeductions = 
    charitableDeductionsValue +
    parenthoodTaxRebateValue +
    rentalIncomeDeductionsValue +
    employmentExpenseDeductionsValue;

  return {
    charitableDeductions: charitableDeductionsValue,
    parenthoodTaxRebate: parenthoodTaxRebateValue,
    rentalIncomeDeductions: rentalIncomeDeductionsValue,
    employmentExpenseDeductions: employmentExpenseDeductionsValue,
    totalDeductions
  };
} 