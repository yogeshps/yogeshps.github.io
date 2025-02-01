/***********************************************************
 * Table 2 (1st-year SPR, G/G) from 1 Jan 2025
 * Age brackets per the PDF:
 *   1)  "55_below"    (actually "55 & below")
 *   2)  "55to60"      (above 55 to 60)
 *   3)  "60to65"      (above 60 to 65)
 *   4)  "65above"     (above 65) -- covers all older ages
 *
 * Wage brackets:
 *   '0_50'   => TW ≤ 50
 *   '50_500' => 50 < TW ≤ 500
 *   '500_750'=> 500 < TW ≤ 750
 *   '750_up' => TW > 750
 *
 * We define partial bracket formulas EXACTLY as shown in Table 2:
 * e.g. for "55 & below", >$500–$750 => 4%(TW) + 0.15*(TW-500).
 *
 * Max monthly amounts for the >$750 bracket are from the table:
 *   e.g. "Max. of $666 total" and "Max. of $370" for employee.
 ***********************************************************/
export const TABLE2_2025 = {
    // ===================== 55 & below =====================
    '55_below': {
      '0_50': {
        // $50 or less => Nil
        totalPct: 0,
        empPct: 0,
        // AW => 9% total, 5% employee
        awTotalPct: 9,
        awEmpPct:   5
      },
      '50_500': {
        // > $50 to $500 => 4% (TW), employee=0
        totalPct: 4,
        empPct: 0,
        awTotalPct: 9,
        awEmpPct:   5
      },
      '500_750': {
        // 4%(TW) + 0.15*(TW-500), employee=0.15*(TW-500)
        totalFormula: (TW: number) => 0.04 * TW + 0.15 * (TW - 500),
        empFormula:   (TW: number) => 0.15 * (TW - 500),
        awTotalPct: 9,
        awEmpPct:   5
      },
      '750_up': {
        // >$750 => 9% total, 5% employee
        // max total: $666, max emp: $370 (from official table)
        totalOWPct: 9,
        empOWPct:   5,
        maxTotalOW: 666,
        maxEmpOW: 370,
        awTotalPct: 9,
        awEmpPct:   5
      }
    },
  
    // ===================== Above 55–60 =====================
    '55to60': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
        awTotalPct: 9,
        awEmpPct:   5
      },
      '50_500': {
        // doc: 4% (TW) for >50–500 
        // (Some references show same as 55_below. Adjust if your official doc differs.)
        totalPct: 4,
        empPct: 0,
        awTotalPct: 9,
        awEmpPct:   5
      },
      '500_750': {
        // 4%*TW + 0.15*(TW-500), employee=0.15*(TW-500)
        totalFormula: (TW: number) => 0.04 * TW + 0.15 * (TW - 500),
        empFormula:   (TW: number) => 0.15 * (TW - 500),
        awTotalPct: 9,
        awEmpPct:   5
      },
      '750_up': {
        // 9% total, 5% employee
        // max total: $666, max emp: $370
        totalOWPct: 9,
        empOWPct:   5,
  
        awTotalPct: 9,
        awEmpPct:   5
      }
    },
  
    // ===================== Above 60–65 =====================
    '60to65': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
        awTotalPct: 8.5,
        awEmpPct:   5
      },
      '50_500': {
        // doc: 3.5% (TW)
        totalPct: 3.5,
        empPct: 0,
        awTotalPct: 8.5,
        awEmpPct:   5
      },
      '500_750': {
        // 3.5%*TW + 0.15*(TW-500), employee=0.15*(TW-500)
        // Official code snippet used 0.15 for partial bracket above 60–65
        totalFormula: (TW: number) => 0.035 * TW + 0.15 * (TW - 500),
        empFormula:   (TW: number) => 0.15 * (TW - 500),
        awTotalPct:   8.5,
        awEmpPct:     5
      },
      '750_up': {
        // 8.5% total, 5% employee
        // max total: $629, max emp: $370
        totalOWPct: 8.5,
        empOWPct:   5,
  
        awTotalPct: 8.5,
        awEmpPct:   5
      }
    },
  
    // ===================== Above 65 =====================
    '65above': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
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
        // max total: $629, max emp: $370
        totalOWPct: 8.5,
        empOWPct:   5,
  
        awTotalPct: 8.5,
        awEmpPct:   5
      }
    }
  } as const;
  
  
  /** Helper: pick the correct age key in Table2. */
  export function getAgeKeyForTable2(age: number): keyof typeof TABLE2_2025 {
    if (age <= 55) return '55_below';
    if (age <= 60) return '55to60';
    if (age <= 65) return '60to65';
    return '65above';
  }
  
  /** Helper: decide wage bracket from TW. */
  function getWageBracket(tw: number): '0_50' | '50_500' | '500_750' | '750_up' {
    if (tw <= 50)   return '0_50';
    if (tw <= 500)  return '50_500';
    if (tw <= 750)  return '500_750';
    return '750_up';
  }
  
  /** Rounding to nearest dollar */
  function roundToNearestDollar(amount: number): number {
    const fraction = amount - Math.floor(amount);
    return fraction >= 0.5 ? Math.ceil(amount) : Math.floor(amount);
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
  
  // Assuming bracketData can have totalPct and empPct
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
  
  /********************************************************
   * computeMonthlyCpfTable2(monthlyOW, age)
   *   For 1st-year SPR (G/G) from Table 2 (2025).
   *   - Caps monthlyOW at $7,400
   *   - Looks up the bracket data
   *   - Returns { empCPF, erCPF, totalCPF, rawEmp, rawTotal }
   ********************************************************/
  export function computeMonthlyCpfTable2(
    monthlyOW: number,
    age: number
  ): CpfCalculationResult {
    // Cap OW at 7400
    const owCapped = Math.min(monthlyOW, 7400);
  
    const bracketKey = getWageBracket(owCapped);
    const ageKey = getAgeKeyForTable2(age);
    const bracketObj = TABLE2_2025[ageKey][bracketKey] as BracketData;

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

export function getSalaryKeyForTable2(
    monthlyWage: number
  ): '0_50' | '50_500' | '500_750' | '750_up' {
    if (monthlyWage <= 50)    return '0_50';
    if (monthlyWage <= 500)   return '50_500';
    if (monthlyWage <= 750)   return '500_750';
    return '750_up';
}
  