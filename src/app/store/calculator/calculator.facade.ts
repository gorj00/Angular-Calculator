import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { calculatorFeature } from './calculator.feature';
import { ICalculatorState, ICalcHistory } from '../../models/calculator.models';
import { CalculatorActions } from './calculator.actions'

@Injectable({ providedIn: 'root' })
export class CalculatorFacade {
  history$ = this.store.select(calculatorFeature.selectHistory)
  errors$ = this.store.select(calculatorFeature.selectErrors)
  result$ = this.store.select(calculatorFeature.selectResult)

  constructor(private store: Store<ICalculatorState>) {}

  logHistoryEntry(historyLog: ICalcHistory | null) {
    this.store.dispatch(CalculatorActions.log_history(historyLog))
  }

  logErrorsEntry(errorLog: ICalcHistory) {
    this.store.dispatch(CalculatorActions.log_error(errorLog))
  }

  saveResult(result: ICalcHistory) {
    this.store.dispatch(CalculatorActions.log_result(result))
  }

  clearCalculatorLog() {
    this.store.dispatch(CalculatorActions.clear_log())
  }

}
