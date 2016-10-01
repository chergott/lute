/*
Pandora Known Audio Servers
- audio-sv3-t1-1-v4v6.pandora
- audio-sv3-t1-2-v4v6.pandora
- audio-sv5-t1-2-v4v6.pandora
- audio-dc6-t1-1-v4v6.pandora (One)
- audio-dc6-t2-1-v4v6.pandora (One)
- t1-2.p-cdn
- t1-1.p-cdn
- t2-1.p-cdn

SoundCloud Known Audio Servers
- cf-media.sndcdn
- ec-media.sndcdn
SoundCloud Chopped-Up Audio Servers
- cf-hls-media.sndcdn
- ec-hls-media.sndcdn

Known Issues:
SoundCloud and Google Music stream their audio files using multiple smaller files of the audio file.
An additional step of combining all the files together would fix this but requires server processing that javascript cannot handle.
This optimizes load time times and has a greater security for their media files.

Future Services:
Grooveshark, Google Music

Why future? The above services only use "chopped-up" files (a compilation .xhr files).
The fix would need to combine multiple .xhr files into one .mp3 which requires more server power than a chrome extension can allow.
*/
log("Lute " + chrome.app.getDetails().version + " has started.", 1);
log("Legend [ '-': General, '*': Media, '!': Important ]\n- Refresh Pandora or SoundCloud to get started.",1);

var audioFound = {};
var downloadReady = false;

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "loading") {
    let url = tab.url;
    let isPandora = url.match(/pandora.com/);
    let isSoundCloud = url.match(/soundcloud.com/);
    // Pandora
    if (isPandora) {
      const PANDORA_MEDIA_URLS = ["http://*.pandora.com/*", "*://*.p-cdn/*"];
      startLuteService({ name: "pandora", servers: PANDORA_MEDIA_URLS, tabId: tabId });
    }
    //SoundCloud
    else if (isSoundCloud) {
      const SOUNDCLOUD_MEDIA_URLS = ["*://*.sndcdn.com/*"];
      startLuteService({ name: "soundcloud", servers: SOUNDCLOUD_MEDIA_URLS, tabId: tabId });
    }
  }
  return;
});

chrome.tabs.onRemoved.addListener(function (tabId) {
  if(tabId == audioFound.tabId){
    resetDownload();
    log("The tab that Lute was listening to was closed.", 1 );
  }
});

function startLuteService(service) {
  log("Request listener started for service '" + service.name + "' on tabId " + service.tabId+'.', 1);
  chrome.webRequest.onBeforeRequest.addListener(serviceRequestListener, { urls: service.servers, tabId: service.tabId }, ["blocking"]);
  chrome.browserAction.setTitle({ title: "Lute is listening to" + service.name + '.' });
  resetDownload();
  return true;
}

function serviceRequestListener(request) {
  //log("Request from tabId " + request.tabId + ": " + JSON.stringify(request),1);

  var url = request.url;

  // !! SoundCloud chopped-up media files
  if (url.indexOf("-hls-media.sndcdn") > -1) {
    log("Chopped Up audio file received from tabId " + request.tabId + ": " + JSON.stringify(request), 3);
    resetDownload();
  }
  // Pandora = audio- or .p-cdn
  // SoundCloud = media.sndcdn
  else if (url.indexOf("audio-") > -1 || url.indexOf(".p-cdn") > -1 || url.indexOf("media.sndcdn") > -1) {
    log("Audio file captured"+JSON.stringify(request), 2);
    audioFound = { "url": url, "tabId": request.tabId };
  }
  return;
}

