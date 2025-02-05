import { CHARITABLE_DEDUCTION_MULTIPLIER } from './constants';
import { TaxDeductions, TaxDeductionResult } from '../types/tax';
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
  const mortgageInterestAmount = Number(mortgageInterest) || 0; // Always consider mortgage interest

  if (rentalIncomeDeductions) {
    const rentalIncome = Number(annualRentalIncome) || 0;

    if (rentalDeductionType === 'flat') {
      // Use the constant for flat deduction
      rentalIncomeDeductionsValue = (rentalIncome * FLAT_DEDUCTION_PERCENTAGE) + mortgageInterestAmount;
    } else {
      // Actual expenses + mortgage interest
      const actualExpenses = Number(actualRentalExpenses) || 0;
      rentalIncomeDeductionsValue = actualExpenses + mortgageInterestAmount;
    }
  } else {
    // If rental income deductions are not selected, still consider mortgage interest
    rentalIncomeDeductionsValue = mortgageInterestAmount;
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