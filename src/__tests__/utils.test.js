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

import { stripSchema } from '../utils.js';

describe('utils', () => {
  describe('stripSchema()', () => {
    it('should strip the "schema:" prefix', () => {
      expect(stripSchema('schema:LocalBusiness')).to.equal('LocalBusiness');
    });

    it('should strip the "http://schema.org/" prefix', () => {
      expect(stripSchema('http://schema.org/LocalBusiness')).to.equal(
        'LocalBusiness',
      );
    });

    it('should strip the "https://schema.org/" prefix', () => {
      expect(stripSchema('https://schema.org/LocalBusiness')).to.equal(
        'LocalBusiness',
      );
    });

    it('should return names without a schema.org prefix unchanged', () => {
      expect(stripSchema('LocalBusiness')).to.equal('LocalBusiness');
      expect(stripSchema('rdfs:Class')).to.equal('rdfs:Class');
    });

    it('should only strip the prefix at the start', () => {
      expect(stripSchema('example:schema:Thing')).to.equal(
        'example:schema:Thing',
      );
    });
  });
});
