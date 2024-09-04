function isValidUrl(url) {
  try {
      const parsedUrl = new URL(url);
      // Check that the URL is using HTTPS and is from the expected domain
      return parsedUrl.protocol === 'https:' && parsedUrl.hostname === 'nhentai.net';
  } catch (e) {
      // Invalid URL
      return false;
  }
}

function modifyUrlAndCreateTab(details) {
  const { tabId, url } = details;

  // Validate the URL before proceeding
  if (!isValidUrl(url)) {
      console.error("Invalid URL detected:", url);
      return;
  }

  const modifiedUrl = new URL(url);

  if (url.startsWith("https://nhentai.net/g/") && !url.includes("/download")) {
      // Sanitize the pathname by ensuring it ends with '/download'
      modifiedUrl.pathname = sanitizePathname(modifiedUrl.pathname + "download");

      // Programmatically download the file without navigating to the download page
      chrome.downloads.download({ url: modifiedUrl.href }, (downloadId) => {
          if (chrome.runtime.lastError) {
              console.error("Download failed:", chrome.runtime.lastError);
              return;
          }
          chrome.downloads.onChanged.addListener((downloadDelta) => {
              if (downloadDelta.id === downloadId && downloadDelta.state?.current === 'complete') {
                  chrome.downloads.search({ id: downloadId }, (results) => {
                      // Additional handling if needed
                  });
              }
          });
      });

      // Stop the browser from navigating to the URL and triggering a second download
      chrome.webNavigation.onBeforeNavigate.removeListener(modifyUrlAndCreateTab);
      chrome.tabs.remove(tabId); // Remove the original tab to prevent navigation
  }
}

function sanitizePathname(pathname) {
  // Basic sanitization to remove unexpected characters (basic whitelist approach)
  return pathname.replace(/[^a-zA-Z0-9/_-]/g, '');
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