function validateMetaData(metaData) {
  const DEFAULT_PROPERTIES = {
    "service": "unknown",
    "songName": "unknown",
    "artist": "unknown",
    "fileExtension": ".mp3",
    "album": "unknown",
    "albumArtwork": "unknown.jpg"
  };
  // If specific metaData information is missing, use the default property
  for (var prop in DEFAULT_PROPERTIES) {
    if (metaData.hasOwnProperty(prop)) {
      audioFound[prop] = metaData[prop];
    } else{
      audioFound[prop] = DEFAULT_PROPERTIES[prop];
      log("MetaData doesn't contain the property '" + prop + "' and will use the default value '"+DEFAULT_PROPERTIES[prop]+"'", 1);
    }
  }
  audioFound.fileName = (audioFound.artist + "-" + audioFound.songName + audioFound.fileExtension).replace(/^[\\\/:?:<>|]/gi, '');
  chrome.browserAction.setTitle({ title: audioFound.fileName });

  if(audioFound.service == "pandora"){
    chrome.browserAction.setBadgeBackgroundColor({"color":"#369"});
  } else if (audioFound.service == "soundcloud"){
    chrome.browserAction.setBadgeBackgroundColor({"color":"#f70"});
  } else {
    chrome.browserAction.setBadgeBackgroundColor({"color":"#009688"});
  }

  chrome.browserAction.setBadgeText({ text: "1" });

  log(audioFound.fileName + " is ready to download.", 2);
  downloadReady = true;
  setIcon(75);
}

// resetDownload
function resetDownload() {
  if(downloadReady = true){
    audioFound = {};
    chrome.browserAction.setBadgeText({ text: "" });
    chrome.browserAction.setTitle({ title: "Waiting for an audio track." });
    setIcon(0);
    downloadReady = false;
  }
  return;
}

// downloadAudio
function downloadAudio(){
  if (downloadReady) {
    log("Downloading audio: "+JSON.stringify(audioFound),3);
    chrome.downloads.download({
      url: audioFound.url,
      filename: audioFound.fileName
    });
  } else {
    log("Download is not ready.",3);
    chrome.browserAction.setBadgeText({ text: "" });
    chrome.browserAction.setTitle({ title: "Download is not ready." });
  }
}

function log(msg, lvl) {
  // '-': General, '*': Media, '!': Important
  var type = '-';
  if (lvl == 3)
  type = '!!!\t';
  else if (lvl == 2)
  type = '* '
  else
  type = '- '
  console.log(type + msg);
  return;
}

/* Extension Icon clicked */
chrome.browserAction.onClicked.addListener(function () {
  downloadAudio();
  return;
});

/* Message passing from Content Scripts */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (!request.hasOwnProperty("lute")) return;
  log("Message received: " + JSON.stringify(request.lute), 2);

  /* Message Actions */
  var action = request.lute.action;
  // downloadAudio
  if (action === "downloadAudio"){
    downloadAudio();
  }
  /* Message Meta Data */
  if (request.lute.metaData){
    validateMetaData(request.lute.metaData);
  }
  return;
});

chrome.runtime.onInstalled.addListener(function (details) {
  setIcon(0);
  chrome.storage.sync.set({
    "themes": {
      "pandora-zero": true
    },
    "icon": {
      "outside-color": "transparent",
      "border-color": "#9E9E9E"
    }
  });
  return;
});

