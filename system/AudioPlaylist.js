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
    }

    AudioPlaylist.prototype.addToQueue = function(rawEncodedAudio) {
        this._audioData.push(rawEncodedAudio);
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
        this._audioProcessor.setAudioData(this._audioData[newIndex], function() {
            setTimeout(function() {
                self._audioProcessor.playCurrentAudio(function () {
                    self.play();
                });
            }, Math.ceil(self.songChangeDelay * 1000));
        });

        this._lastAudioIndex = newIndex;
    };

    AudioPlaylist.prototype.pause = function() {
        console.log('AudioPlaylist.pause NYI');
    };

    window.AudioPlaylist = AudioPlaylist;

})();