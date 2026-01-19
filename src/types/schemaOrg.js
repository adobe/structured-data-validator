/**
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
export default class SchemaOrgValidator {
  // Cache schema globally to improve performance
  static schemaCache = null;

  constructor({ dataFormat, path, type, schemaOrgJson }) {
    this.dataFormat = dataFormat;
    this.path = path;
    this.type = type;
    this.schemaOrgJson = schemaOrgJson;
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
    if (SchemaOrgValidator.schemaCache instanceof Promise) {
      return SchemaOrgValidator.schemaCache;
    }

    SchemaOrgValidator.schemaCache = new Promise((resolve) => {
      const schema = {};

      // Get all types
      const entites = this.schemaOrgJson['@graph'];
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

      resolve(schema);
    });

    return SchemaOrgValidator.schemaCache;
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
    const schema = await this.#loadSchema();

    // Check if type exists
    if (!schema[type]) {
      return false;
    }

    // Check if property is directly supported
    if (schema[type].properties.includes(property)) {
      return true;
    }

    // Check if property is supported through inheritance
    return Object.keys(schema[type].propertiesFromParent).some((parent) => {
      return schema[type].propertiesFromParent[parent].includes(property);
    });
  }

  async validateType(type) {
    const schema = await this.#loadSchema();
    return !!schema[type];
  }

  async validate(data) {
    const issues = [];

    if (typeof data === 'object' && data !== null) {
      if (!this.type) {
        return [];
      }

      const typeId = this.#stripSchema(this.type);

      // Check if type exists in schema.org
      const typeExists = await this.validateType(typeId);
      if (!typeExists) {
        issues.push({
          issueMessage: `Type "${typeId}" is not a valid schema.org type`,
          severity: 'ERROR',
          path: this.path,
          errorType: 'schemaOrg',
          fieldName: '@type',
        });
        // Skip property validation since type is invalid
        return issues;
      }

      // Get list of properties, any other keys which do not start with @
      const properties = Object.keys(data).filter(
        (key) => !key.startsWith('@'),
      );

      // Check in schema.org schema if all properties are supported within the given type
      await Promise.all(
        properties.map(async (property) => {
          const propertyId = this.#stripSchema(property);

          const isValid = await this.validateProperty(typeId, propertyId);
          if (!isValid) {
            issues.push({
              issueMessage: `Property "${propertyId}" for type "${typeId}" is not supported by the schema.org specification`,
              severity: 'WARNING',
              path: this.path,
              errorType: 'schemaOrg',
              fieldName: propertyId,
            });
          }
        }),
      );
    }

    return issues;
  }
}
