import { expect } from 'chai';
import BreadcrumbValidator from '../breadcrumb.js';
import { loadTestData } from './utils.js';

describe('BreadcrumbValidator', () => {
  describe('JSON-LD', () => {
    let validator;

    beforeEach(() => {
      validator = new BreadcrumbValidator('jsonld');
    });

    it('should validate a correct breadcrumb structure in valid1.json', async () => {
      const data = await loadTestData(
        'breadcrumb/valid1.json',
        'jsonld',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should validate multiple breadcrumb lists in valid2.json', async () => {
      const data = await loadTestData(
        'breadcrumb/valid2.json',
        'jsonld',
        'BreadcrumbList',
      );
      expect(data).to.have.lengthOf(2);
      for (const item of data) {
        const issues = validator.validate(item);
        expect(issues).to.have.lengthOf(0);
      }
    });

    it('should detect missing required attributes in invalid1.json', async () => {
      const data = await loadTestData(
        'breadcrumb/invalid1.json',
        'jsonld',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);

      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage:
          'One of the following conditions needs to be met: Required attribute "name" is missing or Required attribute "item.name" is missing',
        severity: 'ERROR',
      });
    });

    it('should detect invalid URL in invalid2.json', async () => {
      const data = await loadTestData(
        'breadcrumb/invalid2.json',
        'jsonld',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);

      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage: 'Invalid URL in field "item"',
        severity: 'WARNING',
      });
    });

    it('should detect missing required attributes in invalid3.json', async () => {
      const data = await loadTestData(
        'breadcrumb/invalid3.json',
        'jsonld',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);

      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage:
          'One of the following conditions needs to be met: Required attribute "name" is missing or Required attribute "item.name" is missing',
        severity: 'ERROR',
      });
    });

    it('should detect invalid URLs in invalid4.json', async () => {
      const data = await loadTestData(
        'breadcrumb/invalid4.json',
        'jsonld',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);

      expect(issues).to.have.lengthOf(2);
      const error = {
        issueMessage: 'Invalid URL in field "item"',
        severity: 'WARNING',
      };
      expect(issues[0]).to.deep.equal(error);
      expect(issues[1]).to.deep.equal(error);
    });

    it('should detect missing required attributes in invalid5.json', async () => {
      const data = await loadTestData(
        'breadcrumb/invalid5.json',
        'jsonld',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);

      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage: 'Invalid type for attribute "itemListElement"',
        severity: 'ERROR',
      });
    });
  });

  describe('Microdata', () => {
    let validator;

    beforeEach(() => {
      validator = new BreadcrumbValidator('microdata');
    });

    it('should validate a correct breadcrumb structure in microdata-valid1.html', async () => {
      const data = await loadTestData(
        'breadcrumb/microdata-valid1.html',
        'microdata',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should validate multiple breadcrumb lists in microdata-valid1.html', async () => {
      const data = await loadTestData(
        'breadcrumb/microdata-valid2.html',
        'microdata',
        'BreadcrumbList',
      );
      expect(data).to.have.lengthOf(2);
      for (const item of data) {
        const issues = validator.validate(item);
        expect(issues).to.have.lengthOf(0);
      }
    });

    it('should detect missing required attributes in microdata-invalid1.html', async () => {
      const data = await loadTestData(
        'breadcrumb/microdata-invalid1.html',
        'microdata',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage:
          'One of the following conditions needs to be met: Required attribute "name" is missing or Required attribute "item.name" is missing',
        severity: 'ERROR',
      });
    });

    it('should detect invalid URL in microdata-invalid2.html', async () => {
      const data = await loadTestData(
        'breadcrumb/microdata-invalid2.html',
        'microdata',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage: 'Invalid URL in field "item"',
        severity: 'WARNING',
      });
    });

    it('should detect missing required attributes in microdata-invalid3.html', async () => {
      const data = await loadTestData(
        'breadcrumb/microdata-invalid3.html',
        'microdata',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage:
          'One of the following conditions needs to be met: Required attribute "name" is missing or Required attribute "item.name" is missing',
        severity: 'ERROR',
      });
    });

    it('should not detect relative URLs as issues in microdata-invalid4.html', async () => {
      // This is different behavior than JSON-LD and RDFa
      const data = await loadTestData(
        'breadcrumb/microdata-invalid4.html',
        'microdata',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should detect missing field in microdata-invalid5.html', async () => {
      const data = await loadTestData(
        'breadcrumb/microdata-invalid5.html',
        'microdata',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage: 'Required attribute "itemListElement" is missing',
        severity: 'ERROR',
      });
    });
  });

  describe('RDFa', () => {
    let validator;

    beforeEach(() => {
      validator = new BreadcrumbValidator('rdfa');
    });

    it('should validate a correct breadcrumb structure in rdfa-valid1.html', async () => {
      const data = await loadTestData(
        'breadcrumb/rdfa-valid1.html',
        'rdfa',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should validate multiple breadcrumb lists in rdfa-valid1.html', async () => {
      const data = await loadTestData(
        'breadcrumb/rdfa-valid2.html',
        'rdfa',
        'BreadcrumbList',
      );
      expect(data).to.have.lengthOf(2);
      for (const item of data) {
        const issues = validator.validate(item);
        expect(issues).to.have.lengthOf(0);
      }
    });

    it('should detect missing required attributes in rdfa-invalid1.html', async () => {
      const data = await loadTestData(
        'breadcrumb/rdfa-invalid1.html',
        'rdfa',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage:
          'One of the following conditions needs to be met: Required attribute "name" is missing or Required attribute "item.name" is missing',
        severity: 'ERROR',
      });
    });

    it('should detect invalid URL in rdfa-invalid2.html', async () => {
      const data = await loadTestData(
        'breadcrumb/rdfa-invalid2.html',
        'rdfa',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage: 'Invalid URL in field "item.@id"',
        severity: 'WARNING',
      });
    });

    it('should detect required attributes in rdfa-invalid3.html', async () => {
      const data = await loadTestData(
        'breadcrumb/rdfa-invalid3.html',
        'rdfa',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage:
          'One of the following conditions needs to be met: Required attribute "name" is missing or Required attribute "item.name" is missing',
        severity: 'ERROR',
      });
    });

    it('should detect invalid URLs in rdfa-invalid4.html', async () => {
      // This behaviour is unique to RDFa.
      const data = await loadTestData(
        'breadcrumb/rdfa-invalid4.html',
        'rdfa',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage: 'Invalid URL in field "item.@id"',
        severity: 'WARNING',
      });
    });

    it('should detect missing field in rdfa-invalid5.html', async () => {
      const data = await loadTestData(
        'breadcrumb/rdfa-invalid5.html',
        'rdfa',
        'BreadcrumbList',
      );
      const issues = validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.equal({
        issueMessage: 'Required attribute "itemListElement" is missing',
        severity: 'ERROR',
      });
    });
  });
});
