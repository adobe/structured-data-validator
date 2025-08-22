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

export default class PriceSpecificationValidator extends BaseValidator {
  getConditions() {
    const conditions = [];
    const offerIndex = this.path.findIndex(
      (pathElement) => pathElement.type === 'Offer',
    );
    const productIsParent =
      offerIndex > 0 ? this.path[offerIndex - 1].type === 'Product' : false;

    if (productIsParent) {
      conditions.push(
        this.or(
          this.required('price', 'number'),
          this.required('priceSpecification.price', 'number'),
        ),
        this.recommended('availability'),
        this.or(
          this.recommended('priceCurrency', 'currency'),
          this.recommended('priceSpecification.priceCurrency', 'currency'),
        ),
        this.recommended('priceValidUntil', 'date'),
      );
    }
    return conditions.map((c) => c.bind(this));
  }
}
