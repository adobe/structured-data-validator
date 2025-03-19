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
            this.children('itemListElement', 
                this.or(
                    this.required('name'),
                    this.required('item.name'),
                ),
                this.required('position', 'number'),
                this.validateItemUrl
            )
        ].map(c => c.bind(this));
    }

    atLeastTwoItems(data) {
        if (data['itemListElement'].length < 2) {
            return {
                issueMessage: 'At least two ListItems are required',
                severity: 'WARNING',
            }
        }
        return null;
    }

    validateItemUrl(element, index, data) {
        // Special case for last element, as it does not need a ref
        const isLast = index === data['itemListElement'].length - 1;

        if (this.checkType(element.item, 'object')) {
            // @id for LD-JSON
            // TODO: href or itemid for Microdata
            // TODO: about, href, resource for RDFa
            if (!this.checkType(element.item['@id'], 'url')) {
                return {
                    issueMessage: `Invalid URL in field "item.@id"`,
                    severity: 'WARNING',
                }
            }
        } else {
            if (
                (!isLast && !this.checkType(element.item, 'url'))
                // But if it has one, it should be valid
                || (isLast && element.item && !this.checkType(element.item, 'url'))
            ) {
                return {
                    issueMessage: `Invalid URL in field "item"`,
                    severity: 'WARNING',
                }
            }
        }
        return null;
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
}
