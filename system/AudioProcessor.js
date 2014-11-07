/**
 * Created by tylercamp on 10/25/14.
 */

;(function() {

    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
    // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API

    http://joshondesign.com/p/books/canvasdeepdive/chapter12.html

    "use strict";
    
    function AudioProcessor() {

    }

    AudioProcessor.prototype.init = function () {
        this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this._analyser = this._audioCtx.createAnalyser();
        this._playbackBuffer = null;
        this._currentDecodedBuffer = null;
        this._isLoading = false;
        this._isPlaying = false;

        //  Size of the FFT and size of the audio buffer
        this._analyser.fftSize = 1024;
        this._audioBuffer = new Float32Array(this._analyser.fftSize);

        this.amplitudeSmoothing = 6;
        this._amplitudeHistory = [];
    };

    AudioProcessor.prototype.setAudioData = function(rawAudioData, onComplete_) {
        var self = this;
        this._isLoading = true;
        this._audioCtx.decodeAudioData(rawAudioData, function(buffer) {
            self._currentDecodedBuffer = buffer;
            self._isLoading = false;
            if (onComplete_)
                onComplete_();
        });
    };

    AudioProcessor.prototype.playCurrentAudio = function(onAudioEnded_) {
        if (this._playbackBuffer !== null || this._isLoading || this._isPlaying)
            return;

        if (!this._currentDecodedBuffer) {
            console.log('AudioProcessor.playCurrentAudio - setAudioData must be called first');
        }

        //  Reset amplitude history for new audio
        this._amplitudeHistory = [];

        this._playbackBuffer = this._audioCtx.createBufferSource();
        this._playbackBuffer.buffer = this._currentDecodedBuffer;

        this._playbackBuffer.connect(this._audioCtx.destination);
        this._playbackBuffer.connect(this._analyser);

        this._playbackBuffer.start();
        this._playbackBuffer.onended = onAudioEnded_;
        this._isPlaying = true;
    };

    AudioProcessor.prototype.stopCurrentAudio = function() {
        if (this._playbackBuffer === null || !this._isPlaying)
            return;

        this._playbackBuffer.stop();
        this._playbackBuffer.disconnect(0);
        this._analyser.disconnect(0);

        this._playbackBuffer = null;
        this._isPlaying = false;
    };

    AudioProcessor.prototype.processCurrentWaveform = function() {
        var i, current, max = 0;

        //  Process new data
        this._analyser.getFloatTimeDomainData(this._audioBuffer);
        for (i = 0; i < this._audioBuffer.length; i++) {
            current = Math.abs(this._audioBuffer[i]);
            if (current > max)
                max = current;
        }

        this._amplitudeHistory.push(max);
        if (this._amplitudeHistory.length > this.amplitudeSmoothing)
            this._amplitudeHistory.splice(0, this._amplitudeHistory.length - this.amplitudeSmoothing);
    };

    AudioProcessor.prototype.calculateAverageAmplitude = function() {
        var i, sum = 0;

        if (this._audioBuffer === null || this._isLoading || !this._isPlaying)
            return 0;

        //  Returned averaged amplitude
        for (i = 0; i < this._amplitudeHistory.length; i++) {
            sum += this._amplitudeHistory[i];
        }

        return (sum / this._amplitudeHistory.length) || 0;
    };

    AudioProcessor.prototype.calculateWaveData = function() {
        var result = {
            fft: new Uint8Array(this._analyser.frequencyBinCount),
            wave: new Float32Array(this._analyser.fftSize),
            amplitude: null,
            smoothedAmplitude: null
        };

        this._analyser.getByteFrequencyData(result.fft);
        this._analyser.getFloatTimeDomainData(result.wave);

        result.smoothedAmplitude = this.calculateAverageAmplitude();
        if (this._amplitudeHistory.length)
            result.amplitude = this._amplitudeHistory[this._amplitudeHistory.length - 1];
        else
            result.amplitude = 0;

        return result;
    };

    window.AudioProcessor = AudioProcessor;

})();