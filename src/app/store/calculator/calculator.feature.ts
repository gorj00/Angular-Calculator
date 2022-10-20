import { createFeature, createReducer, on } from '@ngrx/store';

import  { CalculatorActions } from './calculator.actions';
import { ICalculatorState } from '../../models/calculator.models'

const initialState: ICalculatorState = {
  history: [],
  result: null,
  errors: [],
};

export const calculatorFeature = createFeature({
  name: 'calculator',
  reducer: createReducer(
    initialState,
    on(CalculatorActions.log_history, (state: ICalculatorState, { historyLog }) => ({
      ...state,
      history: historyLog ? [...state.history, historyLog] : state.history
    })),
    on(CalculatorActions.log_error, (state: ICalculatorState, { error }) => ({
      ...state,
      errors: [...state.errors, error]
    })),
    on(CalculatorActions.log_result, (state: ICalculatorState, { result }) => ({
      ...state,
      result,
    })),
    on(CalculatorActions.clear_log, (state: ICalculatorState) => ({
      ...state,
      result: null,
    })),
  ),
});

export const {
  name,
  reducer,
  selectCalculatorState,

  // AUTO GENERATED SELECTORS
  // selectHistory,
  // selectErrors,
  // selectResult,
} = calculatorFeature;
