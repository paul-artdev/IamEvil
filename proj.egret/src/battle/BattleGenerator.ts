


class BattleGenerator 
{

    public constructor() 
    {

    }

    public static generateBattle(battleData:BattleData, width:number, height:number):void
    {
        battleData.save = [];
        battleData.value = [];
        battleData.addition = [];
        battleData.nutrients = [];
        
        for (var y:number = 0; y < height; ++ y) {   
            var bsave:Array<number> = new Array<number>();
            var bvalue:Array<number> = new Array<number>();
            var baddition:Array<number> = new Array<number>();
            var bnutrients:Array<number> = new Array<number>();
            
            for (var x:number = 0; x < width; ++ x) {
                bsave.push(0);
                bvalue.push(0);
                baddition.push(0);
                bnutrients.push(0);
            }
            
            battleData.save.push(bsave);
            battleData.value.push(bvalue);
            battleData.addition.push(baddition);
            battleData.nutrients.push(bnutrients);
        }
        
        battleData.width = width;
        battleData.height = height;
    }
    
    public static generateBorders(battleData:BattleData, value:number):void
    {
        var rh:number = battleData.height;
        var rw:number = battleData.width;
        
        for (var y:number = 0; y < rh; ++ y) {
            battleData.save[y][0] = value;
            battleData.value[y][0] = value;
            
            battleData.save[y][rw-1] = value;
            battleData.value[y][rw-1] = value;
        }
        
        for (var x:number = 0; x < rw; ++ x) {
            battleData.save[0][x] = value;
            battleData.value[0][x] = value;
            
            battleData.save[rh-1][x] = value;
            battleData.value[rh-1][x] = value;
        }

    }
    
    public static generateBricks(battleData:BattleData, value:number, startY:number, endY?:number):void
    {
        var realEndY:number = (undefined === endY) ? battleData.height : endY;
        for (var y:number = startY; y < endY; ++ y) {
            for (var x:number = 0; x < battleData.width; ++ x) {
                battleData.save[y][x] = value;
                battleData.value[y][x] = value;
            }
        }
    }
    
    public static generatePortal(battleData:BattleData, endY:number, startPos?:egret.Point):void
    {
        var centerX:number = battleData.halfWidth;
        var startY:number = 0;
        //var endY:number = battleData.gridHeight - 1;
        
        if (undefined !== startPos) {
            centerX = startPos.x;
            startY = startPos.y;
        }
            
        for (var y:number = startY; y <= endY; ++ y) {
            battleData.value[y][centerX] = 0;
        }
        
        
        battleData.addition[startY][centerX] = 0;
        battleData.addition[0][centerX] = TILE_ADDIN_PORTAL;
        battleData.addition[endY][centerX] = TILE_ADDIN_CHEST;
        
        if (undefined === startPos) {
            battleData.portal = egret.Point.create(centerX, startY);
        }
        
        battleData.chest = egret.Point.create(centerX, endY);
    }
    
    public static generateBoss(battleData:BattleData, val:number, x:number, y:number):void
    {
        battleData.addition[y][x] = val;
    }
    /*
    public static generateDungeon(battleData:BattleData, bossData:Array<{id:number,px:number,py:number}>):TileGridMap
    {
        var tileGrid:TileGridMap = null;
        var tileGen:TileGenerator = new TileGenerator();
        
        tileGrid = tileGen.generateGrid(col, row) ;
        tileGen.generateBricks(tileGrid, 0, row, 1);
        BattleGenerator.collectInitData(battleData, tileGrid);
                
        tileGen.generatePortal(tileGrid);
        if ((null !== bossData) && (bossData.length > 0)) {
            for (var i = 0; i < bossData.length; ++ i) {
                tileGen.generateBoss(tileGrid, bossData[i].id, bossData[i].px, bossData[i].py);
            }
        }
        
        tileGrid.adjustAllRowPos(0);
        BattleGenerator.collectBattleData(battleData, tileGrid);
        GBattleManager.createFromData(battleData, tileGrid.portal, tileGrid.chest);
        
        return tileGrid;
    }
    */
    /*public static generateDungeon(battleData:BattleData):void
    {
        BattleGenerator.generateBattle(battleData, GRID_WIDTH_MAX, GRID_HEIGHT_MAX);
        BattleGenerator.generateBricks(battleData, 1, 1, 14);
        BattleGenerator.generateBricks(battleData, 2, 14, 27);
        BattleGenerator.generateBricks(battleData, 3, 27, GRID_HEIGHT_MAX);
        
        BattleGenerator.generateBorders(battleData, 255);
        BattleGenerator.generatePortal(battleData, 13 - 1);
        
        BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_B,  6,  5);
        //BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_A,  5,  5);
       // BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_A,  6,  5);
        //BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_A,  7,  5);
        //BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_A,  8,  5);
        //BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_A, 11,  9);
        //BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_A,  4, 14);
        
        //BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_B, 12, 19);
       //BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_B,  6, 30);
        
        BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_C, 11, 35);

        battleData.limitUnlock = 0;
    }*/
    
    public static generateDungeon(battleData:BattleData):void
    {
        BattleGenerator.generateBattle(battleData, GRID_WIDTH_MAX, GRID_HEIGHT_MAX);
        BattleGenerator.generateBricks(battleData, 1, 1, 6);
        BattleGenerator.generateBricks(battleData, 2, 6, 13);
        BattleGenerator.generateBricks(battleData, 3, 13, GRID_HEIGHT_MAX);
        //BattleGenerator.generateBricks(battleData, 2, 14, 27);
        //BattleGenerator.generateBricks(battleData, 3, 27, GRID_HEIGHT_MAX);
        
        BattleGenerator.generateBorders(battleData, 255);
        BattleGenerator.generatePortal(battleData, 13 - 1);
        
        BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_B,  6,  4);
        //BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_A,  5,  5);
       // BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_A,  6,  5);
        //BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_A,  7,  5);
        //BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_A,  8,  5);
        //BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_A, 11,  9);
        //BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_A,  4, 14);
        
        //BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_B, 12, 19);
       //BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_B,  6, 30);
        
        //BattleGenerator.generateBoss(battleData, TILE_ADDIN_MONSTER_C, 11, 35);

        battleData.limitUnlock = 0;
    }
    
    public static unlockNextLevel(battleData:BattleData):void
    {
        if (0 === battleData.limitUnlock) {
            
            var startY = 13;
            var endY = 16 - startY;
            var width = battleData.width;
            
            BattleGenerator.generatePortal(battleData, 15, battleData.chest);
            battleData.limitUnlock += 1;
        }
        else if (1 === battleData.limitUnlock) {
            
            var startY = 16;
            var endY = GRID_HEIGHT_MAX - startY;
            var width = battleData.width;
            
            BattleGenerator.generatePortal(battleData, GRID_HEIGHT_MAX - 2, battleData.chest);
            battleData.limitUnlock += 1;
        }
    }
    
    public static regenerateDungeon(battleData:BattleData):void
    {
        BattleGenerator.generateBattle(battleData, GRID_WIDTH_MAX, GRID_HEIGHT_MAX);
        
        BattleGenerator.generateBricks(battleData, 1, 0, 13);
        BattleGenerator.generateBricks(battleData, 2, 13, 26);
        BattleGenerator.generateBricks(battleData, 3, 26, GRID_HEIGHT_MAX);
        
        BattleGenerator.generatePortal(battleData, GRID_HEIGHT_MAX - 1);
    }
}
