import BaseValidator from './base.js';

export default class ReviewValidator extends BaseValidator {
  getConditions() {
    const conditions = [
      this.required('author'),

      // Documentation states reviewRating as required
      // Validator allows it to be missing
      this.required('reviewRating'),

      this.recommended('datePublished', 'date'),
    ];

    if (this.path.length === 1) {
      conditions.push(
        this.required('itemReviewed'),
        this.required('itemReviewed.name'),
      );
    }

    return conditions.map((c) => c.bind(this));
  }
}
