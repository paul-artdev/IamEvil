


enum ORDER_TYPE
{
    NONE    =   0,
    
    BORN    =   1,
    DEATH   =   2,
    
    MOVE    =   3,
    ATTACK  =   4,
    
    MAX     =   5,
};

class Actor extends egret.Sprite
{
    public static UUID:number = 1;
    protected _sprBitmap: egret.Bitmap = null;
    protected _sprHealBar: egret.Shape = null;
    protected _sprCritInfo: egret.Bitmap = null;
    
    
    protected _tid: number = 0;
    protected _uuid: number = 0;
    protected _zOrder: number = 0;
    
	//protected _battleScene: = null;
    protected _needScheduling: boolean = false;

    protected _spawnPos: egret.Point = null;
    protected _currPos: egret.Point = null;
    protected _nextMovePos: egret.Point = null;
    
    protected _orderType:ORDER_TYPE = ORDER_TYPE.NONE;
    protected _orderActor: Array<number> = null;
    protected _orderPos:Array<egret.Point> = null;
    
    
    protected _isAlive: boolean = false;
    protected _isMonster: boolean = false;
    
    protected _templateData:any = null;
    protected _heal: number = 160;      // 240
    protected _max_heal: number = 160;
    
    protected _damage: number = 6;      // 16~24
    protected _max_damage: number = 10;

    protected _atkSpeed: number = 1000;
    protected _moveSpeed: number = 5000;
    

    
    public constructor() 
    {
        super();
    }
    
    public get tid():number
    {
        return this._tid;
    }
    
    public get uuid():number
    {
        return this._uuid;
    }
    
    public get zOrder():number
    {
        return this._zOrder;
    }
    
    public get currPos():egret.Point
    {
        return this._currPos;
    }
    
    public get nextMovePos():egret.Point
    {
        return this._nextMovePos;
    }
    
    public get isAlive():boolean
    {
        return this._isAlive;
    }
    
    public get isMonster():boolean
    {
        return this._isMonster;
    }
    
    public get hasOrderActor():boolean
    {
        return ((this._orderActor !== null) && (this._orderActor.length > 0));
    }
    
    protected _doCreateSprite(tid:number, xx:number, yy:number):void
    {
        this._sprBitmap = new egret.Bitmap();
        this.addChild( this._sprBitmap );
        this._sprBitmap.texture = RES.getRes("role_0"+tid);
        
        this.anchorOffsetX = TILE_HALF_WIDTH;
        this.anchorOffsetY = TILE_HALF_HEIGHT;
                
        this.x = xx * TILE_CELL_WIDTH + TILE_HALF_WIDTH;
        this.y = yy * TILE_CELL_HEIGHT + TILE_HALF_HEIGHT;
    }

    protected _doCreateData(id:number, tid:number, xx:number, yy:number):void
    {
        this._tid = tid;
        this._uuid = id;
        this._isAlive = false;
        this._currPos = egret.Point.create(xx,yy);
        this._nextMovePos = this._currPos.clone();
        this._spawnPos = this._currPos.clone();
        
        this._orderActor = [];
        this._zOrder = yy * GRID_WIDTH_MAX + xx;
        //this._orderPos = egret.Point.create(0,0);
    }

    public doCreate(tid:number, x:number, y:number):void
    {
        var adb = TemplateData.getActorData(tid, this._isMonster);
        this._doCreateSprite(adb.sprID, x, y);
        this._doCreateData(Actor.UUID ++, tid, x, y);
        
        this._templateData = adb;
        this._heal = adb.heal;
        this._max_heal = adb.heal_max;
        this._damage = adb.dmg;
        this._max_damage = adb.dmg_max;
        this._atkSpeed = adb.atkSpeed;
        this._moveSpeed = adb.moveSpeed;
        
        this._doUpdateHealbar();
    }

    public doBorn():void
    {
        this.alpha = 0.1;
        
        this._isAlive = false;
        this._orderType = ORDER_TYPE.BORN;
        this._needScheduling = false;
        
        var tw = egret.Tween.get(this);
        tw.to( {alpha:1.0}, 1000 )
          .call(function() { 
                this._isAlive = true;
                this._orderActor = [];
                this._orderType = ORDER_TYPE.NONE;
                this._needScheduling = true;
            }, 
            this);
    }

    public doDeath():void
    {
        this.alpha = 1.0;
        this.blendMode = egret.BlendMode.ADD;
        
        this._isAlive = false;
        this._orderType = ORDER_TYPE.DEATH;
        this._needScheduling = false;
        
        egret.Tween.pauseTweens(this);
        egret.Tween.removeTweens(this);
        
        var tw = egret.Tween.get(this);
        tw.to( {alpha:0.1}, 1500 )
          .call(function() { 
                this.alpha = 0;
                this.blendMode = egret.BlendMode.NORMAL;
                
                this.stopMovement();
                this._needScheduling = false;
                this._sprHealBar.visable = false;
                this._orderType = ORDER_TYPE.NONE;

                GBattleScene.removeFrom(this);
                GBattleManager.diedActor(this);
                //GBattleScene.updateCell(
            }, 
            this);
    }

