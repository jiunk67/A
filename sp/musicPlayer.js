class MusicPlayer {
    constructor() {
        this.audio = null;
        this.musicList = ['Music/1.mp3', 'Music/2.mp3', 'Music/3.mp3'];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.init();
    }

    init() {
        console.log('音乐播放器初始化');
        // 检查是否已有音频实例在其他页面创建
        if (!this.audio) {
            this.createAudioElement();
        }
        this.loadState();
        this.setupEventListeners();
        console.log('音乐播放器初始化完成，等待用户点击');
    }

    createAudioElement() {
        console.log('创建音频元素');
        this.audio = document.createElement('audio');
        this.audio.id = 'musicPlayer';
        this.audio.style.display = 'none';
        document.body.appendChild(this.audio);
        console.log('音频元素创建成功');
    }

    loadState() {
        console.log('加载播放状态');
        // 从localStorage加载播放状态
        const savedIndex = localStorage.getItem('musicCurrentIndex');
        const savedTime = localStorage.getItem('musicCurrentTime');
        const savedPlaying = localStorage.getItem('musicIsPlaying');

        if (savedIndex !== null) {
            this.currentIndex = parseInt(savedIndex);
            console.log('从本地存储加载播放索引:', this.currentIndex);
        }

        if (this.audio) {
            this.audio.src = this.musicList[this.currentIndex];
            console.log('设置音频源:', this.audio.src);
            
            if (savedTime !== null) {
                this.audio.currentTime = parseFloat(savedTime);
                console.log('从本地存储加载播放时间:', this.audio.currentTime);
            }

            if (savedPlaying === 'true') {
                this.isPlaying = true;
                console.log('从本地存储加载播放状态: 正在播放');
            }
        }
    }

    saveState() {
        // 保存播放状态到localStorage
        localStorage.setItem('musicCurrentIndex', this.currentIndex.toString());
        if (this.audio) {
            localStorage.setItem('musicCurrentTime', this.audio.currentTime.toString());
        }
        localStorage.setItem('musicIsPlaying', this.isPlaying.toString());
        console.log('保存播放状态: 索引=' + this.currentIndex + ', 时间=' + (this.audio ? this.audio.currentTime : 0) + ', 状态=' + (this.isPlaying ? '播放中' : '暂停'));
    }

    setupEventListeners() {
        if (!this.audio) return;

        console.log('设置事件监听器');

        // 播放结束事件，切换到下一首
        this.audio.addEventListener('ended', () => {
            console.log('当前音乐播放结束');
            this.playNext();
        });

        // 状态变化时保存状态
        this.audio.addEventListener('timeupdate', () => {
            // 每5秒保存一次状态，避免频繁写入localStorage
            if (Math.floor(this.audio.currentTime) % 5 === 0) {
                this.saveState();
            }
        });

        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            console.log('音乐开始播放');
            this.saveState();
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            console.log('音乐暂停');
            this.saveState();
        });

        this.audio.addEventListener('loadedmetadata', () => {
            console.log('音乐元数据加载完成:', this.audio.src);
        });

        this.audio.addEventListener('error', (e) => {
            console.error('音频加载错误:', e);
            console.error('错误代码:', e.target.error.code);
            console.error('错误消息:', e.target.error.message);
        });

        // 点击页面时尝试播放（解决自动播放限制）
        document.addEventListener('click', () => {
            console.log('用户点击页面，尝试播放音乐');
            this.tryPlay();
        }, { once: true });

        // 触摸事件（移动设备）
        document.addEventListener('touchstart', () => {
            console.log('用户触摸页面，尝试播放音乐');
            this.tryPlay();
        }, { once: true });
    }

    tryPlay() {
        if (!this.audio) {
            console.error('音频元素不存在');
            return;
        }

        if (!this.isPlaying) {
            console.log('尝试播放音乐:', this.audio.src);
            this.audio.play().then(() => {
                console.log('音乐播放成功');
            }).catch(error => {
                console.error('播放失败:', error);
                console.log('请确保音乐文件存在且路径正确');
            });
        } else {
            console.log('音乐已经在播放中');
        }
    }

    playNext() {
        this.currentIndex = (this.currentIndex + 1) % this.musicList.length;
        console.log('切换到下一首音乐，索引:', this.currentIndex);
        this.audio.src = this.musicList[this.currentIndex];
        console.log('设置新音频源:', this.audio.src);
        this.audio.play().then(() => {
            console.log('下一首音乐播放成功');
        }).catch(error => {
            console.error('播放下一首失败:', error);
        });
        this.saveState();
    }
}

// 检查当前页面是否为主页面
function isMainPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename === 'index.html' || filename.match(/^main\d+\.html$/);
}

// 仅在主页面初始化播放器
if (isMainPage()) {
    window.addEventListener('DOMContentLoaded', () => {
        window.musicPlayer = new MusicPlayer();
    });
}