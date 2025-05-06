import { expect } from 'chai';

import { loadTestData, MockValidator } from './utils.js';
import { Validator } from '../../validator.js';

describe('BreadcrumbListValidator', () => {
  describe('JSON-LD', () => {
    let validator;

    beforeEach(() => {
      validator = new Validator();
      validator.registeredHandlers = {
        BreadcrumbList: [() => import('../BreadcrumbList.js')],
        ListItem: [() => import('../ListItem.js')],
        WebPage: [MockValidator],
      };
      validator.globalHandlers = [];
    });

    it('should validate a correct breadcrumb structure in valid1.json', async () => {
      const data = await loadTestData('breadcrumb/valid1.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should validate multiple breadcrumb lists in valid2.json', async () => {
      const data = await loadTestData('breadcrumb/valid2.json', 'jsonld');
      expect(data.jsonld.BreadcrumbList).to.have.lengthOf(2);
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should detect missing required attributes in invalid1.json', async () => {
      const data = await loadTestData('breadcrumb/invalid1.json', 'jsonld');
      const issues = await validator.validate(data);

      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        rootType: 'BreadcrumbList',
        issueMessage:
          'One of the following conditions needs to be met: Required attribute "name" is missing or Required attribute "item.name" is missing',
        location: '35,313',
        severity: 'ERROR',
        path: [
          { type: 'BreadcrumbList', index: 0 },
          {
            property: 'itemListElement',
            index: 0,
            length: 2,
            type: 'ListItem',
          },
        ],
      });
    });

    it('should detect invalid URL in invalid2.json', async () => {
      const data = await loadTestData('breadcrumb/invalid2.json', 'jsonld');
      const issues = await validator.validate(data);

      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        rootType: 'BreadcrumbList',
        issueMessage: 'Invalid URL in field "item"',
        location: '35,381',
        severity: 'WARNING',
        path: [
          { type: 'BreadcrumbList', index: 0 },
          {
            property: 'itemListElement',
            index: 0,
            length: 2,
            type: 'ListItem',
          },
        ],
      });
    });

    it('should detect missing required attributes in invalid3.json', async () => {
      const data = await loadTestData('breadcrumb/invalid3.json', 'jsonld');
      const issues = await validator.validate(data);

      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        rootType: 'BreadcrumbList',
        issueMessage:
          'One of the following conditions needs to be met: Required attribute "name" is missing or Required attribute "item.name" is missing',
        location: '35,377',
        severity: 'ERROR',
        path: [
          { type: 'BreadcrumbList', index: 0 },
          {
            property: 'itemListElement',
            index: 0,
            length: 2,
            type: 'ListItem',
          },
        ],
      });
    });

    it('should detect invalid URLs in invalid4.json', async () => {
      const data = await loadTestData('breadcrumb/invalid4.json', 'jsonld');
      const issues = await validator.validate(data);

      expect(issues).to.have.lengthOf(2);
      const error = {
        issueMessage: 'Invalid URL in field "item"',
        location: '35,344',
        severity: 'WARNING',
      };
      expect(issues[0]).to.deep.include({
        ...error,
        path: [
          { type: 'BreadcrumbList', index: 0 },
          {
            property: 'itemListElement',
            index: 0,
            length: 2,
            type: 'ListItem',
          },
        ],
      });
      expect(issues[1]).to.deep.include({
        ...error,
        path: [
          { type: 'BreadcrumbList', index: 0 },
          {
            property: 'itemListElement',
            index: 1,
            length: 2,
            type: 'ListItem',
          },
        ],
      });
    });

    it('should detect missing required attributes in invalid5.json', async () => {
      const data = await loadTestData('breadcrumb/invalid5.json', 'jsonld');
      const issues = await validator.validate(data);

      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage: 'Invalid type for attribute "itemListElement"',
        location: '35,140',
        severity: 'ERROR',
        path: [{ type: 'BreadcrumbList', index: 0 }],
      });
    });
  });

  describe('Microdata', () => {
    let validator;

    beforeEach(() => {
      validator = new Validator();
      validator.registeredHandlers = {
        BreadcrumbList: [() => import('../BreadcrumbList.js')],
        ListItem: [() => import('../ListItem.js')],
        WebPage: [MockValidator],
      };
      validator.globalHandlers = [];
    });

    it('should validate a correct breadcrumb structure in microdata-valid1.html', async () => {
      const data = await loadTestData(
        'breadcrumb/microdata-valid1.html',
        'microdata',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should validate multiple breadcrumb lists in microdata-valid1.html', async () => {
      const data = await loadTestData(
        'breadcrumb/microdata-valid2.html',
        'microdata',
      );
      expect(data.microdata.BreadcrumbList).to.have.lengthOf(2);
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should detect missing required attributes in microdata-invalid1.html', async () => {
      const data = await loadTestData(
        'breadcrumb/microdata-invalid1.html',
        'microdata',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage:
          'One of the following conditions needs to be met: Required attribute "name" is missing or Required attribute "item.name" is missing',
        location: '67,607',
        severity: 'ERROR',
      });
    });

    it('should detect invalid URL in microdata-invalid2.html', async () => {
      const data = await loadTestData(
        'breadcrumb/microdata-invalid2.html',
        'microdata',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage: 'Invalid URL in field "item"',
        location: '67,834',
        severity: 'WARNING',
      });
    });

    it('should detect missing required attributes in microdata-invalid3.html', async () => {
      const data = await loadTestData(
        'breadcrumb/microdata-invalid3.html',
        'microdata',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage:
          'One of the following conditions needs to be met: Required attribute "name" is missing or Required attribute "item.name" is missing',
        location: '67,832',
        severity: 'ERROR',
      });
    });

    it('should not detect relative URLs as issues in microdata-invalid4.html', async () => {
      // This is different behavior than JSON-LD and RDFa
      const data = await loadTestData(
        'breadcrumb/microdata-invalid4.html',
        'microdata',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should detect missing field in microdata-invalid5.html', async () => {
      const data = await loadTestData(
        'breadcrumb/microdata-invalid5.html',
        'microdata',
      );
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage: 'Required attribute "itemListElement" is missing',
        location: '67,131',
        severity: 'ERROR',
      });
    });
  });

  describe('RDFa', () => {
    let validator;

    beforeEach(() => {
      validator = new Validator();
      validator.registeredHandlers = {
        BreadcrumbList: [() => import('../BreadcrumbList.js')],
        ListItem: [() => import('../ListItem.js')],
        WebPage: [MockValidator],
      };
      validator.globalHandlers = [];
    });

    it('should validate a correct breadcrumb structure in rdfa-valid1.html', async () => {
      const data = await loadTestData('breadcrumb/rdfa-valid1.html', 'rdfa');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should validate multiple breadcrumb lists in rdfa-valid1.html', async () => {
      const data = await loadTestData('breadcrumb/rdfa-valid2.html', 'rdfa');
      expect(data.rdfa.BreadcrumbList).to.have.lengthOf(2);
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(0);
    });

    it('should detect missing required attributes in rdfa-invalid1.html', async () => {
      const data = await loadTestData('breadcrumb/rdfa-invalid1.html', 'rdfa');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage:
          'One of the following conditions needs to be met: Required attribute "name" is missing or Required attribute "item.name" is missing',
        location: '67,498',
        severity: 'ERROR',
      });
    });

    it('should detect invalid URL in rdfa-invalid2.html', async () => {
      const data = await loadTestData('breadcrumb/rdfa-invalid2.html', 'rdfa');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage: 'Invalid URL in field "item.@id"',
        location: '67,644',
        severity: 'WARNING',
      });
    });

    it('should detect required attributes in rdfa-invalid3.html', async () => {
      const data = await loadTestData('breadcrumb/rdfa-invalid3.html', 'rdfa');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage:
          'One of the following conditions needs to be met: Required attribute "name" is missing or Required attribute "item.name" is missing',
        location: '67,642',
        severity: 'ERROR',
      });
    });

    it('should detect invalid URLs in rdfa-invalid4.html', async () => {
      // This behaviour is unique to RDFa.
      const data = await loadTestData('breadcrumb/rdfa-invalid4.html', 'rdfa');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage: 'Invalid URL in field "item.@id"',
        location: '67,622',
        severity: 'WARNING',
      });
    });

    it('should detect missing field in rdfa-invalid5.html', async () => {
      const data = await loadTestData('breadcrumb/rdfa-invalid5.html', 'rdfa');
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage: 'Required attribute "itemListElement" is missing',
        location: '67,128',
        severity: 'ERROR',
      });
    });
  });
});
