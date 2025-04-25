export const obj = {
routeSearch: {
   searchFeild: 'android=new UiSelector().resourceId("search_text_field")',
   editSearchFeild : '//android.widget.EditText[@resource-id="search_text_field"]',
   searchResult: 'android=new UiSelector().resourceIdMatches("search_result_item.+")',
   directionButton: 'android=new UiSelector().resourceId("place_detail_get_directions_button")',
   routePreferance: 'new UiSelector().resourceId("scrolling_screen_content_header")'
  },
  onBoardingPage: {
    welcome_next_button: `android=new UiSelector().resourceId("ftu_primary_button_next")`,
    share_traffic_info: `android=new UiSelector().resourceId("ftu_primary_button_share_traffic_info")`,
    share_for_imporovement: `android=new UiSelector().resourceId("ftu_primary_button_share_for_improvement")`
  }
}