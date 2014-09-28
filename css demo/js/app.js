/* ------------------
		变量对象
---------------------*/
// 获取jquery dom对象
var viewport = $(".viewport"),
	waitstateBtn = $('#waitstate'),
	listenstateBtn = $('#listenstate'),
	thinkstateBtn = $('#thinkstate'),
	bubblewrapperDiv = $('.bubblewrapper'),
	pointswrapperDiv = $('.pointswrapper'),
	promptDiv = $('.prompt');

// 泡泡缓存数组
var bubblesArr = [];

// 声波点缓存数组
var wavepointsArr = [];

// 声波对象
var waveInstance = null;

// 当前状态
var currentState = -1; // -1:无, 0:待机, 1:监听中, 2：思考中


/* ------------------
	辅助处理函数(气泡)
---------------------*/
// 插入气泡
var insertBubble = function() {
	for (var i = BUBBLE_COUNTS - 1; i >= 0; i--) {
		var bubble = new bubbleObj;

		// 存入缓存
		bubblesArr.push(bubble);

		// 初始化bubble
		bubble.init();

		// 开始冒泡
		bubble.start();

		// 加入到dom树上
		bubblewrapperDiv.append(bubble.dom);
	};
};

// 刷新气泡动画
var refreshBubble = function() {
	for (var i = bubblesArr.length - 1; i >= 0; i--) {
		bubblesArr[i].start();
	};
}

// 停止气泡动画
var stopBubble = function() {
	for (var i = bubblesArr.length - 1; i >= 0; i--) {
		bubblesArr[i].stop();
	};
}

/* ------------------
	辅助处理函数(声波点)
---------------------*/
// 插入波点
var insertWavePoint = function() {
	for (var i = WAVEPOINT_COUNTS - 1; i >= 0; i--) {
		var point = new wavePointObj;

		// 存入缓存
		wavepointsArr.push(point);

		// 初始化bubble
		point.init();

		// 加入到dom树上
		pointswrapperDiv.append(point.dom);
	};
};

// 重置所有波点
var resetWavePoint = function() {
	for (var i = wavepointsArr.length - 1; i >= 0; i--) {
		wavepointsArr[i].reset();
	};
};

// 完成所有波点动画
var endWavePointAnima = function() {
	for (var i = wavepointsArr.length - 1; i >= 0; i--) {
		wavepointsArr[i].dom.stop(true, true);
	};
};

// 开始波点的准备工作
var doReadyWavePoint = function() {
	var commonPointConfig = {
		width: 5,
		height: 5,
		x: 185,
		y: 60
	};

	// 判断wave实例不存在时,创建一个
	if (!waveInstance) {
		waveInstance = new waveObj();
		waveInstance.init();
	}

	if (wavepointsArr.length === WAVEPOINT_COUNTS) {
		var tmpWavePoint = wavepointsArr[0];

		// 设置第一个点的状态
		tmpWavePoint.refresh({
			width: 25,
			height: 25,
			x: 175,
			y: 50
		});
		waveInstance.pointsArr[12] = wavepointsArr[0];

		// 第一个点进行动画
		tmpWavePoint.dom.animate({
			width: 5,
			height: 5,
			left: 185,
			top: 60
		}, 300, 'linear', function() {
			// 更新第一个点的状态
			tmpWavePoint.refresh(commonPointConfig);

			// 其余点做展开
			for (var i = 1; i < WAVEPOINT_COUNTS; i++) {
				tmpWavePoint = wavepointsArr[i];

				// 刷新对应点的效果
				tmpWavePoint.refresh(commonPointConfig);

				// 中间参数
				var idStep = parseInt((i + 1) / 2),
					toPosX = idStep * 10;

				if (i % 2) {
					// 奇数向左偏移
					toPosX = 185 - toPosX;
					waveInstance.pointsArr[12 - idStep] = wavepointsArr[i];
				} else {
					// 偶数向右偏移
					toPosX += 185;
					waveInstance.pointsArr[12 + idStep] = wavepointsArr[i];
				}

				// 执行展开动画
				tmpWavePoint.dom.animate({
					left: toPosX
				});
			};
		})
	}
};

// 执行波点监听效果
var doListeningWavePoint = function(callback) {
	// 显示一个4-8-3-6步进的波形
	waveInstance.doWave(4, function() {
		waveInstance.doWave(8, function() {
			waveInstance.doWave(3, function() {
				waveInstance.doWave(6, null, callback);
			}, null);
		}, null);
	}, null);
};

// 执行波点思考效果
var doThinkingWavePoint = function() {
	waveInstance.doWave(2, null, function() {
		waveInstance.doRevWave(2, null, function() {
			doThinkingWavePoint();
		});
	});
};


/* ------------------
		状态函数
---------------------*/
// 进入待机状态
var trans2Wait = function() {
	if (bubblesArr.length === 0) {
		// 当bubbleArr没有内容时，插入bubble
		insertBubble();
	} else {
		// 否则，刷新bubble，继续冒泡
		refreshBubble();
	}

	// 重置声波点的效果和提示
	resetWavePoint();
	promptDiv.html('');

	// 去除viewport上的其他状态class，并加上wait状态class
	viewport.removeClass('listen think').addClass('wait');

	// 调整按钮显隐和状态
	waitstateBtn.hide();
	listenstateBtn.show();
	thinkstateBtn.hide();
	currentState = 0;
}

// 进入监听中状态
var trans2Listen = function() {
	// 当从待机跳转过来时，执行动画
	bubblewrapperDiv.animate({
		"opacity": 0
	}, 1200, 'linear', function() {
		// 重置opacity属性
		bubblewrapperDiv.css("opacity", 1);

		// 去除viewport上的其他状态class，并加上listen状态class
		viewport.removeClass('wait think').addClass('listen');

		// 当wavepointsArr没有内容时，插入points
		if (wavepointsArr.length === 0) {
			insertWavePoint();
		}

		// wavepoints做开始动作
		doReadyWavePoint();

		// 异步队列
		setTimeout(function() {
			// 停止冒泡
			stopBubble();
		}, 0);
	});

	// 调整按钮显隐和状态
	waitstateBtn.hide();
	listenstateBtn.hide();
	thinkstateBtn.show();
	currentState = 1;
}

// 进入思考中状态
var trans2Think = function() {
	// 停止，并完成冒泡区域的动画
	bubblewrapperDiv.stop(true, true);
	// 停止冒泡
	stopBubble();
	// 完成之前声波的准备动画
	endWavePointAnima();

	// 去除viewport上的其他状态class，并加上think状态class
	viewport.removeClass('wait listen').addClass('think');

	// 刷新文字
	promptDiv.html('监听中');
	// 执行监听动画，并在完成时进入思考动画
	doListeningWavePoint(function() {
		promptDiv.html('思考中');

		doThinkingWavePoint();
	});

	// 调整按钮显隐和状态
	waitstateBtn.show();
	listenstateBtn.hide();
	thinkstateBtn.hide();
	currentState = 2;
}


/* ------------------
		主函数
---------------------*/
var main = function() {
	// 初始化
	$(document).ready(function() {
		// 应用环境变量
		bubblewrapperDiv.css('-webkit-perspective', BUBBLE_PERSPECTIVE);

		// 进入wait状态
		trans2Wait();

		// 绑定按钮的点击事件
		waitstateBtn.on('click', trans2Wait);
		listenstateBtn.on('click', trans2Listen);
		thinkstateBtn.on('click', trans2Think);
	});
}

main();