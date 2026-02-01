/*******************************************************
 *  Table 1 data structure for monthly OW (2025)
 *  -----------------------------------------------
 *  Age brackets:  "55_below", "55to60", "60to65", "65to70", "70above"
 *  Wage brackets: "0_50", "50_500", "500_750", "750_up"
 *
 *  For each bracket, we either store:
 *   - { totalPct: xx, empPct: yy } for simple %,
 *   - { totalFormula: fn, empFormula: fn } for partial increments,
 *   - { totalOWPct, empOWPct, maxTotalOW, maxEmpOW } for the >$750 full bracket,
 *     plus the per-month "max" from the table (e.g. $2,738).
 *******************************************************/
export const TABLE1_2025 = {
    '55_below': {
      '0_50': {
        // ≤ $50 => Nil (0% total, 0% employee)
        totalPct: 0,
        empPct: 0,
        // AW = 37% total, 20% emp
        awTotalPct: 37,
        awEmpPct: 20
      },
      '50_500': {
        // > $50 to $500 => 17% of TW (all employer)
        totalPct: 17,
        empPct: 0,
        // AW still 37% total, 20% emp
        awTotalPct: 37,
        awEmpPct: 20
      },
      '500_750': {
        // > $500 to $750 => [17% of TW] + [0.6*(TW - 500)]
        // employee portion is 0.6*(TW - 500).
        totalFormula: (TW: number) => 0.17 * TW + 0.6 * (TW - 500),
        empFormula:   (TW: number) => 0.6 * (TW - 500),
        // AW = 37/20
        awTotalPct: 37,
        awEmpPct:   20
      },
      '750_up': {
        // > $750 => 37% total, 20% employee
        // Max. of $2,960 total, $1,600 for employee (OW cap $8,000)
        totalOWPct: 37,
        empOWPct:   20,
        maxTotalOW: 2960,
        maxEmpOW:   1600,
        // AW = 37/20
        awTotalPct: 37,
        awEmpPct:   20
      }
    },
  
    '55to60': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
        awTotalPct: 32.5,
        awEmpPct:   17
      },
      '50_500': {
        // 15.5% all employer
        totalPct: 15.5,
        empPct: 0,
        awTotalPct: 32.5,
        awEmpPct:   17
      },
      '500_750': {
        // 15.5%(TW) + 0.51*(TW - 500)
        totalFormula: (TW: number) => 0.155 * TW + 0.51 * (TW - 500),
        empFormula:   (TW: number) => 0.51 * (TW - 500),
        awTotalPct:   32.5,
        awEmpPct:     17
      },
      '750_up': {
        // 32.5% total, 17% employee
        // Max total: $2,600; Max emp: $1,360 (OW cap $8,000)
        totalOWPct: 32.5,
        empOWPct:   17,
        maxTotalOW: 2600,
        maxEmpOW:   1360,
        // AW
        awTotalPct: 32.5,
        awEmpPct:   17
      }
    },
  
    '60to65': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
        awTotalPct: 23.5,
        awEmpPct:   11.5
      },
      '50_500': {
        // doc: 12% (TW)
        totalPct: 12,
        empPct: 0,
        awTotalPct: 23.5,
        awEmpPct:   11.5
      },
      '500_750': {
        // 12%(TW) + 0.345*(TW - 500)
        totalFormula: (TW: number) => 0.12 * TW + 0.345 * (TW - 500),
        empFormula:   (TW: number) => 0.345 * (TW - 500),
        awTotalPct:   23.5,
        awEmpPct:     11.5
      },
      '750_up': {
        // 23.5% total, 11.5% employee
        // Max: $1,880 total, $920 employee (OW cap $8,000)
        totalOWPct: 23.5,
        empOWPct:   11.5,
        maxTotalOW: 1880,
        maxEmpOW:   920,
        awTotalPct: 23.5,
        awEmpPct:   11.5
      }
    },
  
    '65to70': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
        awTotalPct: 16.5,
        awEmpPct:   7.5
      },
      '50_500': {
        // doc: 9% (TW)
        totalPct: 9,
        empPct: 0,
        awTotalPct: 16.5,
        awEmpPct:   7.5
      },
      '500_750': {
        // 9%(TW) + 0.225*(TW - 500)
        totalFormula: (TW: number) => 0.09 * TW + 0.225 * (TW - 500),
        empFormula:   (TW: number) => 0.225 * (TW - 500),
        awTotalPct:   16.5,
        awEmpPct:     7.5
      },
      '750_up': {
        // 16.5% total, 7.5% employee
        // Max total: $1,320, max emp: $600 (OW cap $8,000)
        totalOWPct: 16.5,
        empOWPct:   7.5,
        maxTotalOW: 1320,
        maxEmpOW:   600,
        awTotalPct: 16.5,
        awEmpPct:   7.5
      }
    },
  
    '70above': {
      '0_50': {
        totalPct: 0,
        empPct: 0,
        awTotalPct: 12.5,
        awEmpPct:   5
      },
      '50_500': {
        // doc: 7.5% (TW)
        totalPct: 7.5,
        empPct: 0,
        awTotalPct: 12.5,
        awEmpPct:   5
      },
      '500_750': {
        // 7.5%(TW) + 0.15*(TW - 500)
        totalFormula: (TW: number) => 0.075 * TW + 0.15 * (TW - 500),
        empFormula:   (TW: number) => 0.15 * (TW - 500),
        awTotalPct:   12.5,
        awEmpPct:     5
      },
      '750_up': {
        // 12.5% total, 5% employee
        // Max total: $1,000, max emp: $400 (OW cap $8,000)
        totalOWPct: 12.5,
        empOWPct:   5,
        maxTotalOW: 1000,
        maxEmpOW:   400,
        awTotalPct: 12.5,
        awEmpPct:   5
      }
    }
  } as const;
  

