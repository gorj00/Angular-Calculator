import { Component, OnInit, Input } from '@angular/core';
import { ICalcHistory } from '../../../models/calculator.models';

@Component({
  selector: 'calc-expression-field',
  templateUrl: './expression-field.component.html',
  styleUrls: ['./expression-field.component.less']
})
export class ExpressionFieldComponent implements OnInit {
  @Input() expression: string;
  @Input() result: ICalcHistory | null;
  @Input() invalidAction: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
