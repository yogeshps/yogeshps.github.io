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
        // Max. of $2,738 total, $1,480 for employee
        totalOWPct: 37,
        empOWPct:   20,
        maxTotalOW: 2738,
        maxEmpOW:   1480,
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
        // Max total: $2,405; Max emp: $1,258
        totalOWPct: 32.5,
        empOWPct:   17,
        maxTotalOW: 2405,
        maxEmpOW:   1258,
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
        // Max: $1,739 total, $851 employee
        totalOWPct: 23.5,
        empOWPct:   11.5,
        maxTotalOW: 1739,
        maxEmpOW:   851,
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
        // Max total: $1,221, max emp: $555
        totalOWPct: 16.5,
        empOWPct:   7.5,
        maxTotalOW: 1221,
        maxEmpOW:   555,
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
 *    which we will cap at $7,400 if it exceeds that.
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
  // 1) Cap at $7,400
  const owCapped = Math.min(monthlyOW, 7400);

  // 2) Identify the correct bracket
  const bracketKey = getWageBracket(owCapped);
  const ageKey     = getAgeKeyForTable1(age);
  const bracketObj = TABLE1_2025[ageKey][bracketKey];

  // If the bracket data is purely { totalPct, empPct }, handle that:
  if ('totalPct' in bracketObj && bracketObj.totalPct !== undefined) {
    const totalPct = bracketObj.totalPct / 100;
    const empPct   = (bracketObj.empPct || 0) / 100;

    const rawTotal = totalPct * owCapped;
    const rawEmp   = empPct * owCapped;
    let total = roundToNearestDollar(rawTotal);
    let emp   = roundToNearestDollar(rawEmp);
    let er    = total - emp;

    return {
      empCPF: emp,
      erCPF:  er,
      totalCPF: total,
      totalPct: totalPct || 0,
      empPct: empPct || 0,

      // debug info
      rawEmp: rawEmp,
      rawTotal: rawTotal
    };
  }
  // If we have { totalFormula, empFormula } (partial bracket)
  else if ('totalFormula' in bracketObj && bracketObj.totalFormula !== undefined) {
    const totalRaw = bracketObj.totalFormula(owCapped);
    const empRaw   = bracketObj.empFormula(owCapped);
    let total = roundToNearestDollar(totalRaw);
    let emp   = roundToNearestDollar(empRaw);
    let er    = total - emp;

    // Compute effective percentages
    const effectiveTotalPct = owCapped > 0 ? (total / owCapped) * 100 : 0;
    const effectiveEmpPct   = owCapped > 0 ? (emp   / owCapped) * 100 : 0;

    return {
      empCPF: emp,
      erCPF:  er,
      totalCPF: total,
      totalPct: effectiveTotalPct,
      empPct:   effectiveEmpPct,

      rawEmp: empRaw,
      rawTotal: totalRaw
    };
  }
  // If we have { totalOWPct, empOWPct, maxTotalOW, maxEmpOW } (>$750 bracket)
  else if ('totalOWPct' in bracketObj && bracketObj.totalOWPct !== undefined) {
    const totalPct = bracketObj.totalOWPct / 100;
    const empPct   = bracketObj.empOWPct   / 100;
    const maxTotal = bracketObj.maxTotalOW;
    const maxEmp   = bracketObj.maxEmpOW;

    const rawTotal = totalPct * owCapped;
    const rawEmp   = empPct * owCapped;

    // Round first
    let total = roundToNearestDollar(rawTotal);
    let emp   = roundToNearestDollar(rawEmp);

    // Then check the monthly "max"
    if (maxTotal && total > maxTotal) {
      total = maxTotal;
    }
    if (maxEmp && emp > maxEmp) {
      emp = maxEmp;
    }

    let er = total - emp;
    // If that difference is negative (due to employee capping?), clamp to 0
    if (er < 0) er = 0;

    return {
      empCPF: emp,
      erCPF:  er,
      totalCPF: total,
      totalPct: totalPct || 0,
      empPct: empPct || 0,

      rawEmp: rawEmp,
      rawTotal: rawTotal
    };
  }

  // fallback if somehow bracket not found
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