
/*
    A* 算法描述

    1.把起始节点S放入OPEN表中，计算f(S)，把值和S节点连结 
    2.如果OPEN为空表,则无解,退出. 
    3.在OPEN表中选择一个f值最小的节点,如果有多个节点满足要求,当其中有目标节点时,选择目标节点,否则随便选择一个,作为i 
    4.把i从OPEN表中移去,加入CLOSED表中. 
    5.如果i是目标,则成功退出,有一个解 
    6.扩展节点i,生成全部后续节点,对于每个后续节点j:
        a..计算f(j). 
        b..如果j不在OPEN表和CLOSED表中,则加入OPEN表,并产生一个指向i的指针,以便求解答路径. 
        c..如果j已在OPEN表或CLOSED表.则比较刚计算的f(j)值和以前的值,如果新值小:以新值取代旧值,从j指向i,如果在CLOSED表中则把其从CLOSED表中移回OPEN表. 
    7.转向2.
*/



enum PATH_DIR
{
    SOUTH   =   0,  // 南
    WEST    =   1,  // 西
    NORTH   =   2,  // 北
    EAST    =   3,  // 东
    
    MAX     =   4,
};

class PathNode
{
    public static PoolCached: Array<PathNode> = [];
    public static create():PathNode
    {
        var pathNode = PathNode.PoolCached.pop();
        if (!pathNode) {
            pathNode = new PathNode();
        }
        return pathNode;
    }
    
    public static release(pathNode:PathNode):void
    {
        if (!pathNode) {
            return;
        }
        
        PathNode.PoolCached.push(pathNode);
    }
    
    public parent:PathNode = null;
    public next:PathNode = null;

    public childList:Array<PathNode> = [];
    public childCount:number = 0;
    
    public pos:egret.Point;
    public oppositeDir:number = 0;
    
    public actualCost:number = 0;    // 从起点，沿着产生的路径，移动到当前节点的移动耗费
    public estimateCost:number = 0;  // 从本节点移动到终点的预估移动耗费
    public heuristicCost:number = 0; // 从本节点移动到终点的启发函数移动耗费
}


class PathFinder
{
    private _posStart:egret.Point = null;
    private _posEnd:egret.Point = null;
    
    private _bestNode:PathNode = null;
    private _openNodeList:PathNode = null;
    private _closeNodeList:PathNode = null;
    
    private _hasRightPath = false;
    
    
    public constructor() 
    {
    }
    
    public findAStarPath(ps:egret.Point, pe:egret.Point, limitStep:number = 10000):Array<egret.Point>
    {
        this._bestNode = null;
        this._openNodeList = null;
        this._closeNodeList = null;
        
        this._posStart = ps;
        this._posEnd = pe;
        
        var dir = PathFinder.calcDirection(ps, pe);
        this._openNodeList = this._allocNode(ps.clone(), dir, null);
        
        this._hasRightPath = true;
        if (this._astarSearch(limitStep)) {
            return this._astarFinished();
        }
        
        return null;
    }
    
    private _canPassable(px:number, py:number):boolean
    {
        return GBattleManager.canPassable(px, py);
    }
    
    private _astarStep( ):number
    {
        this._bestNode = this._getBest();
        if (null === this._bestNode) {
            return -1;
        }

        // check for arrival at destination
        if (this._bestNode.pos.equals( this._posEnd )) {
            return 1;
        }

        this._appendChild( this._bestNode );
        return 0;
    }

    private _astarSearch( InStep:number ):boolean
    {
        var retVal = 0;
        for (var i = 0; i < InStep; ++ i)
        {
            retVal = this._astarStep( );
            if (0 !== retVal) {
                break ;
            }
        
        }


        // 是不是无解？
        if ((-1 === retVal) || (null === this._bestNode)) {
            this._bestNode = null;
            this._hasRightPath = false;
            return false;
        }


        // 超出步数, 从Openlist && Closedlist中找一个从本节点移动到终点的预估移动耗费最小的
        if (!this._bestNode.pos.equals(this._posEnd)) {
            
            var TotalList = [ this._openNodeList, this._closeNodeList, null];

            this._hasRightPath = false;
            this._bestNode = null;
            for ( var i = 0; null != TotalList[i]; ++ i )
            {
                var pNode:PathNode = TotalList[i];
                for ( ; null != pNode; pNode = pNode.next )
                {
                    if (( null === this._bestNode)
                        || (this._bestNode.heuristicCost > pNode.heuristicCost)) {
                        this._bestNode = pNode;
                    }
                }

            }
        }


        return true;
    }

    private _astarClear():void
    {
        while ( null !== this._openNodeList )
        {
            var temp = this._openNodeList.next;
            egret.Point.release( this._openNodeList.pos );
            PathNode.release( this._openNodeList );
            this._openNodeList = temp;
        }

        while ( null !== this._closeNodeList )
        {
            var temp = this._closeNodeList.next;
            egret.Point.release( this._closeNodeList.pos );
            PathNode.release( this._closeNodeList );
            this._closeNodeList = temp;
        }

        this._openNodeList = null;
        this._closeNodeList = null;
    }
    
    private _astarFinished( ):Array<egret.Point>
    {
        var currNode = this._bestNode;
        var currPath:Array<egret.Point> = [];

        var numNodes = 0;
        for ( ; null != currNode; ++ numNodes )
        {
            currPath.push( currNode.pos.clone() );
            currNode = currNode.parent;
        }

        this._astarClear( );
        currPath.reverse( );
        return currPath;
    }

