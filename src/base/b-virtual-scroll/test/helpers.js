
/**
 * Returns a component props
 * @param {*} page 
 */
module.exports.getComponentProps = async function (page) {
	const
		componentSelector = '.b-virtual-scroll',
		component = await (await page.$(componentSelector)).getProperty('component');

	return {componentSelector, component};
}

/**
 * Scrolls page down and waits for items to be rendered
 *
 * @param page
 * @param count
 * @param componentSelector
 */
module.exports.scrollAndWaitItemsCountGreaterThan = async function (page, count, componentSelector) {
	await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
	await waitItemsCountGreaterThan(page, count, componentSelector);
}

/**
 * Scrolls page down and waits for items to be rendered
 *
 * @param page
 * @param count
 * @param componentSelector
 */
module.exports.scrollAndWaitItemsCountGreaterThan = async function (page, count, componentSelector) {
	await page.waitForFunction(`document.querySelector('${componentSelector}__container').childElementCount > ${count}`);
}