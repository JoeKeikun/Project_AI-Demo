/* ------------------
		类对象
---------------------*/
// wavepoint 类
var wavePointObj = function() {};
wavePointObj.prototype.shapeObj = null; // 点的jquery dom
wavePointObj.prototype.size = null; // 点的大小
wavePointObj.prototype.pos = null; // 点的位置
wavePointObj.prototype.waveFlg = false; // 点是否做波形运动
wavePointObj.prototype.waveStepArr = []; // 
wavePointObj.prototype.waveIndex = 0; // 
wavePointObj.prototype.step = 0; // 点的当前步进
wavePointObj.prototype.direction = true; // 点的当前步方向, true: 增益, false: 衰减
wavePointObj.prototype.shapeColor = "white";


/** 
 * 初始化
 */
wavePointObj.prototype.init = function() {
	// 创建一个形状
	this.shapeObj = new createjs.Shape();

	// 初始化pos
	this.pos = {
		x: 0, // x轴位置
		y: 0 // y轴位置
	};

	// 初始化size
	this.size = {
		width: 5,
		height: 5
	};

	// 绘制一个矩形
	this.shapeObj.graphics.beginFill(this.shapeColor).drawRect(0, 0, this.size.width, this.size.height);
}

/** 
 * 重置point
 */
wavePointObj.prototype.reset = function() {
	// 属性重置
	this.pos = {
		x: 0, // x轴位置
		y: 0 // y轴位置
	};
	this.size = {
		width: 5,
		height: 5
	};
	this.step = 0;
	this.direction = true;
	this.waveFlg = false;
	this.waveStepArr = [];
	this.waveIndex = 0;

	// 重置shape
	this.shapeObj.graphics.clear();

	this.shapeObj.graphics.beginFill(this.shapeColor).drawRect(0, 0, this.size.width, this.size.height);
}

/** 
 * 刷新位置,缩放
 *
 *	config: {
 *    x, 点的x轴位置
 *    y, 点的y轴位置
 *    scaleWidth, 点的宽度
 *    scaleHeight, 点的高度
 *  }
 */
wavePointObj.prototype.refresh = function(config) {
	this.pos.x = config.x ? config.x : this.pos.x;
	this.pos.y = config.y ? config.y : this.pos.y;

	var scaleWidth = config.scaleWidth,
		scaleHeight = config.scaleHeight;

	this.shapeObj.setTransform(this.pos.x, this.pos.y, scaleWidth, scaleHeight);
}

/** 
 * 增益步进
 *
 *	callback, 回调处理
 */
wavePointObj.prototype.increaseStep = function() {
	// 判断是否超过最大步进
	if (this.step < WAVEPOINT_STEPMAX) {
		// 刷新步进
		this.step++;

		var tmpScale = this.step * 0.5 + 1;
		// 刷新高度
		this.pos.y -= 1.25;

		this.shapeObj.setTransform(this.pos.x, this.pos.y, 1, tmpScale);
	}
}

/** 
 * 衰减步进
 *
 *	callback, 回调处理
 */
wavePointObj.prototype.decreaseStep = function() {
	// 判断是否小于最小步进
	if (this.step > 0) {
		// 刷新步进
		this.step--;

		var tmpScale = this.step * 0.5 + 1;
		// 刷新高度
		this.pos.y += 1.25;

		this.shapeObj.setTransform(this.pos.x, this.pos.y, 1, tmpScale);
	}

}