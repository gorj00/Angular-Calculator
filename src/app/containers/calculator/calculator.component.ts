import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICalculatorState, ICalcOperators, ECalsActions, IDetermineOperatorVals, EInvalidActions } from '../../models/calculator.models';
import { CalculatorFacade } from '../../store/calculator/calculator.facade';
import { CalculatorService } from '../../services/calculator.service'
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import * as math from 'mathjs';

@Component({
  selector: 'calc-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.less'],
})
export class CalculatorComponent implements OnInit, OnDestroy {
  subs = new Subscription()
  data: ICalculatorState = { history: [], errors: [], result: null }
  expression: string = ''
  operators: ICalcOperators
  operatorsRegex: RegExp
  invalidAction: boolean = false;

  saveResult(expression: string, result: number) {
    this.calculatorFacade.saveResult({
      datestamp: moment().valueOf(),
      error: null,
      expression: expression,
      evaluation: result.toString()
    })
  }

  logError(e: any, expression: string) {
    this.calculatorFacade.logErrorsEntry({
      datestamp: moment().valueOf(),
      error: e,
      expression: expression,
      evaluation: null
    })
  }

  saveCurrentResultToHistory() {
    this.data.result && this.calculatorFacade.logHistoryEntry(
      this.data.result
    )
  }

  clearResultLog() {
    this.data.result && this.calculatorFacade.clearCalculatorLog()
  }

  onSolveExpression() {
    const lastItem = this.calculatorService.getExpressionLastItem();
    if (lastItem && !Number.isNaN(+lastItem)) {
      const expressionWithMathSigns: string =
        this.calculatorService.replaceExpressionLabelSignsWithMathSigns();
      let result
      try {
        result = math.evaluate(expressionWithMathSigns)
        this.saveResult(expressionWithMathSigns, result)
      } catch (e) {
        this.logError(e, expressionWithMathSigns)
      }
    } else {
      this.flagInvalidAction(null, EInvalidActions.EQUALS + ', last char not a number part');
    }
  }

  onChangeExpression(event: {
    symbol: string;
    type: string;
    action?: ECalsActions;
  }) {
    const { symbol, type, action = null } = event;
    switch (type) {
      case 'operator': {
        if (!!this.data.result) this.onContinueWithPreviousExpression()
        this.handleOperator(symbol);
        break;
      }
      case 'number':
        this.handleNumber(symbol);
        break;
      case 'function':
        this.onCalcAction(action);
        break;
      default:
        break;
    }
  }

  onChangeOperator() {
    const expressionAsArr = this.calculatorService.
      getExpressionAsArrOfNumsAndOperators();
    const length = expressionAsArr.length;

    if (length) {
      const { last, secondToLast, operatorIsMinus, operatorIsPlus } =
        this.calculatorService.getChangeOperatorDeterminationVars(expressionAsArr);
      // If single positive number
      if (length === 1 && !Number.isNaN(+last) && +last > 0) {
        this.calculatorService.changeOperatorForSingleNumber(expressionAsArr[0], 'negative');
        // If single negative number
      } else if (length === 2 && operatorIsMinus) {
        this.calculatorService.changeOperatorForSingleNumber(expressionAsArr[1], 'positive');
        // Remaining cases
      } else if (
        length > 1 &&
        !Number.isNaN(+last) &&
        (operatorIsMinus || operatorIsPlus)
      ) {
        this.calculatorService.changeOperatorOfLastNumberInMultiple(
          secondToLast,
          expressionAsArr
        );
        // Invalid expression ending for operator change
      } else {
        this.flagInvalidAction(null, EInvalidActions.CHANGE_OPERATOR);
      }
      // Empty expression
    } else {
      this.flagInvalidAction(null, 'empty expression');
    }
  }

  onCalcAction(action: ECalsActions | null) {
    switch (action) {
      case ECalsActions.ALL_CLEAR:
        this.onAllClear();
        break;
      case ECalsActions.EQUALS:
        this.onSolveExpression();
        break;
      case ECalsActions.CHANGE_OPERATOR:
        this.onChangeOperator();
        break;
      default:
        break;
    }
  }

  onAllClear() {
    this.calculatorService.updateExpression('')
    this.saveCurrentResultToHistory()
    this.clearResultLog()
  }

  onContinueWithPreviousExpression() {
    this.onAllClear()
    const historyLength = this.data.history.length
    const lastHistoryLog = this.data.history[historyLength - 1]
    this.calculatorService.updateExpression(lastHistoryLog.evaluation ? lastHistoryLog.evaluation : '')
  }

  handleOperator(symbol: string) {
    let allowAppendObj: { allow: boolean } = { allow: false };
    this.calculatorService.determineAllowBoolean(allowAppendObj, symbol);

    if (allowAppendObj.allow) {
      this.calculatorService.updateExpression(this.expression + ' ' + symbol + ' ')
    } else {
      this.flagInvalidAction(null, EInvalidActions.APPEND_OPERATOR);
    }
  }

  handleNumber(symbol: string) {
    // Non-dot case
    if (symbol !== '.') {
      this.calculatorService.updateExpression(this.expression + symbol)
      // Dot case
    } else {
      const lastItem = this.calculatorService.getExpressionLastItem();
      if (lastItem && !Number.isNaN(+lastItem) && !lastItem.includes('.')) {
        this.calculatorService.updateExpression(this.expression + symbol)
      } else {
        this.flagInvalidAction(null, 'expression ends with a dot');
      }
    }
  }

  // Multiple dot input, dot on empty expression,
  // double operator input, invalid operations
  flagInvalidAction(e?: any, attemptedAction?: string | ECalsActions) {
    this.invalidAction = true;
    setTimeout(() => (this.invalidAction = false), 500);
    const errorParam = e ? e : attemptedAction ? attemptedAction : null
    this.logError(errorParam, this.expression)
  }

  constructor(
    public calculatorFacade: CalculatorFacade,
    public calculatorService: CalculatorService,
  ) {}

  ngOnInit(): void {
    // From service
    this.operators = this.calculatorService.operators
    this.operatorsRegex =  this.calculatorService.operatorsRegex
    this.subs.add(
      this.calculatorService.expressionAsObs$.subscribe(
        (expression) => (this.expression = expression)
      )
    );

    // From store
    this.subs.add(
      this.calculatorFacade.history$.subscribe(
        (history) => (this.data.history = history)
      )
    );
    this.subs.add(
      this.calculatorFacade.result$.subscribe(
        (result) => (this.data.result = result)
      )
    );
    this.subs.add(
      this.calculatorFacade.errors$.subscribe(
        (errors) => (this.data.errors = errors)
      )
    );

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe()
  }
}
