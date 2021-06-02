/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers');

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-input form API validation', () => {
		describe('`required`', () => {
			it('simple usage', async () => {
				const target = await init({
					validators: ['required']
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toEqual({validator: 'required', error: false, msg: 'Required field'});

				expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
					.toBe('Required field');

				await target.evaluate((ctx) => {
					ctx.value = '0';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();
			});

			it('`required` with parameters (an array form)', async () => {
				const target = await init({
					validators: [['required', {msg: 'REQUIRED!'}]]
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toEqual({validator: 'required', error: false, msg: 'REQUIRED!'});

				expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
					.toBe('REQUIRED!');
			});

			it('`required` with parameters (an object form)', async () => {
				const target = await init({
					validators: [{required: {msg: 'REQUIRED!', showMsg: false}}]
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toEqual({validator: 'required', error: false, msg: 'REQUIRED!'});

				expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
					.toBe('');
			});

			it('forcing validation by `actionChange`', async () => {
				const target = await init({
					validators: ['required']
				});

				await target.evaluate((ctx) => ctx.emit('actionChange'));

				expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
					.toBe('Required field');
			});
		});

		describe('`number`', () => {
			it('simple usage', async () => {
				const target = await init({
					validators: ['number']
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '0';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = 'fff';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'number',

					error: {
						name: 'INVALID_VALUE',
						value: 'NaN'
					},

					msg: 'The value is not a number'
				});

				expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
					.toBe('The value is not a number');
			});

			describe('providing `type` as', () => {
				it('`uint`', async () => {
					const target = await init({
						value: '1',
						validators: [['number', {type: 'uint'}]]
					});

					expect(await target.evaluate((ctx) => ctx.validate()))
						.toBeTrue();

					await target.evaluate((ctx) => {
						ctx.value = '0';
					});

					expect(await target.evaluate((ctx) => ctx.validate()))
						.toBeTrue();

					await target.evaluate((ctx) => {
						ctx.value = '-4';
					});

					expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
						validator: 'number',
						error: {name: 'INVALID_VALUE', value: -4},
						msg: 'The value does not match with an unsigned integer type'
					});

					await target.evaluate((ctx) => {
						ctx.value = '1.354';
					});

					expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
						validator: 'number',
						error: {name: 'INVALID_VALUE', value: 1.354},
						msg: 'The value does not match with an unsigned integer type'
					});
				});

				it('`int`', async () => {
					const target = await init({
						value: '1',
						validators: [['number', {type: 'int'}]]
					});

					expect(await target.evaluate((ctx) => ctx.validate()))
						.toBeTrue();

					await target.evaluate((ctx) => {
						ctx.value = '0';
					});

					expect(await target.evaluate((ctx) => ctx.validate()))
						.toBeTrue();

					await target.evaluate((ctx) => {
						ctx.value = '-4';
					});

					expect(await target.evaluate((ctx) => ctx.validate()))
						.toBeTrue();

					await target.evaluate((ctx) => {
						ctx.value = '1.354';
					});

					expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
						validator: 'number',
						error: {name: 'INVALID_VALUE', value: 1.354},
						msg: 'The value does not match with an integer type'
					});
				});

				it('`ufloat`', async () => {
					const target = await init({
						value: '1',
						validators: [['number', {type: 'ufloat'}]]
					});

					expect(await target.evaluate((ctx) => ctx.validate()))
						.toBeTrue();

					await target.evaluate((ctx) => {
						ctx.value = '0';
					});

					expect(await target.evaluate((ctx) => ctx.validate()))
						.toBeTrue();

					await target.evaluate((ctx) => {
						ctx.value = '-4';
					});

					expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
						validator: 'number',
						error: {name: 'INVALID_VALUE', value: -4},
						msg: 'The value does not match with an unsigned float type'
					});

					await target.evaluate((ctx) => {
						ctx.value = '-4.343';
					});

					expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
						validator: 'number',
						error: {name: 'INVALID_VALUE', value: -4.343},
						msg: 'The value does not match with an unsigned float type'
					});

					await target.evaluate((ctx) => {
						ctx.value = '1.354';
					});

					expect(await target.evaluate((ctx) => ctx.validate()))
						.toBeTrue();
				});

				it('`float`', async () => {
					const target = await init({
						value: '1',
						validators: [['number', {type: 'float'}]]
					});

					expect(await target.evaluate((ctx) => ctx.validate()))
						.toBeTrue();

					await target.evaluate((ctx) => {
						ctx.value = '0';
					});

					expect(await target.evaluate((ctx) => ctx.validate()))
						.toBeTrue();

					await target.evaluate((ctx) => {
						ctx.value = '-4';
					});

					expect(await target.evaluate((ctx) => ctx.validate()))
						.toBeTrue();

					await target.evaluate((ctx) => {
						ctx.value = '-4.343';
					});

					expect(await target.evaluate((ctx) => ctx.validate()))
						.toBeTrue();

					await target.evaluate((ctx) => {
						ctx.value = '1.354';
					});

					expect(await target.evaluate((ctx) => ctx.validate()))
						.toBeTrue();
				});
			});

			it('providing `min` and `max`', async () => {
				const target = await init({
					value: 1,
					validators: [['number', {min: -1, max: 3}]]
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '-1';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '3';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '-4';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'number',
					error: {name: 'MIN', value: -4},
					msg: 'A value must be at least -1'
				});

				await target.evaluate((ctx) => {
					ctx.value = '6';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'number',
					error: {name: 'MAX', value: 6},
					msg: 'A value must be no more than 3'
				});
			});

			it('providing `separator` and `styleSeparator`', async () => {
				const target = await init({
					value: '100_500,200',
					validators: [['number', {separator: ['.', ',', ';'], styleSeparator: [' ', '_', '-']}]],
					formValueConverter: undefined
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '100 500;200-300';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '6/2';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'number',
					error: {name: 'INVALID_VALUE', value: '6/2'},
					msg: 'The value is not a number'
				});
			});

			it('providing `precision`', async () => {
				const target = await init({
					value: '100.23',
					validators: [['number', {precision: 2}]],
					formValueConverter: undefined
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '1.2';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '1.234567';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'number',
					error: {name: 'DECIMAL_LENGTH', value: 1.234567},
					msg: 'A decimal part should have no more than 2 digits'
				});
			});

			it('providing `precision` and `strictPrecision`', async () => {
				const target = await init({
					value: '100.23',
					validators: [['number', {precision: 2, strictPrecision: true}]],
					formValueConverter: undefined
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '1.2';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'number',
					error: {name: 'DECIMAL_LENGTH', value: 1.2},
					msg: 'A decimal part should have 2 digits'
				});

				await target.evaluate((ctx) => {
					ctx.value = '1.234567';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'number',
					error: {name: 'DECIMAL_LENGTH', value: 1.234567},
					msg: 'A decimal part should have 2 digits'
				});

				await target.evaluate((ctx) => {
					ctx.value = '1';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'number',
					error: {name: 'DECIMAL_LENGTH', value: 1},
					msg: 'A decimal part should have 2 digits'
				});
			});

			async function init(attrs = {}) {
				await page.evaluate((attrs) => {
					const scheme = [
						{
							attrs: {
								'data-id': 'target',
								formValueConverter: ((v) => v !== '' ? parseFloat(v) : undefined).option(),
								messageHelpers: true,
								...attrs
							}
						}
					];

					globalThis.renderComponents('b-input', scheme);
				}, attrs);

				return h.component.waitForComponent(page, '[data-id="target"]');
			}
		});

		describe('`date`', () => {
			it('simple usage', async () => {
				const target = await init({
					validators: ['date']
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '0';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = 'today';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '18.10.1989';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '1989.10.18';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '1989.18.10';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'date',
					error: {name: 'INVALID_VALUE', value: '1989.18.10'},
					msg: "The value can't be parsed as a date"
				});
			});

			it('providing `min` and `max`', async () => {
				const target = await init({
					value: '19.10.1989',
					validators: [['date', {min: '18.10.1989', max: '25.10.1989'}]]
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '18.10.1989';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '25.10.1989';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '25.03.1989';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'date',
					error: {name: 'MIN', value: new Date(1989, 2, 25)},
					msg: 'A date value must be at least "18.10.1989"'
				});

				await target.evaluate((ctx) => {
					ctx.value = '25.11.1989';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'date',
					error: {name: 'MAX', value: new Date(1989, 10, 25)},
					msg: 'A date value must be no more than "25.10.1989"'
				});
			});

			it('providing `past` as `true`', async () => {
				const target = await init({
					value: '19.10.1989',
					validators: [['date', {past: true}]]
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				const
					date = Date.now() + 1e3;

				await target.evaluate((ctx, date) => {
					ctx.value = date;
				}, date);

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'date',
					error: {name: 'NOT_PAST', value: new Date(date)},
					msg: 'A date value must be in the past'
				});
			});

			it('providing `past` as `false`', async () => {
				const target = await init({
					value: '18.10.1989',
					validators: [['date', {past: false}]]
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'date',
					error: {name: 'IS_PAST', value: new Date(1989, 9, 18)},
					msg: "A date value can't be in the past"
				});

				const
					date = Date.now() + 1e3;

				await target.evaluate((ctx, date) => {
					ctx.value = date;
				}, date);

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();
			});

			it('providing `future` as `true`', async () => {
				const
					date = Date.now() + 10e3;

				const target = await init({
					value: date,
					validators: [['date', {future: true}]]
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '18.10.1989';
				}, date);

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'date',
					error: {name: 'NOT_FUTURE', value: new Date(1989, 9, 18)},
					msg: 'A date value must be in the future'
				});
			});

			it('providing `future` as `false`', async () => {
				const
					date = Date.now() + 10e3;

				const target = await init({
					value: date,
					validators: [['date', {future: false}]]
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'date',
					error: {name: 'IS_FUTURE', value: new Date(date)},
					msg: "A date value can't be in the future"
				});

				await target.evaluate((ctx) => {
					ctx.value = '18.10.1989';
				}, date);

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();
			});
		});

		describe('`pattern`', () => {
			it('simple usage', async () => {
				const target = await init({
					value: '1456',
					validators: [['pattern', {pattern: '\\d'}]]
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = 'dddd';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'pattern',
					error: {name: 'NOT_MATCH', value: 'dddd'},
					msg: 'A value must match the pattern'
				});
			});

			it('providing `min` and `max`', async () => {
				const target = await init({
					value: '123',
					validators: [['pattern', {min: 2, max: 4}]]
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '12';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '3414';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '1';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'pattern',
					error: {name: 'MIN', value: '1'},
					msg: 'Value length must be at least 2 characters'
				});

				await target.evaluate((ctx) => {
					ctx.value = '3456879';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'pattern',
					error: {name: 'MAX', value: '3456879'},
					msg: 'Value length must be no more than 4 characters'
				});
			});

			it('providing `min`, `max` and `skipLength`', async () => {
				const target = await init({
					value: '12',
					validators: [['pattern', {min: 1, max: 3, skipLength: true}]]
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '1';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '341';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '3456879';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();
			});
		});

		describe('`email`', () => {
			it('simple usage', async () => {
				const target = await init({
					value: 'foo@gmail.com',
					validators: ['email']
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = 'dddd';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'email',
					error: false,
					msg: 'Invalid email format'
				});
			});
		});

		async function init(attrs = {}) {
			await page.evaluate((attrs) => {
				const scheme = [
					{
						attrs: {
							'data-id': 'target',
							messageHelpers: true,
							...attrs
						}
					}
				];

				globalThis.renderComponents('b-input', scheme);
			}, attrs);

			return h.component.waitForComponent(page, '[data-id="target"]');
		}
	});
};
