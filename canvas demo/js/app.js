/* ------------------
		变量对象
---------------------*/
// 获取jquery dom对象
var viewport = $(".viewport"),
	waitstateBtn = $('#waitstate'),
	listenstateBtn = $('#listenstate'),
	thinkstateBtn = $('#thinkstate');

// canvas舞台对象
var stage = new createjs.Stage(document.getElementById('viewport'));

// 泡泡容器
var bubblecontainer = new createjs.Container(),
	bubblesArr = [];

// 声波容器
var wavepointcontainer = new createjs.Container(),
	wavepointsArr = [];

// 声波点的最终位置
var wavepointFinalPos = [62.5, 72.5, 82.5, 92.5, 102.5, 112.5, 122.5, 132.5, 142.5, 152.5, 162.5, 172.5, 182.5, 192.5, 202.5, 212.5, 222.5, 232.5, 242.5, 252.5, 262.5, 272.5, 282.5, 292.5, 302.5];
// 语音输入时的波形参数
var inputwaveCtx = {
	steps: [16, 32, 8]
};
var thinkwaveDirection = true;

// 文字容器
var prompt = new createjs.Text('', '20px Arial', 'white');
prompt.setBounds({
	x: 0,
	y: 0,
	width: 200,
	height: 30
});
prompt.textAlign = 'center';
prompt.x = 185;
prompt.y = 350;

// 当前状态
var currentState = -1; // -1:无, 0:待机, 1:监听中, 2：语音输入, 3：思考中


/* ------------------
	辅助处理函数
---------------------*/
// 插入气泡
var insertBubble = function() {
	for (var i = BUBBLE_COUNTS - 1; i >= 0; i--) {
		var bubble = new bubbleObj;

		// 存入缓存
		bubblesArr.push(bubble);

		// 初始化bubble
		bubble.init();

		// 放入wrapper中
		bubblecontainer.addChild(bubble.shapeObj);
	};

	// 放入舞台中
	stage.addChild(bubblecontainer);
};

// 插入波点
var insertWavePoint = function() {
	// 1.将声波点放入wrapper中
	for (var i = WAVEPOINT_COUNTS - 1; i >= 0; i--) {
		var point = new wavePointObj;

		// 存入缓存
		wavepointsArr.push(point);

		// 初始化bubble
		point.init();
		// 放置到屏幕中央
		point.refresh({
			x: 185,
			y: 280,
			scaleWidth: 0,
			scaleHeight: 0
		});

		// 放入wrapper中
		wavepointcontainer.addChild(point.shapeObj);
	};

	// 2.将文字放入wrapper中
	wavepointcontainer.addChild(prompt);

	// 放入舞台中
	stage.addChild(wavepointcontainer);

};

// 做正向波浪
var doWave = function(callback) {
	for (var i = 0, len = wavepointsArr.length; i < len; i++) {
		var tmppoint = wavepointsArr[i],
			nxtpoint = wavepointsArr[i + 1],
			step = tmppoint.step,
			maxStep = tmppoint.waveStepArr[tmppoint.waveIndex];

		if (tmppoint.waveFlg) {
			if (tmppoint.direction) {
				tmppoint.increaseStep();

				if (step === 4 && nxtpoint) {
					nxtpoint.waveFlg = true;
				}

				if (step === WAVEPOINT_STEPMAX || step === maxStep) {
					tmppoint.direction = !tmppoint.direction;
				}
			} else {
				tmppoint.decreaseStep();

				if (step === 0) {
					tmppoint.direction = !tmppoint.direction;
					tmppoint.waveFlg = false;
					tmppoint.waveIndex++;

					// 第一个点完成动作
					if (i === 0) {
						if (tmppoint.waveIndex < tmppoint.waveStepArr.length) {
							tmppoint.waveFlg = true;
						}
					}

					// 最后一点完成动作
					if (i === wavepointsArr.length - 1 && tmppoint.waveIndex >= tmppoint.waveStepArr.length) {
						if (callback) {
							callback();
						}
					}
				}
			}
		}

	}
}

// 做反向波浪
var doRevWave = function(callback) {
	for (var i = wavepointsArr.length - 1; i >= 0; i--) {
		var tmppoint = wavepointsArr[i],
			prepoint = wavepointsArr[i - 1],
			step = tmppoint.step,
			maxStep = tmppoint.waveStepArr[tmppoint.waveIndex];

		if (tmppoint.waveFlg) {
			if (tmppoint.direction) {
				tmppoint.increaseStep();

				if (step === 4 && prepoint) {
					prepoint.waveFlg = true;
				}

				if (step === WAVEPOINT_STEPMAX || step === maxStep) {
					tmppoint.direction = !tmppoint.direction;
				}
			} else {
				tmppoint.decreaseStep();

				if (step === 0) {
					tmppoint.direction = !tmppoint.direction;
					tmppoint.waveFlg = false;
					tmppoint.waveIndex++;

					// 最后一点完成动作
					if (i === wavepointsArr.length - 1 && tmppoint.waveIndex >= tmppoint.waveStepArr.length) {
						if (tmppoint.waveIndex < tmppoint.waveStepArr.length) {
							tmppoint.waveFlg = true;
						}
					}

					// 第一个点完成动作
					if (i === 0) {
						if (callback) {
							callback();
						}
					}
				}
			}
		}

	}
}

/* ------------------
		状态函数
---------------------*/
// 进入待机状态
var trans2Wait = function() {
	// 提示文言
	prompt.text = '';

	// 调整按钮显隐和状态
	waitstateBtn.hide();
	listenstateBtn.show();
	thinkstateBtn.hide();
	currentState = 0;
}

// 进入监听中状态
var trans2Listen = function() {
	// 调整按钮显隐和状态
	waitstateBtn.hide();
	listenstateBtn.hide();
	thinkstateBtn.show();
	currentState = 1;
}

