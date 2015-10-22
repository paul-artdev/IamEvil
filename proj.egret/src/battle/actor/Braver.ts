


class Braver extends Actor
{
    private _pathStep:number = 10;
    private _hasTakeChest:boolean = false;
    
    
	public constructor() 
	{
        super();
        this._isMonster = false;
	}
	
    public doBorn():void
    {
        super.doBorn();
        this._hasTakeChest = false;
    }
	
    public doDeath():void
    {
        GPlayerInst.doKillBraver();
        super.doDeath();
    }
    
    protected _aiChaseAttack():void
    {
        if (ORDER_TYPE.NONE !== this._orderType) {
            this._needScheduling = true;
            return ;
        }
        
        var tarActor:Actor = this._getBestOrderActor();
        if ((null !== tarActor) && tarActor.isAlive) {
            // test distance
            var tarDist = egret.Point.distance(this._currPos, tarActor.currPos);
            var tarDir = PathFinder.calcDirection(this._currPos, tarActor.currPos);
            if (tarDist <= 1) {
                // do attack
                this._attackOnce(tarActor, tarDir);
                return ;
            }
        }

        this._needScheduling = true;
    }

    protected _aiTakeTheChest():void
    {
        //GBattleManager.doTakeTheChest(this);
        console.info("_aiTakeTheChest");
    }
    
    protected _aiDoGameOver():void
    {
        GBattleManager.doBattleOver();
        console.info("GAME OVER");
    }
    
    protected _aiPerformMovement():void
    {
        if (this._orderType === ORDER_TYPE.NONE) {
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
                    return ;
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
                    return ;
                }
                
                this.stopMovement();
                egret.Point.release(nextPos);
            }
        }
        
        
        this._needScheduling = true;
    }
}
    