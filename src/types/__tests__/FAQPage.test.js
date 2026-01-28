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

import { loadTestData } from "./utils.js";
import { Validator } from "../../validator.js";

describe("FAQPageValidator", () => {
	describe("JSON-LD", () => {
		let validator;

		beforeEach(() => {
			validator = new Validator();
			validator.globalHandlers = [];
		});

		it("should validate a correct FAQPage structure in valid1.json", async () => {
			const data = await loadTestData("FAQPage/valid1.json", "jsonld");
			const issues = await validator.validate(data);
			const errors = issues.filter(i => i.severity === "ERROR");
			expect(errors).to.have.lengthOf(0);
		});

		it("should fail when mainEntity is missing", async () => {
			const data = await loadTestData(
				"FAQPage/invalid_missing_mainEntity.json",
				"jsonld"
			);
			const issues = await validator.validate(data);
			const errors = issues.filter(i => i.severity === "ERROR");
			expect(errors).to.have.lengthOf(1);
			expect(errors[0]).to.deep.include({
				severity: "ERROR",
				issueMessage: 'Required attribute "mainEntity" is missing',
			});
		});
	});
});
