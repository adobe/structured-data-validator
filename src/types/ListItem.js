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

export default class ListItemValidator extends BaseValidator {
  constructor(config) {
    super(config);
    this.validateItemUrl = this.validateItemUrl.bind(this);
  }

  getConditions() {
    return [
      this.or(
        this.required('name', 'string'),
        this.required('item.name', 'string'),
      ),
      this.required('position', 'number'),
      this.validateItemUrl,
    ].map((c) => c.bind(this));
  }

  validateItemUrl(data) {
    const lastPathItem = this.path[this.path.length - 1];

    const isLast = lastPathItem.index === lastPathItem.length - 1;

    let urlToCheck;
    let urlPath;

    if (this.checkType(data.item, 'object')) {
      urlToCheck = data.item['@id'];
      urlPath = 'item.@id';
    } else if (data.item) {
      urlToCheck = data.item;
      urlPath = 'item';
    }

    // Last element does not need a URL, but if it has one, it should be valid
    if (isLast && !urlToCheck) {
      return null;
    }

    try {
      if (!urlToCheck) {
        throw 'URL is missing';
      }

      // Handle absolute URLs
      if (
        urlToCheck.startsWith('http://') ||
        urlToCheck.startsWith('https://') ||
        this.dataFormat === 'jsonld'
      ) {
        new URL(urlToCheck);
        return null;
      }

      // Handle relative URLs
      // Special case for microdata: / is allowed
      if (urlToCheck === '/' && this.dataFormat === 'microdata') {
        return null;
      }

      if (this.dataFormat === 'rdfa' || this.dataFormat === 'microdata') {
        // Remove any query parameters and hash fragments for validation
        const urlWithoutParams = urlToCheck.split('?')[0].split('#')[0];

        // Check if valid relative path
        if (!urlWithoutParams.match(/^\/[a-z0-9\-/]+$/)) {
          throw 'Invalid URL';
        }
      }
    } catch (e) {
      return {
        issueMessage: `Invalid URL in field "${urlPath}"`,
        severity: 'WARNING',
        path: this.path,
      };
    }

    return null;
  }
}
