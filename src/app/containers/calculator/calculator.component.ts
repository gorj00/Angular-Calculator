import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICalculatorState, ICalcOperators, ECalsActions, EInvalidActions } from '../../models/calculator.models';
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

  /**
   ************************ STORE COMMUNICATION ***********************
   */

  /**
   * Stores a given expression result into the store
   *
   * @param {string} expression Math expression user input
   * @param {number} result     Evaluation of the expression
   */
    saveResult(expression: string, result: number) {
    this.calculatorFacade.saveResult({
      datestamp: moment().valueOf(),
      error: null,
      expression: expression,
      evaluation: result.toString()
    })
  }

  /**
   * Stores an error log (caused by an invalid action) to the store
   *
   * @param {any}    e Any error or error message
   * @param {string} expression Math expression user input
   */
  logError(e: any, expression: string) {
    this.calculatorFacade.logErrorsEntry({
      datestamp: moment().valueOf(),
      error: e,
      expression: expression,
      evaluation: null
    })
  }

  /**
   * Stores the evaluated result in the store's history logs if
   * result exists
   */
  saveCurrentResultToHistory() {
    this.data.result && this.calculatorFacade.logHistoryEntry(
      this.data.result
    )
  }

  /**
   * Clears the result property in the store if it exists
   */
  clearResultLog() {
    this.data.result && this.calculatorFacade.clearCalculatorLog()
  }

  /**
   ******** MATH EXPRESSION USER INPUT HANDLING ***********************
   */

  /**
   * Solves the expression and passes on the result to the store,
   * or flags and logs an error in the store in case of invalid expression
   *
   */
  onSolveExpression() {
    const lastItem = this.calculatorService.getExpressionLastItem();
    if (lastItem && !Number.isNaN(+lastItem)) {
      const expressionWithMathSigns: string =
        this.calculatorService.replaceExpressionLabelSignsWithMathSigns();
      try {
        const result = math.evaluate(expressionWithMathSigns)
        this.saveResult(expressionWithMathSigns, result)
      } catch (e) {
        this.logError(e, expressionWithMathSigns)
      }
    } else {
      this.flagInvalidAction(null, EInvalidActions.EQUALS + ', last char not a number part');
    }
  }

  /**
   * Gets called on a calc button click, attempts to append to
   * or operate on the expression
   *
   * @param {{
   *     symbol: string;        Calc button label
   *     type: string;          Type (function | operator | number)
   *     action?: ECalsActions; Optional action
   *   }} event                 Event object containing the above
   */
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

  /**
   * Changes last number from positive to negative and vice versa,
   * or flags and logs the error on a invalid attempt
   */
  onChangeOperator() {
    const expressionAsArr = this.calculatorService.
      getExpressionAsArrOfNumsAndOperators();
    const length = expressionAsArr.length;
    console.log(expressionAsArr, length)

    if (length) {
      const { last, secondToLast, operatorIsMinus, operatorIsPlus } =
        this.calculatorService.getChangeOperatorDeterminationVars(expressionAsArr);
        console.log(last, secondToLast, operatorIsMinus, operatorIsPlus)

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

  /**
   * Stores the current expression result into the store's history logs,
   * and forms a new expression beginning with the stored result of now
   * previous expression
   *
   * Triggered when a user evaluates expression (=) and subsequently
   * clicks on any of the math operator buttons (+, -, /, *)
   */
  onContinueWithPreviousExpression() {
    this.onAllClear()
    const historyLength = this.data.history.length
    const lastHistoryLog = this.data.history[historyLength - 1]
    this.calculatorService.updateExpression(lastHistoryLog.evaluation ? lastHistoryLog.evaluation : '')
  }

  /**
   * Performs a predefined operation and/or store operation based on
   * the action type
   *
   * @param {(ECalsActions | null)} action Action type
   */
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

  /**
   * Updates expression to an empty string, saves the result to the store's history,
   * and nullifies the result in the store
   */
  onAllClear() {
    this.calculatorService.updateExpression('')
    this.saveCurrentResultToHistory()
    this.clearResultLog()
  }

  /**
   ************************ USER INPUT HANDLING ***********************
   */

  /**
   * Determines whether suggested operator (math sign) may be appended to the
   * current expression string; on success, it appends and updates the expression;
   * on failure, it flags and logs the error
   *
   * @param {string} symbol Math sign to be appended to the expression
   */
  handleOperator(symbol: string) {
    let allowAppendObj: { allow: boolean } = { allow: false };
    this.calculatorService.determineAllowBoolean(allowAppendObj, symbol);

    if (allowAppendObj.allow) {
      this.calculatorService.updateExpression(this.expression + ' ' + symbol + ' ')
    } else {
      this.flagInvalidAction(null, EInvalidActions.APPEND_OPERATOR);
    }
  }

  /**
   * Determines whether suggested number (or dot*) may be appended to the
   * current expression string; on success, it appends and updates the expression;
   * on failure, it flags and logs the error
   *
   * *Dot is handled as a number as well, method includes check whether
   * dot is already present in case of a humber
   *
   * @param {string} symbol Number to be appended to the expression
   */
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

  /**
   ***************************** ERROR HANDLING ***********************
   */

  /**
   * Shows red warning styling in the calculator container for a moment
   * and logs the error in the store
   *
   * Cases when caused: Multiple dot input, dot on empty expression,
   * double operator input, invalid operations
   *
   * @param {*} [e]                                     Optional error
   * @param {(string | ECalsActions)} [attemptedAction] Optional attempted action
   */
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

  /**
   ************************************** HOOKS ***********************
   */
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
