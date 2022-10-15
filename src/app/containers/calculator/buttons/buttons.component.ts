import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { ICalcButton, ICalcOperators } from '../../../models/calculator.models'

@Component({
  selector: 'calc-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.less']
})
export class ButtonsComponent implements OnInit {
  @Input() operators: ICalcOperators = {};
  @Output() inputChange = new EventEmitter<{ symbol: string, type: string}>();

  calcButtons: ICalcButton[];

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

  onButtonClick(symbol: string, type: string) {
    this.inputChange.emit({ symbol, type})
  }

  populateButtonsOnInit() {
    this.calcButtons = [
      {
       color: 'info',
       type: 'function',
       label: 'AC',
      },
      {
       color: 'info',
       type: 'function',
       label: '+/-',
       specialCol: '9',
      },
      ...this.formNumberButtonsObjects(7, 9),
      {
       color: 'info',
       type: 'operator',
       label: this.operators.divide.label,
       operator: this.operators.divide.sign,
      },
      ...this.formNumberButtonsObjects(4, 6),
      {
       color: 'info',
       type: 'operator',
       label: this.operators?.multiply?.label,
       operator: this.operators.multiply.sign,
      },
      ...this.formNumberButtonsObjects(1, 3),

      {
       color: 'info',
       type: 'operator',
       label: this.operators?.minus?.label,
       operator: this.operators.minus.sign,
      },
      ...this.formNumberButtonsObjects(0, 0),
      {
       color: 'info',
      //  handled as number
       type: 'number',
       label: '.',
      },
      {
       color: 'info',
       type: 'function',
       label: '=',
      },
      {
       color: 'info',
       type: 'operator',
       label: this.operators.plus.label,
       operator: this.operators.plus.sign,    },
   ]

  }

  ngOnInit(): void {
    // Assigned in ngOnInit so we have operators @Input ready
    this.populateButtonsOnInit()
  }

}
