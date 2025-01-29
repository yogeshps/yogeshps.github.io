/***********************************************************
 * Table 4: 1st-year SPR (F/G) from 1 Jan 2025
 * -------------------------------------------
 * Age brackets (from the PDF):
 *   1) "55_below"     => 55 & below
 *   2) "55to60"       => above 55 to 60
 *   3) "60to65"       => above 60 to 65
 *   4) "65to70"       => above 65 to 70
 *   5) "70above"      => above 70
 *
 * Wage brackets:
 *   "0_50"    => TW ≤ 50
 *   "50_500"  => 50 < TW ≤ 500
 *   "500_750" => 500 < TW ≤ 750
 *   "750_up"  => TW > 750
 *
 * For each bracket, Table 4 shows:
 *  - A "full" employer rate (like Table 1)
 *  - A "graduated" employee rate (some partial or smaller share)
 *  - Also a "Max. of ..." for total monthly CPF and employee portion.
 ***********************************************************/

/** The data structure for Table 4's monthly OW logic. */
export const TABLE4_2025 = {
    // ============= 55 & below =============
    '55_below': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
        awTotalPct: 22,
        awEmpPct: 5
      },
      '50_500': {
        // e.g. 17% all employer
        totalPct: 17,
        empPct: 0,
        awTotalPct: 22,
        awEmpPct: 5
      },
      '500_750': {
        // 17%(TW) + 0.15*(TW-500); employee=0.15*(TW-500)
        totalFormula: (TW: number) => 0.17 * TW + 0.15 * (TW - 500),
        empFormula:   (TW: number) => 0.15 * (TW - 500),
        awTotalPct:   22,
        awEmpPct:     5
      },
      '750_up': {
        // >$750 => 22% total, 5% emp
        // Max total: $1,628, max emp: $370
        totalOWPct: 22,
        empOWPct:   5,
        maxTotalOW: 1628,
        maxEmpOW:   370,
  
        awTotalPct: 22,
        awEmpPct:   5
      }
    },
  
    // ============= 55–60 =============
    '55to60': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
        awTotalPct: 20.5,
        awEmpPct:   5
      },
      '50_500': {
        // e.g. 15.5%
        totalPct: 15.5,
        empPct: 0,
        awTotalPct: 20.5,
        awEmpPct:   5
      },
      '500_750': {
        // 15.5%(TW) + 0.15*(TW-500); emp=0.15*(TW-500)
        totalFormula: (TW: number) => 0.155 * TW + 0.15 * (TW - 500),
        empFormula:   (TW: number) => 0.15 * (TW - 500),
        awTotalPct:   20.5,
        awEmpPct:     5
      },
      '750_up': {
        // 20.5% total, 5% employee
        // Max total: $1,517, max emp: $370
        totalOWPct: 20.5,
        empOWPct:   5,
        maxTotalOW: 1517,
        maxEmpOW:   370,
  
        awTotalPct: 20.5,
        awEmpPct:   5
      }
    },
  
    // ============= 60–65 =============
    '60to65': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
        awTotalPct: 17,
        awEmpPct:   5
      },
      '50_500': {
        // 12%
        totalPct: 12,
        empPct: 0,
        awTotalPct: 17,
        awEmpPct:   5
      },
      '500_750': {
        // 12%(TW) + 0.15*(TW-500)
        totalFormula: (TW: number) => 0.12 * TW + 0.15 * (TW - 500),
        empFormula:   (TW: number) => 0.15 * (TW - 500),
        awTotalPct:   17,
        awEmpPct:     5
      },
      '750_up': {
        // 17% total, 5% emp
        // Max total: $1,258, max emp: $370
        totalOWPct: 17,
        empOWPct:   5,
        maxTotalOW: 1258,
        maxEmpOW:   370,
  
        awTotalPct: 17,
        awEmpPct:   5
      }
    },
  
    // ============= 65–70 =============
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
        // 14% total, 5% employee
        // Max total: $1,036, max emp: $370
        totalOWPct: 14,
        empOWPct:   5,
        maxTotalOW: 1036,
        maxEmpOW:   370,
  
        awTotalPct: 14,
        awEmpPct:   5
      }
    },
  
    // ============= 70 above =============
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
        // 12.5% total, 5% employee
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
  
  
  /** Helper: pick the correct age key for Table 4. */
  export function getAgeKeyForTable4(age: number): keyof typeof TABLE4_2025 {
    if (age <= 55)  return '55_below';
    if (age <= 60)  return '55to60';
    if (age <= 65)  return '60to65';
    if (age <= 70)  return '65to70';
    return '70above';
  }
  
  /** Identify the wage bracket from total monthly wages. */
  function getWageBracket(tw: number): '0_50' | '50_500' | '500_750' | '750_up' {
    if (tw <= 50)    return '0_50';
    if (tw <= 500)   return '50_500';
    if (tw <= 750)   return '500_750';
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
   * computeMonthlyCpfTable4(monthlyOW, age)
   *  - For 1st-year SPR (F/G) from Table 4 (2025)
   *  - Caps monthlyOW at $7,400
   *  - Looks up partial bracket or full bracket
   *  - Applies "max" constraints
   *  - Returns { empCPF, erCPF, totalCPF, rawEmp, rawTotal }
   **************************************************************/
  export function computeMonthlyCpfTable4(
    monthlyOW: number,
    age: number
  ): CpfCalculationResult {
    // 1) Cap at 7400
    const cappedOW = Math.min(monthlyOW, 7400);
  
    // 2) Determine bracket
    const bracket = getWageBracket(cappedOW);
    const ageKey  = getAgeKeyForTable4(age);
    const bracketData = TABLE4_2025[ageKey][bracket];
  
    // 3) Apply logic
    // (A) If { totalPct, empPct } => straightforward
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
  
    // (B) If { totalFormula, empFormula } => partial bracket
    if ('totalFormula' in bracketData && bracketData.totalFormula) {
      const totalRaw = bracketData.totalFormula(cappedOW);
      const empRaw   = bracketData.empFormula(cappedOW);
  
      let total = roundToNearestDollar(totalRaw);
      let emp   = roundToNearestDollar(empRaw);
      let er    = Math.max(total - emp, 0);
  
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
  
    // (C) If { totalOWPct, empOWPct, maxTotalOW, maxEmpOW } => full bracket
    if ('totalOWPct' in bracketData && bracketData.totalOWPct !== undefined) {
      const tPct = bracketData.totalOWPct / 100;
      const ePct = bracketData.empOWPct   / 100;
      const maxTotal = bracketData.maxTotalOW;
      const maxEmp   = bracketData.maxEmpOW;
  
      const rawTotal = tPct * cappedOW;
      const rawEmp   = ePct * cappedOW;
  
      let total = roundToNearestDollar(rawTotal);
      let emp   = roundToNearestDollar(rawEmp);
  
      // Enforce monthly max from the table
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
      erCPF:  0,
      totalCPF: 0,
      totalPct: 0,
      empPct: 0,
      rawEmp: 0,
      rawTotal:0
    };
  }
  
  export function getSalaryKeyForTable4(
    monthlyWage: number
  ): '0_50' | '50_500' | '500_750' | '750_up' {
    if (monthlyWage <= 50)    return '0_50';
    if (monthlyWage <= 500)   return '50_500';
    if (monthlyWage <= 750)   return '500_750';
    return '750_up';
  }
  