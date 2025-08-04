import BaseValidator from './base.js';

export default class BroadcastEventValidator extends BaseValidator {
  getConditions() {
    const conditions = [
      this.required('startDate', 'date'),
      this.required('publication', 'object'),
      this.required('publication.endDate', 'date'),
      this.required('publication.isLiveBroadcast', 'boolean'),
      this.required('publication.startDate', 'date'),
    ];
    return conditions.map((c) => c.bind(this));
  }
} 