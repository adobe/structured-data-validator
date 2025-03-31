import { readFile } from 'fs/promises';
import { join } from 'path';
import jsonld from 'jsonld';

export default class SchemaOrgValidator {
  constructor() {
    this.schema = null;
  }

  #stripSchema(name) {
    if (name.startsWith('schema:')) {
      return name.replace('schema:', '');
    }

    if (name.startsWith('http://schema.org/')) {
      return name.replace('http://schema.org/', '');
    }

    if (name.startsWith('https://schema.org/')) {
      return name.replace('https://schema.org/', '');
    }

    return name;
  }

  async #loadSchema() {
    // TODO: To optimize performance, we could reduce schema to only types and properties required for Google Rich Results
    let rawSchema = await readFile(
      join(process.cwd(), 'gallery/schemaorg-current-https.jsonld'),
      'utf8',
    );
    rawSchema = JSON.parse(rawSchema);

    const schema = {};

    // Get all types
    const entites = rawSchema['@graph'];
    entites
      .filter((entity) => entity['@type'] === 'rdfs:Class')
      .forEach((type) => {
        const name = this.#stripSchema(type['@id']);
        schema[name] = {
          properties: [],
          propertiesFromParent: {},
        };
        if (Array.isArray(type['rdfs:subClassOf'])) {
          schema[name].parents = type['rdfs:subClassOf'].map((parent) =>
            this.#stripSchema(parent['@id']),
          );
        } else if (type['rdfs:subClassOf']) {
          schema[name].parents = [
            this.#stripSchema(type['rdfs:subClassOf']['@id']),
          ];
        }
      });

    // Add all properties to types
    entites
      .filter((entity) => entity['@type'] === 'rdf:Property')
      .forEach((property) => {
        const domainIncludes = property['schema:domainIncludes'];
        const types = Array.isArray(domainIncludes)
          ? domainIncludes.map((domain) => this.#stripSchema(domain['@id']))
          : domainIncludes
            ? [this.#stripSchema(domainIncludes['@id'])]
            : [];
        types.forEach((type) => {
          if (schema[type]) {
            schema[type].properties.push(this.#stripSchema(property['@id']));
          }
        });
      });

    // TODO: Add property types for validation

    // Sort properties for each type alphabetically
    Object.keys(schema).forEach((type) => {
      schema[type].properties.sort();
    });

    // Add inherited properties
    const processOrder = this.#getTopologicalOrder(schema);
    this.#addInheritedProperties(schema, processOrder);

    // DEBUG: Write computed schema to a file
    // await writeFile(join(process.cwd(), 'gallery/schemaorg-current-types.json'), JSON.stringify(schema, null, 2));

    this.schema = schema;
  }

  #getTopologicalOrder(schema) {
    const visited = new Set();
    const temp = new Set(); // For cycle detection
    const order = [];

    // Helper function for DFS
    const visit = (typeId) => {
      if (temp.has(typeId)) {
        throw new Error('Cyclic inheritance detected');
      }
      if (visited.has(typeId)) {
        return;
      }

      temp.add(typeId);

      const type = schema[typeId];
      if (type && type.parents) {
        // Visit all parents before this type
        for (const parentId of type.parents) {
          if (schema[parentId]) {
            visit(parentId);
          }
        }
      }

      temp.delete(typeId);
      visited.add(typeId);
      order.push(typeId);
    };

    // Process all types
    Object.keys(schema).forEach((typeId) => {
      if (!visited.has(typeId)) {
        visit(typeId);
      }
    });

    return order;
  }

  #addInheritedProperties(schema, processOrder) {
    processOrder.forEach((typeId) => {
      const type = schema[typeId];
      if (type.parents && type.parents.length > 0) {
        // Process each parent
        for (const parentId of type.parents) {
          if (schema[parentId]) {
            // Add direct properties from this parent
            type.propertiesFromParent[parentId] = [
              ...schema[parentId].properties,
            ];

            // Add inherited properties from this parent's ancestors
            Object.keys(schema[parentId].propertiesFromParent).forEach(
              (ancestorId) => {
                if (
                  !type.propertiesFromParent[ancestorId] &&
                  schema[parentId].propertiesFromParent[ancestorId].length > 0
                ) {
                  type.propertiesFromParent[ancestorId] =
                    schema[parentId].propertiesFromParent[ancestorId];
                }
              },
            );
          }
        }
      }
    });
  }

  async validateProperty(type, property) {
    if (!this.schema) {
      await this.#loadSchema();
    }

    // Check if type exists
    if (!this.schema[type]) {
      return false;
    }

    // Check if property is directly supported
    if (this.schema[type].properties.includes(property)) {
      return true;
    }

    // Check if property is supported through inheritance
    return Object.keys(this.schema[type].propertiesFromParent).some(
      (parent) => {
        return this.schema[type].propertiesFromParent[parent].includes(
          property,
        );
      },
    );
  }

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
      const properties = Object.keys(data).filter(
        (key) => !key.startsWith('@'),
      );
      //console.debug(`Found properties: ${properties.map((p) => p.replace('http://schema.org/', '')).join(', ')}`);

      // Check in schema.org schema if all properties are supported within the given type
      await Promise.all(
        properties.map(async (property) => {
          const propertyId = this.#stripSchema(property);
          const typeId = this.#stripSchema(type);

          const isValid = await this.validateProperty(typeId, propertyId);
          if (!isValid) {
            issues.push({
              issueMessage: `Property "${propertyId}" for type "${typeId}" at "${path}" is not supported by the schema.org specification`,
              severity: 'WARNING',
            });
          }
          // console.debug(`Property ${propertyId} for type ${typeId} is ${isValid ? 'valid' : 'invalid'}`);
        }),
      );

      // Go through all properties, if it is Array or object with @type, call recursively
      for (const property of properties) {
        if (Array.isArray(data[property])) {
          // For each element
          for (const [index, element] of data[property].entries()) {
            const elementIssues = await this.validateSchema(
              element,
              `${path}.${this.#stripSchema(property)}[${index}]`,
            );
            issues.push(...elementIssues);
          }
        } else if (
          typeof data[property] === 'object' &&
          data[property] !== null &&
          data[property]['@type']
        ) {
          const propertyIssues = await this.validateSchema(
            data[property],
            `${path}.${this.#stripSchema(property)}`,
          );
          issues.push(...propertyIssues);
        }
      }
    }

    return issues;
  }

  async validate(data) {
    const expanded = await jsonld.expand(data);
    return this.validateSchema(expanded);
  }
}
