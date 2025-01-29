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
   *  1) Caps monthlyOW at 7,400
   *  2) Looks up the bracket
   *  3) Applies formula or % with monthly max
   *  4) Returns { empCPF, erCPF, totalCPF, rawEmp, rawTotal }
   ********************************************************/
  export function computeMonthlyCpfTable3(
    monthlyOW: number,
    age: number
  ): CpfCalculationResult {
    // 1) Cap at $7,400
    const cappedOW = Math.min(monthlyOW, 7400);
  
    // 2) Determine bracket
    const bracketKey = getWageBracket(cappedOW);
    const ageKey     = getAgeKeyForTable3(age);
    const bracketData = TABLE3_2025[ageKey][bracketKey];
  
    // 3) Apply logic
    // (A) If it's { totalPct, empPct } => simple
    if ('totalPct' in bracketData && bracketData.totalPct !== undefined) {
      const totalPct = bracketData.totalPct / 100;
      const empPct   = (bracketData.empPct ?? 0) / 100;
      const rawTotal = totalPct * cappedOW;
      const rawEmp   = empPct   * cappedOW;
  
      let total = roundToNearestDollar(rawTotal);
      let emp   = roundToNearestDollar(rawEmp);
      let er    = total - emp;
      if (er < 0) er = 0;
  
      return {
        empCPF: emp,
        erCPF:  er,
        totalCPF: total,
        totalPct: totalPct || 0,
        empPct: empPct || 0,
        rawEmp,
        rawTotal
      };
    }
  
    // (B) If it's { totalFormula, empFormula } => partial bracket
    if ('totalFormula' in bracketData && bracketData.totalFormula) {
      const totalRaw = bracketData.totalFormula(cappedOW);
      const empRaw   = bracketData.empFormula(cappedOW);
  
      let total = roundToNearestDollar(totalRaw);
      let emp   = roundToNearestDollar(empRaw);
      let er    = total - emp;
      if (er < 0) er = 0;
  
      // Compute effective percentages
      const effectiveTotalPct = cappedOW > 0 ? (total / cappedOW) * 100 : 0;
      const effectiveEmpPct   = cappedOW > 0 ? (emp   / cappedOW) * 100 : 0;
  
      return {
        empCPF: emp,
        erCPF:  er,
        totalCPF: total,
        totalPct: effectiveTotalPct,
        empPct: effectiveEmpPct,
        rawEmp: empRaw,
        rawTotal: totalRaw
      };
    }
  
    // (C) If it's { totalOWPct, empOWPct, maxTotalOW, maxEmpOW } => full bracket
    if ('totalOWPct' in bracketData && bracketData.totalOWPct !== undefined) {
      const tPct = bracketData.totalOWPct / 100;
      const ePct = bracketData.empOWPct   / 100;
      const maxTotal = bracketData.maxTotalOW;
      const maxEmp   = bracketData.maxEmpOW;
  
      const rawTotal = tPct * cappedOW;
      const rawEmp   = ePct * cappedOW;
  
      let total = roundToNearestDollar(rawTotal);
      let emp   = roundToNearestDollar(rawEmp);
  
      // enforce monthly max
      if (maxTotal && total > maxTotal) total = maxTotal;
      if (maxEmp   && emp   > maxEmp)   emp   = maxEmp;
  
      let er = total - emp;
      if (er < 0) er = 0;
  
      return {
        empCPF: emp,
        erCPF:  er,
        totalCPF: total,
        totalPct: tPct || 0,
        empPct: ePct || 0,
        rawEmp,
        rawTotal
      };
    }
  
    // fallback
    return {
      empCPF: 0,
      erCPF: 0,
      totalCPF: 0,
      totalPct: 0,
      empPct: 0,
      rawEmp: 0,
      rawTotal:0
    };
  }
  
  export function getSalaryKeyForTable3(
    monthlyWage: number
  ): '0_50' | '50_500' | '500_750' | '750_up' {
    if (monthlyWage <= 50)    return '0_50';
    if (monthlyWage <= 500)   return '50_500';
    if (monthlyWage <= 750)   return '500_750';
    return '750_up';
  }
  