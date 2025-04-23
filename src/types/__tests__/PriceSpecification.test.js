import { expect } from 'chai';

import { loadTestData } from './utils.js';
import { Validator } from '../../validator.js';

describe('PriceSpecificationValidator', () => {
  describe('JSON-LD', () => {
    let validator;

    beforeEach(() => {
      validator = new Validator();
      validator.registeredHandlers = {
        PriceSpecification: [() => import('../PriceSpecification.js')],
        UnitPriceSpecification: [() => import('../PriceSpecification.js')],
      };
    });

    it('should validate a correct PriceSpecification in valid1.json', async () => {
      const data = await loadTestData(
        'PriceSpecification/valid1.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should validate a correct UnitPriceSpecification in valid2.json', async () => {
      const data = await loadTestData(
        'PriceSpecification/valid2.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should detect missing required price attribute in invalid1.json', async () => {
      const data = await loadTestData(
        'PriceSpecification/invalid1.json',
        'jsonld',
      );
      const issues = await validator.validate(data);

      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        rootType: 'PriceSpecification',
        issueMessage: 'Required attribute "price" is missing',
        severity: 'ERROR',
      });
    });

    it('should detect invalid currency in invalid3.json', async () => {
      const data = await loadTestData(
        'PriceSpecification/invalid2.json',
        'jsonld',
      );
      const issues = await validator.validate(data);

      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        rootType: 'PriceSpecification',
        issueMessage: 'Invalid type for attribute "priceCurrency"',
        severity: 'WARNING',
      });
    });
  });
});
