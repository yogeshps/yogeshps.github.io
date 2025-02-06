// cpfAllocationCalculator.ts

/**
 * This interface describes the structure of the CPF allocation result.
 * - ordinaryAccountAllocation: Portion allocated to Ordinary Account
 * - specialAccountAllocation:  Portion allocated to Special Account (for age ≤ 55; 0 otherwise)
 * - retirementAccountAllocation: Portion allocated to Retirement Account (for age > 55; 0 otherwise)
 * - mediSaveAccountAllocation: Portion allocated to MediSave
 */
export interface CPFAllocationResult {
    ordinaryAccountAllocation: number;
    specialAccountAllocation: number;
    retirementAccountAllocation: number;
    mediSaveAccountAllocation: number;
  }
  
  /**
   * getCPFAllocation
   * ---------------
   * Given an age and the total CPF contribution, returns how much should go 
   * into each of the CPF accounts (Ordinary, Special/Retirement, MediSave).
   *
   * @param age       Employee's age in years
   * @param totalCPF  Total CPF contribution amount
   * @returns         CPFAllocationResult containing the individual allocations
   */
  export function getCPFAllocation(age: number, totalCPF: number): CPFAllocationResult {
    // Initialize all allocations to 0
    let ordinaryAccount = 0;
    let specialAccount = 0;
    let retirementAccount = 0;
    let mediSaveAccount = 0;
  
    if (age <= 35) {
      // 35 & below
      ordinaryAccount = Math.round(totalCPF * 0.6217 * 100) / 100;
      specialAccount  = Math.round(totalCPF * 0.1621 * 100) / 100;
      mediSaveAccount = Math.round(totalCPF * 0.2162 * 100) / 100;
    } else if (age > 35 && age <= 45) {
      // Above 35 – 45
      ordinaryAccount = Math.round(totalCPF * 0.5677 * 100) / 100;
      specialAccount  = Math.round(totalCPF * 0.1891 * 100) / 100;
      mediSaveAccount = Math.round(totalCPF * 0.2432 * 100) / 100;
    } else if (age > 45 && age <= 50) {
      // Above 45 – 50
      ordinaryAccount = Math.round(totalCPF * 0.5136 * 100) / 100;
      specialAccount  = Math.round(totalCPF * 0.2162 * 100) / 100;
      mediSaveAccount = Math.round(totalCPF * 0.2702 * 100) / 100;
    } else if (age > 50 && age <= 55) {
      // Above 50 – 55
      ordinaryAccount = Math.round(totalCPF * 0.4055 * 100) / 100;
      specialAccount  = Math.round(totalCPF * 0.3108 * 100) / 100;
      mediSaveAccount = Math.round(totalCPF * 0.2837 * 100) / 100;
    } else if (age > 55 && age <= 60) {
      // Above 55 – 60
      ordinaryAccount = Math.round(totalCPF * 0.3694 * 100) / 100;
      retirementAccount = Math.round(totalCPF * 0.3076 * 100) / 100;
      mediSaveAccount   = Math.round(totalCPF * 0.3230 * 100) / 100;
    } else if (age > 60 && age <= 65) {
      // Above 60 – 65
      ordinaryAccount = Math.round(totalCPF * 0.149 * 100) / 100;
      retirementAccount = Math.round(totalCPF * 0.4042 * 100) / 100;
      mediSaveAccount   = Math.round(totalCPF * 0.4468 * 100) / 100;
    } else if (age > 65 && age <= 70) {
      // Above 65 – 70
      ordinaryAccount = Math.round(totalCPF * 0.0607 * 100) / 100;
      retirementAccount = Math.round(totalCPF * 0.303 * 100) / 100;
      mediSaveAccount   = Math.round(totalCPF * 0.6363 * 100) / 100;
    } else {
      // Above 70
      ordinaryAccount = Math.round(totalCPF * 0.08 * 100) / 100;
      retirementAccount = Math.round(totalCPF * 0.08 * 100) / 100;
      mediSaveAccount   = Math.round(totalCPF * 0.84 * 100) / 100;
    }
  
    return {
      ordinaryAccountAllocation: ordinaryAccount,
      specialAccountAllocation: specialAccount,
      retirementAccountAllocation: retirementAccount,
      mediSaveAccountAllocation: mediSaveAccount
    };
  }
