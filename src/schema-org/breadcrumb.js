import jsonld from 'jsonld';

import SchemaOrg from '../schemaOrg.js';

export default class Breadcrumb {
  constructor() {
    this.schema = new SchemaOrg();
  }

  // TODO: Refactor this into SchemaOrg class. No need to have separate files for each type
  async validateSchema(data, path = '') {
    // console.debug('Called validateSchema at', path);
    const issues = [];

    if (Array.isArray(data)) {
      // if data is an array, iterate and call recursively
      for (const [index, item] of data.entries()) {
        const itemIssues = await this.validateSchema(item, path + `[${index}]`);
        issues.push(...itemIssues);
      }
      return issues;
    }
    
    if (typeof data === 'object' && data !== null) {
      // If object, get type from @type
      let type = data['@type'];
      if (Array.isArray(type)) {
        type = type[0];
      }
      if (!type) {
        return [];
      }
      // console.debug(`Found type ${type} at ${path}`);

      // Get list of properties, any other keys which do not start with @
      const properties = Object
        .keys(data)
        .filter((key) => !key.startsWith('@'));
      //console.debug(`Found properties: ${properties.map((p) => p.replace('http://schema.org/', '')).join(', ')}`);

      // Check in schema.org schema if all properties are supported within the given type
      await Promise.all(properties.map(async (property) => {
        const propertyId = property.replace('http://schema.org/', '');
        const typeId = type.replace('http://schema.org/', '');

        const isValid = await this.schema.validateProperty(typeId, propertyId);
        if (!isValid) {
          issues.push({
            path,
            property: propertyId,
            type: typeId,
            message: `Property ${propertyId} for type ${typeId} at ${path} is not supported by schema.org specification`,
          });
        }
        // console.debug(`Property ${propertyId} for type ${typeId} is ${isValid ? 'valid' : 'invalid'}`);
      }));
 
      // Go through all properties, if it is Array or object with @type, call recursively
      for (const property of properties) {
        if (Array.isArray(data[property])) {
          // For each element
          for (const [index, element] of data[property].entries()) {
            const elementIssues = await this.validateSchema(element, `${path}.${property.replace('http://schema.org/', '')}[${index}]`);
            issues.push(...elementIssues);
          }
        } else if (typeof data[property] === 'object' && data[property] !== null && data[property]['@type']) {
          const propertyIssues = await this.validateSchema(data[property], `${path}.${property.replace('http://schema.org/', '')}`);
          issues.push(...propertyIssues);
        }
      }
    }

    return issues;
  }

  async validate(data) {
    // Expand JSON
    const expanded = await jsonld.expand(data);

    // Validate against schema.org
    const issues = await this.validateSchema(expanded);

    return issues;
  }
}
