const slider = document.getElementById('slider');

// Load the initial state of the slider from storage
chrome.storage.sync.get('sliderState', (result) => {
  slider.checked = result.sliderState ?? false;
});

// Handle the slider state changes and save it to storage
slider.addEventListener('change', () => {
  const sliderState = slider.checked;
  chrome.runtime.sendMessage({ sliderState });
  chrome.storage.sync.set({ sliderState });
});
