import { expect } from 'chai';
import ReviewValidator from '../review.js';
import { loadTestData } from './utils.js';

describe('ReviewValidator', () => {
  describe('JSON-LD', () => {
    let validator;

    beforeEach(() => {
      validator = new ReviewValidator('jsonld');
    });

    it('should validate a correct review structure in valid1.json', async () => {
      const data = await loadTestData('review/valid1.json', 'jsonld', 'Review');
      const issues = validator.validate(data);
      expect(issues).to.deep.equal([]);
    });

    it('should fail when author is missing', async () => {
      const data = await loadTestData(
        'review/invalid_missing_author.json',
        'jsonld',
        'Review',
      );
      const issues = validator.validate(data);
      expect(issues).to.deep.equal([
        {
          severity: 'ERROR',
          location: '35,402',
          issueMessage: 'Required attribute "author" is missing',
        },
        {
          severity: 'ERROR',
          location: '35,402',
          issueMessage: 'Required attribute "author.name" is missing',
        },
      ]);
    });

    it('should fail when reviewRating.ratingValue is missing', async () => {
      const data = await loadTestData(
        'review/invalid_missing_rating_value.json',
        'jsonld',
        'Review',
      );
      const issues = validator.validate(data);
      expect(issues).to.deep.equal([
        {
          severity: 'ERROR',
          location: '35,446',
          issueMessage:
            'Required attribute "reviewRating.ratingValue" is missing',
        },
      ]);
    });

    it('should fail when datePublished is missing', async () => {
      const data = await loadTestData(
        'review/invalid_missing_date_published.json',
        'jsonld',
        'Review',
      );
      const issues = validator.validate(data);
      expect(issues).to.deep.equal([
        {
          severity: 'WARNING',
          location: '35,435',
          issueMessage: 'Missing field "datePublished" (optional)',
        },
      ]);
    });

    it('should fail when reviewRating.bestRating is missing', async () => {
      const data = await loadTestData(
        'review/invalid_missing_best_rating.json',
        'jsonld',
        'Review',
      );
      const issues = validator.validate(data);
      expect(issues).to.deep.equal([
        {
          severity: 'WARNING',
          location: '35,447',
          issueMessage: 'Missing field "reviewRating.bestRating" (optional)',
        },
      ]);
    });

    it('should fail when rating value is outside the specified range', async () => {
      const data = await loadTestData(
        'review/invalid_rating_out_of_range.json',
        'jsonld',
        'Review',
      );
      const issues = validator.validate(data);
      expect(issues).to.deep.equal([
        {
          severity: 'ERROR',
          location: '35,468',
          issueMessage: 'Rating is outside the specified or default range',
        },
      ]);
    });

    it('should fail when itemReviewed is missing', async () => {
      const data = await loadTestData(
        'review/invalid_missing_item_reviewed.json',
        'jsonld',
        'Review',
      );
      const issues = validator.validate(data);
      expect(issues).to.deep.equal([
        {
          severity: 'ERROR',
          location: '35,388',
          issueMessage: 'Required attribute "itemReviewed" is missing',
        },
        {
          severity: 'ERROR',
          location: '35,388',
          issueMessage: 'Required attribute "itemReviewed.name" is missing',
        },
      ]);
    });
  });

  describe('RDFa', () => {
    let validator;

    beforeEach(() => {
      validator = new ReviewValidator('rdfa');
    });

    // TODO: Needs support for RDFa rel parsing in web-auto-extractor
    it.skip('should validate a correct review structure in rdfa-valid1.html', async () => {
      const data = await loadTestData(
        'review/rdfa-valid1.html',
        'rdfa',
        'Review',
      );
      const issues = validator.validate(data);
      expect(issues).to.deep.equal([]);
    });
  });
});
