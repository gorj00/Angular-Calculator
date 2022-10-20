import { Injectable } from '@angular/core';
import { ICalcOperators, IDetermineOperatorVals } from '../models/calculator.models';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root'})
export class CalculatorService {
  /**
   * Labels are used in calculator expression field, signs are used for mathjs' evaluation method
   */
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

  /**
   * Updates current expression with a passed value
   *
   * @param {string} newExp New expression
   */
  updateExpression(newExp: string) {
    this.expressionStr = newExp
    this.expressionSubject.next(newExp)
  }

  /**
   * Provides object filled with values related to determening the
   * operator change (positive to negative and vice versa)
   *
   * @param {string[]} expressionArr   Expression converted to array
   * @returns {IDetermineOperatorVals} Object with determanation related vals
   */
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

  /**
   * Operator change is handled differently for positive and negative
   * numbers; lastly, it forms expression from the array and updates the
   * expression property
   *
   * @param {string} numStr                        Expression's  number part as string
   * @param {('positive' | 'negative')} toOperator To which operator it should convert
   */
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

  /**
   * Operator change handling for expression with multiple number parts
   *
   * @param {(string | null)} secondToLast Item before the last one
   * @param {string[]} expressionArr       Expression converted to array
   */
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

  /**
   * Converts an expression to array made up from number parts and operators,
   * cleared of spaces
   *
   * @returns {string[]} Expression converted to an array
   */
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

  /**
   * Conversion of positive operator to negative and vice versa
   *
   * @param {(string | null)} sign Math operator as label
   * @returns {string}             Math operator as label
   */
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

  /**
   * Converts expression array back to string expression
   *
   * @param {string[]} arr       Expression converted to an array
   */
  formExpressionFromArr(arr: string[]) {
    let newExpression = ''
    arr.length &&
      arr.forEach((part) => {
        const isNum = !Number.isNaN(+part);
        newExpression += isNum ? part : ` ${part} `
      });
    this.updateExpression(newExpression)
  }

  /**
   * The mathjs evaluation methods requires that the operator signs are valid
   * math signs; the calculator operator labels are replaced with valid math signs
   *
   * @returns {string} Expression to be evaluated
   */
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

  /**
   * Provides boolean (in object so it can be handled in another function)
   * to help determine whether an operator may be appended
   * in CalculatorCompenent's `handleOperator`
   *
   * @param {{ allow: boolean }} allowAppendObj Object with passed boolean
   * @param {string} symbol                     Math operator label
   */
  determineAllowBoolean(allowAppendObj: { allow: boolean }, symbol: string) {
    const length: number = this.expressionStr.length;
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

  /**
   * Returns the last item (character) of the expression string
   *
   * @returns {string} Last character of the expression
   */
  getExpressionLastItem(): string {
    const expressionAsArr = this.getExpressionAsArrOfNumsAndOperators()
    const length = expressionAsArr.length
    return expressionAsArr[length - 1];
  }

}
