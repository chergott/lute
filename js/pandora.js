$(document).ready(function() {

    // Pandora ZERO (includes the feature to refresh skip count)
    chrome.storage.sync.get("themes", function(data) {
        if (data.themes["pandora-zero"] == true) {
            $.getScript(chrome.extension.getURL("themes/pandorazero.js"));
            console.debug("Pandora ZERO is enabled");
        } else {
            console.debug("Pandora ZERO is disabled. Go to Lute's Options page to enable.");
        }
    });



    // Send audio metaData when audio information is updated
    $('.playerBarAlbum:first').bind("DOMSubtreeModified", function() {
        var fileExtension;
        /*
        Pandora free = .m4a
        Pandora ZERO = .mp3
        */
        if ($(".logosubscriber").css("display") === "block") {
            fileExtension = ".mp3";
        } else if ($(".logobusiness").css("display") === "block") {
            fileExtension = ".mp3"; // Maybe?
        } else {
            fileExtension = ".m4a";
        }

        // send metaData to luteBackground.js
        chrome.runtime.sendMessage({
            "lute": {
                "metaData": {
                    "service": "pandora",
                    "songName": $(".playerBarSong:first").text(),
                    "artist": $(".playerBarArtist:first").text(),
                    "album": $(".playerBarAlbum:first").text(),
                    "albumArtwork": $(".playerBarArt").attr("src"),
                    "fileExtension": fileExtension
                }
            }
        });
    });
});
