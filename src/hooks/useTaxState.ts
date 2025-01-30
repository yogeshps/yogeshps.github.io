import { useState, useEffect } from 'react';
import { calculateTaxReliefs } from '../utils/TaxReliefCalculator';

export interface TaxState {
  reliefs: {
    earnedIncomeRelief: boolean;
    earnedIncomeReliefDisability: boolean;
    cpfRelief: boolean;
  };
  nsman: {
    enabled: boolean;
    general: boolean;
    key: boolean;
    wife: boolean;
    parent: boolean;
  };
  cpfTopUp: {
    enabled: boolean;
    self: boolean;
    family: boolean;
    selfAmount: string;
    familyAmount: string;
  };
  results: {
    earnedIncomeRelief: number;
    earnedIncomeReliefDisability: number;
    cpfRelief: number;
    cpfTopUpRelief: number;
    nsmanRelief: number;
    totalReliefs: number;
    totalTaxableIncome: number;
  };
}

export const useTaxState = (
  extraInputs: { age: string; sprStatus: string }, 
  results: { totalEmployeeCPF: number; totalTaxableIncome: number }
) => {
  const [taxState, setTaxState] = useState<TaxState>({
    reliefs: {
      earnedIncomeRelief: false,
      earnedIncomeReliefDisability: false,
      cpfRelief: extraInputs.sprStatus !== 'ep_pep_spass'
    },
    nsman: {
      enabled: false,
      general: false,
      key: false,
      wife: false,
      parent: false
    },
    cpfTopUp: {
      enabled: false,
      self: true,
      family: false,
      selfAmount: '',
      familyAmount: ''
    },
    results: {
      earnedIncomeRelief: 0,
      earnedIncomeReliefDisability: 0,
      cpfRelief: 0,
      cpfTopUpRelief: 0,
      nsmanRelief: 0,
      totalReliefs: 0,
      totalTaxableIncome: 0
    }
  });

  const handleNSmanReliefChange = (checked: boolean) => {
    setTaxState(prev => ({
      ...prev,
      nsman: {
        ...prev.nsman,
        enabled: checked,
        general: checked ? prev.nsman.general : false,
        key: checked ? prev.nsman.key : false,
        wife: checked ? prev.nsman.wife : false,
        parent: checked ? prev.nsman.parent : false
      }
    }));
  };

  const handleNSmanTypeChange = (type: 'general' | 'key' | 'wife' | 'parent', checked: boolean) => {
    setTaxState(prev => ({
      ...prev,
      nsman: {
        ...prev.nsman,
        [type]: checked,
        general: type === 'general' ? checked : type === 'key' ? false : prev.nsman.general,
        key: type === 'key' ? checked : type === 'general' ? false : prev.nsman.key
      }
    }));
  };

  useEffect(() => {
    if (!extraInputs.age) return;

    const reliefs = calculateTaxReliefs({
      age: Number(extraInputs.age) || 0,
      taxReliefs: taxState.reliefs,
      cpfTopUpInputs: {
        self: taxState.cpfTopUp.self,
        family: taxState.cpfTopUp.family,
        selfAmount: taxState.cpfTopUp.selfAmount,
        familyAmount: taxState.cpfTopUp.familyAmount
      },
      nsmanRelief: taxState.nsman,
      employeeCPF: results.totalEmployeeCPF || 0,
      annualIncome: results.totalTaxableIncome || 0
    });

    setTaxState(prev => ({
      ...prev,
      results: {
        earnedIncomeRelief: reliefs.earnedIncomeRelief || 0,
        earnedIncomeReliefDisability: reliefs.earnedIncomeReliefDisability || 0,
        cpfRelief: reliefs.cpfRelief || 0,
        cpfTopUpRelief: reliefs.cpfTopUpRelief || 0,
        nsmanRelief: reliefs.nsmanRelief || 0,
        totalReliefs: reliefs.totalReliefs || 0,
        totalTaxableIncome: reliefs.totalTaxableIncome || 0
      }
    }));
  }, [extraInputs.age, taxState.reliefs, taxState.cpfTopUp, taxState.nsman, results.totalEmployeeCPF]);

  return {
    taxState,
    handleNSmanReliefChange,
    handleNSmanTypeChange,
    setTaxState
  };
}; 