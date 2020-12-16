/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	iconsMap = Object.createDict<CanUndef<string>>(),
	iconsList = <Function[]>[];

interface Sprite {
	id: string;
	content: string;
	viewBox: string;
	stringify(): string;
	destroy(): undefined;
}

function icons(id?: string): Sprite {
	if (id != null) {
		for (let i = 0; i < iconsList.length; i++) {
			try {
				return iconsList[i](id).default;

			} catch {}
		}
	}

	throw new Error(`Cannot find a module "${id}"`);
}

//#if runtime has svgSprite
// @context: ['@sprite', 'sprite' in flags ? flags.sprite : '@super']

let
	ctx;

if (IS_PROD) {
	// @ts-ignore (require)
	ctx = (<any>require).context(
		'!!svg-sprite-loader!svgo-loader!@sprite',
		true,
		/\.svg$/
	);

} else {
	// @ts-ignore (require)
	ctx = (<any>require).context(
		'!!svg-sprite-loader!@sprite',
		true,
		/\.svg$/
	);
}

Object.forEach(ctx.keys(), (el: string) => {
	iconsMap[normalize(el)] = el;
});

iconsList.push(ctx);
// @endcontext
//#endif

function normalize(key: string): string {
	return key.replace(/\.\//, '').replace(/\.svg$/, '');
}

export { icons, iconsMap };
