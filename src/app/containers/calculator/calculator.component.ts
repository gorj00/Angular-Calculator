import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ICalcHistory } from '../../models/calculator.models';
import * as moment from 'moment';
import * as math from 'mathjs';

@Component({
  selector: 'calc-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.less']
})
export class CalculatorComponent implements OnInit {
  expression: string = '0.'
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
        this.expression = this.expression + ' ' + symbol;
        break;
      case 'number':
        this.expression = this.expression + symbol;
        break;
      default:
        break;
    }
  }


  constructor() { }

  ngOnInit(): void {
  }

}
