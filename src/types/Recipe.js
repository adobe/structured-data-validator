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
import BaseValidator from './base.js';

export default class RecipeValidator extends BaseValidator {
  getConditions() {
    const conditions = [
      this.required('image', 'url'),
      this.required('name', 'string'),

      this.recommended('aggregateRating'),
      this.recommended('author'),
      this.recommended('datePublished', 'date'),
      this.recommended('description', 'string'),
      this.recommended('keywords', 'string'),
      this.recommended('recipeCategory', 'string'),
      this.recommended('recipeCuisine', 'string'),
      this.recommended('recipeIngredient'),
      this.recommended('recipeInstructions'),
      this.validateNutritionAndYield,
      this.validateCookTime,
      this.recommended('video'),
    ];
    return conditions.map((c) => c.bind(this));
  }
  validTimeFormat(time) {
    const durationRegex =
      /^P(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?$/;
    return durationRegex.test(time);
  }

  validateNutritionAndYield(data) {
    // If nutrition.calories is defined, recipeYield must be defined with the number of servings
    const issues = [];
    if (data.nutrition?.calories && !data.recipeYield) {
      issues.push(this.required('recipeYield')(data));
    } else {
      issues.push(this.recommended('recipeYield')(data));
      issues.push(this.recommended('nutrition.calories')(data));
    }
    return issues;
  }

  validateCookTime(data) {
    const issues = [];
    const hasCookTime = data.cookTime !== undefined && data.cookTime !== null;
    const hasPrepTime = data.prepTime !== undefined && data.prepTime !== null;
    const hasTotalTime =
      data.totalTime !== undefined && data.totalTime !== null;

    if (hasCookTime || hasPrepTime) {
      if (hasCookTime && !hasPrepTime) {
        issues.push(this.recommended('prepTime')(data));
      }
      if (!hasCookTime && hasPrepTime) {
        issues.push(this.recommended('cookTime')(data));
      }
    } else if (!hasTotalTime) {
      issues.push(this.recommended('totalTime')(data));
    } 

    ['cookTime', 'prepTime', 'totalTime'].forEach((fieldName) => {
      if (data[fieldName] && !this.validTimeFormat(data[fieldName])) {
        issues.push({
          issueMessage: `Invalid format for ${fieldName}`,
          severity: 'ERROR',
        });
      }
    });
    return issues;
  }
}
