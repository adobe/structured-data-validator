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
import BaseValidator from './base.js';

export default class EventValidator extends BaseValidator {
  getConditions() {
    return [
      this.required('name'),
      this.required('startDate', 'date'),
      this.locationOrAttendanceMode,

      this.recommended('description'),
      this.recommended('endDate', 'date'),
      this.recommended('eventAttendanceMode'),
      this.recommended('eventStatus'),
      this.recommended('image', 'arrayOrObject'),
      this.recommended('offers', 'arrayOrObject'),
      this.recommended('organizer', 'object'),
      this.recommended('performer', 'arrayOrObject'),
    ].map((c) => c.bind(this));
  }

  locationOrAttendanceMode(data) {
    const hasLocation = data.location !== undefined && data.location !== null;
    const hasOnlineAttendanceMode =
      data.eventAttendanceMode &&
      (data.eventAttendanceMode.includes('OnlineEventAttendanceMode') ||
        data.eventAttendanceMode.includes('MixedEventAttendanceMode'));

    if (!hasLocation && !hasOnlineAttendanceMode) {
      return {
        issueMessage:
          'Either "location" or online "eventAttendanceMode" is required',
        severity: 'ERROR',
        path: this.path,
        fieldName: 'location',
        fieldNames: ['location', 'eventAttendanceMode'],
      };
    }
    return null;
  }
}
