/* Functionality */
//Refresh Button
var $refreshButton = $('<div id="refreshButton" style="cursor:pointer; color:#03A9F4; vertical-align:middle; font-size:12px; padding-right:8px"><svg xmlns="http://www.w3.org/2000/svg"  width="12" height="12" style="vertical-align:middle; fill:#03A9F4;" viewBox="0 0 24 24"><path d="M13.5 2C7.87 2 3.288 6.436 3.025 12H0l4.537 5.917L9 12H6.025c.26-3.902 3.508-7 7.475-7 4.136 0 7.5 3.364 7.5 7.5S17.636 20 13.5 20a7.483 7.483 0 0 1-5.876-2.854l-1.847 2.45A10.46 10.46 0 0 0 13.5 23C19.298 23 24 18.298 24 12.5S19.298 2 13.5 2z"/></svg><span style="vertical-align:middle; padding-left:2px;">Refresh Skips</span></div>');
$refreshButton.click(function(e) {
    e.preventDefault();
    $(".pauseButton").trigger("click");
    var jStorage = localStorage.getItem("jStorage");
    var obj = JSON.parse(jStorage);
    var count = 0;
    var MAX = 12;
    var info = "{";
    $.each(obj, function(i, item) {
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

/* Styling */
// Remove Top Bar
$(".top").remove();
// Remove Advertistments
$("#advertisement").remove();
$("#ad_container").remove();
$("#videoPlayerContainer").remove();
$("#promobox").remove();
$(".platformPromo").remove();

/* Custom Style */
var $contentnav = $(".contentnav");
$contentnav.addClass("columns");
$contentnav.append("<div class='leftcolumn'></div><div class='middlecolumn'></div><div class='rightcolumn'></div>");
$contentnav.insertAfter("#playerBar");
$contentnav.children(".leftcolumn").append($(".stationListHeader")).append($(".friends")).append($(".myprofile"));
$contentnav.children(".rightcolumn").append($refreshButton);
$("#main").css("top", "160px");
$(".adSupported-layout .contentContainer").css('float', 'none');
