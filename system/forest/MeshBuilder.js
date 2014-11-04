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

    function generateVerticesForSegmentEndpoint(endpoint, normal, seed) {
        var result = [];
        var i, meshHelper = new MeshHelper();
        for (i = 0; i < seed.radialGenerationAccuracy; i++) {
            result.push(seed.meshPoint(endpoint, normal, i / seed.radialGenerationAccuracy, meshHelper));
        }

        return result;
    }

    function generateVerticesForSegment(segment, seed, fittingTerrain) {
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
                a: generateVerticesForSegmentEndpoint(structurePiece.a, normPrevious,  seed),
                b: generateVerticesForSegmentEndpoint(structurePiece.b, normNext, seed)
            });
        }

        var terrainSample, point, currentVertices, i;
        //  fit end vertices to terrain where appropriate (cheap fitting, should project along the vector until intersection with terrain)
        if (endVertices.length > 0) {
            //  First point in the segment
            point = segment.structure[0];
            terrainSample = fittingTerrain.getValue(point.x, point.z);
            currentVertices = endVertices[0].a;
            if (point.y - terrainSample < 0.1) {
                for (i = 0; i < currentVertices.length; i++) {
                    currentVertices[i].y = fittingTerrain.getValue(currentVertices[i].x, currentVertices[i].z) - 0.1;
                }
            }

            //  Last point in the segment
            point = segment.structure[segment.structure.length - 1];
            terrainSample = fittingTerrain.getValue(point.x, point.z);
            currentVertices = endVertices[endVertices.length - 1].b;
            if (point.y - terrainSample < 0.1) {
                for (i = 0; i < currentVertices.length; i++) {
                    currentVertices[i].y = fittingTerrain.getValue(currentVertices[i].x, currentVertices[i].z) - 0.1;
                }
            }
        }

        var vertices = [], currentMesh;
        for (structureIndex = 0; structureIndex < segment.structure.length - 1; structureIndex++) {
            currentMesh = triangulateExtrudedShape(endVertices[structureIndex].a, endVertices[structureIndex].b);

            for (i = 0; i < currentMesh.length; i++) {
                vertices.push(currentMesh[i]);
            }
        }

        return vertices;
    }





    
    function VegetationMeshBuilder() {

    }

    VegetationMeshBuilder.prototype.buildMeshForVegetation = function(vegetation, fittingTerrain) {
        var i, segmentMeshes = [];
        for (i = 0; i < vegetation.structureSegments.length; i++) {
            segmentMeshes.push(generateVerticesForSegment(vegetation.structureSegments[i], vegetation.seed, fittingTerrain));
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