import { commonScreens } from "mob-screens/common.screen.ts"
import { helpers } from "test/Mobile/helper/helper";
import ApiHelper from 'utilities/apiHelper';


describe('Route searching', () => {

    describe('User searches for route and checks if simulation works', () => {

        it('Given user hits API', async () => {
            console.log('################## API Test STRAT #####################');
            await ApiHelper.runApi('TC_1');
            await ApiHelper.runApi('TC_2');
            await ApiHelper.runApi('TC_3');
            const res = await ApiHelper.runApi('TC_4');
            // 🔄 Store dynamic values like bookingid for reuse
            if (typeof res === 'object' && res.data.bookingid) {
                ApiHelper.storeDynamicData({ bookingid: res.data.bookingid });
            }
            await ApiHelper.runApi('TC_5');
            await ApiHelper.runApi('TC_6');
            await ApiHelper.runApi('TC_7');
            console.log('################## API Test END #####################');
        })

        it('Given user goes through onboarding screens', async () => {
            await commonScreens.onBoardingScreens.clickNextWelcomeButton();
            await commonScreens.onBoardingScreens.clickNextOnShareTrafficInfo();
            await commonScreens.onBoardingScreens.clickNextonShareForImporovmentButton();
            console.log('##################OnBoardingScreenPass#####################');
        })

        it('When user opens search screen and search for Restaurant', async () => {
            await commonScreens.routeSearchScreen.writeInSeachBox('Restaurant');
            await helpers.keyboardSearch();
            console.log('When user opens search screen is done');
        })

        it('And user selects result 1', async () => {
            await commonScreens.routeSearchScreen.selectFromSearchResult();
            console.log('And user selects result 1 Done');
        })

        it('When user clicks on Directions button', async () => {
            await commonScreens.routeSearchScreen.clickOnDirectionButton();
            console.log('user clicks on Directions button');
        })

        it('list of calculated route with alternatives to selected destination appears', async () => {
            //await commonScreens.routeSearchScreen.selectFirstCalculateRoute();
            console.log('user clicks on Directions button');
        })
    })
})


