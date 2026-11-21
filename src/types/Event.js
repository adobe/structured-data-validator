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

  // Locations of the event. A location can be a single value or an array
  // (e.g. a VirtualLocation and a Place for a mixed event).
  locations(data) {
    if (data.location === undefined || data.location === null) {
      return [];
    }
    return Array.isArray(data.location) ? data.location : [data.location];
  }

  isVirtualLocation(location) {
    return [].concat(location?.['@type']).includes('VirtualLocation');
  }

  // Online or mixed eventAttendanceMode (a single value or an array), or a
  // VirtualLocation
  isOnline(data) {
    const hasOnlineAttendanceMode = []
      .concat(data.eventAttendanceMode)
      .some(
        (mode) =>
          typeof mode === 'string' &&
          ['OnlineEventAttendanceMode', 'MixedEventAttendanceMode'].includes(
            stripSchema(mode),
          ),
      );
    return (
      hasOnlineAttendanceMode ||
      this.locations(data).some((location) => this.isVirtualLocation(location))
    );
  }

  // Google only supports events that take place at a physical location, so
  // online-only events are valid schema.org but not eligible for event rich
  // results.
  validateLocation(data) {
    const physicalLocations = this.locations(data).filter(
      (location) => !this.isVirtualLocation(location),
    );

    if (physicalLocations.length === 0) {
      if (this.isOnline(data)) {
        return {
          issueMessage:
            'Online-only events are not eligible for Google event rich results, a physical "location" is required',
          severity: 'WARNING',
          path: this.path,
          fieldNames: ['location'],
        };
      }
      return this.required('location')({});
    }

    return physicalLocations
      .flatMap((location) => [
        this.required('location.address')({ location }),
        this.recommended('location.name')({ location }),
      ])
      .filter((issue) => issue !== null);
  }
}
