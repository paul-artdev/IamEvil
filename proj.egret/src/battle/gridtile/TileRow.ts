


class TileRow extends egret.DisplayObjectContainer
{
    private _allTile:Array<TileCell> = [];
    
    public constructor() 
    {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
    }
    
    private onAddToStage(evtTarget:Event):void
    {
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    
    public createTile(width:number):void
    {
        this._allTile = new Array<TileCell>();
        for (var i:number = 0; i < width; ++ i) {
            var tileCell:TileCell = TileCell.create();
            this.addChild(tileCell);
            this._allTile.push(tileCell);
        }
    }

    public fillTile(ps:number, tileRow:Array<number>):boolean
    {
        var endPos:number = ps + tileRow.length;
        if (endPos > this._allTile.length) {
            return false;            
        }
        
        for (var i:number = ps; i < endPos; ++ i) {
            var tileCell:TileCell = this._allTile[i];
            tileCell.value = tileRow[i];
        }
        
        return true;
    }

    public adjustAllTilePos():void
    {
        for (var i:number = 0; i < this._allTile.length; ++ i) {
            var tileCell:TileCell = this._allTile[i];
            
            tileCell.anchorOffsetX = TILE_HALF_WIDTH;
            tileCell.anchorOffsetY = TILE_HALF_HEIGHT;
            
            tileCell.x = i * TILE_CELL_WIDTH + TILE_HALF_WIDTH;
            tileCell.y = 0 + TILE_HALF_HEIGHT;
        }
    }
    
    public get length():number
    {
        return this._allTile.length;
    }
    
    public get cell():Array<TileCell>
    {
        return this._allTile;
    }
            
    public getCell(xx:number):TileCell
    {
        return this._allTile[xx];
    }
    
}
