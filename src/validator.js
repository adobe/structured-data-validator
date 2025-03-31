import { readFile } from 'fs/promises';
import { join } from 'path';

export class Validator {
  constructor() {
    this.supportedTypes = [
      'BreadcrumbList',
      // 'Recipe',
    ];

    // TODO: ProductGroup

    this.registeredHandlers = {
      // TODO: Separate schema.org and Google requirements
      BreadcrumbList: [
        () => import('./types/breadcrumb.js'),
        () => import('./types/schemaOrg.js'),
      ],
      // 'Recipe': [() => import('./types/recipe.js')],
      Product: [
        () => import('./types/product.js'),
        () => import('./types/schemaOrg.js'),
      ], // () => import('./types/merchant.js')
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

  async validate(data, dataFormat) {
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
