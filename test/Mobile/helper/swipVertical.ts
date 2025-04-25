export const swipeVertical = async (element: WebdriverIO.Element, direction: 'up' | 'down') => {
    await element.waitForDisplayed(); // equivalent of waitForVisibilityOf
    const elementId = await element.elementId;
    await driver.execute('mobile: swipeGesture', {
        elementId: elementId,
        direction: direction,
        percent: 1.0
    })
}