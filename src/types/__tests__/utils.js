import { readFile } from 'fs/promises';
import { join } from 'path';
import WAE from '@marbec/web-auto-extractor';

/**
 * Loads and parses test data from a file
 * @param {string} filepath - The path to the file within the gallery directory (e.g. 'breadcrumb/valid1.json')
 * @param {string} dataType - The type of structured data (jsonld, microdata, rdfa)
 * @param {string} entity - The entity type to extract
 * @returns {Promise<Object|Array>} The parsed structured data
 */
export const loadTestData = async (filepath, dataType, entity) => {
    const filePath = join(process.cwd(), 'gallery', filepath);
    let content = await readFile(filePath, 'utf8');
    
    // Wrap JSON-LD content in script tag if needed
    if (dataType === 'jsonld') {
        content = `<script type="application/ld+json">${content}</script>`;
    }

    const result = WAE().parse(content);
    const data = result[dataType];

    // Handle both single and multiple items
    if (data[entity].length === 1) {
        return data[entity][0];
    }
    return data[entity];
}; 