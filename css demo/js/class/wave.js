/* ------------------
		类对象
---------------------*/
// wave 类
var waveObj = function() {};
waveObj.prototype.pointsArr = null; // 点的数组

/** 
 * 初始化
 */
waveObj.prototype.init = function() {
	// 初始化数组
	this.pointsArr = new Array(WAVEPOINT_COUNTS);
}

/** 
 * 做正向波浪
 *
 *   step: 增益的最大步进
 *   waveCallback：第一次出现完整波形时的回调处理
 *   finalCallback：完成整个波浪时的回调处理
 */
waveObj.prototype.doWave = function(step, waveCallback, finalCallback) {
	// 正向执行递归函数
	waveRecursion({
		index: 0,
		realStep: step <= WAVEPOINT_STEPMAX ? step : WAVEPOINT_STEPMAX,
		pointsArr: this.pointsArr,
		reverse: false,
		waveCallback: waveCallback,
		finalCallback: finalCallback,
		count: 0
	});
}

/** 
 * 做逆向波浪
 *
 *   step: 增益的最大步进
 *   waveCallback：第一次出现完整波形时的回调处理
 *   finalCallback：完成整个波浪时的回调处理
 */
waveObj.prototype.doRevWave = function(step, waveCallback, finalCallback) {
	// 逆向执行递归函数
	waveRecursion({
		index: WAVEPOINT_COUNTS - 1,
		realStep: step <= WAVEPOINT_STEPMAX ? step : WAVEPOINT_STEPMAX,
		pointsArr: this.pointsArr,
		reverse: true,
		waveCallback: waveCallback,
		finalCallback: finalCallback,
		count: 0
	});
}


function waveRecursion(config) { // 递归处理函数
	// 提取参数
	var index = config.index,
		realStep = config.realStep,
		pointsArr = config.pointsArr,
		reverse = config.reverse,
		waveCallback = config.waveCallback,
		finalCallback = config.finalCallback;

	// 获取当前活动点
	var point = pointsArr[index];

	// 根据当前活动点是在增益还是在衰减，进行不同处理
	if (point.direction) {
		point.increaseStep(function() {
			// 当前活动点的步进为1时，让数组中下一个点开始做增益操作
			if (!reverse) {
				if (point.step === 1 && index < WAVEPOINT_COUNTS - 1) {
					waveRecursion({
						index: index + 1,
						realStep: realStep,
						pointsArr: pointsArr,
						reverse: reverse,
						waveCallback: waveCallback,
						finalCallback: finalCallback
					});
				}
			} else {
				if (point.step === 1 && index > 0) {
					waveRecursion({
						index: index - 1,
						realStep: realStep,
						pointsArr: pointsArr,
						reverse: reverse,
						waveCallback: waveCallback,
						finalCallback: finalCallback
					});
				}
			}

			// 当步进等于实际最大步进时，做衰减操作
			if (point.step === realStep) {
				point.direction = !point.direction;
			}

			// 递归执行
			waveRecursion({
				index: index,
				realStep: realStep,
				pointsArr: pointsArr,
				reverse: reverse,
				waveCallback: waveCallback,
				finalCallback: finalCallback
			});
		});
	} else {
		point.decreaseStep(function() {
			// 当前活动点衰减到0时，进行处理
			if (point.step === 0) {
				// 重置方向
				point.direction = !point.direction;

				var firstIndex, lastIndex;
				if (!reverse) {
					firstIndex = 0;
					lastIndex = WAVEPOINT_COUNTS - 1;
				} else {
					firstIndex = WAVEPOINT_COUNTS - 1;
					lastIndex = 0;
				}

				// 判断当前点是否为最开始一个点，是则执行【完整波形】回调
				if (point === pointsArr[firstIndex] && waveCallback) {
					// 执行callback
					waveCallback();
				}

				// 判断当前点是否为最末尾一个点，是则执行【波形消失】回调
				if (point === pointsArr[lastIndex] && finalCallback) {
					// 执行callback
					finalCallback();
				}

				// 衰减完成，跳出递归处理
				return;
			}

			// 递归执行
			waveRecursion({
				index: index,
				realStep: realStep,
				pointsArr: pointsArr,
				reverse: reverse,
				waveCallback: waveCallback,
				finalCallback: finalCallback
			});
		});
	}

};