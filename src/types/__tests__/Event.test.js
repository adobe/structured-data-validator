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

describe('EventValidator', () => {
  describe('JSON-LD', () => {
    let validator;

    beforeEach(() => {
      validator = new Validator();
      validator.globalHandlers = [];
    });

    it('should validate a correct Event structure in valid1.json', async () => {
      const data = await loadTestData('Event/valid1.json', 'jsonld');
      const issues = await validator.validate(data);
      const errors = issues.filter((i) => i.severity === 'ERROR');
      expect(errors).to.have.lengthOf(0);
    });

    it('should validate an online Event in valid_online.json', async () => {
      const data = await loadTestData('Event/valid_online.json', 'jsonld');
      const issues = await validator.validate(data);
      const errors = issues.filter((i) => i.severity === 'ERROR');
      expect(errors).to.have.lengthOf(0);
    });

    it('should fail when name is missing', async () => {
      const data = await loadTestData(
        'Event/invalid_missing_name.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      const errors = issues.filter((i) => i.severity === 'ERROR');
      expect(errors.length).to.be.greaterThan(0);
      expect(errors[0]).to.deep.include({
        severity: 'ERROR',
        issueMessage: 'Required attribute "name" is missing',
      });
    });

    it('should fail when location is missing for physical event', async () => {
      const data = await loadTestData(
        'Event/invalid_missing_location.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      const errors = issues.filter((i) => i.severity === 'ERROR');
      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.include({
        severity: 'ERROR',
        issueMessage:
          'Either "location" or online "eventAttendanceMode" is required',
      });
    });
  });
});
