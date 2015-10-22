var TemplateData = (function () {
    function TemplateData() {
    }
    var d = __define,c=TemplateData;p=c.prototype;
    TemplateData.getTileMaxNutrient = function (val) {
        var adb = [TILE_ADDIN_MONSTER_A, TILE_ADDIN_MONSTER_B, TILE_ADDIN_MONSTER_C, TILE_ADDIN_MONSTER_D];
        return adb[val];
    };
    TemplateData.getMonsterData = function (tid) {
        /*var adb = [ {sprID:10, heal:40,   heal_max:40,   heal_w: 36, heal_top: 6, armor:0.0, dmg:2,  dmg_max:4,  atkSpeed:1000,  moveSpeed:1200},
                    {sprID:11, heal:80,   heal_max:80,   heal_w: 36, heal_top: 0, armor:0.1, dmg:8,  dmg_max:12, atkSpeed:600,   moveSpeed:800 },
                    {sprID:12, heal:180,  heal_max:180,  heal_w: 36, heal_top: 0, armor:0.3, dmg:10, dmg_max:20, atkSpeed:1500,  moveSpeed:1600},
                    {sprID:13, heal:1100, heal_max:1100, heal_w: 48, heal_top: 0, armor:0.2, dmg:50, dmg_max:75, atkSpeed:1500,  moveSpeed:2000}
                  ];*/
        var adb = [{ sprID: 10, heal: 40, heal_max: 40, heal_w: 36, heal_top: 6, armor: 0.0, dmg: 1, dmg_max: 3, atkSpeed: 1000, moveSpeed: 1500 }, { sprID: 11, heal: 100, heal_max: 100, heal_w: 36, heal_top: 0, armor: 0.0, dmg: 10, dmg_max: 12, atkSpeed: 600, moveSpeed: 1000 }, { sprID: 12, heal: 200, heal_max: 200, heal_w: 36, heal_top: 0, armor: 0.3, dmg: 12, dmg_max: 16, atkSpeed: 1000, moveSpeed: 2000 }, { sprID: 13, heal: 600, heal_max: 600, heal_w: 48, heal_top: 0, armor: 0.1, dmg: 30, dmg_max: 40, atkSpeed: 1400, moveSpeed: 1500 }];
        return adb[tid - TILE_ADDIN_MONSTER_A];
    };
    TemplateData.getBraverData = function (tid) {
        /*var adb = [ {sprID:1, heal:100, heal_max:100, heal_w: 48, heal_top: 0, armor:0.1, dmg:4,  dmg_max:8,  atkSpeed:1000, moveSpeed:2000},
                    {sprID:2, heal:120, heal_max:120, heal_w: 48, heal_top: 0, armor:0.1, dmg:6,  dmg_max:12, atkSpeed:1000, moveSpeed:2000},
                    {sprID:3, heal:140, heal_max:140, heal_w: 48, heal_top: 0, armor:0.1, dmg:8,  dmg_max:16, atkSpeed:1000, moveSpeed:1500},
                    {sprID:4, heal:160, heal_max:160, heal_w: 48, heal_top: 0, armor:0.1, dmg:10, dmg_max:20, atkSpeed:1000, moveSpeed:2000},
                    {sprID:5, heal:180, heal_max:180, heal_w: 48, heal_top: 0, armor:0.1, dmg:12, dmg_max:24, atkSpeed:1000, moveSpeed:2000},
                    {sprID:6, heal:200, heal_max:200, heal_w: 48, heal_top: 0, armor:0.1, dmg:14, dmg_max:28, atkSpeed:1000, moveSpeed:1500},
                    {sprID:7, heal:260, heal_max:260, heal_w: 48, heal_top: 0, armor:0.1, dmg:16, dmg_max:32, atkSpeed:1000, moveSpeed:2000},
                    {sprID:8, heal:320, heal_max:320, heal_w: 48, heal_top: 0, armor:0.1, dmg:18, dmg_max:36, atkSpeed:1000, moveSpeed:2000},
                    {sprID:9, heal:420, heal_max:420, heal_w: 48, heal_top: 0, armor:0.1, dmg:20, dmg_max:40, atkSpeed:1000, moveSpeed:2000},
                  ];*/
        var adb = [{ sprID: 1, heal: 100, heal_max: 100, heal_w: 48, heal_top: 0, armor: 0.1, dmg: 4, dmg_max: 8, atkSpeed: 1000, moveSpeed: 2000 }, { sprID: 2, heal: 120, heal_max: 120, heal_w: 48, heal_top: 0, armor: 0.1, dmg: 6, dmg_max: 10, atkSpeed: 1000, moveSpeed: 2000 }, { sprID: 3, heal: 140, heal_max: 140, heal_w: 48, heal_top: 0, armor: 0.1, dmg: 8, dmg_max: 12, atkSpeed: 1000, moveSpeed: 1500 }, { sprID: 4, heal: 160, heal_max: 160, heal_w: 48, heal_top: 0, armor: 0.1, dmg: 10, dmg_max: 15, atkSpeed: 1000, moveSpeed: 2000 }, { sprID: 5, heal: 180, heal_max: 180, heal_w: 48, heal_top: 0, armor: 0.1, dmg: 13, dmg_max: 18, atkSpeed: 1000, moveSpeed: 2000 }, { sprID: 6, heal: 200, heal_max: 200, heal_w: 48, heal_top: 0, armor: 0.1, dmg: 16, dmg_max: 22, atkSpeed: 1000, moveSpeed: 1500 }, { sprID: 7, heal: 260, heal_max: 260, heal_w: 48, heal_top: 0, armor: 0.1, dmg: 20, dmg_max: 26, atkSpeed: 1000, moveSpeed: 2000 }, { sprID: 8, heal: 320, heal_max: 320, heal_w: 48, heal_top: 0, armor: 0.1, dmg: 24, dmg_max: 30, atkSpeed: 1000, moveSpeed: 2000 }, { sprID: 9, heal: 420, heal_max: 420, heal_w: 48, heal_top: 0, armor: 0.1, dmg: 30, dmg_max: 36, atkSpeed: 1000, moveSpeed: 2000 },];
        return adb[tid - 1];
    };
    TemplateData.getActorData = function (tid, isMonster) {
        if (isMonster) {
            return TemplateData.getMonsterData(tid);
        }
        return TemplateData.getBraverData(tid);
    };
    TemplateData.getSpawnWaveData = function (wave) {
        var sb = 1;
        var se = 3;
        if (wave > 20) {
            se = 8;
        }
        else if (wave > 10) {
            se = 5;
        }
        else if (wave > 5) {
            se = 3;
        }
        else if (wave > 3) {
            se = 2;
        }
        else {
            se = 1;
        }
        var spawnWave = [];
        var rn = Math.floor(Math.random() * 100);
        rn = (wave < 5) ? 1 : ((wave < 10) ? 1 + rn % 2 : 1 + rn % 3);
        for (var i = 0; i < rn; ++i) {
            var val = Math.floor(Math.random() * 100);
            val = (wave === 1) ? 1 : sb + val % se;
            spawnWave.push({ delay: i * 3000, tid: val });
        }
        return spawnWave;
    };
    return TemplateData;
})();
egret.registerClass(TemplateData,"TemplateData");
