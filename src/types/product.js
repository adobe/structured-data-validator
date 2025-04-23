import BaseValidator from './base.js';

export default class ProductValidator extends BaseValidator {
  getConditions() {
    return [
      this.required('name'),
      this.ratingReviewOrOffers,
      this.offers,
      this.notesCount,
    ].map((c) => c.bind(this));
  }

  // TODO: Move to Offer/AggregateOffer validator
  offers(data) {
    if (!data.offers) {
      return null;
    }
    if (Array.isArray(data.offers)) {
      return data.offers
        .map((o) => {
          if (o['@type'] === 'AggregateOffer') {
            return this.aggregateOffer(o);
          } else if (o['@type'] === 'Offer') {
            return this.offer(o);
          }
          return [];
        })
        .flat();
    }
    if (data.offers['@type'] === 'AggregateOffer') {
      return this.aggregateOffer(data.offers);
    } else if (data.offers['@type'] === 'Offer') {
      return this.offer(data.offers);
    }
    return [];
  }

  offer(offer) {
    const issues = [];
    const conditions = [
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
    ];

    for (const condition of conditions) {
      const issue = condition(offer);
      if (Array.isArray(issue)) {
        issues.push(...issue);
      } else if (issue) {
        issues.push(issue);
      }
    }

    return issues;
  }

  aggregateOffer(offer) {
    const issues = [];
    const conditions = [
      this.required('lowPrice', 'number'),
      this.required('priceCurrency', 'currency'),
      this.recommended('highPrice', 'number'),
      this.recommended('offerCount', 'number'),
    ];

    for (const condition of conditions) {
      const issue = condition(offer);
      if (Array.isArray(issue)) {
        issues.push(...issue);
      } else if (issue) {
        issues.push(issue);
      }
    }

    return issues;
  }

  notesCount(data) {
    if (!data.review) {
      return null;
    }

    const issues = [];
    let notes = 0;

    const reviews = Array.isArray(data.review) ? data.review : [data.review];
    for (const review of reviews) {
      // positiveNotes and negativeNotes are optional, but if they are present, they must be correct
      if (
        (review.positiveNotes && review.positiveNotes.itemListElement) ||
        (review.negativeNotes && review.negativeNotes.itemListElement)
      ) {
        notes += review.positiveNotes?.itemListElement?.length || 0;
        notes += review.negativeNotes?.itemListElement?.length || 0;
      }
    }

    // Need to have at least 2 or zero notes
    if (notes === 1) {
      issues.push({
        issueMessage:
          'At least 2 notes, either positive or negative, are required',
        severity: 'WARNING',
        path: this.path,
      });
    }

    return issues;
  }

  ratingReviewOrOffers(data) {
    const issues = [];

    // One of the three is required
    if (!data.aggregateRating && !data.offers && !data.review) {
      issues.push({
        issueMessage:
          'One of the following attributes is required: "aggregateRating", "offers" or "review"',
        severity: 'ERROR',
        path: this.path,
      });
    }

    // If only offers is present, then aggregateRating and review are recommended
    if (data.offers && (!data.aggregateRating || !data.review)) {
      issues.push(this.recommended('aggregateRating', 'object')(data));
      issues.push(this.recommended('review', 'object')(data));
    }

    return issues;
  }
}
