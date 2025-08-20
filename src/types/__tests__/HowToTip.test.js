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
import { Validator } from '../../validator.js';
import { loadTestData } from './utils.js';

describe('HowToTipValidator', () => {
  let validator;
  beforeEach(() => {
    validator = new Validator();
    validator.globalHandlers = [];
  });

  it('should validate valid HowToTip with required text field', async () => {
    const data = await loadTestData('HowToTip/valid1.json', 'jsonld');
    const issues = await validator.validate(data);
    const errors = issues.filter((issue) => issue.severity === 'ERROR');

    expect(errors).to.have.lengthOf(0);
  });

  it('should error when HowToTip is missing required text field', async () => {
    const data = await loadTestData('HowToTip/missing-required.json', 'jsonld');
    const issues = await validator.validate(data);
    const errors = issues.filter((issue) => issue.severity === 'ERROR');
    const expectedIssues = [
      {
        issueMessage: 'Required attribute "text" is missing',
        severity: 'ERROR',
      },
    ];

    expect(errors).to.have.lengthOf(1);
    for (let i = 0; i < expectedIssues.length; i++) {
      expect(errors[i]).to.deep.include(expectedIssues[i]);
    }
  });
});
