import { Component, OnInit } from '@angular/core';
import { ICalcButton } from '../../models/calculator.models'

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.less']
})
export class CalculatorComponent implements OnInit {
  calcButtons: ICalcButton[] = [
     {
      color: 'info',
      type: 'function',
      label: 'AC',
      function: () => {},
     },
     {
      color: 'info',
      type: 'function',
      label: '+/-',
      function: () => {},
      specialCol: '9',
     },
     ...this.formNumberButtonsObjects(7, 9),
     {
      color: 'info',
      type: 'operator',
      label: '÷',
     },
     ...this.formNumberButtonsObjects(4, 6),
     {
      color: 'info',
      type: 'operator',
      label: '×',
      function: () => {},
     },
     ...this.formNumberButtonsObjects(1, 3),

     {
      color: 'info',
      type: 'operator',
      label: '−',
      function: () => {},
     },
     ...this.formNumberButtonsObjects(0, 0),
     {
      color: 'info',
      type: 'operator',
      label: '.',
      function: () => {},
     },
     {
      color: 'info',
      type: 'operator',
      label: '=',
      function: () => {},
     },
     {
      color: 'info',
      type: 'operator',
      label: '+',
      function: () => {},
     },
  ]

  constructor() { }

  formNumberButtonsObjects(rangeStart: number, rangeEnd: number): ICalcButton[] {
    if (rangeStart < rangeEnd) {
      length = rangeEnd + 1 - rangeStart
      const digitsArr: number[] = Array.from({length},(v,k)=>k+rangeStart)
      const formedObjects: ICalcButton[] = digitsArr.map(digit => ({
          color: 'primary',
          type: 'number',
          label: digit.toString(),
      }))
      return formedObjects
    } else if ((rangeEnd - rangeStart) === 0) return this.handleZeroRange(rangeStart)
    return []
  }

  handleZeroRange(rangeStart: number): ICalcButton[] {
    return [{
        color: 'primary',
        type: 'number',
        label: rangeStart.toString(),
    }]
  }

  ngOnInit(): void {
  }

}
