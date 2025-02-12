import { PIT_REBATE_CAP } from "../utils/constants";

import { PIT_REBATE_PERCENTAGE } from "../utils/constants";

// Function to calculate income tax based on progressive tax brackets
export function calculateTax(annualIncome: number): number {
    const brackets = [
      { threshold: 20000,  rate: 0 },
      { threshold: 10000,  rate: 0.02 },
      { threshold: 10000,  rate: 0.035 },
      { threshold: 40000,  rate: 0.07 },
      { threshold: 40000,  rate: 0.115 },
      { threshold: 40000,  rate: 0.15 },
      { threshold: 40000,  rate: 0.18 },
      { threshold: 40000,  rate: 0.19 },
      { threshold: 40000,  rate: 0.195 },
      { threshold: 40000,  rate: 0.20 },
      { threshold: 180000, rate: 0.22 },
      { threshold: 500000, rate: 0.23 },
      { threshold: Infinity, rate: 0.24 }
    ];
  
    let remaining = annualIncome;
    let totalTax = 0;
    for (const bracket of brackets) {
      if (remaining <= 0) break;
      const taxableAmount = Math.min(remaining, bracket.threshold);
      totalTax += taxableAmount * bracket.rate;
      remaining -= bracket.threshold;
    }

    // Round tax to nearest dollar before applying rebate (IRAS convention)
    totalTax = Math.floor(totalTax + 0.5);

    // Calculate PIT Rebate for YA2024
    const rebateAmount = Math.min(totalTax * PIT_REBATE_PERCENTAGE, PIT_REBATE_CAP);
    return totalTax - rebateAmount;
}