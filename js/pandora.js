$(document).ready(function() {

    chrome.storage.sync.get("themes", function(data) {
        if (data.themes["pandora-zero"] == true) {
            $.getScript(chrome.extension.getURL("themes/pandorazero.js"), function() {
                $('#downloadButton').click(function(e) {
                    e.preventDefault();
                    console.debug("Finding audio track...");
                    chrome.runtime.sendMessage({
                        lute: {
                            action: 'downloadAudioFile'
                        }
                    });
                });
                console.debug("Pandora ZERO is enabled");
            });
        } else {
            console.debug("Pandora ZERO is disabled. Go to Lute's Options page to enable.");
        }
    });

    // Send audio metaData when audio information is updated
    $('.playerBarAlbum:first').bind("DOMSubtreeModified", function() {
        setTimeout(function() {
            // send metaData to luteBackground.js
            chrome.runtime.sendMessage({
                lute: {
                    metaData: getMetadata()
                }
            });
        }, 100);

        function getMetadata() {
            let fileExtension;
            let albumArtwork = $('.playerBarArt').attr('src');
            // Pandora One = .mp3
            if ($(".logosubscriber").css("display") === "block") {
                fileExtension = ".mp3";
            }
            // Pandora Business = .mp3
            else if ($(".logobusiness").css("display") === "block") {
                fileExtension = ".mp3"; // Maybe?
            }
            // Pandora free = .m4a
            else {
                fileExtension = ".m4a";
            }
            return {
                songName: $(".playerBarSong:first").text(),
                artist: $(".playerBarArtist:first").text(),
                album: $(".playerBarAlbum:first").text(),
                fileExtension: fileExtension,
                albumArtwork: albumArtwork
            };
        }
    });

});
