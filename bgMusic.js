// 后台音乐播放器 - 仅在index.html播放
(function() {
    // 检查当前页面是否是index.html
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    const isIndexPage = (filename === 'index.html' || filename === '' || filename === 'A-main');
    
    // 如果不是index.html，不执行任何操作
    if (!isIndexPage) return;

    const musicList = ['Music/1.mp3', 'Music/2.mp3', 'Music/3.mp3'];
    let audio = null;
    let saveInterval = null;

    // 获取当前播放索引
    function getCurrentIndex() {
        return parseInt(localStorage.getItem('bgMusicIndex') || '0');
    }

    // 保存播放状态
    function saveState() {
        if (!audio) return;
        localStorage.setItem('bgMusicTime', audio.currentTime);
    }

    // 创建音频元素
    function createAudio() {
        if (audio) return;
        
        audio = document.createElement('audio');
        audio.id = 'bgMusicPlayer';
        audio.style.display = 'none';
        audio.preload = 'auto';
        document.body.appendChild(audio);

        // 音频播放结束，切换到下一首
        audio.addEventListener('ended', function() {
            let index = getCurrentIndex();
            index = (index + 1) % musicList.length;
            localStorage.setItem('bgMusicIndex', index);
            localStorage.setItem('bgMusicTime', '0');
            playCurrentSong();
        });

        // 定期保存播放进度
        audio.addEventListener('play', function() {
            if (saveInterval) clearInterval(saveInterval);
            saveInterval = setInterval(saveState, 1000);
        });

        audio.addEventListener('pause', function() {
            if (saveInterval) {
                clearInterval(saveInterval);
                saveInterval = null;
            }
            saveState();
        });
    }

    // 播放当前歌曲
    function playCurrentSong() {
        if (!audio) createAudio();
        
        const index = getCurrentIndex();
        const songSrc = musicList[index];
        
        // 设置音频源
        audio.src = songSrc;
        audio.load();
        
        // 尝试恢复进度
        const savedTime = parseFloat(localStorage.getItem('bgMusicTime') || '0');
        
        // 等待音频元数据加载完成
        audio.addEventListener('loadedmetadata', function onLoaded() {
            audio.removeEventListener('loadedmetadata', onLoaded);
            
            // 恢复进度
            if (savedTime > 0 && savedTime < audio.duration - 1) {
                audio.currentTime = savedTime;
            } else {
                audio.currentTime = 0;
            }
            
            // 播放
            audio.play().catch(function() {});
        }, { once: true });
    }

    // 尝试播放
    function tryPlay() {
        if (!audio) {
            playCurrentSong();
        } else if (audio.paused) {
            audio.play().catch(function() {});
        }
    }

    // 初始化
    function init() {
        createAudio();
        playCurrentSong();
    }

    // 页面加载完成后立即初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 自动播放失败时，持续尝试播放直到成功
    let autoPlayAttempts = 0;
    function keepTryingPlay() {
        if (!audio || audio.paused) {
            tryPlay();
            autoPlayAttempts++;
            if (autoPlayAttempts < 100) {
                setTimeout(keepTryingPlay, 100);
            }
        }
    }
    
    // 页面加载后开始持续尝试播放
    setTimeout(keepTryingPlay, 100);

    // 页面卸载前保存状态
    window.addEventListener('beforeunload', function() {
        if (audio) {
            saveState();
        }
    });
})();
