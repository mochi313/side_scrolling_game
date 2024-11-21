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
        this.load.image('back', 'images/back.png');
        this.load.spritesheet('man', 'images/spritesheet.png', { frameWidth: 131, frameHeight: 128 });
        this.load.image("block", "images/block.png");
        this.load.image("pblock", "images/maptile_renga_brown_02_matt.png");
        this.load.image("goal", "images/goal_image2.png");
        this.load.image('star', 'images/star.png');
        this.load.image('bomb', 'images/bakudan_chakka.png'); // 爆弾画像を読み込む
        // this.load.audio('bgm', 'audio/bgm.wav'); // BGMファイルを読み込む
        this.load.audio('collect', 'audio/collect.mp3'); // スターを集めたときの効果音
        this.load.audio('bomb', 'audio/bomb.mp3'); // 爆弾に当たったときの効果音
        this.load.audio('fall', 'audio/fall.mp3');
    }

    create() {
        gameOver = false; // 明示的に初期化
        // this.bgm = this.sound.add('bgm'); // BGMを読み込んだ音声を変数に保存
        // this.bgm.play({ loop: true }); // ループ再生
        this.collectSound = this.sound.add('collect'); // スターを集めたときの音
        this.bombSound = this.sound.add('bomb'); // 爆弾の音
        this.fallSound = this.sound.add('fall');

        const stage = {
            x: 0,
            y: 0,
            width: 1000 * 8,
            height: this.scale.height
        };

        this.stage = {
            x: 0,
            y: 0,
            width: 1000 * 8,
            height: this.scale.height
        };

        const background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'back').setScrollFactor(0);
        background.setDisplaySize(this.scale.width, this.scale.height);

        this.platforms = this.physics.add.staticGroup();
        const totalBlocks = Math.floor(stage.width / 64) + 1;

        // すべてのブロックを生成
        const blocks = [];
        for (let i = 0; i < totalBlocks; i++) {
            const block = this.platforms.create(64 * i + 32, stage.height - 32, "block");
            blocks.push(block); // ブロックを配列に格納
        }

        // 複数の穴をランダムな位置に生成
        const holeCount = 10; // 生成する穴の数
        for (let j = 0; j < holeCount; j++) {
            // ランダムな位置に穴を開ける。ただし最後のブロックを超えない範囲で指定
            const holeStartIndex = Phaser.Math.Between(0, totalBlocks - 3); // 配列の範囲を考慮
            const holeSize = Phaser.Math.Between(2, 3); // 穴のサイズを2〜3ブロックに設定

            for (let i = 0; i < holeSize; i++) {
                const block = blocks[holeStartIndex + i];
                if (block && block.active) {  // ブロックが存在し、まだ有効な場合のみ無効化
                    block.disableBody(true, true);
                }
            }
        }

        // pblockのランダム配置処理（高さもランダム）
        const placeRandomPblocks = (platforms, totalWidth, blockSize, stageHeight) => {
            const pblockCount = 10; // ランダム配置するpblockの数
            const placedPositions = []; // 既に使用された位置を記録する配列

            for (let i = 0; i < pblockCount; i++) {
                let startX, startY;
                let isOverlap;
                do {
                    isOverlap = false;
                    startX = Phaser.Math.Between(0, totalWidth - blockSize * 4); // pblockは最大4ブロック分の幅をとる
                    startY = Phaser.Math.Between(stageHeight - 300, stageHeight - blockSize); // 高さをランダムに設定
                    const endX = startX + blockSize * Phaser.Math.Between(2, 6); // pblockのサイズを2～4ブロック分で決定

                    // 既存のブロックと重ならないか確認
                    for (let pos of placedPositions) {
                        if (
                            (startX >= pos.start && startX <= pos.end && Math.abs(startY - pos.y) < blockSize) || // 水平位置が被る
                            (endX >= pos.start && endX <= pos.end && Math.abs(startY - pos.y) < blockSize) || // 水平位置が被る
                            (startX <= pos.start && endX >= pos.end && Math.abs(startY - pos.y) < blockSize) // 範囲を覆う場合
                        ) {
                            isOverlap = true;
                            break;
                        }
                    }
                } while (isOverlap);

                // 配置位置を保存
                const pblockLength = Phaser.Math.Between(2, 4); // 2〜4個のpblockを配置
                const newPosition = {
                    start: startX,
                    end: startX + blockSize * pblockLength,
                    y: startY
                };
                placedPositions.push(newPosition);

                // pblockを生成して配置
                for (let j = 0; j < pblockLength; j++) {
                    const pblock = platforms.create(startX + blockSize * j, startY, "pblock");
                    pblock.refreshBody();
                    pblock.setSize(blockSize, 35);
                    pblock.setOffset(0, 0);
                }
            }
        };

        // ランダムな位置と高さにpblockを配置
        placeRandomPblocks(this.platforms, stage.width, 64, stage.height);

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
            frames: this.anims.generateFrameNumbers('man', { start: 0, end: 2 }),
            frameRate: 15,
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
            repeat: 70,
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
            fill: '#fff'
        }).setScrollFactor(0);

        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);


        this.bombs = this.physics.add.group();
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);


        this.physics.add.overlap(this.player, this.goalCollider, this.reachGoal, null, this);


        // 1秒ごとに爆弾を生成するタイマー
        this.bombSpawner = this.time.addEvent({
            delay: 600,
            callback: this.spawnBomb,
            callbackScope: this,
            loop: true
        });
    }


    collectStar(player, star) {
        star.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        this.collectSound.play(); // 効果音を再生
    }



    update() {
        if (gameOver) { // ゲームオーバーならupdate処理をスキップ
            return;
        }

        // キー入力処理
        if (cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-1000);
            this.player.anims.play("turn", true);
        } else if (cursors.left.isDown) {
            this.player.setVelocityX(-770);
            this.player.flipX = true;
            if (this.player.body.touching.down) {
                this.player.anims.play("walk", true);
            }
        } else if (cursors.right.isDown) {
            this.player.setVelocityX(770);
            this.player.flipX = false;
            if (this.player.body.touching.down) {
                this.player.anims.play("walk", true);
            }
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play("turn", true);
        }

        // プレイヤーが画面外に落ちた場合（画面の下端を超えた場合）ゲームオーバー処理
        if (this.player.y == this.game.config.height - 60) {
            this.fallOutOfBounds(); // プレイヤーが画面外に落ちた時の処理
        }
    }

    fallOutOfBounds() {
        if (gameOver) return; // ゲームオーバー状態なら処理しない
        gameOver = true; // ゲームオーバー状態に設定
        this.player.setTint(0xff0000); // プレイヤーを赤くする
        this.physics.pause(); // 物理演算を一時停止
        this.player.anims.play('turn'); // 待機アニメーションを再生
        this.showGameOverText("Game Over"); // ゲームオーバーテキストを表示
        this.score = 0;

        this.player.setVisible(false);

        // fallSoundをここで一度だけ再生
        if (!this.fallSound.isPlaying) {
            this.fallSound.play(); // 効果音を再生
        }
        this.time.delayedCall(2000, () => {
            gameOver = false; // 再起動前にリセット
            this.scene.restart();
        });
    }

    reachGoal(player, goal) {
        if (this.scene.isPaused() || gameOver) return;
        gameOver = true;
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
        this.score = 0;

        this.bombSound.play(); // 爆発音を再生

        this.time.delayedCall(2000, () => {
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
        if (!this.stage) return; // stageが未定義の場合のガード

        const bomb = this.bombs.create(Phaser.Math.Between(0, this.physics.world.bounds.width), 0, 'bomb');
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
            gravity: { y: 1000 },
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
        pixelArt: false,
        antialias: true,
        antialiasGL: false,
    },
    scene: Game
};

var game = new Phaser.Game(config);

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});