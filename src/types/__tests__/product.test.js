import { expect } from 'chai';
import ProductValidator from '../product.js';
import { loadTestData } from './utils.js';

describe('ProductValidator', () => {
  describe('JSON-LD', () => {
    let validator;

    beforeEach(() => {
      validator = new ProductValidator('jsonld');
    });

    it('should validate a correct product structure in valid1.json', async () => {
      const data = await loadTestData(
        'product/valid1.json',
        'jsonld',
        'Product',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should validate a correct product structure in valid2.json', async () => {
      const data = await loadTestData(
        'product/valid2.json',
        'jsonld',
        'Product',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should validate a correct product structure in valid3.json', async () => {
      const data = await loadTestData(
        'product/valid3.json',
        'jsonld',
        'Product',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should validate a correct product structure in valid4.json', async () => {
      const data = await loadTestData(
        'product/valid4.json',
        'jsonld',
        'Product',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should show warnings for recommended fields in only_offers.json', async () => {
      const data = await loadTestData(
        'product/only_offers.json',
        'jsonld',
        'Product',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(2);
      expect(issues[0]).to.deep.equal({
        issueMessage: 'Missing field "aggregateRating" (optional)',
        severity: 'WARNING',
      });
      expect(issues[1]).to.deep.equal({
        issueMessage: 'Missing field "review" (optional)',
        severity: 'WARNING',
      });
    });

    it('should detect missing name in missing_name.json', async () => {
      const data = await loadTestData(
        'product/missing_name.json',
        'jsonld',
        'Product',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage: 'Required attribute "name" is missing',
        severity: 'ERROR',
      });
    });

    it('should detect missing rating, review or offers in no_rating_review_offers.json', async () => {
      const data = await loadTestData(
        'product/no_rating_review_offers.json',
        'jsonld',
        'Product',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage:
          'One of the following attributes is required: "aggregateRating", "offers" or "review"',
        severity: 'ERROR',
      });
    });

    it('should detect single note in review_single_note.json', async () => {
      const data = await loadTestData(
        'product/review_single_note.json',
        'jsonld',
        'Product',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage:
          'At least 2 notes, either positive or negative, are required',
        severity: 'WARNING',
      });
    });

    it('should detect missing price in offer_no_price.json', async () => {
      const data = await loadTestData(
        'product/offer_no_price.json',
        'jsonld',
        'Product',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage:
          'One of the following conditions needs to be met: Required attribute "price" is missing or Required attribute "priceSpecification.price" is missing',
        severity: 'ERROR',
      });
    });

    it('should detect missing currency in offer_no_currency.json', async () => {
      const data = await loadTestData(
        'product/offer_no_currency.json',
        'jsonld',
        'Product',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage:
          'One of the following conditions needs to be met: Missing field "priceCurrency" (optional) or Missing field "priceSpecification.priceCurrency" (optional)',
        severity: 'ERROR',
      });
    });

    it('should detect missing availability in offer_no_availability.json', async () => {
      const data = await loadTestData(
        'product/offer_no_availability.json',
        'jsonld',
        'Product',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage: 'Missing field "availability" (optional)',
        severity: 'WARNING',
      });
    });

    it('should detect invalid date in offer_invalid_date.json', async () => {
      const data = await loadTestData(
        'product/offer_invalid_date.json',
        'jsonld',
        'Product',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage: 'Invalid type for attribute "priceValidUntil"',
        severity: 'WARNING',
      });
    });

    it('should detect missing low price in aggregate_offer_no_low_price.json', async () => {
      const data = await loadTestData(
        'product/aggregate_offer_no_low_price.json',
        'jsonld',
        'Product',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage: 'Required attribute "lowPrice" is missing',
        severity: 'ERROR',
      });
    });

    it('should detect missing currency in aggregate_offer_no_currency.json', async () => {
      const data = await loadTestData(
        'product/aggregate_offer_no_currency.json',
        'jsonld',
        'Product',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage: 'Required attribute "priceCurrency" is missing',
        severity: 'ERROR',
      });
    });

    it('should detect missing high price in aggregate_offer_no_high_price.json', async () => {
      const data = await loadTestData(
        'product/aggregate_offer_no_high_price.json',
        'jsonld',
        'Product',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage: 'Missing field "highPrice" (optional)',
        severity: 'WARNING',
      });
    });

    it('should detect missing offer count in aggregate_offer_no_count.json', async () => {
      const data = await loadTestData(
        'product/aggregate_offer_no_count.json',
        'jsonld',
        'Product',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage: 'Missing field "offerCount" (optional)',
        severity: 'WARNING',
      });
    });
  });
});
