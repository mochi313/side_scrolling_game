class Game extends Phaser.Scene {
    player;
    platforms;
    cursors;
    enemy;

    preload(){
        // 画像の読み込み
        // this.load.image('ground', 'images/test.jpeg');
        this.load.image('back', '/stage_1/images/back_image3.png');
        this.load.image("man2", "stage_1/images/カービィ４.png")
        this.load.image("block", "stage_1/images/block2.png")
    }

    create(){
        const stage = {
            x: 0,
            y: 0,
            width: this.scale.width, //ステージの大きさ
            height: this.scale.height
        }

        // 背景の追加
        const background = this.add.image(this.scale.width / 2, this.scale.height / 2,'back').setScrollFactor(0);
        // 画像のリサイズ
        background.setDisplaySize(this.scale.width, this.scale.height);

        // 地形の追加
        const bS = 64 //blockSize
        this.platforms = this.physics.add.staticGroup();
        for(let i = 0; i < Math.floor(stage.width / bS + 1); i ++){
            this.platforms.create(bS * i + (bS/3), stage.height - (bS/2), "block")
        }

        // playerの作成
        this.player = this.physics.add.sprite(100, 450, 'man2');
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);

        //cursorsにユーザーのキーボードの操作を検知させる
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(){
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