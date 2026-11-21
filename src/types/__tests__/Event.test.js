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

    const expectOnlineOnlyWarning = (issues) => {
      const errors = issues.filter((i) => i.severity === 'ERROR');
      expect(errors).to.have.lengthOf(0);
      const locationIssues = issues.filter((i) =>
        i.fieldNames?.includes('location'),
      );
      expect(locationIssues).to.have.lengthOf(1);
      expect(locationIssues[0]).to.deep.include({
        severity: 'WARNING',
        issueMessage:
          'Online-only events are not eligible for Google event rich results, a physical "location" is required',
      });
    };

    it('should accept image as a URL string', async () => {
      const data = await loadTestData('Event/valid1.json', 'jsonld');
      const issues = await validator.validate(data);
      const imageIssues = issues.filter((i) => i.fieldNames?.includes('image'));
      expect(imageIssues).to.have.lengthOf(0);
    });

    it('should warn for an online-only Event without a location', async () => {
      const data = await loadTestData('Event/online_only.json', 'jsonld');
      expectOnlineOnlyWarning(await validator.validate(data));
    });

    it('should warn for an online-only Event with a VirtualLocation', async () => {
      const data = await loadTestData(
        'Event/online_only_virtual_location.json',
        'jsonld',
      );
      expectOnlineOnlyWarning(await validator.validate(data));
    });

    it('should warn when location.name is missing', async () => {
      const data = await loadTestData(
        'Event/missing_location_name.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      const errors = issues.filter((i) => i.severity === 'ERROR');
      expect(errors).to.have.lengthOf(0);
      const locationName = issues.filter((i) =>
        i.fieldNames?.includes('location.name'),
      );
      expect(locationName).to.have.lengthOf(1);
      expect(locationName[0]).to.deep.include({
        severity: 'WARNING',
        issueMessage: 'Missing field "location.name" (optional)',
      });
    });

    it('should not warn about location.name when it is present', async () => {
      const data = await loadTestData('Event/valid1.json', 'jsonld');
      const issues = await validator.validate(data);
      const locationName = issues.filter((i) =>
        i.fieldNames?.includes('location.name'),
      );
      expect(locationName).to.have.lengthOf(0);
    });

    it('should validate a mixed Event with a VirtualLocation and a Place', async () => {
      const data = await loadTestData('Event/valid_mixed.json', 'jsonld');
      const issues = await validator.validate(data);
      const errors = issues.filter((i) => i.severity === 'ERROR');
      expect(errors).to.have.lengthOf(0);
      const locationIssues = issues.filter((i) =>
        i.fieldNames?.some((f) => f.startsWith('location')),
      );
      expect(locationIssues).to.have.lengthOf(0);
    });

    it('should fail when location.address is missing', async () => {
      const data = await loadTestData(
        'Event/invalid_missing_location_address.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      const errors = issues.filter((i) => i.severity === 'ERROR');
      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.include({
        severity: 'ERROR',
        issueMessage: 'Required attribute "location.address" is missing',
      });
      expect(errors[0].fieldNames).to.deep.equal(['location.address']);
    });

    it('should accept eventAttendanceMode as an array', async () => {
      const data = await loadTestData(
        'Event/online_only_mode_array.json',
        'jsonld',
      );
      expectOnlineOnlyWarning(await validator.validate(data));
    });

    it('should not throw for a non-string eventAttendanceMode', async () => {
      const data = await loadTestData(
        'Event/invalid_missing_location.json',
        'jsonld',
      );
      data.jsonld.Event[0].eventAttendanceMode = { '@type': 'Thing' };
      const issues = await validator.validate(data);
      const errors = issues.filter((i) => i.severity === 'ERROR');
      expect(errors).to.have.lengthOf(1);
      expect(errors[0].fieldNames).to.deep.equal(['location']);
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

    it('should fail when location is missing and the event is not online', async () => {
      const data = await loadTestData(
        'Event/invalid_missing_location.json',
        'jsonld',
      );
      const issues = await validator.validate(data);
      const errors = issues.filter((i) => i.severity === 'ERROR');
      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.include({
        severity: 'ERROR',
        issueMessage: 'Required attribute "location" is missing',
      });
      expect(errors[0].fieldNames).to.deep.equal(['location']);
    });
  });
});
