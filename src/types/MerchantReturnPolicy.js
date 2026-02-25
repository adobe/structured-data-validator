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

export default class MerchantReturnPolicyValidator extends BaseValidator {
  getConditions(data) {
    const conditions = [this.countryOrLink];

    const category = data.returnPolicyCategory;

    // If returnPolicyCategory is present, we need to validate the return window
    if (
      category &&
      (category.includes('MerchantReturnFiniteReturnWindow') ||
        category.includes('MerchantReturnUnlimitedWindow'))
    ) {
      if (category.includes('MerchantReturnFiniteReturnWindow')) {
        conditions.push(this.recommended('merchantReturnDays', 'number'));
      }
      conditions.push(
        this.recommended('returnFees'),
        this.recommended('returnMethod'),
      );

      if (data.returnFees && data.returnFees.includes('ReturnShippingFees')) {
        conditions.push(this.recommended('returnShippingFeesAmount'));
      }

      // Additional properties for Organization context
      // TODO: Consider other subtypes of Organization
      if (
        this.inType('Organization') &&
        this.inProperty('hasMerchantReturnPolicy')
      ) {
        conditions.push(
          this.recommended('customerRemorseReturnFees'),
          this.recommended('customerRemorseReturnLabelSource'),
          this.recommended('customerRemorseReturnShippingFeesAmount'),
          this.recommended('itemCondition'),
          this.recommended('itemDefectReturnFees'),
          this.recommended('itemDefectReturnLabelSource'),
          this.recommended('itemDefectReturnShippingFeesAmount'),
          this.recommended('refundType'),
          this.recommended('restockingFee'),
          this.recommended('returnLabelSource'),
          this.recommended('returnPolicyCountry'),
        );
      }
    }

    return conditions.map((c) => c.bind(this));
  }

  countryOrLink(data) {
    // Either applicableCountry and returnPolicyCategory need to be present
    // or merchantReturnLink needs to be present, but only when nested under Organization

    let valid = false;
    if (
      this.inProperty('hasMerchantReturnPolicy') &&
      this.inType('Organization') &&
      this.required('merchantReturnLink')(data) === null
    ) {
      valid = true;
    } else if (
      this.required('applicableCountry')(data) === null &&
      this.required('returnPolicyCategory')(data) === null
    ) {
      valid = true;
    }

    if (!valid) {
      return {
        issueMessage:
          'Either applicableCountry and returnPolicyCategory or merchantReturnLink must be present',
        severity: 'ERROR',
        path: this.path,
        fieldNames: [
          'applicableCountry',
          'returnPolicyCategory',
          'merchantReturnLink',
        ],
      };
    }
  }
}
