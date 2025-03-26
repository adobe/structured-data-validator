import BaseValidator from './base.js';

export default class AggregateRatingValidator extends BaseValidator {
  constructor(dataFormat, nested = false) {
    super();
    this.dataFormat = dataFormat;
    this.nested = nested;
  }

  getConditions() {
    const conditions = [
      this.or(
        this.required('ratingCount', 'number'),
        this.required('reviewCount', 'number'),
      ),
      this.required('ratingValue'),
      this.validateRange,

      // Those fields are listed as recommended in documentation
      // BUT: Google validator does not show warnings and assumes default values 0 and 5.
      this.recommended('bestRating', 'number'),
      this.recommended('worstRating', 'number'),
    ];

    // If not embedded into other type, itemReviewed is required
    // TODO: Write test for this
    if (!this.nested) {
      conditions.push(
        this.required('itemReviewed'),
        this.required('itemReviewed.name'),
      );
    }

    return conditions.map((c) => c.bind(this));
  }

  // TODO: Write test for this
  validateRange(data) {
    // If number or if it can be parsed as number
    // For % and / values, Google ignores the range
    const from = data.worstRating || 0;
    const to = data.bestRating || 5;
    let value = data.ratingValue;
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
          severity: 'ERROR',
        };
      }
    }

    return null;
  }
}
