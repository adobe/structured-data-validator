/**
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import BaseValidator from './base.js';

export default class ProductValidator extends BaseValidator {
  getConditions() {
    return [
      this.required('name'),
      this.ratingReviewOrOffers,
      this.notesCount,
    ].map((c) => c.bind(this));
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
        fieldNames: ['review.positiveNotes', 'review.negativeNotes'],
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
        fieldNames: ['aggregateRating', 'offers', 'review'],
      });
    }

    // If only offers is present, then aggregateRating and review are recommended
    if (data.offers && (!data.aggregateRating || !data.review)) {
      const aggregateRating = this.recommended(
        'aggregateRating',
        'object',
      )(data);
      if (aggregateRating) {
        issues.push(aggregateRating);
      }
      const review = this.recommended('review', 'object')(data);
      if (review) {
        issues.push(review);
      }
    }

    return issues;
  }
}
