export interface ICalcButton {
  color: string;
  type: string;
  label: string;
  function?: any;
  specialCol?: string;
}

export interface ICalcHistory {
  datestamp: number;
  expression: string;
  evaluation: number;
  error: any;
}
