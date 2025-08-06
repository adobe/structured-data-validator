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

describe('VideoObjectValidator', () => {
  let validator;
  beforeEach(() => {
    validator = new Validator();
    validator.globalHandlers = [];
  });

  it('should show warnings for recommended fields in valid1.json', async () => {
    const warnings = [
      {
        issueMessage: 'Missing field "hasPart" (optional)',
        severity: 'WARNING',
      },
      {
        issueMessage: 'Missing field "publication" (optional)',
        severity: 'WARNING',
      },
    ];
    const data = await loadTestData('VideoObject/valid1.json', 'jsonld');
    const issues = await validator.validate(data);
    expect(issues).to.have.lengthOf(2);
    expect(issues[0]).to.deep.include(warnings[0]);
    expect(issues[1]).to.deep.include(warnings[1]);
  });

  it('should report error for missing required fields', async () => {
    const data = await loadTestData(
      'VideoObject/missing-required.json',
      'jsonld',
    );
    const issues = await validator.validate(data);
    const errors = issues.filter((issue) => issue.severity === 'ERROR');
    const expectedErrors = [
      {
        issueMessage: 'Required attribute "name" is missing',
        severity: 'ERROR',
      },
      {
        issueMessage: 'Required attribute "thumbnailUrl" is missing',
        severity: 'ERROR',
      },
    ];
    expect(errors).to.have.lengthOf(2);
    expect(errors[0]).to.deep.include(expectedErrors[0]);
    expect(errors[1]).to.deep.include(expectedErrors[1]);
  });

  it('should warn if neither contentUrl nor embedUrl is present', async () => {
    const data = await loadTestData(
      'VideoObject/missing-content-embed.json',
      'jsonld',
    );
    const issues = await validator.validate(data);
    const warnings = issues.filter((issue) => issue.severity === 'WARNING');
    expect(warnings).to.have.lengthOf(1);
    expect(warnings[0]).to.deep.include({
      issueMessage: 'One of the following conditions needs to be met: Missing field "contentUrl" (optional) or Missing field "embedUrl" (optional)',
      severity: 'WARNING',
    });
  });

  it('should not warn if at least one of contentUrl or embedUrl is present', async () => {
    const data = await loadTestData(
      'VideoObject/with-contentUrl.json',
      'jsonld',
    );
    const issues = await validator.validate(data);
    const warnings = issues.filter((issue) => issue.severity === 'WARNING');
    expect(warnings).to.have.lengthOf(0);
  });

  it('should validate a correct VideoObject structure in valid2.json with no warnings or errors', async () => {
    const data = await loadTestData('VideoObject/valid2.json', 'jsonld');
    const issues = await validator.validate(data);
    expect(issues).to.have.lengthOf(0);
  });

  it('should validate a correct VideoObject structure in valid3.json', async () => {
    const data = await loadTestData('VideoObject/valid3.json', 'jsonld');
    const issues = await validator.validate(data);
    const expectedIssues = [
      {
        issueMessage: 'Missing field "expires" (optional)',
        severity: 'WARNING',
      },
      {
        issueMessage: 'Missing field "publication" (optional)',
        severity: 'WARNING',
      },
      {
        issueMessage:
          'One of the following conditions needs to be met: Missing field "interactionStatistic" (optional) or Missing field "interactionCount" (optional)',
        severity: 'WARNING',
      },
    ];
    expect(issues).to.have.lengthOf(3);
    expect(issues[0]).to.deep.include(expectedIssues[0]);
    expect(issues[1]).to.deep.include(expectedIssues[1]);
    expect(issues[2]).to.deep.include(expectedIssues[2]);
  });

  it('should validate a correct VideoObject structure in valid4.json', async () => {
    const data = await loadTestData('VideoObject/valid4.json', 'jsonld');
    const issues = await validator.validate(data);
    const expectedIssues = [
      {
        issueMessage: 'Missing field "duration" (optional)',
        severity: 'WARNING',
      },
      {
        issueMessage: 'Missing field "expires" (optional)',
        severity: 'WARNING',
      },
      {
        issueMessage: 'Missing field "hasPart" (optional)',
        severity: 'WARNING',
      },
      {
        issueMessage: 'Missing field "publication" (optional)',
        severity: 'WARNING',
      },
      {
        issueMessage:
          'One of the following conditions needs to be met: Missing field "ineligibleRegion" (optional) or Missing field "regionsAllowed" (optional)',
        severity: 'WARNING',
      },
      {
        issueMessage:
          'One of the following conditions needs to be met: Missing field "interactionStatistic" (optional) or Missing field "interactionCount" (optional)',
        severity: 'WARNING',
      },
    ];
    expect(issues).to.have.lengthOf(6);
    for (let i = 0; i < issues.length; i++) {
      expect(issues[i]).to.deep.include(expectedIssues[i]);
    }
  });
});
