import { $ } from '@wdio/globals'
import { helpers } from 'test/Mobile/helper/helper';
import {repo} from 'test/Mobile/repo/wego.object.repo'
 
export const routeSearchScreen = {

    writeInSeachBox: async (name: string) => {
      console.log("in writeSearchBlock");
      const searchBox = $(repo.routeSearch.searchFeild);
      await searchBox.waitForDisplayed();
      await searchBox.click();
      const searchBoxSendKey = $(repo.routeSearch.editSearchFeild);
      await searchBoxSendKey.waitForDisplayed();
      await searchBoxSendKey.setValue(name);
    },

    selectFromSearchResult: async () => {
      const searchResult = $(repo.routeSearch.searchResult);
      await searchResult.waitForDisplayed();
      await searchResult.click();
    },

    clickOnDirectionButton: async () => {
      const directionButton = $(repo.routeSearch.directionButton);
      await directionButton.waitForDisplayed();
      await directionButton.click();
    },

    selectFirstCalculateRoute: async () => {
      const routePreferance = $(repo.routeSearch.routePreferance);
      await routePreferance.scrollIntoView();
    },

};