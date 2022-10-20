import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { ICalcButton, ICalcOperators, ECalsActions } from '../../../models/calculator.models'

@Component({
  selector: 'calc-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.less'],
})
export class ButtonsComponent implements OnInit {
  @Input() operators: ICalcOperators = {};
  @Output() inputChange = new EventEmitter<{
    symbol: string;
    type: string;
    action?: ECalsActions;
  }>();

  calcButtons: ICalcButton[];

  constructor() {}

  /**
   * Forms multiple numbered calc buttons objects in a provided range
   *
   * @param {number} rangeStart Range start, inclusive
   * @param {number} rangeEnd   Range end, inclusive
   * @returns {ICalcButton[]}   Array of calc button objects
   */
  formNumberButtonsObjects(
    rangeStart: number,
    rangeEnd: number,
  ): ICalcButton[] {
    if (rangeStart < rangeEnd) {
      length = rangeEnd + 1 - rangeStart;
      const digitsArr: number[] = Array.from(
        {length},
        (v, k) => k + rangeStart,
      );
      const formedObjects: ICalcButton[] = digitsArr.map((digit) => ({
        color: 'primary',
        type: 'number',
        label: digit.toString(),
      }));
      return formedObjects;
    } else if (rangeEnd - rangeStart === 0)
      return this.handleZeroRange(rangeStart);
    return [];
  }

  /**
   * Forms single number calc button object for a provided number
   *
   * @param {number} rangeStart Number for which to create calc button object
   * @returns {ICalcButton[]}   Array with a single calc button object
   */
  handleZeroRange(rangeStart: number): ICalcButton[] {
    return [
      {
        color: 'primary',
        type: 'number',
        label: rangeStart.toString(),
      },
    ];
  }

  /**
   * Event to be emitted on a calc button click, informing the parent
   * about the symbol, type, and optionally an action
   *
   * @param {string} symbol         Calc button label
   * @param {string} type           Type (function | operator | number)
   * @param {ECalsActions} [action] Optional action
   */
  onButtonClick(symbol: string, type: string, action?: ECalsActions) {
    this.inputChange.emit({symbol, type, action});
  }

  /**
   * Populates calculator's buttons field with predefined buttons
   */
  populateButtonsOnInit() {
    this.calcButtons = [
      {
        color: 'info',
        type: 'function',
        label: 'AC',
        action: ECalsActions.ALL_CLEAR,
      },
      {
        color: 'info',
        type: 'function',
        label: '+/-',
        specialCol: '9',
        action: ECalsActions.CHANGE_OPERATOR,
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
        action: ECalsActions.EQUALS,
      },
      {
        color: 'info',
        type: 'operator',
        label: this.operators.plus.label,
        operator: this.operators.plus.sign,
      },
    ];
  }

  ngOnInit(): void {
    // Assigned in ngOnInit so we have operators @Input ready
    this.populateButtonsOnInit();
  }
}
