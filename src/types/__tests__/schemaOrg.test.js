import { expect } from 'chai';

import { loadTestData } from './utils.js';
import SchemaOrgValidator from '../schemaOrg.js';

describe('Schema.org Validator', () => {
    let validator;

    before(() => {
        validator = new SchemaOrgValidator();
    });

    describe('JSON-LD', () => {
        it('should do a schema.org validation on BreadcrumbList', async () => {
            const data = await loadTestData(
                'breadcrumb/valid1.json',
                'jsonld',
                'BreadcrumbList'
            );

            const issues = await validator.validate(data);
            expect(issues).to.have.lengthOf(0);
        });

        it('should do a schema.org validation on BreadcrumbList with multiple items', async () => {
            const data = await loadTestData(
                'breadcrumb/valid2.json',
                'jsonld',
                'BreadcrumbList'
            );

            const issues = await validator.validate(data);
            expect(issues).to.have.lengthOf(0);
        });

        it('should do a schema.org validation on Product with basic properties', async () => {
            const data = await loadTestData(
                'product/valid1.json',
                'jsonld',
                'Product'
            );

            const issues = await validator.validate(data);
            expect(issues).to.have.lengthOf(0);
        });

        it('should do a schema.org validation on Product with offer', async () => {
            const data = await loadTestData(
                'product/valid2.json',
                'jsonld',
                'Product'
            );

            const issues = await validator.validate(data);
            expect(issues).to.have.lengthOf(0);
        });

        it('should do a schema.org validation on Product with reviews', async () => {
            const data = await loadTestData(
                'product/valid3.json',
                'jsonld',
                'Product'
            );

            const issues = await validator.validate(data);
            expect(issues).to.have.lengthOf(0);
        });

        it('should do a schema.org validation on Product with aggregate rating', async () => {
            const data = await loadTestData(
                'product/valid4.json',
                'jsonld',
                'Product'
            );

            const issues = await validator.validate(data);
            expect(issues).to.have.lengthOf(0);
        });
    });

    describe('Microdata', () => {
        it('should do a schema.org validation on BreadcrumbList', async () => {
            const data = await loadTestData(
                'breadcrumb/microdata-valid1.html',
                'microdata',
                'BreadcrumbList'
            );

            const issues = await validator.validate(data);
            expect(issues).to.have.lengthOf(0);
        });
    });

    describe('RDFa', () => {
        it('should do a schema.org validation on BreadcrumbList', async () => {
            const data = await loadTestData(
                'breadcrumb/rdfa-valid1.html',
                'rdfa',
                'BreadcrumbList'
            );

            const issues = await validator.validate(data);
            expect(issues).to.have.lengthOf(0);
        });
    });
});