// 进入语音输入中状态
var trans2Input = function() {
	// 强制冒泡取的alpha为0
	bubblecontainer.alpha = 0;

	// 提示文言
	prompt.text = '监听中';

	// 重置每个点的位置和波形配置
	for (var i = 0, len = wavepointsArr.length; i < len; i++) {
		var tmppoint = wavepointsArr[i],
			x = tmppoint.pos.x,
			y = tmppoint.pos.y,
			targetPos = wavepointFinalPos[i];

		// 还原所有属性
		wavepointsArr[i].reset();

		// 重新设置位置
		wavepointsArr[i].refresh({
			x: targetPos,
			y: y
		});

		// 重置输入波形个数
		wavepointsArr[i].waveStepArr = inputwaveCtx.steps;

		// 让第一个点开始做动画
		wavepointsArr[0].waveFlg = true;
	}

	// 调整按钮显隐和状态
	waitstateBtn.show();
	listenstateBtn.hide();
	thinkstateBtn.hide();
	currentState = 2;
}

// 进入思考中状态
var trans2Think = function() {
	// 提示文言
	prompt.text = '思考中';

	// 重置每个点的波形配置
	for (var i = 0, len = wavepointsArr.length; i < len; i++) {
		// 重置输入波形个数
		wavepointsArr[i].waveStepArr = [8];
		wavepointsArr[i].waveIndex = 0;

		// 让第一个点开始做动画
		wavepointsArr[0].waveFlg = true;
	}

	thinkwaveDirection = true;

	// 调整状态
	currentState = 3;
}

/* ------------------
		描绘函数
---------------------*/
var handleTick = function() {
	// 等待状态时，冒泡动作
	if (currentState === 0) {
		if (bubblecontainer.alpha <= 0) {
			for (var i = wavepointsArr.length - 1; i >= 0; i--) {
				// 重置波点
				wavepointsArr[i].refresh({
					x: 185,
					y: 280,
					scaleWidth: 0,
					scaleHeight: 0
				});
			};
		}

		if (bubblecontainer.alpha < 1) {
			bubblecontainer.alpha += 0.05;
		}

		for (var i = bubblesArr.length - 1; i >= 0; i--) {
			// 执行冒泡步进
			bubblesArr[i].doBubbleStep();
		};
	}
	// 监听状态时，准备动作
	else if (currentState === 1) {
		// 渐隐泡泡
		if (bubblecontainer.alpha > 0) {
			for (var i = bubblesArr.length - 1; i >= 0; i--) {
				// 执行冒泡步进
				bubblesArr[i].doBubbleStep();
			};

			bubblecontainer.alpha -= 0.05;

			// 显示所有波点
			if (bubblecontainer.alpha <= 0) {
				for (var i = wavepointsArr.length - 1; i >= 0; i--) {
					wavepointsArr[i].refresh({
						x: 175,
						y: 270,
						scaleWidth: 4,
						scaleHeight: 4
					});
				};
			}
		}
		// 缩小并横展开波点
		else {
			var tmpScale = wavepointsArr[0].shapeObj.scaleX;
			if (tmpScale > 1) {
				for (var i = wavepointsArr.length - 1; i >= 0; i--) {
					wavepointsArr[i].refresh({
						x: wavepointsArr[i].pos.x + 2.5,
						y: wavepointsArr[i].pos.y + 2.5,
						scaleWidth: tmpScale - 1,
						scaleHeight: tmpScale - 1
					});
				};
			} else {
				for (var i = wavepointsArr.length - 1; i >= 0; i--) {
					var tmppoint = wavepointsArr[i],
						x = tmppoint.pos.x,
						fixedX = parseFloat(x.toFixed(1)),
						y = tmppoint.pos.y,
						targetPos = wavepointFinalPos[i],
						step = 0;


					if (fixedX < targetPos) {
						step = 2.5;
					} else if (fixedX > targetPos) {
						step = -2.5;
					}
					wavepointsArr[i].refresh({
						x: x + step,
						y: y
					});
				};
			}
		}
	}
	// 语音输入状态时，声波动作
	else if (currentState === 2) {
		doWave(trans2Think);
	}
	// 思考状态时，声波动作
	else if (currentState === 3) {
		if (thinkwaveDirection) {
			doWave(function() {
				// 重置每个点的波形配置
				for (var i = 0, len = wavepointsArr.length; i < len; i++) {
					// 重置波形索引
					wavepointsArr[i].waveIndex = 0;

					// 让最后一个点开始做动画
					wavepointsArr[24].waveFlg = true;
				}

				thinkwaveDirection = false;
			});
		} else {
			doRevWave(function() {
				// 重置每个点的波形配置
				for (var i = 0, len = wavepointsArr.length; i < len; i++) {
					// 重置波形索引
					wavepointsArr[i].waveIndex = 0;

					// 让第一个点开始做动画
					wavepointsArr[0].waveFlg = true;
				}

				thinkwaveDirection = true;
			})
		}

	}
	// 其余状态，退出
	else {
		return;
	}


	// 刷新stage
	stage.update();
};

/* ------------------
		主函数
---------------------*/
var main = function() { // 初始化
	$(document).ready(function() {
		// 插入泡泡对象
		insertBubble();
		// 插入
		insertWavePoint();

		// 进入wait状态
		trans2Wait();


		// 绑定按钮的点击事件
		waitstateBtn.on('click', trans2Wait);
		listenstateBtn.on('click', trans2Listen);
		thinkstateBtn.on('click', trans2Input);


		// 设置心跳监听
		var ticker = createjs.Ticker;
		ticker.addEventListener("tick", handleTick);

		// 刷新stage
		stage.update();
	});
};

main();