'use strict'

const isIE = !!(document.all)

const $ = function (id) {
    return typeof id == 'string'
        ? document.getElementById(id)
        : id
}

const Class = {
    create() {
        return function () {
            this
                .initialize
                .apply(this, arguments)
        }
    }
}

const Extend = function (destination, source) {
    for (const property in source)
        destination[property] = source[property]
}

const Bind = function (object, fun) {
    return function () {
        return fun.apply(object, arguments)
    }
}

const BindAsEventListener = function (object, fun) {
    return function (event) {
        return fun.call(object, (event || window.event))
    }
}

function addEventHandler(oTarget, sEventType, fnHandler) {
    if (oTarget)
        oTarget.addEventListener(sEventType, fnHandler, false)

    else if (oTarget.attachEvent)
        oTarget.attachEvent(`on${sEventType}`, fnHandler)

    else
        oTarget[`on${sEventType}`] = fnHandler
}

function removeEventHandler(oTarget, sEventType, fnHandler) {
    if (oTarget.removeEventListener)
        oTarget.removeEventListener(sEventType, fnHandler, false)

    else if (oTarget.detachEvent)
        oTarget.detachEvent(`on${sEventType}`, fnHandler)

    else
        oTarget[`on${sEventType}`] = null
}

const CurrentStyle = function (element) {
    return element.currentStyle || document
        .defaultView
        .getComputedStyle(element, null)
}

// 拖放程序
const SimpleDrag = Class.create()
SimpleDrag.prototype = {
    // 拖放对象
    initialize(drag, options) {
        this.Drag = $(drag) // 拖放对象
        this._x = this._y = 0 // 记录鼠标相对拖放对象的位置
        this._marginLeft = this._marginTop = 0 // 记录margin
        // 事件对象(用于绑定移除事件)
        this._fM = BindAsEventListener(this, this.Move)
        this._fS = Bind(this, this.Stop)

        this.SetOptions(options)

        this.Limit = !!this.options.Limit
        this.mxLeft = parseInt(this.options.mxLeft)
        this.mxRight = parseInt(this.options.mxRight)
        this.mxTop = parseInt(this.options.mxTop)
        this.mxBottom = parseInt(this.options.mxBottom)

        this.LockX = !!this.options.LockX
        this.LockY = !!this.options.LockY
        this.Lock = !!this.options.Lock

        this.onStart = this.options.onStart
        this.onMove = this.options.onMove
        this.onStop = this.options.onStop

        this._Handle = $(this.options.Handle) || this.Drag
        this._mxContainer = $(this.options.mxContainer) || null

        this.Drag.style.position = 'absolute'
        // 透明 if(isIE && !!this.options.Transparent){     //填充拖放对象
        // with(this._Handle.appendChild(document.createElement("div")).style){
        // width = height = "100%" backgroundColor = "#fff" filter =
        // "alpha(opacity:0)" fontSize = 0     } } 修正范围
        this.Repair()
        addEventHandler(this._Handle, 'mousedown', BindAsEventListener(this, this.Start))
    },
    // 设置默认属性
    SetOptions(options) {
        this.options = { // 默认值
            Handle: '', // 设置触发对象（不设置则使用拖放对象）
            Limit: true, // 是否设置范围限制(为true时下面参数有用,可以是负数)
            mxLeft: 0, // 左边限制
            mxRight: 9999, // 右边限制
            mxTop: -30, // 上边限制
            mxBottom: 9999, // 下边限制
            mxContainer: '', // 指定限制在容器内
            LockX: false, // 是否锁定水平方向拖放
            LockY: false, // 是否锁定垂直方向拖放
            Lock: false, // 是否锁定
            Transparent: false, // 是否透明
            onStart() {}, // 开始移动时执行
            onMove() {}, // 移动时执行
            onStop() {} // 结束移动时执行
        }
        Extend(this.options, options || {})
    },
    // 准备拖动
    Start(oEvent) {
        if (this.Lock)
            return

        this.Repair()
        // 记录鼠标相对拖放对象的位置
        this._x = oEvent.clientX - this.Drag.offsetLeft
        this._y = oEvent.clientY - this.Drag.offsetTop
        // 记录margin
        this._marginLeft = parseInt(CurrentStyle(this.Drag).marginLeft) || 0
        this._marginTop = parseInt(CurrentStyle(this.Drag).marginTop) || 0
        // mousemove时移动 mouseup时停止
        addEventHandler(document, 'mousemove', this._fM)
        addEventHandler(document, 'mouseup', this._fS)
        if (isIE) {
            // 焦点丢失
            addEventHandler(this._Handle, 'losecapture', this._fS)
            // 设置鼠标捕获
            this
                ._Handle
                .setCapture()
        }
        else {
            // 焦点丢失
            addEventHandler(window, 'blur', this._fS)
            // 阻止默认动作
            oEvent.preventDefault()
        }
        // 附加程序
        this.onStart()
    },
    // 修正范围
    Repair() {
        if (this.Limit) {
            // 修正错误范围参数
            this.mxRight = Math.max(this.mxRight, this.mxLeft + this.Drag.offsetWidth)
            this.mxBottom = Math.max(this.mxBottom, this.mxTop + this.Drag.offsetHeight)
            // 如果有容器必须设置position为relative来相对定位，并在获取offset之前设置
            !this._mxContainer || CurrentStyle(this._mxContainer).position === 'relative' || (this._mxContainer.style.position = 'relative')
        }
    },
    // 拖动
    Move(oEvent) {
        // 判断是否锁定
        if (this.Lock) {
            this.Stop()
            return
        }
        // 清除选择
        window.getSelection
            ? window
                .getSelection()
                .removeAllRanges()
            : document
                .selection
                .empty()
        // 设置移动参数
        let iLeft = oEvent.clientX - this._x
        let iTop = oEvent.clientY - this._y
        // 设置范围限制
        if (this.Limit) {
            // 设置范围参数
            let mxLeft = this.mxLeft
            let mxRight = this.mxRight
            let mxTop = this.mxTop
            let mxBottom = this.mxBottom
            // 如果设置了容器，再修正范围参数
            if (this._mxContainer) {
                mxLeft = Math.max(mxLeft, 0)
                mxTop = Math.max(mxTop, 0)
                mxRight = Math.min(mxRight, this._mxContainer.clientWidth)
                mxBottom = Math.min(mxBottom, this._mxContainer.clientHeight)
            }
            // 修正移动参数
            iLeft = Math.max(Math.min(iLeft, mxRight - this.Drag.offsetWidth), mxLeft)
            iTop = Math.max(Math.min(iTop, mxBottom - this.Drag.offsetHeight), mxTop)
        }
        // 设置位置，并修正margin
        if (!this.LockX)
            this.Drag.style.left = `${iLeft - this._marginLeft}px`

        if (!this.LockY)
            this.Drag.style.top = `${iTop - this._marginTop}px`

        const { left, top } = CurrentStyle(this.Drag)

        // 附加程序
        this.onMove(parseInt(left.slice(0, -2)), parseInt(top.slice(0, -2)))
    },
    // 停止拖动
    Stop() {
        // 移除事件
        removeEventHandler(document, 'mousemove', this._fM)
        removeEventHandler(document, 'mouseup', this._fS)
        if (isIE) {
            removeEventHandler(this._Handle, 'losecapture', this._fS)
            this
                ._Handle
                .releaseCapture()
        }
        else {
            removeEventHandler(window, 'blur', this._fS)
        }
        const { left, top } = CurrentStyle(this.Drag)
        // 附加程序
        this.onStop(left, top)
    }
}

export default SimpleDrag
