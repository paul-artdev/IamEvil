var TILE_ADDIN_PORTAL = 1;
var TILE_ADDIN_CHEST = 2;
var TILE_ADDIN_BOMB = 3;
var TILE_ADDIN_ONEGEM = 3;
var TILE_ADDIN_ONE2GEM = 4;
var TILE_ADDIN_ONE4GEM = 5;
var TILE_ADDIN_MONSTER_A = 10;
var TILE_ADDIN_MONSTER_B = 11;
var TILE_ADDIN_MONSTER_C = 12;
var TILE_ADDIN_MONSTER_D = 13;
var TILE_ADDIN_MONSTER_EYE_DEVIL = 20;
var GRID_WIDTH_MAX = 9 + 2;
var GRID_HEIGHT_MAX = 20 + 2;
var BattleData = (function () {
    function BattleData() {
        this.width = 0;
        this.height = 0;
        this.limitUnlock = 0;
        this.save = [];
        this.value = [];
        this.addition = [];
        this.nutrients = [];
        this.limitUnlock = 0;
    }
    var d = __define,c=BattleData;p=c.prototype;
    d(p, "halfWidth"
        ,function () {
            return Math.floor(this.width / 2);
        }
    );
    d(p, "halfHeight"
        ,function () {
            return Math.floor(this.height / 2);
        }
    );
    return BattleData;
})();
egret.registerClass(BattleData,"BattleData");
;
//type BattleGameOver { listener:any, callback:Function };
var BattleManager = (function () {
    function BattleManager() {
        this.notify_game_over = null;
        this._battleData = null;
        this._battleFinder = null;
        this._monsterList = [];
        this._braverList = [];
        this._timeNumber = -1;
        this._aiPause = true;
    }
    var d = __define,c=BattleManager;p=c.prototype;
    p.initBattle = function () {
        this._battleData = new BattleData();
        this._battleFinder = new PathFinder();
        this._monsterList = [];
        this._braverList = [];
        this._aiPause = false;
        if (-1 === this._timeNumber) {
            this._timeNumber = egret.setInterval(this.adjustTime, this, 100);
        }
    };
    p.doBattleStart = function () {
    };
    p.doBattleOver = function () {
        this._aiPause = true;
        if (-1 !== this._timeNumber) {
            egret.clearInterval(this._timeNumber);
            this._timeNumber = -1;
        }
        //this.notify_game_over();
        if (null !== this.notify_game_over) {
            this.notify_game_over.listener(this.notify_game_over.thisObject);
        }
    };
    p.doBattleNextLevel = function () {
        BattleGenerator.unlockNextLevel(this._battleData);
    };
    p.adjustTime = function (dt) {
        if (!this._aiPause) {
            for (var i = 0; i < this._braverList.length; ++i) {
                this._braverList[i].adjustTime(dt);
            }
            for (var i = 0; i < this._monsterList.length; ++i) {
                this._monsterList[i].adjustTime(dt);
            }
        }
        return true;
    };
    p.createDungeon = function () {
        BattleGenerator.generateDungeon(this._battleData);
    };
    p.unlockNextLevel = function () {
    };
    p.createBraver = function (uid, xx, yy) {
        var braver = new Braver();
        braver.doCreate(uid, xx, yy);
        this._braverList.push(braver);
        return braver;
    };
    p.createMonster = function (uid, xx, yy) {
        var monster = new Monster();
        monster.doCreate(uid, xx, yy);
        this._monsterList.push(monster);
        return monster;
    };
    p.diedActor = function (tarActor) {
        if (null !== tarActor) {
            var isMonster = tarActor.isMonster;
            if (!isMonster) {
                var currPos = tarActor.currPos;
                var newPos = currPos.clone();
                for (var i = 0; i < 4 /* MAX */; ++i) {
                    newPos.copyFrom(currPos);
                    newPos = PathFinder.getDirectionPos(newPos, i);
                    if (!this.isValid(newPos.x, newPos.y)) {
                        continue;
                    }
                    var val = this._battleData.value[newPos.y][newPos.x];
                    if (0 === val) {
                        continue;
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
    };
    p.destroyActor = function (uid, isMonster) {
        var forList = isMonster ? this._monsterList : this._braverList;
        for (var i = 0; i < forList.length; ++i) {
            var old = forList[i];
            if (uid === old.uuid) {
                forList[i] = forList[forList.length - 1];
                forList.pop();
                return;
            }
        }
    };
    p.getBraver = function (uid) {
        for (var i = 0; i < this._braverList.length; ++i) {
            if (uid === this._braverList[i].uuid) {
                return this._braverList[i];
            }
        }
        return null;
    };
    p.getMonster = function (uid) {
        for (var i = 0; i < this._monsterList.length; ++i) {
            if (uid === this._monsterList[i].uuid) {
                return this._monsterList[i];
            }
        }
        return null;
    };
    p.getNearestActor = function (pos, minDist, isMonster) {
        var forList = isMonster ? this._monsterList : this._braverList;
        var resultArray = [];
        for (var i = 0; i < forList.length; ++i) {
            var apos = forList[i].currPos;
            var adist = egret.Point.distance(pos, apos);
            if ((minDist >= adist)) {
                resultArray.push({ dist: adist, actor: forList[i] });
            }
        }
        return resultArray;
    };
    p.findAStarPath = function (ps, pe, limitStep) {
        if (limitStep === void 0) { limitStep = 100; }
        return this._battleFinder.findAStarPath(ps, pe, limitStep);
    };
    p.hasPortalToChestBarrier = function () {
        var pathResult = this._battleFinder.findAStarPath(this.portal, this.chest);
        var hasBarrier = (null === pathResult);
        this.releasePathResult(pathResult);
        pathResult = null;
        return hasBarrier;
    };
    p.hasMaxDist2LineOfSight = function (posStart, posEnd, maxDist) {
        if (maxDist === void 0) { maxDist = 2; }
        var pathResult = this._battleFinder.findAStarPath(posStart, posEnd);
        var inLOS = ((null !== pathResult) && (pathResult.length < (maxDist + 2)));
        this.releasePathResult(pathResult);
        pathResult = null;
        return inLOS;
    };
    p.releasePathResult = function (pathResult) {
        if (null !== pathResult) {
            for (var i = 0; i < pathResult.length; ++i) {
                egret.Point.release(pathResult[i]);
            }
        }
    };
    p.doCrushCell = function (xx, yy) {
        xx = Math.floor(xx);
        yy = Math.floor(yy);
        if ((xx < 0) || (xx >= this.width) || (yy < 0) || (yy >= this.height)) {
            return false;
        }
        if (((xx === this.chest.x) && (yy === this.chest.y)) || ((xx === this.portal.x) && (yy === this.portal.y))) {
            return false;
        }
        if (!this.testCellAroundTheBlock(xx, yy)) {
            return false;
        }
        this._battleData.value[yy][xx] = 0;
        this._battleData.addition[yy][xx] = 0;
        return true;
    };
    p.doPaddingCell = function (xx, yy) {
        xx = Math.floor(xx);
        yy = Math.floor(yy);
        if ((xx < 0) || (xx >= this.width) || (yy < 0) || (yy >= this.height)) {
            return 0;
        }
        if (((xx === this.chest.x) && (yy === this.chest.y)) || ((xx === this.portal.x) && (yy === this.portal.y))) {
            return 0;
        }
        if (this.testCellAroundTheActor(xx, yy)) {
            return 0;
        }
        var resumeVal = this._battleData.save[yy][xx];
        if (0 === resumeVal) {
            return 0;
        }
        this._battleData.value[yy][xx] = resumeVal;
        if (GBattleManager.hasPortalToChestBarrier()) {
            this._battleData.value[yy][xx] = 0;
            return 0;
        }
        return resumeVal;
    };
    p.getCellValue = function (xx, yy) {
        xx = Math.floor(xx);
        yy = Math.floor(yy);
        if ((xx < 0) || (xx >= this.width) || (yy < 0) || (yy >= this.height)) {
            return 0;
        }
        return this._battleData.value[yy][xx];
    };
    p.getCellAddition = function (xx, yy) {
        xx = Math.floor(xx);
        yy = Math.floor(yy);
        if ((xx < 0) || (xx >= this.width) || (yy < 0) || (yy >= this.height)) {
            return 0;
        }
        return this._battleData.addition[yy][xx];
    };
    p.isValid = function (xx, yy) {
        if ((xx < 0) || (xx >= this.width) || (yy < 0) || (yy >= this.height)) {
            return false;
        }
        return (255 !== this._battleData.value[yy][xx]);
    };
    p.canPassable = function (xx, yy) {
        if ((xx < 0) || (xx >= this.width) || (yy < 0) || (yy >= this.height)) {
            return false;
        }
        return (0 === this._battleData.value[yy][xx]);
    };
    p.testCellAroundTheBlock = function (xx, yy) {
        var xyoff = [[0, 1], [-1, 0], [0, -1], [1, 0]];
        var blockCount = 4;
        if (255 === this._battleData.value[yy][xx]) {
            return false;
        }
        for (var ii = 0; ii < 4; ++ii) {
            var col = xx + xyoff[ii][0];
            var row = yy + xyoff[ii][1];
            if (this.canPassable(col, row)) {
                --blockCount;
            }
        }
        return (blockCount < 4);
    };
    p.testCellAroundTheActor = function (xx, yy) {
        var currPos = egret.Point.create(xx, yy);
        var result = false;
        for (var i = 0; i < this._braverList.length; ++i) {
            if (currPos.equals(this._braverList[i].currPos)) {
                result = true;
                break;
            }
            if (currPos.equals(this._braverList[i].nextMovePos)) {
                result = true;
                break;
            }
        }
        if (!result) {
            for (var i = 0; i < this._monsterList.length; ++i) {
                if (currPos.equals(this._monsterList[i].currPos)) {
                    result = true;
                    break;
                }
                if (currPos.equals(this._monsterList[i].nextMovePos)) {
                    result = true;
                    break;
                }
            }
        }
        egret.Point.release(currPos);
        return result;
    };
    d(p, "braver_nums"
        ,function () {
            return this._braverList.length;
        }
    );
    d(p, "battleData"
        ,function () {
            return this._battleData;
        }
    );
    d(p, "portal"
        ,function () {
            return this._battleData.portal;
        }
        ,function (pos) {
            this._battleData.portal = pos;
        }
    );
    d(p, "chest"
        ,function () {
            return this._battleData.chest;
        }
        ,function (pos) {
            this._battleData.chest = pos;
        }
    );
    d(p, "width"
        ,function () {
            return this._battleData.width;
        }
    );
    d(p, "height"
        ,function () {
            return this._battleData.height;
        }
    );
    return BattleManager;
})();
egret.registerClass(BattleManager,"BattleManager");
var GBattleManager = null;
