var ORDER_TYPE;
(function (ORDER_TYPE) {
    ORDER_TYPE[ORDER_TYPE["NONE"] = 0] = "NONE";
    ORDER_TYPE[ORDER_TYPE["BORN"] = 1] = "BORN";
    ORDER_TYPE[ORDER_TYPE["DEATH"] = 2] = "DEATH";
    ORDER_TYPE[ORDER_TYPE["MOVE"] = 3] = "MOVE";
    ORDER_TYPE[ORDER_TYPE["ATTACK"] = 4] = "ATTACK";
    ORDER_TYPE[ORDER_TYPE["MAX"] = 5] = "MAX";
})(ORDER_TYPE || (ORDER_TYPE = {}));
;
var Actor = (function (_super) {
    __extends(Actor, _super);
    function Actor() {
        _super.call(this);
        this._sprBitmap = null;
        this._sprHealBar = null;
        this._sprCritInfo = null;
        this._tid = 0;
        this._uuid = 0;
        this._zOrder = 0;
        //protected _battleScene: = null;
        this._needScheduling = false;
        this._spawnPos = null;
        this._currPos = null;
        this._nextMovePos = null;
        this._orderType = 0 /* NONE */;
        this._orderActor = null;
        this._orderPos = null;
        this._isAlive = false;
        this._isMonster = false;
        this._templateData = null;
        this._heal = 160; // 240
        this._max_heal = 160;
        this._damage = 6; // 16~24
        this._max_damage = 10;
        this._atkSpeed = 1000;
        this._moveSpeed = 5000;
    }
    var d = __define,c=Actor;p=c.prototype;
    d(p, "tid"
        ,function () {
            return this._tid;
        }
    );
    d(p, "uuid"
        ,function () {
            return this._uuid;
        }
    );
    d(p, "zOrder"
        ,function () {
            return this._zOrder;
        }
    );
    d(p, "currPos"
        ,function () {
            return this._currPos;
        }
    );
    d(p, "nextMovePos"
        ,function () {
            return this._nextMovePos;
        }
    );
    d(p, "isAlive"
        ,function () {
            return this._isAlive;
        }
    );
    d(p, "isMonster"
        ,function () {
            return this._isMonster;
        }
    );
    d(p, "hasOrderActor"
        ,function () {
            return ((this._orderActor !== null) && (this._orderActor.length > 0));
        }
    );
    p._doCreateSprite = function (tid, xx, yy) {
        this._sprBitmap = new egret.Bitmap();
        this.addChild(this._sprBitmap);
        this._sprBitmap.texture = RES.getRes("role_0" + tid);
        this.anchorOffsetX = TILE_HALF_WIDTH;
        this.anchorOffsetY = TILE_HALF_HEIGHT;
        this.x = xx * TILE_CELL_WIDTH + TILE_HALF_WIDTH;
        this.y = yy * TILE_CELL_HEIGHT + TILE_HALF_HEIGHT;
    };
    p._doCreateData = function (id, tid, xx, yy) {
        this._tid = tid;
        this._uuid = id;
        this._isAlive = false;
        this._currPos = egret.Point.create(xx, yy);
        this._nextMovePos = this._currPos.clone();
        this._spawnPos = this._currPos.clone();
        this._orderActor = [];
        this._zOrder = yy * GRID_WIDTH_MAX + xx;
        //this._orderPos = egret.Point.create(0,0);
    };
    p.doCreate = function (tid, x, y) {
        var adb = TemplateData.getActorData(tid, this._isMonster);
        this._doCreateSprite(adb.sprID, x, y);
        this._doCreateData(Actor.UUID++, tid, x, y);
        this._templateData = adb;
        this._heal = adb.heal;
        this._max_heal = adb.heal_max;
        this._damage = adb.dmg;
        this._max_damage = adb.dmg_max;
        this._atkSpeed = adb.atkSpeed;
        this._moveSpeed = adb.moveSpeed;
        this._doUpdateHealbar();
    };
    p.doBorn = function () {
        this.alpha = 0.1;
        this._isAlive = false;
        this._orderType = 1 /* BORN */;
        this._needScheduling = false;
        var tw = egret.Tween.get(this);
        tw.to({ alpha: 1.0 }, 1000).call(function () {
            this._isAlive = true;
            this._orderActor = [];
            this._orderType = 0 /* NONE */;
            this._needScheduling = true;
        }, this);
    };
    p.doDeath = function () {
        this.alpha = 1.0;
        this.blendMode = egret.BlendMode.ADD;
        this._isAlive = false;
        this._orderType = 2 /* DEATH */;
        this._needScheduling = false;
        egret.Tween.pauseTweens(this);
        egret.Tween.removeTweens(this);
        var tw = egret.Tween.get(this);
        tw.to({ alpha: 0.1 }, 1500).call(function () {
            this.alpha = 0;
            this.blendMode = egret.BlendMode.NORMAL;
            this.stopMovement();
            this._needScheduling = false;
            this._sprHealBar.visable = false;
            this._orderType = 0 /* NONE */;
            GBattleScene.removeFrom(this);
            GBattleManager.diedActor(this);
            //GBattleScene.updateCell(
        }, this);
    };
    p.doDefense2Attack = function (tarActor) {
        var idx = this._orderActor.indexOf(tarActor.uuid);
        if (idx === -1) {
            this._orderActor.push(tarActor.uuid);
        }
        if (1 === this._orderActor.length) {
            this._needScheduling = false;
            this._fixedLocation();
            this._moveOneStep(this._currPos.x, this._currPos.y, 300);
        }
    };
    p.doMove2Attack = function (tarActor) {
        this._orderActor = [tarActor.uuid];
        if (this._currPos.equals(tarActor.currPos)) {
            var newPos = this._findNextRandomPos(this._currPos);
            if (null !== newPos) {
                this._moveOneStep(newPos.x, newPos.y, 200);
                egret.Point.release(newPos);
            }
        }
        else {
            var tarDist = egret.Point.distance(this._currPos, tarActor.currPos);
            if (tarDist <= 1) {
                var isCenter = ((this.x % TILE_CELL_WIDTH) === 0) && ((this.y % TILE_CELL_HEIGHT) === 0);
                if (!isCenter) {
                    //if (this._currPos.equals(tarActor.currPos)
                    this._moveOneStep(this._currPos.x, this._currPos.y, 200);
                }
            }
            else {
                this._orderPos = GBattleManager.findAStarPath(this._currPos, tarActor.currPos);
                if ((null !== this._orderPos) && (this._orderPos.length > 1)) {
                    this._orderPos.shift();
                    this._orderPos.pop();
                }
                this._needScheduling = true;
            }
        }
    };
    p.doTakeDamage = function (dmg, tarActor, hasCrit) {
        if (hasCrit === void 0) { hasCrit = false; }
        if (this._isAlive) {
            dmg = hasCrit ? dmg : dmg * (1.0 - this._templateData.armor);
            this._heal = Math.max(this._heal - dmg, 0);
            this._doUpdateHealbar();
            this._doUpdateCrit(hasCrit);
            if (0 === this._heal) {
                this.doDeath();
                return;
            }
        }
    };
    p.stopMovement = function () {
        if (this._orderType === 3 /* MOVE */) {
            egret.Tween.pauseTweens(this);
            egret.Tween.removeTweens(this);
            this._orderType = 0 /* NONE */;
        }
        if ((null !== this._orderPos) && (this._orderPos.length > 0)) {
            GBattleManager.releasePathResult(this._orderPos);
            this._orderPos = null;
        }
    };
    p._getFixedPos = function (pos, px, py) {
        var xp = Math.round(px / TILE_CELL_WIDTH);
        var yp = Math.round(py / TILE_CELL_HEIGHT);
        pos.setTo(xp, yp);
    };
    p._fixedLocation = function () {
        var ll = this._currPos.x * TILE_CELL_WIDTH;
        var ly = this._currPos.y * TILE_CELL_HEIGHT;
        if (Math.abs(this.x - ll) > TILE_HALF_WIDTH) {
            this._currPos.x = this._nextMovePos.x;
        }
        else {
            this._nextMovePos.x = this._currPos.x;
        }
        if (Math.abs(this.y - ly) > TILE_HALF_HEIGHT) {
            this._currPos.y = this._nextMovePos.y;
        }
        else {
            this._nextMovePos.y = this._currPos.y;
        }
    };
    p._moveOneStep = function (px, py, speed, waitSec) {
        if (waitSec === void 0) { waitSec = false; }
        this._orderType = 3 /* MOVE */;
        this._needScheduling = false;
        this._nextMovePos.setTo(px, py);
        this._zOrder = py * GRID_WIDTH_MAX + px;
        GBattleScene.markZOrderDirty();
        //var parent = <egret.Sprite>this.parent;
        //parent.graphics.lineStyle(1, 0x00FF00);
        //parent.graphics.moveTo(this.x, this.y);
        //parent.graphics.lineTo(px*TILE_CELL_WIDTH + TILE_HALF_WIDTH, py*TILE_CELL_HEIGHT + TILE_HALF_HEIGHT);
        var tw = egret.Tween.get(this);
        tw.to({ x: px * TILE_CELL_WIDTH + TILE_HALF_WIDTH, y: py * TILE_CELL_HEIGHT + TILE_HALF_HEIGHT }, speed).call(function (xx, yy, needSched) {
            this._currPos.setTo(xx, yy);
            //this._zOrder = yy * GRID_WIDTH_MAX + xx;
            //GBattleScene.markZOrderDirty();
            this._orderType = 0 /* NONE */;
            this._needScheduling = needSched;
        }, this, [px, py, true]); //
        //.wait(waitSec ? 200 : 0);
    };
    p._attackOnce = function (tarActor, tarDir) {
        this._orderType = 4 /* ATTACK */;
        this._needScheduling = false;
        var dmgType = this.calcDamage(tarActor);
        var nextPos = egret.Point.create(0, 0);
        nextPos = PathFinder.getDirectionPos(nextPos, tarDir);
        var tw = egret.Tween.get(this);
        var firstSpeed = this._atkSpeed * 0.7;
        tw.to({ x: this.x + nextPos.x * TILE_FOURTH_WIDTH, y: this.y + nextPos.y * TILE_FOURTH_HEIGHT }, firstSpeed).call(function (dmgVal, tarUid) {
            var dmgActor = this._isMonster ? GBattleManager.getBraver(tarUid) : GBattleManager.getMonster(tarUid);
            if (null !== dmgActor) {
                dmgActor.doTakeDamage(dmgVal.value, this, dmgVal.crit);
            }
        }, this, [dmgType, tarActor.uuid]).to({ x: this.x, y: this.y }, this._atkSpeed - firstSpeed).call(function () {
            this._orderType = 0 /* NONE */;
            this._needScheduling = true;
        }, this);
    };
    p._doUpdateCrit = function (hasCrit) {
        if (null === this._sprCritInfo) {
            this._sprCritInfo = new egret.Bitmap();
            this.addChild(this._sprCritInfo);
            this._sprCritInfo.visible = false;
            /*if (this._isMonster) {
                this._sprCritInfo.texture = RES.getRes("crit_right");
                this._sprCritInfo.anchorOffsetX = - TILE_CELL_WIDTH + TILE_HALF_WIDTH * 0.5;
            }
            else {*/
            this._sprCritInfo.texture = RES.getRes("crit_left");
            this._sprCritInfo.anchorOffsetX = TILE_HALF_WIDTH * 0.5;
            //}
            this._sprCritInfo.anchorOffsetY = TILE_HALF_HEIGHT * 0.5;
        }
        if (!this._sprCritInfo.visible && hasCrit) {
            this._sprCritInfo.visible = true;
            this._sprCritInfo.scaleX = 0.0;
            this._sprCritInfo.scaleY = 0.0;
            var tw = egret.Tween.get(this._sprCritInfo);
            tw.wait(50).to({ scaleX: 1.3, scaleY: 1.3 }, 50).to({ scaleX: 1.0, scaleY: 1.0 }, 70).wait(200).call(function () {
                this._sprCritInfo.visible = false;
                this._sprCritInfo.scaleX = 1.0;
                this._sprCritInfo.scaleY = 1.0;
            }, this);
        }
    };
    p._doUpdateHealbar = function () {
        if (null === this._sprHealBar) {
            this._sprHealBar = new egret.Shape();
            this.addChild(this._sprHealBar);
        }
        var wp = this._templateData.heal_w; //TILE_CELL_WIDTH - 16;
        var lp = (TILE_CELL_WIDTH - wp) * 0.5;
        var top = this._templateData.heal_top;
        //this._sprHealBar.graphics.lineStyle(1, 0xFFFFFF);
        this._sprHealBar.graphics.beginFill(0xFF0000, 1);
        this._sprHealBar.graphics.drawRect(lp, top, wp, 6);
        this._sprHealBar.graphics.endFill();
        var rp = wp * (this._heal / this._max_heal);
        this._sprHealBar.graphics.beginFill(0x00FF00, 1);
        this._sprHealBar.graphics.drawRect(lp, top, rp, 6);
        this._sprHealBar.graphics.endFill();
    };
    p.calcDamage = function (byAttack) {
        var val = Math.floor(Math.random() * 100);
        var diff = this._max_damage - this._damage + 1;
        var hasCrit = 90 <= Math.floor(Math.random() * 100);
        val = this._damage + (val % diff);
        if (hasCrit) {
            val *= 2;
        }
        return { value: val, crit: hasCrit };
    };
    p.adjustTime = function (dt) {
        if (this._aiControll(dt)) {
            this._aiScheduling(dt);
        }
    };
    p._aiControll = function (dt) {
        var needSched = this._needScheduling;
        this._needScheduling = false;
        return needSched;
    };
    p._aiScheduling = function (dt) {
        if (!this.hasOrderActor) {
            this._aiLineOfSightTo();
        }
        if (this.hasOrderActor) {
            this._aiChaseAttack();
        }
        else {
            this._aiPerformMovement();
        }
    };
    p._aiLineOfSightTo = function () {
        /*var nearActor:Actor = this._findNearestEnemy(2, true);
        if ((null !== nearActor) && nearActor.isAlive) {
            this.stopMovement();
            nearActor.stopMovement();
                
            this.doDefense2Attack(nearActor);
            nearActor.doMove2Attack(this);
            
            return false;
        }*/
    };
    p._aiChaseAttack = function () {
    };
    p._aiPerformMovement = function () {
    };
    p._findNextRandomPos = function (currPos) {
        var newPos = currPos.clone();
        var newCount = 0;
        var newDir = Math.floor(Math.random() * 100) % 4;
        newDir = Math.min(newDir, 3);
        do {
            newPos.copyFrom(currPos);
            newPos = PathFinder.getDirectionPos(newPos, newDir);
            if (GBattleManager.canPassable(newPos.x, newPos.y)) {
                return newPos;
            }
            newCount += 1;
            newDir = (newDir + 1) % 4 /* MAX */;
        } while (newCount < 10);
        egret.Point.release(newPos);
        return null;
    };
    p._getBestOrderActor = function () {
        var tarActor = null;
        do {
            tarActor = this.isMonster ? GBattleManager.getBraver(this._orderActor[0]) : GBattleManager.getMonster(this._orderActor[0]);
            if ((null !== tarActor) && tarActor.isAlive) {
                break;
            }
            this._orderActor.shift();
        } while (this.hasOrderActor);
        return tarActor;
    };
    p._verifiedThrough = function (dist, posStart, posEnd) {
        var testDir = PathFinder.calcDirection(posStart, posEnd);
        var testPos = posStart.clone();
        for (var i = 0; i < dist; ++i) {
            testPos = PathFinder.getDirectionPos(testPos, testDir);
            if (!GBattleManager.canPassable(testPos.x, testPos.y)) {
                egret.Point.release(testPos);
                return false;
            }
        }
        egret.Point.release(testPos);
        return true;
    };
    p._findNearestEnemy = function (maxDist, needVerified) {
        if (maxDist === void 0) { maxDist = 2; }
        if (needVerified === void 0) { needVerified = false; }
        var nearActors = GBattleManager.getNearestActor(this._currPos, maxDist, !this._isMonster);
        var aBestActor = null;
        var aBestDist = maxDist + 1;
        for (var i = 0; i < nearActors.length; ++i) {
            var currActor = nearActors[i].actor;
            if (currActor.isAlive && (aBestDist > nearActors[i].dist)) {
                if (!needVerified || this._verifiedThrough(maxDist, this._currPos, currActor.currPos)) {
                    //if (!needVerified || this.hasMaxDist2LineOfSight(this._currPos, currActor.currPos, maxDist)) {
                    aBestDist = nearActors[i].dist;
                    aBestActor = currActor;
                }
            }
        }
        return aBestActor;
    };
    Actor.UUID = 1;
    return Actor;
})(egret.Sprite);
egret.registerClass(Actor,"Actor");
