import BaseValidator from './base.js';

export default class BreadcrumbValidator extends BaseValidator {
  constructor(dataFormat) {
    super();
    this.dataFormat = dataFormat;
    this.validateItemUrl = this.validateItemUrl.bind(this);
  }

  getConditions() {
    return [
      this.required('itemListElement', 'array'),
      this.atLeastTwoItems,
      this.children(
        'itemListElement',
        this.or(this.required('name', 'string'), this.required('item.name', 'string')),
        this.required('position', 'number'),
        this.validateItemUrl,
      ),
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
      };
    }
    return null;
  }

  validateItemUrl(element, index, data) {
    const isLast = index === data['itemListElement'].length - 1;

    let urlToCheck;
    let urlPath;

    if (this.checkType(element.item, 'object')) {
      urlToCheck = element.item['@id'];
      urlPath = 'item.@id';
    } else if (element.item) {
      urlToCheck = element.item;
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
      };
    }

    return null;
  }
}
