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
import { expect } from 'chai';
import sinon from 'sinon';
import { join } from 'path';

import Validator from '../../index.js';

describe('Validator', () => {
  let validator;

  const schemaOrgPath = join(
    process.cwd(),
    'src',
    'types',
    '__tests__',
    'schemaorg-current-https.jsonld',
  );

  beforeEach(() => {
    validator = new Validator(schemaOrgPath);
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
      issueMessage: 'JSON-LD object missing @type attribute',
      location: '0,2',
      source: '{}',
      rootType: 'jsonld',
      severity: 'ERROR',
    });
  });

  it('should not fail when errors are missing', async () => {
    const results = await validator.validate({});
    expect(results).to.have.lengthOf(0);
  });

  it('should print debug information when debug logging is active', async () => {
    const waeData = {
      jsonld: {
        BreadcrumbList: [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [],
          },
        ],
      },
      errors: [],
    };

    validator.debug = true;

    const consoleSpy = sinon.spy(console, 'debug');
    try {
      await validator.validate(waeData);
      expect(consoleSpy.called).to.be.true;
    } finally {
      consoleSpy.restore();
    }
  });
});
