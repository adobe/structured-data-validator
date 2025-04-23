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

    for (const condition of this.getConditions()) {
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
      if (!value) {
        return {
          issueMessage: `Required attribute "${name}" is missing`,
          severity: 'ERROR',
          path: this.path,
        };
      }
      if (type && !this.checkType(value, type, ...opts)) {
        return {
          issueMessage: `Invalid type for attribute "${name}"`,
          severity: 'ERROR',
          path: this.path,
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
      return {
        issueMessage: `One of the following conditions needs to be met: ${issues
          .flat()
          .map((c) => c.issueMessage)
          .join(' or ')}`,
        severity: 'ERROR',
        path: this.path,
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
        };
      }
      if (type && !this.checkType(value, type, ...opts)) {
        return {
          issueMessage: `Invalid type for attribute "${name}"`,
          severity: 'WARNING',
          path: this.path,
        };
      }
      return null;
    };
  }

  checkType(data, type, ...value) {
    // TODO: Test
    if (type === 'string' && typeof data !== 'string') {
      return false;
    } else if (type === 'array' && !Array.isArray(data)) {
      return false;
    } else if (type === 'object' && typeof data !== 'object') {
      return false;
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
      try {
        new URL(data);
      } catch (e) {
        return false;
      }
    } else if (type === 'currency') {
      return typeof data === 'string' && /^[A-Z]{3}$/.test(data);
    } else if (type === 'enum' && !value.includes(data)) {
      return false;
    } else if (type === 'regex' && !value.test(data)) {
      return false;
    }
    return true;
  }
}
