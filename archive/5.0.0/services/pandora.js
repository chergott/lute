function pandoraZEROTheme() {

    // Download Button
    var $downloadButton = $('<div id="downloadButton" title="Download Track" style="float:left;margin:6px 0 0 19px;cursor:pointer;"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="36" fill="#FFF" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 128 128" enable-background="new 0 0 128 128" xml:space="preserve"><g><path d="M30.5,57.9c1.8,3.5,3.9,7.5,5.1,8.1c1.6,0.8,6,1.9,7.1,0.6c0.6,1.7,3.1,3.2,5,3.2h2.2c1.1,0,2-0.4,2.8-1.1	c0.7,0.7,1.6,1.1,2.6,1.1h2c1.4,0,2.7-0.8,3.3-2.1c0.1,0,0.2,0,0.4,0l2,23.1c0,2.3,1.4,4.3,2.9,4.3l1.6,0c2.3,0,3.1-1.8,3.1-4.1	l0.5-22.8l0.3-13.7c0,0,0-0.1,0-0.1c1.8-0.7,8.2-3.6,6.9-11.1c-1.5-8.7-18.1-17-18.1-17l0.1-10.9c-16-2.7-23.5,4.2-23.5,4.2 L36.5,25c0,0-2.4,7.9-5.2,10.7c-3,3-2.5,13.2-2.2,17.8C29.3,55,29.7,56.5,30.5,57.9z"/><polygon points="96.2,88.7 96.2,103.4 31.8,103.4 31.8,88.7 22.2,88.7 22.2,113.1 105.8,113.1 105.8,88.7 " /></g></svg></div>');
    $downloadButton.click(function (e) {
        e.preventDefault();
        chrome.runtime.sendMessage({
            lute: {
                action: 'downloadAudioFile'
            }
        });
    });

    //Refresh Button
    var $refreshButton = $('<div id="refreshButton" style="float: right; padding: 4px 10px 0 0; cursor:pointer; fill: #d6deea;"><svg xmlns="http://www.w3.org/2000/svg"  width="14" height="14" style="vertical-align:middle;" viewBox="0 0 24 24"><path d="M13.5 2C7.87 2 3.288 6.436 3.025 12H0l4.537 5.917L9 12H6.025c.26-3.902 3.508-7 7.475-7 4.136 0 7.5 3.364 7.5 7.5S17.636 20 13.5 20a7.483 7.483 0 0 1-5.876-2.854l-1.847 2.45A10.46 10.46 0 0 0 13.5 23C19.298 23 24 18.298 24 12.5S19.298 2 13.5 2z"/></svg></div>');
    $refreshButton.click(function (e) {
        e.preventDefault();
        $(".pauseButton").trigger("click");
        var jStorage = localStorage.getItem("jStorage");
        var obj = JSON.parse(jStorage);
        var count = 0;
        var MAX = 12;
        var info = "{";
        $.each(obj, function (i, item) {
            if (count < MAX) {
                info += '"' + i + '":' + '"' + item + '"';
                if (count < (MAX - 1))
                    info += ",";
            }
            count++;
        });
        info += "}";
        localStorage.setItem("jStorage", info);
        location.reload();
    });

    $downloadButton.insertAfter('.skipButton');
    $refreshButton.insertAfter('.myprofile');

}