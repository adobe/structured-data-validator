import { expect } from 'chai';

import { loadTestData } from './utils.js';
import { Validator } from '../../validator.js';

describe('OrganizationValidator', () => {
  describe('JSON-LD', () => {
    let validator;

    beforeEach(() => {
      validator = new Validator();
      validator.registeredHandlers = {
        Organization: [() => import('../Organization.js')],
      };
      validator.globalHandlers = [];
    });

    it('should validate a correct organization', async () => {
      const data = await loadTestData('Organization/valid.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should detect a missing name', async () => {
      const data = await loadTestData('Organization/invalid.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        rootType: 'Organization',
        issueMessage: 'Required attribute "name" is missing',
        location: '35,102',
        severity: 'ERROR',
      });
    });
  });
});
