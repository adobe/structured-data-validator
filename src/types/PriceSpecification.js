import BaseValidator from './base.js';

export default class PriceSpecificationValidator extends BaseValidator {
  getConditions() {
    return [
      this.required('price', 'number'),
      this.recommended('priceCurrency', 'currency'),
    ].map((c) => c.bind(this));
  }
}
