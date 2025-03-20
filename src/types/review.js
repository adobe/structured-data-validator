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
      // While docs say reviewRating is required, validator allows it to be missing
      // this.required('reviewRating'),
      // positiveNotes and negativeNotes are optional, but if they are present, they must be correct
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
