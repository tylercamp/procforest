/**
 * Created by Tyler on 11/18/2014.
 *
 * Manages multiple grass renderer instances over a larger terrain
 *
 */

;(function() {

    "use strict";
    
    function GrassManager(patchSize, patchDensity) {
        this._grassRenderers = [];
        this._patchSize = patchSize;
        this._patchDensity = patchDensity;
    }

    GrassManager.prototype.generate = function(gl, terrain, grassTexture) {
        if (this._grassRenderers.length > 0)
            console.warn("Shouldn't call generate more than once on a GrassManager (untested)");

        var totalWidth = terrain.renderWidth(), totalLength = terrain.renderHeight();
        var patchGridSize = {
            x: Math.ceil(totalWidth) / this._patchSize,
            y: Math.ceil(totalLength) / this._patchSize
        };

        var y, x, newRenderer;
        for (y = 0; y < patchGridSize.y; y++) {
            totalWidth = terrain.renderWidth();
            for (x = 0; x < patchGridSize.x; x++) {
                newRenderer = new GrassRenderer(
                    {
                        x: x * this._patchSize,
                        y: y * this._patchSize
                    },
                    {
                        x: Math.min(totalWidth, this._patchSize),
                        y: Math.min(totalLength, this._patchSize)
                    }
                );
                newRenderer.generate(gl, terrain, this._patchDensity);
                newRenderer.setGrassTexture(grassTexture);

                totalWidth -= this._patchSize;

                this._grassRenderers.push(newRenderer);
            }

            totalLength -= this._patchSize;
        }
    };

    GrassManager.prototype.getVisiblePatches = function(position, viewDistance) {
        var result = [];
        var i, pos, size, dist;
        for (i = 0; i < this._grassRenderers.length; i++) {
            pos = this._grassRenderers[i].getPosition();
            size = this._grassRenderers[i].getSize();

            dist = Math.sqrt(Math.sqr(position.x - pos.x) + Math.sqr(position.z - pos.y));
            if (dist < viewDistance) {
                result.push(this._grassRenderers[i]);
                continue;
            }

            dist = Math.sqrt(Math.sqr(position.x - (pos.x + size.x)) + Math.sqr(position.z - pos.y));
            if (dist < viewDistance) {
                result.push(this._grassRenderers[i]);
                continue;
            }

            dist = Math.sqrt(Math.sqr(position.x - (pos.x + size.x)) + Math.sqr(position.z - (pos.y + size.y)));
            if (dist < viewDistance) {
                result.push(this._grassRenderers[i]);
                continue;
            }

            dist = Math.sqrt(Math.sqr(position.x - pos.x) + Math.sqr(position.z - (pos.y + size.y)));
            if (dist < viewDistance) {
                result.push(this._grassRenderers[i]);
            }
        }

        return result;
    };

    window.GrassManager = GrassManager;

})();