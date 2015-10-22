var TileGridMap = (function (_super) {
    __extends(TileGridMap, _super);
    function TileGridMap() {
        _super.call(this);
        this._allTileRow = [];
        this._gridsWidth = GRID_WIDTH_MAX;
        this._gridsHeight = GRID_HEIGHT_MAX;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=TileGridMap;p=c.prototype;
    p.onAddToStage = function (evtTarget) {
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    };
    p.newGrid = function (width, height) {
        this._allTileRow = new Array();
        this._gridsWidth = Math.min(width, GRID_WIDTH_MAX);
        this._gridsHeight = Math.min(height, GRID_HEIGHT_MAX);
        for (var yy = 0; yy < this._gridsHeight; ++yy) {
            var tileRow = new TileRow();
            tileRow.createTile(this._gridsWidth);
            this._allTileRow.push(tileRow);
            this.addChild(tileRow);
        }
    };
    p.createUsedMaxGrid = function () {
        this.newGrid(GRID_WIDTH_MAX, GRID_HEIGHT_MAX);
    };
    p.appendRow = function (value) {
        var tileRow = new TileRow();
        tileRow.createTile(value.length);
        tileRow.fillTile(0, value);
        tileRow.adjustAllTilePos();
        tileRow.y = this._gridsHeight * TILE_CELL_HEIGHT;
        this._allTileRow.push(tileRow);
        this._gridsHeight++;
    };
    p.fillRow = function (row, value) {
        if (row < this._gridsHeight) {
            var tileRow = this._allTileRow[row];
            tileRow.fillTile(0, value);
            return true;
        }
        return false;
    };
    p.adjustAllRowPos = function (offY) {
        if (offY === void 0) { offY = 0; }
        for (var i = 0; i < this._gridsHeight; ++i) {
            var tileRow = this._allTileRow[i];
            tileRow.y = i * TILE_CELL_HEIGHT + offY;
            tileRow.x = 0;
            tileRow.adjustAllTilePos();
        }
    };
    p.getHitRow = function (stageX, stageY) {
        if (this.hitTestPoint(stageX, stageY, true)) {
            for (var i = 0; i < this._gridsHeight; ++i) {
                var tileRow = this._allTileRow[i];
                if (tileRow.hitTestPoint(stageX, stageY, true)) {
                    return i;
                }
            }
        }
        return -1;
    };
    p.getHitCell = function (stageX, stageY) {
        // 需要优化
        if (this.hitTestPoint(stageX, stageY, true)) {
            for (var i = 0; i < this._gridsHeight; ++i) {
                var tileRow = this._allTileRow[i];
                if (tileRow.hitTestPoint(stageX, stageY, true)) {
                    var tileCells = tileRow.cell;
                    for (var j = 0; j < tileCells.length; ++j) {
                        //if (!tileCells[j].isZero && tileCells[j].hitTestPoint(stageX,stageY,true)){
                        if (tileCells[j].hitTestPoint(stageX, stageY, true)) {
                            return { cell: tileCells[j], col: j, row: i };
                        }
                    }
                }
            }
        }
        //console.info("getHitCell failed");
        return { cell: null };
    };
    d(p, "gridWidth"
        ,function () {
            return this._gridsWidth;
        }
    );
    d(p, "gridHeight"
        ,function () {
            return this._gridsHeight;
        }
    );
    d(p, "halfWidth"
        ,function () {
            return Math.floor(this._gridsWidth / 2);
        }
    );
    d(p, "halfHeight"
        ,function () {
            return Math.floor(this._gridsHeight / 2);
        }
    );
    p.getGridRow = function (row) {
        if ((row >= 0) && (row < this._gridsHeight)) {
            //row = Math.min(row, this._gridsHeight - 1);
            return this._allTileRow[row];
        }
        return null;
    };
    p.getGridCell = function (xx, yy) {
        xx = Math.floor(xx);
        yy = Math.floor(yy);
        if ((xx < 0) || (xx >= this._gridsWidth) || (yy < 0) || (yy >= this._gridsHeight)) {
            return null;
        }
        var tileRow = this._allTileRow[yy];
        return tileRow.getCell(xx);
    };
    return TileGridMap;
})(egret.DisplayObjectContainer);
egret.registerClass(TileGridMap,"TileGridMap");
