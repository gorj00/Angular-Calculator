import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICalculatorState, ICalcOperators, ECalsActions, IDetermineOperatorVals, EInvalidActions } from '../../models/calculator.models';
import { CalculatorFacade } from '../../store/calculator/calculator.facade';
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
  expression: string = '';
  operators: ICalcOperators = {
    plus: { label: '+', sign: '+' },
    minus: { label: '−', sign: '-' },
    divide: { label: '÷', sign: '/' },
    multiply: { label: '×', sign: '*' },
  };

  operatorsRegex: RegExp = /(\s\+\s)|(\s\−\s)|(\s÷\s)|(\s×\s)/g;
  invalidAction: boolean = false;

  onChangeExpression(event: {
    symbol: string;
    type: string;
    action?: ECalsActions;
  }) {
    const { symbol, type, action = null } = event;
    switch (type) {
      case 'operator':
        this.handleOperator(symbol);
        break;
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

  onChangeOperator() {
    const expressionAsArr = this.getExpressionAsArrOfNumsAndOperators();
    const length = expressionAsArr.length;

    if (length) {
      const { last, secondToLast, operatorIsMinus, operatorIsPlus } =
        this.getChangeOperatorDeterminationVars(expressionAsArr);
      // If single positive number
      if (length === 1 && !Number.isNaN(+last) && +last > 0) {
        this.changeOperatorForSingNumber(expressionAsArr[0], 'negative');
        // If single negative number
      } else if (length === 2 && operatorIsMinus) {
        this.changeOperatorForSingNumber(expressionAsArr[1], 'positive');
        // Remaining cases
      } else if (
        length > 1 &&
        !Number.isNaN(+last) &&
        (operatorIsMinus || operatorIsPlus)
      ) {
        this.changeOperatorOfLastNumberInMultiple(
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

  getChangeOperatorDeterminationVars(
    expressionArr: string[]
  ): IDetermineOperatorVals {
    const length = expressionArr.length
    const last = expressionArr[length - 1];
    const secondToLast = length > 1 ? expressionArr[length - 2] : null;
    const operatorIsMinus = secondToLast === this.operators.minus.label;
    const operatorIsPlus = secondToLast === this.operators.plus.label;
    return { last, secondToLast, operatorIsMinus, operatorIsPlus };
  }

  changeOperatorForSingNumber(
    numStr: string,
    toOperator: 'positive' | 'negative'
  ) {
    switch (toOperator) {
      case 'positive': {
        const convertedExpressionArr = [numStr];
        this.formExpressionFromArr(convertedExpressionArr);
        break;
      }
      case 'negative': {
        const convertedExpressionArr = [this.operators.minus.label, numStr];
        this.formExpressionFromArr(convertedExpressionArr);
        break;
      }
      default:
        break;
    }
  }

  changeOperatorOfLastNumberInMultiple(
    secondToLast: string | null,
    expressionArr: string[]
  ) {
    const length = expressionArr.length
    const operatorConverted = this.convertLabelSign(secondToLast);
    const convertedExpressionArr = [...expressionArr];
    convertedExpressionArr[length - 2] = operatorConverted;
    this.formExpressionFromArr(convertedExpressionArr);
  }

  getExpressionAsArrOfNumsAndOperators(): string[] {
    return (
      this.expression
        .split(this.operatorsRegex)
        // clear operators of white spaces
        .map((item) => item && item.replace(/\s/g, ''))
        // clear out undefined items
        .filter((item) => item)
    );
  }

  convertLabelSign(sign: string | null): string {
    switch (sign) {
      case this.operators.plus.label:
        return this.operators.minus.label;
      case this.operators.minus.label:
        return this.operators.plus.label;
      default:
        return '';
    }
  }

  formExpressionFromArr(arr: string[]) {
    this.expression = '';
    arr.length &&
      arr.forEach((part) => {
        const isNum = !Number.isNaN(+part);
        this.expression += isNum ? part : ` ${part} `;
      });
  }

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
    const lastItem = this.getExpressionLastItem();
    if (lastItem && !Number.isNaN(+lastItem)) {
      const expressionWithMathSigns: string =
        this.replaceExpressionLabelSignsWithMathSigns();
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

  replaceExpressionLabelSignsWithMathSigns(): string {
    let expressionForEvaluation = this.expression;
    for (let [key, value] of Object.entries(this.operators)) {
      // Regex used to replace ALL occurrences
      const reg = new RegExp(`\\${value.label}`, 'g');
      expressionForEvaluation = expressionForEvaluation.replace(
        reg,
        value.sign
      );
    }
    return expressionForEvaluation;
  }

  handleOperator(symbol: string) {
    const continueFromPreviousResult = !!this.data.result
    if (continueFromPreviousResult) this.onContinueWithPreviousExpression()

    let allowAppendObj: { allow: boolean } = { allow: false };
    this.determineAllowBoolean(allowAppendObj, symbol);

    if (allowAppendObj.allow) {
      this.expression = this.expression + ' ' + symbol + ' ';
    } else {
      this.flagInvalidAction(null, EInvalidActions.APPEND_OPERATOR);
    }
  }

  determineAllowBoolean(allowAppendObj: { allow: boolean }, symbol: string) {
    const length: number = this.expression.length;
    // Empty input, allow minus
    if (!length && symbol === '−') {
      allowAppendObj.allow = true;
      // Non-empty input, last character is a number
    } else if (length) {
      const lastChar = this.expression[length - 1];
      const isNumber = !Number.isNaN(parseInt(lastChar));
      if (isNumber) {
        allowAppendObj.allow = true;
      }
    }
  }

  handleNumber(symbol: string) {
    // Non-dot case
    if (symbol !== '.') {
      this.expression = this.expression + symbol;
      // Dot case
    } else {
      const lastItem = this.getExpressionLastItem();
      if (lastItem && !Number.isNaN(+lastItem) && !lastItem.includes('.')) {
        this.expression = this.expression + symbol;
      } else {
        this.flagInvalidAction(null, 'expression ends with a dot');
      }
    }
  }

  getExpressionLastItem(): string {
    const expressionAsArr = this.getExpressionAsArrOfNumsAndOperators()
    const length = expressionAsArr.length
    return expressionAsArr[length - 1];
  }

  onAllClear() {
    this.expression = '';
    this.saveCurrentResultToHistory()
    this.clearResultLog()
  }

  onContinueWithPreviousExpression() {
    this.onAllClear()
    const historyLength = this.data.history.length
    const lastHistoryLog = this.data.history[historyLength - 1]
    this.expression = lastHistoryLog.evaluation ? lastHistoryLog.evaluation : ''
  }

  // Multiple dot input, dot on empty expression,
  // double operator input, invalid operations
  flagInvalidAction(e?: any, attemptedAction?: string | ECalsActions) {
    this.invalidAction = true;
    setTimeout(() => (this.invalidAction = false), 500);
    const errorParam = e ? e : attemptedAction ? attemptedAction : null
    this.logError(errorParam, this.expression)
  }

  constructor(public calculatorFacade: CalculatorFacade) {}

  ngOnInit(): void {
    this.subs.add(this.calculatorFacade.history$.subscribe(history => this.data.history = history))
    this.subs.add(this.calculatorFacade.result$.subscribe(result => this.data.result = result))
    this.subs.add(this.calculatorFacade.errors$.subscribe(errors => this.data.errors = errors))
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe()
  }
}
