
var game_file_list = [
    //以下为自动修改，请勿修改
    //----auto game_file_list start----
	"libs/modules/egret/egret.js",
	"libs/modules/egret/egret.native.js",
	"libs/modules/game/game.js",
	"libs/modules/game/game.native.js",
	"libs/modules/tween/tween.js",
	"libs/modules/res/res.js",
	"libs/modules/eui/eui.js",
	"bin-debug/battle/actor/Actor.js",
	"bin-debug/battle/actor/Braver.js",
	"bin-debug/battle/actor/Monster.js",
	"bin-debug/battle/actor/TemplateData.js",
	"bin-debug/battle/BattleGenerator.js",
	"bin-debug/battle/BattleManager.js",
	"bin-debug/battle/BattleScene.js",
	"bin-debug/battle/gridtile/TileCell.js",
	"bin-debug/battle/gridtile/TileGenerator.js",
	"bin-debug/battle/gridtile/TileGridMap.js",
	"bin-debug/battle/gridtile/TileRow.js",
	"bin-debug/battle/PathFinder.js",
	"bin-debug/battle/PlayerInstance.js",
	"bin-debug/GameApp.js",
	"bin-debug/GameScene.js",
	"bin-debug/LoadingUI.js",
	//----auto game_file_list end----
];

var window = {};

egret_native.setSearchPaths([""]);

egret_native.requireFiles = function () {
    for (var key in game_file_list) {
        var src = game_file_list[key];
        require(src);
    }
};

egret_native.egretInit = function () {
    egret_native.requireFiles();
    egret.TextField.default_fontFamily = "/system/fonts/DroidSansFallback.ttf";
    //egret.dom为空实现
    egret.dom = {};
    egret.dom.drawAsCanvas = function () {
    };
};

egret_native.egretStart = function () {
    var option = {
        //以下为自动修改，请勿修改
        //----auto option start----
		entryClassName: "GameApp",
		frameRate: 30,
		scaleMode: "showAll",
		contentWidth: 640,
		contentHeight: 960,
		showPaintRect: false,
		showFPS: true,
		fpsStyles: "x:0,y:0,size:20",
		showLog: true,
		logFilter: "^egret",
		maxTouches: 2,
		textureScaleFactor: 1
		//----auto option end----
    };

    egret.native.NativePlayer.option = option;
    egret.runEgret();
    egret_native.Label.createLabel(egret.TextField.default_fontFamily, 20, "", 0);
    egret_native.EGTView.preSetOffScreenBufferEnable(true);
};