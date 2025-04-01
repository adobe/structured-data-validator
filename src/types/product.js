import BaseValidator from './base.js';
import AggregateRatingValidator from './aggregateRating.js';
import ReviewValidator from './review.js';

export default class ProductValidator extends BaseValidator {
  constructor(dataFormat) {
    super();
    this.dataFormat = dataFormat;
  }

  getConditions() {
    return [
      this.required('name'),
      this.ratingReviewOrOffers,
      this.aggregateRating,
      this.offers,
      this.review,
    ].map((c) => c.bind(this));
  }

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

  aggregateRating(data) {
    if (!data.aggregateRating) {
      return null;
    }
    return new AggregateRatingValidator(this.dataFormat, true).validate(
      data.aggregateRating,
    );
  }

  review(data) {
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

      issues.push(
        ...new ReviewValidator(this.dataFormat, true).validate(review),
      );
    }

    // Need to have at least 2 or zero notes
    if (notes === 1) {
      issues.push({
        issueMessage:
          'At least 2 notes, either positive or negative, are required',
        severity: 'WARNING',
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
