// Get cookies for a specific URL
async function getCookie(url, name) {
    return new Promise((resolve, reject) => {
      chrome.cookies.get({ url: url, name: name }, (cookie) => {
        if (cookie) {
            console.log(cookie.value);
          resolve(cookie.value); // Return the cookie value
        } else {
          console.error(`Cookie ${name} not found for URL: ${url}`);
          resolve(null); // Or reject if you prefer to handle missing cookies
        }
      });
    });
  }
  

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      chrome.storage.sync.get(['autoDownloadEnabled'], async (result) => {
        if (result.autoDownloadEnabled && tab.url.includes('/g/')) {
          console.log('Detected URL with "/g/":', tab.url);
          const fullUrl = tab.url;
  
          // Fetch sessionid and csrftoken cookies
          const sessionid = await getCookie(fullUrl, "sessionid");
          const csrftoken = await getCookie(fullUrl, "csrftoken");
  
          if (!sessionid || !csrftoken) {
            console.error("Required cookies are missing!");
            return;
          }
  
          console.log('Session ID:', sessionid);
          console.log('CSRF Token:', csrftoken);
  
          // Prepare headers and cookies
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
            "referer": fullUrl,
          };
  
          const cookies = {
            "csrftoken": csrftoken,
            "sessionid": sessionid,
          };
  
          console.log('Headers:', headers);
          console.log('Cookies:', cookies);
  
          try {
            const response = await makeApiRequest(tab.url, headers, cookies);
            console.log('API Response:', response);
          } catch (error) {
            console.error('Error in API Request:', error);
          }
        }
      });
    }
  });
  
  // Make the API request
  async function makeApiRequest(url, headers, cookies) {
    try {
      const response = await fetch('http://127.0.0.1:9998/fabdownload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          headers: headers,
          cookies: cookies
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error("Network or API request error:", error);
    }
  }
