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

export default class PeopleAudienceValidator extends BaseValidator {
  getConditions(data) {
    const conditions = [
      this.recommended('suggestedGender'),

      this.or(
        this.recommended('suggestedMinAge', 'number'),
        this.recommended('suggestedAge.minValue', 'number'),
      ),
    ];

    const minAge = data.suggestedMinAge || data.suggestedAge?.minValue;
    if (minAge && minAge < 13) {
      conditions.push(
        this.or(
          this.recommended('suggestedMaxAge', 'number'),
          this.recommended('suggestedAge.maxValue', 'number'),
        ),
      );
    }

    return conditions.map((c) => c.bind(this));
  }
}
