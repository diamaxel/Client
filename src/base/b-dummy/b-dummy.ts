/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { derive } from 'core/functools/trait';

import { inViewFactory } from 'core/dom/in-view';
import { ImageLoader, imageLoaderFactory } from 'core/dom/image';
import { ResizeWatcher } from 'core/dom/resize-observer';

import updateOn from 'core/component/directives/update-on/engines';

import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';
import iObserveDOM from 'traits/i-observe-dom/i-observe-dom';

import iData, { component, field, computed, hook, wait } from 'super/i-data/i-data';

import daemons from 'base/b-dummy/daemons';
import type { Directives, Modules } from 'base/b-dummy/interface';

const
	inViewMutation = inViewFactory('mutation'),
	inViewObserver = inViewFactory('observer');

export * from 'super/i-data/i-data';
export * from 'base/b-dummy/interface';

interface bDummy extends Trait<typeof iLockPageScroll>, Trait<typeof iObserveDOM> {}

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

@derive(iLockPageScroll, iObserveDOM)
class bDummy extends iData implements iLockPageScroll, iObserveDOM {
	/**
	 * Test field
	 */
	@field()
	testField: any = undefined;

	/**
	 * Getter that depends on a value from the another component
	 */
	@computed({dependencies: ['r.isAuth']})
	get remoteWatchableGetter(): boolean {
		return this.r.isAuth;
	}

	/**
	 * Links to directives
	 */
	get directives(): Directives {
		return {
			imageFactory: imageLoaderFactory,
			image: ImageLoader,
			inViewMutation,
			inViewObserver,
			updateOn
		};
	}

	/**
	 * Link to the modules
	 */
	get modules(): Modules {
		return {
			resizeWatcher: ResizeWatcher,
			iObserveDOM
		};
	}

	/** @override */
	static readonly daemons: typeof daemons = daemons;

	/** @see [[iObserveDOM.initDOMObservers]] */
	@hook('mounted')
	@wait('ready')
	initDOMObservers(): void {
		iObserveDOM.observe(this, {
			node: this.$el!,
			childList: true,
			subtree: true
		});
	}
}

export default bDummy;
