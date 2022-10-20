import { Component, OnInit, Input } from '@angular/core';
import { ICalcHistory } from '../../../models/calculator.models';

@Component({
  selector: 'calc-history-field',
  templateUrl: './history-field.component.html',
  styleUrls: ['./history-field.component.less']
})
export class HistoryFieldComponent implements OnInit {
  @Input() history: ICalcHistory[] | null | undefined

  constructor() { }

  ngOnInit(): void {
  }

}
