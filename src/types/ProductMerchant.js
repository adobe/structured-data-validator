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

export default class ProductMerchantValidator extends BaseValidator {
  getConditions() {
    return [
      this.required('image'),
      this.required('offers'),

      this.recommended('audience'),
      this.recommended('brand'),
      this.recommended('color', 'string'),
      this.recommended('description', 'string'),
      this.or(
        this.recommended('gtin', 'string'),
        this.recommended('gtin8', 'string'),
        this.recommended('gtin12', 'string'),
        this.recommended('gtin13', 'string'),
        this.recommended('gtin14', 'string'),
        this.recommended('isbn', 'string'),
      ),
      this.recommended('hasCertification'),
      this.recommended('inProductGroupWithID', 'string'),
      this.recommended('isVariantOf'),
      this.recommended('material', 'string'),
      this.recommended('mpn', 'string'),
      this.recommended('pattern', 'string'),
      this.recommended('size'),
      this.recommended('sku', 'string'),
      this.recommended('subjectOf'),
    ].map((c) => c.bind(this));
  }
}
