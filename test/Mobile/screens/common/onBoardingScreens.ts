import { $ } from '@wdio/globals'
import {repo} from 'test/Mobile/repo/wego.object.repo'
 
export const onBoardingScreens = {

    clickNextWelcomeButton: async () => {
        const nextButton = $(repo.onBoardingPage.welcome_next_button);
        await nextButton.waitForDisplayed();
        await nextButton.click();
    },

    clickNextOnShareTrafficInfo: async () => {
        const share_traffic_info = $(repo.onBoardingPage.share_traffic_info);
        await share_traffic_info.waitForDisplayed();
        await share_traffic_info.click();
    },

    clickNextonShareForImporovmentButton: async () => {
        const share_for_imporovement = $(repo.onBoardingPage.share_for_imporovement);
        await share_for_imporovement.waitForDisplayed();
        await share_for_imporovement.click();
    },

};