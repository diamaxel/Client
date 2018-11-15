/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:max-file-line-count

import $C = require('collection.js');
import symbolGenerator from 'core/symbol';
import Async from 'core/async';

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { ComponentElement, FunctionalCtx } from 'core/component/interface';

import {

	VNode,
	CreateElement,
	RenderContext as BaseRenderContext,
	FunctionalComponentOptions,
	WatchOptions,
	WatchOptionsWithHandler

} from 'core/component/engines';

import {

	runHook,
	createMeta,
	initDataObject,
	initPropsObject,
	bindWatchers

} from 'core/component/component';

export interface RenderContext extends BaseRenderContext {
	scopedSlots?(): any;
}

export interface RenderObject {
	staticRenderFns?: Function[];
	render(el: CreateElement, ctx?: RenderContext): VNode;
}

const
	$$ = symbolGenerator(),
	cache = new WeakMap();

export const
	CTX = $$.ctx;

/**
 * Generates a fake context for a function component
 *
 * @param createElement - create element function
 * @param renderCtx - render context
 * @param baseCtx - base component context (methods, accessors, etc.)
 * @param [initProps] - if true, then component prop values will be force initialize
 */
export function createFakeCtx<T extends Dictionary = FunctionalCtx>(
	createElement: CreateElement,
	renderCtx: RenderContext,
	baseCtx: FunctionalCtx,
	initProps?: boolean
): T {
	const
		fakeCtx = Object.create(baseCtx),
		meta = createMeta(fakeCtx.meta);

	const
		{instance} = fakeCtx,
		{methods} = meta;

	const
		p = <Dictionary<any>>renderCtx.parent,
		data = {};

	const
		$w = new EventEmitter({maxListeners: 1e3}),
		$e = new EventEmitter({maxListeners: 1e3}),
		$a = new Async(this);

	let
		$normalParent = p;

	while ($normalParent.isFunctional) {
		$normalParent = $normalParent.$parent;
	}

	// Add base methods and properties
	Object.assign(fakeCtx, renderCtx, renderCtx.props, {
		_self: fakeCtx,
		_staticTrees: [],

		meta,
		children: [],

		$async: $a,
		$root: p.$root,
		$normalParent,
		$options: Object.assign(Object.create(p.$options), fakeCtx.$options),
		$createElement: createElement.bind(fakeCtx),

		$data: data,
		$$data: data,
		$dataCache: {},
		$props: renderCtx.props,
		$attrs: renderCtx.data.attrs,
		$listeners: renderCtx.data.on,
		$refs: {},

		$slots: {
			default: renderCtx.children.length ? renderCtx.children : undefined,
			...renderCtx.slots()
		},

		$scopedSlots: {
			...renderCtx.scopedSlots && renderCtx.scopedSlots()
		},

		$destroy(): void {
			if (this.componentStatus === 'destroyed') {
				return;
			}

			$a.clearAll();

			const
				hooks = $normalParent.meta.hooks;

			$C(['mounted', 'created', 'beforeDestroy']).forEach((key) => {
				$C(hooks[key]).remove((el) => el.fn[$$.self] === fakeCtx);
			});

			$C(['beforeDestroy', 'destroyed']).forEach((key) => {
				runHook(key, meta, fakeCtx).then(async () => {
					const
						m = methods[key];

					if (m) {
						await m.fn.call(fakeCtx);
					}
				}, stderr);
			});
		},

		$nextTick(cb?: () => void): Promise<void> | void {
			if (cb) {
				$a.setImmediate(cb);
				return;
			}

			return $a.nextTick();
		},

		$forceUpdate(): void {
			$a.setImmediate(() => p.$forceUpdate(), {
				group: 'render',
				label: 'forceUpdate'
			});
		},

		$watch(
			exprOrFn: string | (() => string),
			cbOrOpts: (n: any, o: any) => void | WatchOptionsWithHandler<any>,
			opts?: WatchOptions
		): (() => void) {
			let
				cb = cbOrOpts;

			if (Object.isObject(cbOrOpts)) {
				cb = (<any>cbOrOpts).handler;
				opts = <any>cbOrOpts;
			}

			const
				expr = Object.isFunction(exprOrFn) ? exprOrFn.call(this) : exprOrFn;

			cb = cb.bind(this);
			$w.on(expr, cb);

			if (opts && opts.immediate) {
				$w.emit(expr, this.getField(expr));
			}

			return () => $w.off(expr, cb);
		},

		$set(obj: object, key: string, value: any): any {
			obj[key] = value;
			return value;
		},

		$delete(obj: object, key: string): void {
			delete obj[key];
		},

		$emit(e: string, ...args: any[]): void {
			$e.emit(e, ...args);
		},

		$once(e: string, cb: any): void {
			$e.once(e, cb);
		},

		$on(e: CanArray<string>, cb: any): void {
			const
				events = (<string[]>[]).concat(e);

			for (let i = 0; i < events.length; i++) {
				$e.on(events[i], cb);
			}
		},

		$off(e: CanArray<string>, cb?: any): void {
			const
				events = (<string[]>[]).concat(e);

			for (let i = 0; i < events.length; i++) {
				$e.off(events[i], cb);
			}
		}
	});

	{
		const list = [
			meta.accessors,
			meta.computed,
			methods
		];

		for (let i = 0; i < list.length; i++) {
			const
				o = list[i];

			for (let keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = <StrictDictionary<any>>o[key];

				if ('fn' in el) {
					fakeCtx[key] = el.fn.bind(fakeCtx);

				} else {
					Object.defineProperty(fakeCtx, key, el);
				}
			}
		}
	}

	if (!('$el' in fakeCtx)) {
		let
			staticEl;

		Object.defineProperty(fakeCtx, '$el', {
			set(val: Element): void {
				staticEl = val;
			},

			get(): CanUndef<ComponentElement<any>> {
				if (staticEl) {
					return staticEl;
				}

				const
					id = <any>$$.el,
					el = <Element>fakeCtx[id];

				if (el && el.closest('html')) {
					return el;
				}

				return (fakeCtx[id] = document.querySelector(`.i-block-helper.${fakeCtx.componentId}`) || undefined);
			}
		});
	}

	runHook('beforeRuntime', meta, fakeCtx)
		.catch(stderr);

	initPropsObject(meta.component.props, fakeCtx, instance, fakeCtx, initProps);
	initDataObject(meta.systemFields, fakeCtx, instance, fakeCtx);

	runHook('beforeCreate', meta, fakeCtx).then(async () => {
		if (methods.beforeCreate) {
			await methods.beforeCreate.fn.call(fakeCtx);
		}
	}, stderr);

	bindWatchers(<any>fakeCtx);
	initDataObject(meta.fields, fakeCtx, instance, data);

	runHook('beforeDataCreate', meta, fakeCtx)
		.catch(stderr);

	if (meta.params.tiny) {
		Object.assign(fakeCtx, data);

	} else {
		for (let keys = Object.keys(data), i = 0; i < keys.length; i++) {
			const
				key = keys[i];

			Object.defineProperty(fakeCtx, key, {
				get(): any {
					return data[key];
				},

				set(val: any): void {
					fakeCtx.$dataCache[key] = true;

					const
						old = data[key];

					if (val !== old) {
						data[key] = val;
						$w.emit(key, val, old);
					}
				}
			});
		}
	}

	fakeCtx.$$data = fakeCtx;
	return fakeCtx;
}

