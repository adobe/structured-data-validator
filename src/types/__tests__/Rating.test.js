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

import { loadTestData } from './utils.js';
import { Validator } from '../../validator.js';

describe('RatingValidator', () => {
  describe('JSON-LD', () => {
    let validator;

    beforeEach(() => {
      validator = new Validator();
      validator.globalHandlers = [];
    });

    it('should validate a rating with a percentage value', async () => {
      const data = await loadTestData('/Rating/percentage.json', 'jsonld');
      const issues = await validator.validate(data);
      expect(issues).to.deep.equal([]);
    });

    it('should return error with fieldNames when rating is outside range', async () => {
      const data = {
        jsonld: {
          Rating: [
            {
              '@type': 'Rating',
              '@location': '1,100',
              ratingValue: 10,
              bestRating: 5,
              worstRating: 0,
            },
          ],
        },
      };
      const issues = await validator.validate(data);
      expect(issues).to.have.lengthOf(1);
      expect(issues[0]).to.deep.include({
        issueMessage: 'Rating is outside the specified or default range',
        severity: 'ERROR',
        fieldNames: ['ratingValue'],
      });
    });
  });
});
