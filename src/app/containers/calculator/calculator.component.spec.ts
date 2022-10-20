import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { ElementRef } from '@angular/core'
import { By } from '@angular/platform-browser';
import { CalculatorComponent } from './calculator.component';
import { calculatorFeature } from '../../store/calculator/calculator.feature';

describe('CalculatorComponent', () => {
  let component: CalculatorComponent;
  let fixture: ComponentFixture<CalculatorComponent>;

  function click(element: ElementRef) {
    const el: HTMLElement = element.nativeElement;
    el.click();
    fixture.detectChanges();
  }
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
      declarations: [ CalculatorComponent ],
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature(calculatorFeature),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('CALC ACTIONS', () => {
    describe('+/- (change operator)', () => {
      let successCases = [
        '3', ' − 3', '3 + 2', '3 − 2', '3 + 2 + 0', '3 × 2 + 0 − 4 + 3'
      ]
      let successCasesConverted = [
        ' − 3', '3', '3 − 2', '3 + 2', '3 + 2 − 0', '3 × 2 + 0 − 4 − 3'
      ]
      describe('should change the expression by converting the last operator', () => {
        let expressionField = fixture.debugElement.query(By.css('[data-test="calc-expression-field"]')).nativeElement
        successCases.forEach((test, i) => {
          it(`${i} - should change last operator in ${test}`, () => {
            component.calculatorService.updateExpression(test)
            expect(component.expression).toBe(successCasesConverted[i])
          })
        })
      })

      // describe('should log an error and keep the expression the same', () => {
      //   successCases.forEach((test, i) => {
      //     it('should', () => {
      //       expect(test).toBeTruthy()
      //     })
      //   })
      // })
    })
  })
});
