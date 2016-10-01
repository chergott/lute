$(document).ready(function () {
  $("#version").html(chrome.app.getDetails().version);

  // Get saved settings if any
  chrome.storage.sync.get(["themes","icon"], function (data) {
    var outside_color = data.icon["outside-color"];
    var border_color = data.icon["border-color"];
    $("#border-color").val(border_color);
    $("#outside-color").val(outside_color);
    if (data.themes["pandora-zero"] == true) {
      document.getElementById("pz_enabled").selected = "true";
    } else {
      document.getElementById("pz_disabled").selected = "true";
    }
    setIcon(75);
  });

  // Pandora ZERO Enabled/ Disabled
  $("#pz").change(function () {
    var pz_enabled = ($("#pz").val() === "true") ? true : false;
    var settings =
    chrome.storage.sync.set(
      {
        "themes": {
          "pandora-zero": pz_enabled
        }
      }, setStatus("Pandora ZERO is now " + (pz_enabled ? "enabled" : "disabled") + "."));
    });

    // Reset to Default Settings
    $("#reset").click(function () {
      chrome.storage.sync.clear(function () {
        chrome.storage.sync.set({
          "themes": {
            "pandora-zero": true
          },
          "icon": {
            "outside-color": "transparent",
            "border-color": "#9E9E9E"
          }
        }, function(){
          setIcon(75);
          setStatus("Lute settings have been reset.");
        });
        $("#pz").val("true");
        $("#outside-color").val("transparent");
        $("#border-color").val("#9E9E9E");
      });
    });

    $(".setting .color").keyup(function(){
      validateHex($(this));
    });

    $("#applyIcon").click(function(){
      applyIconColors();
    });

    $("#animateIcon").click(function(){
      animateIcon();
    });

    // applyIconColors
    function applyIconColors(){
      if( validateHex($("#outside-color")) && validateHex($("#border-color")) ) {
        chrome.storage.sync.set(
          {
            "icon": {
              "border-color": $("#border-color").val(),
              "outside-color": $("#outside-color").val()
            }
          }, function(){
            setStatus("Sick icon broski.");
            setIcon(75)
          });
        } else {
          setStatus("Invalid colors bro.");
          setIcon(0);
        }
      }

      // Validates inputs to only allow hexademical colors and transparenceny.
      function validateHex(input){
        input.removeClass("valid");
        input.removeClass("invalid");
        const txt = input.val();
        if( (/^(#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3}|transparent)$/i).test(txt) ){
          input.addClass("valid");
          return true;
        } else {
          input.addClass("invalid");
          return false;
        }
      }

      // Draws Lute Icon and returns the context
      function setIcon(angle){
        var canvas = document.getElementById("icon-canvas");
        var inside_color = $("#service-colors option:selected").val();
        // call drawIcon() from /js/drawIcon.js
        drawIcon(canvas, angle, inside_color);

      }

      function animateIcon() {
        var degrees = 0;
        var plusminus = 1;
        var animate = setInterval(function () {
          if (degrees === 90) {
            plusminus = -1;
          } else if (degrees === 0) {
            plusminus = 1;
          } else if(degrees === 75){
            clearInterval(animate);
          }
          degrees += plusminus;
          if (plusminus == 1) {
            console.log("Box opening at " + (degrees) + " degrees.");
          } else {
            console.log("Box closing at " + (degrees) + " degrees.");
          }
          /* Draw Canvas */
          setIcon(degrees, colors);
        }, 50);
      }

      // Status message at the top of the options page
      function setStatus(str) {
        var $status = $("#status");
        $status.fadeOut("fast", function () {
          $status.html(str);
          $status.fadeIn("fast");
        });
      }
    });
