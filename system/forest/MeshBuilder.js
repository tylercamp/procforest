/**
 * Created by tylercamp on 10/20/14.
 */

;(function() {

    "use strict";

    function triangulateExtrudedShape(end1, end2) {
        var i, triangles = [], rectangles = [], vertices = [];
        //  Turn end-cap pairs to rectangle strips
        for (i = 0; i < end1.length; i++) {
            rectangles.push({
                tl: end2[i], tr: end2[(i+1 === end1.length ? 0 : i+1)],
                bl: end1[i], br: end1[(i+1 === end1.length ? 0 : i+1)]
            });
        }

        //  Turn rectangles to triangles
        var currentRectangle;
        for (i = 0; i < rectangles.length; i++) {
            currentRectangle = rectangles[i];

            triangles.push({
                p1: currentRectangle.bl,
                p2: currentRectangle.br,
                p3: currentRectangle.tr
            });

            triangles.push({
                p1: currentRectangle.bl,
                p2: currentRectangle.tr,
                p3: currentRectangle.tl
            })
        }

        //  Turn triangles to points
        var currentTriangle;
        for (i = 0; i < triangles.length; i++) {
            currentTriangle = triangles[i];
            vertices.push(currentTriangle.p1.x);
            vertices.push(currentTriangle.p1.y);
            vertices.push(currentTriangle.p1.z);

            vertices.push(currentTriangle.p2.x);
            vertices.push(currentTriangle.p2.y);
            vertices.push(currentTriangle.p2.z);

            vertices.push(currentTriangle.p3.x);
            vertices.push(currentTriangle.p3.y);
            vertices.push(currentTriangle.p3.z);
        }

        return vertices;
    }

    function generateVerticesForSegment(segment, seed) {
        var structureIndex, structurePiece, normPrevious, normCurrent, normNext, endVertices = [];
        for (structureIndex = 0; structureIndex < segment.structure.length - 1; structureIndex++) {
            structurePiece = {
                a: segment.structure[structureIndex],
                b: segment.structure[structureIndex+1]
            };

            normCurrent = Math.normal(Math.vecDifference(structurePiece.b, structurePiece.a));
            if (structureIndex > 0)
                normPrevious = Math.normal(Math.vecDifference(segment.structure[structureIndex], segment.structure[structureIndex-1]));
            else
                normPrevious = normCurrent;

            if (structureIndex < segment.structure.length - 2)
                normNext = Math.normal(Math.vecDifference(segment.structure[structureIndex+2], segment.structure[structureIndex+1]));
            else
                normNext = normCurrent;

            normPrevious = Math.normal(Math.vecLerp(0.5, normPrevious, normCurrent));
            normNext = Math.normal(Math.vecLerp(0.5, normCurrent, normNext));

            endVertices.push({
                a: generateVerticesForSegmentEndpoint(structurePiece.a, normPrevious, seed),
                b: generateVerticesForSegmentEndpoint(structurePiece.b, normNext, seed)
            });
        }

        var vertices = [], currentMesh, i;
        for (structureIndex = 0; structureIndex < segment.structure.length - 1; structureIndex++) {
            currentMesh = triangulateExtrudedShape(endVertices[structureIndex].a, endVertices[structureIndex].b);

            for (i = 0; i < currentMesh.length; i++) {
                vertices.push(currentMesh[i]);
            }
        }

        return vertices;
    }

    function generateVerticesForSegmentEndpoint(endpoint, normal, seed) {
        var result = [], i, rotationMatrix, perpVector, currentPoint, angle;
        perpVector = Math.normal(Math.perpVector(normal));
        perpVector = new Vector4([perpVector.x, perpVector.y, perpVector.z, 1]);
        for (i = 0; i < seed.radialGenerationAccuracy; i++) {
            angle = i / seed.radialGenerationAccuracy * 360;
            rotationMatrix = new Matrix4().setRotate(angle, normal.x, normal.y, normal.z);
            currentPoint = rotationMatrix.multiplyVector4(perpVector);
            currentPoint = Math.normal({ x: currentPoint.elements[0], y: currentPoint.elements[1], z: currentPoint.elements[2] });
            currentPoint = Math.vecSum(Math.vecMultiply(currentPoint, 0.5), endpoint);

            result.push(currentPoint);
        }

        return result;
    }





    
    function VegetationMeshBuilder() {

    }

    VegetationMeshBuilder.prototype.buildMeshForVegetation = function(vegetation) {
        var i, segmentMeshes = [];
        for (i = 0; i < vegetation.structureSegments.length; i++) {
            segmentMeshes.push(generateVerticesForSegment(vegetation.structureSegments[i], vegetation.seed));
        }

        var j, currentMesh, compositeMesh = [];
        for (i = 0; i < segmentMeshes.length; i++) {
            currentMesh = segmentMeshes[i];
            for (j = 0; j < currentMesh.length; j++) {
                compositeMesh.push(currentMesh[j]);
            }
        }

        return {
            vertices: compositeMesh
        };
    };

    VegetationMeshBuilder.instance = new VegetationMeshBuilder();

    window.VegetationMeshBuilder = VegetationMeshBuilder;

})();