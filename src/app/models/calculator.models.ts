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
  evaluation: string | null;
  error: any;
}

export interface ICalcOperators {
  [key: string]: { label: string, sign: string }
}

export enum ECalsActions {
  EQUALS, CHANGE_OPERATOR, ALL_CLEAR, APPEND_OPERATOR
}

export enum EInvalidActions {
  EQUALS = 'EQUALS',
  CHANGE_OPERATOR = 'CHANGE_OPERATOR',
  ALL_CLEAR = 'ALL_CLEAR',
  APPEND_OPERATOR = 'APPEND_OPERATOR',
}

export interface IDetermineOperatorVals {
  last: string;
  secondToLast: string | null;
  operatorIsMinus: boolean;
  operatorIsPlus: boolean;
}

export interface ICalculatorState {
  history: ICalcHistory[],
  errors: ICalcHistory[],
  result: ICalcHistory | null,
}
