/**
 * Created by tylercamp on 11/5/14.
 */

;(function() {

    "use strict";
    
    function AudioPlaylist(targetAudioProcessor) {
        this.randomize = true;
        this.songChangeDelay = 3.5; // seconds

        this._audioData = [];
        this._audioProcessor = targetAudioProcessor;
        this._lastAudioIndex = -1;

        this._audioStartListeners = [];
    }

    AudioPlaylist.prototype.addToQueue = function(rawEncodedAudio, name) {
        this._audioData.push({data: rawEncodedAudio, label: name});
    };

    AudioPlaylist.prototype.play = function() {
        var self = this;

        var newIndex = this._lastAudioIndex;
        if (this.randomize) {
            while (newIndex === this._lastAudioIndex && this._audioData.length > 1)
                newIndex = Math.floor(Math.random() * this._audioData.length);
        }
        else {
            newIndex = this._lastAudioIndex + 1;
            if (newIndex >= this._audioData.length)
                newIndex = 0;
        }

        this._audioProcessor.stopCurrentAudio();
        this._audioProcessor.setAudioData(this._audioData[newIndex].data, function() {
            setTimeout(function() {
                self._audioProcessor.playCurrentAudio(function () {
                    self.play();
                });

                self._audioStartListeners.forEach(function(listener) {
                    listener(self._audioData[newIndex].data, self._audioData[newIndex].label);
                });
            }, Math.ceil(self.songChangeDelay * 1000));
        });

        this._lastAudioIndex = newIndex;
    };

    AudioPlaylist.prototype.onAudioStart = function(listener) {
        this._audioStartListeners.push(listener);
    };

    AudioPlaylist.prototype.pause = function() {
        console.log('AudioPlaylist.pause NYI');
    };

    window.AudioPlaylist = AudioPlaylist;

})();