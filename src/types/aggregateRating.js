import RatingValidator from './Rating.js';

export default class AggregateRatingValidator extends RatingValidator {
  getConditions() {
    const conditions = super.getConditions();

    conditions.push(
      this.or(
        this.required('ratingCount', 'number'),
        this.required('reviewCount', 'number'),
      ),
    );

    // If not embedded into other type, itemReviewed is required
    if (this.path.length === 1) {
      conditions.push(
        this.required('itemReviewed'),
        this.required('itemReviewed.name'),
      );
    }

    return conditions.map((c) => c.bind(this));
  }
}