    public doDefense2Attack(tarActor:Actor):void
    {
        var idx:number = this._orderActor.indexOf( tarActor.uuid );
		if(idx === -1) {
            this._orderActor.push(tarActor.uuid);
        }
        
        if (1 === this._orderActor.length) {
            this._needScheduling = false;
            this._fixedLocation();
            this._moveOneStep(this._currPos.x, this._currPos.y, 300);
        }
    }
    
    public doMove2Attack(tarActor:Actor):void
    { 
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
                var isCenter:boolean = ((this.x % TILE_CELL_WIDTH) === 0) && ((this.y % TILE_CELL_HEIGHT) === 0);
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
    }
    
    public doTakeDamage(dmg:number, tarActor:Actor, hasCrit:boolean=false):void
    {
        if (this._isAlive) {
            dmg = hasCrit ? dmg : dmg * (1.0 - this._templateData.armor);
            this._heal = Math.max(this._heal - dmg, 0);
            this._doUpdateHealbar();
            this._doUpdateCrit(hasCrit);
            if (0 === this._heal) {
                this.doDeath();
                return ;
            }
        }
    }
    
    public stopMovement():void
    {
        if (this._orderType === ORDER_TYPE.MOVE) {
            egret.Tween.pauseTweens(this);
            egret.Tween.removeTweens(this);
            this._orderType = ORDER_TYPE.NONE;
        }
        
        if ((null !== this._orderPos) && (this._orderPos.length > 0)) {
            GBattleManager.releasePathResult(this._orderPos);
            this._orderPos = null;
        }
    }
    
    protected _getFixedPos(pos:egret.Point, px:number, py:number):void
    {
        var xp = Math.round(px / TILE_CELL_WIDTH);
        var yp = Math.round(py / TILE_CELL_HEIGHT);
        
        pos.setTo(xp, yp);
    }
    
    protected _fixedLocation():void
    {
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
    }
    
    protected _moveOneStep(px:number, py:number, speed:number, waitSec:boolean=false):void
    {
        this._orderType = ORDER_TYPE.MOVE;
        this._needScheduling = false;
        this._nextMovePos.setTo(px, py);
        
        this._zOrder = py * GRID_WIDTH_MAX + px;
        GBattleScene.markZOrderDirty();
        
        //var parent = <egret.Sprite>this.parent;
        
        //parent.graphics.lineStyle(1, 0x00FF00);
        //parent.graphics.moveTo(this.x, this.y);
        //parent.graphics.lineTo(px*TILE_CELL_WIDTH + TILE_HALF_WIDTH, py*TILE_CELL_HEIGHT + TILE_HALF_HEIGHT);
        
        var tw = egret.Tween.get(this);
        tw.to( {x:px*TILE_CELL_WIDTH + TILE_HALF_WIDTH, y:py*TILE_CELL_HEIGHT + TILE_HALF_HEIGHT}, speed )
          .call( function(xx, yy, needSched) { 
                this._currPos.setTo(xx, yy);
                //this._zOrder = yy * GRID_WIDTH_MAX + xx;
                //GBattleScene.markZOrderDirty();
                
                this._orderType = ORDER_TYPE.NONE;
                this._needScheduling = needSched;
            }, 
            this, [px, py, true]);//
            //.wait(waitSec ? 200 : 0);
    }

    protected _attackOnce(tarActor:Actor, tarDir:PATH_DIR):void
    {
        this._orderType = ORDER_TYPE.ATTACK;
        this._needScheduling = false;
        
        var dmgType = this.calcDamage(tarActor);
            
        var nextPos = egret.Point.create(0,0);
        nextPos = PathFinder.getDirectionPos(nextPos,tarDir);
        
        var tw = egret.Tween.get(this);
        var firstSpeed = this._atkSpeed * 0.7;
        
        tw.to( {x: this.x + nextPos.x*TILE_FOURTH_WIDTH, y: this.y + nextPos.y*TILE_FOURTH_HEIGHT}, firstSpeed )
          .call(function(dmgVal, tarUid) {
                var dmgActor = this._isMonster ? GBattleManager.getBraver(tarUid) : GBattleManager.getMonster(tarUid);
                if (null !== dmgActor) {
                    dmgActor.doTakeDamage(dmgVal.value, this, dmgVal.crit);
                }
            }, 
            this, [dmgType, tarActor.uuid])
          .to( {x: this.x, y: this.y}, this._atkSpeed - firstSpeed )
          .call(function() {
                this._orderType = ORDER_TYPE.NONE;
                this._needScheduling = true;
            },
            this);
    }

