let lute = {};
window.onload = function () {

    let luteVersion = chrome.app.getDetails().version;
    let version = document.getElementById('version');
    version.innerHTML = luteVersion;

    let toggleMetadata = document.getElementById('toggle-metadata-download');

    chrome.storage.sync.get(['downloadMetadata'], function (data) {
        let shouldDownloadMetadata = data.downloadMetadata;
        toggleMetadata.checked = shouldDownloadMetadata;
    });

    toggleMetadata.addEventListener("click", function () {
        let isChecked = toggleMetadata.checked;
        chrome.storage.sync.set({
            downloadMetadata: isChecked
        });
    });

    document.getElementById('reset').addEventListener('click', function () {
        chrome.storage.sync.set({
            downloadMetadata: false
        });
        toggleMetadata.checked = false;
    });
};