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
        this.required('priceCurrency', 'currency'),
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
    if (Array.isArray(data.review)) {
      return data.review
        .map((r) => new ReviewValidator(this.dataFormat, true).validate(r))
        .flat();
    }
    return new ReviewValidator(this.dataFormat, true).validate(data.review);
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
