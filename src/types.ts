interface ParentDependant {
  staysWithMe: boolean;
  hasDisability: boolean;
}

interface ParentRelief {
  enabled: boolean;
  dependants: string;
  dependantDetails: ParentDependant[];
} 