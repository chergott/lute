let lute = {};

$(document).ready(function () {
    $("#version").html(chrome.app.getDetails().version);

    // Get saved settings if any
    chrome.storage.sync.get(['colors', 'compile'], function (data) {
        $("#border-color").val(data.colors.border);
        $("#background-color").val(data.colors.background);
        $('#compile').val(data.luteCompile);
        // setIcon(75);
    });

    // Compile enabled/ disabled
    $("#compile").change(function () {
        let $val = $(this).val();
        chrome.storage.sync.set({
            compile: $val
        }, setStatus("Lute-Compile is now " + $val + "."));
    });

    // Reset to Default Settings
    $("#reset").click(function () {
        chrome.storage.sync.clear(function () {
            chrome.storage.sync.set({
                compile: false,
                colors: {
                    background: "transparent",
                    border: "#9E9E9E"
                },
            }, function () {
                setStatus("Lute settings have been reset.");
                // setIcon(75);
            });
            $("#background-color").val("transparent");
            $("#border-color").val("#9E9E9E");
            $("#pandora-zero").val("enabled");
            $('#lute-compile').val('disabled');
        });
    });

    $(".setting .color").keyup(function () {
        validateHex($(this));
    });

    $("#applyIcon").click(function () {
        if (hasValidColors()) {
            applyIconColors();
        }

    });

    $("#animateIcon").click(function () {
        if (hasValidColors()) {
            animateIcon();
        }

    });

    // applyIconColors
    function applyIconColors() {
        let colors = {
            border: $("#border-color").val(),
            background: $("#background-color").val()
        }
        chrome.storage.sync.set({
            colors
        }, function () {
            setStatus("Sick icon broski.");
            drawIcon(70, colors);
            // setIcon(75);
        });
    }

    // Validates inputs to only allow hexademical colors and transparenceny.
    function validateHex(input) {
        let $fieldset = $(input).parent('fieldset');
        $fieldset.removeClass("valid");
        $fieldset.removeClass("invalid");
        let inputText = input.val();
        if ((/^(#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3}|transparent)$/i).test(inputText)) {
            $fieldset.addClass("valid");
            return true;
        } else {
            $fieldset.addClass("invalid");
            return false;
        }
    }

    function hasValidColors() {
        let isValid = true;
        $("#icon-settings").find('fieldset').each(function () {
            let $fieldset = $(this);
            if ($fieldset.hasClass('invalid')) {
                isValid = false;
            }
        });
        return isValid;
    }

    function drawIcon(degrees, colors) {
        chrome.runtime.sendMessage({
            icon: {
                degrees,
                colors
            }
        }, function (response) {
            var canvas = document.getElementById("icon-canvas");
            let ctx = canvas.getContext("2d");
            let imageData = response.imageData;
            console.log('typeof ', typeof imageData);
            console.debug('imageData: ', imageData);
            ctx.putImageData(imageData);
        });
    }

    // Draws Lute Icon and returns the context
    function setIcon(angle) {
        
        let colors = {
            inside: $("#service-colors option:selected").val(),
            background: $('#background-color').val(),
            border: $('#border-color').val()
        };
        // call drawIcon() from /js/drawIcon.js
        drawIcon(angle, colors);
    }

    function animateIcon() {
        var degrees = 0;
        var plusminus = 1;
        var animate = setInterval(function () {
            if (degrees === 90) {
                plusminus = -1;
            } else if (degrees === 0) {
                plusminus = 1;
            } else if (degrees === 75) {
                clearInterval(animate);
            }
            degrees += plusminus;
            if (plusminus == 1) {
                console.log("Box opening at " + (degrees) + " degrees.");
            } else {
                console.log("Box closing at " + (degrees) + " degrees.");
            }
            /* Draw Canvas */
            setIcon(degrees);
        }, 10);
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