/*******************************************************
 * Helper to pick the age key from an integer age
 *******************************************************/
export function getAgeKeyForTable1(age: number): keyof typeof TABLE1_2025 {
  if (age <= 55)      return '55_below';
  if (age <= 60)      return '55to60';
  if (age <= 65)      return '60to65';
  if (age <= 70)      return '65to70';
  return '70above';
}

/*******************************************************
 * Helper to pick wage bracket from "TW"
 *******************************************************/
function getWageBracket(tw: number): '0_50' | '50_500' | '500_750' | '750_up' {
  if (tw <= 50)       return '0_50';
  if (tw <= 500)      return '50_500';
  if (tw <= 750)      return '500_750';
  return '750_up';
}

/*******************************************************
 * computeMonthlyCpfTable1
 *  - monthlyOW: the month's ordinary wages (not AW),
 *    which we will cap at $8,000 if it exceeds that.
 *  - age: integer
 * Returns an object:
 * {
 *   empCPF, erCPF, totalCPF,
 *   rawEmp, rawTotal  // before rounding/cap
 * }
 *******************************************************/

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

/* TABLE 1 CPF CALCULATION */
export function computeMonthlyCpfTable1(
  monthlyOW: number,
  age: number
): CpfCalculationResult {
  // Cap OW at 8000
  const owCapped = Math.min(monthlyOW, 8000);
  
  // Get bracket based on wage
  const bracketKey = getWageBracket(owCapped);
  const ageKey = getAgeKeyForTable1(age);
  const bracketObj = TABLE1_2025[ageKey][bracketKey];

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
    const rawTotal = (bracketObj.totalPct / 100) * owCapped;
    const total = roundToNearestDollar(rawTotal);

    return {
      empCPF: 0,
      erCPF: total,
      totalCPF: total,
      totalPct: bracketObj.totalPct / 100,
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
    const totalPct = bracketObj.totalOWPct / 100;
    const empPct = bracketObj.empOWPct / 100;
    const maxTotal = bracketObj.maxTotalOW;
    const maxEmp = bracketObj.maxEmpOW;

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

/***********************************************************
 * Round to Nearest Dollar
 ***********************************************************/
function roundToNearestDollar(val: number): number {
    const cents = val - Math.floor(val);
    return cents >= 0.5 ? Math.ceil(val) : Math.floor(val);
}

/**
 * For Table1's monthly wage brackets:
 *  - TW ≤ 50       => "0_50"
 *  - 50 < TW ≤ 500 => "50_500"
 *  - 500 < TW ≤ 750 => "500_750"
 *  - TW > 750      => "750_up"
 */
export function getSalaryKeyForTable1(monthlyWage: number):
  | '0_50'
  | '50_500'
  | '500_750'
  | '750_up' 
{
  if (monthlyWage <= 50)     return '0_50';
  if (monthlyWage <= 500)    return '50_500';
  if (monthlyWage <= 750)    return '500_750';
  return '750_up';
}