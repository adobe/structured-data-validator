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

export default class HowToStepValidator extends BaseValidator {
  getConditions() {
    const conditions = [
      this.textAndItemList,

      this.recommended('image'),
      this.recommended('name', 'string'),
      this.recommended('url', 'url'),
      this.recommended('video'),
    ];
    return conditions.map((c) => c.bind(this));
  }

  textAndItemList(data) {
    const issues = [];
    const hasItemList =
      data.itemListElement !== undefined && data.itemListElement !== null;
    const hasText = data.text !== undefined && data.text !== null;

    if (hasItemList || hasText) {
      issues.push(this.recommended('text')(data));
      issues.push(this.recommended('itemListElement')(data));
    } else {
      issues.push(
        this.or(this.required('text'), this.required('itemListElement'))(data),
      );
    }
    return issues.filter((issue) => issue !== null);
  }
}
