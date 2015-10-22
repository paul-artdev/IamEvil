


class BattleScene extends egret.ScrollView
{
    private _viewContainerLayer: egret.DisplayObjectContainer = null;
    private _viewGridBG:TileGridMap = null;
    private _viewGridMap:TileGridMap = null;
    private _viewActorLayer:egret.Sprite = null;
    private _viewOverallLayer:egret.Sprite = null;
    
    private _currZoom:boolean = false;
    private _enableZoom:boolean = true;
    
    private _objectsList:Array<Actor> = [];
    private _needSort:boolean = true;
    
    private _currSelectCell:TileCell = null;
    private _currSelectSprite:egret.Bitmap = null;
    
    
    
    public constructor() 
    {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
    }
    
    private onAddToStage(evtTarget:Event):void
    {
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        
        this.createContainerLayer();
        this.createDungeonLayer();
        this.createOtherLayer();
        
        this.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
    }
    
	public static defZOrderSortFunc(a:Actor, b:Actor):number
	{
		return a.zOrder - b.zOrder;
	}
    
    private onEnterFrame(evtTarget:Event):void
    {
        if (this._needSort) {
            
			var updated:number = 0;

			this._objectsList.sort(BattleScene.defZOrderSortFunc);
			for(var i:number = 0; i < this._objectsList.length; ++ i)
			{
				var d:Actor = this._objectsList[i];
				if ( this._viewActorLayer.getChildAt(i) === d )
					continue;
				
				updated++;
				this._viewActorLayer.setChildIndex(d, i);
			}
            
            this._needSort = false;
        }
    }
    
    private createContainerLayer():void
    {
        this._viewContainerLayer = new egret.DisplayObjectContainer();
        this.setContent(this._viewContainerLayer);
    
        this.bounces = false;
        this.scrollSpeed = 0.1;
        this._currZoom = false;
        //this.scrollBeginThreshold = TILE_HALF_WIDTH;
        
        this.horizontalScrollPolicy = "off";
        this.verticalScrollPolicy = "off";
    }
    
    private createOtherLayer():void
    {
        this._viewActorLayer = new egret.Sprite();
        this._viewContainerLayer.addChild( this._viewActorLayer );
        
        this._viewOverallLayer = new egret.Sprite();
        this._viewContainerLayer.addChild( this._viewOverallLayer );
    }
    
    private _createBackground(row:number, col:number):void
    {
        var tileGrid:TileGridMap = TileGenerator.generateGrid(col, row);
        TileGenerator.generateBackground(tileGrid);
        tileGrid.adjustAllRowPos(0);
        
        this._viewGridBG = tileGrid;
        this._viewGridBG.visible = true;
        this._viewGridBG.touchEnabled = true;
        this._viewContainerLayer.addChild( tileGrid );
    }

    private _createBattle(row:number, col:number):void
    {
        var tileGrid:TileGridMap = TileGenerator.generateGrid(col, row);
        TileGenerator.generateBackground(tileGrid, 1);
        tileGrid.adjustAllRowPos(0);
        
        this._viewGridMap = tileGrid;
        this._viewGridMap.visible = true;
        this._viewGridMap.touchEnabled = false;
        this._viewContainerLayer.addChild( tileGrid ); 
    }
    
