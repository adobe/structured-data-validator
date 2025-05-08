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

export default class RatingValidator extends BaseValidator {
  getConditions() {
    const conditions = [
      this.required('ratingValue'),
      this.validateRange,

      // Those fields are listed as recommended in documentation
      // BUT: Google validator does not show warnings and assumes default values 0 and 5.
      this.recommended('bestRating', 'number'),
      this.recommended('worstRating', 'number'),
    ];

    return conditions.map((c) => c.bind(this));
  }

  validateRange(data) {
    // If number or if it can be parsed as number
    // For % and / values, Google ignores the range
    const from = data.worstRating || 0;
    const to = data.bestRating || 5;
    let value = data.ratingValue;
    if (typeof value === 'string') {
      // Try to parse as number
      value = parseFloat(value);
      if (!isNaN(value)) {
        return null;
      }
    }

    if (typeof value === 'number') {
      if (value < from || value > to) {
        return {
          issueMessage: `Rating is outside the specified or default range`,
          severity: 'ERROR',
          path: this.path,
        };
      }
    }

    return null;
  }
}
