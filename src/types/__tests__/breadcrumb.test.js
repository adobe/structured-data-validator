import { readFile } from 'fs/promises';
import { join } from 'path';
import WAE from 'web-auto-extractor';

import BreadcrumbValidator from '../breadcrumb.js';

describe('BreadcrumbValidator', () => {

    const loadTestData = async (filename, type) => {
        const filePath = join(process.cwd(), 'gallery/breadcrumb', filename);
        let content = await readFile(filePath, 'utf8');
        if (type === 'jsonld') {
            content = `<script type="application/ld+json">${content}</script>`;
        }

        const result = WAE().parse(content);

        const data = result[type];
        if (data.BreadcrumbList.length === 1) {
            return data.BreadcrumbList[0];
        }
        return data.BreadcrumbList;
    };

    describe('JSON-LD', () => {
        let validator;

        beforeEach(() => {
            validator = new BreadcrumbValidator('jsonld');
        });

        it('should validate a correct breadcrumb structure in valid1.json', async () => {
            const data = await loadTestData('valid1.json', 'jsonld');
            const issues = validator.validate(data);
            expect(issues).toHaveLength(0);
        });
    
        it('should validate multiple breadcrumb lists in valid2.json', async () => {
            const data = await loadTestData('valid2.json', 'jsonld');
            expect(data).toHaveLength(2);
            for (const item of data) {
                const issues = validator.validate(item);
                expect(issues).toHaveLength(0);
            }
        });
    
        it('should detect missing required attributes in invalid1.json', async () => {
            const data = await loadTestData('invalid1.json', 'jsonld');
            const issues = validator.validate(data);
    
            expect(issues).toHaveLength(1);
            expect(issues[0]).toStrictEqual({
                issueMessage: 'One of the following conditions needs to be met: Required attribute \"name\" is missing or Required attribute \"item.name\" is missing',
                severity: 'ERROR'
            });
        });
    
        it('should detect invalid URL in invalid2.json', async () => {
            const data = await loadTestData('invalid2.json', 'jsonld');
            const issues = validator.validate(data);
    
            expect(issues).toHaveLength(1);
            expect(issues[0]).toStrictEqual({
                issueMessage: 'Invalid URL in field "item"',
                severity: 'WARNING'
            });
        });
    
        it('should detect missing required attributes in invalid3.json', async () => {
            const data = await loadTestData('invalid3.json', 'jsonld');
            const issues = validator.validate(data);
    
            expect(issues).toHaveLength(1);
            expect(issues[0]).toStrictEqual({
                issueMessage: 'One of the following conditions needs to be met: Required attribute \"name\" is missing or Required attribute \"item.name\" is missing',
                severity: 'ERROR'
            });
        });
    
        it('should detect invalid URLs in invalid4.json', async () => {
            const data = await loadTestData('invalid4.json', 'jsonld');
            const issues = validator.validate(data);
    
            expect(issues).toHaveLength(2);
            const error = {
                issueMessage: 'Invalid URL in field "item"',
                severity: 'WARNING'
            };
            expect(issues[0]).toStrictEqual(error);
            expect(issues[1]).toStrictEqual(error);
        });
    
        it('should detect missing required attributes in invalid5.json', async () => {
            const data = await loadTestData('invalid5.json', 'jsonld');
            const issues = validator.validate(data);
    
            expect(issues).toHaveLength(1);
            expect(issues[0]).toStrictEqual({
                issueMessage: 'Invalid type for attribute "itemListElement"',
                severity: 'ERROR'
            });
        });
    });

    describe('Microdata', () => {
        let validator;

        beforeEach(() => {
            validator = new BreadcrumbValidator('microdata');
        });

        it('should validate a correct breadcrumb structure in microdata-valid1.html', async () => {
            const data = await loadTestData('microdata-valid1.html', 'microdata');
            const issues = validator.validate(data);
            expect(issues).toHaveLength(0);
        });

        it('should validate multiple breadcrumb lists in microdata-valid1.html', async () => {
            const data = await loadTestData('microdata-valid2.html', 'microdata');
            expect(data).toHaveLength(2);
            for (const item of data) {
                const issues = validator.validate(item);
                expect(issues).toHaveLength(0);
            }
        });
    });

    describe('RDFa', () => {
        let validator;

        beforeEach(() => {
            validator = new BreadcrumbValidator('rdfa');
        });

        it('should validate a correct breadcrumb structure in rdfa-valid1.html', async () => {
            const data = await loadTestData('rdfa-valid1.html', 'rdfa');
            const issues = validator.validate(data);
            expect(issues).toHaveLength(0);
        });
    
        it('should validate multiple breadcrumb lists in rdfa-valid1.html', async () => {
            const data = await loadTestData('rdfa-valid2.html', 'rdfa');
            expect(data).toHaveLength(2);
            for (const item of data) {
                const issues = validator.validate(item);
                expect(issues).toHaveLength(0);
            }
        });
    });
});