/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import DOM from 'tests/helpers/dom';
import BOM from 'tests/helpers/bom';
import Utils from 'tests/helpers/utils';
import Component from 'tests/helpers/component';
import Scroll from 'tests/helpers/scroll';
import Router from 'tests/helpers/router';
import Request from 'tests/helpers/request';
import Gestures from 'tests/helpers/gestures';

export class Helpers {
	/** @see [[Request]] */
	request: Request = new Request();

	/** @see [[Utils]] */
	utils: Utils = new Utils(this);

	/** @see [[Component]] */
	component: Component = new Component(this);

	/** @see [[Gestures]] */
	gestures: Gestures = new Gestures();

	/** @see [[BOM]] */
	bom: BOM = new BOM(this);

	/** @see [[Router]] */
	router: Router = new Router(this);

	/** @see [[DOM]] */
	dom: DOM = new DOM(this);

	/** @see [[Scroll]] */
	scroll: Scroll = new Scroll(this);
}

export default new Helpers();
