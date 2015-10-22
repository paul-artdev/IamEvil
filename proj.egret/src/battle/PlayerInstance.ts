/**
 *
 * @author 
 *
 */
class PlayerInstance 
{
   // public notify_power_change: (value: number) =>void = null;
    private _power:number = 20;
    private _max_power:number = 20;
    
    private _money:number = 0;
    private _recharge_money:number = 0;
    
    private _curr_wave:number = 0;
    private _kill_braver:number = 0;
    
    private _max_kill_braver:number = 0;
    private _max_consecutive_kill:number = 0;

    
    
	public constructor() 
	{
        this._power = 20;
	}

	public reset():void
	{
        this._power = 20;
        this._max_power = 20;
        
        this._curr_wave = 0;
        
	}
	
    public get curr_wave():number
    {
        return this._curr_wave;
    }
    
	public get max_power():number
	{
        return this._max_power;
	}
    
	public get power():number
	{
        return this._power;
	}
	
	public set power(value:number)
	{
        value = Math.max(0, value);
        this._power = value;
        //this.notify_power_change(value);
	}
	
    public get total_money():number
    {
        return this._money + this._recharge_money;
    }
    
	public get money():number
	{
        return this._money;
	}
	
	public set money(value:number)
	{
        value = Math.max(0, value);
        this._money = value;
	}
    
    public reloadFromData():void
    {
        
    }
    
    public doNextWave():void
    {
        this._curr_wave += 1;
    }
    
    public doKillBraver():void
    {
        this._money += 80;
        this._max_power += 5;
        this._max_power  = Math.min(this._max_power, 40);
        
        this._power += (this._curr_wave > 3) ? 2 : 5;//this._max_power;
        this._power  = Math.min(this._power, this._max_power);
        
        this._kill_braver += 1;
        this._max_consecutive_kill = Math.max(this._kill_braver, this._max_consecutive_kill);
    }
}


var GPlayerInst: PlayerInstance = null;