    protected _doUpdateCrit(hasCrit:boolean):void
    {
        if (null === this._sprCritInfo) {
            this._sprCritInfo = new egret.Bitmap();
            this.addChild( this._sprCritInfo );
            
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
            tw.wait(50)
              .to( {scaleX:1.3, scaleY:1.3}, 50 )
              .to( {scaleX:1.0, scaleY:1.0}, 70 )
              .wait(200)
              .call(function() { 
                this._sprCritInfo.visible = false;
                this._sprCritInfo.scaleX = 1.0;
                this._sprCritInfo.scaleY = 1.0;
              }, 
              this);
        }
    }
    
    protected _doUpdateHealbar():void
    {
        if (null === this._sprHealBar) {
            this._sprHealBar = new egret.Shape();
            this.addChild( this._sprHealBar );
        }
        
        var wp:number = this._templateData.heal_w;//TILE_CELL_WIDTH - 16;
        var lp:number = (TILE_CELL_WIDTH - wp) * 0.5;
        var top:number = this._templateData.heal_top;
        
        //this._sprHealBar.graphics.lineStyle(1, 0xFFFFFF);
        this._sprHealBar.graphics.beginFill( 0xFF0000, 1);
        this._sprHealBar.graphics.drawRect( lp, top, wp, 6 );
        this._sprHealBar.graphics.endFill();
        
        var rp:number = wp * (this._heal / this._max_heal);
        this._sprHealBar.graphics.beginFill( 0x00FF00, 1);
        this._sprHealBar.graphics.drawRect( lp, top, rp, 6 );
        this._sprHealBar.graphics.endFill();
        
    }
    
    public calcDamage(byAttack:Actor):any
    {
        var val = Math.floor(Math.random() * 100);
        var diff = this._max_damage - this._damage + 1;
        var hasCrit = 90 <= Math.floor(Math.random() * 100);
        
        val = this._damage + (val % diff);
        if (hasCrit) {
            val *= 2;
        }
        
        return { value:val, crit:hasCrit };
    }
    
    public adjustTime(dt:number):void
    {
        if(this._aiControll(dt)) {
            this._aiScheduling(dt);
        }
    }
    

	protected _aiControll(dt:number):boolean
	{
        var needSched = this._needScheduling;
        this._needScheduling = false;
        return needSched;
	}

    protected _aiScheduling(dt:number):void
    {
        if (!this.hasOrderActor) {
            this._aiLineOfSightTo();
        }
        
        if (this.hasOrderActor) {
            this._aiChaseAttack();
        }
        else {
            this._aiPerformMovement();
        }
    }
    
    protected _aiLineOfSightTo():void
    {
        /*var nearActor:Actor = this._findNearestEnemy(2, true);
        if ((null !== nearActor) && nearActor.isAlive) {
            this.stopMovement();
            nearActor.stopMovement();
                
            this.doDefense2Attack(nearActor);
            nearActor.doMove2Attack(this);
            
            return false;
        }*/
        
    }
    
    protected _aiChaseAttack():void
    {
        
    }
    
    protected _aiPerformMovement():void
    {
        
    }
    
    protected _findNextRandomPos(currPos:egret.Point):egret.Point
    {
        var newPos = currPos.clone();
        var newCount = 0;
        var newDir = Math.floor(Math.random() * 100) % 4;
        newDir = Math.min(newDir, 3);
        
        do {
            newPos.copyFrom(currPos);
            newPos = PathFinder.getDirectionPos(newPos,newDir);
            if (GBattleManager.canPassable(newPos.x, newPos.y)) {
                return newPos;
            }
            
            newCount += 1;
            newDir = (newDir + 1) % PATH_DIR.MAX;
            
        } while(newCount < 10);
        
        egret.Point.release(newPos);
        return null;
    }
    
    protected _getBestOrderActor():Actor
    {
        var tarActor:Actor = null;
        
        do {
            tarActor = this.isMonster ? GBattleManager.getBraver(this._orderActor[0])
                                    :   GBattleManager.getMonster(this._orderActor[0]);
            if ((null !== tarActor) && tarActor.isAlive) {
                break ;
            }
            
            this._orderActor.shift();
        
        }while(this.hasOrderActor);
        
        return tarActor;
    }
    
    protected _verifiedThrough(dist:number, posStart:egret.Point, posEnd:egret.Point):boolean
    {
        var testDir = PathFinder.calcDirection(posStart, posEnd);
        var testPos = posStart.clone();
        for (var i = 0; i < dist; ++ i) {
            testPos = PathFinder.getDirectionPos(testPos,testDir);
            if (!GBattleManager.canPassable(testPos.x, testPos.y)) {
                egret.Point.release(testPos);
                return false;
            }
        }
        
        egret.Point.release(testPos);
        return true;
    }

    protected _findNearestEnemy(maxDist:number=2, needVerified:boolean=false):Actor
    {
        var nearActors:Array<any> = GBattleManager.getNearestActor(this._currPos, maxDist, !this._isMonster);
        var aBestActor:Actor = null;
        var aBestDist:number = maxDist + 1;
        
        for (var i = 0; i < nearActors.length; ++ i) {
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
    }
   
}
    