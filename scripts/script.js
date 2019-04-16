var selectedElement;
var mapScrolled = false;
var sidebarScrolled = false;
var timer = null;
var beat = 0;
var time = 0;
var savedTime = 0;
var timeOffset;
var lastBeat;
var playing = false;
var beatSpeed = 10;
const updateTime = 1;
var beatBarLength = 1200;
var beatLength = 20;
var barHeight = 40;
var tracks = [];
var seeked = false;

class Track {
  constructor(args) {
    this.number = tracks.length;
    this.name = "track-" + ("" + this.number).padStart(3, "0");
    if (args.file) {
      this.file = args.file;
      this.fileName = args.fileName;
      this.fileURL = args.fileURL;
    }
    this.ready = false;
    this.start = 0;
    this.playing = false;
    tracks.push(this);
  }
  addTrackHeader(element) {
    this.trackHeader = element;
  }
  addTrackMap(element) {
    this.trackMap = element;
    this.waveform = element.getElementsByClassName("waveform")[0];
    if (this.file) {
      this.wavesurfer = WaveSurfer.create({
        container: this.waveform,
        height: element.getBoundingClientRect().height - 5,
        cursorWidth: 0,
        progressColor: "#999999",
        interact: false,
        fillParent: false,
        minPxPerSec: beatSpeed
      });
      this.wavesurfer.load(this.fileURL);
      this.wavesurfer.on("ready", () => {
        updateBeatNumbers(this.trackMap);
        this.ready = true;
        this.duration = this.wavesurfer.getDuration() * 1000;
        this.end = this.start + this.duration;
        this.waveform.style.width = this.waveform.getElementsByTagName("wave")[0].style.width;
      });
    }
    this.waveform.addEventListener("mousedown", event => {
      this.mouseDown(event);
      event.stopPropagation();
    });
    this.waveform.addEventListener("mousemove", event => {
      this.mouseMove(event);
      event.stopPropagation();
    });
    this.waveform.addEventListener("mouseup", event => {
      this.mouseUp(event);
      event.stopPropagation();
    });
    this.waveform.addEventListener("mouseleave", event => {
      this.mouseUp(event);
      event.stopPropagation();
    });
    this.waveform.addEventListener("click", event => {
      event.stopPropagation();
    });
  }
  mouseMove(event) {
    if (this.draggingTrack) {
      var deltaX = event.pageX - this.startPos;
      console.log(deltaX);
      this.start = this.lastStart + deltaX / beatSpeed * 1000;
      this.end = this.lastEnd + deltaX / beatSpeed * 1000;
      this.waveform.style.transform = "translateX(" + this.start / 1000 * beatSpeed + "px)";
    }
  }
  mouseUp(event) {
    this.draggingTrack = false;
  }
  mouseDown(event) {
    this.draggingTrack = true;
    this.startPos = event.pageX;
    this.lastStart = this.start;
    this.lastEnd = this.end;
    console.log("click track");
  }
  setMapWidth() {
    this.trackMap.style.width = beatBarLength + "px";
  }
  play() {
    if (this.wavesurfer) {
      if (this.start <= time && time <= this.end) {
        if (!this.playing) {
          this.wavesurfer.play();
          this.wavesurfer.seekTo(0);
          if (seeked) {
            this.wavesurfer.seekTo((time - this.start) / this.duration);
          }
        }
        this.playing = true;
      }
      if (time < this.start && time > this.end) {
        this.playing = false;
      }
    }
  }
  pause() {
    if (this.wavesurfer) {
      this.wavesurfer.pause();
      this.playing = false;
    }
  }
}

