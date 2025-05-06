import { expect } from 'chai';

import { loadTestData } from './utils.js';
import { Validator } from '../../validator.js';

describe('PersonValidator', () => {
  describe('JSON-LD', () => {
    let validator;

    beforeEach(() => {
      validator = new Validator();
      validator.registeredHandlers = {
        Person: [() => import('../Person.js')],
      };
      validator.globalHandlers = [];
    });

    it('should validate a correct person', async () => {
      const data = await loadTestData('Person/valid.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should detect a missing name', async () => {
      const data = await loadTestData('Person/invalid.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        rootType: 'Person',
        issueMessage: 'Required attribute "name" is missing',
        location: '35,96',
        severity: 'ERROR',
      });
    });
  });
});
