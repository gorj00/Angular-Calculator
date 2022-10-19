import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorComponent } from './calculator.component';

describe('CalculatorComponent', () => {
  let component: CalculatorComponent;
  let fixture: ComponentFixture<CalculatorComponent>;
  // expression: string = ''; //n
  // expression: string = '0'; //n
  // expression: string = ' − '; // n
  // expression: string = ' ÷ '; // n
  // expression: string = ' × '; // n
  // expression: string = '3'; //c
  // expression: string = ' − 3'; // c
  // expression: string = '3 + '; //n
  // expression: string = '3 − '; // n
  // expression: string = '3 + 2'; // c
  // expression: string = '3 − 2'; //c
  // expression: string = '3 + 2 − '; //n
  // expression: string = '3 + 2 + '; //n
  // expression: string = '3 + 2 ÷ '; //n
  // expression: string = '3 + 2 × '; //
  // expression: string = '3 + 2 + 0'; //c
  // expression: string = '3 × 2 + 0 − 4 + 3'; //c

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalculatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
