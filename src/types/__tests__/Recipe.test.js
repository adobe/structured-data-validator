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
import { Validator } from '../../validator.js';
import { loadTestData } from './utils.js';

describe('RecipeValidator', () => {
  let validator;
  beforeEach(() => {
    validator = new Validator();
    validator.globalHandlers = [];
  });

  it('should validate a complete Recipe structure in valid1.json', async () => {
    const data = await loadTestData('Recipe/valid1.json', 'jsonld');
    const issues = await validator.validate(data);
    const errors = issues.filter((issue) => issue.severity === 'ERROR');

    expect(errors).to.have.lengthOf(0);
  });

  it('should report errors for missing required fields in invalid1.json', async () => {
    const data = await loadTestData('Recipe/invalid1.json', 'jsonld');
    const issues = await validator.validate(data);
    const errors = issues.filter((issue) => issue.severity === 'ERROR');
    const expectedIssues = [
      {
        issueMessage: 'Required attribute "image" is missing',
        severity: 'ERROR',
      },
    ];

    expect(errors).to.have.lengthOf(1);
    for (let i = 0; i < expectedIssues.length; i++) {
      expect(errors[i]).to.deep.include(expectedIssues[i]);
    }
  });

  it('should validate recipe with nutrition information in invalid2.json', async () => {
    const data = await loadTestData('Recipe/invalid2.json', 'jsonld');
    const issues = await validator.validate(data);
    const errors = issues.filter((issue) => issue.severity === 'ERROR');
    const expectedIssues = [
      {
        issueMessage: 'Required attribute "recipeYield" is missing',
        severity: 'ERROR',
      },
    ];

    expect(errors).to.have.lengthOf(1);
    for (let i = 0; i < expectedIssues.length; i++) {
      expect(errors[i]).to.deep.include(expectedIssues[i]);
    }
  });

  it('should handle invalid image URLs in invalid3.json', async () => {
    const data = await loadTestData('Recipe/invalid3.json', 'jsonld');
    const issues = await validator.validate(data);
    const errors = issues.filter((issue) => issue.severity === 'ERROR');
    const expectedIssues = [
      {
        issueMessage: 'Invalid type for attribute "image"',
        severity: 'ERROR',
      },
    ];
    expect(errors).to.have.lengthOf(1);
    for (let i = 0; i < expectedIssues.length; i++) {
      expect(errors[i]).to.deep.include(expectedIssues[i]);
    }
  });

  it('should validate invalid time format in invalid4.json', async () => {
    const data = await loadTestData('Recipe/invalid4.json', 'jsonld');
    const issues = await validator.validate(data);
    const expectedTimeErrors = [
      'Invalid type for attribute "cookTime"',
      'Invalid type for attribute "prepTime"',
      'Invalid type for attribute "totalTime"',
    ];

    for (const expectedMessage of expectedTimeErrors) {
      const found = issues.some(
        (issue) =>
          issue.issueMessage && issue.issueMessage.includes(expectedMessage),
      );
      expect(found, `Expected to find error: ${expectedMessage}`).to.be.true;
    }
  });

  it('should validate HowToStep structure in invalid5.json', async () => {
    const data = await loadTestData('Recipe/invalid5.json', 'jsonld');
    const issues = await validator.validate(data);
    const warnings = issues.filter((issue) => issue.severity === 'WARNING');
    const expectedIssues = [
      'aggregateRating',
      'author',
      'datePublished',
      'keywords',
      'recipeCategory',
      'recipeCuisine',
      'recipeYield',
      'nutrition.calories',
      'totalTime',
      'video',
      'video',
    ];

    expect(warnings).to.have.lengthOf(11);
    for (let i = 0; i < expectedIssues.length; i++) {
      const expected = {
        issueMessage: `Missing field "${expectedIssues[i]}" (optional)`,
        severity: 'WARNING',
      };
      expect(warnings[i]).to.deep.include(expected);
    }
  });

  it('should warn when cookTime is present without prepTime', async () => {
    const data = await loadTestData('Recipe/only-cook-time.json', 'jsonld');
    const issues = await validator.validate(data);
    const warnings = issues.filter((issue) => issue.severity === 'WARNING');

    const expectedIssue = {
      issueMessage: 'Missing field "prepTime" (optional)',
      severity: 'WARNING',
    };

    const foundWarning = warnings.find((warning) =>
      warning.issueMessage.includes('prepTime'),
    );

    expect(foundWarning).to.deep.include(expectedIssue);
  });

  it('should warn when prepTime is present without cookTime', async () => {
    const data = await loadTestData('Recipe/only-prep-time.json', 'jsonld');
    const issues = await validator.validate(data);
    const warnings = issues.filter((issue) => issue.severity === 'WARNING');

    const expectedIssue = {
      issueMessage: 'Missing field "cookTime" (optional)',
      severity: 'WARNING',
    };

    const foundWarning = warnings.find((warning) =>
      warning.issueMessage.includes('cookTime'),
    );

    expect(foundWarning).to.deep.include(expectedIssue);
  });

  it('should validate totalTime as alternative to cookTime/prepTime', async () => {
    const data = await loadTestData(
      'Recipe/total-time-alternative.json',
      'jsonld',
    );
    const issues = await validator.validate(data);
    const warnings = issues.filter((issue) => issue.severity === 'WARNING');

    const timeWarnings = warnings.filter(
      (warning) =>
        warning.issueMessage.includes('cookTime') ||
        warning.issueMessage.includes('prepTime'),
    );

    expect(timeWarnings).to.have.lengthOf(0);
  });

  it('should warn for missing recommended fields', async () => {
    const data = await loadTestData('Recipe/minimal-recipe.json', 'jsonld');
    const issues = await validator.validate(data);
    const warnings = issues.filter((issue) => issue.severity === 'WARNING');
    const expectedIssues = [
      'aggregateRating',
      'author',
      'datePublished',
      'description',
      'keywords',
      'recipeCategory',
      'recipeCuisine',
      'recipeIngredient',
      'recipeYield',
      'nutrition.calories',
      'totalTime',
      'video',
    ];

    expect(warnings).to.have.lengthOf(12);
    for (let i = 0; i < expectedIssues.length; i++) {
      const expected = {
        issueMessage: `Missing field "${expectedIssues[i]}" (optional)`,
        severity: 'WARNING',
      };
      expect(warnings[i]).to.deep.include(expected);
    }
  });
});
