var TileGenerator = (function () {
    function TileGenerator() {
    }
    var d = __define,c=TileGenerator;p=c.prototype;
    TileGenerator.generateGrid = function (width, height) {
        var gridMap = new TileGridMap();
        gridMap.newGrid(width, height);
        return gridMap;
    };
    TileGenerator.generateGround = function (gridMap, endY) {
        for (var y = 0; y < endY; ++y) {
            var avv = new Array();
            var value = 0;
        }
    };
    TileGenerator.generateBackground = function (gridMap, value) {
        if (value === void 0) { value = 1000; }
        for (var y = 0; y < gridMap.gridHeight; ++y) {
            var avv = new Array();
            for (var i = 0; i < gridMap.gridWidth; ++i) {
                avv.push(value);
            }
            gridMap.fillRow(y, avv);
        }
        return gridMap;
    };
    return TileGenerator;
})();
egret.registerClass(TileGenerator,"TileGenerator");
