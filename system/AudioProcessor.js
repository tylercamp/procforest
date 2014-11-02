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
        this._playbackBuffer = this._audioCtx.createBufferSource();

        //  Size of the FFT and size of the audio buffer
        this._analyser.fftSize = 1024;
        this._audioBuffer = new Float32Array(this._analyser.fftSize);

        this._playbackBuffer.connect(this._audioCtx.destination);
        this._playbackBuffer.connect(this._analyser);

        this.amplitudeSmoothing = 5;
        this._amplitudeHistory = [];
    };

    AudioProcessor.prototype.setAudioData = function(rawAudioData, onComplete) {
        var self = this;
        this._audioCtx.decodeAudioData(rawAudioData, function(buffer) {
            self._playbackBuffer.buffer = buffer;
            onComplete();
        });
    };

    AudioProcessor.prototype.playCurrentAudio = function(onAudioEnded_) {
        this._playbackBuffer.start();
        this._playbackBuffer.onended = onAudioEnded_;
    };

    AudioProcessor.prototype.stopCurrentAudio = function() {
        this._playbackBuffer.stop();
        this._playbackBuffer.onended = null;
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
            this._amplitudeHistory.splice(0, 1);
    };

    AudioProcessor.prototype.calculateAverageAmplitude = function() {
        var i, sum = 0;

        //  Returned averaged amplitude
        for (i = 0; i < this._amplitudeHistory.length; i++) {
            sum += this._amplitudeHistory[i];
        }

        return (sum / this._amplitudeHistory.length) || 0;
    };

    window.AudioProcessor = AudioProcessor;

})();