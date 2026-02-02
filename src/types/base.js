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
import { isObject } from '../utils.js';

export default class BaseValidator {
  constructor({ dataFormat, path }) {
    this.dataFormat = dataFormat;
    this.path = path;
  }

  getConditions() {
    return [];
  }

  validate(data) {
    const issues = [];

    for (const condition of this.getConditions(data)) {
      const issue = condition(data);
      if (Array.isArray(issue)) {
        issues.push(...issue);
      } else if (issue) {
        issues.push(issue);
      }
    }

    return issues;
  }

  #valueByPath(data, path) {
    const parts = path.split('.');
    let value = data;

    for (const part of parts) {
      if (value === undefined || typeof value !== 'object') {
        return undefined;
      }
      value = value[part];
    }

    return value;
  }

  required(name, type, ...opts) {
    return (data) => {
      const value = this.#valueByPath(data, name);
      if (value === undefined || value === null || value === '') {
        return {
          issueMessage: `Required attribute "${name}" is missing`,
          severity: 'ERROR',
          path: this.path,
          fieldNames: [name],
        };
      }
      if (type && !this.checkType(value, type, ...opts)) {
        return {
          issueMessage: `Invalid type for attribute "${name}"`,
          severity: 'ERROR',
          path: this.path,
          fieldNames: [name],
        };
      }
      return null;
    };
  }

  or(...conditions) {
    return (element, index, data) => {
      const issues = conditions.map((c) => c(element, index, data));
      const pass = issues.some(
        (i) => i === null || (Array.isArray(i) && i.length === 0),
      );
      if (pass) {
        return null;
      }

      // Use highest severity of the issues
      const severity = issues.reduce((max, i) => {
        if (i && i.severity === 'ERROR') {
          return 'ERROR';
        }
        return max;
      }, 'WARNING');

      // Collect all field names from the conditions
      const fieldNames = issues
        .flat()
        .filter((i) => i && i.fieldNames)
        .flatMap((i) => i.fieldNames);

      return {
        issueMessage: `One of the following conditions needs to be met: ${issues
          .flat()
          .map((c) => c.issueMessage)
          .join(' or ')}`,
        severity,
        path: this.path,
        fieldNames: fieldNames.length > 0 ? fieldNames : [],
      };
    };
  }

  recommended(name, type, ...opts) {
    return (data) => {
      const value = this.#valueByPath(data, name);
      if (value === undefined || value === null || value === '') {
        return {
          issueMessage: `Missing field "${name}" (optional)`,
          severity: 'WARNING',
          path: this.path,
          fieldNames: [name],
        };
      }
      if (type && !this.checkType(value, type, ...opts)) {
        return {
          issueMessage: `Invalid type for attribute "${name}"`,
          severity: 'WARNING',
          path: this.path,
          fieldNames: [name],
        };
      }
      return null;
    };
  }

  checkType(data, type, ...value) {
    // TODO: Write tests for all type checks
    if (type === 'string' && typeof data !== 'string') {
      return false;
    } else if (type === 'arrayOrObject') {
      return isObject(data) || Array.isArray(data);
    } else if (type === 'array' && !Array.isArray(data)) {
      return false;
    } else if (type === 'object') {
      return isObject(data);
    } else if (type === 'number') {
      if (typeof data === 'number') {
        return true;
      }
      if (typeof data === 'string') {
        const num = Number(data);
        return !isNaN(num);
      }
      return false;
    } else if (type === 'date') {
      const date = new Date(data);
      return !isNaN(date.getTime());
    } else if (type === 'url') {
      // Absolute or relative URL, but no data: URLs
      let urlValues = Array.isArray(data) ? data : [data];
      for (const url of urlValues) {
        if (url.startsWith('data:')) {
          return false;
        }
        try {
          new URL(url, 'https://example.com');
        } catch (e) {
          return false;
        }
      }
    } else if (type === 'currency') {
      return typeof data === 'string' && /^[A-Z]{3}$/.test(data);
    } else if (type === 'enum' && !value.includes(data)) {
      return false;
    } else if (type === 'regex' && !value.test(data)) {
      return false;
    } else if (type === 'duration' && !this.validDurationFormat(data)) {
      return false;
    }
    return true;
  }

  inType(type) {
    return (
      this.path.length > 1 && this.path[this.path.length - 2].type === type
    );
  }

  inProperty(property) {
    return (
      this.path.length > 1 &&
      this.path[this.path.length - 1].property === property
    );
  }

  validDurationFormat(time) {
    const durationRegex =
      /^P(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?$/;
    return durationRegex.test(time);
  }
}
