/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { UnsafeIData } from 'super/i-data/i-data';
import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';

export interface RequestQueryFn<T extends unknown = unknown> {
	(params: RequestMoreParams<T>): Dictionary<Dictionary>;
}
export interface RequestFn<T extends unknown = unknown> {
	(params: RequestMoreParams<T>): boolean;
}

export interface GetData<T extends unknown = unknown> {
	(ctx: bVirtualScroll, query: CanUndef<Dictionary>): Promise<T>;
}

export interface OptionEl<T extends unknown = unknown> {
	/**
	 * Current render data
	 */
	current: T;

	/**
	 * Previous render data
	 */
	prev: CanUndef<T>;

	/**
	 * Next render data
	 */
	next: CanUndef<T>;
}

/**
 * @typeParam ITEM - data item to render
 * @typeParam RAW - raw provider data without any processing
 */
export interface RequestMoreParams<ITEM extends unknown = unknown, RAW extends unknown = unknown> {
	/**
	 * Number of the last loaded page
	 */
	currentPage: number;

	/**
	 * Number of a page to upload
	 */
	nextPage: number;

	/**
	 * Number of items to show till the page bottom is reached
	 */
	itemsTillBottom: number;

	/**
	 * Items to render
	 */
	items: RenderItem<ITEM>[];

	/**
	 * Data that pending to be rendered
	 */
	pendingData: unknown[];

	/**
	 * True if the last requested data response was empty
	 */
	isLastEmpty: boolean;

	/**
	 * Last loaded data chunk
	 */
	lastLoadedChunk: {
		/**
		 * Normalized data (processed with `dbConverter`)
		 */
		normalized: ITEM[];

		/**
		 * Raw provider data without any processing
		 */
		raw: RAW;
	}

	/**
	 * @deprecated
	 * @see [[RequestMoreParams.lastLoadedChunk]]
	 */
	lastLoadedData: Array<ITEM>;
}

export interface RemoteData {
	/**
	 * Data to render components
	 */
	data: unknown[];

	/**
	 * Total number of elements
	 */
	total?: number;
}

export interface RenderItem<T extends unknown = unknown> {
	/**
	 * Component data
	 */
	data: T;

	/**
	 * Component DOM node
	 */
	node: CanUndef<HTMLElement>;

	/**
	 * Component destructor
	 */
	destructor: CanUndef<Function>;

	/**
	 * Component position in a DOM tree
	 */
	index: number;
}

/**
 * Last loaded data chunk
 *
 * @typeParam DATA - data to render
 * @typeParam RAW - raw provider data without any processing
 */
export interface LastLoadedChunk<DATA extends unknown = unknown[], RAW extends unknown = unknown> {
	normalized: DATA;
	raw: RAW;
}

export interface DataToRender {
	itemAttrs: Dictionary;
	itemParams: OptionEl;
	index: number;
}

/**
 * The local state of a component
 *
 * * `error` - indicates the component loading error appear
 * * `init` - indicates the component now loading the first chunk of data
 * * `ready` - indicates the component now is ready to render data
 */
export type LocalState = 'init' | 'ready' | 'error';

/**
 * Display state of the ref
 */
export type RefDisplayState = '' | 'none';

// @ts-ignore
export interface UnsafeBVirtualScroll<CTX extends bVirtualScroll = bVirtualScroll> extends UnsafeIData<CTX> {
	// @ts-ignore (access)
	total: CTX['total'];

	// @ts-ignore (access)
	localState: CTX['localState'];

	// @ts-ignore (access)
	chunkRender: CTX['chunkRender'];

	// @ts-ignore (access)
	chunkRequest: CTX['chunkRequest'];

	// @ts-ignore (access)
	componentRender: CTX['componentRender'];

	// @ts-ignore (access)
	getOptionKey: CTX['getOptionKey'];
}