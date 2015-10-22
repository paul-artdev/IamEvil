


var TILE_ADDIN_PORTAL:number = 1;
var TILE_ADDIN_CHEST:number = 2;
var TILE_ADDIN_BOMB:number = 3;

var TILE_ADDIN_ONEGEM:number = 3;
var TILE_ADDIN_ONE2GEM:number = 4;
var TILE_ADDIN_ONE4GEM:number = 5;

var TILE_ADDIN_MONSTER_A:number = 10;
var TILE_ADDIN_MONSTER_B:number = 11;
var TILE_ADDIN_MONSTER_C:number = 12;
var TILE_ADDIN_MONSTER_D:number = 13;
var TILE_ADDIN_MONSTER_EYE_DEVIL:number = 20;


var GRID_WIDTH_MAX:number = 9 + 2;
var GRID_HEIGHT_MAX:number = 20 + 2;



class BattleData
{
    public save: Array<Array<number>>;
    public value: Array<Array<number>>;
    public addition: Array<Array<number>>;
    public nutrients: Array<Array<number>>;
    
    public portal: egret.Point;
    public chest: egret.Point;
    
    public width: number = 0;
    public height: number = 0;
    
    public limitUnlock: number = 0;
    
    
    public constructor() 
    {
        this.save = [];
        this.value = [];
        this.addition = [];
        this.nutrients = [];
        
        this.limitUnlock = 0;
    }

    public get halfWidth():number
    {
        return Math.floor(this.width / 2);
    }
        
    public get halfHeight():number
    {
        return Math.floor(this.height / 2);
    }
};

//type BattleGameOver { listener:any, callback:Function };
class BattleManager 
{   
    public notify_cell_changed : (xx:number, yy:number, val:number, addit:number) => void;
    public notify_battle_changed : (battleData:BattleData) => void;
    public notify_take_the_chest : (taker:Actor) => void;
    public notify_game_over : any  = null;
    
    private _battleData:BattleData = null;
    private _battleFinder:PathFinder = null;
        
    private _monsterList: Array<Monster> = [];
    private _braverList: Array<Braver> = [];
    private _timeNumber: number = -1;
    
    private _aiPause:boolean = true;
    

    
    public constructor() 
    {
        
    }

    public initBattle():void
    {
        this._battleData = new BattleData();
        this._battleFinder = new PathFinder();
        
        this._monsterList = [];
        this._braverList = [];
        
        this._aiPause = false;
        if (-1 === this._timeNumber) {
            this._timeNumber = egret.setInterval(this.adjustTime, this, 100);
        }
    }

    public doBattleStart():void
    {
        
    }
    
    public doBattleOver():void
    {
        this._aiPause = true;
        if (-1 !== this._timeNumber) {
            egret.clearInterval(this._timeNumber);
            this._timeNumber = -1;
        }
        
        //this.notify_game_over();
        if (null !== this.notify_game_over) {
            this.notify_game_over.listener( this.notify_game_over.thisObject );
        }
    }
    
    public doBattleNextLevel():void
    {
        BattleGenerator.unlockNextLevel(this._battleData);
    }
    
    public adjustTime(dt:number):boolean
    {
        if (!this._aiPause) {
            for(var i = 0;i < this._braverList.length; ++ i) {
                this._braverList[i].adjustTime(dt);
            }
            
            for(var i = 0;i < this._monsterList.length; ++ i) {
                this._monsterList[i].adjustTime(dt);
            }
        }
        
        return true;
    }

    public createDungeon():void
    {
        BattleGenerator.generateDungeon(this._battleData);
    }
    
    public unlockNextLevel():void
    {
    }
    
    public createBraver(uid:number, xx:number, yy:number):Braver
    {
        var braver = new Braver();
        braver.doCreate(uid,xx,yy);
        this._braverList.push( braver );
        return braver;
    }

    public createMonster(uid:number, xx:number, yy:number):Monster
    {
        var monster = new Monster();
        monster.doCreate(uid,xx,yy);
        this._monsterList.push( monster );
        return monster;
    }
    
