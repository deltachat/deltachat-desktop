var socket = io("https://cloud13.de", { "path": '/p2p/socket.io' }); //Connect to socketIo even on subpaths

var localStream = null;

var constraints = { video: true, audio: true };

var webRTCConfig = {};

var pcs = {}; //Peer connections to all remotes

socket.on("connect", function () {
  socket.on("signaling", function (data) {
    var signalingData = data.signalingData;
    var fromSocketId = data.fromSocketId;
    if (!pcs[fromSocketId]) {
      createRemoteSocket(false, fromSocketId)
    }
    pcs[fromSocketId].signaling(signalingData);
  })

  socket.on("userJoined", function (userSocketId) {
    createRemoteSocket(true, userSocketId)
  })
});

//This is where the WEBRTC Magic happens!!!
function createRemoteSocket(initiator, socketId) {
  pcs[socketId] = new initEzWebRTC(initiator, webRTCConfig); //initiator
  pcs[socketId].on("signaling", function (data) {
    socket.emit("signaling", { destSocketId: socketId, signalingData: data })
  })
  pcs[socketId].on("stream", function (stream) {
    gotRemoteStream(stream, socketId)
  });
  pcs[socketId].on("closed", function (stream) {
    $("#" + socketId).remove();
    console.log("disconnected!");
  });
}

function joinRoom() {
  //Only join the room if local media is active!
  var roomname = getUrlParam("roomname", "unknown");
  socket.emit("joinRoom", roomname, function (newIceServers) {
    webRTCConfig["iceServers"] = newIceServers;
    console.log("got newIceServers", newIceServers)
  });
}

function gotRemoteStream(stream, socketId) {
  var videoTracks = stream.getVideoTracks();
  var audioTracks = stream.getAudioTracks();

  console.log("videoTracks", videoTracks)
  console.log("audioTracks", audioTracks)

  $("#" + socketId).remove();
  if (videoTracks.length >= 1 && audioTracks.length >= 1) {
    var div = $('<div" id="' + socketId + '"><span class="htext">REMOTE</span>' +
      '<video autoplay controls></video>' +
      '</div>')
    $("#remoteMedia").append(div)


    div.find("video")[0].srcObject = stream;
  } else {
    var div = $('<div style="padding-top:10px;" id="' + socketId + '"><span style="position: relative; top: -22px;">REMOTE: </span>' +
      '<audio autoplay controls></audio>' +
      '</div>')
    $("#remoteMedia").append(div)

    div.find("audio")[0].srcObject = stream;
  }
};

if (localStream) {
  joinRoom();
}

$("#startBtn").click(function () {
  var videoConstraints = $("#mediaSelect").val() == 1 ? { 'facingMode': "user" } : false;
  constraints = {
    video: videoConstraints,
    audio: { 'echoCancellation': true, 'noiseSuppression': true }
  };
  $("#start").remove();
  $("#container").show();
  initLocalMedia();
})

function initLocalMedia() {
  navigator.getUserMedia(constraints,
    function (stream) { //OnSuccess
      localStream = stream;
      webRTCConfig["stream"] = stream;
      console.log('getUserMedia success! Stream: ', stream);
      console.log('LocalStream', localStream.getVideoTracks());

      var videoTracks = localStream.getVideoTracks();
      var audioTracks = localStream.getAudioTracks();

      var mediaDiv = $('<div><span class="htext">LOCAL</span><video style="transform: scaleX(-1);" autoplay="true" muted></video></div>');
      mediaDiv.find("video")[0].srcObject = localStream;
      if (videoTracks.length == 0) {
        mediaDiv = $('<div style="padding-top:10px;"><span style="position: relative; top: -22px;">LOCAL: </span><audio autoplay controls muted></audio></div>');
        mediaDiv.find("audio")[0].srcObject = localStream;
      }

      $("#localMedia").append(mediaDiv)

      if (videoTracks.length > 0) {
        console.log('Using video device: ' + videoTracks[0].label);
      }
      if (audioTracks.length > 0) {
        console.log('Using audio device: ' + audioTracks[0].label);
      }

      joinRoom();
    },
    function (error) { //OnError
      alert("Could not get your Camera / Mic!")
      console.log('getUserMedia error! Got this error: ', error);
    }
  );
}

function getUrlParam(parameter, defaultvalue) {
  var urlparameter = defaultvalue;
  if (window.location.href.indexOf(parameter) > -1) {
    urlparameter = getUrlVars()[parameter];
  }
  return urlparameter;
}

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  return vars;
}