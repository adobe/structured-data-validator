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

export default class ImageObjectValidator extends BaseValidator {
  getConditions() {
    const conditions = [
      this.or(this.required('contentUrl', 'url'), this.required('url', 'url')),
    ];

    // Only require these additional fields for root image objects
    if (this.path.length === 1) {
      conditions.push(
        // Be aware, this rule is not shown as an error in the validator. Instead the entity is completely ignored if not at least one of these fields is present.
        this.or(
          this.required('creator'),
          this.required('creditText'),
          this.required('copyrightNotice'),
          this.required('license'),
        ),

        this.recommended('acquireLicensePage', 'url'),
        this.recommended('creator'),
        this.recommended('creditText'),
        this.recommended('copyrightNotice'),
        this.recommended('license'),
      );
    }
    return conditions.map((c) => c.bind(this));
  }
}
