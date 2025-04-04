import BaseValidator from './base.js';

export default class ReviewValidator extends BaseValidator {
  constructor(dataFormat, location, nested = false) {
    super(dataFormat, location);
    this.nested = nested;
  }

  getConditions() {
    const conditions = [
      this.required('author'),
      this.required('author.name'),

      // Documentation states reviewRating as required
      // Validator allows it to be missing
      this.required('reviewRating'),
      this.required('reviewRating.ratingValue'),
      this.recommended('reviewRating.bestRating', 'number'),
      this.recommended('reviewRating.worstRating', 'number'),
      this.validateRange,

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

  validateRange(data) {
    const { reviewRating } = data;
    if (!reviewRating) {
      return null;
    }

    // If number or if it can be parsed as number
    // For % and / values, Google ignores the range
    const from = reviewRating.worstRating || 0;
    const to = reviewRating.bestRating || 5;
    let value = reviewRating.ratingValue;
    if (typeof value === 'string') {
      // Try to parse as number
      value = parseFloat(value);
      if (!isNaN(value)) {
        return null;
      }
    }

    if (typeof value === 'number') {
      if (value < from || value > to) {
        return {
          issueMessage: `Rating is outside the specified or default range`,
          location: this.location,
          severity: 'ERROR',
        };
      }
    }

    return null;
  }
}
