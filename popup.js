document.addEventListener("DOMContentLoaded", () => {
  const downloadButton = document.getElementById("downloadButton");
  downloadButton.addEventListener("click", async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs.length === 0) {
        alert("No active tab found.");
        return;
      }

      const currentTab = tabs[0];
      const fullUrl = currentTab.url; 
      try {
        // Retrieve cookies asynchronously
        const sessionid = await getCookie(fullUrl, "sessionid");
        const csrftoken = await getCookie(fullUrl, "csrftoken");
        const sessionAffinity = await getCookie(fullUrl, "session-affinity");

        if (!sessionid || !csrftoken || !sessionAffinity) {
          alert("Required cookies not found. Make sure you're logged in.");
          return;
        }

        const headers = {
          "accept": "*/*",
          "accept-language": "en-US,en;q=0.8",
          "priority": "u=1, i",
          "sec-ch-ua": "\"Brave\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sec-gpc": "1",
          "x-csrftoken": csrftoken,  // Include the csrf token here
          "x-requested-with": "XMLHttpRequest",
          "referer": fullUrl // Set the referer as the current URL
        };
        const cookies = {
          "csrftoken": csrftoken,
          "sessionid": sessionid
        };

        const response = await makeApiRequest(fullUrl, headers, cookies);
        console.log(response);

      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Check the console for details.");
      }
    });
  });
});

// popup.js
document.getElementById('appendDownload').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      let currentUrl = tabs[0].url;
      let newUrl = currentUrl.endsWith('/') ? currentUrl + 'download' : currentUrl + '/download';
      
      // Open the modified URL in a new tab
      chrome.tabs.create({ url: newUrl });
    }
  });
});

// popup.js
const autoDownloadSlider = document.getElementById('autoDownloadSlider');

// Load saved state from storage
chrome.storage.sync.get(['autoDownloadEnabled'], (result) => {
  autoDownloadSlider.checked = result.autoDownloadEnabled || false;
});

// Save state when toggled
autoDownloadSlider.addEventListener('change', () => {
  const isEnabled = autoDownloadSlider.checked;
  chrome.storage.sync.set({ autoDownloadEnabled: isEnabled });
  console.log('Auto Download ' + (isEnabled ? 'enabled' : 'disabled'));
});

  




