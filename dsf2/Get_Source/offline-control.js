// offline-control.js
(function() {
    // 创建必要的DOM元素
    const alertElement = document.createElement('div');
    const successElement = document.createElement('div');
    const overlay = document.createElement('div');
    
    // 设置元素样式
    Object.assign(alertElement.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '16px 24px',
        background: '#ff4757',
        color: 'white',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        opacity: '0',
        transition: 'all 0.3s ease',
        zIndex: '9999'
    });
    
    Object.assign(successElement.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '16px 24px',
        background: '#2ed573',
        color: 'white',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        opacity: '0',
        transition: 'all 0.3s ease',
        zIndex: '9999'
    });
    
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        display: 'none',
        zIndex: '9998'
    });
    
    // 设置元素的文本内容
    alertElement.textContent = '网络已断开，请检查你的连接！';
    successElement.textContent = '连接成功';
    
    // 添加元素到body
    document.body.appendChild(alertElement);
    document.body.appendChild(successElement);
    document.body.appendChild(overlay);
    
    // 动画相关变量
    let pulseInterval = null;
    let successTimeout = null;
    
    // 网络状态处理函数
    function handleOffline() {
        showAlert(alertElement, '#ff4757');
        disablePageInteraction();
        // 清除可能存在的成功提示定时器
        if (successTimeout) {
            clearTimeout(successTimeout);
            successTimeout = null;
        }
    }
    
    function handleOnline() {
        hideAlert(alertElement);
        showSuccess(successElement);
        enablePageInteraction();
    }
    
    // 显示警告提示
    function showAlert(element, bgColor) {
        element.style.background = bgColor;
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let opacity = 0;
        let top = -50;
        const interval = setInterval(() => {
            opacity += 0.05;
            top += 2;
            element.style.opacity = opacity;
            element.style.top = top + 'px';
            
            if (opacity >= 1 && top >= 20) {
                clearInterval(interval);
                startPulse(element);
            }
        }, 16);
    }
    
    // 隐藏警告提示
    function hideAlert(element) {
        stopPulse();
        
        let opacity = 1;
        const interval = setInterval(() => {
            opacity -= 0.05;
            element.style.opacity = opacity;
            
            if (opacity <= 0) {
                clearInterval(interval);
                element.style.display = 'none';
            }
        }, 16);
    }
    
    // 显示成功提示
    function showSuccess(element) {
        // 先确保元素隐藏
        element.style.display = 'none';
        element.style.opacity = '0';
        
        // 设置初始位置
        element.style.top = '-50px';
        
        // 强制重绘
        void element.offsetWidth;
        
        // 开始动画
        element.style.display = 'block';
        element.style.opacity = '0';
        
        let top = -50;
        const slideInterval = setInterval(() => {
            top += 2;
            element.style.top = top + 'px';
            
            if (top >= 20) {
                clearInterval(slideInterval);
                element.style.opacity = '1';
                
                // 1.7秒后开始淡出
                successTimeout = setTimeout(() => {
                    let opacity = 1;
                    const fadeInterval = setInterval(() => {
                        opacity -= 0.05;
                        element.style.opacity = opacity;
                        
                        if (opacity <= 0) {
                            clearInterval(fadeInterval);
                            element.style.display = 'none';
                        }
                    }, 16);
                }, 1700);
            }
        }, 16);
    }
    
    // 禁用页面交互
    function disablePageInteraction() {
        overlay.style.display = 'block';
        
        const interactiveElements = document.querySelectorAll('button, input, select, textarea, a');
        interactiveElements.forEach(element => {
            element.disabled = true;
            if (element.tagName === 'A') {
                element.style.pointerEvents = 'none';
                element.style.opacity = '0.6';
            }
        });
    }
    
    // 启用页面交互
    function enablePageInteraction() {
        overlay.style.display = 'none';
        
        const interactiveElements = document.querySelectorAll('button, input, select, textarea, a');
        interactiveElements.forEach(element => {
            element.disabled = false;
            if (element.tagName === 'A') {
                element.style.pointerEvents = '';
                element.style.opacity = '';
            }
        });
    }
    
    // 脉冲动画
    function startPulse(element) {
        let scale = 1;
        pulseInterval = setInterval(() => {
            scale += 0.02;
            element.style.transform = `translateX(-50%) scale(${scale})`;
            
            if (scale >= 1.02) {
                scale = 1;
                element.style.transform = `translateX(-50%) scale(${scale})`;
            }
        }, 16);
    }
    
    function stopPulse() {
        if (pulseInterval) {
            clearInterval(pulseInterval);
            pulseInterval = null;
            alertElement.style.transform = 'translateX(-50%) scale(1)';
        }
    }
    
    // 检查初始网络状态
    if (!navigator.onLine) {
        handleOffline();
    }
    
    // 监听网络状态变化
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
})();
