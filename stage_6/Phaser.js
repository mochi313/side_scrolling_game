class Game extends Phaser.Scene {
    player;
    platforms;
    cursors;
    enemies;
    flare;
    playerPlatformCollider;
    timerText;
    text;
    moveP;

    preload(){
        // 画像の読み込み
        // this.load.image('ground', 'images/test.jpeg');
        this.load.image('back', 'images/bg3.jpg');
        this.load.spritesheet('mans', 'images/カービィず.png',
            { frameWidth: 64, frameHeight: 64 }
        );
        this.load.image("enemy1", "images/enemy64.png")
        this.load.image("enemy2", "images/enemy2.png")
        this.load.image("flame", "images/flame2.png")
        this.load.image("block", "images/block2.png")
        this.load.image("platform", "images/platform.png")
        this.load.image("goal", "images/goal_image2.png")
        this.load.image("lava", "images/lava2.png")
        this.load.image("fb", "images/fireball.png")
    }

    create(){
        this.fb = this.physics.add.group();
        this.f = this.fb.create(400,300,"fb")
        this.tweens.add({
            targets: this.f,
            rotation: -Math.PI * 2,
            duration: 3000,
            repeat: -1
        });

        this.timerStart = this.time.now;  // ゲーム開始時の時間を記録
        this.timerText = this.add.text(10, 10, 'Time: 0', {
            font: '24px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.timerText.setDepth(1)
        this.timerText.setScrollFactor(0)

        this.physics.world.gravity.y = 0;
        const stage = {
            x: 0,
            y: 0,
            width: 800 * 6, //ステージの大きさ
            height: this.scale.height
        }

        // 地形の追加
        const bS = 64 //blockSize
        const floatingBlock = [
            [0,1,2,3,4],
            [0,1,2,3],
            [0,1,2],
            [24],
            [24],
            [24],
            [24],
            [24],
        ]
        const ground = {
            height:4,
            hole:[
                14,15,16,28,29,30,34,35,36
            ]
        }
        this.platforms = this.physics.add.staticGroup();
        this.lavas = this.physics.add.group();

        for(let i = 0; i < Math.floor(stage.width / bS + 1); i ++){
            for(let n = 0; n < ground.height; n ++){
                this.platforms.create(bS * i + (bS/3), stage.height - (bS/2 + bS * (n + 12)), "block")
            }
        }
        for(let i = 0; i < Math.floor(stage.width / bS + 1); i ++){
            if(!ground.hole.includes(i)){
                for(let n = 0; n < ground.height; n ++){
                    this.platforms.create(bS * i + (bS/3), stage.height - (bS/2 + bS * n), "block")
                }
            }else{
                this.lavas.create(bS * i + (bS/3), stage.height - bS/2, "lava")
            }
        }
        for(let i = 0; i < floatingBlock.length; i++){
            for(let n = 0; n < floatingBlock[i].length; n ++){
                this.platforms.create(bS * floatingBlock[i][n] + (bS/3), stage.height - (bS/2 + bS * (i + 4)), "block")
            }
        }
        this.platforms.setTint(0xBEBEBE);

        this.moveP = this.physics.add.group();
        this.p1 = this.moveP.create(bS * 58 + (bS/3), stage.height - (bS/2 + bS * 3), "platform")
        this.p2 = this.moveP.create(bS * 63 + (bS/3), stage.height - (bS/2 + bS * 3), "platform")
        this.up = true;
        this.down = true;
        this.time.addEvent({
            callback: () => {
                this.p1.setVelocityX(0);
                if(this.up){
                    this.p1.setVelocityY(-200)
                    if(this.p1.y <= stage.height - (bS/2 + bS * 9)){
                        this.up = false
                    }
                } else {
                    this.p1.setVelocityY(200)
                    if(this.p1.y >= stage.height - (bS/2 + bS * 1)){
                        this.up = true
                    }
                }
            },
            callbackScope: this, // thisコンテキストを保持
            loop: true, // ループさせる
        });
        this.time.addEvent({
            callback: () => {
                this.p2.setVelocityX(0);
                if(this.down){
                    this.p2.setVelocityY(200)
                    if(this.p2.y >= stage.height - (bS/2 + bS * 1)){
                        this.down = false
                    }
                } else {
                    this.p2.setVelocityY(-200)
                    if(this.p2.y <= stage.height - (bS/2 + bS * 9)){
                        this.down = true
                    }
                }
            },
            callbackScope: this, // thisコンテキストを保持
            loop: true, // ループさせる
        });

        // playerの作成
        this.player = this.physics.add.sprite(100, stage.height - (bS/2 + bS * 7), 'mans')
        this.player.setGravityY(6000)
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.moveP);

        // this.physics.add.overlap(this.fireballs,this.player,(p,f) => {
        //     this.playerDeath();
        // })

        // クリボーのパチモン
        const enemy1Data = [
        ]
        this.enemies = this.physics.add.group();
        for(let n = 0; n < enemy1Data.length; n ++){
            const eD = enemy1Data[n]
            this.enemies.create(bS * eD[0] + (bS/3),stage.height - (bS/2 + bS * (eD[1] + 3)),"enemy1");
        }
        // 敵の衝突処理
        this.physics.add.collider(this.enemies, this.platforms);

        this.enemies.children.iterate((enemy) => {
            enemy.setGravityY(6000)
        });
        this.physics.add.overlap(this.enemies, this.player, (p, e) => {
            if (e.y - p.y > 54) {
                e.destroy();  // enemyを破壊
                this.player.setVelocityY(-1500)
            }
            else{
                this.playerDeath();
            }
        }, null, this);

        // 炎を出すてき
        const enemy2Data = [
        ]
        this.enemies2 = this.physics.add.group();
        for(let n = 0; n < enemy2Data.length; n ++){
            const eD = enemy2Data[n]
            this.enemies2.create(bS * eD[0] + (bS/3),stage.height - (bS/2 + bS * (eD[1] + 2)),"enemy2");
        }
        // 敵の衝突処理
        this.physics.add.collider(this.enemies2, this.platforms);
        this.physics.add.overlap(this.enemies2, this.player, (p, e) => {
            if (e.y - p.y > 54) {
                e.destroy();  // enemyを破壊
                this.player.setVelocityY(-1500)
            }
            else{
                this.playerDeath();
            }
        }, null, this);

        // 炎
        this.flare = this.physics.add.group(); //flareのグループを作成
        this.flare.children.iterate((f) => {
            f.setGravityY(0);  // Y軸の重力を無効化
        })
        this.physics.add.overlap(this.flare, this.player, (p, f) => {
            this.playerDeath();
        }, null, this);

        // ゴールの画像を追加
        this.goalImage = this.add.image(stage.width - 128, stage.height - (bS * ground.height) - 256, 'goal');
        // ゴールの判定を追加
        this.goalCollider = this.physics.add.staticGroup();
        const goalBody = this.goalCollider.create(stage.width - 128, stage.height - (bS * ground.height) - 256, 'goal').setAlpha(0);
        goalBody.setSize(2, 512);

        //cursorsにユーザーのキーボードの操作を検知させる
        this.cursors = this.input.keyboard.createCursorKeys();

        this.anims.create({ //playerが歩いている時のアニメーショaン
            key: 'walkLeft',
            frames: this.anims.generateFrameNumbers('mans', { start: 3, end: 4 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({ //playerが歩いている時のアニメーショaン
            key: 'jumpLeft',
            frames: this.anims.generateFrameNumbers('mans', { start: 3, end: 3 }),
            frameRate: 10,
            repeat: 1
        });
        this.anims.create({ //playerが歩いている時のアニメーショaン
            key: 'walkRight',
            frames: this.anims.generateFrameNumbers('mans', { start: 1, end: 2 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({ //playerが歩いている時のアニメーショaン
            key: 'jumpRight',
            frames: this.anims.generateFrameNumbers('mans', { start: 1, end: 1 }),
            frameRate: 10,
            repeat: 1
        });
        this.anims.create({ //playerが止まっている時のアニメーション
            key: "turn",
            frames: [{ key: "mans", frame: 0 }],
            frameRate: 20
        });

        //playerを追尾するカメラを作成
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(stage.x,stage.y,stage.width,stage.height);
        this.physics.world.setBounds(stage.x,stage.y,stage.width,stage.height);

        // ゴールの判定
        this.physics.add.overlap(this.player, this.goalCollider, this.reachGoal, null, this);
    }

    update(){
        if(this.isPlayerDead == true){
            return
        }
        const elapsedTime = Math.floor((this.time.now - this.timerStart) / 1000);  // 秒単位で経過時間を計算

        // タイマー表示を更新
        this.timerText.setText('Time: ' + elapsedTime);
        const cameraBounds = this.cameras.main.worldView;

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            // 上が押されたら && 地面についていたら
            this.player.setVelocityY(-1700);
            this.player.anims.play("turn", true)
        } else if (this.cursors.left.isDown) {
            // 左が押されたら
            this.player.setVelocityX(-400);
            if(!this.player.body.touching.down){
                this.player.anims.play("jumpLeft", true)
            }
            if(this.player.body.touching.down){
                // 地面についていたら
                this.player.anims.play("walkLeft", true)
            }
        } else if (this.cursors.right.isDown) {
            // 右が押されたら
            this.player.setVelocityX(400);
            if(!this.player.body.touching.down){
                this.player.anims.play("jumpRight", true)
            }
            if(this.player.body.touching.down){
                // 地面についていたら
                this.player.anims.play("walkRight", true)
            }
        } else {
            // 何も押されていない時
            this.player.setVelocityX(0);
            this.player.anims.play("turn", true)
        }
        if (this.player.y > this.scale.height-33) { // プレイヤーが画面の下端を超えた場合
            this.playerDeath();
            // this.scene.pause();  // ゲームを一時停止する
            console.log("プレイヤーが画面外に落ちました。ゲームが停止しました。");
        }
         // Enemy movement
        this.enemies.children.iterate((enemy) => {
            // Check if the enemy is within the camera bounds
            if (enemy.x > cameraBounds.left - 100 && enemy.x < cameraBounds.right + 100) {
                const playerX = this.player.x;
                const enemyX = enemy.x;

                let focus = 0;

                // Normalize the vector and apply speed to the enemy
                if (playerX - enemyX > 0) {
                    focus = 1;
                } else {
                    focus = -1;
                }
                if (focus === 1) {
                    enemy.setFlipX(true)
                } else {
                    enemy.setFlipX(false)
                }

                const speed = 100; // Enemy speed (adjustable)
                const velocityX = focus * speed;

                // Apply the new velocity to the enemy
                enemy.setVelocityX(velocityX);
            } else {
                // If the enemy is not within the camera's bounds, stop its movement
                enemy.setVelocityX(0);
            }
        });

        this.enemies2.children.iterate((enemy) => {
            if (enemy.active === false) {
                return;
            }
            const X = enemy.x;
            const playerX = this.player.x;
            enemy.setGravityY(6000);
            let focus = 0
            if(playerX - X> 0){
                focus = 1;
            } else {
                focus = -1;
            }
            if (focus === 1) {
                enemy.setFlipX(true)
            } else {
                enemy.setFlipX(false)
            }
            // enemyに対してフレア生成のイベントを設定する
            if (!enemy.flareEvent) {  // まだイベントが設定されていなければ
                enemy.flareEvent = this.time.addEvent({
                    delay: 3000, // 3秒ごとに発火
                    callback: () => {
                        if (!enemy.active) {
                            enemy.flareEvent.remove(); // イベントを削除
                            return;
                        }
                        const Y = enemy.y;
                        const X = enemy.x;
                        const playerX = this.player.x;
                        let focus = 0
                        if(playerX - X> 0){
                            focus = 1;
                        } else {
                            focus = -1;
                        }
                        if (enemy.x > cameraBounds.left - 100 && enemy.x < cameraBounds.right + 100) {
                            const new_flare = this.flare.create(X, Y, "flame");
                            new_flare.setVelocityX(focus * 300); // 150の速度で動かす
                            new_flare.setGravityY(0);
                            if (focus === 1) {
                                new_flare.setFlipX(true); // 右方向に進むので、画像を反転
                            } else {
                                new_flare.setFlipX(false); // 左方向に進むので、画像をそのまま
                            }
                        }
                    },
                    callbackScope: this, // thisコンテキストを保持
                    loop: true, // ループさせる
                });
            }
        });
    }

    reachGoal(player, goal) {
        const c = document.getElementById("clear")
        c.classList.remove("dN")
        const m = document.getElementById("menu")
        m.classList.remove("dN")
        this.scene.pause(); // ゲームを一時停
    }

    playerDeath(){
        this.isPlayerDead = true;
        this.player.anims.play("turn", true)
        this.player.setTint(0xff0000); // 赤色でダメージを表示
        this.player.setVelocity(0, 0); // 速度を止める（衝突時の速度）
        this.player.setVelocityY(-10000);
        this.time.delayedCall(50, () => {
            this.scene.pause(); // 0.5秒後にシーンをポーズ
        }, [], this);
        const d = document.getElementById("over")
        d.classList.remove("dN")
        const m = document.getElementById("menu")
        m.classList.remove("dN")
    }
}

var config = {
    type: Phaser.AUTO,
    width: Math.min(window.innerWidth, 1920),
    height: Math.min(window.innerHeight, 1080),
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 6000 }, //重力の強さ
            debug: true
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
        pixelArt: false,
        antialias: true,
        antialiasGL: true,
    },
    scene: Game
};

//ゲームオブジェクトの生成
var game = new Phaser.Game(config);

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});