function initBeatNumbers() {
  var beatCanvas = document.getElementById("beatNumbers");
  var beatBar = document.getElementById("beatBar");
  beatCanvas.width = beatBarLength;
  beatCanvas.height = barHeight;
  var ctx = beatCanvas.getContext("2d");
  ctx.fillStyle = "#0e1e27";
  ctx.fillRect(0, 0, beatBarLength, barHeight);
  var currX = 0;
  var currY = 0;
  ctx.strokeStyle = "#c4c4c4";
  ctx.fillStyle = "#c4c4c4";
  ctx.font = "15px Arial";
  ctx.textAlign = "center";
  for (var beatTick = 1; beatTick < beatBarLength / beatLength; beatTick++) {
    currX += beatLength;
    currY = barHeight;
    ctx.moveTo(currX, currY);
    if (beatTick % 5 == 0)
      currY = 20;
    else
      currY = 35;
    ctx.lineTo(currX, currY);
    ctx.stroke();
    currY = 18;
    if (beatTick % 5 == 0)
      ctx.fillText(beatTick + "", currX, currY);
  }
}

function updateBeatNumbers(trackMap) {
  var length = trackMap.getElementsByClassName("waveform")[0].children[0].offsetWidth;
  console.log(length);
  if (length > beatBarLength) {
    beatBarLength = length * 2;
    var beatCanvas = document.getElementById("beatNumbers");
    var beatBar = document.getElementById("beatBar");
    var barHeight = beatBar.getBoundingClientRect().height;
    beatCanvas.width = beatBarLength;
    beatCanvas.height = barHeight;
    var ctx = beatCanvas.getContext("2d");
    ctx.fillStyle = "#0e1e27";
    ctx.fillRect(0, 0, beatBarLength, barHeight);
    var currX = 0;
    var currY = 0;
    ctx.strokeStyle = "#c4c4c4";
    ctx.fillStyle = "#c4c4c4";
    ctx.font = "15px Arial";
    ctx.textAlign = "center";
    for (var beatTick = 1; beatTick < beatBarLength / beatLength; beatTick++) {
      currX += beatLength;
      currY = barHeight;
      ctx.moveTo(currX, currY);
      if (beatTick % 5 == 0)
        currY = 20;
      else
        currY = 35;
      ctx.lineTo(currX, currY);
      ctx.stroke();
      currY = 18;
      if (beatTick % 5 == 0)
        ctx.fillText(beatTick + "", currX, currY);
    }
    var trackMapTemplate = document.getElementById("trackMapTemplate");
    trackMapTemplate.style.width = beatBarLength + "px";
    for (var track of tracks) {
      track.setMapWidth(beatBarLength);
    }
    var trackMapList = document.getElementById("trackMapList");
    trackMapList.style.width = beatBarLength + "px";
  }
}

function setup() {
  var addNewTrackButton = document.getElementById("addNewTrack");
  addNewTrackButton.addEventListener("click", selectTrackType);
  var songNameButton = document.getElementById("songName");
  var changeSongNameButton = songNameButton.getElementsByClassName("container")[0];
  changeSongNameButton.addEventListener("click", editSongName);
  var songNameInput = songNameButton.getElementsByClassName("edit-text")[0];
  songNameInput.addEventListener("keydown", changeSongName);
  var trackSidebar = document.getElementById("trackSidebar");
  var trackContainer = trackSidebar.getElementsByClassName("container")[0];
  var trackMap = document.getElementById("trackMaps");
  trackMap.addEventListener("click", trackMapClick);
  var trackMapContainer = trackMap.getElementsByClassName("container")[0];
  trackContainer.addEventListener("scroll", event => {
    if (mapScrolled) {
      mapScrolled = false;
      return;
    }
    trackMapContainer.scrollTop = event.target.scrollTop;
    sidebarScrolled = true;
  });
  trackMapContainer.addEventListener("scroll", event => {
    if (sidebarScrolled) {
      sidebarScrolled = false;
      return;
    }
    trackContainer.scrollTop = event.target.scrollTop;
    mapScrolled = true;
  });
  var trackTypeSelector = document.getElementById("trackTypeSelector");
  var closeTrackTypeSelector = trackTypeSelector.getElementsByClassName("close")[0];
  closeTrackTypeSelector.addEventListener("click", () => {
    trackTypeSelector.style.display = "none";
    event.stopPropagation();
  });
  var uploadedAudio = document.getElementById("uploadedAudio");
  uploadedAudio.addEventListener("change", uploadAudio);
  var playButton = document.getElementById("play");
  playButton.addEventListener("click", play);
  var pauseButton = document.getElementById("pause");
  pauseButton.addEventListener("click", pause);
  var backButton = document.getElementById("backward");
  backButton.addEventListener("click", backward);
  var forwardButton = document.getElementById("forward");
  forwardButton.addEventListener("click", forward);
  initBeatNumbers();
  var volumeSlider = document.getElementById("volumeSlider");
  var volume = document.getElementById("volume");
  volume.innerHTML = volumeSlider.value;
  volumeSlider.oninput = function() {
    volume.innerHTML = this.value;
  };
  var speedSlider = document.getElementById("speedSlider");
  var speed = document.getElementById("speed");
  speed.innerHTML = speedSlider.value;
  speedSlider.oninput = function() {
    speed.innerHTML = this.value;
  };
  var body = document.getElementById("body");
  body.addEventListener("click", deselect);
  body.style.display = "block";
}

