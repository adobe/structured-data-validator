import { readFile } from 'fs/promises';
import { join } from 'path';

export class Validator {
  constructor() {
    // TODO: Reverse into ignore, so we can ignore structured data types which are not relevant for rich results or shopping
    this.supportedTypes = [
      'BreadcrumbList',
      'ListItem',
      'Product',
      'Review',
      'AggregateRating',
      // 'Recipe',
    ];

    // TODO: ProductGroup

    this.registeredHandlers = {
      // TODO: Check schema.org validations again
      // TODO: Separate schema.org and Google requirements
      BreadcrumbList: [
        () => import('./types/BreadcrumbList.js'),
        () => import('./types/schemaOrg.js'),
      ],
      ListItem: [() => import('./types/ListItem.js')],
      // 'Recipe': [() => import('./types/recipe.js')],
      Product: [
        () => import('./types/Product.js'),
        () => import('./types/schemaOrg.js'),
        // () => import('./types/merchant.js')
      ],
      Review: [() => import('./types/Review.js')],
      AggregateRating: [() => import('./types/AggregateRating.js')],
    };
  }

  async parse(url) {
    // TODO: Mock for now, just return contents of ../gallery/breadcrumb/valid1.json
    // TODO: Refine the format
    // TODO: Handle @graph notation
    try {
      const fileContents = await readFile(join(process.cwd(), url), 'utf8');
      const parsed = JSON.parse(fileContents);
      // If object, wrap in array
      if (!Array.isArray(parsed)) {
        return [parsed];
      }
      return parsed;
    } catch (error) {
      throw new Error(`Failed to parse file ${url}: ${error.message}`);
    }
    /*


        const structuredData = [];
    const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
    scriptTags.forEach((tag) => {
      try {
        const data = JSON.parse(tag.textContent);
      
        // Flatten if @graph notation is used
        if (data['@graph']) {
          data['@graph'].forEach((graph) => {
            structuredData.push(graph);
          });
        } else {
          structuredData.push(data);
        }

        */
  }

  // TODO: Combine with schema org validator? So that we have the traverse logic only once
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
        // TODO: Validation error as type is missing
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
          const handlers = this.registeredHandlers[type];
          if (!handlers || handlers.length === 0) {
            console.warn(
              `${spacing}  WARN: No handlers registered for type: ${type}`,
            );
            return [];
          }

          const handlerPromises = handlers.map(async (handler) => {
            const handlerClass = (await handler()).default;
            const handlerInstance = new handlerClass({ dataFormat, path });
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

    return results;
  }

  async validateOld(data, dataFormat) {
    // TODO: Take input from WAE and act on it
    // TODO: Keep track of hierarchy

    // WAE uses an object with primary types as keys and arrays of items as values
    const validationPromises = Object.keys(data).map(async (type) => {
      if (!this.supportedTypes.includes(type)) {
        throw new Error(`Unsupported type: ${type}`);
      }

      const handlers = this.registeredHandlers[type];
      if (!handlers) {
        throw new Error(`No handlers registered for type: ${type}`);
      }

      const issues = [];

      for (const item of data[type]) {
        // Create array of handler validation promises
        const handlerPromises = handlers.map(async (handler) => {
          const handlerClass = (await handler()).default;
          const handlerInstance = new handlerClass(dataFormat);
          return handlerInstance.validate(item);
        });

        // Wait for all handlers to complete
        const handlerResults = await Promise.all(handlerPromises);

        // Flatten all issues from handlers
        issues.push(...handlerResults.flat());
      }

      return {
        schemaType: type,
        issues,
        dataFormat,
      };
    });

    // Wait for all item validations to complete
    return Promise.all(validationPromises);
  }
}
