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
import { readFile } from 'fs/promises';
import { join } from 'path';
import WebAutoExtractor from '@marbec/web-auto-extractor';

/**
 * Loads and parses test data from a file
 * @param {string} filepath - The path to the file within the gallery directory (e.g. 'breadcrumb/valid1.json')
 * @param {string} dataType - (optional)The type of structured data (jsonld, microdata, rdfa)
 * @returns {Promise<Object|Array>} The parsed structured data
 */
export const loadTestData = async (filepath, dataType) => {
  const filePath = join(process.cwd(), 'gallery', filepath);
  let content = await readFile(filePath, 'utf8');

  // Wrap JSON-LD content in script tag if needed
  if (dataType === 'jsonld') {
    content = `<script type="application/ld+json">${content}</script>`;
  }

  const result = new WebAutoExtractor({
    addLocation: true,
    embedSource: ['rdfa', 'microdata'],
  }).parse(content);

  if (dataType) {
    // Only return dataType and errors, delete all other data
    Object.keys(result).forEach((key) => {
      if (key !== dataType && key !== 'errors') {
        delete result[key];
      }
    });
  }

  return result;
};

export const MockValidator = () =>
  Promise.resolve({
    default: class MockValidator {
      validate() {
        return [];
      }
    },
  });
