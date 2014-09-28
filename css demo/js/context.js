/* ------------------
		环境变量
---------------------*/
var VIEWPORT_WIDTH = 375, // viewport宽
	VIEWPORT_HEIGHT = 600, // viewport高

	BUBBLE_COUNTS = 20, // 泡泡总个数
	BUBBLE_PERSPECTIVE = 400, // 泡泡区域的3D元素距视点的距离
	BUBBLE_TIMEBASE = 30000, // 泡泡区域的冒泡基准时间(30s)
	BUBBLE_ZINDEX_MAX = 4500, // 泡泡区域的最大z轴距离

	WAVEPOINT_COUNTS = 25, // 声波点个数
	WAVEPOINT_STEPMAX = 8; // 声波增益最大步数