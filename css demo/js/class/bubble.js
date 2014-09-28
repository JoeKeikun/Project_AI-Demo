/* ------------------
		类对象
---------------------*/
// bubble 类
var bubbleObj = function() {};

bubbleObj.prototype.dom = null; // 泡泡jquery dom
bubbleObj.prototype.size = 60; // 泡泡大小
bubbleObj.prototype.bubbleDis = 0; // 实际冒泡移动距离
bubbleObj.prototype.pos = null;

/** 
 * 初始化
 */
bubbleObj.prototype.init = function() {
	// 创建jquery dom
	this.dom = $('<div class="bubble"></div>');

	// 初始化pos
	this.pos = {
		x: 0, // x轴位置
		y: 0, // y轴位置
		z: 0 // z轴位置
	};

	// 刷新
	this.refresh();
}

/** 
 * 随机刷新（大小、位置参数）
 */
bubbleObj.prototype.refresh = function() {
	// 随机z轴
	var z = this.pos.z = parseInt(BUBBLE_ZINDEX_MAX * Math.random());

	// 中间参数
	var tanTheta_width = VIEWPORT_WIDTH / (2 * BUBBLE_PERSPECTIVE);
	var tanTheta_height = VIEWPORT_HEIGHT / (2 * BUBBLE_PERSPECTIVE);

	// 计算泡泡所在z轴平面的宽度
	var movAreaWidth = 2 * tanTheta_width * (BUBBLE_PERSPECTIVE + this.pos.z);

	// 计算冒泡移动距离
	this.bubbleDis = 2 * tanTheta_height * (BUBBLE_PERSPECTIVE + this.pos.z) + this.size;

	// 随机x轴
	this.pos.x = parseInt(movAreaWidth * Math.random());
	// y轴放置到屏幕最下沿
	this.pos.y = this.size;

	// 变动css，更新位置
	this.dom.css({
		'bottom': 0,
		'width': this.size,
		'height': this.size,
		'-webkit-transform': 'translateX(' + this.pos.x + 'px) ' + 'translateY(' + this.pos.y + 'px) ' + 'translateZ(-' + this.pos.z + 'px) '
	});
}

/** 
 * 开始冒泡
 */
bubbleObj.prototype.start = function() {
	var me = this;

	// 计算泡泡所在位置
	var curBottom = parseInt(this.dom.css('bottom'));

	// 计算泡泡动画时间
	var animateTime = BUBBLE_TIMEBASE * (VIEWPORT_HEIGHT / this.bubbleDis) * ((this.bubbleDis - curBottom) / this.bubbleDis);

	// 执行动画
	this.dom.animate({
		'bottom': this.bubbleDis
	}, animateTime, 'linear', function() {
		me.refresh();
		me.start();
	});
}

/** 
 * 停止冒泡
 */
bubbleObj.prototype.stop = function() {
	// 停止动画
	this.dom.stop();
}