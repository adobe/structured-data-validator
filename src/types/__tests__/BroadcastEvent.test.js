import { expect } from 'chai';
import { Validator } from '../../validator.js';
import { loadTestData } from './utils.js';

describe('BroadcastEventValidator', () => {
  let validator;
  beforeEach(() => {
    validator = new Validator();
    validator.globalHandlers = [];
  });

  it('should validate a correct BroadcastEvent structure in valid1.json', async () => {
    const data = await loadTestData('BroadcastEvent/valid1.json', 'jsonld');
    const issues = await validator.validate(data);
    expect(issues).to.have.lengthOf(0);
  });

  it('should report error for missing required publication fields', async () => {
    const data = await loadTestData('BroadcastEvent/missing-publication-fields.json', 'jsonld');
    const issues = await validator.validate(data);
    const errors = issues.filter((issue) => issue.severity === 'ERROR');
    expect(errors.length).to.be.greaterThan(0);
    expect(errors.some(e => e.issueMessage.includes('publication'))).to.be.true;
  });

  it('should report error for missing publication object', async () => {
    const data = await loadTestData('BroadcastEvent/missing-publication.json', 'jsonld');
    const issues = await validator.validate(data);
    const errors = issues.filter((issue) => issue.severity === 'ERROR');
    expect(errors.length).to.be.greaterThan(0);
    expect(errors.some(e => e.issueMessage.includes('publication'))).to.be.true;
  });

  it('should report error for missing startDate at root', async () => {
    const data = await loadTestData('BroadcastEvent/missing-root-startDate.json', 'jsonld');
    const issues = await validator.validate(data);
    const errors = issues.filter((issue) => issue.severity === 'ERROR');
    expect(errors.length).to.be.greaterThan(0);
    expect(errors.some(e => e.issueMessage.includes('startDate'))).to.be.true;
  });
}); 