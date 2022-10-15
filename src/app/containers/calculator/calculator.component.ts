import { Component, OnInit } from '@angular/core';
import { ICalcHistory, ICalcOperators } from '../../models/calculator.models';
import * as moment from 'moment';
import * as math from 'mathjs';

@Component({
  selector: 'calc-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.less'],
})
export class CalculatorComponent implements OnInit {
  expression: string = '';
  result: string = '';
  operators: ICalcOperators = {
   plus:     { label: '+', sign: '+' },
   minus:    { label: '−', sign: '-' },
   divide:   { label: '÷', sign: '/' },
   multiply: { label: '×', sign: '*' }
  }
  operatorsRegex: RegExp = /(\s\+\s)|(\s\−\s)|(\s÷\s)|(\s×\s)/g;
  invalidAction: boolean = false;
  mockedHistory: ICalcHistory[] = [
    {
      datestamp: moment().subtract(2, 'minutes').valueOf(),
      expression: '13 + 5',
      evaluation: 18,
      error: null,
    },
    {
      datestamp: moment().subtract(1, 'minutes').valueOf(),
      expression: '13 /3 + 5',
      evaluation: math.evaluate('13 /3 + 5'),
      error: null,
    },
    {
      datestamp: moment().valueOf(),
      expression: '13 - 5 * 25',
      evaluation: math.evaluate('13 + 5 * 25 ^ 3'),
      error: null,
    },
  ];

  onChangeExpression(event: { symbol: string; type: string }) {
    const { symbol, type } = event;
    switch (type) {
      case 'operator':
        this.handleOperator(symbol);
        break;
      case 'number':
        this.handleNumber(symbol);
        break;
      case 'function':
        this.onCalcAction(symbol);
        break;
      default:
        break;
    }
  }

  onCalcAction(symbol: string) {
    switch (symbol) {
      case 'AC': // All clear
        this.onAllClear();
        break;
      case '=': // Equals
        this.onSolveExpression();
        break;
      default:
        break;
    }
  }

  onSolveExpression() {
    const lastItem = this.getExpressionLastItem();
    if (lastItem && !Number.isNaN(+lastItem)) {
      console.log(this.expression)
      const expressionWithMathSigns: string = this.replaceExpressionLabelSignsWithMathSigns()
      this.result = math.evaluate(expressionWithMathSigns).toString();
      console.log(expressionWithMathSigns, this.result)
    } else {
      this.flagInvalidAction()
    }
  }

  replaceExpressionLabelSignsWithMathSigns(): string {
    let expressionForEvaluation = this.expression
    for (let [key, value] of Object.entries(this.operators)) {
      // Regex used to replace ALL occurrences
      const reg = new RegExp(`\\${value.label}`, 'g')
      expressionForEvaluation = expressionForEvaluation.replace(reg, value.sign)
    }
    return expressionForEvaluation
  }

  handleOperator(symbol: string) {
    let allowAppendObj: { allow: boolean } = { allow: false };
    this.determineAllowBoolean(allowAppendObj, symbol);

    if (allowAppendObj.allow) {
      this.expression = this.expression + ' ' + symbol + ' ';
    } else {
      this.flagInvalidAction();
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
        this.flagInvalidAction();
      }
    }
  }

  getExpressionLastItem(): string | null | undefined {
    const splitExpressionByOperators = this.expression
      .split(this.operatorsRegex)
      // clear operators of white spaces
      .map((item) => item && item.replace(/\s/g, ''))
      // filter undefined values in array
      .filter((item) => item);
    return splitExpressionByOperators?.length
      ? splitExpressionByOperators.pop()
      : null;
  }

  onAllClear() {
    this.expression = '';
    this.result = '';
  }

  // Multiple dot input, dot on empty expression, double operator input
  flagInvalidAction() {
    this.invalidAction = true;
    setTimeout(() => (this.invalidAction = false), 500);
  }

  constructor() {}

  ngOnInit(): void {}
}
