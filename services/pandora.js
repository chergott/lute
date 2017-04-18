console.log('Lute content script');
startLute();
var isActive = false;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === "startMetadataListener") {
            startMetadataListener();
        }
    });

// if (request.action === "getMetadata") {
//         sendResponse({
//             metadata: getMetadata()
//         });
//     } else

function startLute() {
    chrome.runtime.sendMessage({
        action: 'start'
    }, function (response) {});
}

function startMetadataListener() {
    if (!isActive) {
        isActive = true;
        console.log('Starting Metadata Listener');
        let tuner = getElementByClassName('Tuner__Audio__TrackDetail__artist');
        // console.log('tuner: ', tuner);
        tuner.addEventListener('DOMSubtreeModified', sendMetadata, false);
    }
}

function sendMetadata() {
    // console.log('sending metadata... ', getMetadata());
    chrome.runtime.sendMessage({
        metadata: getMetadata()
    }, function (response) {});
}

function getMetadata() {
    // Pandora One = .mp3
    // Pandora Business = .mp3?
    // Pandora Plus = .m4a
    // Pandora free = .m4a
    var isMp3 = /pandora one/i.test(document.title);
    var trackDetails = getElementByClassName('Tuner__Audio__TrackDetail__labels');
    var title = trackDetails.children[0].innerText;
    var artist = trackDetails.children[1].innerText;
    var album = getInnerTextByClassName('nowPlayingTopInfo__current__albumName');
    var albumArtwork = getBackgroundImageUrlByClassName('nowPlayingTopInfo__artContainer__art');
    var metadata = {
        title,
        artist,
        album,
        fileExtension: isMp3 ? '.mp3' : '.m4a',
        albumArtwork
    };
    console.log('metadata: ', metadata);
    return metadata;
}

function getElementByClassName(className) {
    var element = document.getElementsByClassName(className);
    return element.length > 0 ? element[0] : null;
}

function getInnerTextByClassName(className) {
    var element = getElementByClassName(className);
    return element ? element.innerText : null;
}

function getBackgroundImageUrlByClassName(className) {
    var element = getElementByClassName(className);
    return element ? extractUrlFromBackgroundImage(element.style.backgroundImage) : null;
}

function extractUrlFromBackgroundImage(url) {
    return url.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
}