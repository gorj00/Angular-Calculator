import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ICalcHistory } from '../../models/calculator.models'

export const CalculatorActions = createActionGroup({
  source: '[CALCULATOR]',
  events: {
    'LOG_RESULT': (result: ICalcHistory) => ({ result }),
    'LOG_HISTORY': (historyLog: ICalcHistory) => ({ historyLog }),
    'LOG_ERROR': (error: ICalcHistory) => ({ error }),
    'CLEAR_LOG': emptyProps(),
  }
});
