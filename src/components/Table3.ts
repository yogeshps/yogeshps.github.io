/*************************************************************
 * Table 3: CPF rates for SPR (2nd year) under Graduated/Graduated (G/G)
 * from 1 Jan 2025
 *
 * Age brackets (per the PDF):
 *   1) "55_below"    => 55 & below
 *   2) "55to60"      => above 55 to 60
 *   3) "60to65"      => above 60 to 65
 *   4) "65above"     => above 65
 *
 * Wage brackets:
 *   - "0_50":     TW ≤ 50      => Nil
 *   - "50_500":   50 < TW ≤ 500
 *   - "500_750":  500 < TW ≤ 750 (partial bracket)
 *   - "750_up":   TW > 750     (full bracket, also "Max" monthly CPF)
 *************************************************************/

/**
 * The data structure stores partial bracket formulas
 * and full bracket percentages (with monthly maxima).
 */
export const TABLE3_2025 = {
    // ====================== 55 & below ======================
    '55_below': {
      '0_50': {
        // $50 or less => Nil
        totalPct: 0,
        empPct: 0,
        // AW rate (>\$750 rate) => 24% total, 15% emp
        awTotalPct: 24,
        awEmpPct:   15
      },
      '50_500': {
        // >$50 to $500 => 9%(TW), employee=0
        totalPct: 9,
        empPct: 0,
        // AW => 24/15
        awTotalPct: 24,
        awEmpPct:   15
      },
      '500_750': {
        // >$500–$750 => 9% * TW + 0.45 * (TW – 500)
        // employee = 0.45 * (TW – 500)
        totalFormula: (TW: number) => 0.09 * TW + 0.45 * (TW - 500),
        empFormula:   (TW: number) => 0.45 * (TW - 500),
        awTotalPct: 24,
        awEmpPct:   15
      },
      '750_up': {
        // >$750 => 24% total, 15% employee
        // Max total: $1,776, max emp: $1,110
        totalOWPct: 24,
        empOWPct:   15,
        maxTotalOW: 1776,
        maxEmpOW:   1110,
  
        awTotalPct: 24,
        awEmpPct:   15
      }
    },
  
    // ====================== Above 55–60 ======================
    '55to60': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
        // AW => 18.5% total, 12.5% emp
        awTotalPct: 18.5,
        awEmpPct:   12.5
      },
      '50_500': {
        // e.g. 6% (TW), all employer
        totalPct: 6,
        empPct: 0,
        awTotalPct: 18.5,
        awEmpPct:   12.5
      },
      '500_750': {
        // 6%(TW) + 0.375*(TW - 500), employee=0.375*(TW-500)
        totalFormula: (TW: number) => 0.06 * TW + 0.375 * (TW - 500),
        empFormula:   (TW: number) => 0.375 * (TW - 500),
        awTotalPct:   18.5,
        awEmpPct:     12.5
      },
      '750_up': {
        // 18.5% total, 12.5% employee
        // Max total: $1,369, max emp: $925
        totalOWPct: 18.5,
        empOWPct:   12.5,
        maxTotalOW: 1369,
        maxEmpOW:   925,
  
        awTotalPct: 18.5,
        awEmpPct:   12.5
      }
    },
  
    // ====================== Above 60–65 ======================
    '60to65': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
        // AW => 11% total, 7.5% emp
        awTotalPct: 11,
        awEmpPct:   7.5
      },
      '50_500': {
        // 3.5%(TW), employee=0
        totalPct: 3.5,
        empPct: 0,
        awTotalPct: 11,
        awEmpPct:   7.5
      },
      '500_750': {
        // 3.5%(TW) + 0.225*(TW-500), employee=0.225*(TW-500)
        totalFormula: (TW: number) => 0.035 * TW + 0.225 * (TW - 500),
        empFormula:   (TW: number) => 0.225 * (TW - 500),
        awTotalPct: 11,
        awEmpPct:   7.5
      },
      '750_up': {
        // 11% total, 7.5% employee
        // Max total: $814, max emp: $555
        totalOWPct: 11,
        empOWPct:   7.5,
        maxTotalOW: 814,
        maxEmpOW:   555,
  
        awTotalPct: 11,
        awEmpPct:   7.5
      }
    },
  
    // ====================== Above 65 ======================
    '65above': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
        // AW => 8.5% total, 5% emp
        awTotalPct: 8.5,
        awEmpPct:   5
      },
      '50_500': {
        totalPct: 3.5,
        empPct: 0,
        awTotalPct: 8.5,
        awEmpPct:   5
      },
      '500_750': {
        // 3.5%(TW) + 0.15*(TW-500)
        totalFormula: (TW: number) => 0.035 * TW + 0.15 * (TW - 500),
        empFormula:   (TW: number) => 0.15 * (TW - 500),
        awTotalPct: 8.5,
        awEmpPct:   5
      },
      '750_up': {
        // 8.5% total, 5% employee
        // Max total: $629, max emp: $370
        totalOWPct: 8.5,
        empOWPct:   5,
        maxTotalOW: 629,
        maxEmpOW:   370,
  
        awTotalPct: 8.5,
        awEmpPct:   5
      }
    }
  } as const;
  
  
  /** Age key logic. */
  export function getAgeKeyForTable3(age: number): keyof typeof TABLE3_2025 {
    if (age <= 55)  return '55_below';
    if (age <= 60)  return '55to60';
    if (age <= 65)  return '60to65';
    return '65above';
  }
  
  /** Wage bracket logic. */
  function getWageBracket(tw: number): '0_50' | '50_500' | '500_750' | '750_up' {
    if (tw <= 50)   return '0_50';
    if (tw <= 500)  return '50_500';
    if (tw <= 750)  return '500_750';
    return '750_up';
  }
  
  /** Round to nearest dollar. */
  function roundToNearestDollar(val: number) {
    const decimals = val - Math.floor(val);
    return decimals >= 0.5 ? Math.ceil(val) : Math.floor(val);
  }
  
  // Define the return type
  interface CpfCalculationResult {
    empCPF: number;
    erCPF: number;
    totalCPF: number;
    totalPct: number;
    empPct: number;
    rawEmp: number;
    rawTotal: number;
  }
  
  /********************************************************
   * computeMonthlyCpfTable3(monthlyOW, age)
   *  For SPR 2nd year, G/G rates, Table 3 (2025).
   *  1) Caps monthlyOW at 8,000
   *  2) Looks up the bracket
   *  3) Applies formula or % with monthly max
   *  4) Returns { empCPF, erCPF, totalCPF, rawEmp, rawTotal }
   ********************************************************/
  export function computeMonthlyCpfTable3(
    monthlyOW: number,
    age: number
  ): CpfCalculationResult {
    // Cap OW at 8000
    const owCapped = Math.min(monthlyOW, 8000);
    
    const bracketKey = getWageBracket(owCapped);
    const ageKey = getAgeKeyForTable3(age);
    const bracketObj = TABLE3_2025[ageKey][bracketKey] as BracketData;
  
    // For wages <= $50, no CPF
    if (owCapped <= 50) {
      return {
        empCPF: 0,
        erCPF: 0,
        totalCPF: 0,
        totalPct: 0,
        empPct: 0,
        rawEmp: 0,
        rawTotal: 0
      };
    }
  
    // If employer-only contribution (50-500 bracket)
    if ('totalPct' in bracketObj && bracketObj.empPct === 0) {
      const rawTotal = (bracketObj.totalPct! / 100) * owCapped;
      const total = roundToNearestDollar(rawTotal);
  
      return {
        empCPF: 0,
        erCPF: total,
        totalCPF: total,
        totalPct: bracketObj.totalPct! / 100,
        empPct: 0,
        rawEmp: 0,
        rawTotal
      };
    }
  
    // If graduated formula (500-750 bracket)
    if ('totalFormula' in bracketObj && bracketObj.totalFormula !== undefined) {
      const rawTotal = bracketObj.totalFormula(owCapped);
      const rawEmp = bracketObj.empFormula ? bracketObj.empFormula(owCapped) : 0;
  
      // 1. Round total first
      const total = roundToNearestDollar(rawTotal);
      // 2. Floor employee contribution
      const emp = Math.floor(rawEmp);
      // 3. Calculate employer portion as difference
      const er = Math.max(0, total - emp);
  
      return {
        empCPF: emp,
        erCPF: er,
        totalCPF: total,
        totalPct: (rawTotal / owCapped) || 0,
        empPct: (rawEmp / owCapped) || 0,
        rawEmp,
        rawTotal
      };
    }
  
    // If percentage rates (>$750 bracket)
    if ('totalOWPct' in bracketObj && bracketObj.totalOWPct !== undefined) {
      const totalPct = bracketObj.totalOWPct! / 100;
      const empPct = bracketObj.empOWPct! / 100;
      const maxTotal = bracketObj.maxTotalOW!;
      const maxEmp = bracketObj.maxEmpOW!;
  
      const rawTotal = totalPct * owCapped;
      const rawEmp = empPct * owCapped;
  
      // 1. Round total first
      let total = roundToNearestDollar(rawTotal);
      // 2. Floor employee contribution
      let emp = Math.floor(rawEmp);
  
      // Apply monthly maximums if specified
      if (maxTotal && total > maxTotal) {
        total = maxTotal;
      }
      if (maxEmp && emp > maxEmp) {
        emp = maxEmp;
      }
  
      // 3. Calculate employer portion as difference
      const er = Math.max(0, total - emp);
  
      return {
        empCPF: emp,
        erCPF: er,
        totalCPF: total,
        totalPct: totalPct || 0,
        empPct: empPct || 0,
        rawEmp,
        rawTotal
      };
    }
  
    // fallback if bracket not found
    return {
      empCPF: 0,
      erCPF: 0,
      totalCPF: 0,
      totalPct: 0,
      empPct: 0,
      rawEmp: 0,
      rawTotal: 0
    };
  }
  
  interface BracketData {
    totalFormula?: (TW: number) => number;
    empFormula?: (TW: number) => number;
    totalPct?: number;
    empPct?: number;
    totalOWPct?: number;
    empOWPct?: number;
    maxTotalOW?: number;
    maxEmpOW?: number;
    awTotalPct?: number;
    awEmpPct?: number;
  }
  
  export function getSalaryKeyForTable3(
    monthlyWage: number
  ): '0_50' | '50_500' | '500_750' | '750_up' {
    if (monthlyWage <= 50)    return '0_50';
    if (monthlyWage <= 500)   return '50_500';
    if (monthlyWage <= 750)   return '500_750';
    return '750_up';
  }
  