/* ------------------
		类对象
---------------------*/
// wavepoint 类
var wavePointObj = function() {};
wavePointObj.prototype.dom = null; // 点的jquery dom
wavePointObj.prototype.size = null; // 点的大小
wavePointObj.prototype.pos = null; // 点的位置
wavePointObj.prototype.step = 0; // 点的当前步进
wavePointObj.prototype.direction = true; // 点的当前步方向, true: 增益, false: 衰减

/** 
 * 初始化
 */
wavePointObj.prototype.init = function() {
	// 创建jquery dom
	this.dom = $('<div class="wavepoint"></div>');

	// 初始化pos
	this.pos = {
		x: 0, // x轴位置
		y: 0 // y轴位置
	};

	// 初始化size
	this.size = {
		width: 0,
		height: 0
	};
}

/** 
 * 重置point
 */
wavePointObj.prototype.reset = function() {
	// 属性重置
	this.pos.x = 0;
	this.pos.y = 0;
	this.size.width = 0;
	this.size.height = 0;
	this.step = 0;
	this.direction = true;

	// 动画暂停
	this.stop();

	// css重置
	this.dom.css({
		'width': '',
		'height': '',
		'left': '',
		'top': ''
	});
}

/** 
 * 刷新位置
 *
 *	config: {
 *    x, 点的x轴位置
 *    y, 点的y轴位置
 *    width, 点的宽度
 *    height, 点的高度
 *  }
 */
wavePointObj.prototype.refresh = function(config) {
	this.pos.x = config.x;
	this.pos.y = config.y;
	this.size.width = config.width;
	this.size.height = config.height;

	this.dom.css({
		'width': this.size.width,
		'height': this.size.height,
		'left': this.pos.x,
		'top': this.pos.y
	});
}

/** 
 * 增益步进(5px)
 *
 *	callback, 回调处理
 */
wavePointObj.prototype.increaseStep = function(callback) {
	// 判断是否超过最大步进
	if (this.step < WAVEPOINT_STEPMAX) {
		// 刷新高度和y轴位置
		this.size.height += 10;
		this.pos.y -= 5;

		// 刷新步进
		this.step++;

		this.dom.animate({
			'height': this.size.height,
			'top': this.pos.y
		}, 167, 'linear', function() {
			if (callback) {
				callback();
			}
		});
	}
}

/** 
 * 衰减步进(5px)
 *
 *	callback, 回调处理
 */
wavePointObj.prototype.decreaseStep = function(callback) {
	// 判断是否小于最小步进
	if (this.step > 0) {
		// 刷新高度和y轴位置
		this.size.height -= 10;
		this.pos.y += 5;

		// 刷新步进
		this.step--;

		this.dom.animate({
			'height': this.size.height,
			'top': this.pos.y
		}, 167, 'linear', function() {
			if (callback) {
				callback();
			}
		});
	}

}

/** 
 * 停止动画
 */
wavePointObj.prototype.stop = function() {
	this.dom.stop(true);
}