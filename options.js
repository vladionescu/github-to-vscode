// Saves options to chrome.storage.sync.
function saveOptions() {
  const basePath = document.getElementById('basePath').value;
  chrome.storage.sync.set(
    { vscBasePath: basePath },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 1500); // Clear status after 1.5 seconds
    }
  );
}

// Restores input box state using the preferences stored in chrome.storage.
function restoreOptions() {
  // Use default value vscBasePath = '' if not set.
  chrome.storage.sync.get(
    { vscBasePath: '' }, // Default value if the key doesn't exist
    (items) => {
      document.getElementById('basePath').value = items.vscBasePath;
    }
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);