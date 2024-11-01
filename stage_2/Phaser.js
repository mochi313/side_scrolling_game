class Game extends Phaser.Scene {
    player;
    platforms;
    cursors;

    preload() {
        // 画像の読み込み
        this.load.image('ground', 'images/test.jpeg');
        this.load.image('back', 'images/back.png',);
        this.load.spritesheet('man', 'images/spritesheet.png',
            { frameWidth: 131, frameHeight: 128 }
        );
        this.load.image("block", "images/block.png")
        this.load.image("platform", "images/platform.png")
        this.load.image("pblock", "images/maptile_renga_brown_02_matt.png",);
        this.load.image("goal", "images/goal_image2.png")
    }

    create() {
        const stage = {
            x: 0,
            y: 0,
            width: 1000 * 3, //ステージの大きさ
            height: this.scale.height
        }

        // 背景の追加
        const background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'back').setScrollFactor(0);
        // 画像のリサイズ
        background.setDisplaySize(this.scale.width, this.scale.height);

        // 地形の追加
        this.platforms = this.physics.add.staticGroup();
        for (let i = 0; i < Math.floor(stage.width / 64 + 1); i++) {
            this.platforms.create(64 * i + 32, stage.height - 32, "block");
        }
        // 空中に浮いている足場の追加
        this.platforms.create(150, 450, "platform");
        this.platforms.create(250, 350, "platform");
        this.platforms.create(650, 420, "platform");

        // pblockの当たり判定を修正
        const pblock1 = this.platforms.create(650 + 64, 660, "pblock");
        const pblock2 = this.platforms.create(650 + 64 * 2, 660, "pblock");
        const pblock3 = this.platforms.create(650 + 64 * 3, 660, "pblock");
        const pblock4 = this.platforms.create(650 + 64 * 4, 660, "pblock");

        // 当たり判定の更新
        [pblock1, pblock2, pblock3, pblock4].forEach(pblock => {
            pblock.refreshBody();
            pblock.setSize(64, 35); // 必要に応じてサイズを調整
            pblock.setOffset(0, 0); // 必要に応じてオフセットを調整
        });

        // playerの作成
        this.player = this.physics.add.sprite(100, 1080 - 64, 'man');
        this.player.setCollideWorldBounds(true);

        // プレイヤーの当たり判定のサイズと位置を画像に合わせる
        this.player.setSize(90, 120); // 必要に応じてサイズを調整
        this.player.setOffset(20, 4); // 必要に応じてオフセットを調整



        this.physics.add.collider(this.player, this.platforms, this.handleCollision, null, this);



        // ゴールの画像を追加
        this.goalImage = this.add.image(stage.width - 128, stage.height - 320, 'goal');
        // ゴールの判定を追加
        this.goalCollider = this.physics.add.staticGroup();
        const goalBody = this.goalCollider.create(stage.width - 128, stage.height - 320, 'goal').setAlpha(0);
        goalBody.setSize(2, 512);

        this.add.text(20, 20, 'ゲームスタート！', {
            font: '32px Arial',
            fill: '#ffffff' // テキストの色
        });

        //cursorsにユーザーのキーボードの操作を検知させる
        this.cursors = this.input.keyboard.createCursorKeys();

        this.anims.create({ //playerが歩いている時のアニメーショaン
            key: 'walk',
            frames: this.anims.generateFrameNumbers('man', { start: 1, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({ //playerが止まっている時のアニメーション
            key: "turn",
            frames: [{ key: "man", frame: 0 }],
            frameRate: 10
        });

        //playerを追尾するカメラを作成
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(stage.x, stage.y, stage.width, stage.height);
        this.physics.world.setBounds(stage.x, stage.y, stage.width, stage.height);

        // ゴールの判定
        this.physics.add.overlap(this.player, this.goalCollider, this.reachGoal);
    }

    update() {
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            // 上が押されたら && 地面についていたら
            this.player.setVelocityY(-1300);
            this.player.anims.play("turn", true)
        } else if (this.cursors.left.isDown) {
            // 左が押されたら
            this.player.setVelocityX(-330);
            this.player.flipX = true; // キャラクターを左向きに反転
            if (this.player.body.touching.down) {
                // 地面についていたら
                this.player.anims.play("walk", true)
            }
        } else if (this.cursors.right.isDown) {
            // 右が押されたら
            this.player.setVelocityX(330);
            this.player.flipX = false; // キャラクターを右向きに戻す
            if (this.player.body.touching.down) {
                // 地面についていたら
                this.player.anims.play("walk", true)
            }
        } else {
            // 何も押されていない時
            this.player.setVelocityX(0);
            this.player.anims.play("turn", true)
        }
    }

    reachGoal(player, goal) {

        // ゲームを一時停止
        this.scene.pause();

        // 一時停止後の再開を追加（例：1秒後にゲームを再開する）
        this.time.delayedCall(2000, () => {
            this.scene.resume(); // ゲームを再開
        });
    }
}

var config = {
    type: Phaser.AUTO,
    width: Math.min(window.innerWidth, 1920),
    height: Math.min(window.innerHeight, 1080),
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 3000 }, //重力の強さ
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