    public diedActor(tarActor:Actor):void
    {
        if (null !== tarActor) {
            var isMonster = tarActor.isMonster;
            if (!isMonster) {
                var currPos = tarActor.currPos;
                var newPos = currPos.clone();
                
                for (var i = 0; i < PATH_DIR.MAX; ++ i) {
                    newPos.copyFrom(currPos);
                    newPos = PathFinder.getDirectionPos(newPos,i);
                    if (!this.isValid(newPos.x, newPos.y)) {
                        continue ;
                    }
                    
                    var val = this._battleData.value[newPos.y][newPos.x];
                    if (0 === val) {
                        continue ;
                    }
                           
                    var addit = this._battleData.addition[newPos.y][newPos.x];
                    addit = (0 === addit) ? TILE_ADDIN_MONSTER_A - 1 : addit;
                    addit = Math.min(addit + 1, TemplateData.getTileMaxNutrient(val));
                    this._battleData.addition[newPos.y][newPos.x] = addit;
                        
                    this.notify_cell_changed(newPos.x, newPos.y, -1, addit);
                }
            }
            
            this.destroyActor(tarActor.uuid, isMonster);
        }
    }
    
    public destroyActor(uid:number, isMonster:boolean):void
    {
        var forList = isMonster ? this._monsterList : this._braverList;
        
        for (var i = 0; i < forList.length; ++ i) {
            var old = forList[i];
            if (uid === old.uuid) {
                forList[i] = forList[forList.length - 1];
                forList.pop();
                return ;
            }
        }
    }
    
    public getBraver(uid:number):Braver
    {
        for(var i = 0;i < this._braverList.length; ++ i) {
            if (uid === this._braverList[i].uuid) {
                return this._braverList[i];
            }
        }
        
        return null;
    }
        
    public getMonster(uid:number):Monster
    {
        for(var i = 0;i < this._monsterList.length; ++ i) {
            if (uid === this._monsterList[i].uuid) {
                return this._monsterList[i];
            }
        }
        
        return null;
    }
    
    public getNearestActor(pos:egret.Point, minDist:number, isMonster:boolean):Array<any>
    {
        var forList = isMonster ? this._monsterList : this._braverList;
        var resultArray = [];
        
        for (var i = 0; i < forList.length; ++ i) {
            var apos = forList[i].currPos;
            var adist = egret.Point.distance(pos, apos);
            if ((minDist >= adist)
                /*&& ((pos.x === apos.x) || (pos.y === apos.y))*/) {
                resultArray.push({dist:adist, actor:forList[i]});
            }
        }
    
        return resultArray;
    }
    
    public findAStarPath(ps:egret.Point, pe:egret.Point, limitStep:number = 100):Array<egret.Point>
    {
        return this._battleFinder.findAStarPath(ps, pe, limitStep);
    }

    public hasPortalToChestBarrier():boolean
    {
        var pathResult:Array<egret.Point> = this._battleFinder.findAStarPath(this.portal, this.chest);
        var hasBarrier:boolean = (null === pathResult);
        
        this.releasePathResult(pathResult);
        pathResult = null;
        return hasBarrier;
    }
    
    public hasMaxDist2LineOfSight(posStart:egret.Point, posEnd:egret.Point, maxDist:number=2):boolean
    {
        var pathResult:Array<egret.Point> = this._battleFinder.findAStarPath(posStart, posEnd);
        var inLOS:boolean = ((null !== pathResult) && (pathResult.length < (maxDist+2)));
        
        this.releasePathResult(pathResult);
        pathResult = null;
        return inLOS;
    }
    
    public releasePathResult(pathResult:Array<egret.Point>):void
    {
        if (null !== pathResult) {
            for (var i = 0; i < pathResult.length; ++ i) {
                egret.Point.release(pathResult[i]);
            }
        }
    }

    public doCrushCell(xx:number, yy:number):boolean
    {
        xx = Math.floor(xx);
        yy = Math.floor(yy);
        
        if ((xx < 0) || (xx >= this.width)
            || (yy < 0) || (yy >= this.height)) {
            return false;
        }

        if (((xx === this.chest.x) && (yy === this.chest.y)) 
            || ((xx === this.portal.x) && (yy === this.portal.y))) {
            return false;
        }
        
        if (!this.testCellAroundTheBlock(xx, yy)){
            return false;
        }


        this._battleData.value[yy][xx] = 0;
        this._battleData.addition[yy][xx] = 0;
        return true;
    }

