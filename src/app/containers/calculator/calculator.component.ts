import { Component, OnInit } from '@angular/core';
import { ICalcHistory } from '../../models/calculator.models';
import * as moment from 'moment';
import * as math from 'mathjs';

@Component({
  selector: 'calc-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.less']
})
export class CalculatorComponent implements OnInit {
  expression: string = ''
  operatorsRegex: RegExp = / + | − | ÷ | × /
  invalidAction: boolean = false
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
      expression: '13 + 5 * 25',
      evaluation: math.evaluate('13 + 5 * 25 ^ 3'),
      error: null,
    }
  ]

  onChangeExpression(event: { symbol: string, type: string}) {
    const { symbol, type } = event;
    switch (type) {
      case 'operator':
        this.handleOperator(symbol)
        break;
      case 'number':
        this.handleNumber(symbol)
        break;
      case 'function':
        this.onCalcAction(symbol)
        break;
      default:
        break;
    }
  }

  onCalcAction(symbol: string) {
    switch (symbol) {
      case 'AC': // All clear
        this.onAllClear()
        break;

      default:
        break;
    }
  }

  handleOperator(symbol: string) {
    let allowAppendObj: { allow: boolean} = { allow: false }
    this.determineAllowBoolean(allowAppendObj, symbol)

    if (allowAppendObj.allow) {
      this.expression = this.expression + ' ' + symbol + ' '
    } else {
      this.flagInvalidAction()
    }
  }

  determineAllowBoolean(allowAppendObj: { allow: boolean}, symbol: string) {
    const length: number = this.expression.length
    // Empty input, allow minus
    if (!length && (symbol === '−')) {
      allowAppendObj.allow = true
    // Non-empty input, last character is a number
    } else if (length) {
      const lastChar = this.expression[length - 1]
      const isNumber = !Number.isNaN(parseInt(lastChar))
      if (isNumber) {
        allowAppendObj.allow = true
      }
    }
  }

  handleNumber(symbol: string) {
    // Non-dot case
    if (symbol !== '.') {
      this.expression = this.expression + symbol;
    // Dot case
    } else {
      const splitExpressionByOperators = this.expression.split(this.operatorsRegex)
      const lastEl = splitExpressionByOperators?.length ? splitExpressionByOperators.pop() : null
      if (lastEl && !Number.isNaN(+lastEl) && !lastEl.includes('.')) {
        this.expression = this.expression + symbol;
      } else {
        this.flagInvalidAction()
      }

    }
  }

  onAllClear() {
    this.expression = ''
  }

  // Multiple dot input, dot on empty expression, double operator input
  flagInvalidAction() {
    this.invalidAction = true
    setTimeout(
      () => this.invalidAction = false
      ,500
    )
  }


  constructor() { }

  ngOnInit(): void {
  }

}