function trackMapClick(event) {
  console.log("trackMaps click");
  seeked = true;
  var trackMaps = document.getElementById("trackMaps");
  var trackSidebar = document.getElementById("trackSidebar");
  var pos = trackMaps.scrollLeft + event.pageX - trackSidebar.getBoundingClientRect().width;
  var seekerHead = document.getElementById("seekerHead");
  var seekerLine = document.getElementById("seekerLine");
  seekerHead.style.transform = "translateX(" + pos + "px)";
  seekerLine.style.transform = "translateX(" + pos + "px)";
  time = pos / beatSpeed * 1000;
  beat = time / 1000 * beatSpeed;
  var minutes = document.getElementById("minutes");
  var seconds = document.getElementById("seconds");
  var numMinutes = parseInt(time / 60 / 1000);
  minutes.innerText = ("" + numMinutes).padStart(2, "0");
  var numSeconds = (time - numMinutes * 60 * 1000) / 1000;
  seconds.innerText = ("" + numSeconds.toFixed(1)).padStart(4, "0");
  if (playing) {
    pause();
    play();
  }
  else {
    pause();
  }
  event.stopPropagation();
}

function play() {
  if (playing) {
    return;
  }
  else {
    playing = true;
    timeOffset = Date.now();
    timer = setInterval(() => {
      time = savedTime + Date.now() - timeOffset + 0.0;
      var minutes = document.getElementById("minutes");
      var seconds = document.getElementById("seconds");
      var numMinutes = parseInt(time / 60 / 1000);
      minutes.innerText = ("" + numMinutes).padStart(2, "0");
      var numSeconds = (time - numMinutes * 60 * 1000) / 1000;
      seconds.innerText = ("" + numSeconds.toFixed(1)).padStart(4, "0");
      var seekerHead = document.getElementById("seekerHead");
      var seekerLine = document.getElementById("seekerLine");
      beat = time / 1000 * beatSpeed;
      seekerHead.style.transform = "translateX(" + beat + "px)";
      seekerLine.style.transform = "translateX(" + beat + "px)";
      for (var track of tracks) {
        track.play();
      }
      seeked = false;
    }, updateTime);
  }
  event.stopPropagation();
}

function pause() {
  clearInterval(timer);
  timer = null;
  playing = false;
  savedTime = time;
  for (var track of tracks) {
    track.pause();
  }
  event.stopPropagation();
}

function backward() {
  var trackMap = document.getElementById("trackMaps");
  trackMap.scrollLeft = 0;
  var seekerHead = document.getElementById("seekerHead");
  var seekerLine = document.getElementById("seekerLine");
  beat = 0;
  time = 0;
  savedTime = 0;
  timeOffset = Date.now();
  seekerHead.style.transform = "translateX(" + beat + "px)";
  seekerLine.style.transform = "translateX(" + beat + "px)";
  var minutes = document.getElementById("minutes");
  var seconds = document.getElementById("seconds");
  var numMinutes = parseInt(time / 60 / 1000);
  minutes.innerText = ("" + numMinutes).padStart(2, "0");
  var numSeconds = (time - numMinutes * 60 * 1000) / 1000;
  seconds.innerText = ("" + numSeconds.toFixed(1)).padStart(4, "0");
  event.stopPropagation();
}

