import { expect } from 'chai';

import { loadTestData, MockValidator } from './utils.js';
import { Validator } from '../../validator.js';

describe('ProductValidator', () => {
  describe('JSON-LD', () => {
    let validator;

    beforeEach(() => {
      validator = new Validator();
      validator.registeredHandlers = {
        Product: [() => import('../Product.js')],
        AggregateRating: [() => import('../AggregateRating.js')],
        Review: [() => import('../Review.js')],
        Rating: [() => import('../Rating.js')],
        Person: [() => import('../Person.js')],
        ItemList: [MockValidator],
        Brand: [MockValidator],
        Offer: [() => import('../Offer.js')],
        Organization: [() => import('../Organization.js')],
        ListItem: [MockValidator],
        AggregateOffer: [() => import('../AggregateOffer.js')],
        PriceSpecification: [() => import('../PriceSpecification.js')],
        UnitPriceSpecification: [() => import('../UnitPriceSpecification.js')],
      };
      validator.globalHandlers = [];
    });

    it('should validate a correct product structure in valid1.json', async () => {
      const data = await loadTestData('product/valid1.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should validate a correct product structure in valid2.json', async () => {
      const data = await loadTestData('product/valid2.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should validate a correct product structure in valid3.json', async () => {
      const data = await loadTestData('product/valid3.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should validate a correct product structure in valid4.json', async () => {
      const data = await loadTestData('product/valid4.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should show warnings for recommended fields in only_offers.json', async () => {
      const data = await loadTestData('product/only_offers.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(2);
      expect(issues[0]).to.deep.include({
        issueMessage: 'Missing field "aggregateRating" (optional)',
        location: '35,693',
        severity: 'WARNING',
      });
      expect(issues[1]).to.deep.include({
        issueMessage: 'Missing field "review" (optional)',
        location: '35,693',
        severity: 'WARNING',
      });
    });

    it('should detect missing name in missing_name.json', async () => {
      const data = await loadTestData('product/missing_name.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage: 'Required attribute "name" is missing',
        location: '35,1095',
        severity: 'ERROR',
      });
    });

    it('should detect missing rating, review or offers in no_rating_review_offers.json', async () => {
      const data = await loadTestData(
        'product/no_rating_review_offers.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage:
          'One of the following attributes is required: "aggregateRating", "offers" or "review"',
        location: '35,350',
        severity: 'ERROR',
      });
    });

    it('should detect single note in review_single_note.json', async () => {
      const data = await loadTestData(
        'product/review_single_note.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage:
          'At least 2 notes, either positive or negative, are required',
        location: '35,1353',
        severity: 'WARNING',
      });
    });

    it('should detect missing price in offer_no_price.json', async () => {
      const data = await loadTestData('product/offer_no_price.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage:
          'One of the following conditions needs to be met: Required attribute "price" is missing or Required attribute "priceSpecification.price" is missing',
        location: '35,1121',
        severity: 'ERROR',
        path: [
          { type: 'Product', index: 0 },
          { property: 'offers', type: 'Offer' },
        ],
      });
    });

    it('should detect missing currency in offer_no_currency.json', async () => {
      const data = await loadTestData(
        'product/offer_no_currency.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage:
          'One of the following conditions needs to be met: Missing field "priceCurrency" (optional) or Missing field "priceSpecification.priceCurrency" (optional)',
        location: '35,1119',
        severity: 'ERROR',
        path: [
          { type: 'Product', index: 0 },
          { property: 'offers', type: 'Offer' },
        ],
      });
    });

    it('should detect missing availability in offer_no_availability.json', async () => {
      const data = await loadTestData(
        'product/offer_no_availability.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage: 'Missing field "availability" (optional)',
        location: '35,1105',
        severity: 'WARNING',
        path: [
          { type: 'Product', index: 0 },
          { property: 'offers', type: 'Offer' },
        ],
      });
    });

    it('should detect invalid date in offer_invalid_date.json', async () => {
      const data = await loadTestData(
        'product/offer_invalid_date.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage: 'Invalid type for attribute "priceValidUntil"',
        location: '35,1149',
        severity: 'WARNING',
        path: [
          { type: 'Product', index: 0 },
          { property: 'offers', type: 'Offer' },
        ],
      });
    });

    it('should detect missing low price in aggregate_offer_no_low_price.json', async () => {
      const data = await loadTestData(
        'product/aggregate_offer_no_low_price.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage: 'Required attribute "lowPrice" is missing',
        location: '35,1164',
        severity: 'ERROR',
        path: [
          { type: 'Product', index: 0 },
          { property: 'offers', type: 'AggregateOffer' },
        ],
      });
    });

    it('should detect missing currency in aggregate_offer_no_currency.json', async () => {
      const data = await loadTestData(
        'product/aggregate_offer_no_currency.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage: 'Required attribute "priceCurrency" is missing',
        location: '35,1159',
        severity: 'ERROR',
        path: [
          { type: 'Product', index: 0 },
          { property: 'offers', type: 'AggregateOffer' },
        ],
      });
    });

    it('should detect missing high price in aggregate_offer_no_high_price.json', async () => {
      const data = await loadTestData(
        'product/aggregate_offer_no_high_price.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage: 'Missing field "highPrice" (optional)',
        location: '35,1166',
        severity: 'WARNING',
        path: [
          { type: 'Product', index: 0 },
          { property: 'offers', type: 'AggregateOffer' },
        ],
      });
    });

    it('should detect missing offer count in aggregate_offer_no_count.json', async () => {
      const data = await loadTestData(
        'product/aggregate_offer_no_count.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage: 'Missing field "offerCount" (optional)',
        location: '35,1166',
        severity: 'WARNING',
        path: [
          { type: 'Product', index: 0 },
          { property: 'offers', type: 'AggregateOffer' },
        ],
      });
    });

    it('should detect missing rating count in rating_no_count.json', async () => {
      const data = await loadTestData('product/rating_no_count.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage:
          'One of the following conditions needs to be met: Required attribute "ratingCount" is missing or Required attribute "reviewCount" is missing',
        location: '35,409',
        severity: 'ERROR',
        path: [
          {
            index: 0,
            type: 'Product',
          },
          {
            property: 'aggregateRating',
            type: 'AggregateRating',
          },
        ],
      });
    });
  });
});
