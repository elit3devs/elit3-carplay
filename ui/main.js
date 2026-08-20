let curVehID = null;
let isUIOpen = false;
let isMusicPlaying = false;
let curVolume = 100;
let curMusicURL = '';
let isLiked = false;
let loginDataState = null;
let configData = null;
let curUnit = 'Km';
let isMusicOverlay = false;
let isMiniUIOpen = false;
let curSongTitle = '';
let currentSyncAction = '';
let stopwatchInterval = null;
let stopwatchTime = 0;
let stopwatchRunning = false;
let laps = [];
let factoryResetTarget = '';
let dashboardTimerInterval = null;

function nuiCallback(name, data) {
    return fetch(`https://${GetParentResourceName()}/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {})
    }).then(function(r) { return r.json(); }).catch(function() { return null; });
}

function formatTime(seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

function setPlayIcons(playing) {
    var icons = document.querySelectorAll('.music-stop, .menu-music-stop');
    icons.forEach(function(icon) {
        icon.classList.remove('fa-play', 'fa-pause');
        icon.classList.add(playing ? 'fa-pause' : 'fa-play');
    });
}

function updateLikeIcon(liked) {
    var hearts = document.querySelectorAll('.like-music');
    hearts.forEach(function(h) {
        h.style.color = liked ? '#e74c3c' : '';
    });
}

function updateLoopIcon(looped) {
    var loops = document.querySelectorAll('.music-loop');
    loops.forEach(function(l) {
        l.style.color = looped ? '#1db954' : '';
    });
}

function hideAllPanels() {
    var panels = document.querySelectorAll(
        '.music-app, .playlist-app, .car-details-app, .vehicle-control-app, ' +
        '.video-app, .settings-app, .appearance-setting, .wallpaper-settings, ' +
        '.factory-settings, .stop-watch-app, .snake-game-app, .dashboard-app, .siri-app'
    );
    panels.forEach(function(p) { p.style.display = 'none'; });
}

function showAppPanel(panelClass) {
    hideAllPanels();
    document.querySelector('.main-slider-apps').style.display = 'none';
    document.querySelector('.main-slider-home').style.display = 'none';
    var panel = document.querySelector('.' + panelClass);
    if (panel) panel.style.display = 'flex';
}

function goHome() {
    hideAllPanels();
    document.querySelector('.main-slider-home').style.display = 'flex';
    document.querySelector('.main-slider-apps').style.display = 'none';
}

function setMusicSongInfo(url) {
    var title = url || 'No Music Playing';
    document.querySelector('.music-card-title').textContent = title;
    document.querySelector('.music-song-title p').textContent = title;
    document.querySelector('.mini-song-title span').textContent = title;
    curSongTitle = title;
}

var snakeGameInterval = null;
function initSnakeGame() {
    var container = document.querySelector('.snake-game-app');
    if (snakeGameInterval) { clearInterval(snakeGameInterval); snakeGameInterval = null; }
    container.innerHTML = '';
    var canvas = document.createElement('canvas');
    var cw = Math.min(container.clientWidth - 20, 600);
    var ch = Math.min(container.clientHeight - 20, 400);
    canvas.width = cw;
    canvas.height = ch;
    canvas.style.borderRadius = '2vh';
    canvas.style.background = '#111';
    canvas.style.maxWidth = '100%';
    canvas.style.maxHeight = '100%';
    container.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var gridSize = 20;
    var tileCount = canvas.width / gridSize;
    var snake = [{x: 10, y: 10}];
    var food = {x: 15, y: 15};
    var dx = 0, dy = 0;
    var score = 0;
    function placeFood() {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * (canvas.height / gridSize));
        for (var i = 0; i < snake.length; i++) {
            if (snake[i].x === food.x && snake[i].y === food.y) { placeFood(); return; }
        }
    }
    function gameLoop() {
        if (dx === 0 && dy === 0) return;
        var head = {x: snake[0].x + dx, y: snake[0].y + dy};
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= canvas.height / gridSize) { clearInterval(snakeGameInterval); snakeGameInterval = null; ctx.fillStyle = '#fff'; ctx.font = '30px Arial'; ctx.textAlign = 'center'; ctx.fillText('Game Over! Score: ' + score, canvas.width / 2, canvas.height / 2); return; }
        for (var i = 0; i < snake.length; i++) { if (snake[i].x === head.x && snake[i].y === head.y) { clearInterval(snakeGameInterval); snakeGameInterval = null; ctx.fillStyle = '#fff'; ctx.font = '30px Arial'; ctx.textAlign = 'center'; ctx.fillText('Game Over! Score: ' + score, canvas.width / 2, canvas.height / 2); return; } }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) { score++; placeFood(); } else { snake.pop(); }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#2ecc71';
        for (var i = 0; i < snake.length; i++) { ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2); }
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Score: ' + score, 10, 25);
    }
    document.onkeydown = function(e) {
        if (!document.querySelector('.snake-game-app') || document.querySelector('.snake-game-app').style.display === 'none') return;
        if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
        else if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
        else if (e.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
        else if (e.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
    };
    if (snakeGameInterval) clearInterval(snakeGameInterval);
    snakeGameInterval = setInterval(gameLoop, 120);
}

document.addEventListener('DOMContentLoaded', function() {
    nuiCallback('fetchAppInfo').then(function(info) {
        if (!info) return;
        configData = info;
        document.querySelectorAll('.app').forEach(function(app) {
            var classes = app.getAttribute('class').split(' ');
            var appName = classes[1];
            if (info.enableApps && !info.enableApps.includes(appName)) {
                app.style.display = 'none';
            }
        });
    });

    var savedDark = localStorage.getItem('darkMode');
    var savedWallpaper = localStorage.getItem('wallpaper');
    var savedSiri = localStorage.getItem('siri');
    var savedSound = localStorage.getItem('sound');
    var savedRgb = localStorage.getItem('rgb');
    var savedMinimized = localStorage.getItem('minimized');
    var savedBrightness = localStorage.getItem('brightness');
    var savedZoom = localStorage.getItem('zoom');
    var savedPosition = localStorage.getItem('position');

    var wrapper = document.querySelector('.wrapper');
    var homeBackground = document.querySelector('.home-background');
    var miniUI = document.querySelector('.mini-ui-draggable');

    if (savedDark === 'true') {
        wrapper.classList.add('dark-mode');
        wrapper.classList.remove('light-mode');
    } else if (savedDark === 'false') {
        wrapper.classList.add('light-mode');
        wrapper.classList.remove('dark-mode');
    }

    if (savedWallpaper) homeBackground.src = savedWallpaper;
    if (savedSiri !== null) document.getElementById('checkbox-siri').checked = savedSiri === 'true';
    if (savedSound !== null) document.getElementById('checkbox-sound').checked = savedSound === 'true';
    if (savedRgb !== null) document.getElementById('checkbox-rgb').checked = savedRgb === 'true';
    if (savedMinimized !== null) {
        document.getElementById('checkbox-minimized').checked = savedMinimized === 'true';
        isMusicOverlay = savedMinimized === 'true';
    }

    if (savedBrightness !== null) {
        document.getElementById('brightslider').value = savedBrightness;
        wrapper.style.filter = 'brightness(' + (savedBrightness / 100) + ')';
    }

    if (savedZoom !== null) {
        document.querySelector('.draggable').style.transform = 'scale(' + savedZoom + ')';
        document.getElementById('zoomLevel').textContent = parseFloat(savedZoom).toFixed(1);
    }

    if (savedPosition) {
        try {
            var pos = JSON.parse(savedPosition);
            document.querySelector('.draggable').style.left = pos.left + 'px';
            document.querySelector('.draggable').style.top = pos.top + 'px';
        } catch (e) {}
    }

    try {
        $('.draggable').draggable({
            containment: 'window',
            stop: function() {
                if (document.getElementById('checkbox-position').checked) {
                    var pos = {
                        left: parseInt($('.draggable').css('left')),
                        top: parseInt($('.draggable').css('top'))
                    };
                    localStorage.setItem('position', JSON.stringify(pos));
                }
            }
        });
    } catch (e) {}

    try {
        $('.mini-ui-draggable').draggable({ containment: 'window' });
    } catch (e) {}

    document.querySelector('.zoomInBtn').addEventListener('click', function() {
        var el = document.querySelector('.draggable');
        var curScale = parseFloat(el.style.transform.replace('scale(', '').replace(')', '')) || 1;
        curScale = Math.min(curScale + 0.1, 2.0);
        el.style.transform = 'scale(' + curScale + ')';
        document.getElementById('zoomLevel').textContent = curScale.toFixed(1);
        localStorage.setItem('zoom', curScale);
    });

    document.querySelector('.zoomOutBtn').addEventListener('click', function() {
        var el = document.querySelector('.draggable');
        var curScale = parseFloat(el.style.transform.replace('scale(', '').replace(')', '')) || 1;
        curScale = Math.max(curScale - 0.1, 0.5);
        el.style.transform = 'scale(' + curScale + ')';
        document.getElementById('zoomLevel').textContent = curScale.toFixed(1);
        localStorage.setItem('zoom', curScale);
    });
});

document.querySelector('.left-home-menu-btn').addEventListener('click', function() {
    var apps = document.querySelector('.main-slider-apps');
    var home = document.querySelector('.main-slider-home');
    if (apps.style.display === 'flex') {
        apps.style.display = 'none';
        home.style.display = 'flex';
    } else {
        apps.style.display = 'flex';
        home.style.display = 'none';
    }
});

document.querySelector('.home-music-app').addEventListener('click', function() {
    showAppPanel('music-app');
});

document.querySelector('.home-playlist-app').addEventListener('click', function() {
    showAppPanel('playlist-app');
    nuiCallback('fetchPlaylist', { login: loginDataState ? loginDataState.login : '' }).then(function(result) {
        if (!result) return;
        var container = document.querySelector('.playlist-middle');
        container.innerHTML = '';
        result.forEach(function(song) {
            var div = document.createElement('div');
            div.className = 'playlist-song';
            div.innerHTML =
                '<div class="playlist-song-img"><div class="saved-song-img"><img src="image/fm.jpeg"></div></div>' +
                '<div class="playlist-song-title"><h1 class="saved-music-title">' + (song.title || 'Unknown') + '</h1>' +
                '<h4 class="saved-sub-artist">' + (song.artist || '') + '</h4></div>' +
                '<div class="playlist-song-btns"><i class="fa-solid fa-play saved-icon-play" data-url="' + (song.url || '') + '" data-like="' + (song.like || false) + '"></i>' +
                '<i class="fa-solid fa-trash-can saved-icon-delete" data-url="' + (song.url || '') + '" data-like="' + (song.like || false) + '" data-id="' + (song.id || '') + '"></i></div>';
            container.appendChild(div);
        });
        container.querySelectorAll('.saved-icon-play').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var url = this.getAttribute('data-url');
                var liked = this.getAttribute('data-like') === 'true';
                if (url) {
                    nuiCallback('playMusic', { url: url, liked: liked }).then(function(vol) {
                        if (vol !== null) curVolume = vol;
                    });
                    curMusicURL = url;
                    isMusicPlaying = true;
                    setPlayIcons(true);
                    setMusicSongInfo(url);
                }
            });
        });
        container.querySelectorAll('.saved-icon-delete').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var url = this.getAttribute('data-url');
                var songId = this.getAttribute('data-id');
                nuiCallback('saveMusic', {
                    login: loginDataState ? loginDataState.login : '',
                    data: url,
                    like: false,
                    vehID: curVehID,
                    musicID: songId
                });
                var songEl = this.closest('.playlist-song');
                if (songEl) songEl.remove();
            });
        });
    });
});

document.querySelector('.home-timer-app').addEventListener('click', function() {
    showAppPanel('stop-watch-app');
});

document.querySelector('.home-settings-app').addEventListener('click', function() {
    showAppPanel('settings-app');
});

document.querySelector('.home-carinfo-app').addEventListener('click', function() {
    showAppPanel('car-details-app');
    nuiCallback('carInfo').then(function(info) {
        if (!info) return;
        document.querySelector('.car-name-cont').textContent = info.vName || '';
        document.querySelector('.body_health').textContent = info.vBody || '100%';
        document.querySelector('.engine_health').textContent = info.vEngine || '100%';
        document.querySelector('.fuel_health').textContent = info.vFuel || '100%';
        document.querySelector('.temp_health').textContent = info.vTemp || '100%';
    });
});

document.querySelector('.home-video-app').addEventListener('click', function() {
    showAppPanel('video-app');
});

document.querySelector('.home-carcontrol-app').addEventListener('click', function() {
    showAppPanel('car-details-app');
    nuiCallback('carInfo').then(function(info) {
        if (!info) return;
        document.querySelector('.car-name-cont').textContent = info.vName || '';
        document.querySelector('.body_health').textContent = info.vBody || '100%';
        document.querySelector('.engine_health').textContent = info.vEngine || '100%';
        document.querySelector('.fuel_health').textContent = info.vFuel || '100%';
        document.querySelector('.temp_health').textContent = info.vTemp || '100%';
    });
});

document.querySelector('.home-dashboard-app').addEventListener('click', function() {
    showAppPanel('dashboard-app');
    nuiCallback('carDashboard', true);
    if (dashboardTimerInterval) clearInterval(dashboardTimerInterval);
    dashboardTimerInterval = setInterval(function() {
        var now = new Date();
        var h = now.getHours();
        var m = now.getMinutes();
        document.querySelector('.dashboard-time').textContent = h + ':' + (m < 10 ? '0' : '') + m;
    }, 1000);
});

document.querySelector('.home-snake-game').addEventListener('click', function() {
    showAppPanel('snake-game-app');
    var container = document.querySelector('.snake-game-app');
    var backBtn = document.createElement('div');
    backBtn.style.cssText = 'position:absolute;top:10px;left:10px;z-index:10;cursor:pointer;padding:6px 14px;border-radius:8px;background:rgba(255,255,255,0.15);color:#fff;font-size:14px;';
    backBtn.innerHTML = '<i class="fa-solid fa-circle-arrow-left"></i> Back';
    backBtn.addEventListener('click', function() { goHome(); });
    container.appendChild(backBtn);
    initSnakeGame();
});

document.querySelectorAll('.playlist-back-arrow').forEach(function(arrow) {
    arrow.addEventListener('click', function() {
        if (arrow.classList.contains('settings-back-btn')) {
            goHome();
        } else if (arrow.classList.contains('appearance-exit')) {
            document.querySelector('.appearance-setting').style.display = 'none';
            document.querySelector('.settings-app').style.display = 'flex';
        } else if (arrow.classList.contains('wallpaper-exit')) {
            document.querySelector('.wallpaper-settings').style.display = 'none';
            document.querySelector('.settings-app').style.display = 'flex';
        } else if (arrow.classList.contains('reset-exit')) {
            document.querySelector('.factory-settings').style.display = 'none';
            document.querySelector('.settings-app').style.display = 'flex';
        } else if (arrow.classList.contains('timer-back-btn')) {
            goHome();
        } else if (arrow.classList.contains('dashboard-back-btn')) {
            nuiCallback('carDashboard', false);
            if (dashboardTimerInterval) { clearInterval(dashboardTimerInterval); dashboardTimerInterval = null; }
            goHome();
        } else {
            goHome();
        }
    });
});

document.querySelector('.car-details-exit').addEventListener('click', function() {
    document.querySelector('.car-details-app').style.display = 'none';
    document.querySelector('.main-slider-home').style.display = 'flex';
});

document.querySelector('.car-control-exit').addEventListener('click', function() {
    document.querySelector('.vehicle-control-app').style.display = 'none';
    document.querySelector('.car-details-app').style.display = 'flex';
});

document.querySelector('.car-control-button').addEventListener('click', function() {
    document.querySelector('.car-details-app').style.display = 'none';
    document.querySelector('.vehicle-control-app').style.display = 'flex';
    nuiCallback('carControl').then(function(info) {
        if (!info) return;
        var engineBtn = document.querySelector('.engine_btn');
        var alldoorBtn = document.querySelector('.alldoor_btn');
        var headlightBtn = document.querySelector('.headlight_btn');
        var hazardBtn = document.querySelector('.hazard_btn');
        var rgbBtn = document.querySelector('.musicrgb_btn');
        if (engineBtn) engineBtn.querySelector('.icon-active-bar').style.background = info.vEngine ? '#4cd137' : '';
        if (headlightBtn) headlightBtn.querySelector('.icon-active-bar').style.background = info.vLight ? '#4cd137' : '';
        if (hazardBtn) hazardBtn.querySelector('.icon-active-bar').style.background = info.vHazard ? '#f39c12' : '';
        if (rgbBtn) rgbBtn.querySelector('.icon-active-bar').style.background = info.vMusicRGB ? '#9b59b6' : '';
    });
});

document.querySelector('.music-playlist-btn').addEventListener('click', function() {
    document.querySelector('.music-app').style.display = 'none';
    document.querySelector('.playlist-app').style.display = 'flex';
    nuiCallback('fetchPlaylist', { login: loginDataState ? loginDataState.login : '' }).then(function(result) {
        if (!result) return;
        var container = document.querySelector('.playlist-middle');
        container.innerHTML = '';
        result.forEach(function(song) {
            var div = document.createElement('div');
            div.className = 'playlist-song';
            div.innerHTML =
                '<div class="playlist-song-img"><div class="saved-song-img"><img src="image/fm.jpeg"></div></div>' +
                '<div class="playlist-song-title"><h1 class="saved-music-title">' + (song.title || 'Unknown') + '</h1>' +
                '<h4 class="saved-sub-artist">' + (song.artist || '') + '</h4></div>' +
                '<div class="playlist-song-btns"><i class="fa-solid fa-play saved-icon-play" data-url="' + (song.url || '') + '" data-like="' + (song.like || false) + '"></i>' +
                '<i class="fa-solid fa-trash-can saved-icon-delete" data-url="' + (song.url || '') + '" data-like="' + (song.like || false) + '" data-id="' + (song.id || '') + '"></i></div>';
            container.appendChild(div);
        });
        container.querySelectorAll('.saved-icon-play').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var url = this.getAttribute('data-url');
                var liked = this.getAttribute('data-like') === 'true';
                if (url) {
                    nuiCallback('playMusic', { url: url, liked: liked }).then(function(vol) {
                        if (vol !== null) curVolume = vol;
                    });
                    curMusicURL = url;
                    isMusicPlaying = true;
                    setPlayIcons(true);
                    setMusicSongInfo(url);
                }
            });
        });
        container.querySelectorAll('.saved-icon-delete').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var url = this.getAttribute('data-url');
                var songId = this.getAttribute('data-id');
                nuiCallback('saveMusic', {
                    login: loginDataState ? loginDataState.login : '',
                    data: url,
                    like: false,
                    vehID: curVehID,
                    musicID: songId
                });
                var songEl = this.closest('.playlist-song');
                if (songEl) songEl.remove();
            });
        });
    });
});

document.querySelector('.playlist-back-music').addEventListener('click', function() {
    document.querySelector('.playlist-app').style.display = 'none';
    document.querySelector('.music-app').style.display = 'flex';
});

document.querySelector('.music-search-play-btn').addEventListener('click', function() {
    var input = document.querySelector('.music-search-field .input');
    var url = input.value.trim();
    if (url) {
        nuiCallback('playMusic', { url: url, liked: false }).then(function(vol) {
            if (vol !== null) curVolume = vol;
        });
        curMusicURL = url;
        isMusicPlaying = true;
        setPlayIcons(true);
        setMusicSongInfo(url);
        var slider = document.getElementById('slider');
        if (slider) slider.disabled = false;
    }
});

document.querySelector('.music-stop').addEventListener('click', function() {
    nuiCallback('stopMusic', { vehID: curVehID });
    isMusicPlaying = !isMusicPlaying;
    setPlayIcons(isMusicPlaying);
});

document.querySelector('.menu-music-stop').addEventListener('click', function() {
    nuiCallback('stopMusic', { vehID: curVehID });
    isMusicPlaying = !isMusicPlaying;
    setPlayIcons(isMusicPlaying);
});

document.querySelector('.music-back').addEventListener('click', function() {});

document.querySelector('.music-skip').addEventListener('click', function() {});

document.querySelector('.menu-music-back').addEventListener('click', function() {});

document.querySelector('.menu-music-skip').addEventListener('click', function() {});

document.querySelector('.music-loop').addEventListener('click', function() {
    var loopState = this.style.color === 'rgb(29, 185, 84)';
    var newLoop = !loopState;
    nuiCallback('loopMusic', { vehID: curVehID, loop: newLoop });
    updateLoopIcon(newLoop);
});

document.querySelector('.like-music').addEventListener('click', function() {
    if (!loginDataState) return;
    var newLiked = !isLiked;
    isLiked = newLiked;
    updateLikeIcon(newLiked);
    nuiCallback('saveMusic', {
        login: loginDataState.login,
        data: curMusicURL,
        like: newLiked,
        vehID: curVehID,
        musicID: ''
    });
    nuiCallback('likeData', { vehID: curVehID, liked: newLiked });
});

document.querySelector('.volume-btn').addEventListener('click', function() {
    var bar = document.querySelector('.volume-bar-cont');
    bar.style.display = bar.style.display === 'flex' ? 'none' : 'flex';
});

document.querySelector('.volume-slider').addEventListener('input', function() {
    curVolume = parseInt(this.value);
    nuiCallback('adjustVolume', { vehID: curVehID, vol: curVolume });
});

document.getElementById('slider').addEventListener('input', function() {
    nuiCallback('musicTimeStamp', { vehID: curVehID, time: parseInt(this.value) });
});

document.querySelector('.video-play-btn').addEventListener('click', function() {
    var input = document.querySelector('.video-player-input-box .input');
    var url = input.value.trim();
    if (!url) return;
    var videoId = '';
    var match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&\s?]+)/);
    if (match) {
        videoId = match[1];
    } else {
        videoId = url;
    }
    var frame = document.getElementById('frame');
    frame.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1';
    document.querySelector('.no-media-text').style.display = 'none';
    document.querySelector('.video-player').style.display = 'flex';
});

document.querySelector('.video-stop-btn').addEventListener('click', function() {
    var frame = document.getElementById('frame');
    frame.src = '';
    document.querySelector('.no-media-text').style.display = 'flex';
    document.querySelector('.video-player').style.display = 'none';
});

document.querySelector('.video-back-btn').addEventListener('click', function() {
    var frame = document.getElementById('frame');
    frame.src = '';
    document.querySelector('.no-media-text').style.display = 'flex';
    document.querySelector('.video-player').style.display = 'none';
    goHome();
});

document.querySelector('.settings-app .login-box').addEventListener('click', function() {
    if (loginDataState) return;
    document.querySelector('.sign-in-confirmation-box').style.display = 'flex';
});

document.querySelector('.sign-in-close').addEventListener('click', function() {
    document.querySelector('.sign-in-confirmation-box').style.display = 'none';
});

document.querySelector('.sign-in-button').addEventListener('click', function() {
    nuiCallback('loginAccount', { curVehID: curVehID }).then(function(result) {
        if (result && result.login) {
            loginDataState = result;
            document.querySelector('.login-user-title').textContent = 'Welcome, ' + (result.username || 'User') + '!';
            document.querySelector('.sign-text').textContent = result.username || 'Sign in to your Car Play';
            document.querySelector('.login-box').setAttribute('login', 'true');
        }
    });
    document.querySelector('.sign-in-confirmation-box').style.display = 'none';
});

document.querySelector('.sign-text').addEventListener('click', function() {
    if (!loginDataState) return;
    nuiCallback('logoutAccount', { curVehID: curVehID });
    loginDataState = null;
    document.querySelector('.login-user-title').textContent = 'Welcome, User!';
    document.querySelector('.sign-text').textContent = 'Sign in to your Car Play';
    document.querySelector('.login-box').setAttribute('login', 'false');
});

document.querySelector('.apperance-box').addEventListener('click', function() {
    document.querySelector('.settings-app').style.display = 'none';
    document.querySelector('.appearance-setting').style.display = 'flex';
});

document.querySelector('.wallpaper-set-box').addEventListener('click', function() {
    document.querySelector('.settings-app').style.display = 'none';
    document.querySelector('.wallpaper-settings').style.display = 'flex';
});

document.querySelector('.factory-reset').addEventListener('click', function() {
    document.querySelector('.settings-app').style.display = 'none';
    document.querySelector('.factory-settings').style.display = 'flex';
});

document.querySelector('.settings-back-btn').addEventListener('click', function() {
    goHome();
});

document.querySelector('.dark-mode-btn').addEventListener('click', function() {
    var wrapper = document.querySelector('.wrapper');
    var miniUI = document.querySelector('.mini-ui-draggable');
    wrapper.classList.add('dark-mode');
    wrapper.classList.remove('light-mode');
    if (miniUI) { miniUI.classList.add('dark-mode'); miniUI.classList.remove('light-mode'); }
    localStorage.setItem('darkMode', 'true');
});

document.querySelector('.light-mode-btn').addEventListener('click', function() {
    var wrapper = document.querySelector('.wrapper');
    var miniUI = document.querySelector('.mini-ui-draggable');
    wrapper.classList.add('light-mode');
    wrapper.classList.remove('dark-mode');
    if (miniUI) { miniUI.classList.add('light-mode'); miniUI.classList.remove('dark-mode'); }
    localStorage.setItem('darkMode', 'false');
});

document.getElementById('brightslider').addEventListener('input', function() {
    var val = this.value;
    document.querySelector('.wrapper').style.filter = 'brightness(' + (val / 100) + ')';
    localStorage.setItem('brightness', val);
});

document.getElementById('checkbox-siri').addEventListener('change', function() {
    localStorage.setItem('siri', this.checked);
});

document.getElementById('checkbox-sound').addEventListener('change', function() {
    localStorage.setItem('sound', this.checked);
});

document.getElementById('checkbox-rgb').addEventListener('change', function() {
    localStorage.setItem('rgb', this.checked);
});

document.getElementById('checkbox-minimized').addEventListener('change', function() {
    isMusicOverlay = this.checked;
    localStorage.setItem('minimized', this.checked);
});

document.getElementById('checkbox-position').addEventListener('change', function() {
    if (!this.checked) {
        document.querySelector('.drag-message').style.display = 'none';
    }
});

document.querySelector('.reset-ui-position-btn').addEventListener('click', function() {
    var el = document.querySelector('.draggable');
    el.style.left = '0px';
    el.style.top = '0px';
    localStorage.removeItem('position');
});

document.querySelectorAll('.wallpaper-box').forEach(function(box) {
    box.addEventListener('click', function() {
        var img = this.querySelector('.wallpaper-image');
        if (img) {
            document.querySelector('.home-background').src = img.src;
            localStorage.setItem('wallpaper', img.src);
        }
    });
});

document.querySelector('.wallpaper-upload-btn').addEventListener('click', function() {
    var urlBox = document.querySelector('.wallpaper-insert-url');
    urlBox.style.display = urlBox.style.display === 'flex' ? 'none' : 'flex';
});

document.querySelector('.save-url-btn').addEventListener('click', function() {
    var url = document.querySelector('.insert-url-wallpaper').value.trim();
    if (url) {
        document.querySelector('.home-background').src = url;
        localStorage.setItem('wallpaper', url);
    }
    document.querySelector('.wallpaper-insert-url').style.display = 'none';
});

document.querySelector('.close-url-btn').addEventListener('click', function() {
    document.querySelector('.wallpaper-insert-url').style.display = 'none';
});

document.querySelector('.reset-playlist').addEventListener('click', function() {
    factoryResetTarget = 'playlist';
    document.querySelector('.factory-confirmation-box').style.display = 'flex';
});

document.querySelector('.reset-settings').addEventListener('click', function() {
    factoryResetTarget = 'settings';
    document.querySelector('.factory-confirmation-box').style.display = 'flex';
});

document.querySelector('.reset-all').addEventListener('click', function() {
    factoryResetTarget = 'all';
    document.querySelector('.factory-confirmation-box').style.display = 'flex';
});

document.querySelector('.yes-button').addEventListener('click', function() {
    document.querySelector('.factory-confirmation-box').style.display = 'none';
    if (factoryResetTarget === 'playlist' || factoryResetTarget === 'all') {
        nuiCallback('clearPlaylist', {
            login: loginDataState ? loginDataState.login : '',
            vehID: curVehID
        });
    }
    if (factoryResetTarget === 'settings' || factoryResetTarget === 'all') {
        localStorage.clear();
        location.reload();
    }
    factoryResetTarget = '';
});

document.querySelector('.no-button').addEventListener('click', function() {
    document.querySelector('.factory-confirmation-box').style.display = 'none';
    factoryResetTarget = '';
});

document.querySelector('.engine_btn').addEventListener('click', function() {
    var self = this;
    nuiCallback('carAction', { type: 'engine' }).then(function(result) {
        if (result) self.querySelector('.icon-active-bar').style.background = result === 'ON' ? '#4cd137' : '';
    });
});

document.querySelector('.alldoor_btn').addEventListener('click', function() {
    var self = this;
    nuiCallback('carAction', { type: 'allDoor' }).then(function(result) {
        if (result) self.querySelector('.icon-active-bar').style.background = result === 'OPEN' ? '#4cd137' : '';
    });
});

document.querySelector('.headlight_btn').addEventListener('click', function() {
    var self = this;
    nuiCallback('carAction', { type: 'headlight' }).then(function(result) {
        if (result) self.querySelector('.icon-active-bar').style.background = result === 'ON' ? '#4cd137' : '';
    });
});

document.querySelector('.hazard_btn').addEventListener('click', function() {
    var self = this;
    nuiCallback('carAction', { type: 'hazard' }).then(function(result) {
        if (result) self.querySelector('.icon-active-bar').style.background = result === 'ON' ? '#f39c12' : '';
    });
});

document.querySelector('.musicrgb_btn').addEventListener('click', function() {
    var self = this;
    nuiCallback('carAction', { type: 'rgb' }).then(function(result) {
        if (result) self.querySelector('.icon-active-bar').style.background = result === 'ON' ? '#9b59b6' : '';
    });
});

for (var w = 0; w <= 3; w++) {
    (function(windowIndex) {
        var btn = document.querySelector('.window' + windowIndex + '_btn');
        if (btn) {
            btn.addEventListener('click', function() {
                nuiCallback('carAction', { type: 'window', window: windowIndex });
            });
        }
    })(w);
}

for (var d = 0; d <= 5; d++) {
    (function(doorIndex) {
        var btn = document.querySelector('.door' + doorIndex + '_btn');
        if (btn) {
            btn.addEventListener('click', function() {
                nuiCallback('carAction', { type: 'door', door: doorIndex });
            });
        }
    })(d);
}

document.querySelectorAll('[data-seat]').forEach(function(el) {
    el.addEventListener('click', function() {
        nuiCallback('carAction', { type: 'seat', seat: this.dataset.seat });
    });
});

document.querySelector('.dashboard-start-container').addEventListener('click', function() {
    nuiCallback('autoPilot', true).then(function(result) {
        if (result && Array.isArray(result)) {
            document.querySelector('.dashboard-start-container h5').textContent = 'Driving to ' + (result[1] || '');
            document.querySelector('.dashboard-distance-title').textContent = result[2] || '';
            document.querySelector('.dashboard-location-title').textContent = result[1] || '';
        } else if (result === 'no_marker') {
            document.querySelector('.dashboard-start-container h5').textContent = 'No Waypoint Set';
            setTimeout(function() {
                document.querySelector('.dashboard-start-container h5').textContent = 'Start Auto Pilot';
            }, 2000);
        } else if (result === 'no_driver') {
            document.querySelector('.dashboard-start-container h5').textContent = 'Must be Driver';
            setTimeout(function() {
                document.querySelector('.dashboard-start-container h5').textContent = 'Start Auto Pilot';
            }, 2000);
        }
    });
});

document.querySelector('.dashboard-stop-btn').addEventListener('click', function() {
    nuiCallback('autoPilot', false);
    document.querySelector('.dashboard-start-container h5').textContent = 'Start Auto Pilot';
});

document.querySelector('.front-cam').addEventListener('click', function() {
    nuiCallback('carCamera', 'front');
});

document.querySelector('.back-cam').addEventListener('click', function() {
    nuiCallback('carCamera', 'back');
});

document.querySelector('.exit-cam').addEventListener('click', function() {
    nuiCallback('carCamera', 'exit');
    document.querySelector('.camera-container').style.display = 'none';
});

document.querySelector('.siri-search-icon').addEventListener('click', function() {
    var input = document.querySelector('.siri-input');
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    var qaBox = document.querySelector('.siri-qa-box');
    var qDiv = document.createElement('div');
    qDiv.className = 'siri-question';
    qDiv.style.cssText = 'text-align:right;padding:8px 12px;margin:5px 0;background:rgba(99,198,246,0.2);border-radius:12px;max-width:80%;margin-left:auto;word-wrap:break-word;';
    qDiv.innerHTML = '<p style="margin:0;color:#fff;font-size:14px;">' + text + '</p>';
    qaBox.appendChild(qDiv);
    qaBox.scrollTop = qaBox.scrollHeight;

    var loadingDiv = document.createElement('div');
    loadingDiv.className = 'siri-loading';
    loadingDiv.style.cssText = 'text-align:left;padding:8px 12px;margin:5px 0;background:rgba(255,255,255,0.1);border-radius:12px;max-width:80%;';
    loadingDiv.innerHTML = '<p style="margin:0;color:#aaa;font-size:14px;">Thinking...</p>';
    qaBox.appendChild(loadingDiv);
    qaBox.scrollTop = qaBox.scrollHeight;

    nuiCallback('chatGPT', text).then(function(response) {
        if (loadingDiv.parentNode) loadingDiv.remove();
        if (!response) {
            var errDiv = document.createElement('div');
            errDiv.style.cssText = 'text-align:left;padding:8px 12px;margin:5px 0;background:rgba(255,255,255,0.1);border-radius:12px;max-width:80%;word-wrap:break-word;';
            errDiv.innerHTML = '<p style="margin:0;color:#e74c3c;font-size:14px;">No response received.</p>';
            qaBox.appendChild(errDiv);
            qaBox.scrollTop = qaBox.scrollHeight;
            return;
        }
        var aDiv = document.createElement('div');
        aDiv.className = 'siri-answer';
        aDiv.style.cssText = 'text-align:left;padding:8px 12px;margin:5px 0;background:rgba(255,255,255,0.1);border-radius:12px;max-width:80%;word-wrap:break-word;';
        aDiv.innerHTML = '<p style="margin:0;color:#fff;font-size:14px;">' + (response.response || 'No response') + '</p>';
        qaBox.appendChild(aDiv);
        qaBox.scrollTop = qaBox.scrollHeight;

        if (response.data !== undefined && response.data !== null) {
            nuiCallback('chatGPTAction', response.data).then(function(isMusic) {
                if (isMusic) {
                    isMusicPlaying = true;
                    setPlayIcons(true);
                }
            });
        }
    });
});

document.querySelector('.siri-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        document.querySelector('.siri-search-icon').click();
    }
});

document.querySelector('.siri-icon').addEventListener('click', function() {
    showAppPanel('siri-app');
});

document.querySelector('.start-btn').addEventListener('click', function() {
    if (!stopwatchRunning) {
        stopwatchRunning = true;
        var startTime = Date.now() - stopwatchTime;
        stopwatchInterval = setInterval(function() {
            stopwatchTime = Date.now() - startTime;
            var mins = Math.floor(stopwatchTime / 60000);
            var secs = Math.floor((stopwatchTime % 60000) / 1000);
            var ms = Math.floor((stopwatchTime % 1000) / 10);
            document.querySelector('.timer-stopwatch').textContent =
                (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs + '.' + (ms < 10 ? '0' : '') + ms;
        }, 10);
    }
});

document.querySelector('.pause-btn').addEventListener('click', function() {
    if (stopwatchRunning) {
        stopwatchRunning = false;
        clearInterval(stopwatchInterval);
    }
});

document.querySelector('.reset-btn').addEventListener('click', function() {
    stopwatchRunning = false;
    clearInterval(stopwatchInterval);
    stopwatchTime = 0;
    document.querySelector('.timer-stopwatch').textContent = '00:00.00';
    document.querySelector('.tracker').innerHTML = '';
    laps = [];
});

document.querySelector('.lap-btn').addEventListener('click', function() {
    if (!stopwatchRunning) return;
    laps.push(stopwatchTime);
    var mins = Math.floor(stopwatchTime / 60000);
    var secs = Math.floor((stopwatchTime % 60000) / 1000);
    var ms = Math.floor((stopwatchTime % 1000) / 10);
    var lapText = 'Lap ' + laps.length + ': ' + (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs + '.' + (ms < 10 ? '0' : '') + ms;
    var lapDiv = document.createElement('div');
    lapDiv.className = 'lap-entry';
    lapDiv.innerHTML = '<p>' + lapText + '</p>';
    var tracker = document.querySelector('.tracker');
    tracker.insertBefore(lapDiv, tracker.firstChild);
});

document.querySelector('.install-radio-button').addEventListener('click', function() {
    var card = document.querySelector('.assemble-card');
    nuiCallback('installRadio', {
        plate: card.getAttribute('data-plate') || '',
        install: card.getAttribute('data-install') === 'true'
    });
    card.style.display = 'none';
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        nuiCallback('closeUI');
        document.querySelector('.drag-container').style.display = 'none';
        document.querySelector('.camera-container').style.display = 'none';
        isUIOpen = false;
        if (dashboardTimerInterval) { clearInterval(dashboardTimerInterval); dashboardTimerInterval = null; }
    }
});

document.querySelector('.left-map-icon').addEventListener('click', function() {
    nuiCallback('openMap');
});

document.querySelector('.left-camera-icon').addEventListener('click', function() {
    document.querySelector('.camera-container').style.display = 'flex';
});

document.querySelectorAll('.mini-ui-draggable .menu-music-stop').forEach(function(el) {
    el.addEventListener('click', function() {
        nuiCallback('stopMusic', { vehID: curVehID });
        isMusicPlaying = !isMusicPlaying;
        setPlayIcons(isMusicPlaying);
    });
});

document.querySelectorAll('.mini-ui-draggable .menu-music-back').forEach(function(el) {
    el.addEventListener('click', function() {});
});

document.querySelectorAll('.mini-ui-draggable .menu-music-skip').forEach(function(el) {
    el.addEventListener('click', function() {});
});

window.addEventListener('message', function(event) {
    var msg = event.data;
    var action = msg.action;

    if (action === 'openUI') {
        var d = msg.data;
        document.querySelector('.drag-container').style.display = 'flex';
        curVehID = d.curVeh;
        isUIOpen = true;
        curUnit = d.unit || 'Km';

        if (d.loginData && d.loginData !== false) {
            loginDataState = d.loginData;
            document.querySelector('.login-user-title').textContent = 'Welcome, ' + (d.loginData.username || 'User') + '!';
            document.querySelector('.sign-text').textContent = d.loginData.username || 'Sign in to your Car Play';
            document.querySelector('.login-box').setAttribute('login', 'true');
        } else {
            loginDataState = null;
            document.querySelector('.login-user-title').textContent = 'Welcome, User!';
            document.querySelector('.sign-text').textContent = 'Sign in to your Car Play';
            document.querySelector('.login-box').setAttribute('login', 'false');
        }

        if (d.vData) {
            document.querySelector('.location-title-text').textContent = d.vData.curLoc || 'Unknown';
            document.querySelector('.weather-box p').textContent = d.vData.weatherType || 'Clear';
            document.querySelector('.time-cont-title').textContent = d.vData.curTime || '00:00';
            document.querySelector('.left-time-text').textContent = d.vData.curTime || '00:00';
            document.querySelector('.maps-distance span').textContent = d.vData.locDist || '0 Km';
            document.querySelector('.dashboard-location-title').textContent = d.vData.curLoc || 'Unknown';
            document.querySelector('.dashboard-distance-title').textContent = d.vData.locDist || '0 Km';
        }

        if (d.songData && d.songData.MusicOn) {
            isMusicPlaying = d.songData.musicPlaying;
            curMusicURL = d.songData.musicURL || '';
            curVolume = d.songData.volume || 100;
            isLiked = d.songData.like || false;
            setPlayIcons(isMusicPlaying);
            setMusicSongInfo(curMusicURL);
            document.querySelector('.volume-slider').value = curVolume;
            updateLoopIcon(d.songData.loop);
            updateLikeIcon(isLiked);
            var slider = document.getElementById('slider');
            if (slider && d.songData.musicDuration) {
                slider.max = d.songData.musicDuration;
                slider.disabled = false;
            }
            var miniSlider = document.querySelector('.mini-ui-length');
            if (miniSlider && d.songData.musicDuration) {
                miniSlider.max = d.songData.musicDuration;
            }
        } else {
            isMusicPlaying = false;
            setPlayIcons(false);
            setMusicSongInfo('');
        }

        if (isMusicOverlay) {
            document.querySelector('.mini-ui-draggable').style.display = 'flex';
        } else {
            document.querySelector('.mini-ui-draggable').style.display = 'none';
        }
    }

    if (action === 'closeUI') {
        document.querySelector('.drag-container').style.display = 'none';
        document.querySelector('.camera-container').style.display = 'none';
        document.querySelector('.mini-ui-draggable').style.display = 'none';
        isUIOpen = false;
        if (dashboardTimerInterval) { clearInterval(dashboardTimerInterval); dashboardTimerInterval = null; }
    }

    if (action === 'syncUI') {
        if (!msg.data) return;
        var syncType = msg.data.action;
        var syncData = msg.data.data;

        if (syncType === 'resume') {
            isMusicPlaying = true;
            setPlayIcons(true);
        }

        if (syncType === 'pause') {
            isMusicPlaying = false;
            setPlayIcons(false);
        }

        if (syncType === 'end') {
            isMusicPlaying = false;
            setPlayIcons(false);
            setMusicSongInfo('No Music Playing');
            var sl = document.getElementById('slider');
            if (sl) sl.value = 0;
            var msl = document.querySelector('.mini-ui-length');
            if (msl) msl.value = 0;
            document.getElementById('start-time').textContent = '0:00';
            document.getElementById('end-time').textContent = '0:00';
        }

        if (syncType === 'musicEntry' && syncData) {
            curMusicURL = syncData.musicURL || '';
            curVolume = syncData.volume || 100;
            isMusicPlaying = syncData.musicPlaying;
            setPlayIcons(isMusicPlaying);
            setMusicSongInfo(curMusicURL);
            updateLoopIcon(syncData.loop);
            document.querySelector('.volume-slider').value = curVolume;
            var s2 = document.getElementById('slider');
            if (s2 && syncData.musicDuration) {
                s2.max = syncData.musicDuration;
                s2.disabled = false;
            }
            var msl2 = document.querySelector('.mini-ui-length');
            if (msl2 && syncData.musicDuration) {
                msl2.max = syncData.musicDuration;
            }
        }

        if (syncType === 'volume' && syncData !== undefined) {
            curVolume = syncData;
            document.querySelector('.volume-slider').value = curVolume;
        }

        if (syncType === 'skip' && syncData) {
            setMusicSongInfo(syncData.musicURL || syncData);
        }

        if (syncType === 'loop') {
            updateLoopIcon(syncData);
        }

        if (syncType === 'likeData') {
            isLiked = syncData;
            updateLikeIcon(isLiked);
        }

        if (syncType === 'clearPlaylist') {
            document.querySelector('.playlist-middle').innerHTML = '';
        }

        if (syncType === 'login' && syncData) {
            loginDataState = syncData;
            document.querySelector('.login-user-title').textContent = 'Welcome, ' + (syncData.username || 'User') + '!';
            document.querySelector('.sign-text').textContent = syncData.username || 'Sign in to your Car Play';
            document.querySelector('.login-box').setAttribute('login', 'true');
        }

        if (syncType === 'logout') {
            loginDataState = null;
            document.querySelector('.login-user-title').textContent = 'Welcome, User!';
            document.querySelector('.sign-text').textContent = 'Sign in to your Car Play';
            document.querySelector('.login-box').setAttribute('login', 'false');
        }
    }

    if (action === 'updateMusicTime') {
        var timer = msg.timer;
        if (timer === undefined || timer === null) return;
        var slider = document.getElementById('slider');
        var miniSlider = document.querySelector('.mini-ui-length');
        var endTime = document.getElementById('end-time');
        var maxVal = endTime ? parseInt(endTime.getAttribute('data-duration')) || 300 : 300;
        if (slider) {
            slider.max = maxVal;
            slider.value = timer;
        }
        if (miniSlider) {
            miniSlider.max = maxVal;
            miniSlider.value = timer;
        }
        document.getElementById('start-time').textContent = formatTime(timer);
        document.getElementById('end-time').textContent = formatTime(maxVal);
    }

    if (action === 'updateSpeed' && msg.data) {
        if (msg.data.speed !== undefined) {
            document.querySelector('.dashboard-speed-box h2').textContent = msg.data.speed;
        }
        if (msg.data.rpm !== undefined) {
            document.querySelector('.dashboard-rpm-box h2').textContent = msg.data.rpm;
        }
    }

    if (action === 'installRadio' && msg.data) {
        var card = document.querySelector('.assemble-card');
        card.style.display = 'flex';
        card.setAttribute('data-plate', msg.data.plate || '');
        card.setAttribute('data-install', msg.data.install ? 'true' : 'false');
        document.querySelector('.install-radio-button').textContent = msg.data.text || 'Install Radio';
    }

    if (action === 'parkAlarm') {
        try {
            var audio = new Audio('sound/beep.mp3');
            audio.volume = 0.5;
            audio.play().catch(function() {});
        } catch (e) {}
    }

    if (action === 'stopAutoDrive') {
        document.querySelector('.dashboard-start-container h5').textContent = 'Start Auto Pilot';
    }

    if (action === 'copyClipboard' && msg.data) {
        navigator.clipboard.writeText(msg.data).catch(function() {});
    }

    if (action === 'resetUI') {
        localStorage.clear();
        location.reload();
    }
});
