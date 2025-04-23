import BaseValidator from './base.js';

export default class OrganizationValidator extends BaseValidator {
  getConditions() {
    return [this.required('name')].map((c) => c.bind(this));
  }
}
