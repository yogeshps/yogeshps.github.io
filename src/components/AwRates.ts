import { TABLE1_2025, getAgeKeyForTable1, getSalaryKeyForTable1 } from './Table1';
import { TABLE2_2025, getAgeKeyForTable2, getSalaryKeyForTable2 } from './Table2';
import { TABLE3_2025, getAgeKeyForTable3, getSalaryKeyForTable3 } from './Table3';
import { TABLE4_2025, getAgeKeyForTable4, getSalaryKeyForTable4 } from './Table4';
import { TABLE5_2025, getAgeKeyForTable5, getSalaryKeyForTable5 } from './Table5';

/** 
 * Function to get AW rates based on the specified table, age, and salary key.
 * @param sprTable - The name of the table (e.g., 'table1', 'table2', etc.)
 * @param age - The age of the individual
 * @param salary - The salary of the individual
 * @param salaryKey - The salary bracket key (e.g., '0_50', '50_500', etc.)
 * @returns An object containing awTotalPct and awEmpPct
 */
export function getAwRates(sprTable: string, age: number, salary: number): { awTotalPct: number, awEmpPct: number } {
  // Handle the case for EP / PEP / S Pass
  if (sprTable === 'ep_pep_spass') {
    return {
      awTotalPct: 0, // No contributions for EP / PEP / S Pass
      awEmpPct: 0
    };
  }

  const ageKey = getAgeKey(sprTable, age); // Helper function to get age key based on table
  const salaryKey = getSalaryKey(sprTable, salary); // Helper function to get salary key based on table

  switch (sprTable) {
    case 'table1':
      return {
        awTotalPct: TABLE1_2025[ageKey as keyof typeof TABLE1_2025][salaryKey as keyof typeof TABLE1_2025['55_below']].awTotalPct,
        awEmpPct:   TABLE1_2025[ageKey as keyof typeof TABLE1_2025][salaryKey as keyof typeof TABLE1_2025['55_below']].awEmpPct
      };
    case 'table2':
      return {
        awTotalPct: TABLE2_2025[ageKey as keyof typeof TABLE2_2025][salaryKey as keyof typeof TABLE2_2025['55_below']].awTotalPct,
        awEmpPct:   TABLE2_2025[ageKey as keyof typeof TABLE2_2025][salaryKey as keyof typeof TABLE2_2025['55_below']].awEmpPct
      };
    case 'table3':
      return {
        awTotalPct: TABLE3_2025[ageKey as keyof typeof TABLE3_2025][salaryKey as keyof typeof TABLE3_2025['55_below']].awTotalPct,
        awEmpPct:   TABLE3_2025[ageKey as keyof typeof TABLE3_2025][salaryKey as keyof typeof TABLE3_2025['55_below']].awEmpPct
      };
    case 'table4':
      return {
        awTotalPct: TABLE4_2025[ageKey as keyof typeof TABLE4_2025][salaryKey as keyof typeof TABLE4_2025['55_below']].awTotalPct,
        awEmpPct:   TABLE4_2025[ageKey as keyof typeof TABLE4_2025][salaryKey as keyof typeof TABLE4_2025['55_below']].awEmpPct
      };
    case 'table5':
      return {
        awTotalPct: TABLE5_2025[ageKey as keyof typeof TABLE5_2025][salaryKey as keyof typeof TABLE5_2025['55_below']].awTotalPct,
        awEmpPct:   TABLE5_2025[ageKey as keyof typeof TABLE5_2025][salaryKey as keyof typeof TABLE5_2025['55_below']].awEmpPct
      };
    default:
      throw new Error('Invalid table name provided.');
  }
}

/** 
 * Helper function to get the age key based on the table name.
 */
function getAgeKey(sprTable: string, age: number): string {
  switch (sprTable) {
    case 'table1':
      return getAgeKeyForTable1(age);
    case 'table2':
      return getAgeKeyForTable2(age);
    case 'table3':
      return getAgeKeyForTable3(age);
    case 'table4':
      return getAgeKeyForTable4(age);
    case 'table5':
      return getAgeKeyForTable5(age);
    default:
      throw new Error('Invalid table name provided.');
  }
}

function getSalaryKey(sprTable: string, salary: number): string {
  switch (sprTable) {
    case 'table1':
      return getSalaryKeyForTable1(salary);
    case 'table2':
      return getSalaryKeyForTable2(salary);
    case 'table3':
      return getSalaryKeyForTable3(salary);
    case 'table4':
      return getSalaryKeyForTable4(salary);
    case 'table5':
      return getSalaryKeyForTable5(salary);
    default:
      throw new Error('Invalid table name provided.');
  }
}