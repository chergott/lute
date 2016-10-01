$(document).ready(function () {

  // Pandora ZERO (includes the feature to refresh skip count)
  chrome.storage.sync.get("themes", function (data) {
    if(data.themes["pandora-zero"] == true){
      $.getScript(chrome.extension.getURL("themes/pandorazero.js"));
      console.log("Pandora ZERO is enabled");
    } else {
      console.log("Pandora ZERO is disabled. Go to Lute's Options page to enable.");
    }
  });

  // Download Button
  $("#playerBar, .contentnav").css("min-width", "980px");
  $(".leftcolumn, .rightcolumn, .buttons").css("width","330px");
  var $downloadButton = $('<div id="downloadButton" title="Download Track" style="float:left;margin:6px 0 0 19px;cursor:pointer;"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="36" fill="#FFF" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 128 128" enable-background="new 0 0 128 128" xml:space="preserve"><g><path d="M30.5,57.9c1.8,3.5,3.9,7.5,5.1,8.1c1.6,0.8,6,1.9,7.1,0.6c0.6,1.7,3.1,3.2,5,3.2h2.2c1.1,0,2-0.4,2.8-1.1	c0.7,0.7,1.6,1.1,2.6,1.1h2c1.4,0,2.7-0.8,3.3-2.1c0.1,0,0.2,0,0.4,0l2,23.1c0,2.3,1.4,4.3,2.9,4.3l1.6,0c2.3,0,3.1-1.8,3.1-4.1	l0.5-22.8l0.3-13.7c0,0,0-0.1,0-0.1c1.8-0.7,8.2-3.6,6.9-11.1c-1.5-8.7-18.1-17-18.1-17l0.1-10.9c-16-2.7-23.5,4.2-23.5,4.2 L36.5,25c0,0-2.4,7.9-5.2,10.7c-3,3-2.5,13.2-2.2,17.8C29.3,55,29.7,56.5,30.5,57.9z"/><polygon points="96.2,88.7 96.2,103.4 31.8,103.4 31.8,88.7 22.2,88.7 22.2,113.1 105.8,113.1 105.8,88.7 " /></g></svg></div>');
  $downloadButton.insertAfter('.skipButton');
  $downloadButton.click(function(e) {
    e.preventDefault();
    console.log("Finding audio track...");
    chrome.runtime.sendMessage(
      {
        "lute": {
          "action": "downloadAudio"
        }
      }
    );
    console.log("test");
  });

  // Send audio metaData when audio information is updated
  $('.playerBarAlbum:first').bind("DOMSubtreeModified", function () {
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
    chrome.runtime.sendMessage(
      {
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
