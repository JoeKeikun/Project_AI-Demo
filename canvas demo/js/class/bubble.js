/* ------------------
		类对象
---------------------*/
// bubble 类
var bubbleObj = function() {};

bubbleObj.prototype.shapeObj = null; // 泡泡shape object
bubbleObj.prototype.shapeScale = 1;
bubbleObj.prototype.shapeColor = "rgba(255, 255, 255, 0.28)";
bubbleObj.prototype.stepPix = 0;

/** 
 * 初始化
 */
bubbleObj.prototype.init = function() {
	// 创建一个形状
	this.shapeObj = new createjs.Shape();

	// 刷新
	this.refresh();
}

/** 
 * 随机刷新（大小、位置参数）
 */
bubbleObj.prototype.refresh = function() {
	var graphics = this.shapeObj.graphics;

	// 重置shape
	graphics.clear();

	// 刷新缩放随机值
	this.shapeScale = Math.random();

	// 刷新步进距离
	if (this.shapeScale < 1) {
		this.stepPix = BUBBLE_SPEEDPIX_BASE * (1 - this.shapeScale);
	} else {
		this.stepPix = 0.5;
	}

	// 随机泡泡所在x轴位置
	var randomX = parseInt(VIEWPORT_WIDTH * Math.random()),
		newSize = BUBBLE_SIZE_BASE * this.shapeScale;

	// 新描绘一个圆形
	graphics.beginFill(this.shapeColor).drawCircle(0, 0, newSize);
	// 将其偏移到屏幕下方
	this.shapeObj.setTransform(randomX, VIEWPORT_HEIGHT + newSize)
}

/** 
 * 冒泡步进
 */
bubbleObj.prototype.doBubbleStep = function() {
	var tmpCircle = this.shapeObj;

	// 重新描绘y轴位置
	tmpCircle.y -= this.stepPix;

	// 当到达顶部时，刷新
	if (tmpCircle.y < 0) {
		this.refresh();
	}
}