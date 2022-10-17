export interface ICalcButton {
  color: string;
  type: string;
  label: string;
  operator?: string;
  action?: ECalsActions;
  specialCol?: string;
}

export interface ICalcHistory {
  datestamp: number;
  expression: string;
  evaluation: number;
  error: any;
}

export interface ICalcOperators {
  [key: string]: { label: string, sign: string }
}

export enum ECalsActions {
  EQUALS, CHANGE_OPERATOR, ALL_CLEAR
}
