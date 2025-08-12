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

export default class JobPostingValidator extends BaseValidator {
  getConditions() {
    const conditions = [
      this.required('title', 'string'),
      this.required('description', 'string'),
      this.required('datePosted', 'date'),
      this.required('hiringOrganization'),
      this.checkJobLocations,
      this.recommended('applicantLocationRequirements'),
      this.recommended('baseSalary'),
      this.recommended('directApply'),
      this.recommended('employmentType'),
      this.recommended('identifier'),
      this.recommended('jobLocationType', 'string'),
      this.recommended('validThrough', 'date'),
    ];
    return conditions.map((c) => c.bind(this));
  }

  checkJobLocations(data) {
    const issues = [];
    if (data.jobLocationType === 'TELECOMMUTE') {
      if (!data.applicantLocationRequirements) {
        const applicantLocationIssue = this.required('applicantLocationRequirements')(data);
        if (applicantLocationIssue) {
          issues.push(applicantLocationIssue);
        }
      }
    } else {
      if (!data.applicantLocationRequirements) {
        const jobLocationIssues = this.required('jobLocation')(data);
        if (jobLocationIssues) {
          issues.push(jobLocationIssues);
        }
      }
    }

    if (data.jobLocation) {
      const addressCountryIssues = this.required('jobLocation.address.addressCountry')(data);
      if (addressCountryIssues) {
        issues.push(addressCountryIssues);
      }
    }
    return issues;
  }
}
