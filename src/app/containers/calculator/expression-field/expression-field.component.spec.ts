import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpressionFieldComponent } from './expression-field.component';

describe('ExpressionFieldComponent', () => {
  let component: ExpressionFieldComponent;
  let fixture: ComponentFixture<ExpressionFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpressionFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpressionFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
