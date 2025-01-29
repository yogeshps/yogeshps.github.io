/**************************************************************
 * Table 5: SPR 2nd year (F/G) from 1 Jan 2025
 * -------------------------------------------
 * Age brackets per the PDF:
 *   1) "55_below"     => 55 & below
 *   2) "55to60"       => above 55 to 60
 *   3) "60to65"       => above 60 to 65
 *   4) "65to70"       => above 65 to 70
 *   5) "70above"      => above 70
 *
 * Wage brackets:
 *   1) "0_50"     => TW ≤ 50  (Nil)
 *   2) "50_500"   => 50 < TW ≤ 500
 *   3) "500_750"  => 500 < TW ≤ 750 (partial bracket)
 *   4) "750_up"   => TW > 750 (full bracket, plus monthly Max)
 *
 * The table shows a "Full" employer portion (like Table1),
 * and a "Graduated" employee portion. We store these as
 * partial bracket formulas or simple percentages.
 **************************************************************/

/** The data structure for monthly OW rates in Table 5. */
export const TABLE5_2025 = {
    // ============= 55 & below =============
    '55_below': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
        awTotalPct: 32,
        awEmpPct:   15
      },
      '50_500': {
        // 17% (TW) all employer
        totalPct: 17,
        empPct: 0,
        awTotalPct: 32,
        awEmpPct:   15
      },
      '500_750': {
        // 17%(TW) + 0.45*(TW - 500), emp=0.45*(TW-500)
        totalFormula: (TW: number) => 0.17 * TW + 0.45 * (TW - 500),
        empFormula:   (TW: number) => 0.45 * (TW - 500),
        awTotalPct:   32,
        awEmpPct:     15
      },
      '750_up': {
        // 32% total, 15% emp
        // Max total: $2,368, max emp: $1,110
        totalOWPct: 32,
        empOWPct:   15,
        maxTotalOW: 2368,
        maxEmpOW:   1110,
  
        awTotalPct: 32,
        awEmpPct:   15
      }
    },
  
    // ============= 55to60 =============
    '55to60': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
        awTotalPct: 28,
        awEmpPct:   12.5
      },
      '50_500': {
        // 15.5% (TW)
        totalPct: 15.5,
        empPct: 0,
        awTotalPct: 28,
        awEmpPct:   12.5
      },
      '500_750': {
        // 15.5%(TW) + 0.375*(TW-500), employee=0.375*(TW-500)
        totalFormula: (TW: number) => 0.155 * TW + 0.375 * (TW - 500),
        empFormula:   (TW: number) => 0.375 * (TW - 500),
        awTotalPct:   28,
        awEmpPct:     12.5
      },
      '750_up': {
        // 28% total, 12.5% emp
        // Max total: $2,072, max emp: $925
        totalOWPct: 28,
        empOWPct:   12.5,
        maxTotalOW: 2072,
        maxEmpOW:   925,
  
        awTotalPct: 28,
        awEmpPct:   12.5
      }
    },
  
    // ============= 60to65 =============
    '60to65': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
        awTotalPct: 19.5,
        awEmpPct:   7.5
      },
      '50_500': {
        totalPct: 12,
        empPct: 0,
        awTotalPct: 19.5,
        awEmpPct:   7.5
      },
      '500_750': {
        // 12%(TW) + 0.225*(TW-500)
        totalFormula: (TW: number) => 0.12 * TW + 0.225 * (TW - 500),
        empFormula:   (TW: number) => 0.225 * (TW - 500),
        awTotalPct:   19.5,
        awEmpPct:     7.5
      },
      '750_up': {
        // 19.5% total, 7.5% emp
        // Max total: $1,443, max emp: $555
        totalOWPct: 19.5,
        empOWPct:   7.5,
        maxTotalOW: 1443,
        maxEmpOW:   555,
  
        awTotalPct: 19.5,
        awEmpPct:   7.5
      }
    },
  
    // ============= 65to70 =============
    '65to70': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
        awTotalPct: 14,
        awEmpPct:   5
      },
      '50_500': {
        totalPct: 9,
        empPct: 0,
        awTotalPct: 14,
        awEmpPct:   5
      },
      '500_750': {
        // 9%(TW) + 0.15*(TW-500)
        totalFormula: (TW: number) => 0.09 * TW + 0.15 * (TW - 500),
        empFormula:   (TW: number) => 0.15 * (TW - 500),
        awTotalPct:   14,
        awEmpPct:     5
      },
      '750_up': {
        // 14% total, 5% emp
        // Max total: $1,036, max emp: $370
        totalOWPct: 14,
        empOWPct:   5,
        maxTotalOW: 1036,
        maxEmpOW:   370,
  
        awTotalPct: 14,
        awEmpPct:   5
      }
    },
  
    // ============= 70above =============
    '70above': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
        awTotalPct: 12.5,
        awEmpPct:   5
      },
      '50_500': {
        totalPct: 7.5,
        empPct: 0,
        awTotalPct: 12.5,
        awEmpPct:   5
      },
      '500_750': {
        // 7.5%(TW) + 0.15*(TW-500)
        totalFormula: (TW: number) => 0.075 * TW + 0.15 * (TW - 500),
        empFormula:   (TW: number) => 0.15 * (TW - 500),
        awTotalPct:   12.5,
        awEmpPct:     5
      },
      '750_up': {
        // 12.5% total, 5% emp
        // Max total: $925, max emp: $370
        totalOWPct: 12.5,
        empOWPct:   5,
        maxTotalOW: 925,
        maxEmpOW:   370,
  
        awTotalPct: 12.5,
        awEmpPct:   5
      }
    }
  } as const;
  
  
  /** Determine the age key. */
  export function getAgeKeyForTable5(age: number): keyof typeof TABLE5_2025 {
    if (age <= 55)  return '55_below';
    if (age <= 60)  return '55to60';
    if (age <= 65)  return '60to65';
    if (age <= 70)  return '65to70';
    return '70above';
  }
  
  /** Identify the wage bracket (0-50, 50-500, 500-750, 750_up). */
  function getWageBracket(tw: number): '0_50' | '50_500' | '500_750' | '750_up' {
    if (tw <= 50)   return '0_50';
    if (tw <= 500)  return '50_500';
    if (tw <= 750)  return '500_750';
    return '750_up';
  }
  
  /** Round to nearest dollar. */
  function roundToNearestDollar(x: number): number {
    const cents = x - Math.floor(x);
    return cents >= 0.5 ? Math.ceil(x) : Math.floor(x);
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
  
  /**************************************************************
   * computeMonthlyCpfTable5(monthlyOW, age)
   *  For SPR 2nd year (F/G) from Table 5 (2025).
   *
   *  1) Caps monthlyOW at $7,400
   *  2) Picks bracket
   *  3) Applies partial formula or full rate
   *  4) Enforces "max" total/employee
   *  5) Returns {empCPF, erCPF, totalCPF, rawEmp, rawTotal}
   **************************************************************/
  export function computeMonthlyCpfTable5(
    monthlyOW: number,
    age: number
  ): CpfCalculationResult {
    // 1) Cap at 7,400
    const owCapped = Math.min(monthlyOW, 7400);
  
    // 2) Bracket
    const bracketKey = getWageBracket(owCapped);
    const ageKey     = getAgeKeyForTable5(age);
    const bracketData = TABLE5_2025[ageKey][bracketKey];
  
    // 3) If "totalPct" => simple
    if ('totalPct' in bracketData && bracketData.totalPct !== undefined) {
      const totalPct = bracketData.totalPct / 100;
      const empPct   = (bracketData.empPct ?? 0) / 100;
      const rawTotal = totalPct * owCapped;
      const rawEmp   = empPct   * owCapped;
  
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
  
    // 4) If partial bracket => { totalFormula, empFormula }
    if ('totalFormula' in bracketData && bracketData.totalFormula) {
      const totalRaw = bracketData.totalFormula(owCapped);
      const empRaw   = bracketData.empFormula(owCapped);
  
      let total = roundToNearestDollar(totalRaw);
      let emp   = roundToNearestDollar(empRaw);
      let er    = total - emp;
      if (er < 0) er = 0;
  
      // Compute effective percentages
      const effectiveTotalPct = owCapped > 0 ? (total / owCapped) * 100 : 0;
      const effectiveEmpPct   = owCapped > 0 ? (emp   / owCapped) * 100 : 0;
  
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
  
    // 5) If full bracket => { totalOWPct, empOWPct, maxTotalOW, maxEmpOW }
    if ('totalOWPct' in bracketData && bracketData.totalOWPct !== undefined) {
      const totalPct = bracketData.totalOWPct / 100;
      const empPct   = bracketData.empOWPct   / 100;
      const maxTotal = bracketData.maxTotalOW;
      const maxEmp   = bracketData.maxEmpOW;
  
      const rawTotal = totalPct * owCapped;
      const rawEmp   = empPct   * owCapped;
  
      let total = roundToNearestDollar(rawTotal);
      let emp   = roundToNearestDollar(rawEmp);
  
      // Enforce monthly max
      if (maxTotal && total > maxTotal) {
        total = maxTotal;
      }
      if (maxEmp && emp > maxEmp) {
        emp = maxEmp;
      }
  
      let er = total - emp;
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
  
  export function getSalaryKeyForTable5(
    monthlyWage: number
  ): '0_50' | '50_500' | '500_750' | '750_up' {
    if (monthlyWage <= 50)    return '0_50';
    if (monthlyWage <= 500)   return '50_500';
    if (monthlyWage <= 750)   return '500_750';
    return '750_up';
  }
  