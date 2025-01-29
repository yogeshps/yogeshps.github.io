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
  
        // AW => 9% total, 5% employee
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
    // 1) cap at $7,400
    const owCapped = Math.min(monthlyOW, 7400);
  
    // 2) find bracket
    const bracketKey = getWageBracket(owCapped);
    const ageKey = getAgeKeyForTable2(age);
    const bracketData = TABLE2_2025[ageKey][bracketKey] as BracketData;
  
    // 3) apply logic
  
    // (A) If we have { totalPct, empPct } => simple
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
        totalPct: totalPct,
        empPct: empPct,
  
        // debug info
        rawEmp: rawEmp,
        rawTotal: rawTotal
      };
    }
  
    // (B) If we have { totalFormula, empFormula } => partial bracket
    if (bracketData.totalFormula && bracketData.empFormula) {
      const totalRaw = bracketData.totalFormula(owCapped);
      const empRaw   = bracketData.empFormula(owCapped);
  
      let total = roundToNearestDollar(totalRaw);
      let emp   = roundToNearestDollar(empRaw);
      let er    = total - emp;
      if (er < 0) er = 0;
  
      // Compute the effective percentages
      const effectiveTotalPct = owCapped > 0 ? (total / owCapped) * 100 : 0;
      const effectiveEmpPct   = owCapped > 0 ? (emp / owCapped) * 100 : 0;
  
      return {
        empCPF: emp,
        erCPF:  er,
        totalCPF: total,
  
        // New meaningful "average" percentages
        totalPct: effectiveTotalPct,
        empPct:   effectiveEmpPct,
  
        rawEmp: empRaw,
        rawTotal: totalRaw
      };
    }
  
    // (C) If we have { totalOWPct, empOWPct, maxTotalOW, maxEmpOW } => full bracket >$750
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
      if (maxTotal && total > maxTotal) total = maxTotal;
      if (maxEmp   && emp   > maxEmp)   emp   = maxEmp;
  
      let er = total - emp;
      if (er < 0) er = 0;
  
      return {
        empCPF: emp,
        erCPF:  er,
        totalCPF: total,
        totalPct: totalPct,
        empPct: empPct,
        rawEmp: rawEmp,
        rawTotal: rawTotal
      };
    }
  
    // fallback if bracket not found
    return {
      empCPF: 0,
      erCPF:  0,
      totalCPF: 0,
      totalPct: 0,
      empPct: 0,
      rawEmp:  0,
      rawTotal:0
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
  