var BattleScene = (function (_super) {
    __extends(BattleScene, _super);
    function BattleScene() {
        _super.call(this);
        this._viewContainerLayer = null;
        this._viewGridBG = null;
        this._viewGridMap = null;
        this._viewActorLayer = null;
        this._viewOverallLayer = null;
        this._currZoom = false;
        this._enableZoom = true;
        this._objectsList = [];
        this._needSort = true;
        this._currSelectCell = null;
        this._currSelectSprite = null;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=BattleScene;p=c.prototype;
    p.onAddToStage = function (evtTarget) {
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        this.createContainerLayer();
        this.createDungeonLayer();
        this.createOtherLayer();
        this.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
    };
    BattleScene.defZOrderSortFunc = function (a, b) {
        return a.zOrder - b.zOrder;
    };
    p.onEnterFrame = function (evtTarget) {
        if (this._needSort) {
            var updated = 0;
            this._objectsList.sort(BattleScene.defZOrderSortFunc);
            for (var i = 0; i < this._objectsList.length; ++i) {
                var d = this._objectsList[i];
                if (this._viewActorLayer.getChildAt(i) === d)
                    continue;
                updated++;
                this._viewActorLayer.setChildIndex(d, i);
            }
            this._needSort = false;
        }
    };
    p.createContainerLayer = function () {
        this._viewContainerLayer = new egret.DisplayObjectContainer();
        this.setContent(this._viewContainerLayer);
        this.bounces = false;
        this.scrollSpeed = 0.1;
        this._currZoom = false;
        //this.scrollBeginThreshold = TILE_HALF_WIDTH;
        this.horizontalScrollPolicy = "off";
        this.verticalScrollPolicy = "off";
    };
    p.createOtherLayer = function () {
        this._viewActorLayer = new egret.Sprite();
        this._viewContainerLayer.addChild(this._viewActorLayer);
        this._viewOverallLayer = new egret.Sprite();
        this._viewContainerLayer.addChild(this._viewOverallLayer);
    };
    p._createBackground = function (row, col) {
        var tileGrid = TileGenerator.generateGrid(col, row);
        TileGenerator.generateBackground(tileGrid);
        tileGrid.adjustAllRowPos(0);
        this._viewGridBG = tileGrid;
        this._viewGridBG.visible = true;
        this._viewGridBG.touchEnabled = true;
        this._viewContainerLayer.addChild(tileGrid);
    };
    p._createBattle = function (row, col) {
        var tileGrid = TileGenerator.generateGrid(col, row);
        TileGenerator.generateBackground(tileGrid, 1);
        tileGrid.adjustAllRowPos(0);
        this._viewGridMap = tileGrid;
        this._viewGridMap.visible = true;
        this._viewGridMap.touchEnabled = false;
        this._viewContainerLayer.addChild(tileGrid);
    };
    p.createDungeonLayer = function () {
        this._createBackground(GRID_HEIGHT_MAX, GRID_WIDTH_MAX);
        this._createBattle(GRID_HEIGHT_MAX, GRID_WIDTH_MAX);
        this._objectsList = [];
        this._currSelectCell = null;
        this._viewGridBG.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);
    };
    p.onTouchEnd = function (evtTarget) {
        var hitCell = this._viewGridBG.getHitCell(evtTarget.stageX, evtTarget.stageY);
        var prevCell = this._currSelectCell;
        var currCell = hitCell.cell;
        var currViewCell = null;
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
    };
    p.testCrushCell = function (currCell, col, row) {
        if (GPlayerInst.power < 1) {
            return;
        }
        if (!GBattleManager.doCrushCell(col, row)) {
            //console.info("testCellAroundTheBlock False = ", col, row);
            return;
        }
        this.doCrushCell(currCell, col, row);
        GPlayerInst.power -= 1;
    };
    p.testPaddingCell = function (currCell, col, row) {
        if (GPlayerInst.power < 1) {
            //console.info("testPaddingCell failed 0= ", col, row);
            return;
        }
        if (!currCell.isZero) {
            //console.info("testPaddingCell failed 1 = ", col, row);
            return;
        }
        var resumeVal = GBattleManager.doPaddingCell(col, row);
        if (0 === resumeVal) {
            //console.info("paddingCell failed 2 = ", col, row);
            return;
        }
        this.doPaddingCell(currCell, resumeVal);
        GPlayerInst.power -= 1;
    };
    p.doPaddingCell = function (currCell, resumeVal) {
        currCell.value = 0;
        this.endSelectAnim();
        this._currSelectCell = null;
        var tranCell = this._createTranfromCell(currCell, resumeVal, 0);
        this._viewOverallLayer.addChild(tranCell);
        // 这里需要加上锹填土动画
        var tw = egret.Tween.get(tranCell);
        tranCell.scaleX = tranCell.scaleY = 0.6;
        tw.wait(100).to({ scaleX: 1.3, scaleY: 1.3 }, 100).wait(50).to({ scaleX: 1.0, scaleY: 1.0 }, 200).call(function (tCell, cCell, value) {
            cCell.value = value;
            tCell.empty();
            tCell = null;
        }, this, [tranCell, currCell, resumeVal]);
    };
    p.doCrushCell = function (currCell, col, row) {
        var tranCell = this._createTranfromCell(currCell, currCell.value, currCell.addition);
        this._viewOverallLayer.addChild(tranCell);
        var srcAddition = currCell.addition;
        currCell.empty();
        this.endSelectAnim();
        this._currSelectCell = null;
        // 这里需要加上榔头敲击动画
        var tw = egret.Tween.get(tranCell);
        tw.wait(100).to({ scaleX: 1.3, scaleY: 1.3 }, 200).wait(50).to({ scaleX: 0.6, scaleY: 0.6 }, 100).call(function (tCell, srcAddit, xx, yy) {
            tCell.empty();
            tCell = null;
            if (srcAddit > 0) {
                var monster = GBattleManager.createMonster(srcAddit, xx, yy);
                monster.doBorn();
                this.addTo(monster);
            }
        }, this, [tranCell, srcAddition, col, row]);
    };
    p._createTranfromCell = function (currCell, val, addion) {
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
    };
    p.startSelectAnim = function (lx, ly) {
        if (null == this._currSelectSprite) {
            this._currSelectSprite = new egret.Bitmap();
            this._currSelectSprite.texture = RES.getRes("grid_select");
            this._viewOverallLayer.addChild(this._currSelectSprite);
        }
        this._currSelectSprite.anchorOffsetX = TILE_HALF_WIDTH;
        this._currSelectSprite.anchorOffsetY = TILE_HALF_HEIGHT;
        this._currSelectSprite.x = lx;
        this._currSelectSprite.y = ly;
        this._currSelectSprite.visible = true;
        var tw = egret.Tween.get(this._currSelectSprite, { loop: true });
        tw.wait(200).to({ scaleX: 1.3, scaleY: 1.3 }, 500).wait(200).to({ scaleX: 1.0, scaleY: 1.0 }, 500);
    };
    p.endSelectAnim = function () {
        if (null != this._currSelectSprite) {
            egret.Tween.pauseTweens(this._currSelectSprite);
            egret.Tween.removeTweens(this._currSelectSprite);
            this._currSelectSprite.scaleX = 1.0;
            this._currSelectSprite.scaleY = 1.0;
            this._currSelectSprite.visible = false;
        }
    };
    p.addTo = function (spr) {
        var idx = this._objectsList.indexOf(spr);
        if (idx === -1) {
            this._objectsList.push(spr);
            this._viewActorLayer.addChild(spr);
            this._needSort = true;
        }
    };
    p.removeFrom = function (spr) {
        var idx = this._objectsList.indexOf(spr);
        if (idx !== -1) {
            var forList = this._objectsList;
            forList[idx] = forList[forList.length - 1];
            forList.pop();
            this._viewActorLayer.removeChild(spr);
        }
    };
    p.markZOrderDirty = function () {
        this._needSort = true;
    };
    p.moveTopLeft = function (col, row) {
        //this.setScrollPosition(yy - 480,xx,false);
        var offX = col * TILE_CELL_WIDTH;
        var offY = row * TILE_CELL_HEIGHT;
        this.setScrollPosition(offY, offX);
    };
    p.updateZoom = function () {
        if (!this._enableZoom) {
            return;
        }
        if (!this._currZoom) {
            var swf = this.width / this._viewGridBG.width;
            var shf = this.height / this._viewGridBG.height;
            this._viewContainerLayer.scaleX = swf; //Math.min(swf, shf);
            this._viewContainerLayer.scaleY = shf; //Math.min(swf, shf);
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
    };
    p.updateBattle = function (battleData) {
        var gW = battleData.width;
        var gH = battleData.height;
        for (var y = 0; y < gH; ++y) {
            for (var x = 0; x < gW; ++x) {
                var currCell = this._viewGridMap.getGridCell(x, y);
                if (null !== currCell) {
                    currCell.value = battleData.value[y][x];
                    currCell.addition = battleData.addition[y][x];
                }
            }
        }
    };
    p.updateCell = function (xx, yy, val, addin) {
        var currCell = this._viewGridMap.getGridCell(xx, yy);
        if (null !== currCell) {
            currCell.value = (0 <= val) ? val : currCell.value;
            currCell.addition = (0 <= addin) ? addin : currCell.addition;
        }
    };
    p.updateScrollPolicy = function (battleData) {
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
    };
    return BattleScene;
})(egret.ScrollView);
egret.registerClass(BattleScene,"BattleScene");
var GBattleScene = null;