function forward() {
  event.stopPropagation();
}

function deselect(event) {
  if (!selectedElement || selectedElement == "") {
    return;
  }
  var target = null;
  if (event.target) {
    target = $(event.target)[0];
  }
  if (selectedElement == "songName") {
    var songNameButton = document.getElementById("songName");
    var songNameInput = songNameButton.getElementsByClassName("edit-text")[0];
    if (target != songNameInput) {
      var songNameContainer = songNameButton.getElementsByClassName("container")[0];
      songNameContainer.style.display = "block";
      songNameInput.style.display = "none";
      selectedElement = "";
    }
    return;
  }
  if (selectedElement == "selectTrackType") {
    var trackTypeSelector = document.getElementById("trackTypeSelector");
    if (!target || (!trackTypeSelector.contains(target) && target != trackTypeSelector)) {
      trackTypeSelector.style.display = "none";
      selectedElement = "";
    }
    return;
  }
}

function selectTrackType(event) {
  var trackTypeSelector = document.getElementById("trackTypeSelector");
  trackTypeSelector.style.display = "block";
  selectedElement = "selectTrackType";
  event.stopPropagation();
}

function addNewTrack(newTrack) {
  var trackSidebar = document.getElementById("trackSidebar");
  var trackTemplate = document.getElementById("trackTemplate");
  var trackHeader = trackTemplate.cloneNode(true);
  trackHeader.id = newTrack.name;
  var trackName = trackHeader.getElementsByClassName("trackName")[0].getElementsByTagName("span")[0];
  trackName.innerText = newTrack.name;
  trackHeader.classList.remove("hidden");
  var trackList = document.getElementById("trackList");
  trackList.appendChild(trackHeader);
  newTrack.addTrackHeader(trackHeader);

  var trackMaps = document.getElementById("trackMaps");
  var trackMapTemplate = document.getElementById("trackMapTemplate");
  var trackMap = trackMapTemplate.cloneNode(true);
  trackMap.id = "";
  trackMap.classList.remove("invisible");
  var trackMapList = document.getElementById("trackMapList");
  trackMapList.appendChild(trackMap);
  newTrack.addTrackMap(trackMap);
  var trackContainer = trackSidebar.getElementsByClassName("container")[0];
  trackContainer.scrollTop = trackContainer.scrollHeight;
  deselect(selectedElement);
}

function uploadAudio() {
  var fileList = this.files;
  for (var file of fileList) {
    var fileURL = window.URL.createObjectURL(file);
    var fileName = file.name;
    var trackInfo = {
      file: file,
      fileName: fileName,
      fileURL: fileURL
    };
    var newTrack = new Track(trackInfo);
    addNewTrack(newTrack);
  }
  var uploadedAudio = document.getElementById("uploadedAudio");
  uploadedAudio.value = "";
}

function editSongName(event) {
  var songNameButton = document.getElementById("songName");
  var songNameContainer = songNameButton.getElementsByClassName("container")[0];
  songNameContainer.style.display = "none";
  var songNameInput = songNameButton.getElementsByClassName("edit-text")[0];
  songNameInput.style.display = "block";
  var songNameText = songNameContainer.getElementsByClassName("text")[0];
  songNameInput.value = songNameText.innerText.trim();
  songNameInput.focus();
  selectedElement = "songName";
  event.stopPropagation();
}

function changeSongName(event) {
  var key = event.key;
  if (key == "Enter") {
    var songNameButton = document.getElementById("songName");
    var songNameContainer = songNameButton.getElementsByClassName("container")[0];
    songNameContainer.style.display = "block";
    var songNameInput = songNameButton.getElementsByClassName("edit-text")[0];
    songNameInput.style.display = "none";
    var songNameText = songNameContainer.getElementsByClassName("text")[0];
    if (songNameInput.value != "") {
      songNameText.innerText = songNameInput.value.trim();
    }
    songNameInput.value = "";
    selectedElement = "";
  }
}

window.onload = setup;
