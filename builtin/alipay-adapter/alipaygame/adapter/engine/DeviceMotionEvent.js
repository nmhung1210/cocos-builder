
const inputManager = _cc.inputManager;

function accelerometerChangeCallback (res) {
    let self = inputManager;
            
    let x = res.x;
    let y = res.y;

    let systemInfo = my.getSystemInfoSync();
    let windowWidth = systemInfo.windowWidth;
    let windowHeight = systemInfo.windowHeight;
    if (windowHeight < windowWidth) {
        let tmp = x;
        x = -y;
        y = tmp;
    }
    
    self._acceleration.x = x;
    self._acceleration.y = y;
    self._acceleration.z = res.z;
}

Object.assign(inputManager, {
    setAccelerometerEnabled (isEnable) {
        let scheduler = cc.director.getScheduler();
        scheduler.enableForTarget(this);
        if (isEnable) {
            this._registerAccelerometerEvent();
            scheduler.scheduleUpdate(this);
        }
        else {
            this._unregisterAccelerometerEvent();
            scheduler.unscheduleUpdate(this);
        }
    },

    // No need to adapt
    // setAccelerometerInterval (interval) {  },

    _registerAccelerometerEvent () {
        this._accelCurTime = 0;
        this._acceleration = new cc.Acceleration();

        my.onAccelerometerChange(accelerometerChangeCallback);
    },

    _unregisterAccelerometerEvent () {
        this._accelCurTime = 0;
        my.offAccelerometerChange(accelerometerChangeCallback);
    },
});
