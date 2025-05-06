import { expect } from 'chai';
import { join } from 'path';

import { loadTestData, MockValidator } from './utils.js';
import { Validator } from '../../validator.js';

describe('Schema.org Validator', () => {
  let validator;
  const schemaOrgPath = join(
    process.cwd(),
    'src',
    'types',
    '__tests__',
    'schemaorg-current-https.jsonld',
  );

  before(() => {
    validator = new Validator(schemaOrgPath);
    validator.globalHandlers = [() => import('../schemaOrg.js')];
    validator.registeredHandlers = {
      BreadcrumbList: [MockValidator],
      ListItem: [MockValidator],
      WebPage: [MockValidator],
      Product: [MockValidator],
      Review: [MockValidator],
      AggregateRating: [MockValidator],
      ItemList: [MockValidator],
      Rating: [MockValidator],
      Person: [MockValidator],
      AggregateOffer: [MockValidator],
      Brand: [MockValidator],
      Organization: [MockValidator],
      Offer: [MockValidator],
    };
  });

  describe('JSON-LD', () => {
    it('should do a schema.org validation on BreadcrumbList', async () => {
      const data = await loadTestData('breadcrumb/valid1.json', 'jsonld');

      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should do a schema.org validation on BreadcrumbList with multiple items', async () => {
      const data = await loadTestData('breadcrumb/valid2.json', 'jsonld');

      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should do a schema.org validation on Product with basic properties', async () => {
      const data = await loadTestData('product/valid1.json', 'jsonld');

      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should do a schema.org validation on Product with offer', async () => {
      const data = await loadTestData('product/valid2.json', 'jsonld');

      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should do a schema.org validation on Product with reviews', async () => {
      const data = await loadTestData('product/valid3.json', 'jsonld');

      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should do a schema.org validation on Product with aggregate rating', async () => {
      const data = await loadTestData('product/valid4.json', 'jsonld');

      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should return an error if invalid attribute was detected', async () => {
      const data = await loadTestData(
        'product/invalid_attribute.json',
        'jsonld',
      );

      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage:
          'Property "my-custom-attribute" for type "Product" is not supported by the schema.org specification',
        location: '35,492',
        severity: 'WARNING',
        path: [{ type: 'Product', index: 0 }],
        errorType: 'schemaOrg',
      });
    });

    it('should return an error if an invalid attribute in a subtype was detected', async () => {
      const data = await loadTestData(
        'breadcrumb/invalid-attribute.json',
        'jsonld',
      );

      const issues = await validator.validate(data);

      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        rootType: 'BreadcrumbList',
        issueMessage:
          'Property "my-custom-attribute" for type "ListItem" is not supported by the schema.org specification',
        location: '35,535',
        severity: 'WARNING',
        path: [
          { type: 'BreadcrumbList', index: 0 },
          {
            property: 'itemListElement',
            index: 2,
            length: 3,
            type: 'ListItem',
          },
        ],
        errorType: 'schemaOrg',
      });
    });
  });

  describe('Microdata', () => {
    it('should do a schema.org validation on BreadcrumbList', async () => {
      const data = await loadTestData(
        'breadcrumb/microdata-valid1.html',
        'microdata',
      );

      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });
  });

  describe('RDFa', () => {
    it('should do a schema.org validation on BreadcrumbList', async () => {
      const data = await loadTestData('breadcrumb/rdfa-valid1.html', 'rdfa');

      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });
  });
});
