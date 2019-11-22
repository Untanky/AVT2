export default class AudioPlayer {

  _audioContext
  _audioDestination
  _audioBuffer
  _sourceNode
  _startedAt
  _pausedAt
  _isPlaying

  constructor(audioContext, audioDestination) {
    this._audioContext = audioContext;
    this._audioDestination = audioDestination;
    this._audioBuffer = null;
    this._sourceNode = null;
    this._startedAt = 0;
    this._pausedAt = 0;
    this._isPlaying = 0;
    this._gain = 50;
  }

  play() {
    let offset = this._pausedAt;

    this._sourceNode = this._audioContext.createBufferSource();
    this._sourceNode.buffer = this._audioBuffer;
    this._sourceNode.connect(this._audioDestination);
    this._sourceNode.start(0, offset);

    this._startedAt = this._audioContext.currentTime - offset;
    this._pausedAt = 0;
    this._isPlaying = true;
  }

  pause() {
    var elapsed = this._audioContext.currentTime - this._startedAt;
    this.stop();
    this._pausedAt = elapsed;
  }

  stop() {
    if (this._sourceNode) {
      this._sourceNode.disconnect();
      this._sourceNode.stop(0);
      this._sourceNode = null;
    }
    this._pausedAt = 0;
    this._startedAt = 0;
    this._isPlaying = false;
  }

  setAudioBuffer(audioBuffer) {
    this._audioBuffer = audioBuffer;
  }

  getIsPlaying() {
    return this._isPlaying;
  }

  getCurrentTime() {
    if (this._pausedAt) {
      return this._pausedAt;
    }
    if (this._startedAt) {
      return this._audioContext.currentTime - this._startedAt;
    }
    return 0;
  };

  getDuration() {
    return this.this._audioBuffer.duration;
  };
}