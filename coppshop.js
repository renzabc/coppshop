document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggleButton');

    // Load the current state from storage
    chrome.storage.sync.get('isOn', function (data) {
        toggleButton.textContent = data.isOn ? 'Turn Off' : 'Turn On';
    });

    toggleButton.addEventListener('click', function () {
        chrome.storage.sync.get('isOn', function (data) {
            const newState = !data.isOn;
            chrome.storage.sync.set({ isOn: newState }, function () {
                toggleButton.textContent = newState ? 'Turn Off' : 'Turn On';
            });
        });
    });
});