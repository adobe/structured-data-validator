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
import { stripSchema } from '../utils.js';

export default class EventValidator extends BaseValidator {
  getConditions() {
    return [
      this.required('name'),
      this.required('startDate', 'date'),
      this.locationOrAttendanceMode,
      this.validateLocation,

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

  // Physical locations of the event. A location can be a single value or an
  // array (e.g. a VirtualLocation and a Place for a mixed event). A
  // VirtualLocation has no venue name or address, and events without a
  // location are handled by locationOrAttendanceMode.
  physicalLocations(data) {
    if (data.location === undefined || data.location === null) {
      return [];
    }
    const locations = Array.isArray(data.location)
      ? data.location
      : [data.location];
    return locations.filter(
      (location) => ![].concat(location?.['@type']).includes('VirtualLocation'),
    );
  }

  validateLocation(data) {
    return this.physicalLocations(data)
      .flatMap((location) => [
        this.required('location.address')({ location }),
        this.recommended('location.name')({ location }),
      ])
      .filter((issue) => issue !== null);
  }

  locationOrAttendanceMode(data) {
    const hasLocation = data.location !== undefined && data.location !== null;
    // eventAttendanceMode may be a single value or an array
    const hasOnlineAttendanceMode = []
      .concat(data.eventAttendanceMode)
      .some(
        (mode) =>
          typeof mode === 'string' &&
          ['OnlineEventAttendanceMode', 'MixedEventAttendanceMode'].includes(
            stripSchema(mode),
          ),
      );

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
