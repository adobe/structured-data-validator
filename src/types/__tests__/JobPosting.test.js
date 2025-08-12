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

describe('JobPostingValidator', () => {
  let validator;
  beforeEach(() => {
    validator = new Validator();
    validator.globalHandlers = [];
  });

  it('should validate a correct JobPosting structure in valid1.json', async () => {
    const data = await loadTestData('JobPosting/valid1.json', 'jsonld');
    const issues = await validator.validate(data);
    const expectedIssues = [
      {
        issueMessage: 'Missing field "applicantLocationRequirements" (optional)',
        severity: 'WARNING',
      },
      {
        issueMessage: 'Missing field "directApply" (optional)',
        severity: 'WARNING',
      },
      {
        issueMessage: 'Missing field "jobLocationType" (optional)',
        severity: 'WARNING',
      },
    ];
    expect(issues).to.have.lengthOf(3);
    for (let i = 0; i < 3; i++) {
      expect(issues[i]).to.deep.include(expectedIssues[i]);
    }
  });

  it('should validate a correct JobPosting structure in valid2.json', async () => {
    const data = await loadTestData('JobPosting/valid2.json', 'jsonld');
    const issues = await validator.validate(data);
    expect(issues).to.have.lengthOf(1);
    expect(issues[0]).to.deep.include({
      issueMessage: 'Missing field "directApply" (optional)',
      severity: 'WARNING',
    });
  });

  it('should validate a correct JobPosting structure in valid3.json', async () => {
    const data = await loadTestData('JobPosting/valid3.json', 'jsonld');
    const issues = await validator.validate(data);
    const expectedWarnings = [
      {
        issueMessage: 'Missing field "applicantLocationRequirements" (optional)',
        severity: 'WARNING',
      },
      {
        issueMessage: 'Missing field "directApply" (optional)',
        severity: 'WARNING',
      },
      {
        issueMessage: 'Missing field "jobLocationType" (optional)',
        severity: 'WARNING',
      },
    ];
    expect(issues).to.have.lengthOf(3);
    for (let i = 0; i < expectedWarnings.length; i++) {
      expect(issues[i]).to.deep.include(expectedWarnings[i]);
    }
  });

  it('should report errors for missing required fields', async () => {
    const data = await loadTestData('JobPosting/missing-required.json', 'jsonld');
    const issues = await validator.validate(data);
    const expectedErrors = [
      {
        issueMessage: 'Required attribute "hiringOrganization" is missing',
        severity: 'ERROR',
      },
      {
        issueMessage: 'Required attribute "jobLocation" is missing',
        severity: 'ERROR',
      },
    ];
    const errors = issues.filter((issue) => issue.severity === 'ERROR');
    expect(errors).to.have.lengthOf(expectedErrors.length);
    for (let i = 0; i < expectedErrors.length; i++) {
      expect(errors[i]).to.deep.include(expectedErrors[i]);
    }
  });

  it('should report error for missing addressCountry in jobLocation', async () => {
    const data = await loadTestData('JobPosting/missing-address-country.json', 'jsonld');
    const issues = await validator.validate(data);
    const expectedErrors = [
      {
        issueMessage:
          'Required attribute "jobLocation.address.addressCountry" is missing',
        severity: 'ERROR',
      },
    ];
    const errors = issues.filter((issue) => issue.severity === 'ERROR');
    expect(errors).to.have.lengthOf(expectedErrors.length);
    expect(errors[0]).to.deep.include(expectedErrors[0]);
  });

  it('should require applicantLocationRequirements for remote jobs', async () => {
    const data = await loadTestData('JobPosting/remote-missing-location.json', 'jsonld');
    const issues = await validator.validate(data);
    const expectedErrors = [
      {
        issueMessage:
          'Required attribute "applicantLocationRequirements" is missing',
        severity: 'ERROR',
      },
    ];
    const errors = issues.filter((issue) => issue.severity === 'ERROR');
    expect(errors).to.have.lengthOf(expectedErrors.length);
    expect(errors[0]).to.deep.include(expectedErrors[0]);
  });

  it('should validate hybrid jobs', async () => {
    const data = await loadTestData('JobPosting/hybrid-job.json', 'jsonld');
    const issues = await validator.validate(data);
    const errors = issues.filter((issue) => issue.severity === 'ERROR');
    expect(errors).to.have.lengthOf(0);
  });

  it('should warn for missing recommended fields', async () => {
    const data = await loadTestData('JobPosting/missing-recommended.json', 'jsonld');
    const issues = await validator.validate(data);
    const expectedWarnings = [
      {
        issueMessage: 'Missing field "applicantLocationRequirements" (optional)',
        severity: 'WARNING',
      },
      {
        issueMessage: 'Missing field "directApply" (optional)',
        severity: 'WARNING',
      },
    ];
    const warnings = issues.filter((issue) => issue.severity === 'WARNING');
    expect(warnings).to.have.lengthOf(expectedWarnings.length);
    for (let i = 0; i < expectedWarnings.length; i++) {
      expect(warnings[i]).to.deep.include(expectedWarnings[i]);
    }
  });
});
