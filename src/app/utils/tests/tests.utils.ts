import { ComponentFixture } from '@angular/core/testing';
import { ElementRef, DebugElement } from '@angular/core'
import { By } from '@angular/platform-browser';

export function click<T>(fixture: ComponentFixture<T>, element: ElementRef) {
  const el: HTMLElement = element.nativeElement;
  el.click();
  fixture.detectChanges();
}

export function queryByCss<T>(
  fixture: ComponentFixture<T>,
  selector: string,
): DebugElement {
  // The return type of DebugElement#query() is declared as DebugElement,
  // but the actual return type is DebugElement | null.
  // See https://github.com/angular/angular/issues/22449.
  const debugElement = fixture.debugElement.query(By.css(selector));
  // Fail on null so the return type is always DebugElement.
  if (!debugElement) {
    throw new Error(`queryByCss: Element with ${selector} not found`);
  }
  return debugElement;
}

export function findComponent<T>(
  fixture: ComponentFixture<T>,
  selector: string,
): DebugElement {
  return queryByCss(fixture, selector);
}

export function queryByTestAttr<T>(
  fixture: ComponentFixture<T>,
  testAttr: string,
): DebugElement {
  return queryByCss(fixture, `[data-test="${testAttr}"]`);
}
