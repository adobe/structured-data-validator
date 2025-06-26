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
import { expect } from 'chai';

import { loadTestData, MockValidator } from './utils.js';
import { Validator } from '../../validator.js';

describe('ReviewValidator', () => {
  describe('JSON-LD', () => {
    let validator;

    beforeEach(() => {
      validator = new Validator();
      validator.registeredHandlers = {
        ...validator.registeredHandlers,
        Restaurant: [MockValidator],
        PostalAddress: [MockValidator],
      };
      validator.globalHandlers = [];
    });

    it('should validate a correct review structure in valid1.json', async () => {
      const data = await loadTestData('Review/valid1.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.deep.equal([]);
    });

    it('should fail when author is missing', async () => {
      const data = await loadTestData(
        'Review/invalid_missing_author.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        severity: 'ERROR',
        location: '35,403',
        issueMessage: 'Required attribute "author" is missing',
      });
    });

    it('should fail when reviewRating.ratingValue is missing', async () => {
      const data = await loadTestData(
        'Review/invalid_missing_rating_value.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        severity: 'ERROR',
        location: '35,447',
        issueMessage: 'Required attribute "ratingValue" is missing',
        path: [
          { type: 'Review', index: 0 },
          { property: 'reviewRating', type: 'Rating' },
        ],
      });
    });

    it('should fail when datePublished is missing', async () => {
      const data = await loadTestData(
        'Review/invalid_missing_date_published.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        severity: 'WARNING',
        location: '35,436',
        issueMessage: 'Missing field "datePublished" (optional)',
      });
    });

    it('should fail when reviewRating.bestRating is missing', async () => {
      const data = await loadTestData(
        'Review/invalid_missing_best_rating.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        severity: 'WARNING',
        location: '35,448',
        issueMessage: 'Missing field "bestRating" (optional)',
        path: [
          { type: 'Review', index: 0 },
          { property: 'reviewRating', type: 'Rating' },
        ],
      });
    });

    it('should fail when rating value is outside the specified range', async () => {
      const data = await loadTestData(
        'Review/invalid_rating_out_of_range.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        severity: 'ERROR',
        location: '35,469',
        issueMessage: 'Rating is outside the specified or default range',
      });
    });

    it('should fail when itemReviewed is missing', async () => {
      const data = await loadTestData(
        'Review/invalid_missing_item_reviewed.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(2);
      expect(issues[0]).to.deep.include({
        severity: 'ERROR',
        location: '35,389',
        issueMessage: 'Required attribute "itemReviewed" is missing',
      });
      expect(issues[1]).to.deep.include({
        severity: 'ERROR',
        location: '35,389',
        issueMessage: 'Required attribute "itemReviewed.name" is missing',
      });
    });
  });

  describe('RDFa', () => {
    let validator;

    beforeEach(() => {
      validator = new Validator();
      validator.registeredHandlers = {
        Review: [() => import('../Review.js')],
      };
      validator.globalHandlers = [];
    });

    // TODO: Needs support for RDFa rel parsing in web-auto-extractor
    it.skip('should validate a correct review structure in rdfa-valid1.html', async () => {
      const data = await loadTestData('Review/rdfa-valid1.html', 'rdfa');
      const issues = await validator.validate(data);
      expect(issues).to.deep.equal([]);
    });
  });
});
