import ProductValidator from '../product.js';
import { loadTestData } from './utils.js';

describe('ProductValidator', () => {
    describe('JSON-LD', () => {
        let validator;

        beforeEach(() => {
            validator = new ProductValidator('jsonld');
        });

        it('should validate a correct product structure in valid1.json', async () => {
            const data = await loadTestData('product/valid1.json', 'jsonld', 'Product');
            const issues = validator.validate(data);
            expect(issues).toHaveLength(0);
        });

        it('should validate a correct product structure in valid2.json', async () => {
            const data = await loadTestData('product/valid2.json', 'jsonld', 'Product');
            const issues = validator.validate(data);
            expect(issues).toHaveLength(0);
        });

        it('should validate a correct product structure in valid3.json', async () => {
            const data = await loadTestData('product/valid3.json', 'jsonld', 'Product');
            const issues = validator.validate(data);
            expect(issues).toHaveLength(0);
        });

        it('should validate a correct product structure in valid4.json', async () => {
            const data = await loadTestData('product/valid4.json', 'jsonld', 'Product');
            const issues = validator.validate(data);
            expect(issues).toHaveLength(0);
        });

        it('should show warnings for recommended fields in invalid1.json', async () => {
            const data = await loadTestData('product/invalid1.json', 'jsonld', 'Product');
            const issues = validator.validate(data);
            expect(issues).toHaveLength(2);
            expect(issues[0]).toStrictEqual({
                issueMessage: 'Missing field "aggregateRating" (optional)',
                severity: 'WARNING'
            });
            expect(issues[1]).toStrictEqual({
                issueMessage: 'Missing field "review" (optional)',
                severity: 'WARNING'
            });
        });
    });
});