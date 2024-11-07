class Game extends Phaser.Scene {
    player;
    platforms;
    cursors;

    preload(){
        // 画像の読み込み
        // this.load.image('ground', 'images/test.jpeg');
        this.load.image('back', 'images/back_image3.png');
        this.load.spritesheet('man', 'images/mans2.png',
            { frameWidth: 64, frameHeight: 64 }
        );
        this.load.image("man2", "images/カービィ3.png")
        this.load.image("block", "images/block2.png")
        this.load.image("block32px", "images/block2_32px.png")
        this.load.image("platform", "images/platform.png")
        this.load.image("goal", "images/goal_image2.png")
    }

    create(){
        const stage = {
            x: 0,
            y: 0,
            width: 800 * 3, //ステージの大きさ
            height: this.scale.height
        }

        // 背景の追加
        const background = this.add.image(this.scale.width / 2, this.scale.height / 2,'back').setScrollFactor(0);
        // 画像のリサイズ
        background.setDisplaySize(this.scale.width, this.scale.height);

        // 地形の追加
        const bS = 64 //blockSize
        const floatingBlock = [
            12
        ]
        const ground = {
            height:3,
            hole:[
                10,11,12,13
            ]
        }
        this.platforms = this.physics.add.staticGroup();
        for(let i = 0; i < Math.floor(stage.width / bS + 1); i ++){
            if(floatingBlock.includes(i)){
                this.platforms.create(bS * i + (bS/2), stage.height - (bS/2 + bS * 5), "block")
            }
            if(ground.hole.includes(i)){
            }
            else{
                for(let n = 0; n < ground.height; n ++){
                    this.platforms.create(bS * i + (bS/3), stage.height - (bS/2 + bS * n), "block")
                }
            }
        }
        // 空中に浮いている足場の追加
        // this.platforms.create(150, 450, "platform");
        // this.platforms.create(250, 350, "platform");
        // this.platforms.create(800, 700, "platform");

        // playerの作成
        this.player = this.physics.add.sprite(100, 450, 'man2');
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);

        // ゴールの画像を追加
        this.goalImage = this.add.image(stage.width - 128, stage.height - (bS * ground.height) - 256, 'goal');
        // ゴールの判定を追加
        this.goalCollider = this.physics.add.staticGroup();
        const goalBody = this.goalCollider.create(stage.width - 128, stage.height - (bS * ground.height) - 256, 'goal').setAlpha(0);
        goalBody.setSize(2, 512);

        //cursorsにユーザーのキーボードの操作を検知させる
        this.cursors = this.input.keyboard.createCursorKeys();

        // this.anims.create({ //playerが歩いている時のアニメーショaン
        //     key: 'walkLeft',
        //     frames: this.anims.generateFrameNumbers('man', { start: 1, end: 2 }),
        //     frameRate: 10,
        //     repeat: -1
        // });
        // this.anims.create({ //playerが歩いている時のアニメーショaン
        //     key: 'walkRight',
        //     frames: this.anims.generateFrameNumbers('man', { start: 3, end: 4 }),
        //     frameRate: 10,
        //     repeat: -1
        // });
        // this.anims.create({ //playerが止まっている時のアニメーション
        //     key: "turn",
        //     frames: [{ key: "man", frame: 0 }],
        //     frameRate: 20
        // });

        //playerを追尾するカメラを作成
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(stage.x,stage.y,stage.width,stage.height);
        this.physics.world.setBounds(stage.x,stage.y,stage.width,stage.height);

        // ゴールの判定
        this.physics.add.overlap(this.player, this.goalCollider, this.reachGoal, null, this);
    }

    update(){
        let jump = 1
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            // 上が押されたら && 地面についていたら
            this.player.setVelocityY(-1700);
            // this.player.anims.play("turn", true)
        } else if (this.cursors.left.isDown) {
            // 左が押されたら
            this.player.setVelocityX(-400);
            if(this.player.body.touching.down){
                // 地面についていたら
                // this.player.anims.play("walkLeft", true)
            }
        } else if (this.cursors.right.isDown) {
            // 右が押されたら
            this.player.setVelocityX(400);
            if(this.player.body.touching.down){
                // 地面についていたら
                // this.player.anims.play("walkRight", true)
            }
        } else {
            // 何も押されていない時
            this.player.setVelocityX(0);
            // this.player.anims.play("turn", true)
        }
        if (this.player.y > this.scale.height-33) { // プレイヤーが画面の下端を超えた場合
            this.player.setVelocity(0);  // プレイヤーを止める
            this.scene.pause();  // ゲームを一時停止する
            console.log("プレイヤーが画面外に落ちました。ゲームが停止しました。");
        }
    }

    reachGoal(player, goal) {
        console.log("ゴールに到達しました！");
        this.scene.pause(); // ゲームを一時停
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
            debug: false
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