document.addEventListener('DOMContentLoaded', function () {
  const autoDownloadSlider = document.getElementById('autoDownloadSlider');
  const appendSlider = document.getElementById('appendSlider');
  const appendTextInput = document.getElementById('appendText');
  const pathCheckSlider = document.getElementById('pathCheckSlider');
  const pathCheckTextInput = document.getElementById('pathCheckText');

  // Load initial states from storage
  chrome.storage.sync.get(['autoDownloadState', 'appendState', 'appendText', 'pathCheckState', 'pathCheckText'], (result) => {
    autoDownloadSlider.checked = result.autoDownloadState ?? false;
    appendSlider.checked = result.appendState ?? false;
    appendTextInput.value = result.appendText || ''; // Load saved text or leave it empty
    pathCheckSlider.checked = result.pathCheckState ?? false;
    pathCheckTextInput.value = result.pathCheckText || ''; // Load saved path or leave it empty
  });

  // Function to save all states together
  function saveSliderStates() {
    const autoDownloadState = autoDownloadSlider.checked;
    const appendState = appendSlider.checked;
    const pathCheckState = pathCheckSlider.checked;

    chrome.storage.sync.set({ autoDownloadState, appendState, pathCheckState });
    chrome.runtime.sendMessage({ autoDownloadState, appendState, pathCheckState });
  }

  // Save the auto-download, append, and path check states when any slider is changed
  autoDownloadSlider.addEventListener('change', saveSliderStates);
  appendSlider.addEventListener('change', saveSliderStates);
  pathCheckSlider.addEventListener('change', saveSliderStates);

  // Save the appended text when the input changes
  appendTextInput.addEventListener('input', () => {
    const appendText = appendTextInput.value || appendTextInput.placeholder; // Use placeholder if empty
    chrome.storage.sync.set({ appendText });
  });

  // Save the path check text when the input changes
  pathCheckTextInput.addEventListener('input', () => {
    const pathCheckText = pathCheckTextInput.value || pathCheckTextInput.placeholder; // Use placeholder if empty
    chrome.storage.sync.set({ pathCheckText });
  });
});
document.getElementById('sendCurrentUrlButton').addEventListener('click', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length === 0) return;
      const currentTab = tabs[0];

      // Get cookies for the active tab
      chrome.cookies.getAll({ url: currentTab.url }, function (cookies) {
          const sessionid = cookies.find(cookie => cookie.name === 'sessionid')?.value || '';
          const csrftoken = cookies.find(cookie => cookie.name === 'csrftoken')?.value || '';

          if (!sessionid || !csrftoken) {
              alert('Session ID or CSRF token not found!');
              return;
          }

          chrome.storage.sync.get(['qbusername', 'qbpassword', 'qbServer'], (result) => {
              const qbusername = result.qbusername || 'admin';
              const qbpassword = result.qbpassword || 'admin admin';
              const qbServer = result.qbServer || 'http://localhost:8081';

              fetch('http://127.0.0.1:5050/download', {  // Replace with your Flask server URL
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'x-csrftoken': csrftoken  // Include the retrieved CSRF token
                  },
                  body: JSON.stringify({
                      url: currentTab.url,
                      sessionid: sessionid,
                      qbusername: qbusername,
                      qbpassword: qbpassword,
                      qbServer: qbServer
                  })
              })
              .then(response => response.json())
              .then(data => alert(data.message || 'URL sent successfully!'))
              .catch(error => console.error('Error:', error));
          });
      });
  });
});



document.addEventListener('DOMContentLoaded', function () {
  const qbUsernameInput = document.getElementById('qbUsername');
  const qbPasswordInput = document.getElementById('qbPassword');

  // Load initial values for QB Username and Password
  chrome.storage.sync.get(['qbusername', 'qbpassword'], (result) => {
    qbUsernameInput.value = result.qbusername || 'admin'; // Default is 'admin'
    qbPasswordInput.value = result.qbpassword || 'admin admin'; // Default is 'admin admin'
  });

  // Save QB Username when input changes
  qbUsernameInput.addEventListener('input', () => {
    const qbusername = qbUsernameInput.value || 'admin'; // Use 'admin' if input is empty
    chrome.storage.sync.set({ qbusername });
  });

  // Save QB Password when input changes
  qbPasswordInput.addEventListener('input', () => {
    const qbpassword = qbPasswordInput.value || 'admin admin'; // Use 'admin admin' if input is empty
    chrome.storage.sync.set({ qbpassword });
  });
});
document.addEventListener('DOMContentLoaded', function () {
  const qbServerInput = document.getElementById('qbServer');

  // Load initial value for QB Server
  chrome.storage.sync.get(['qbServer'], (result) => {
    qbServerInput.value = result.qbServer || 'http://localhost:8081'; // Default is 'http://localhost:8081'
  });

  // Save QB Server when input changes
  qbServerInput.addEventListener('input', () => {
    const qbServer = qbServerInput.value || 'http://localhost:8081'; // Use default if input is empty
    chrome.storage.sync.set({ qbServer });
  });
});
