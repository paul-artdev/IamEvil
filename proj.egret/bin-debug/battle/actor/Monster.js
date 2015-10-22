var Monster = (function (_super) {
    __extends(Monster, _super);
    function Monster() {
        _super.call(this);
        this._currDir = 0 /* SOUTH */;
        this._isMonster = true;
    }
    var d = __define,c=Monster;p=c.prototype;
    p.doBorn = function () {
        this._currDir = 0 /* SOUTH */;
        _super.prototype.doBorn.call(this);
    };
    p._aiChaseAttack = function () {
        if (0 /* NONE */ !== this._orderType) {
            this._needScheduling = true;
            return;
        }
        var tarActor = this._getBestOrderActor();
        if ((null !== tarActor) && tarActor.isAlive) {
            if ((null !== this._orderPos) && (this._orderPos.length > 0)) {
                var nextPos = this._orderPos.shift();
                if (!GBattleManager.canPassable(nextPos.x, nextPos.y)) {
                    this.stopMovement();
                    this.doMove2Attack(tarActor);
                }
                else {
                    this._moveOneStep(nextPos.x, nextPos.y, this._moveSpeed * 0.3);
                }
                egret.Point.release(nextPos);
            }
            else {
                // test distance
                var tarDist = egret.Point.distance(this._currPos, tarActor.currPos);
                var tarDir = PathFinder.calcDirection(this._currPos, tarActor.currPos);
                if (tarDist <= 1) {
                    // do attack
                    this._attackOnce(tarActor, tarDir);
                    return;
                }
                else {
                    console.info("tarDist = ", tarDist, this.isMonster);
                }
            }
        }
        this._needScheduling = true;
    };
    p._aiLineOfSightTo = function () {
        var nearActor = this._findNearestEnemy(2, true);
        if ((null !== nearActor) && nearActor.isAlive) {
            this.stopMovement();
            if (!nearActor.hasOrderActor) {
                nearActor.stopMovement();
            }
            nearActor.doDefense2Attack(this);
            this.doMove2Attack(nearActor);
        }
    };
    /*protected _aiPerform_Freedom():void
    {
        var tarDist = egret.Point.distance(this._currPos, this._spawnPos);
        if (tarDist < 5) {
            var nextPos = this._findNextRandomPos(this._currPos);
            this._moveOneStep(nextPos.x, nextPos.y, this._moveSpeed);
            egret.Point.release(nextPos);
        }
        else {
            this._orderActor = 0;
            if ((null === this._orderPos) || (this._orderPos.length === 0)) {
                this._orderPos = GBattleManager.findAStarPath(this._currPos, this._spawnPos, 50);
                if ((null !== this._orderPos) && (this._orderPos.length > 1)) {
                    this._orderPos.shift();
                    this._orderPos.pop();
                }
            }
            
            if ((null !== this._orderPos) && (this._orderPos.length > 0)) {
                var nextPos = this._orderPos.shift();
                if (!GBattleManager.canPassable(nextPos.x, nextPos.y)) {
                    this.stopMovement();
                    this._needScheduling = true;
                }
                else {
                    this._moveOneStep(nextPos.x, nextPos.y, this._moveSpeed);
                }
                
                egret.Point.release(nextPos);
            }
        }
    }*/
    /*protected _aiPerform_Guard2Turn():void
    {
        if (!GBattleManager.canPassable(this._spawnPos.x, this._spawnPos.y)) {
            this._spawnPos.copyFrom( this._currPos );
        }
        
        // search braver
        var nearActor:Actor = GBattleManager._findNearestEnemy(2);
        if ((null !== nearActor) && nearActor.isAlive) {
            this.stopMovement();
            nearActor.stopMovement();
            
            this.doMove2Attack(nearActor);
            nearActor.doWait2Attack(this);
        }
        else {
            
            this._orderActor = 0;
            if ((null === this._orderPos) || (this._orderPos.length === 0)) {
                var tarPos = this._spawnPos;
                if (this._currPos.equals(tarPos)) {
                    tarPos = this._findNextRandomPos(this._currPos);
                    if (null !== tarPos) {
                        this._currDir = PathFinder.calcDirection(this._currPos, tarPos);
                        tarPos = PathFinder.getDirectionPos(tarPos, this._currDir, 1 + 3);
                    }
                    else {
                        this._needScheduling = true;
                        return ;
                    }
                }
                
                this._orderPos = GBattleManager.findAStarPath(this._currPos, tarPos, 10);
                egret.Point.release(tarPos);
                this._orderPos.shift();
            }
            
            if ((null !== this._orderPos) && (this._orderPos.length > 0)) {
                var nextPos = this._orderPos.shift();
                if (!GBattleManager.canPassable(nextPos.x, nextPos.y)) {
                    this.stopMovement();
                    this._needScheduling = true;
                }
                else {
                    this._moveOneStep(nextPos.x, nextPos.y, this._moveSpeed);
                }
                
                egret.Point.release(nextPos);
            }
        }
        
    }*/
    p._aiPerform_Guard2Turn = function () {
        if (!GBattleManager.canPassable(this._spawnPos.x, this._spawnPos.y)) {
            this._spawnPos.copyFrom(this._currPos);
        }
        if ((null === this._orderPos) || (this._orderPos.length === 0)) {
            var tarPos = this._spawnPos;
            if (this._currPos.equals(tarPos)) {
                tarPos = this._findNextRandomPos(this._currPos);
                if (null !== tarPos) {
                    this._currDir = PathFinder.calcDirection(this._currPos, tarPos);
                    tarPos = PathFinder.getDirectionPos(tarPos, this._currDir, 1 + 3);
                }
                else {
                    return;
                }
            }
            this._orderPos = GBattleManager.findAStarPath(this._currPos, tarPos, 10);
            egret.Point.release(tarPos);
            this._orderPos.shift();
            return;
        }
        if ((null !== this._orderPos) && (this._orderPos.length > 0)) {
            var nextPos = this._orderPos.shift();
            if (!GBattleManager.canPassable(nextPos.x, nextPos.y)) {
                this.stopMovement();
            }
            else {
                this._moveOneStep(nextPos.x, nextPos.y, this._moveSpeed, true);
            }
            egret.Point.release(nextPos);
        }
    };
    p._aiPerform_HitWall2Turn = function () {
        var hitCount = 0;
        do {
            var nextPos = this._currPos.clone();
            nextPos = PathFinder.getDirectionPos(nextPos, this._currDir);
            if (GBattleManager.canPassable(nextPos.x, nextPos.y)) {
                this._moveOneStep(nextPos.x, nextPos.y, this._moveSpeed);
                egret.Point.release(nextPos);
                break;
            }
            hitCount += 1;
            this._currDir = (this._currDir + 1) % 4 /* MAX */;
            egret.Point.release(nextPos);
        } while (hitCount < 4);
    };
    p._aiTest2MoveDirection = function (nextPos, currDir) {
        nextPos = PathFinder.getDirectionPos(nextPos, currDir);
        if (GBattleManager.canPassable(nextPos.x, nextPos.y)) {
            return true;
        }
        return false;
    };
    p._aiPerform_HitWall2TurnRL = function () {
        var nextPos = this._currPos.clone();
        if (this._aiTest2MoveDirection(nextPos, this._currDir)) {
            this._moveOneStep(nextPos.x, nextPos.y, this._moveSpeed);
            egret.Point.release(nextPos);
            return;
        }
        var rightDir = (this._currDir + (4 /* MAX */ - 1)) % 4 /* MAX */;
        nextPos.copyFrom(this._currPos);
        if (this._aiTest2MoveDirection(nextPos, rightDir)) {
            this._moveOneStep(nextPos.x, nextPos.y, this._moveSpeed);
            egret.Point.release(nextPos);
            this._currDir = rightDir;
            return;
        }
        var leftDir = (this._currDir + 1) % 4 /* MAX */;
        nextPos.copyFrom(this._currPos);
        if (this._aiTest2MoveDirection(nextPos, leftDir)) {
            this._moveOneStep(nextPos.x, nextPos.y, this._moveSpeed);
            egret.Point.release(nextPos);
            this._currDir = leftDir;
            return;
        }
        var backDir = (this._currDir + 2) % 4 /* MAX */;
        nextPos.copyFrom(this._currPos);
        if (this._aiTest2MoveDirection(nextPos, backDir)) {
            this._moveOneStep(nextPos.x, nextPos.y, this._moveSpeed);
            this._currDir = backDir;
        }
        egret.Point.release(nextPos);
    };
    p._aiPerform_Freedom = function () {
        var nextPos = this._findNextRandomPos(this._currPos);
        if (null !== nextPos) {
            this._moveOneStep(nextPos.x, nextPos.y, this._moveSpeed, true);
            egret.Point.release(nextPos);
        }
    };
    p._aiPerformMovement = function () {
        if (this._orderType === 0 /* NONE */) {
            if (this._tid < TILE_ADDIN_MONSTER_B) {
                this._aiPerform_HitWall2Turn();
            }
            else if (this._tid < TILE_ADDIN_MONSTER_C) {
                this._aiPerform_HitWall2TurnRL();
            }
            else if (this._tid < TILE_ADDIN_MONSTER_D) {
                this._aiPerform_Guard2Turn();
            }
            else {
                this._aiPerform_Freedom();
            }
        }
        this._needScheduling = true;
    };
    return Monster;
})(Actor);
egret.registerClass(Monster,"Monster");
