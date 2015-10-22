var GameScene = (function (_super) {
    __extends(GameScene, _super);
    function GameScene() {
        _super.call(this);
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=GameScene;p=c.prototype;
    p.onAddToStage = function (evtTarget) {
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        this._createBattleManager();
        this._createBattleScene();
        this._createBorder();
        this._createEUI();
        this.doListenAll();
        this.doFirstDungeon();
    };
    p._createBorder = function () {
        var shp = new egret.Shape();
        shp.graphics.lineStyle(2, 0xFFFFFF);
        shp.graphics.beginFill(0x223344, 0);
        shp.graphics.drawRect(0, 0, 640, 960);
        shp.graphics.endFill();
        this.addChild(shp);
    };
    p._createBattleManager = function () {
        GBattleManager = new BattleManager();
        GBattleManager.initBattle();
        GPlayerInst = new PlayerInstance();
        GPlayerInst.reloadFromData();
    };
    p._createBattleScene = function () {
        GBattleScene = new BattleScene();
        GBattleScene.y = 64;
        GBattleScene.width = 640;
        GBattleScene.height = 960 - 64;
        this.addChild(GBattleScene);
    };
    p._createEUI = function () {
        var _this = this;
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
        egret.startTick(function (dt) {
            _this.textField.text = "Power : " + GPlayerInst.power + "/" + GPlayerInst.max_power;
            _this.textField.text += "\nMoney = " + GPlayerInst.total_money;
            _this.textField.text += "\nWave = " + GPlayerInst.curr_wave;
            return true;
        }, this);
        var button = new eui.Button();
        button.label = "Start";
        button.right = 16;
        button.bottom = 16;
        this._btnStart = button;
        this._euiLayer.addChild(this._btnStart);
        this._btnStart.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnStartClick, this);
        button = new eui.Button();
        button.label = "Unlock";
        button.right = 160;
        button.bottom = 16;
        this._euiLayer.addChild(button);
        button.addEventListener(egret.TouchEvent.TOUCH_TAP, function (e) {
            GBattleManager.doBattleNextLevel();
            GBattleScene.updateBattle(GBattleManager.battleData);
            GBattleScene.updateScrollPolicy(GBattleManager.battleData);
            GBattleScene.moveTopLeft(GBattleManager.portal.x - 5 + 0.5, 0);
        }, this);
        button = new eui.Button();
        button.label = "Zoom";
        button.right = 320;
        button.bottom = 16;
        this._euiLayer.addChild(button);
        button.addEventListener(egret.TouchEvent.TOUCH_TAP, function (e) {
            GBattleScene.updateZoom();
        }, this);
    };
    p.doListenAll = function () {
        GBattleManager.notify_battle_changed = function (battleData) {
            GBattleScene.updateBattle(battleData);
        };
        GBattleManager.notify_cell_changed = function (xx, yy, val, addit) {
            GBattleScene.updateCell(xx, yy, val, addit);
        };
        GBattleManager.notify_game_over = {
            listener: function (euiParent) {
                var panel = new eui.Panel();
                panel.title = "Title";
                panel.horizontalCenter = 0;
                panel.verticalCenter = 0;
                euiParent.addChild(panel);
            },
            thisObject: this._euiLayer
        };
    };
    p.onBtnStartClick = function (e) {
        this.doBattleStart();
    };
    p.doFirstDungeon = function () {
        GBattleManager.createDungeon();
        GBattleScene.updateBattle(GBattleManager.battleData);
        GBattleScene.updateScrollPolicy(GBattleManager.battleData);
        GBattleScene.moveTopLeft(GBattleManager.portal.x - 5 + 0.5, 0);
    };
    p.doBattleStart = function () {
        var currWave = GPlayerInst.curr_wave + 1;
        var spawnWaves = TemplateData.getSpawnWaveData(currWave);
        var tw = egret.Tween.get(this);
        for (var i = 0; i < spawnWaves.length; ++i) {
            var newRole = GBattleManager.createBraver(spawnWaves[i].tid, GBattleManager.portal.x, GBattleManager.portal.y);
            tw.wait(spawnWaves[i].delay).call(function (arole) {
                arole.doBorn();
                GBattleScene.addTo(arole);
            }, this, [newRole]);
        }
        GPlayerInst.doNextWave();
    };
    p.doSnapshot = function () {
        var renderTexture = new egret.RenderTexture();
        renderTexture.drawToTexture(this);
        renderTexture.saveToFile("image/png", "a/down.png");
        renderTexture.dispose();
    };
    return GameScene;
})(egret.DisplayObjectContainer);
egret.registerClass(GameScene,"GameScene");
