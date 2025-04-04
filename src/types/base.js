export default class BaseValidator {
  constructor(dataFormat, location) {
    this.dataFormat = dataFormat;
    if (location) {
      this.location = location;
    }
  }

  getConditions() {
    return [];
  }

  validate(data) {
    if (!this.location && data['@location']) {
      this.location = data['@location'];
    }

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
          location: this.location,
          severity: 'ERROR',
        };
      }
      if (type && !this.checkType(value, type, ...opts)) {
        return {
          issueMessage: `Invalid type for attribute "${name}"`,
          location: this.location,
          severity: 'ERROR',
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
        location: this.location,
        severity: 'ERROR',
      };
    };
  }

  recommended(name, type, ...opts) {
    return (data) => {
      const value = this.#valueByPath(data, name);
      if (value === undefined || value === null || value === '') {
        return {
          issueMessage: `Missing field "${name}" (optional)`,
          location: this.location,
          severity: 'WARNING',
        };
      }
      if (type && !this.checkType(value, type, ...opts)) {
        return {
          issueMessage: `Invalid type for attribute "${name}"`,
          location: this.location,
          severity: 'WARNING',
        };
      }
      return null;
    };
  }

  children(name, ...conditions) {
    // TODO: Only works for first level currently
    return (data) => {
      if (!Array.isArray(data[name])) {
        return null;
      }
      const issues = [];

      for (const [index, item] of data[name].entries()) {
        for (const condition of conditions) {
          const issue = condition(item, index, data);
          if (Array.isArray(issue)) {
            issues.push(...issue);
          } else if (issue) {
            issues.push(issue);
          }
        }
      }
      return issues.length > 0 ? issues : null;
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