    private _getBest():PathNode
    {
        var tempNode = this._openNodeList;
        if (null !== tempNode) {
            this._openNodeList = tempNode.next;
            tempNode.next = this._closeNodeList;
            this._closeNodeList = tempNode;
        }
        
        return tempNode;
    }
    
    private _appendChild( InNode:PathNode ):void
    {
        var xyoff = [ [0,1], [-1,0], [0,-1], [1,0] ];
        var dir = InNode.oppositeDir;

        // 四方向
        for ( var ii = 0; ii < 4; ++ ii)
        {
            var newX = InNode.pos.x + xyoff[ii][0];
            var newY = InNode.pos.y + xyoff[ii][1];
            
            if (this._canPassable( newX, newY )) {
                this._allocChild( InNode, newX, newY, dir );
            }
            
            dir = (2 + dir) % PATH_DIR.MAX;
        }

    }
    
    private _allocChild(InNode:PathNode, newX:number, newY:number, newDir:number):void
    {
        var posNew:egret.Point = egret.Point.create(newX, newY);
        var actualCost:number = InNode.actualCost + this._calcEstimate( InNode.pos, posNew );
        
        var check:PathNode = null;
        
        if (null !== (check = this._checkList( this._openNodeList, posNew ))) {
            InNode.childList.push(check);
            InNode.childCount ++;
            if (actualCost < check.actualCost) {
                // A better route found, so update
                // the node and variables accordingly.
                check.parent = InNode;
                check.actualCost = actualCost;
                check.estimateCost = check.actualCost + check.heuristicCost;
            } 
        } 
        else if (null !== (check = this._checkList( this._closeNodeList, posNew ))) {
            InNode.childList.push(check);
            InNode.childCount ++;
            if (actualCost < check.actualCost) {
                check.parent = InNode;
                check.actualCost = actualCost;
                check.estimateCost = check.actualCost + check.heuristicCost;
            }
        } 
        else {
            var child:PathNode = this._allocNode( posNew, newDir, InNode );
            this._addToOpenList( child );
        }
    }
        
    private _checkList(InNode:PathNode, pos:egret.Point):PathNode
    {
        while (null !== InNode)
        {
            if (InNode.pos.equals( pos )) {
                return InNode;
            }

            InNode = InNode.next;
        }

        return null;
    }
    
    private  _addToOpenList(InNode:PathNode):void
    {
        if (null === this._openNodeList) {
            this._openNodeList = InNode;
            this._openNodeList.next = null;
            return;
        }


        var prev:PathNode = null;
        var node:PathNode = this._openNodeList;
        while (null !== node)
        {
            if ( InNode.estimateCost > node.estimateCost ) {
                prev = node;
                node = node.next;
            }
            else  {
                if (null !== prev) {
                    prev.next = InNode;
                    InNode.next = node;
                }
                else {
                    InNode.next = this._openNodeList;
                    this._openNodeList = InNode;
                }

                return;
            }
        }

        prev.next = InNode;
    }
    
    private _allocNode(pos:egret.Point, dir:number, parent:PathNode):PathNode
    {
        var tempNode = PathNode.create();
        tempNode.parent = parent;
        tempNode.next = null;
        
        tempNode.childList = [];
        tempNode.childCount = 0;
        
        tempNode.pos = pos;
        tempNode.oppositeDir = (dir + 4) & 7;
        
        tempNode.actualCost = 0;
        if (null !== parent) {
            tempNode.actualCost = parent.actualCost + this._calcEstimate( parent.pos, pos );
            parent.childList.push( tempNode );
            parent.childCount ++;
        }
        
        
        tempNode.heuristicCost = this._calcEstimate( pos, this._posEnd );
        tempNode.estimateCost = tempNode.actualCost + tempNode.heuristicCost;
        
        return tempNode;
    }
    
    // cost of moving from (x, z) in the direction (dx, dz)
    // cost should be 255 when moving horizontally or vertically over normal terrain
    // cost should be 360 when movine diagonally over normal terrain
    private _calcEstimate( posStart:egret.Point, posEnd:egret.Point ):number
    {
        // calc heurisitic value
        var offPos = posStart.subtract(posEnd);
        var xd = Math.abs(offPos.x);
        var yd = Math.abs(offPos.y);
        
        var i = this._canPassable( posStart.x, posStart.y ) ? 1 : 0;
        if ( xd > yd ) {
            return 360 * yd + 255 * (xd - yd) * i;
        }

        return 360 * xd + 255 * (yd - xd) * i;
    }
    
    
    public static getDirectionPos(pos:egret.Point, dir:number, dist:number = 1):egret.Point
    {
        var xyoff = [ [0,1], [-1,0], [0,-1], [1,0] ];
        pos.offset( xyoff[dir][0] * dist, xyoff[dir][1] * dist );
        return pos;
    }
    
    public static calcDirection(posStart:egret.Point, posEnd:egret.Point): PATH_DIR
    {
        var offX = posEnd.x - posStart.x;
        var offY = posEnd.y - posStart.y;
        
        if (0 === offX) {
            return (0 <= offY) ? PATH_DIR.SOUTH : PATH_DIR.NORTH;
        }
        
        if (0 === offY) {
            return (0 <= offX) ? PATH_DIR.EAST : PATH_DIR.WEST;
        }
        
        
        if (Math.abs(offX) >= Math.abs(offY)) {
            return (0 <= offX) ? PATH_DIR.EAST : PATH_DIR.WEST;
        }
        
        
        return (0 <= offY) ? PATH_DIR.SOUTH : PATH_DIR.NORTH;
    }

}
