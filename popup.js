const slider = document.getElementById('slider');

// Load the initial state of the slider from storage
chrome.storage.sync.get('sliderState', (result) => {
  if (chrome.runtime.lastError) {
    console.error("Error retrieving slider state:", chrome.runtime.lastError);
    return;
  }
  const isSliderOn = result.sliderState ?? false;
  if (isSliderOn) {
      chrome.webNavigation.onBeforeNavigate.addListener(modifyUrlAndCreateTab);
  }
});


// Handle the slider state changes and save it to storage
slider.addEventListener('change', () => {
  const sliderState = slider.checked;
  chrome.runtime.sendMessage({ sliderState });
  chrome.storage.sync.set({ sliderState });
});
