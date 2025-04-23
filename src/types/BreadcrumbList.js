import BaseValidator from './base.js';

export default class BreadcrumbListValidator extends BaseValidator {
  getConditions() {
    return [
      this.required('itemListElement', 'array'),
      this.atLeastTwoItems,
    ].map((c) => c.bind(this));
  }

  atLeastTwoItems(data) {
    if (
      data['itemListElement'] &&
      Array.isArray(data['itemListElement']) &&
      data['itemListElement'].length < 2
    ) {
      return {
        issueMessage: 'At least two ListItems are required',
        severity: 'WARNING',
        path: this.path,
      };
    }
    return null;
  }
}
