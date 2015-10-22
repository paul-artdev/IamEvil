


class GameScene extends egret.DisplayObjectContainer
{
    public textField: egret.TextField;
    private _battleScene: BattleScene;
    private _euiLayer:eui.UILayer;
    private _btnStart:eui.Button;
    
    
    public constructor() 
    {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
    }
    
    private onAddToStage(evtTarget:Event):void
    {
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        
        this._createBattleManager();
        this._createBattleScene();
        this._createBorder();
        this._createEUI();
        
        this.doListenAll();
        this.doFirstDungeon();
    }
    
    private _createBorder():void
    {
        var shp:egret.Shape = new egret.Shape();
        shp.graphics.lineStyle(2, 0xFFFFFF);
        shp.graphics.beginFill( 0x223344, 0);
        shp.graphics.drawRect( 0, 0, 640, 960 );
        shp.graphics.endFill();
        
        this.addChild( shp );
    }
    
    private _createBattleManager():void
    {
        GBattleManager = new BattleManager();
        GBattleManager.initBattle();
        
        GPlayerInst = new PlayerInstance();
        GPlayerInst.reloadFromData();
    }    

    private _createBattleScene():void
    {
        GBattleScene = new BattleScene();
        GBattleScene.y = 64;
        GBattleScene.width = 640;
        GBattleScene.height = 960 - 64;
        
        this.addChild( GBattleScene );
    }
    
    private _createEUI():void 
    {   
        this._euiLayer = new eui.UILayer();
        this.addChild(this._euiLayer);
        //this._euiLayer.touchEnable = false;
        this._euiLayer.touchThrough = true;
        var theme = new eui.Theme("resource/default.thm.json", this._euiLayer.stage);
        

        this.textField = new egret.TextField();
        this.addChild(this.textField);
        this.textField.y = 80;
        this.textField.width = 300;
        this.textField.height = 100;
        this.textField.textAlign = "left";
        
        egret.startTick(
            (dt:number)=> {
                this.textField.text = "Power : " + GPlayerInst.power  + "/" + GPlayerInst.max_power;
                this.textField.text += "\nMoney = " + GPlayerInst.total_money;
                this.textField.text += "\nWave = " + GPlayerInst.curr_wave;
                return true;
            },
            this
        );
        
                
                
        var button = new eui.Button();
        button.label = "Start";
        button.right = 16;
        button.bottom = 16;
        this._btnStart = button;
        this._euiLayer.addChild(this._btnStart);
        this._btnStart.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onBtnStartClick,this);
        
        button = new eui.Button();
        button.label = "Unlock";
        button.right = 160;
        button.bottom = 16;
        this._euiLayer.addChild(button);
        button.addEventListener(egret.TouchEvent.TOUCH_TAP,(e:egret.TouchEvent) => { 
                GBattleManager.doBattleNextLevel();
                GBattleScene.updateBattle(GBattleManager.battleData);
                GBattleScene.updateScrollPolicy(GBattleManager.battleData);
                GBattleScene.moveTopLeft(GBattleManager.portal.x - 5 + 0.5, 0);
            }
            , this);
            
        button = new eui.Button();
        button.label = "Zoom";
        button.right = 320;
        button.bottom = 16;
        this._euiLayer.addChild(button);
        button.addEventListener(egret.TouchEvent.TOUCH_TAP,(e:egret.TouchEvent) => { 
                GBattleScene.updateZoom();
            }
            , this);
    }
    
    private doListenAll()
    {
        GBattleManager.notify_battle_changed = function(battleData:BattleData) {
            GBattleScene.updateBattle(battleData);
        }
        
        GBattleManager.notify_cell_changed = function(xx:number, yy:number, val:number, addit:number) {
            GBattleScene.updateCell(xx, yy, val, addit);
        }
        
        GBattleManager.notify_game_over = { 
            listener: function(euiParent) {
                var panel = new eui.Panel();
                panel.title = "Title";
                panel.horizontalCenter = 0;
                panel.verticalCenter = 0;
                euiParent.addChild(panel);
            },
            thisObject:this._euiLayer
        }
    }
    
    private onBtnStartClick(e:egret.TouchEvent) 
    { 
        this.doBattleStart();
    }
    
    private doFirstDungeon():void
    {
        GBattleManager.createDungeon();
        
        GBattleScene.updateBattle(GBattleManager.battleData);
        GBattleScene.updateScrollPolicy(GBattleManager.battleData);
        GBattleScene.moveTopLeft(GBattleManager.portal.x - 5 + 0.5, 0);
    }
    
    private doBattleStart():void
    {
        var currWave = GPlayerInst.curr_wave + 1;
        var spawnWaves = TemplateData.getSpawnWaveData(currWave);
        
        
        var tw = egret.Tween.get(this);
        for (var i = 0; i < spawnWaves.length; ++ i) {
            var newRole = GBattleManager.createBraver(spawnWaves[i].tid, GBattleManager.portal.x, GBattleManager.portal.y);
            tw.wait(spawnWaves[i].delay)
              .call(function(arole) {
                  arole.doBorn();
                  GBattleScene.addTo(arole);
              },
              this, [newRole]);
        }
        
        GPlayerInst.doNextWave();
        
    }
    
    public doSnapshot():void
    {
        var renderTexture:egret.RenderTexture = new egret.RenderTexture();
        renderTexture.drawToTexture(this);
        renderTexture.saveToFile("image/png", "a/down.png");
        renderTexture.dispose();
    }
}
