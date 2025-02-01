import React from "react";
import { SingaporeTaxCalculatorViewProps } from "../components/SingaporeTaxCalculatorView";

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

export const QUALIFYING_CHILD_DISABILITY_RELIEF = {
  AMOUNT: 7500
} as const;

