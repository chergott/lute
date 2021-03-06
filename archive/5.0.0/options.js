/* Decrapicated since 3/29/2017 */
$(document).ready(function () {
    $("#version").html(chrome.app.getDetails().version);

    // Get saved settings if any
    chrome.storage.sync.get(['themes', 'icon', 'luteCompile'], function (data) {
        $("#border-color").val(data.icon.borderColor);
        $("#outside-color").val(data.icon.outsideColor);
        $('#pandora-zero').val(data.themes.pandoraZero);
        $('#lute-compile').val(data.luteCompile);
        setIcon(75);
    });
    // Pandora ZERO enabled/ disabled
    $("#pandora-zero").change(function () {
        let $val = $(this).val();
        chrome.storage.sync.set({
            themes: {
                pandoraZero: $val
            }
        }, setStatus("Pandora ZERO is now " + $val + "."));
    });
    // Lute-Compile enabled/ disabled
    $("#lute-compile").change(function () {
        let $val = $(this).val();
        chrome.storage.sync.set({
            luteCompile: $val
        }, setStatus("Lute-Compile is now " + $val + "."));
    });

    // Reset to Default Settings
    $("#reset").click(function () {
        chrome.storage.sync.clear(function () {
            chrome.storage.sync.set({
                downloadMetadata: false,
                themes: {
                    pandoraZero: 'enabled'
                },
                luteCompile: 'disabled',
                icon: {
                    outsideColor: "transparent",
                    borderColor: "#9E9E9E"
                },
            }, function () {
                setStatus("Lute settings have been reset.");
                setIcon(75);
            });
            $("#outside-color").val("transparent");
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
        chrome.storage.sync.set({
            icon: {
                borderColor: $("#border-color").val(),
                outsideColor: $("#outside-color").val()
            }
        }, function () {
            setStatus("Sick icon broski.");
            setIcon(75)
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

    // Draws Lute Icon and returns the context
    function setIcon(angle) {
        var canvas = document.getElementById("icon-canvas");
        let colors = {
            inside: $("#service-colors option:selected").val(),
            outside: $('#outside-color').val(),
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