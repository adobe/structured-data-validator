import { expect } from 'chai';

import { loadTestData, MockValidator } from './utils.js';
import { Validator } from '../../validator.js';

describe('AggregateRatingValidator', () => {
  describe('JSON-LD', () => {
    let validator;

    beforeEach(() => {
      validator = new Validator();
      validator.registeredHandlers = {
        AggregateRating: [() => import('../AggregateRating.js')],
        Restaurant: [MockValidator],
        PostalAddress: [MockValidator],
      };
    });

    it('should validate a correct aggregateRating structure in valid1.json', async () => {
      const data = await loadTestData('aggregateRating/valid1.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should fail when both ratingCount and reviewCount are missing', async () => {
      const data = await loadTestData(
        'aggregateRating/invalid_missing_counts.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues[0]).to.deep.include({
        severity: 'ERROR',
        location: '35,246',
        issueMessage:
          'One of the following conditions needs to be met: Required attribute "ratingCount" is missing or Required attribute "reviewCount" is missing',
      });
    });

    it('should fail when ratingValue is missing', async () => {
      const data = await loadTestData(
        'aggregateRating/invalid_missing_rating_value.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues[0]).to.deep.include({
        severity: 'ERROR',
        location: '35,245',
        issueMessage: 'Required attribute "ratingValue" is missing',
      });
    });

    it('should fail when ratingValue is outside the specified range', async () => {
      const data = await loadTestData(
        'aggregateRating/invalid_rating_out_of_range.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues[0]).to.deep.include({
        severity: 'ERROR',
        location: '35,267',
        issueMessage: 'Rating is outside the specified or default range',
      });
    });

    it('should fail when itemReviewed is missing', async () => {
      const data = await loadTestData(
        'aggregateRating/invalid_missing_item_reviewed.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(2);
      expect(issues[0]).to.deep.include({
        severity: 'ERROR',
        location: '35,187',
        issueMessage: 'Required attribute "itemReviewed" is missing',
      });
      expect(issues[1]).to.deep.include({
        severity: 'ERROR',
        location: '35,187',
        issueMessage: 'Required attribute "itemReviewed.name" is missing',
      });
    });
  });
});
