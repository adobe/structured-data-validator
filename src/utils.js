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

export function isObject(obj) {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}

// Strip the schema.org prefix ("schema:", "http://schema.org/" or
// "https://schema.org/") from a type or property id
export function stripSchema(name) {
  if (name.startsWith('schema:')) {
    return name.replace('schema:', '');
  }

  if (name.startsWith('http://schema.org/')) {
    return name.replace('http://schema.org/', '');
  }

  if (name.startsWith('https://schema.org/')) {
    return name.replace('https://schema.org/', '');
  }

  return name;
}
