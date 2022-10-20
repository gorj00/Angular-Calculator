import { Injectable } from '@angular/core';
import { ICalcOperators, IDetermineOperatorVals } from '../models/calculator.models';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root'})
export class CalculatorService {
  operators: ICalcOperators = {
    plus: { label: '+', sign: '+' },
    minus: { label: '−', sign: '-' },
    divide: { label: '÷', sign: '/' },
    multiply: { label: '×', sign: '*' },
  };
  operatorsRegex: RegExp = /(\s\+\s)|(\s\−\s)|(\s÷\s)|(\s×\s)/g;
  private expressionStr = ''
  private expressionSubject = new BehaviorSubject('');
  public expressionAsObs$ = this.expressionSubject.asObservable();

  constructor() {}

  updateExpression(newExp: string) {
    this.expressionStr = newExp
    this.expressionSubject.next(newExp)
  }

  getChangeOperatorDeterminationVars(
    expressionArr: string[]
  ): IDetermineOperatorVals {
    const length = expressionArr.length
    const last = expressionArr[length - 1];
    const secondToLast = length > 1 ? expressionArr[length - 2] : null;
    const operatorIsMinus = secondToLast === this.operators.minus.label;
    const operatorIsPlus = secondToLast === this.operators.plus.label;
    return { last, secondToLast, operatorIsMinus, operatorIsPlus };
  }

  changeOperatorForSingleNumber(
    numStr: string,
    toOperator: 'positive' | 'negative'
  ) {
    switch (toOperator) {
      case 'positive': {
        const convertedExpressionArr = [numStr];
        this.formExpressionFromArr(convertedExpressionArr);
        break;
      }
      case 'negative': {
        const convertedExpressionArr = [this.operators.minus.label, numStr];
        this.formExpressionFromArr(convertedExpressionArr);
        break;
      }
      default:
        break;
    }
  }

  changeOperatorOfLastNumberInMultiple(
    secondToLast: string | null,
    expressionArr: string[]
  ) {
    const length = expressionArr.length
    const operatorConverted = this.convertLabelSign(secondToLast);
    const convertedExpressionArr = [...expressionArr];
    convertedExpressionArr[length - 2] = operatorConverted;
    this.formExpressionFromArr(convertedExpressionArr);
  }

  getExpressionAsArrOfNumsAndOperators(): string[] {
    return (
      this.expressionStr
        .split(this.operatorsRegex)
        // clear operators of white spaces
        .map((item) => item && item.replace(/\s/g, ''))
        // clear out undefined items
        .filter((item) => item)
    );
  }

  convertLabelSign(sign: string | null): string {
    switch (sign) {
      case this.operators.plus.label:
        return this.operators.minus.label;
      case this.operators.minus.label:
        return this.operators.plus.label;
      default:
        return '';
    }
  }

  formExpressionFromArr(arr: string[]) {
    this.updateExpression('')
    arr.length &&
      arr.forEach((part) => {
        const isNum = !Number.isNaN(+part);
        this.updateExpression(this.expressionStr + isNum ? part : ` ${part} `)
      });
  }

  replaceExpressionLabelSignsWithMathSigns(): string {
    let expressionForEvaluation = this.expressionStr;
    for (let [key, value] of Object.entries(this.operators)) {
      // Regex used to replace ALL occurrences
      const reg = new RegExp(`\\${value.label}`, 'g');
      expressionForEvaluation = expressionForEvaluation.replace(
        reg,
        value.sign
      );
    }
    return expressionForEvaluation;
  }

  determineAllowBoolean(allowAppendObj: { allow: boolean }, symbol: string) {
    const length: number = this.expressionStr.length;
    console.log(length)
    // Empty input, allow minus
    if (!length && symbol === '−') {
      allowAppendObj.allow = true;
      // Non-empty input, last character is a number
    } else if (length) {
      const lastChar = this.expressionStr[length - 1];
      const isNumber = !Number.isNaN(parseInt(lastChar));
      if (isNumber) {
        allowAppendObj.allow = true;
      }
    }
  }

  getExpressionLastItem(): string {
    const expressionAsArr = this.getExpressionAsArrOfNumsAndOperators()
    const length = expressionAsArr.length
    return expressionAsArr[length - 1];
  }

}
