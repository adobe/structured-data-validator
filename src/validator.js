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
export class Validator {
  constructor(schemaOrgPath) {
    this.schemaOrgPath = schemaOrgPath;
    this.globalHandlers = [() => import('./types/schemaOrg.js')];

    this.registeredHandlers = {
      BreadcrumbList: [() => import('./types/BreadcrumbList.js')],
      Person: [() => import('./types/Person.js')],
      Organization: [() => import('./types/Organization.js')],
      ListItem: [() => import('./types/ListItem.js')],
      Product: [() => import('./types/Product.js')],
      Review: [() => import('./types/Review.js')],
      AggregateRating: [() => import('./types/AggregateRating.js')],
      Offer: [() => import('./types/Offer.js')],
      AggregateOffer: [() => import('./types/AggregateOffer.js')],
      PriceSpecification: [() => import('./types/PriceSpecification.js')],
      UnitPriceSpecification: [
        () => import('./types/UnitPriceSpecification.js'),
      ],
    };
  }

  async #validateSubtree(data, rootData, dataFormat, path = []) {
    const spacing = '  ' + '  '.repeat(path.length);

    if (Array.isArray(data)) {
      const results = await Promise.all(
        data.map(async (item, index) => {
          let last = path[path.length - 1];
          last = { ...last, index, length: data.length };
          if (item['@type']) {
            last.type = item['@type'];
          }
          return this.#validateSubtree(item, rootData, dataFormat, [
            ...path.slice(0, -1),
            last,
          ]);
        }),
      );
      return results.flat();
    }

    if (typeof data === 'object' && data !== null) {
      if (!data['@type']) {
        console.warn(`${spacing}  WARN: No type found for item`);
        // TODO: Should return a validation error as type is missing,
        //       WAE is already returning an error
        return [];
      }

      let types = [];
      if (Array.isArray(data['@type'])) {
        types = data['@type'];
      } else {
        types = [data['@type']];
      }

      const typeIssues = await Promise.all(
        types.map(async (type) => {
          // console.debug(`${spacing}VALIDATE TYPE:`, type, JSON.stringify(path));

          // Find supported handlers
          const handlers = [...(this.registeredHandlers[type] || [])];
          if (!handlers || handlers.length === 0) {
            console.warn(
              `${spacing}  WARN: No handlers registered for type: ${type}`,
            );
            return [];
          }
          handlers.push(...(this.globalHandlers || []));

          const handlerPromises = handlers.map(async (handler) => {
            const handlerClass = (await handler()).default;
            const handlerInstance = new handlerClass({
              dataFormat,
              path,
              // If an object has multiple types, we need to pass the current type for any global handlers
              type,
              schemaOrgPath: this.schemaOrgPath,
            });
            return handlerInstance.validate(data);
          });

          // Wait for all handlers to complete
          const handlerResults = (await Promise.all(handlerPromises)).flat();

          /* for (const issue of handlerResults) {
            console.debug(`${spacing}  ISSUE:`, issue);
          } */

          return handlerResults;
        }),
      );

      // Check properties for subtypes
      const properties = Object.keys(data).filter(
        (key) =>
          // Ignore LD-JSON properties
          !key.startsWith('@') &&
          data[key] !== null &&
          data[key] !== undefined &&
          // Array of objects
          // Array of objects
          ((Array.isArray(data[key]) &&
            data[key].length > 0 &&
            typeof data[key][0] === 'object') ||
            // Object
            (!Array.isArray(data[key]) && typeof data[key] === 'object')),
      );
      /* if (properties.length > 0) {
        console.debug(`${spacing}PROPERTIES:`, properties);
      } */

      const propertyIssues = await Promise.all(
        properties.map((property) => {
          const newPathElem = { property };
          if (data[property]?.['@type']) {
            newPathElem.type = data[property]['@type'];
          }
          return this.#validateSubtree(data[property], rootData, dataFormat, [
            ...path,
            newPathElem,
          ]);
        }),
      );

      return [...typeIssues.flat(), ...propertyIssues.flat()];
    }

    return [];
  }

  /**
   * Validates structured data
   * @param {object} waeData Data as parsed from Web Auto Extractor
   * @returns {object[]} Array of validation issues
   */
  async validate(waeData) {
    const dataFormats = ['jsonld', 'microdata', 'rdfa'];

    const results = [];

    for (const dataFormat of dataFormats) {
      if (
        !waeData[dataFormat] ||
        Object.keys(waeData[dataFormat]).length === 0
      ) {
        continue;
      }
      // console.debug('DATA FORMAT:', dataFormat);
      const rootTypes = Object.keys(waeData[dataFormat]);

      // Validate root type items
      for (const rootType of rootTypes) {
        // console.debug('  ROOT TYPE:', rootType);
        const rootTypeItems = waeData[dataFormat][rootType];

        // Validate each root type item
        for (const [index, item] of rootTypeItems.entries()) {
          const location = item['@location'];
          delete item['@location'];

          const issues = await this.#validateSubtree(item, item, dataFormat, [
            { type: rootType, index },
          ]);
          issues.forEach((issue) => {
            let source = item['@source'];
            if (!source && dataFormat === 'jsonld') {
              source = JSON.stringify(item);
            }
            results.push({
              rootType,
              dataFormat,
              location,
              source,
              ...issue,
            });
          });
        }
      }
    }

    // Expose WAE errors, filter out metadata errors
    const errors = waeData.errors.filter((e) => dataFormats.includes(e.format));
    for (const error of errors) {
      const result = {
        dataFormat: error.format,
        message: error.message,
      };
      if (error.sourceCodeLocation) {
        result.location = `${error.sourceCodeLocation.startOffset},${error.sourceCodeLocation.endOffset}`;
      }
      if (error.source) {
        result.source = error.source;
      }
      results.push(result);
    }

    return results;
  }
}
