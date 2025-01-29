// Utility function to determine the age key for CPF calculations
export function getAgeKey(age: number): string {
    if (age <= 55) return '55_below';
    if (age <= 60) return '55to60';
    if (age <= 65) return '60to65';
    if (age <= 70) return '65to70';
    return '70above';
  }
  
  // Utility function to round a number to the nearest dollar
  export function roundToNearestDollar(val: number): number {
    const fraction = val - Math.floor(val);
    return fraction >= 0.5 ? Math.ceil(val) : Math.floor(val);
  }