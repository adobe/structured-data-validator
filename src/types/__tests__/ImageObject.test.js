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

describe('ImageObjectValidator', () => {
  describe('JSON-LD', () => {
    let validator;

    beforeEach(() => {
      validator = new Validator();
      validator.globalHandlers = [];
    });

    it('should validate a correct image object structure in valid1.json', async () => {
      const data = await loadTestData('ImageObject/valid1.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should validate a correct image object structure in valid2.json', async () => {
      const data = await loadTestData('ImageObject/valid2.json', 'jsonld');
      const issues = await validator.validate(data);
      const errors = issues.filter((issue) => issue.severity === 'ERROR');
      expect(errors).to.have.lengthOf(0);
    });

    it('should ignore additional fields on nested image objects', async () => {
      const data = await loadTestData('ImageObject/nested.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should allow relative URLs', async () => {
      const data = await loadTestData('ImageObject/valid3.json', 'jsonld');
      const issues = await validator.validate(data);
      const errors = issues.filter((issue) => issue.severity === 'ERROR');
      expect(errors).to.have.lengthOf(0);
    });

    it('should not allow data: URLs', async () => {
      const data = await loadTestData('ImageObject/dataUrl.json', 'jsonld');
      const issues = await validator.validate(data);
      const errors = issues.filter((issue) => issue.severity === 'ERROR');
      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.include({
        rootType: 'ImageObject',
        issueMessage:
          'One of the following conditions needs to be met: Required attribute "contentUrl" is missing or Invalid type for attribute "url"',
        severity: 'ERROR',
        path: [
          {
            type: 'ImageObject',
            index: 0,
          },
        ],
      });
    });
  });
});
