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

import { loadTestData, MockValidator } from './utils.js';
import { Validator } from '../../validator.js';

describe('ProductMerchantListValidator', () => {
  describe('JSON-LD', () => {
    let validator;

    beforeEach(() => {
      validator = new Validator();
      validator.registeredHandlers = {
        ...validator.registeredHandlers,
        AggregateRating: [MockValidator],
        Rating: [MockValidator],
        DefinedRegion: [MockValidator],
      };
      validator.globalHandlers = [];
    });

    it('should validate a correct merchant product structure in valid1.json', async () => {
      const data = await loadTestData('ProductMerchant/valid1.json', 'jsonld');
      const issues = await validator.validate(data);
      const errors = issues.filter((i) => i.severity === 'ERROR');
      expect(errors).to.have.lengthOf(0);
      const warnings = issues.filter((i) => i.severity === 'WARNING');
      expect(warnings).to.have.lengthOf(10);
    });

    it('should validate a correct merchant product structure in valid2.json', async () => {
      const data = await loadTestData('ProductMerchant/valid2.json', 'jsonld');
      const issues = await validator.validate(data);
      const errors = issues.filter((i) => i.severity === 'ERROR');
      expect(errors).to.have.lengthOf(0);
      const warnings = issues.filter((i) => i.severity === 'WARNING');
      expect(warnings).to.have.lengthOf(11);
    });

    it('should validate a correct merchant product structure in valid3.json', async () => {
      const data = await loadTestData('ProductMerchant/valid3.json', 'jsonld');
      const issues = await validator.validate(data);
      const errors = issues.filter((i) => i.severity === 'ERROR');
      expect(errors).to.have.lengthOf(0);
      const warnings = issues.filter((i) => i.severity === 'WARNING');
      expect(warnings).to.have.lengthOf(13);
    });
  });
});
