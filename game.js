import { enemies, spawnEnemy, drawEnemies, updateEnemies } from './enemy.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let spawnInterval = 1000; // 敵を生成する間隔（ミリ秒）
let lastSpawnTime = 0; // ここで変数を定義

const mapWidth = 2000; // マップの幅を設定

// Canvasのサイズをウィンドウのサイズに合わせる
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = {
    x: 50,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0,
    dy: 0,
    gravity: 1,
    jumpPower: -15,
    onGround: true,
};

let camera = {
    x: 0,
    y: 0,
};

// update 関数内での右側の制限
camera.x = Math.min(camera.x, mapWidth - canvas.width); // 右側の制限


// 地面の位置
const groundHeight = 50;

const backgroundImage = new Image();
backgroundImage.src = './images/background.avif'; // 画像のパスを指定
let backgroundWidth, backgroundHeight;

function drawBackground() {
    const canvasAspectRatio = canvas.width / canvas.height;
    const imageAspectRatio = backgroundImage.width / backgroundImage.height;

    let drawWidth, drawHeight;

    if (canvasAspectRatio > imageAspectRatio) {
        // キャンバスが画像よりも横に長い場合
        drawWidth = canvas.width;
        drawHeight = drawWidth / imageAspectRatio;
    } else {
        // キャンバスが画像よりも縦に長い場合
        drawHeight = canvas.height;
        drawWidth = drawHeight * imageAspectRatio;
    }

    const x = (canvas.width - drawWidth) / 2; // 水平中央に配置
    const y = (canvas.height - drawHeight) / 2; // 垂直中央に配置

    ctx.drawImage(backgroundImage, x - camera.x, y, drawWidth, drawHeight);
}


function drawPlayer() {
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x - camera.x, player.y, player.width, player.height);
}

function drawGround() {
    ctx.fillStyle = 'green';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
}

function update() {
    player.x += player.dx;
    player.y += player.dy;

    // 重力を適用
    if (!player.onGround) {
        player.dy += player.gravity;
    }

    // 地面との衝突判定
    if (player.y + player.height >= canvas.height - groundHeight) {
        player.y = canvas.height - groundHeight - player.height;
        player.dy = 0;
        player.onGround = true;
    } else {
        player.onGround = false;
    }

    // 壁の衝突判定
    if (player.x < 0) {
        player.x = 0;
    }

    // カメラの追従
    const cameraOffset = canvas.width / 4; // カメラがプレイヤーに追従するオフセット

    if (player.x > camera.x + cameraOffset) {
        camera.x = player.x - cameraOffset; // 右にスクロール
    } else if (player.x < camera.x + cameraOffset / 2) {
        camera.x = player.x - cameraOffset / 2; // 左にスクロール
    }

    // カメラの制限を設定（必要に応じて）
    camera.x = Math.max(0, camera.x); // 左側の制限
    camera.x = Math.min(camera.x, /* マップの幅 - canvas.width */); // 右側の制限（マップの幅を設定）
}



function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameLoop(timestamp) {
    clear();
    drawGround();
    drawPlayer();
    drawEnemies(ctx,camera);
    updateEnemies();
    update();

    if (timestamp - lastSpawnTime > spawnInterval) {
        spawnEnemy(canvas.width,canvas.height,groundHeight); // 敵を生成
        lastSpawnTime = timestamp;
    }

    requestAnimationFrame(gameLoop);
}

// キー入力の処理
function keyDown(e) {
    if (e.key === 'ArrowRight') {
        player.dx = player.speed;
    } else if (e.key === 'ArrowLeft') {
        player.dx = -player.speed;
    } else if (e.key === 'ArrowUp' && player.onGround) {
        player.dy = player.jumpPower;
        player.onGround = false;
    }
}

function keyUp(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        player.dx = 0;
    }
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

// ウィンドウサイズ変更時の処理
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// gameLoop();
backgroundImage.onload = () => {
    backgroundWidth = backgroundImage.width;
    backgroundHeight = backgroundImage.height;
    gameLoop(); // 画像が読み込まれたらゲームループを開始
};