// Parent Relief amounts
export const PARENT_RELIEF = {
  WITH: 9000,
  WITHOUT: 5500
};

// Parent Disability Relief amounts
export const PARENT_DISABILITY_RELIEF = {
  WITH: 14000,
  WITHOUT: 10000
};

export const SIBLING_DISABILITY_RELIEF = 5500;

export const GRANDPARENT_CAREGIVER_RELIEF = {
  AMOUNT: 3000
} as const;

export const QUALIFYING_CHILD_RELIEF = {
  AMOUNT: 4000,
  DISABILITY_AMOUNT: 7500
} as const;

export const MAX_SRS_CONTRIBUTION_EP = 15300;
export const MAX_SRS_CONTRIBUTION_CITIZEN_PR = 35700;

export const LIFE_INSURANCE_LIMIT = 5000;

// Tax Relief Constants
export const MAX_TAX_RELIEF = 80000;

export const CHARITABLE_DEDUCTION_MULTIPLIER = 2.5; // 250% of donation amount

export const POPOVER_MAX_WIDTH = '480px';

export const PARENTHOOD_TAX_REBATE = {
  FIRST_CHILD: 5000,
  SECOND_CHILD: 10000,
  THIRD_CHILD: 20000,
} as const;

export const FLAT_DEDUCTION_PERCENTAGE = 0.15; // 15%

// PIT Rebate for YA2024
export const PIT_REBATE_CAP = 200; // Maximum rebate amount
export const PIT_REBATE_PERCENTAGE = 0.5; // 50% rebate