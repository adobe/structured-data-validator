import BaseValidator from './base.js';

export default class PriceSpecificationValidator extends BaseValidator {
  getConditions() {
    return [
      this.or(
        this.required('price', 'number'),
        this.required('priceSpecification.price', 'number'),
      ),
      this.recommended('availability'),
      this.or(
        this.recommended('priceCurrency', 'currency'),
        this.recommended('priceSpecification.priceCurrency', 'currency'),
      ),
      this.recommended('priceValidUntil', 'date'),
    ].map((c) => c.bind(this));
  }
}
