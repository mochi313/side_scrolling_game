class Game extends Phaser.Scene {
    player;
    platforms;
    cursors;

    preload(){
        // 画像の読み込み
        this.load.image('ground', 'images/test.jpeg');
        this.load.image('back', 'images/back.png');
        this.load.spritesheet('man', 'images/man.png',
            { frameWidth: 64, frameHeight: 64 }
        );
        this.load.image("block", "images/block.png")
        this.load.image("platform", "images/platform.png")
    }

    create(){
        const stage = {
            x: 0,
            y: 0,
            width: 800 * 3, //ステージの大きさ
            height: 600
        }

        // 背景の追加
        this.add.image(400,300,'back').setScrollFactor(0);

        // 地形の追加
        this.platforms = this.physics.add.staticGroup();
        for(let i = 0; i < Math.floor(stage.width / 64 + 1); i ++){
            this.platforms.create(64 * i + 32, 570, "block");
        }
        // 空中に浮いている足場の追加
        this.platforms.create(150, 450, "platform");
        this.platforms.create(250, 350, "platform");
        this.platforms.create(650, 420, "platform");

        // playerの作成
        this.player = this.physics.add.sprite(100, 450, 'man');

        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, this.platforms);

        //cursorsにユーザーのキーボードの操作を検知させる
        this.cursors = this.input.keyboard.createCursorKeys(); 

        this.anims.create({ //playerが歩いている時のアニメーション
            key: 'walk',
            frames: this.anims.generateFrameNumbers('man', { start: 1, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({ //playerが止まっている時のアニメーション
            key: "turn",
            frames: [{ key: "man", frame: 0 }],
            frameRate: 20
        });

        this.cameras.main.startFollow(this.player); //playerを追尾するカメラを作成
        this.cameras.main.setBounds( //カメラの挙動の制御
            stage.x,
            stage.y,
            stage.width,
            stage.height
        );

        this.physics.world.setBounds(
            stage.x,
            stage.y,
            stage.width,
            stage.height
        );
    }

    update(){
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            // 上が押されたら && 地面についていたら
            this.player.setVelocityY(-800);
            this.player.anims.play("turn", true)
        } else if (this.cursors.left.isDown) {
            // 左が押されたら
            this.player.setVelocityX(-330);
            if(this.player.body.touching.down){
                // 地面についていたら
                this.player.anims.play("walk", true)
            }
        } else if (this.cursors.right.isDown) {
            // 右が押されたら
            this.player.setVelocityX(330);
            if(this.player.body.touching.down){
                // 地面についていたら
                this.player.anims.play("walk", true)
            }
        } else {
            // 何も押されていない時
            this.player.setVelocityX(0);
            this.player.anims.play("turn", true)
        }
    }
}

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 3000 }, //重力の強さ
            debug: false
        }
    },
    scene: Game
};

//ゲームオブジェクトの生成
var game = new Phaser.Game(config);