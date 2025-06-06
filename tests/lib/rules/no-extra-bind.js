/**
 * @fileoverview Tests for no-extra-bind rule
 * @author Bence Dányi <bence@danyi.me>
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-extra-bind"),
	RuleTester = require("../../../lib/rule-tester/rule-tester");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();
const errors = [{ messageId: "unexpected", type: "CallExpression" }];

ruleTester.run("no-extra-bind", rule, {
	valid: [
		"var a = function(b) { return b }.bind(c, d)",
		{
			code: "var a = function(b) { return b }.bind(...c)",
			languageOptions: { ecmaVersion: 6 },
		},
		"var a = function() { this.b }()",
		"var a = function() { this.b }.foo()",
		"var a = f.bind(a)",
		"var a = function() { return this.b }.bind(c)",
		{
			code: "var a = (() => { return b }).bind(c, d)",
			languageOptions: { ecmaVersion: 6 },
		},
		"(function() { (function() { this.b }.bind(this)) }.bind(c))",
		"var a = function() { return 1; }[bind](b)",
		{
			code: "var a = function() { return 1; }[`bi${n}d`](b)",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "var a = function() { return () => this; }.bind(b)",
			languageOptions: { ecmaVersion: 6 },
		},
	],
	invalid: [
		{
			code: "var a = function() { return 1; }.bind(b)",
			output: "var a = function() { return 1; }",
			errors: [
				{
					messageId: "unexpected",
					type: "CallExpression",
					line: 1,
					column: 34,
					endLine: 1,
					endColumn: 38,
				},
			],
		},
		{
			code: "var a = function() { return 1; }['bind'](b)",
			output: "var a = function() { return 1; }",
			errors: [
				{
					messageId: "unexpected",
					type: "CallExpression",
					line: 1,
					column: 34,
					endLine: 1,
					endColumn: 40,
				},
			],
		},
		{
			code: "var a = function() { return 1; }[`bind`](b)",
			output: "var a = function() { return 1; }",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unexpected",
					type: "CallExpression",
					line: 1,
					column: 34,
					endLine: 1,
					endColumn: 40,
				},
			],
		},
		{
			code: "var a = (() => { return 1; }).bind(b)",
			output: "var a = (() => { return 1; })",
			languageOptions: { ecmaVersion: 6 },
			errors,
		},
		{
			code: "var a = (() => { return this; }).bind(b)",
			output: "var a = (() => { return this; })",
			languageOptions: { ecmaVersion: 6 },
			errors,
		},
		{
			code: "var a = function() { (function(){ this.c }) }.bind(b)",
			output: "var a = function() { (function(){ this.c }) }",
			errors,
		},
		{
			code: "var a = function() { function c(){ this.d } }.bind(b)",
			output: "var a = function() { function c(){ this.d } }",
			errors,
		},
		{
			code: "var a = function() { return 1; }.bind(this)",
			output: "var a = function() { return 1; }",
			errors,
		},
		{
			code: "var a = function() { (function(){ (function(){ this.d }.bind(c)) }) }.bind(b)",
			output: "var a = function() { (function(){ (function(){ this.d }.bind(c)) }) }",
			errors: [
				{ messageId: "unexpected", type: "CallExpression", column: 71 },
			],
		},
		{
			code: "var a = (function() { return 1; }).bind(this)",
			output: "var a = (function() { return 1; })",
			errors,
		},
		{
			code: "var a = (function() { return 1; }.bind)(this)",
			output: "var a = (function() { return 1; })",
			errors,
		},

		// Should not autofix if bind expression args have side effects
		{
			code: "var a = function() {}.bind(b++)",
			output: null,
			errors,
		},
		{
			code: "var a = function() {}.bind(b())",
			output: null,
			errors,
		},
		{
			code: "var a = function() {}.bind(b.c)",
			output: null,
			errors,
		},

		// Should not autofix if it would remove comments
		{
			code: "var a = function() {}/**/.bind(b)",
			output: "var a = function() {}/**/",
			errors,
		},
		{
			code: "var a = function() {}/**/['bind'](b)",
			output: "var a = function() {}/**/",
			errors,
		},
		{
			code: "var a = function() {}//comment\n.bind(b)",
			output: "var a = function() {}//comment\n",
			errors,
		},
		{
			code: "var a = function() {}./**/bind(b)",
			output: null,
			errors,
		},
		{
			code: "var a = function() {}[/**/'bind'](b)",
			output: null,
			errors,
		},
		{
			code: "var a = function() {}.//\nbind(b)",
			output: null,
			errors,
		},
		{
			code: "var a = function() {}.bind/**/(b)",
			output: null,
			errors,
		},
		{
			code: "var a = function() {}.bind(\n/**/b)",
			output: null,
			errors,
		},
		{
			code: "var a = function() {}.bind(b/**/)",
			output: null,
			errors,
		},
		{
			code: "var a = function() {}.bind(b//\n)",
			output: null,
			errors,
		},
		{
			code: "var a = function() {}.bind(b\n/**/)",
			output: null,
			errors,
		},
		{
			code: "var a = function() {}.bind(b)/**/",
			output: "var a = function() {}/**/",
			errors,
		},

		// Optional chaining
		{
			code: "var a = function() { return 1; }.bind?.(b)",
			output: "var a = function() { return 1; }",
			languageOptions: { ecmaVersion: 2020 },
			errors: [{ messageId: "unexpected" }],
		},
		{
			code: "var a = function() { return 1; }?.bind(b)",
			output: "var a = function() { return 1; }",
			languageOptions: { ecmaVersion: 2020 },
			errors: [{ messageId: "unexpected" }],
		},
		{
			code: "var a = (function() { return 1; }?.bind)(b)",
			output: "var a = (function() { return 1; })",
			languageOptions: { ecmaVersion: 2020 },
			errors: [{ messageId: "unexpected" }],
		},
		{
			code: "var a = function() { return 1; }['bind']?.(b)",
			output: "var a = function() { return 1; }",
			languageOptions: { ecmaVersion: 2020 },
			errors: [{ messageId: "unexpected" }],
		},
		{
			code: "var a = function() { return 1; }?.['bind'](b)",
			output: "var a = function() { return 1; }",
			languageOptions: { ecmaVersion: 2020 },
			errors: [{ messageId: "unexpected" }],
		},
		{
			code: "var a = (function() { return 1; }?.['bind'])(b)",
			output: "var a = (function() { return 1; })",
			languageOptions: { ecmaVersion: 2020 },
			errors: [{ messageId: "unexpected" }],
		},
	],
});
