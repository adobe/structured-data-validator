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

import { loadTestData } from './utils.js';
import { Validator } from '../../validator.js';

describe('OrganizationValidator', () => {
  describe('JSON-LD', () => {
    let validator;

    beforeEach(() => {
      validator = new Validator();
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

    it('should validate an organization with multiple types', async () => {
      const data = await loadTestData('Organization/multi-type.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });
  });
});
