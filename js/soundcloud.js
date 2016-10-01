// When title changes, send metaData.
var target = document.querySelector('head > title');
var observer = new window.WebKitMutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {

    // parse document.title into audio metaData
    const document_title = mutation.target.textContent;
    var isAudio = true;
    var songName = "", artist = "", album = "";

    if (document_title.indexOf("-") > -1) {
      var c_hyphen = document_title.indexOf("-");
      songName = document_title.substring(c_hyphen + 1);
      artist = document_title.substring(0, c_hyphen);
    } else if (document_title.indexOf(":") > -1) {
      var c_colon = document_title.indexOf(":");
      songName = document_title.substring(c_colon + 1);
      artist = document_title.substring(0, c_colon);
    } else songName = document_title;

    if (songName.indexOf(" by ") > -1) {
      var c_by = songName.indexOf(" by ");
      album = songName.substring(c_by + 4);
      songName = songName.substring(0, c_by);
    } else if (songName.indexOf(" in ") > -1) {
      var c_in = songName.indexOf(" in ");
      album = songName.substring(c_in + 4);
      songName = songName.substring(0, c_in);
    } else album = "unknown";

    if (artist == "") artist = album;

    if (artist.toUpperCase().indexOf("REMIX") > -1) {
      var tmp = artist;
      artist = songName;
      songName = tmp;
    }

    if(songName.indexOf("SoundCloud") > -1 || album.indexOf("SoundCloud") > -1 ){
      isAudio = false;
    }

    if(isAudio){
      // send metaData to luteBackground.js
      chrome.runtime.sendMessage(
        {
          "lute":  {
            "metaData": {
              "service": "soundcloud",
              "songName": songName.trim(),
              "artist": artist.trim(),
              "album": album.trim(),
              "serviceColor": "#ff3a00",
              "fileExtension": ".mp3"
            }
          }
        }
      );
    }
  });
});

observer.observe(target, { subtree: true, characterData: true, childList: true });
