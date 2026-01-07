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
      this.recommended('hasCertification'),
      this.recommended('inProductGroupWithID', 'string'),
      this.recommended('isVariantOf'),
      this.recommended('material', 'string'),
      this.recommended('mpn', 'string'),
      this.recommended('pattern', 'string'),
      this.recommended('size'),
      this.recommended('sku', 'string'),
      this.recommended('subjectOf'),
      this.validateGtin,
    ].map((c) => c.bind(this));
  }

  validateGtin(data) {
    let gtinFields = ['gtin', 'gtin8', 'gtin12', 'gtin13', 'gtin14', 'isbn'];

    // Check if gtin is present on product
    const productPass =
      this.or(...gtinFields.map((field) => this.recommended(field, 'string')))(
        data,
      ) === null;

    // Check if gtin is present on offers object
    let offerPass = false;
    if (
      data.offers &&
      typeof data.offers === 'object' &&
      !Array.isArray(data.offers)
    ) {
      offerPass =
        this.or(
          ...gtinFields.map((field) =>
            this.recommended(`offers.${field}`, 'string'),
          ),
        )(data.offers) === null;
    }

    // Check if gtin is present on offers array
    let allOffersPass = false;
    if (data.offers && Array.isArray(data.offers)) {
      allOffersPass = true;
      data.offers.forEach((offer, index) => {
        const offerPass =
          this.or(
            ...gtinFields.map((field) => this.recommended(field, 'string')),
          )(offer, index, data) === null;
        if (!offerPass) {
          allOffersPass = false;
        }
      });
    }

    if (productPass || offerPass || allOffersPass) {
      return null;
    }

    return {
      issueMessage: `Missing one of field ${gtinFields.map((a) => `"${a}"`).join(', ')} on either product or all offers`,
      severity: 'WARNING',
      path: this.path,
      fieldName: 'gtin',
      fieldNames: gtinFields,
    };
  }
}
