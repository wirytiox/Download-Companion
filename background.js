let isRedirecting = false;  // Global flag to prevent infinite redirection

function modifyUrlAndPerformAction(details) {
  const { tabId, url } = details;

  // If we're already redirecting, do nothing to avoid a loop
  if (isRedirecting) {
    isRedirecting = false;  // Reset the flag once the redirection is done
    return;
  }

  // Retrieve the auto-download, URL append, and path check states from storage
  chrome.storage.sync.get(['autoDownloadState', 'appendState', 'appendText', 'pathCheckState', 'pathCheckText'], (result) => {
    const autoDownloadState = result.autoDownloadState ?? false;
    const appendState = result.appendState ?? false;
    const appendText = result.appendText || 'download'; // Use 'download' as default if input is empty
    const pathCheckState = result.pathCheckState ?? false;
    const pathCheckText = result.pathCheckText || 'g/'; // Use 'g/' as default if input is empty

    let modifiedUrl = new URL(url);
    let needsRedirection = false;

    // If the path check slider is enabled, ensure the URL contains the required path
    if (pathCheckState) {
      if (!modifiedUrl.pathname.includes(pathCheckText)) {
        // If the URL does not contain the specified path, do nothing
        return;
      }
    }

    // If the append slider is enabled and the text is not already appended, modify the URL
    if (appendState && appendText) {
      if (!modifiedUrl.pathname.endsWith(appendText)) {  // Check if the text is already appended
        modifiedUrl.pathname += appendText;
        needsRedirection = true;
      }
    }

    // If the auto-download slider is enabled
    if (autoDownloadState) {
      if (needsRedirection) {
        // Only download from the modified URL directly (without redirecting the tab)
        chrome.downloads.download({
          url: modifiedUrl.href,  // Use the modified URL for the download
          conflictAction: 'uniquify',  // Handle filename conflicts
          saveAs: true  // Show "Save As" dialog
        }, function (downloadId) {
          if (chrome.runtime.lastError) {
            console.error("Download failed:", chrome.runtime.lastError);
          } else {
            console.log("Download started with ID:", downloadId);
          }
        });

        // Close the current tab after download, but avoid redirection
        chrome.tabs.remove(tabId);
      } else {
        // If no redirection is required, download from the current URL
        chrome.downloads.download({
          url: url,  // Use the original URL for the download
          conflictAction: 'uniquify',
          saveAs: true
        }, function (downloadId) {
          if (chrome.runtime.lastError) {
            console.error("Download failed:", chrome.runtime.lastError);
          } else {
            console.log("Download started with ID:", downloadId);
          }
        });

        // Close the current tab after download
        chrome.tabs.remove(tabId);
      }
    } else if (needsRedirection) {
      // If the tab needs to be redirected (for URL appending)
      isRedirecting = true;  // Set the flag to prevent infinite loop
      chrome.tabs.update(tabId, { url: modifiedUrl.href });  // Redirect the tab
    }
  });
}

// Function to manage adding/removing the webNavigation listener
function updateWebNavigationListener(isAutoDownloadOn, isAppendOn) {
  if (isAutoDownloadOn || isAppendOn) {
    chrome.webNavigation.onBeforeNavigate.addListener(modifyUrlAndPerformAction);
  } else {
    chrome.webNavigation.onBeforeNavigate.removeListener(modifyUrlAndPerformAction);
  }
}

// Load the initial slider states from storage and set up the listener accordingly
chrome.storage.sync.get(['autoDownloadState', 'appendState', 'pathCheckState'], (result) => {
  const isAutoDownloadOn = result.autoDownloadState ?? false;
  const isAppendOn = result.appendState ?? false;
  const isPathCheckOn = result.pathCheckState ?? false;
  updateWebNavigationListener(isAutoDownloadOn, isAppendOn, isPathCheckOn);
});

// Listen for messages to update the slider states and manage the listener
chrome.runtime.onMessage.addListener((message) => {
  if (message.autoDownloadState !== undefined || message.appendState !== undefined || message.pathCheckState !== undefined) {
    const isAutoDownloadOn = message.autoDownloadState ?? false;
    const isAppendOn = message.appendState ?? false;
    const isPathCheckOn = message.pathCheckState ?? false;
    updateWebNavigationListener(isAutoDownloadOn, isAppendOn, isPathCheckOn);
    chrome.storage.sync.set({
      autoDownloadState: isAutoDownloadOn,
      appendState: isAppendOn,
      pathCheckState: isPathCheckOn
    });
  }
});
