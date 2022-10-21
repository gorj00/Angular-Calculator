import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { CalculatorComponent } from './calculator.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { ExpressionFieldComponent } from './expression-field/expression-field.component';
import { calculatorFeature } from '../../store/calculator/calculator.feature';
import { findComponent, queryByCss, click, queryByTestAttr } from '../../utils/tests/tests.utils'

describe('CalculatorComponent', () => {
  let component: CalculatorComponent;
  let fixture: ComponentFixture<CalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalculatorComponent, ButtonsComponent, ExpressionFieldComponent ],
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

  describe('CALC ACTIONS', () => {
    describe('+/- (change operator)', () => {
      const successCases = [
        '3',
        ' − 3',
        '3 + 2',
        '3 − 2',
        '3 + 2 + 0',
        '3 + 2 − 0',
        '3 × 2 + 0 − 4 + 3',
      ]
      const successCasesConverted = [
        ' − 3',
        '3',
        '3 − 2',
        '3 + 2',
        '3 + 2 − 0',
        '3 + 2 + 0',
        '3 × 2 + 0 − 4 − 3',
      ]
      const failureCases = [
        '',
        '0',
        ' − ',
        '3 + ',
        '3 − ',
        '3 + 2 − ',
        '3 + 2 + ',
        '3 + 2 ÷ ',
        '3 + 2 × ',
      ]
      describe('should change the expression by converting the last operator', () => {
        successCases.forEach((test, i) => {
          it(`${i} - should change last operator (${test})`, () => {
            component.calculatorService.updateExpression(test)
            const buttonsComponent = queryByTestAttr(fixture, 'calc-button-+/-')

            click(fixture, buttonsComponent)

            const expressionFieldComponent = findComponent(fixture, 'calc-expression-field')
            const expressionField = expressionFieldComponent.nativeElement
            // Remove spaces
            const expressionFieldText = expressionField.textContent.slice(1, -1)
            expect(expressionFieldText).toBe(successCasesConverted[i])
          })
        })
      })

      describe('should log an error and keep the expression the same', () => {
        failureCases.forEach((test, i) => {
          it(`${i} - should NOT change the expression (${test})`, () => {
            component.calculatorService.updateExpression(test)
            const buttonsComponent = queryByTestAttr(fixture, 'calc-button-+/-')

            click(fixture, buttonsComponent)

            const expressionFieldComponent = findComponent(fixture, 'calc-expression-field')
            const expressionField = expressionFieldComponent.nativeElement
            // Remove spaces
            const expressionFieldText = expressionField.textContent.slice(1, -1)
            expect(expressionFieldText).toBe(test)
          })
        })

        // TODO: logging errors check
      })
    })
  })
});
