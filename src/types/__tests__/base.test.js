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
import { expect } from "chai";
import BaseValidator from "../base.js";

describe("BaseValidator", () => {
	describe("fieldNames property", () => {
		let validator;
		const testPath = [{ type: "TestType" }];

		beforeEach(() => {
			validator = new BaseValidator({
				dataFormat: "jsonld",
				path: testPath,
			});
		});

		describe("required()", () => {
			it("should include fieldNames when required attribute is missing", () => {
				const condition = validator.required("price");
				const result = condition({});

				expect(result).to.deep.include({
					severity: "ERROR",
					issueMessage: 'Required attribute "price" is missing',
				});
				expect(result.fieldNames).to.deep.equal(["price"]);
				expect(result.path).to.deep.equal(testPath);
			});

			it("should include fieldNames when required attribute has invalid type", () => {
				const condition = validator.required("price", "number");
				const result = condition({ price: "not-a-number" });

				expect(result).to.deep.include({
					severity: "ERROR",
					issueMessage: 'Invalid type for attribute "price"',
				});
				expect(result.fieldNames).to.deep.equal(["price"]);
			});

			it("should return null when required attribute is valid", () => {
				const condition = validator.required("name");
				const result = condition({ name: "Test Product" });

				expect(result).to.be.null;
			});
		});

		describe("recommended()", () => {
			it("should include fieldNames when recommended attribute is missing", () => {
				const condition = validator.recommended("description");
				const result = condition({});

				expect(result).to.deep.include({
					severity: "WARNING",
					issueMessage: 'Missing field "description" (optional)',
				});
				expect(result.fieldNames).to.deep.equal(["description"]);
				expect(result.path).to.deep.equal(testPath);
			});

			it("should include fieldNames when recommended attribute has invalid type", () => {
				const condition = validator.recommended("image", "url");
				const result = condition({ image: "data:invalid" });

				expect(result).to.deep.include({
					severity: "WARNING",
					issueMessage: 'Invalid type for attribute "image"',
				});
				expect(result.fieldNames).to.deep.equal(["image"]);
			});

			it("should return null when recommended attribute is valid", () => {
				const condition = validator.recommended("description");
				const result = condition({ description: "A great product" });

				expect(result).to.be.null;
			});
		});

		describe("or()", () => {
			it("should include fieldNames when or conditions fail", () => {
				const condition = validator.or(
					validator.required("price"),
					validator.required("priceSpecification.price")
				);
				const result = condition({});

				expect(result.severity).to.equal("ERROR");
				expect(result.fieldNames).to.deep.equal([
					"price",
					"priceSpecification.price",
				]);
				expect(result.path).to.deep.equal(testPath);
			});

			it("should return null when at least one or condition passes", () => {
				const condition = validator.or(
					validator.required("price"),
					validator.required("priceSpecification.price")
				);
				const result = condition({ price: "19.99" });

				expect(result).to.be.null;
			});

			it("should handle single failing condition in or()", () => {
				const condition = validator.or(
					validator.required("availability")
				);
				const result = condition({});

				expect(result.fieldNames).to.deep.equal(["availability"]);
			});
		});

		describe("nested path fieldNames", () => {
			it("should include fieldNames for nested attributes", () => {
				const condition = validator.required("offers.price");
				const result = condition({ offers: {} });

				expect(result).to.deep.include({
					severity: "ERROR",
				});
				expect(result.fieldNames).to.deep.equal(["offers.price"]);
			});
		});
	});
});
