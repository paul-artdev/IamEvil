


class TileGenerator 
{
    
    public constructor() 
    {

    }
    
    public static generateGrid(width: number, height: number): TileGridMap
    {
        var gridMap: TileGridMap = new TileGridMap();

        gridMap.newGrid(width, height);
        return gridMap;
    }
    
    public static generateGround(gridMap: TileGridMap, endY: number)
    {
        for (var y: number = 0;y < endY; ++ y) {
            var avv: Array<number> = new Array<number>();
            var value: number = 0;
        }
    }
    
    public static generateBackground(gridMap: TileGridMap, value:number=1000)
    {
        for (var y:number = 0; y < gridMap.gridHeight; ++ y) {
            var avv:Array<number> = new Array<number>();
            
            for (var i:number = 0; i < gridMap.gridWidth; ++ i) {
                avv.push(value);
            }
             
            gridMap.fillRow(y, avv);
        }
        
        return gridMap;
    }
}
