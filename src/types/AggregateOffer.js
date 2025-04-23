import BaseValidator from './base.js';

export default class PriceSpecificationValidator extends BaseValidator {
  getConditions() {
    return [
      this.required('lowPrice', 'number'),
      this.required('priceCurrency', 'currency'),
      this.recommended('highPrice', 'number'),
      this.recommended('offerCount', 'number'),
    ].map((c) => c.bind(this));
  }
}
