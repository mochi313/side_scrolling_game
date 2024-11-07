let cursors;
let gameOver = false;
class Game extends Phaser.Scene {
    player;
    platforms;
    score = 0;
    scoreText;
    stars;
    bombs;
    goalCollider;
    gameOverText;

    preload() {
        this.load.image('ground', 'images/test.jpeg');
        this.load.image('back', 'images/back.png');
        this.load.spritesheet('man', 'images/spritesheet.png', { frameWidth: 131, frameHeight: 128 });
        this.load.image("block", "images/block.png");
        this.load.image("platform", "images/platform.png");
        this.load.image("pblock", "images/maptile_renga_brown_02_matt.png");
        this.load.image("goal", "images/goal_image2.png");
        this.load.image('star', 'images/star.png');
        this.load.image('bomb', 'images/bomb.png'); // 爆弾画像を読み込む
    }

    create() {
        const stage = {
            x: 0,
            y: 0,
            width: 1000 * 3,
            height: this.scale.height
        };

        const background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'back').setScrollFactor(0);
        background.setDisplaySize(this.scale.width, this.scale.height);


        this.platforms = this.physics.add.staticGroup();
        for (let i = 0; i < Math.floor(stage.width / 64 + 1); i++) {
            this.platforms.create(64 * i + 32, stage.height - 32, "block");
        }

        this.platforms.create(150, 450, "platform");
        this.platforms.create(250, 350, "platform");
        this.platforms.create(650, 420, "platform");


        const pblock1 = this.platforms.create(650 + 64, 660, "pblock");
        const pblock2 = this.platforms.create(650 + 64 * 2, 660, "pblock");
        const pblock3 = this.platforms.create(650 + 64 * 3, 660, "pblock");
        const pblock4 = this.platforms.create(650 + 64 * 4, 660, "pblock");

        [pblock1, pblock2, pblock3, pblock4].forEach(pblock => {
            pblock.refreshBody();
            pblock.setSize(64, 35);
            pblock.setOffset(0, 0);
        });

        this.player = this.physics.add.sprite(100, stage.height + 100, 'man');
        this.player.setCollideWorldBounds(true);
        this.player.setSize(90, 120);
        this.player.setOffset(20, 4);

        this.physics.add.collider(this.player, this.platforms);


        this.goalImage = this.add.image(stage.width - 128, stage.height - 320, 'goal');
        this.goalCollider = this.physics.add.existing(this.goalImage);
        this.goalCollider.body.setSize(2, 512);
        this.goalCollider.body.setAllowGravity(false);


        cursors = this.input.keyboard.createCursorKeys();

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

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(stage.x, stage.y, stage.width, stage.height);
        this.physics.world.setBounds(stage.x, stage.y, stage.width, stage.height);



        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate((child) => {
            child.x = Phaser.Math.Between(0, stage.width);
            child.y = Phaser.Math.Between(0, stage.height - 100);
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            child.setCollideWorldBounds(true);
        });

        this.physics.add.collider(this.stars, this.platforms);


        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#000'
        }).setScrollFactor(0);

        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);


        this.bombs = this.physics.add.group();
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);


        this.physics.add.overlap(this.player, this.goalCollider, this.reachGoal, null, this);


        // 1秒ごとに爆弾を生成するタイマー
        this.bombSpawner = this.time.addEvent({
            delay: 1000, // 1秒
            callback: this.spawnBomb,
            callbackScope: this,
            loop: true
        });
    }


    collectStar(player, star) {
        star.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }



    update() {
        if (gameOver) { // ゲームオーバーならupdate処理をスキップ
            return;
        }

        if (cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-1300);
            this.player.anims.play("turn", true)
        } else if (cursors.left.isDown) {
            this.player.setVelocityX(-330);
            this.player.flipX = true;
            if (this.player.body.touching.down) {
                this.player.anims.play("walk", true)
            }
        } else if (cursors.right.isDown) {
            this.player.setVelocityX(330);
            this.player.flipX = false;
            if (this.player.body.touching.down) {
                this.player.anims.play("walk", true)
            }
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play("turn", true)
        }
    }

    reachGoal(player, goal) {
        if (this.scene.isPaused() || gameOver) return;
        gameOver = true;
        this.physics.pause();
        player.anims.play('turn');
        this.showGameOverText("Goal!");

        this.time.delayedCall(2000, () => {
            // シーン再起動前に物理演算を再開し、gameOverをfalseにする
            this.physics.resume();
            gameOver = false;
            this.scene.restart();
        });
    }

    hitBomb(player, bomb) {
        if (gameOver) return;
        gameOver = true;
        this.physics.pause(); // 物理演算を一時停止
        player.setTint(0xff0000);
        player.anims.play('turn');
        this.showGameOverText("Game Over!");

        this.time.delayedCall(2000, () => {
            // シーン再起動前に物理演算を再開し、gameOverをfalseにする
            this.physics.resume();
            gameOver = false;
            this.scene.restart();
        });
    }

    showGameOverText(text) { // ゲームオーバーテキストを表示する関数
        this.gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, text, {
            fontSize: '64px',
            fill: '#000',
            stroke: '#fff',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0);
    }


    spawnBomb() {
        const bomb = this.bombs.create(Phaser.Math.Between(0, this.scale.width), 0, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}

var config = {
    type: Phaser.AUTO,
    width: Math.min(window.innerWidth, 1920),
    height: Math.min(window.innerHeight, 1080),
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 3000 },
            debug: false //デバッグモードをオフにする
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

var game = new Phaser.Game(config);

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});