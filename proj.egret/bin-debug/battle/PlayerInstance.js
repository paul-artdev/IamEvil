/**
 *
 * @author
 *
 */
var PlayerInstance = (function () {
    function PlayerInstance() {
        // public notify_power_change: (value: number) =>void = null;
        this._power = 20;
        this._max_power = 20;
        this._money = 0;
        this._recharge_money = 0;
        this._curr_wave = 0;
        this._kill_braver = 0;
        this._max_kill_braver = 0;
        this._max_consecutive_kill = 0;
        this._power = 20;
    }
    var d = __define,c=PlayerInstance;p=c.prototype;
    p.reset = function () {
        this._power = 20;
        this._max_power = 20;
        this._curr_wave = 0;
    };
    d(p, "curr_wave"
        ,function () {
            return this._curr_wave;
        }
    );
    d(p, "max_power"
        ,function () {
            return this._max_power;
        }
    );
    d(p, "power"
        ,function () {
            return this._power;
        }
        ,function (value) {
            value = Math.max(0, value);
            this._power = value;
            //this.notify_power_change(value);
        }
    );
    d(p, "total_money"
        ,function () {
            return this._money + this._recharge_money;
        }
    );
    d(p, "money"
        ,function () {
            return this._money;
        }
        ,function (value) {
            value = Math.max(0, value);
            this._money = value;
        }
    );
    p.reloadFromData = function () {
    };
    p.doNextWave = function () {
        this._curr_wave += 1;
    };
    p.doKillBraver = function () {
        this._money += 80;
        this._max_power += 5;
        this._max_power = Math.min(this._max_power, 40);
        this._power += (this._curr_wave > 3) ? 2 : 5; //this._max_power;
        this._power = Math.min(this._power, this._max_power);
        this._kill_braver += 1;
        this._max_consecutive_kill = Math.max(this._kill_braver, this._max_consecutive_kill);
    };
    return PlayerInstance;
})();
egret.registerClass(PlayerInstance,"PlayerInstance");
var GPlayerInst = null;
