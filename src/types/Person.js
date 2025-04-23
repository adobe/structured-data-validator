import BaseValidator from './base.js';

export default class PersonValidator extends BaseValidator {
  getConditions() {
    return [this.required('name')].map((c) => c.bind(this));
  }
}
