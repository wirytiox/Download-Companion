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
