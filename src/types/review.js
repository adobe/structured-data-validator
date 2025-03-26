import BaseValidator from './base.js';

export default class ReviewValidator extends BaseValidator {
  constructor(dataFormat, nested = false) {
    super();
    this.dataFormat = dataFormat;
    this.nested = nested;
  }

  getConditions() {
    const conditions = [
      this.required('author'),
      this.required('author.name'),

      // Documentation states reviewRating as required
      // Validator allows it to be missing
      this.required('reviewRating'),
      this.recommended('reviewRating.bestRating', 'number'),
      this.recommended('reviewRating.worstRating', 'number'),

      this.recommended('datePublished', 'date'),
    ];

    if (!this.nested) {
      conditions.push(
        this.required('itemReviewed'),
        this.required('itemReviewed.name'),
      );
    }

    return conditions.map((c) => c.bind(this));
  }
}
