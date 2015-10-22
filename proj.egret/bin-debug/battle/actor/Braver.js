var Braver = (function (_super) {
    __extends(Braver, _super);
    function Braver() {
        _super.call(this);
        this._pathStep = 10;
        this._hasTakeChest = false;
        this._isMonster = false;
    }
    var d = __define,c=Braver;p=c.prototype;
    p.doBorn = function () {
        _super.prototype.doBorn.call(this);
        this._hasTakeChest = false;
    };
    p.doDeath = function () {
        GPlayerInst.doKillBraver();
        _super.prototype.doDeath.call(this);
    };
    p._aiChaseAttack = function () {
        if (0 /* NONE */ !== this._orderType) {
            this._needScheduling = true;
            return;
        }
        var tarActor = this._getBestOrderActor();
        if ((null !== tarActor) && tarActor.isAlive) {
            // test distance
            var tarDist = egret.Point.distance(this._currPos, tarActor.currPos);
            var tarDir = PathFinder.calcDirection(this._currPos, tarActor.currPos);
            if (tarDist <= 1) {
                // do attack
                this._attackOnce(tarActor, tarDir);
                return;
            }
        }
        this._needScheduling = true;
    };
    p._aiTakeTheChest = function () {
        //GBattleManager.doTakeTheChest(this);
        console.info("_aiTakeTheChest");
    };
    p._aiDoGameOver = function () {
        GBattleManager.doBattleOver();
        console.info("GAME OVER");
    };
    p._aiPerformMovement = function () {
        if (this._orderType === 0 /* NONE */) {
            if ((null === this._orderPos) || (this._orderPos.length === 0)) {
                var goalTarPos = GBattleManager.chest;
                if (!this._hasTakeChest && this._currPos.equals(GBattleManager.chest)) {
                    this._hasTakeChest = true;
                    this._aiTakeTheChest();
                    goalTarPos = GBattleManager.portal;
                }
                if (this._hasTakeChest && this._currPos.equals(GBattleManager.portal)) {
                    // game over
                    this._aiDoGameOver();
                    this._needScheduling = false;
                    return;
                }
                this._orderPos = GBattleManager.findAStarPath(this._currPos, goalTarPos, this._pathStep);
                this._orderPos.shift();
                this._pathStep *= 2;
            }
            if ((null !== this._orderPos) && (this._orderPos.length > 0)) {
                var nextPos = this._orderPos.shift();
                if (GBattleManager.canPassable(nextPos.x, nextPos.y)) {
                    this._moveOneStep(nextPos.x, nextPos.y, this._moveSpeed);
                    egret.Point.release(nextPos);
                    return;
                }
                this.stopMovement();
                egret.Point.release(nextPos);
            }
        }
        this._needScheduling = true;
    };
    return Braver;
})(Actor);
egret.registerClass(Braver,"Braver");
