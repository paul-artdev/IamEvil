


var TILE_CELL_WIDTH:number = 64;
var TILE_CELL_HEIGHT:number = 64;

var TILE_HALF_WIDTH:number = TILE_CELL_WIDTH * 0.5;
var TILE_HALF_HEIGHT:number = TILE_CELL_HEIGHT * 0.5;

var TILE_FOURTH_WIDTH:number = TILE_CELL_WIDTH * 0.25;
var TILE_FOURTH_HEIGHT:number = TILE_CELL_HEIGHT * 0.25;


class TileCell extends egret.Sprite
{
    public static PoolCached: Array<TileCell> = [];
    public static create():TileCell
    {
        var currCell = TileCell.PoolCached.pop();
        if (!currCell) {
            currCell = new TileCell();
        }
        return currCell;
    }
        
    public static release(currCell:TileCell):void
    {
        if (!currCell) {
            return;
        }
                
        TileCell.PoolCached.push(currCell);
    }
        
    protected _value:number = 0;
    protected _addition:number = 0;
    
    protected _svalue:egret.Bitmap = null;
    protected _saddition:egret.Bitmap = null;

    protected _hasAddtoStage: Boolean = false;
    
    
    public constructor()
    {
        super();
        this._hasAddtoStage = false;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    protected onAddToStage(evtTarget:Event):void
    {
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        this._hasAddtoStage = true;
        
        this.changeTile();
        this.changeAddition();
    }

    public empty():void
    {
        this.value = 0;
        this.addition = 0;
    }
    /*
    public set hide(val:Boolean)
    {
        this._value.visible = val;
    }*/
    
    public get isZero():boolean
    {
        return (this._value === 0);
    }
    
    public set value(val:number)
    {
        this._value = val;
        if (this._hasAddtoStage) {
            this.changeTile();
        }
    }   

    public get value():number
    {
        return this._value;
    }
    
    public set addition(val:number)
    {
        this._addition = val;
        if (this._hasAddtoStage) {
            this.changeAddition();
        }
    }   

    public get addition():number
    {
        return this._addition;
    }
        
    private changeTile():void
    {
        if (null === this._svalue) {
            this._svalue = new egret.Bitmap();
            this.addChild( this._svalue );
        }
        
        this._svalue.visible = (0 < this._value);
        if (0 < this._value) {
            this._svalue.texture = RES.getRes("grid_0"+this._value);
        }
        
    }
        
    private changeAddition():void
    {
        if (null === this._saddition) {
            this._saddition = new egret.Bitmap();
            this.addChild( this._saddition );
        }
        
        this._saddition.visible = (0 < this._addition);
        if (0 < this._addition) {
            this._saddition.texture = RES.getRes("grid_addin_0"+this._addition);
        }
    }

}
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

