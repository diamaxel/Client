/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentMeta, ComponentParams } from 'core/component';

/**
 * Inherits parameters to the specified meta object from an other object
 * and returns a new component options
 *
 * @param meta
 * @param parentMeta
 * @param opts - source component parameters
 */
export default function inheritMeta(
	meta: ComponentMeta,
	parentMeta: ComponentMeta,
	opts: ComponentParams
): ComponentParams {
	const {
		params,
		props,
		fields,
		computed,
		accessors,
		methods
	} = parentMeta;

	let
		provide,
		inject;

	///////////////////////
	// Provider inheritance
	///////////////////////

	// tslint:disable-next-line
	if (Object.isObject(<any>opts.provide) && Object.isObject(<any>params.provide)) {
		provide = {...params.provide, ...opts.provide};

	} else {
		provide = opts.provide || params.provide;
	}

	/////////////////////
	// Inject inheritance
	/////////////////////

	const
		pIIsObj = Object.isObject(<any>params.inject),
		pIIsArr = !pIIsObj && Object.isArray(<any>params.inject),
		cIIsObj = Object.isObject(<any>opts.inject),
		cIIsArr = !cIIsObj && Object.isArray(<any>opts.inject);

	if (pIIsArr && cIIsArr) {
		inject = (<string[]>opts.inject).union(<string[]>opts.inject);

	} else if (pIIsObj && cIIsObj) {
		inject = {};

		for (let o = <Object>params.inject, keys = Object.keys(o), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = o[key];

			inject[key] = Object.isObject(el) ? {...el} : {from: el};
		}

		for (let o = <Object>opts.inject, keys = Object.keys(o), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = o[key];

			// tslint:disable-next-line
			inject[key] = Object.assign(inject[key] || {}, Object.isObject(el) ? el : {from: el});
		}

	} else if (pIIsArr && cIIsObj) {
		inject = {};

		for (let o = <any[]>params.inject, i = 0; i < o.length; i++) {
			const key = o[i];
			inject[key] = {[key]: {from: key}};
		}

		for (let o = <Object>opts.inject, keys = Object.keys(o), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = o[key];

			// tslint:disable-next-line
			inject[key] = Object.assign(inject[key] || {}, Object.isObject(el) ? el : {from: el});
		}

	} else if (pIIsObj && cIIsArr) {
		inject = {};

		for (let o = <Object>params.inject, keys = Object.keys(o), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = o[key];

			inject[key] = Object.isObject(el) ? {...el} : {from: el};
		}

		for (let o = <any[]>opts.inject, i = 0; i < o.length; i++) {
			const key = o[i];

			// tslint:disable-next-line
			inject[key] = Object.assign(inject[key] || {}, {from: key});
		}

	} else  {
		inject = opts.inject || params.inject;
	}

	///////////////////////////
	// Props|fields inheritance
	///////////////////////////

	const newOpts = {
		...params,
		...opts,
		mixins: {...params.mixins, ...opts.mixins},
		model: (opts.model || params.model) && {...params.model, ...opts.model},
		provide,
		inject
	};

	for (let o = meta.props, keys = Object.keys(props), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = props[key],
			watchers = new Map();

		if (el.watchers) {
			const
				w = el.watchers.values();

			for (let el = w.next(); !el.done; el = w.next()) {
				watchers.set(el.value.fn, {...el.value});
			}
		}

		o[key] = {...el, watchers};
	}

	for (let o = meta.fields, keys = Object.keys(fields), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = fields[key],
			watchers = new Map();

		if (el.watchers) {
			const
				w = el.watchers.values();

			for (let el = w.next(); !el.done; el = w.next()) {
				watchers.set(el.value.fn, {...el.value});
			}
		}

		o[key] = {...el, watchers};
	}

	for (let o = meta.computed, keys = Object.keys(computed), i = 0; i < keys.length; i++) {
		const key = keys[i];
		o[key] = {...computed[key]};
	}

	for (let o = meta.accessors, keys = Object.keys(accessors), i = 0; i < keys.length; i++) {
		const key = keys[i];
		o[key] = {...accessors[key]};
	}

	for (let o = meta.methods, keys = Object.keys(methods), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = methods[key],
			watchers = {},
			hooks = {};

		if (el.watchers) {
			const
				o = el.watchers,
				w = Object.keys(o);

			for (let i = 0; i < w.length; i++) {
				const key = w[i];
				watchers[key] = {...o[key]};
			}
		}

		if (el.hooks) {
			const
				o = <Dictionary>el.hooks,
				w = Object.keys(o);

			for (let i = 0; i < w.length; i++) {
				const key = w[i];
				hooks[key] = {...o[key]};
			}
		}

		o[key] = {...el, watchers, hooks};
	}

	return newOpts;
}