/************************************************************************/
/********************************** LUTE ICON **************************/
/************************************************************************/
/* Draw Icon */
function setIcon(angle) {
  var tmpCanvas = document.createElement("canvas");
  tmpCanvas.height = 180;
  tmpCanvas.width = 180;

  var ctx = tmpCanvas.getContext("2d");

  const CANVAS_LENGTH = tmpCanvas.height;
  const PADDING = CANVAS_LENGTH * .05;
  const ICON_LENGTH = CANVAS_LENGTH - 2*PADDING;
  const THETA = angle;
  const THICKNESS = 4;

  // Horizontal percentages determined for fX, sX, and lX respectively
  // X1 + X2 + X3 = 1
  const X1 = .60;
  const X2 = .30;
  const X3 = 1-X1-X2;
  // Vertical percentages determined for fY, sY, and BOX_HEIGHT
  // Y1 + Y2 + 2 * Y3 = 1
  const Y1 = .18;
  const Y2 = .10;
  const Y3 = (1-Y1-Y2) / 2;
  /*
  For the horizontal line...

  Let P = PADDING, fX = horizontal line below BOX_LENGTH,
  sX = horizontal line below BOX_WIDTH, lX = lid at 90 degrees,
  CANVAS_LENGTH = The canvas width & height since it's a square

  CANVAS_LENGTH = P + (ICON_LENGTH * p1) + (ICON_LENGTH * p2) + (ICON_LENGTH * p3) + P
  CANVAS_LENGTH = P + fX + sX + lX + P

  */
  const fX = ICON_LENGTH * X1;
  const sX = ICON_LENGTH * X2;
  const LID_HEIGHT = ICON_LENGTH * X3;

  /*
  For the vertical line...
  CANVAS_LENGTH = P + fY + BOX_HEIGHT + sY + BOX_WIDTH + P

  solve for BOX_HEIGHT...
  BOX_HEIGHT = ICON_LENGTH - fY - sY - BOX_WIDTH
  */
  const fY = ICON_LENGTH * Y1;
  const sY = ICON_LENGTH * Y2;
  const BOX_HEIGHT = ICON_LENGTH * Y3;

  const BOX_LENGTH = Math.sqrt(Math.pow(fX, 2) + Math.pow(fY, 2));
  const BOX_WIDTH = Math.sqrt(Math.pow(sX, 2) + Math.pow(sY, 2));



  /*
  1. Base: Bottom section of Lute, doesn't depend on 'theta'
  2. Lid: Top section of Lute which rotates based on 'theta'
  */
  /*  1. Base  */
  // Base Front
  var baseFront = {
    p1 : {
      x : PADDING,
      y : CANVAS_LENGTH - PADDING - fY - BOX_HEIGHT
    },
    p2 : {
      x : PADDING,
      y : CANVAS_LENGTH - PADDING - fY
    },
    p3 : {
      x : PADDING + fX,
      y : CANVAS_LENGTH - PADDING
    },
    p4 : {
      x : PADDING + fX,
      y : CANVAS_LENGTH - PADDING  - BOX_HEIGHT
    }
  };
  // Base Inside
  var baseInside = {
    p1 : {
      x : PADDING + sX,
      y : CANVAS_LENGTH - PADDING - fY - sY - BOX_HEIGHT
    },
    p2 : {
      x : PADDING,
      y : CANVAS_LENGTH - PADDING - fY - BOX_HEIGHT
    },
    p3 : {
      x : PADDING + fX,
      y : CANVAS_LENGTH - PADDING - BOX_HEIGHT
    },
    p4 : {
      x : PADDING + fX + sX,
      y : CANVAS_LENGTH - PADDING - sY - BOX_HEIGHT
    }
  };
  // Base Side
  var baseSide = {
    p1 : {
      x : PADDING + fX,
      y : CANVAS_LENGTH - PADDING - BOX_HEIGHT
    },
    p2 : {
      x : PADDING + fX,
      y : CANVAS_LENGTH - PADDING
    },
    p3 : {
      x : PADDING + fX + sX,
      y : CANVAS_LENGTH - PADDING - sY
    },
    p4 : {
      x : PADDING + fX + sX,
      y : CANVAS_LENGTH - PADDING - sY - BOX_HEIGHT
    }
  };

  /*  2. Lid  */
  // Lid Side Right
  var lidSideR = {
    p3 : {
      x : PADDING + fX + sX,
      y : CANVAS_LENGTH - PADDING - sY - BOX_HEIGHT
    }
  };
  lidSideR.p1 = rotatePoint({
    x : lidSideR.p3.x,
    y : lidSideR.p3.y
  }, {
    x : PADDING + fX,
    y : CANVAS_LENGTH - PADDING - BOX_HEIGHT - LID_HEIGHT
  });
  lidSideR.p2 = rotatePoint({
    x : lidSideR.p3.x,
    y : lidSideR.p3.y
  }, {
    x : PADDING + fX,
    y : CANVAS_LENGTH - PADDING - BOX_HEIGHT
  });
  lidSideR.p4 = rotatePoint({
    x : lidSideR.p3.x,
    y : lidSideR.p3.y
  }, {
    x : PADDING + fX + sX,
    y : CANVAS_LENGTH - PADDING - sY - BOX_HEIGHT - LID_HEIGHT
  });
  // Lid Side Left
  var lidSideL = {
    p3 : {
      x : PADDING + sX,
      y : CANVAS_LENGTH - PADDING - fY - BOX_HEIGHT - sY
    }
  };
  lidSideL.p1 = rotatePoint({
    x : lidSideL.p3.x,
    y : lidSideL.p3.y
  }, {
    x : PADDING,
    y : CANVAS_LENGTH - PADDING - fY - BOX_HEIGHT - LID_HEIGHT
  });
  lidSideL.p2 = rotatePoint({
    x : lidSideL.p3.x,
    y : lidSideL.p3.y
  }, {
    x : PADDING,
    y : CANVAS_LENGTH - PADDING - fY - BOX_HEIGHT
  });
  lidSideL.p4 = rotatePoint({
    x : lidSideL.p3.x,
    y : lidSideL.p3.y
  }, {
    x : PADDING + sX,
    y : CANVAS_LENGTH - PADDING - fY - sY - BOX_HEIGHT - LID_HEIGHT
  });
  // Lid Side Center
  var lidSideC = {
    p1 : getCenterPoint(lidSideL.p1, lidSideR.p1),
    p2 : getCenterPoint(lidSideL.p2, lidSideR.p2),
    p3 : getCenterPoint(lidSideL.p3, lidSideR.p3),
    p4 : getCenterPoint(lidSideL.p4, lidSideR.p4)
  };
  // Lid Front
  var lidFront = {
    p1: lidSideL.p1,
    p2: lidSideL.p2,
    p3: lidSideR.p2,
    p4: lidSideR.p1
  };
  // Lid Top
  var lidTop = {
    p1 : {
      x : PADDING + sX,
      y : CANVAS_LENGTH - PADDING - fY - sY - BOX_HEIGHT - LID_HEIGHT
    },
    p2 : lidSideL.p1,
    p3 : lidSideR.p1,
    p4 : lidSideR.p4
  };
  // Lid Inside
  var lidInside = {
    p1 : lidSideL.p2,
    p2 : lidSideL.p3,
    p3 : lidSideR.p3,
    p4 : lidSideR.p2
  };

  chrome.storage.sync.get("icon", function (data) {
    var colors = {
      "outside": data.icon["outside-color"],
      "border": data.icon["border-color"]
    };

    if(audioFound.service === "pandora"){
      colors.inside = "#369";
    } else if(audioFound.service === "soundcloud"){
      colors.inside = "#f70";
    }

    const INSIDE_ATTRIBUTES = {
      fillStyle: colors.inside,
      strokeStyle: colors.border
    }
    const OUTSIDE_ATTRIBUTES = {
      fillStyle: colors.outside,
      strokeStyle: colors.border
    }

    // Angle at which box fills with LUTE_COLOR and lidTop shouldn't show
    const BRIGHT_ANGLE = 38;

    /* Draw Order */
    ctx.lineWidth=1;
    if(THETA > BRIGHT_ANGLE){
      drawParallelogram(baseInside, INSIDE_ATTRIBUTES);
    } else {
      drawParallelogram(baseInside, OUTSIDE_ATTRIBUTES);
    }
    ctx.lineWidth=THICKNESS;
    drawParallelogram(baseSide, OUTSIDE_ATTRIBUTES);
    drawParallelogram(baseFront, OUTSIDE_ATTRIBUTES);
    ctx.lineWidth=THICKNESS;
    if(THETA > BRIGHT_ANGLE) {
      const NOTE_COLOR = "#E0E0E0";
      drawParallelogram(lidInside, INSIDE_ATTRIBUTES);
      drawMusicNote(NOTE_COLOR);
    } else{
      drawParallelogram(lidTop, OUTSIDE_ATTRIBUTES);
    }
    ctx.lineWidth=THICKNESS;
    drawParallelogram(lidFront, OUTSIDE_ATTRIBUTES);
    drawParallelogram(lidSideR, OUTSIDE_ATTRIBUTES);

    // set Extension Icon
    chrome.browserAction.setIcon({
      imageData: ctx.getImageData(0,0,180,180)
    });
  });

  function drawMusicNote(color){
    /* Music Note
    1. Music Note Outline
    2. Music Note Circles on outline legs (two)
    */
    const NOTE_WIDTH = ICON_LENGTH * .1;
    const NOTE_HEIGHT = ICON_LENGTH * .1;
    const NOTE_THICKNESS = NOTE_WIDTH * .3;
    const CIRCLE_RADIUS = NOTE_HEIGHT * .3;
    //const NOTE_STROKE = "#0F0";
    ctx.fillStyle = color;

    var musicNoteOutline = {};
    musicNoteOutline.p1 = {
      x: ICON_LENGTH/2 - NOTE_WIDTH/5,
      y: ICON_LENGTH/2 - NOTE_HEIGHT,
    };
    musicNoteOutline.p2 = {
      x: musicNoteOutline.p1.x,
      y: musicNoteOutline.p1.y + NOTE_HEIGHT
    };
    musicNoteOutline.p3 ={
      x: musicNoteOutline.p1.x + NOTE_THICKNESS*.4,
      y: musicNoteOutline.p2.y
    };
    musicNoteOutline.p4 = {
      x: musicNoteOutline.p3.x,
      y: musicNoteOutline.p1.y + NOTE_THICKNESS
    };
    musicNoteOutline.p5 = {
      x: musicNoteOutline.p1.x + NOTE_WIDTH,
      y: musicNoteOutline.p4.y
    };
    musicNoteOutline.p6 = {
      x: musicNoteOutline.p5.x,
      y: musicNoteOutline.p3.y
    };
    musicNoteOutline.p7 ={
      x: musicNoteOutline.p5.x + NOTE_THICKNESS*.4,
      y: musicNoteOutline.p2.y
    };
    musicNoteOutline.p8 = {
      x: musicNoteOutline.p7.x,
      y: musicNoteOutline.p1.y
    };
    /* Draw Order */
    ctx.beginPath();
    ctx.arc(musicNoteOutline.p3.x - CIRCLE_RADIUS,musicNoteOutline.p3.y,CIRCLE_RADIUS,0,2*Math.PI);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(musicNoteOutline.p7.x - CIRCLE_RADIUS,musicNoteOutline.p7.y,CIRCLE_RADIUS,0,2*Math.PI);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(musicNoteOutline.p1.x, musicNoteOutline.p1.y);
    ctx.lineTo(musicNoteOutline.p2.x, musicNoteOutline.p2.y);
    ctx.lineTo(musicNoteOutline.p3.x, musicNoteOutline.p3.y);
    ctx.lineTo(musicNoteOutline.p4.x, musicNoteOutline.p4.y);
    ctx.lineTo(musicNoteOutline.p5.x, musicNoteOutline.p5.y);
    ctx.lineTo(musicNoteOutline.p6.x, musicNoteOutline.p6.y);
    ctx.lineTo(musicNoteOutline.p7.x, musicNoteOutline.p7.y);
    ctx.lineTo(musicNoteOutline.p8.x, musicNoteOutline.p8.y);
    ctx.closePath();
    ctx.fill();
  }
  function drawParallelogram(parallelogram, attr) {
    ctx.beginPath();
    ctx.moveTo(parallelogram.p1.x, parallelogram.p1.y);
    ctx.lineTo(parallelogram.p2.x, parallelogram.p2.y);
    ctx.lineTo(parallelogram.p3.x, parallelogram.p3.y);
    ctx.lineTo(parallelogram.p4.x, parallelogram.p4.y);
    ctx.closePath();
    if (attr) {
      if (attr.hasOwnProperty("strokeStyle")) {
        ctx.strokeStyle = attr.strokeStyle;
        ctx.stroke();
      }
      if (attr.hasOwnProperty("fillStyle")) {
        ctx.fillStyle = attr.fillStyle;
        ctx.fill();
      }
    }
  }
  // rotatePoint
  function rotatePoint(origin, p) {
    const radians = Math.PI * THETA / 180;
    return {
      x : Math.cos(radians) * (p.x - origin.x) - Math.sin(radians) * (p.y - origin.y) + origin.x,
      y : Math.sin(radians) * (p.x - origin.x) + Math.cos(radians) * (p.y - origin.y) + origin.y
    };
  }
  /**
  * getCenterPoint
  * @param p1 point 1
  * @param p2 point 2
  * @return the center point between p1 and p2
  */
  function getCenterPoint(p1, p2) {
    return {
      x : (p1.x + p2.x) / 2,
      y : (p1.y + p2.y) / 2
    }
  }
}

/* Animate */
function animateLuteIcon(canvas, startAngle, endAngle, colors) {
  var plusminus = 1, degrees = startAngle;
  if(startAngle > endAngle){
    plusminus = -1;
  }
  var animate = setTimeout(function () {
    if(degrees === endAngle){
      clearTimeout(animate);
    } else{
      degrees += plusminus;
      drawLuteIcon(canvas, degrees, colors);
      console.log("Box is at " + (degrees) + " degrees.");
    }
  }, 50);
}
