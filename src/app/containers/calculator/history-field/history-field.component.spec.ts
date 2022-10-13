import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryFieldComponent } from './history-field.component';

describe('HistoryFieldComponent', () => {
  let component: HistoryFieldComponent;
  let fixture: ComponentFixture<HistoryFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoryFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
