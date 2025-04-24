# @adobe/structured-data-parser

A JavaScript library for validating and parsing structured data according to Schema.org specifications and Google Rich Results requirements. This library ensures your structured data meets both Schema.org standards and Google's specific requirements for rich results, helping to optimize your content for search engines and other platforms.

## Features

- Validates structured data against both Schema.org and Google Rich Results specifications
- Ensures compliance with Google's structured data guidelines
- Extensible validation system with custom type handlers

## Installation

```bash
npm install @adobe/structured-data-parser
```

## Usage

This library works in conjunction with [@marbec/web-auto-extractor](https://www.npmjs.com/package/@marbec/web-auto-extractor) to validate structured data extracted from web pages.

```javascript
import { Validator } from '@adobe/structured-data-parser';
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

## Dependencies

- [@marbec/web-auto-extractor](https://www.npmjs.com/package/@marbec/web-auto-extractor) - For extracting structured data from web pages
