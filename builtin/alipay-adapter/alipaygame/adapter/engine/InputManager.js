const mgr = _cc && _cc.inputManager;

if (mgr) {
    Object.assign(mgr, {
        getHTMLElementPosition () {
            return {
                left: 0,
                top: 0,
                width: window.innerWidth,
                height: window.innerHeight
            };
        },

        getPointByEvent (event, pos) {
            if (event.pageX != null)  //not avalable in <= IE8
                return {x: event.pageX, y: event.pageY};
    
            pos.left = 0;
            pos.top = 0;
            
            return {x: event.clientX, y: event.clientY};
        },

        registerSystemEvent (element) {
            if (this._isRegisterEvent) return;
    
            this._glView = cc.view;
            let selfPointer = this;
    
            //register touch event
            let _touchEventsMap = {
                "touchstart": function (touchesToHandle) {
                    selfPointer.handleTouchesBegin(touchesToHandle);
                },
                "touchmove": function (touchesToHandle) {
                    selfPointer.handleTouchesMove(touchesToHandle);
                },
                "touchend": function (touchesToHandle) {
                    selfPointer.handleTouchesEnd(touchesToHandle);
                },
                "touchcancel": function (touchesToHandle) {
                    selfPointer.handleTouchesCancel(touchesToHandle);
                }
            };

            let registerTouchEvent = function(eventName) {
                let handler = _touchEventsMap[eventName];
                element.addEventListener(eventName, (function(event) {
                    if (!event.changedTouches) return;
                    let pos = selfPointer.getHTMLElementPosition(element);
                    let body = document.body;
                    pos.left -= body.scrollLeft || 0;
                    pos.top -= body.scrollTop || 0;
                    handler(selfPointer.getTouchesByEvent(event, pos));
                    event.stopPropagation();
                    event.preventDefault();
                }), false);
            };

            for (let eventName in _touchEventsMap) {
                registerTouchEvent(eventName);
            }
    
            this._isRegisterEvent = true;
        },
    });
}