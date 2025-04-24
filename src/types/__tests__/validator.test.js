import { expect } from 'chai';

import Validator from '../../index.js';

describe('Validator', () => {
  let validator;

  beforeEach(() => {
    validator = new Validator();
  });

  it('should expose errors from WAE', async () => {
    const waeData = {
      errors: [
        {
          message: 'JSON-LD object missing @type attribute',
          format: 'jsonld',
          sourceCodeLocation: {
            startOffset: 0,
            endOffset: 2,
          },
          source: '{}',
        },
      ],
    };

    const results = await validator.validate(waeData);

    expect(results).to.have.lengthOf(1);
    expect(results[0]).to.deep.include({
      dataFormat: 'jsonld',
      message: 'JSON-LD object missing @type attribute',
      location: '0,2',
      source: '{}',
    });
  });
});
