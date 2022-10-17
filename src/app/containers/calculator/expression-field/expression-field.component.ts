import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'calc-expression-field',
  templateUrl: './expression-field.component.html',
  styleUrls: ['./expression-field.component.less']
})
export class ExpressionFieldComponent implements OnInit {
  @Input() expression: string;
  @Input() result: string;
  @Input() invalidAction: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
