const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: 50,
    y: 300,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0,
};

function drawPlayer() {
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawGround() {
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 350, canvas.width, 50);
}

function update() {
    player.x += player.dx;

    // 壁の衝突判定
    if (player.x < 0) {
        player.x = 0;
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    clear();
    drawGround();
    drawPlayer();
    update();

    requestAnimationFrame(gameLoop);
}

// キー入力の処理
function keyDown(e) {
    if (e.key === 'ArrowRight') {
        player.dx = player.speed;
    } else if (e.key === 'ArrowLeft') {
        player.dx = -player.speed;
    }
}

function keyUp(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        player.dx = 0;
    }
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

gameLoop();
