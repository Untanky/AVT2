const context = new (window.AudioContext || window.webkitAudioContext)();

const oscillator = context.createOscillator();
oscillator.type = 'square';
oscillator.frequency.value = 440;
oscillator.start();

const gain1 = context.createGain();

const analyser = context.createAnalyser();

// Reduce output level to not hurt your ears.
const gain2 = context.createGain();
gain2.gain.value = 0.01;

oscillator.connect(gain1);
gain1.connect(analyser);
analyser.connect(gain2);
gain2.connect(context.destination);

function displayNumber(id, value) {
  const meter = document.getElementById(id + '-level');
  const text = document.getElementById(id + '-level-text');
  text.textContent = value.toFixed(2);
  meter.value = isFinite(value) ? value : meter.min;
}

// Time domain samples are always provided with the count of
// fftSize even though there is no FFT involved.
// (Note that fftSize can only have particular values, not an
// arbitrary integer.)
analyser.fftSize = 2048;
const sampleBuffer = new Float32Array(analyser.fftSize);

function loop() {
  // Vary power of input to analyser. Linear in amplitude, so
  // nonlinear in dB power.
  gain1.gain.value = 0.5 * (1 + Math.sin(Date.now() / 4e2));

  analyser.getFloatTimeDomainData(sampleBuffer);

  // Compute average power over the interval.
  let sumOfSquares = 0;
  for (let i = 0; i < sampleBuffer.length; i++) {
    sumOfSquares += sampleBuffer[i] ** 2;
  }
  const avgPowerDecibels = 10 * Math.log10(sumOfSquares / sampleBuffer.length);
  
  // Compute peak instantaneous power over the interval.
  let peakInstantaneousPower = 0;
  for (let i = 0; i < sampleBuffer.length; i++) {
    const power = sampleBuffer[i] ** 2;
    peakInstantaneousPower = Math.max(power, peakInstantaneousPower);
  }
  const peakInstantaneousPowerDecibels = 10 * Math.log10(peakInstantaneousPower);
  
  // Note that you should then add or subtract as appropriate to
  // get the _reference level_ suitable for your application.
  
  // Display value.
  displayNumber('avg', avgPowerDecibels);
  displayNumber('inst', peakInstantaneousPowerDecibels);

  requestAnimationFrame(loop);
}
loop();