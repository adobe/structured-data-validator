# @adobe/structured-data-validator

![GitHub License](https://img.shields.io/github/license/adobe/structured-data-validator)
[![CI](https://github.com/adobe/structured-data-validator/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/adobe/structured-data-validator/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/%40adobe%2Fstructured-data-validator?link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2F%40adobe%2Fstructured-data-validator)](https://www.npmjs.com/package/@adobe/structured-data-validator)
![Node Current](https://img.shields.io/node/v/%40adobe%2Fstructured-data-validator)

A JavaScript library for validating and parsing structured data according to Schema.org specifications and Google Rich Results requirements. This library ensures your structured data meets both Schema.org standards and Google's specific requirements for rich results, helping to optimize your content for search engines and other platforms.

## Features

- Validates structured data against both Schema.org and Google Rich Results specifications
- Ensures compliance with Google's structured data guidelines
- Extensible validation system with custom type handlers

## Installation

```bash
npm install @adobe/structured-data-validator
```

## Usage

This library works in conjunction with [@marbec/web-auto-extractor](https://www.npmjs.com/package/@marbec/web-auto-extractor) to validate structured data extracted from web pages.

```javascript
import { Validator } from '@adobe/structured-data-validator';
import WebAutoExtractor from '@marbec/web-auto-extractor';

// First, extract structured data from HTML
const extractor = new WebAutoExtractor({ addLocation: true, embedSource: ['rdfa', 'microdata'] });
const extractedData = extractor.parse(sampleHTML);

// Create a validator instance
const validator = new Validator();

// Validate the extracted structured data
const results = await validator.validate(extractedData);
}
```

The validator expects the output format from `@marbec/web-auto-extractor`, which includes:

- JSON-LD structured data
- Microdata
- RDFa

## Development

### Prerequisites

- Node.js (latest LTS version recommended)
- npm

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts

- `npm test` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run format` - Check code formatting
- `npm run format:fix` - Fix code formatting issues

### Debug Logging

To enable debug logging and see detailed validation output, set the `debug` property to `true` on your `Validator` instance:

```js
const validator = new Validator(schemaOrgPath);
validator.debug = true; // Enable debug logging
```

This will print additional information to the console during validation, which is useful for development and troubleshooting.

## Dependencies

- [@marbec/web-auto-extractor](https://www.npmjs.com/package/@marbec/web-auto-extractor) - For extracting structured data from web pages