    public doPaddingCell(xx:number, yy:number):number
    {
        xx = Math.floor(xx);
        yy = Math.floor(yy);
        
        if ((xx < 0) || (xx >= this.width)
            || (yy < 0) || (yy >= this.height)) {
            return 0;
        }

        if (((xx === this.chest.x) && (yy === this.chest.y)) 
            || ((xx === this.portal.x) && (yy === this.portal.y))) {
            return 0;
        }
        
        if (this.testCellAroundTheActor(xx, yy)){
            return 0;
        }
        
        var resumeVal = this._battleData.save[yy][xx];
        if(0 === resumeVal) {
            return 0;
        }

        this._battleData.value[yy][xx] = resumeVal;
        if (GBattleManager.hasPortalToChestBarrier()) {
            this._battleData.value[yy][xx] = 0;
            return 0;
        }
        
        return resumeVal;
    }

    public getCellValue(xx:number, yy:number):number
    {
        xx = Math.floor(xx);
        yy = Math.floor(yy);
        
        if ((xx < 0) || (xx >= this.width)
            || (yy < 0) || (yy >= this.height)) {
                return 0;
        }

        return this._battleData.value[yy][xx];
    }

    public getCellAddition(xx:number, yy:number):number
    {
        xx = Math.floor(xx);
        yy = Math.floor(yy);
        
        if ((xx < 0) || (xx >= this.width)
            || (yy < 0) || (yy >= this.height)) {
            return 0;
        }
            
        return this._battleData.addition[yy][xx];
    }
    
    public isValid(xx:number, yy:number):boolean
    {
        if ((xx < 0) || (xx >= this.width)
            || (yy < 0) || (yy >= this.height)) {
                return false;
        }
        
        return (255 !== this._battleData.value[yy][xx]);
    }
    
    public canPassable(xx:number, yy:number):boolean
    {
        if ((xx < 0) || (xx >= this.width)
            || (yy < 0) || (yy >= this.height)) {
                return false;
        }
        
        return (0 === this._battleData.value[yy][xx]);
    }
    
    public testCellAroundTheBlock(xx:number, yy:number):boolean
    {
        var xyoff = [ [0,1], [-1,0], [0,-1], [1,0] ];
        var blockCount: number = 4;
        
        if (255 === this._battleData.value[yy][xx]) {
            return false;
        }
        
        for (var ii = 0;ii < 4; ++ ii) {
            var col = xx + xyoff[ii][0];
            var row = yy + xyoff[ii][1];
                    
            if (this.canPassable(col, row)) {
                --blockCount;
            }            
        }
        
        return (blockCount < 4);
    }
    
    public testCellAroundTheActor(xx:number, yy:number):boolean
    {
        var currPos:egret.Point = egret.Point.create(xx,yy);
        var result:boolean = false;
        
        for(var i = 0;i < this._braverList.length; ++ i) {
            if (currPos.equals(this._braverList[i].currPos)) {
                result = true;
                break ;
            }
            
            if (currPos.equals(this._braverList[i].nextMovePos)) {
                result = true;
                break ;
            }
        }
        
        if (!result) {
            for(var i = 0;i < this._monsterList.length; ++ i) {
                if (currPos.equals(this._monsterList[i].currPos)) {
                    result = true;
                    break ;
                }
                
                if (currPos.equals(this._monsterList[i].nextMovePos)) {
                    result = true;
                    break ;
                }
            }
        }
        
        egret.Point.release(currPos);
        return result;
    }
    
    public get braver_nums():number
    {
        return this._braverList.length;
    }
    
    public get battleData():BattleData
    {
        return this._battleData;
    }

    public set portal(pos:egret.Point)
    {
        this._battleData.portal = pos;    
    }
    
    public get portal():egret.Point
    {
        return this._battleData.portal;
    }
    
    public set chest(pos:egret.Point)
    {
        this._battleData.chest = pos;
    }

    public get chest():egret.Point
    {
        return this._battleData.chest;
    }
    
    public get width():number
    {
        return this._battleData.width;
    }
    
    public get height():number
    {
        return this._battleData.height;
    }
}


var GBattleManager: BattleManager = null;

