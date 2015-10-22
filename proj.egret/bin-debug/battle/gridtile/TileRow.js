var TileRow = (function (_super) {
    __extends(TileRow, _super);
    function TileRow() {
        _super.call(this);
        this._allTile = [];
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=TileRow;p=c.prototype;
    p.onAddToStage = function (evtTarget) {
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    };
    p.createTile = function (width) {
        this._allTile = new Array();
        for (var i = 0; i < width; ++i) {
            var tileCell = TileCell.create();
            this.addChild(tileCell);
            this._allTile.push(tileCell);
        }
    };
    p.fillTile = function (ps, tileRow) {
        var endPos = ps + tileRow.length;
        if (endPos > this._allTile.length) {
            return false;
        }
        for (var i = ps; i < endPos; ++i) {
            var tileCell = this._allTile[i];
            tileCell.value = tileRow[i];
        }
        return true;
    };
    p.adjustAllTilePos = function () {
        for (var i = 0; i < this._allTile.length; ++i) {
            var tileCell = this._allTile[i];
            tileCell.anchorOffsetX = TILE_HALF_WIDTH;
            tileCell.anchorOffsetY = TILE_HALF_HEIGHT;
            tileCell.x = i * TILE_CELL_WIDTH + TILE_HALF_WIDTH;
            tileCell.y = 0 + TILE_HALF_HEIGHT;
        }
    };
    d(p, "length"
        ,function () {
            return this._allTile.length;
        }
    );
    d(p, "cell"
        ,function () {
            return this._allTile;
        }
    );
    p.getCell = function (xx) {
        return this._allTile[xx];
    };
    return TileRow;
})(egret.DisplayObjectContainer);
egret.registerClass(TileRow,"TileRow");
