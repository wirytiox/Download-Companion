function modifyUrlAndCreateTab(details) {
  const { tabId, url } = details;

  // Check if the URL is from nhentai.net and doesn't already include "/download"
  if (url.startsWith("https://nhentai.net/g/") && !url.includes("/download")) {
    const modifiedUrl = new URL(url);
    modifiedUrl.pathname += "download";  // Ensure "/download" is appended correctly

    // Directly download the file instead of opening a new tab
    chrome.downloads.download({
      url: modifiedUrl.href,
      conflictAction: 'uniquify',  // If a file with the same name exists, make the filename unique
      saveAs: true  // Show the "Save As" dialog to the user
    }, function(downloadId) {
      if (chrome.runtime.lastError) {
        console.error("Download failed:", chrome.runtime.lastError);
      } else {
        console.log("Download started with ID:", downloadId);
      }
    });

    // Optionally, close the current tab if necessary
    chrome.tabs.remove(tabId);
  }
}

// Function to manage adding/removing the webNavigation listener
function updateWebNavigationListener(isSliderOn) {
  if (isSliderOn) {
    chrome.webNavigation.onBeforeNavigate.addListener(modifyUrlAndCreateTab);
  } else {
    chrome.webNavigation.onBeforeNavigate.removeListener(modifyUrlAndCreateTab);
  }
}

// Load the initial slider state from storage and set up the listener accordingly
chrome.storage.sync.get('sliderState', (result) => {
  const isSliderOn = result.sliderState ?? false;
  updateWebNavigationListener(isSliderOn);
});

// Listen for messages to update the slider state and manage the listener
chrome.runtime.onMessage.addListener((message) => {
  if (message.sliderState !== undefined) {
    const isSliderOn = message.sliderState;
    updateWebNavigationListener(isSliderOn);
    chrome.storage.sync.set({ sliderState: isSliderOn });
  }
});
