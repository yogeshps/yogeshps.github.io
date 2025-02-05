import { CHARITABLE_DEDUCTION_MULTIPLIER } from './constants';
import { TaxDeductions, TaxDeductionResult } from '../types/tax';
import { PARENTHOOD_TAX_REBATE } from './constants';

interface TaxDeductionInputs {
  charitableDeductions: {
    enabled: boolean;
    amount: string;
  };
  parenthoodTaxRebate: boolean;
  parenthoodTaxRebateType: string;
  parenthoodTaxRebateAmount: string;
  rentalIncomeDeductions: boolean;
  employmentExpenseDeductions: boolean;
}

export function calculateTaxDeductions({
  charitableDeductions,
  parenthoodTaxRebate,
  parenthoodTaxRebateType,
  parenthoodTaxRebateAmount,
  rentalIncomeDeductions,
  employmentExpenseDeductions
}: TaxDeductionInputs): TaxDeductionResult {
  
  // Calculate Charitable Deductions
  let charitableDeductionsValue = 0;
  if (charitableDeductions.enabled && charitableDeductions.amount) {
    const baseAmount = Number(charitableDeductions.amount) || 0;
    charitableDeductionsValue = baseAmount * CHARITABLE_DEDUCTION_MULTIPLIER;
  }

  // Calculate Parenthood Tax Rebate
  let parenthoodTaxRebateValue = 0;
  if (parenthoodTaxRebate) {
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
  if (rentalIncomeDeductions) {
    // TODO: Implement logic for rental income deductions calculation
    rentalIncomeDeductionsValue = 0;
  }

  // Calculate Employment Expense Deductions
  let employmentExpenseDeductionsValue = 0;
  if (employmentExpenseDeductions) {
    // TODO: Implement logic for employment expense deductions calculation
    employmentExpenseDeductionsValue = 0;
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