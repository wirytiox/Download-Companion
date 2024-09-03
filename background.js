function modifyUrlAndCreateTab(details) {
  const { tabId, url } = details;
  const modifiedUrl = new URL(url);

  if (url.startsWith("https://nhentai.net/g/") && !url.includes("/download")) {
    if (modifiedUrl.pathname.endsWith("/download")) {
      chrome.webNavigation.onBeforeNavigate.removeListener(modifyUrlAndCreateTab);
    } else {
      modifiedUrl.pathname += "download";
      chrome.tabs.remove(tabId, function() {
        chrome.tabs.create({ url: modifiedUrl.href, active: false });  // Opens the tab in the background
      });
    }
  }
}

chrome.storage.sync.get('sliderState', (result) => {
  const isSliderOn = result.sliderState ?? false;

  if (isSliderOn) {
    chrome.webNavigation.onBeforeNavigate.addListener(modifyUrlAndCreateTab);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.sliderState !== undefined) {
    const isSliderOn = message.sliderState;

    if (isSliderOn) {
      chrome.webNavigation.onBeforeNavigate.addListener(modifyUrlAndCreateTab);
    } else {
      chrome.webNavigation.onBeforeNavigate.removeListener(modifyUrlAndCreateTab);
    }

    chrome.storage.sync.set({ sliderState: isSliderOn });
  }
});
