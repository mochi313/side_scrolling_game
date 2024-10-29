class Game extends Phaser.Scene {
    player;
    platforms;
    cursors;

    preload(){
        //背景の画像
        this.load.image('ground', 'images/test.jpeg');
        this.load.image('back', 'images/back.png');
        this.load.spritesheet('man', 'images/man.png',
            { frameWidth: 64, frameHeight: 64 }
        );
        this.load.image("block", "images/block.png")
        this.load.image("platform", "images/platform.png")
    }

    create(){
        // this.cameras.main.startFollow(this.player);
        this.add.image(400,300,'back');
        // this.cameras.main.startFollow(player);
        this.platforms = this.physics.add.staticGroup();
        for(let i = 0; i < Math.floor(800 / 64 + 1); i ++){
            this.platforms.create(64 * i + 32, 570, "block");
        }
        this.platforms.create(150, 450, "platform");
        this.platforms.create(250, 350, "platform");
        this.platforms.create(650, 420, "platform");

        // this.platforms.create(400, 700, 'ground').setScale(2).refreshBody();

        this.player = this.physics.add.sprite(100, 450, 'man');

        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, this.platforms);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('man', { start: 1, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "turn",
            frames: [{ key: "man", frame: 0 }],
            frameRate: 20
        });
        // player.anims.play('walk',true);
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
            gravity: { y: 3000 },
            debug: false
        }
    },
    scene: Game
};

//ゲームオブジェクトの生成
var game = new Phaser.Game(config);