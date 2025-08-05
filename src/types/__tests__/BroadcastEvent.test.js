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

describe('BroadcastEventValidator', () => {
  let validator;
  beforeEach(() => {
    validator = new Validator();
    validator.globalHandlers = [];
  });

  it('should validate a correct BroadcastEvent structure in valid1.json', async () => {
    const data = await loadTestData('BroadcastEvent/valid1.json', 'jsonld');
    const issues = await validator.validate(data);
    expect(issues).to.have.lengthOf(0);
  });

  it('should report error for missing isLiveBroadcast', async () => {
    const data = await loadTestData('BroadcastEvent/missing-isLiveBroadcast.json', 'jsonld');
    const issues = await validator.validate(data);
    const errors = issues.filter((issue) => issue.severity === 'ERROR');
    expect(errors.length).to.be.greaterThan(0);
    expect(errors.some((e) => e.issueMessage.includes('isLiveBroadcast'))).to.be.true;
  });

  it('should report error for missing endDate', async () => {
    const data = await loadTestData('BroadcastEvent/missing-endDate.json', 'jsonld');
    const issues = await validator.validate(data);
    const errors = issues.filter((issue) => issue.severity === 'ERROR');
    expect(errors.length).to.be.greaterThan(0);
    expect(errors.some((e) => e.issueMessage.includes('endDate'))).to.be.true;
  });

  it('should report error for missing startDate', async () => {
    const data = await loadTestData('BroadcastEvent/missing-startDate.json', 'jsonld');
    const issues = await validator.validate(data);
    const errors = issues.filter((issue) => issue.severity === 'ERROR');
    expect(errors.length).to.be.greaterThan(0);
    expect(errors.some((e) => e.issueMessage.includes('startDate'))).to.be.true;
  });
});
