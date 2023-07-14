chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  const { tabId, url } = details;
  const modifiedUrl = new URL(url);
  modifiedUrl.pathname += "download";
  
  if (url.startsWith("https://nhentai.net/g/") && !url.includes("/download")) {
    chrome.scripting.executeScript({
      target: { tabId },
      func: (modifiedUrl) => {
        const links = document.getElementsByTagName('a');
        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          if (link.href === modifiedUrl) {
            link.href += 'download';
            break;
          }
        }
        console.log('URL modified:', modifiedUrl);
      },
      args: [modifiedUrl.href]
    });
  }
});

chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  const { tabId, url } = details;
  const modifiedUrl = new URL(url);
  modifiedUrl.pathname += "/download";

  if (url.startsWith("https://nhentai.net/g/") && !url.includes("/download")) {
    chrome.tabs.remove(tabId, function() {
      chrome.tabs.create({ url: modifiedUrl.href });
    });
  }
});
