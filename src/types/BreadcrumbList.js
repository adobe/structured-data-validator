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
import { isObject } from '../utils.js';

export default class BreadcrumbListValidator extends BaseValidator {
  getConditions() {
    return [
      this.required('itemListElement', 'arrayOrObject'),
      this.atLeastTwoItems,
      this.validateItemUrl,
    ].map((c) => c.bind(this));
  }

  atLeastTwoItems(data) {
    if (
      (data['itemListElement'] &&
        Array.isArray(data['itemListElement']) &&
        data['itemListElement'].length < 2) ||
      isObject(data['itemListElement'])
    ) {
      return {
        issueMessage: 'At least two ListItems are required',
        severity: 'WARNING',
        path: this.path,
        fieldName: 'itemListElement',
      };
    }
    return null;
  }

  validateItemUrl(data) {
    if (!data['itemListElement']) {
      return null;
    }

    // Get all items and sort by position
    const items = [];
    if (Array.isArray(data['itemListElement'])) {
      items.push(...data['itemListElement']);
    } else if (isObject(data['itemListElement'])) {
      items.push(data['itemListElement']);
    }

    // Check if all positions are numbers
    const allPositionsAreNumbers = items.every((item) =>
      this.checkType(item.position, 'number'),
    );

    // Find last item by position
    let lastItem = null;
    if (allPositionsAreNumbers) {
      lastItem = items.reduce((acc, item) => {
        if (Number(item.position) > Number(acc.position)) {
          return item;
        }
        return acc;
      }, items[0]);
    }

    const issues = [];

    for (const [index, listItem] of items.entries()) {
      const newPath = [
        ...this.path,
        {
          type: listItem['@type'] ? listItem['@type'] : 'ListItem',
          index,
          length: items.length,
          property: 'itemListElement',
        },
      ];

      // if not all positions are numbers, last item is impossible to determine, so no item is considered last
      const isLast = allPositionsAreNumbers ? listItem === lastItem : false;

      let urlToCheck;
      let urlPath;

      if (this.checkType(listItem.item, 'object')) {
        urlToCheck = listItem.item['@id'];
        urlPath = 'item.@id';
      } else if (listItem.item) {
        urlToCheck = listItem.item;
        urlPath = 'item';
      }

      // Last element does not need a URL, but if it has one, it should be valid
      if (isLast && !urlToCheck) {
        continue;
      }

      try {
        if (!urlToCheck) {
          throw 'Field "item" with URL is missing';
        }

        // Handle absolute URLs
        if (
          urlToCheck.startsWith('http://') ||
          urlToCheck.startsWith('https://') ||
          this.dataFormat === 'jsonld'
        ) {
          try {
            new URL(urlToCheck);
          } catch (e) {
            throw `Invalid URL in field "${urlPath}"`;
          }
          continue;
        }

        // Handle relative URLs
        // Special case for microdata: / is allowed
        if (urlToCheck === '/' && this.dataFormat === 'microdata') {
          continue;
        }

        if (this.dataFormat === 'rdfa' || this.dataFormat === 'microdata') {
          // Remove any query parameters and hash fragments for validation
          const urlWithoutParams = urlToCheck.split('?')[0].split('#')[0];

          // Check if valid relative path
          if (!urlWithoutParams.match(/^\/[a-z0-9\-/]+$/)) {
            throw `Invalid URL in field "${urlPath}"`;
          }
        }
      } catch (e) {
        issues.push({
          issueMessage: e,
          severity: 'WARNING',
          path: newPath,
          fieldName: urlPath || 'item',
        });
      }
    }

    return issues;
  }
}
