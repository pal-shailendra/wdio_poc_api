export const keyboardSearch = async () => {
    await driver.execute('mobile: performEditorAction', { action: 'search' });
}