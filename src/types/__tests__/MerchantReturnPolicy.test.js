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

describe('MerchantReturnPolicyValidator', () => {
  describe('JSON-LD', () => {
    let validator;

    beforeEach(() => {
      validator = new Validator();
      validator.globalHandlers = [];
    });

    it('should validate a correct merchant return policy structure in valid1.json', async () => {
      const data = await loadTestData(
        'MerchantReturnPolicy/valid1.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should validate return shipping fees', async () => {
      const data = await loadTestData(
        'MerchantReturnPolicy/valid2.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should validate additional recommended fields in Organization context', async () => {
      const data = await loadTestData(
        'MerchantReturnPolicy/valid3.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      const errors = issues.filter((i) => i.severity === 'ERROR');
      expect(errors).to.have.lengthOf(0);
      const warnings = issues.filter((i) => i.severity === 'WARNING');
      expect(warnings).to.have.lengthOf(7);
    });

    it('should validate applicableCountry and returnPolicyCategory', async () => {
      const data = await loadTestData(
        'MerchantReturnPolicy/missing-applicableCountry.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      const errors = issues.filter((i) => i.severity === 'ERROR');
      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.include({
        rootType: 'MerchantReturnPolicy',
        dataFormat: 'jsonld',
        location: '35,352',
        issueMessage:
          'Either applicableCountry and returnPolicyCategory or merchantReturnLink must be present',
        severity: 'ERROR',
        path: [
          {
            type: 'MerchantReturnPolicy',
            index: 0,
          },
        ],
        fieldNames: [
          'applicableCountry',
          'returnPolicyCategory',
          'merchantReturnLink',
        ],
      });
    });
  });
});
