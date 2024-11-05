// 敵の配列
let enemies = [];

// 敵のプロパティ
const enemyWidth = 40;
const enemyHeight = 40;
const enemySpeed = 2;

// 敵を生成する関数
function spawnEnemy(canvasWidth, canvasHeight, groundHeight) {
    const enemy = {
        x: canvasWidth,
        y: canvasHeight - groundHeight - enemyHeight, // 地面の上に配置
        width: enemyWidth,
        height: enemyHeight,
        dx: -enemySpeed, // 左に移動
    };
    enemies.push(enemy);
}

// 敵を描画する関数
function drawEnemies(ctx,camera) {
    ctx.fillStyle = 'blue'; // 敵の色
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x - camera.x, enemy.y, enemy.width, enemy.height);
    });
}

// 敵を更新する関数
function updateEnemies() {
    enemies = enemies.filter(enemy => {
        enemy.x += enemy.dx; // 敵を移動させる
        return enemy.x + enemy.width >= 0; // 画面内にいる敵だけ残す
    });
}

export { enemies, spawnEnemy, drawEnemies, updateEnemies };