/**
 * Patches the specified virtual node: add classes, event handlers, etc.
 *
 * @param vNode
 * @param ctx - component fake context
 * @param renderCtx - render context
 */
export function patchVNode(vNode: VNode, ctx: Dictionary<any>, renderCtx: RenderContext): VNode {
	const
		{data: vData} = vNode,
		{data} = renderCtx,
		{meta, meta: {methods}} = ctx;

	if (vData) {
		vData.staticClass = vData.staticClass || '';

		// Custom classes and attributes

		if (data.staticClass) {
			vData.staticClass += ` ${data.staticClass}`;
		}

		if (data.class) {
			vData.class = [].concat(vData.class, data.class);
		}

		if (data.attrs && meta.params.inheritAttrs) {
			// tslint:disable-next-line:prefer-object-spread
			vData.attrs = Object.assign(vData.attrs || {}, data.attrs);
		}

		// Reference to the element

		if (data.ref) {
			vData.ref = data.ref;
		}

		// Directives

		if (data.directives) {
			for (let o = data.directives, i = 0; i < o.length; i++) {
				const
					el = o[i];

				if (el.name === 'show' && !el.value) {
					vData.attrs = vData.attrs || {};
					vData.attrs.style = (vData.attrs.style || '') + ';display: none;';
				}
			}
		}
	}

	// Event handlers

	if (data.on) {
		for (let o = data.on, keys = Object.keys(o), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				fns = (<Function[]>[]).concat(o[key]);

			for (let i = 0; i < fns.length; i++) {
				const
					fn = fns[i];

				if (Object.isFunction(fn)) {
					ctx.$on(key, fn);
				}
			}
		}
	}

	ctx.hook = 'created';
	bindWatchers(<any>ctx);

	runHook('created', meta, ctx).then(async () => {
		if (methods.created) {
			await methods.created.fn.call(ctx);
		}
	}, stderr);

	const
		p = ctx.$normalParent,
		hooks = p.meta.hooks;

	let
		destroyed;

	const destroy = () => {
		ctx.$destroy();
		destroyed = true;
	};

	// tslint:disable-next-line:cyclomatic-complexity
	const mount = async () => {
		if (ctx.hook === 'mounted') {
			if (!ctx.keepAlive && !ctx.$el) {
				destroy();
			}

			return;
		}

		if (destroyed || ctx.hook !== 'created') {
			return;
		}

		ctx[<any>$$.el] = undefined;

		if (!ctx.$el) {
			try {
				await ctx.$async.promise(p.nextTick(), {
					label: $$.findElWait
				});

				if (!ctx.$el) {
					return;
				}

			} catch (err) {
				stderr(err);
				return;
			}
		}

		const
			el = ctx.$el,
			oldCtx = el.component;

		if (oldCtx === ctx) {
			return;
		}

		if (oldCtx) {
			oldCtx.$destroy();
		}

		if (!meta.params.tiny) {
			if (oldCtx) {
				const
					props = ctx.$props,
					oldProps = oldCtx.$props,
					linkedFields = <Dictionary<string>>{};

				for (let keys = Object.keys(oldProps), i = 0; i < keys.length; i++) {
					const
						key = keys[i],
						linked = oldCtx.syncLinkCache[key];

					if (linked) {
						for (let keys = Object.keys(linked), i = 0; i < keys.length; i++) {
							linkedFields[linked[keys[i]].path] = key;
						}
					}
				}

				{
					const list = [
						oldCtx.meta.systemFields,
						oldCtx.meta.fields
					];

					for (let i = 0; i < list.length; i++) {
						const
							obj = list[i],
							keys = Object.keys(obj);

						for (let j = 0; j < keys.length; j++) {
							const
								key = keys[j],
								field = obj[key],
								link = linkedFields[key];

							const
								val = ctx[key],
								old = oldCtx[key];

							if (
								!ctx.$dataCache[key] &&
								(Object.isFunction(field.unique) ? !field.unique(ctx, oldCtx) : !field.unique) &&
								!Object.fastCompare(val, old) &&

								(
									!link ||
									link && Object.fastCompare(props[link], oldProps[link])
								)
							) {
								if (field.merge) {
									if (field.merge === true) {
										let
											newVal = old;

										if (Object.isObject(val) || Object.isObject(old)) {
											// tslint:disable-next-line:prefer-object-spread
											newVal = Object.assign({}, val, old);

										} else if (Object.isArray(val) || Object.isArray(old)) {
											// tslint:disable-next-line:prefer-object-spread
											newVal = Object.assign([], val, old);
										}

										ctx[key] = newVal;

									} else {
										field.merge(ctx, oldCtx, key, link);
									}

								} else {
									ctx[key] = oldCtx[key];
								}
							}
						}
					}
				}
			}

			const
				refs = {},
				refNodes = el.querySelectorAll(`.${ctx.componentId}[data-component-ref]`);

			for (let i = 0; i < refNodes.length; i++) {
				const
					el = refNodes[i],
					ref = el.dataset.componentRef;

				refs[ref] = refs[ref] ? [].concat(refs[ref], el) : el;
			}

			for (let keys = Object.keys(refs), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = refs[key];

				let cache;
				Object.defineProperty(ctx.$refs, key, {
					configurable: true,
					get(): any {
						if (cache) {
							return cache;
						}

						if (Object.isArray(el)) {
							const
								res = <any[]>[];

							for (let i = 0; i < el.length; i++) {
								const v = <any>el[i];
								res.push(v.component || v);
							}

							return cache = res;
						}

						return cache = el.component || el;
					}
				});
			}
		}

		ctx.hook = 'mounted';
		el.component = ctx;
		bindWatchers(<any>ctx);

		runHook('mounted', meta, ctx).then(async () => {
			if (methods.mounted) {
				await methods.mounted.fn.call(ctx);
			}
		}, stderr);
	};

	mount[$$.self] = ctx;
	destroy[$$.self] = ctx;

	const parentHook = {
		beforeMount: 'mounted',
		beforeUpdate: 'updated',
		deactivated: 'activated'
	}[p.hook];

	$C(['mounted', 'updated', 'activated']).forEach((hook) => {
		if (hook === parentHook) {
			return;
		}

		hooks[hook].unshift({
			fn: mount
		});
	});

	if (parentHook) {
		hooks[parentHook].unshift({
			fn: mount
		});

	} else {
		mount().catch(stderr);
	}

	hooks.beforeDestroy.unshift({
		fn: destroy
	});

	return vNode;
}

/**
 * Executes a render object with the specified fake component context
 *
 * @param renderObject
 * @param fakeCtx
 */
export function execRenderObject(renderObject: RenderObject, fakeCtx: Dictionary<any>): VNode {
	const
		fns = renderObject.staticRenderFns;

	if (fns) {
		if (!Object.isArray(fakeCtx._staticTrees)) {
			fakeCtx._staticTrees = [];
		}

		for (let i = 0; i < fns.length; i++) {
			fakeCtx._staticTrees.push(fns[i].call(fakeCtx));
		}
	}

	return renderObject.render.call(fakeCtx);
}

/**
 * Takes an object with compiled templates and returns a new render function
 *
 * @param renderObject
 * @param baseCtx - base component context
 */
export function convertRender(
	renderObject: RenderObject,
	baseCtx: FunctionalCtx
): FunctionalComponentOptions['render'] {
	if (cache.has(renderObject)) {
		return cache.get(renderObject);
	}

	const render = (el, ctx) => {
		const fakeCtx = render[CTX] = createFakeCtx(el, ctx, baseCtx);
		return patchVNode(execRenderObject(renderObject, fakeCtx), fakeCtx, ctx);
	};

	cache.set(renderObject, render);
	return render;
}
