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

describe('HowToStepValidator', () => {
  let validator;
  beforeEach(() => {
    validator = new Validator();
    validator.globalHandlers = [];
  });

  it('should validate HowToStep with itemListElement', async () => {
    const data = await loadTestData(
      'HowToStep/valid-with-itemlist.json',
      'jsonld',
    );
    const issues = await validator.validate(data);
    const errors = issues.filter((issue) => issue.severity === 'ERROR');

    expect(errors).to.have.lengthOf(0);
  });

  it('should error when HowToStep has neither text nor itemListElement', async () => {
    const data = await loadTestData(
      'HowToStep/missing-required.json',
      'jsonld',
    );
    const issues = await validator.validate(data);
    const errors = issues.filter((issue) => issue.severity === 'ERROR');

    const expectedIssue = {
      issueMessage:
        'One of the following conditions needs to be met: Required attribute "text" is missing or Required attribute "itemListElement" is missing',
      severity: 'ERROR',
    };

    expect(errors).to.have.lengthOf(1);
    expect(errors[0]).to.deep.include(expectedIssue);
  });

  it('should warn for missing recommended fields', async () => {
    const data = await loadTestData(
      'HowToStep/missing-recommended.json',
      'jsonld',
    );
    const issues = await validator.validate(data);
    const warnings = issues.filter((issue) => issue.severity === 'WARNING');

    const expectedIssues = [
      {
        issueMessage: 'Missing field "itemListElement" (optional)',
        severity: 'WARNING',
      },
      {
        issueMessage: 'Missing field "image" (optional)',
        severity: 'WARNING',
      },
      {
        issueMessage: 'Missing field "name" (optional)',
        severity: 'WARNING',
      },
      {
        issueMessage: 'Missing field "url" (optional)',
        severity: 'WARNING',
      },
      {
        issueMessage: 'Missing field "video" (optional)',
        severity: 'WARNING',
      },
    ];

    expect(warnings).to.have.lengthOf(5);
    for (let i = 0; i < expectedIssues.length; i++) {
      expect(warnings[i]).to.deep.include(expectedIssues[i]);
    }
  });

  it('should validate HowToStep with both text and itemListElement', async () => {
    const data = await loadTestData(
      'HowToStep/text-and-itemlist.json',
      'jsonld',
    );
    const issues = await validator.validate(data);
    const errors = issues.filter((issue) => issue.severity === 'ERROR');

    expect(errors).to.have.lengthOf(0);
  });

  it('should error when HowToDirection is missing required text field', async () => {
    const data = await loadTestData(
      'HowToStep/invalid-direction-missing-text.json',
      'jsonld',
    );
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
