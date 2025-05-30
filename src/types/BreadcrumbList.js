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

export default class BreadcrumbListValidator extends BaseValidator {
  getConditions() {
    return [
      this.required('itemListElement', 'array'),
      this.atLeastTwoItems,
    ].map((c) => c.bind(this));
  }

  atLeastTwoItems(data) {
    if (
      data['itemListElement'] &&
      Array.isArray(data['itemListElement']) &&
      data['itemListElement'].length < 2
    ) {
      return {
        issueMessage: 'At least two ListItems are required',
        severity: 'WARNING',
        path: this.path,
      };
    }
    return null;
  }
}
