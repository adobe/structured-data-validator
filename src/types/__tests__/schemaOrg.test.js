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
import { join } from 'path';
import { readFileSync } from 'fs';

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

  const schemaOrgJson = JSON.parse(readFileSync(schemaOrgPath, 'utf8'));

  before(() => {
    validator = new Validator(schemaOrgJson);
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
    const files = [
      '3DModel/valid1.json',
      'AggregateRating/valid1.json',
      'Brand/valid1.json',
      'Breadcrumb/valid1.json',
      'Breadcrumb/valid2.json',
      'Certification/valid1.json',
      'Certification/valid2.json',
      'DefinedRegion/valid1.json',
      'DefinedRegion/valid2.json',
      'ImageObject/valid1.json',
      'ImageObject/valid2.json',
      'MerchantReturnPolicy/valid1.json',
      'MerchantReturnPolicy/valid2.json',
      'MerchantReturnPolicy/valid3.json',
      'Offer/valid1.json',
      'Offer/valid2.json',
      'Offer/valid3.json',
      'Offer/valid4.json',
      'Offer/valid5.json',
      'Offer/valid6.json',
      'Offer/valid7.json',
      'Offer/valid8.json',
      'Offer/valid9.json',
      'OfferShippingDetails/valid1.json',
      'OfferShippingDetails/valid2.json',
      'Organization/valid.json',
      'PeopleAudience/valid1.json',
      'PeopleAudience/valid2.json',
      'PeopleAudience/valid3.json',
      'Person/valid.json',
      'PriceSpecification/valid1.json',
      'PriceSpecification/valid2.json',
      'Product/valid1.json',
      'Product/valid2.json',
      'Product/valid3.json',
      'Product/valid4.json',
      'ProductMerchant/valid1.json',
      'ProductMerchant/valid2.json',
      'ProductMerchant/valid3.json',
      'Recipe/valid1.json',
      'Review/valid1.json',
      'ShippingDeliveryTime/valid1.json',
      'SizeSpecification/valid1.json',
      'VideoObject/valid1.json',
      'VideoObject/valid2.json',
      'VideoObject/valid3.json',
      'Clip/valid1.json',
      'SeekToAction/valid1.json',
      'BroadcastEvent/valid1.json',
      'VideoObject/valid4.json',
    ];

    files.forEach((file) => {
      it(`should do a schema.org validation on ${file}`, async () => {
        const data = await loadTestData(file, 'jsonld');

        const issues = await validator.validate(data);
        expect(issues).to.have.lengthOf(0);
      });
    });

    it('should return an error if invalid attribute was detected', async () => {
      const data = await loadTestData(
        'Product/invalid_attribute.json',
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
        'Breadcrumb/invalid-attribute.json',
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
        'Breadcrumb/microdata-valid1.html',
        'microdata',
      );

      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });
  });

  describe('RDFa', () => {
    it('should do a schema.org validation on BreadcrumbList', async () => {
      const data = await loadTestData('Breadcrumb/rdfa-valid1.html', 'rdfa');

      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });
  });
});
