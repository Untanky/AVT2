import AudioPlayer from './audioPlayer.js'

// Thresholds of the 3-band-equalizer
//
// Please use these variables for an 
// easier review on my part
const lowerBandThreshold = 320;
const higherBandThreshold = 2800;

/*
    INSERT YOUR CODE HERE
 */

const context = new AudioContext();

const fileInput = document.querySelector('#file-input');
const playButton = document.querySelector('#play-button');
const stopButton = document.querySelector('#stop-button');
const volumeSlider = document.querySelector('#volume-slider');
const lowSlider = document.querySelector('#low-slider');
const midSlider = document.querySelector('#mid-slider');
const highSlider = document.querySelector('#high-slider');
const canvas = document.querySelector("#canvas");
const canvasCtx = canvas.getContext("2d");

const analyser = context.createAnalyser();
analyser.fftSize = 2048;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
analyser.connect(context.destination);

const low = context.createBiquadFilter();
low.type = "lowshelf";
low.frequency.value = lowerBandThreshold;
low.gain.value = 0.0;
low.connect(analyser);

const mid = context.createBiquadFilter();
mid.type = "peaking";
mid.frequency.value = (higherBandThreshold + lowerBandThreshold) / 2;
mid.Q.value = 2;
mid.gain.value = 0.0;
mid.connect(low);

const high = context.createBiquadFilter();
high.type = "highshelf";
high.frequency.value = higherBandThreshold;
high.gain.value = 0.0;
high.connect(mid);

const gainNode = context.createGain();
gainNode.connect(high);

const audioPlayer = new AudioPlayer(context, gainNode);


fileInput.addEventListener("change", function() {
	var reader = new FileReader();
	reader.onload = function(ev) {
		context.decodeAudioData(ev.target.result, function(buffer) {
      audioPlayer.setAudioBuffer(buffer);
		});
	};
	reader.readAsArrayBuffer(this.files[0]);
}, false);

playButton.addEventListener("click", () => {
  if(audioPlayer.getIsPlaying())
    audioPlayer.pause();
  else
    audioPlayer.play();
});

stopButton.addEventListener("click", () => {
  audioPlayer.stop();
})

volumeSlider.addEventListener("input", () => {
  gainNode.gain.value = volumeSlider.value ** 2;
})

lowSlider.addEventListener("input", () => {
  low.gain.value = lowSlider.value;
})

midSlider.addEventListener("input", () => {
  mid.gain.value = midSlider.value;
})

highSlider.addEventListener("input", () => {
  high.gain.value = highSlider.value;
})

function draw() {
  var drawVisual = requestAnimationFrame(draw);

  analyser.getByteFrequencyData(dataArray);

  var buckets = [ 0, 0, 0];
  var index = 0;
  var frequency = 0;

  const STEP = 20000/2048;

  for(var i = 0; i < dataArray.length; i++) {
    const power = dataArray[i];
    buckets[index] = Math.max(power, buckets[index]);
    frequency += STEP
    if((index === 0 && frequency > lowerBandThreshold) || index === 1 && frequency < higherBandThreshold)
      index++;
  }

  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx.fillRect(0, 0, 400, 400);
  var barWidth = (400 / 3);
  var barHeight;

  var x = 0;for(var i = 0; i < buckets.length; i++) {
    barHeight = buckets[i]/2;

    canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
    canvasCtx.fillRect(x,400-barHeight,barWidth,barHeight);

    x += barWidth + 1;
  }
};

draw();