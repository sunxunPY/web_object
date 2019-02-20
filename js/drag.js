(function(w){
	w.contentDrag = function (navWrap,callback){
			//竖向滑屏，橡皮筋效果（越来越难拖，回弹），加速,即点即停,滚动条，防抖动
						
			var navList = navWrap.firstElementChild;
//			var navList = navWrap.children[1];
			transformCss(navList,'translateZ',0.1);
			
			
			//拖拽原理： 元素初始位置 + 手机距离差 = 元素最终位置
			//定义元素初始位置 
			var eleY = 0;
			//定义手指初始位置
			var startY = 0;
			
			//加速
			var s1 = 0;
			var t1 = 0;
			var s2 = 0;
			var t2 = 0;
			//距离差
			var disS = 0;
			//时间差 （非零数字）
			var disT = 1;
			
			//模拟加速与回弹，tween算法
			var Tween = {
				//加速(匀速)
				Linear: function(t,b,c,d){ return c*t/d + b; },
				//回弹
				easeOut: function(t,b,c,d,s){
		            if (s == undefined) s = 3;
		            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		        }
			};
			
			//定时器
			var timer = null;
			
			//防抖动
			var startX = 0;
			var isFirst = true;
			var isMoving = true;
			
			
			navWrap.addEventListener('touchstart',function(event){
				var touch = event.changedTouches[0];
				//清除过渡
				navList.style.transition = 'none';
				
				//真正的即点即停 ： 清除定时器
				clearInterval(timer);
				
				//元素初始位置 
				eleY = transformCss(navList,'translateY');
				//手指初始位置
				startY = touch.clientY;
				startX = touch.clientX;
				
				//确定元素初始位置与初始时间
				s1 = eleY;
				t1 = new Date().getTime(); //毫秒
				
				//清除一下上一次speed
				disS = 0;
				
				//调用外部callback
				if(callback && typeof callback['start'] == 'function'){
					callback['start']();
				};
				
				//防抖动 更新
				isFirst = true;
				isMoving = true;
				
			});
			navWrap.addEventListener('touchmove',function(event){
				var touch = event.changedTouches[0];
				
				if(!isMoving){
					return;
				};
				
				//元素最终位置
				var endY = touch.clientY;
				var endX = touch.clientX;
				//手指距离差
				var disY = endY - startY;
				var disX = endX - startX;
				
				//范围限定(橡皮筋拖的效果：越来越难拖)
				var translateY = eleY + disY;
//				console.log('之前 = '+ translateY)
				if(translateY > 0){
					//越来越难拖
					//数值（比例），逐渐减小的
					//比例 = 1 - 左边留白/375 ;  translateY 增加， 比例逐渐减小
					var scale = 0.6 - translateY/(document.documentElement.clientHeight*3);
//					console.log('scale = '+ scale)

					//新的左边留白 = 之前的左边留白 * scale
					//新的translateY = 临界值 + 新的左边留白
					translateY = 0 +  translateY * scale;
//					console.log('新的 = '+ translateY)
					
					//translateY 整体逐渐增加 ， 但是增加差值 减小的
					//		4.8         4.667       4.53
					//（5，4.933）  （10，9.733）  （15，14.4）  （20，18.93）
					
				}else if(translateY < document.documentElement.clientHeight-navList.offsetHeight){
					//数值（比例），逐渐减小的
					//右边留白（正值） = translateY - 临界值
					var over = Math.abs(translateY) - Math.abs(document.documentElement.clientHeight-navList.offsetHeight)
					//比例 = 1 - 右边留白/375
					var scale = 0.6 - over/(document.documentElement.clientHeight*3);
					
					//新的右边留白 = 之前的右边留白 * scale
					//新的translateY = 临界值 + 新的右边留白
					translateY = document.documentElement.clientHeight-navList.offsetHeight - over * scale;
				
				};
				
				//防抖动
				if(isFirst){
					isFirst = false;
					if(Math.abs(disX) > Math.abs(disY)){
						isMoving = false;
						return;
					}
				}
				
								
				//元素最终位置
				transformCss(navList,'translateY',translateY);
				
				//确定元素结束位置与结束时间
				s2 = translateY;
//				console.log('s2 = '+ s2)
				t2 = new Date().getTime();
				//路程差
				disS = s2 - s1;
				//时间差
				disT = t2 - t1;
				
				//调用外部callback
				if(callback && typeof callback['move'] == 'function'){
					callback['move']();
				};
				
			});
			//加速
			navWrap.addEventListener('touchend',function(){
				//速度 = 路程差/时间差
				var speed = disS/disT;				
//				console.log('speed = '+ speed)
								
				//元素目标位置 = touchmove产生的位移值 + 速度产生位置
				var target = transformCss(navList,'translateY') + speed*100;
//				console.log('touchmove = '+transformCss(navList,'translateY'))
//				console.log('target = '+target)
				
				var type = 'Linear';
				if(target > 0){
					type = 'easeOut';
					target = 0;
				}else if(target < document.documentElement.clientHeight - navList.offsetHeight){
					type = 'easeOut';
					target = document.documentElement.clientHeight - navList.offsetHeight
				}
				
				//橡皮筋回弹
				//加速
				//起始位置到结束位置花费的总时间
				var timeAll = 1;
				TweenMove(target,timeAll,type);
				
				
				
			});
			
			function TweenMove(target,timeAll,type){
				//t : 当前的次数
				var t = 0;
				//b : 元素起始位置
				var b = transformCss(navList,'translateY');
//				console.log('b = '+b)
				//c : 结束位置与起始位置的距离差
				var c = target - b;
//				console.log('c = '+c)
				//d : 总次数  = 总时间/每一步的时间
				var d = timeAll/0.02;
//				console.log('d = '+d)
				
				//清除定时器：防止重复开始定时器
				clearInterval(timer);
				timer = setInterval(function(){
					t++;
					
					if(t > d){
						//停止定时器
						clearInterval(timer);
						//调用外部callback
						if(callback && typeof callback['end'] == 'function'){
							callback['end']();
						};
				
					}else{
						
						//加速与回弹
						//调用外部callback
						if(callback && typeof callback['move'] == 'function'){
							callback['move']();
						};
//						console.log(type)
						var point = Tween[type](t,b,c,d);
//						console.log('point = '+ point)
						transformCss(navList,'translateY',point);
					}
					
				},20)
				
				
			};
			
			
			
		};
		
		
		
})(window);
