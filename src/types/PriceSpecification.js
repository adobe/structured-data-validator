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

const isPresent = (value) =>
  value !== undefined && value !== null && value !== '';

export default class PriceSpecificationValidator extends BaseValidator {
  /**
   * A PriceSpecification needs a single `price`, or a price range expressed
   * with both `minPrice` and `maxPrice` (schema.org: "The lowest price if the
   * price is a range"). A range is only accepted when no `price` is given; an
   * incomplete range still reports the usual missing "price" error.
   */
  priceOrRange() {
    return (data) => {
      if (!isPresent(data?.price) && isPresent(data?.minPrice)) {
        if (isPresent(data?.maxPrice)) {
          const issues = [
            this.required('minPrice', 'number')(data),
            this.required('maxPrice', 'number')(data),
          ].filter(Boolean);
          return issues.length > 0 ? issues : null;
        }
      }
      return this.required('price', 'number')(data);
    };
  }

  getConditions() {
    return [
      this.priceOrRange(),
      this.recommended('priceCurrency', 'currency'),
    ].map((c) => c.bind(this));
  }
}
