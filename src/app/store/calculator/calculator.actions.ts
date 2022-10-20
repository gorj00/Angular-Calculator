import { createActionGroup, emptyProps } from '@ngrx/store';
import { ICalcHistory } from '../../models/calculator.models'

enum actionTypes {
  LOG_RESULT = 'LOG_RESULT',
  LOG_HISTORY = 'LOG_HISTORY',
  LOG_ERROR = 'LOG_ERROR',
  CLEAR_LOG = 'CLEAR_LOG',
}

export const CalculatorActions = createActionGroup({
  source: '[CALCULATOR]',
  events: {
    [actionTypes.LOG_RESULT]: (result: ICalcHistory) => ({ result }),
    [actionTypes.LOG_HISTORY]: (historyLog: ICalcHistory | null) => ({ historyLog }),
    [actionTypes.LOG_ERROR]: (error: ICalcHistory) => ({ error }),
    [actionTypes.CLEAR_LOG]: emptyProps(),
  }
});