    private createDungeonLayer():void
    {
        this._createBackground(GRID_HEIGHT_MAX, GRID_WIDTH_MAX);
        this._createBattle(GRID_HEIGHT_MAX, GRID_WIDTH_MAX);
        
        this._objectsList = [];
        this._currSelectCell = null;
        this._viewGridBG.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);
    }
    
    private onTouchEnd(evtTarget:egret.TouchEvent):void
    {
        var hitCell = this._viewGridBG.getHitCell(evtTarget.stageX, evtTarget.stageY);
        

        var prevCell: TileCell = this._currSelectCell;
        var currCell: TileCell = hitCell.cell;
        var currViewCell: TileCell = null;
        

        // process select cell
        if (null !== currCell) {
            currViewCell = this._viewGridMap.getGridCell(hitCell.col, hitCell.row);
        }

        if (prevCell !== currCell) { 
            this.endSelectAnim();
            this._currSelectCell = currCell;
            
            if (null !== currViewCell) {
                var rpt = currViewCell.parent.localToGlobal(currViewCell.x, currViewCell.y);
                var gpt = this._viewGridMap.globalToLocal(rpt.x, rpt.y);
             
                this.startSelectAnim(gpt.x, gpt.y);
            }
        }
        else if (null !== currViewCell) {

            if (currViewCell.isZero) {
                this.testPaddingCell(currViewCell, hitCell.col, hitCell.row);
            }
            else {
                this.testCrushCell(currViewCell, hitCell.col, hitCell.row);
            }
            
        }
        
    }
    
    private testCrushCell(currCell: TileCell, col: number, row: number): void
    {
        if (GPlayerInst.power < 1) {
            return ;
        }

        if (!GBattleManager.doCrushCell(col, row)){
            //console.info("testCellAroundTheBlock False = ", col, row);
            return ;
        }
         

        this.doCrushCell(currCell, col, row);
        GPlayerInst.power -= 1;

    }
    
    private testPaddingCell(currCell:TileCell, col:number, row:number): void
    { 
        if (GPlayerInst.power < 1) {
            //console.info("testPaddingCell failed 0= ", col, row);
            return ;
        }

        if(!currCell.isZero) {  // 当前不为Zero
            //console.info("testPaddingCell failed 1 = ", col, row);
            return;
        }
        
        var resumeVal = GBattleManager.doPaddingCell(col, row);
        if(0 === resumeVal) {
            //console.info("paddingCell failed 2 = ", col, row);
            return;
        }
        

        this.doPaddingCell(currCell, resumeVal);
        GPlayerInst.power -= 1;
    }
    
    private doPaddingCell(currCell:TileCell, resumeVal:number):void
    {
        currCell.value = 0;
        this.endSelectAnim(); 
        this._currSelectCell = null; 

        
        var tranCell = this._createTranfromCell(currCell, resumeVal, 0);
        this._viewOverallLayer.addChild(tranCell);


        // 这里需要加上锹填土动画
        var tw = egret.Tween.get(tranCell);
        tranCell.scaleX = tranCell.scaleY = 0.6;
        tw.wait(100)
          .to( {scaleX:1.3, scaleY:1.3}, 100 )
          .wait(50)
          .to( {scaleX:1.0, scaleY:1.0}, 200 )
          .call(function(tCell, cCell, value) { 
                cCell.value = value;
                tCell.empty();
                tCell = null; 
            }, 
            this, [tranCell, currCell, resumeVal]);
    }
    
    private doCrushCell(currCell:TileCell, col:number, row:number):void
    {
        var tranCell = this._createTranfromCell(currCell, currCell.value, currCell.addition);
        this._viewOverallLayer.addChild(tranCell);

        var srcAddition = currCell.addition;
        currCell.empty();
        this.endSelectAnim(); 
        this._currSelectCell = null; 
        
        
        // 这里需要加上榔头敲击动画
        var tw = egret.Tween.get(tranCell);
        tw.wait(100)
        .to( {scaleX:1.3, scaleY:1.3}, 200 )
        .wait(50)
        .to( {scaleX:0.6, scaleY:0.6}, 100 )
            .call(function(tCell, srcAddit, xx, yy) { 
                tCell.empty();
                tCell = null;
                if (srcAddit > 0) {
                    var monster = GBattleManager.createMonster(srcAddit, xx, yy);
                    monster.doBorn();
                    this.addTo(monster);
                }
                
            }, 
            this, [tranCell, srcAddition, col, row]);
        
    }
    
    private _createTranfromCell(currCell:TileCell, val:number, addion:number):TileCell
    {
        var tranCell = TileCell.create();
        var rpt = currCell.parent.localToGlobal(currCell.x, currCell.y);
        var gpt = this._viewGridMap.globalToLocal(rpt.x, rpt.y);
        
        tranCell.value = val;
        tranCell.addition = addion;
        tranCell.x = gpt.x;
        tranCell.y = gpt.y;
        tranCell.anchorOffsetX = currCell.anchorOffsetX;
        tranCell.anchorOffsetY = currCell.anchorOffsetY;

        return tranCell;
    }

    private startSelectAnim(lx:number, ly:number):void
    {
        if (null == this._currSelectSprite) {
            this._currSelectSprite = new egret.Bitmap();
            
            this._currSelectSprite.texture = RES.getRes("grid_select");
            this._viewOverallLayer.addChild( this._currSelectSprite );
        }
        
        this._currSelectSprite.anchorOffsetX = TILE_HALF_WIDTH;
        this._currSelectSprite.anchorOffsetY = TILE_HALF_HEIGHT;
        this._currSelectSprite.x = lx;
        this._currSelectSprite.y = ly;
        this._currSelectSprite.visible = true;
        var tw = egret.Tween.get(this._currSelectSprite, { loop: true });
        tw.wait(200)
          .to( {scaleX:1.3, scaleY:1.3}, 500 )
          .wait(200)
          .to( {scaleX:1.0, scaleY:1.0}, 500 );
    }
    
    private endSelectAnim():void
    { 
        if (null != this._currSelectSprite) {
            egret.Tween.pauseTweens(this._currSelectSprite);
            egret.Tween.removeTweens(this._currSelectSprite);
            this._currSelectSprite.scaleX = 1.0;
            this._currSelectSprite.scaleY = 1.0;
            this._currSelectSprite.visible = false;
        }
    }
    
    public addTo(spr:Actor):void
    {
		var idx:number = this._objectsList.indexOf(spr);
		if(idx === -1) {
			this._objectsList.push(spr);
			this._viewActorLayer.addChild(spr);
			this._needSort = true;
		}
    }
    
	public removeFrom(spr:Actor):void
	{
		var idx:number = this._objectsList.indexOf(spr);
		if(idx !== -1) {
            var forList = this._objectsList;
            forList[idx] = forList[forList.length - 1];
            forList.pop();
            
			this._viewActorLayer.removeChild(spr);
		}
	}
    
    public markZOrderDirty():void
    {
		this._needSort = true;
    }
    
    public moveTopLeft(col:number,row:number):void
    {
        //this.setScrollPosition(yy - 480,xx,false);
        var offX = col * TILE_CELL_WIDTH;
        var offY = row * TILE_CELL_HEIGHT;
        
        this.setScrollPosition(offY, offX);
    }
    
    public updateZoom():void
    {
        if (!this._enableZoom) {
            return ;
        }
        
        if (!this._currZoom) {
            var swf = this.width / this._viewGridBG.width;
            var shf = this.height / this._viewGridBG.height;
            
            this._viewContainerLayer.scaleX = swf;//Math.min(swf, shf);
            this._viewContainerLayer.scaleY = shf;//Math.min(swf, shf);
            
            this.setScrollPosition(0, 0);
            this.verticalScrollPolicy = "off";
            this.horizontalScrollPolicy = "off";
        }
        else {
            this._viewContainerLayer.scaleX = 1.0;
            this._viewContainerLayer.scaleY = 1.0;
                        
            this.moveTopLeft(GBattleManager.portal.x - 5 + 0.5, 0);
            this.horizontalScrollPolicy = "off";
            this.verticalScrollPolicy = "on";
        }
        
        
        this._currZoom = !this._currZoom;
    }
    
    public updateBattle(battleData:BattleData):void
    {
        var gW:number = battleData.width;
        var gH:number = battleData.height;
        
        for (var y:number = 0; y < gH; ++ y) {
            for (var x:number = 0; x < gW; ++ x) {
                var currCell = this._viewGridMap.getGridCell(x, y);
                if (null !== currCell) {
                    currCell.value = battleData.value[y][x];
                    currCell.addition = battleData.addition[y][x];
                }
            }
        }
    }
    
    public updateCell(xx:number, yy:number, val:number, addin:number):void
    {
        var currCell = this._viewGridMap.getGridCell(xx, yy);
        if (null !== currCell) {
            currCell.value = (0 <= val) ? val : currCell.value;
            currCell.addition = (0 <= addin) ? addin : currCell.addition;
        }
    }
    
    public updateScrollPolicy(battleData:BattleData):void
    {
        this._enableZoom = false;
        if (0 === battleData.limitUnlock) {
            this.horizontalScrollPolicy = "off";
            this.verticalScrollPolicy = "off";
        }
        else if (1 === battleData.limitUnlock) {
            this.horizontalScrollPolicy = "off";
            this.verticalScrollPolicy = "on";
        }
        else {
            this.horizontalScrollPolicy = "off";
            this.verticalScrollPolicy = "on";
            this._enableZoom = true;
        }
    }
}


var GBattleScene: BattleScene = null;
