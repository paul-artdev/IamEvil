var TILE_CELL_WIDTH = 64;
var TILE_CELL_HEIGHT = 64;
var TILE_HALF_WIDTH = TILE_CELL_WIDTH * 0.5;
var TILE_HALF_HEIGHT = TILE_CELL_HEIGHT * 0.5;
var TILE_FOURTH_WIDTH = TILE_CELL_WIDTH * 0.25;
var TILE_FOURTH_HEIGHT = TILE_CELL_HEIGHT * 0.25;
var TileCell = (function (_super) {
    __extends(TileCell, _super);
    function TileCell() {
        _super.call(this);
        this._value = 0;
        this._addition = 0;
        this._svalue = null;
        this._saddition = null;
        this._hasAddtoStage = false;
        this._hasAddtoStage = false;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=TileCell;p=c.prototype;
    TileCell.create = function () {
        var currCell = TileCell.PoolCached.pop();
        if (!currCell) {
            currCell = new TileCell();
        }
        return currCell;
    };
    TileCell.release = function (currCell) {
        if (!currCell) {
            return;
        }
        TileCell.PoolCached.push(currCell);
    };
    p.onAddToStage = function (evtTarget) {
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        this._hasAddtoStage = true;
        this.changeTile();
        this.changeAddition();
    };
    p.empty = function () {
        this.value = 0;
        this.addition = 0;
    };
    d(p, "isZero"
        /*
        public set hide(val:Boolean)
        {
            this._value.visible = val;
        }*/
        ,function () {
            return (this._value === 0);
        }
    );
    d(p, "value"
        ,function () {
            return this._value;
        }
        ,function (val) {
            this._value = val;
            if (this._hasAddtoStage) {
                this.changeTile();
            }
        }
    );
    d(p, "addition"
        ,function () {
            return this._addition;
        }
        ,function (val) {
            this._addition = val;
            if (this._hasAddtoStage) {
                this.changeAddition();
            }
        }
    );
    p.changeTile = function () {
        if (null === this._svalue) {
            this._svalue = new egret.Bitmap();
            this.addChild(this._svalue);
        }
        this._svalue.visible = (0 < this._value);
        if (0 < this._value) {
            this._svalue.texture = RES.getRes("grid_0" + this._value);
        }
    };
    p.changeAddition = function () {
        if (null === this._saddition) {
            this._saddition = new egret.Bitmap();
            this.addChild(this._saddition);
        }
        this._saddition.visible = (0 < this._addition);
        if (0 < this._addition) {
            this._saddition.texture = RES.getRes("grid_addin_0" + this._addition);
        }
    };
    TileCell.PoolCached = [];
    return TileCell;
})(egret.Sprite);
egret.registerClass(TileCell,"TileCell");
/*

class TileBomb extends TileCell
{
    public constructor()
    {
        super();
    }
    
    
    protected onAddToStage(evtTarget:Event):void
    {
        super.onAddToStage(evtTarget);
        this.addinScaleX = TILE_CELL_WIDTH / 86;
        this._addaddinScaleYILE_CELL_HEIGHT / 87;
        
        this.value = 100;
        this.addition = TILE_ADDIN_BOMB;
    }

}

class TileBoss extends TileCell
{
    public constructor()
    {
        super();
    }
    
    
    protected onAddToStage(evtTarget:Event):void
    {
        super.onAddToStage(evtTarget);
        this.addinScaleX = TILE_CELL_WIDTH / 280;
        this._addaddinScaleYILE_CELL_HEIGHT / 280;
        
        this.value = 100;
        this.addition = TILE_ADDIN_MONSTER_A;
    }

}

*/
