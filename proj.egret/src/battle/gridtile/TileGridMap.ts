


class TileGridMap extends egret.DisplayObjectContainer
{
    private _allTileRow:Array<TileRow> = [];
    private _gridsWidth:number = GRID_WIDTH_MAX;
    private _gridsHeight:number = GRID_HEIGHT_MAX;
    
    
    public constructor() 
    {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    
    private onAddToStage(evtTarget:Event):void
    {
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    
    public newGrid(width:number, height:number):void
    {
        this._allTileRow = new Array<TileRow>();
        this._gridsWidth = Math.min(width, GRID_WIDTH_MAX);
        this._gridsHeight = Math.min(height, GRID_HEIGHT_MAX);
        
        for (var yy:number = 0; yy < this._gridsHeight; ++ yy) {
            var tileRow:TileRow = new TileRow();
            tileRow.createTile(this._gridsWidth);
            this._allTileRow.push(tileRow);
            this.addChild(tileRow);
        }
    }
    
    public createUsedMaxGrid():void
    {
        this.newGrid(GRID_WIDTH_MAX, GRID_HEIGHT_MAX);
    }
    
    public appendRow(value:Array<number>):void
    {
        var tileRow: TileRow = new TileRow();
        tileRow.createTile(value.length);
        tileRow.fillTile(0, value);
        tileRow.adjustAllTilePos();
        
        tileRow.y = this._gridsHeight * TILE_CELL_HEIGHT;
        this._allTileRow.push(tileRow);
        this._gridsHeight ++;
    }
    
    public fillRow(row:number, value:Array<number>):boolean
    {
        if (row < this._gridsHeight) {
            var tileRow:TileRow = this._allTileRow[row];
            tileRow.fillTile(0, value);
            return true;
        }
        
        return false;
    }
    
    public adjustAllRowPos(offY:number = 0):void
    {
        for (var i:number = 0; i < this._gridsHeight; ++ i) {
            var tileRow:TileRow = this._allTileRow[i];
            tileRow.y = i * TILE_CELL_HEIGHT + offY;
            tileRow.x = 0;
            tileRow.adjustAllTilePos();
        }
    }
    
    public getHitRow(stageX:number, stageY:number):number
    {
        if (this.hitTestPoint(stageX, stageY, true)) {
            for (var i:number = 0; i < this._gridsHeight; ++ i) {
                var tileRow:TileRow = this._allTileRow[i];
                if (tileRow.hitTestPoint(stageX,stageY,true)){
                    return i;
                }
            }
        }
        
        return -1;
    }
    
    public getHitCell(stageX:number, stageY:number):any
    {
        // 需要优化
        if (this.hitTestPoint(stageX, stageY, true)) {
            for (var i:number = 0; i < this._gridsHeight; ++ i) {
                var tileRow:TileRow = this._allTileRow[i];
                if (tileRow.hitTestPoint(stageX,stageY,true)){
                    var tileCells:Array<TileCell> = tileRow.cell;
                    for (var j:number = 0; j < tileCells.length; ++ j) {
                        //if (!tileCells[j].isZero && tileCells[j].hitTestPoint(stageX,stageY,true)){
                        if (tileCells[j].hitTestPoint(stageX,stageY,true)){
                            return { cell: tileCells[j], col: j, row: i };
                        }
                    }
                }
            }
        }
        
        //console.info("getHitCell failed");
        return { cell: null };
    }
    
    public get gridWidth():number
    {
        return this._gridsWidth;
    }
    
    public get gridHeight():number
    {
        return this._gridsHeight;
    }
        
    public get halfWidth():number
    {
        return Math.floor(this._gridsWidth / 2);
    }
        
    public get halfHeight():number
    {
        return Math.floor(this._gridsHeight / 2);
    }
            
    public getGridRow(row:number):TileRow
    {
        if ((row >= 0) && (row < this._gridsHeight))
        {
            //row = Math.min(row, this._gridsHeight - 1);
            return this._allTileRow[row];
        }
            
        return null;
    }
        
    public getGridCell(xx:number, yy:number):TileCell
    {
        xx = Math.floor(xx);
        yy = Math.floor(yy);
        
        if ((xx < 0) || (xx >= this._gridsWidth)
            || (yy < 0) || (yy >= this._gridsHeight)) 
        {
            return null;
        }
        
        var tileRow:TileRow = this._allTileRow[yy];
        return tileRow.getCell(xx);
    }
    
}
