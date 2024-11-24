class Game extends Phaser.Scene {
    player;
    platforms;
    cursors;
    enemy;

    preload(){
        // 画像の読み込み
        // this.load.image('ground', 'images/test.jpeg');
        this.load.image('back', 'images/title2.png');
        this.load.spritesheet('mans', 'images/カービィず.png',
            { frameWidth: 64, frameHeight: 64 }
        );
        this.load.image("block", "images/block2.png")
    }

    create(){
        this.physics.world.gravity.y = 0;
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
        for(let i = 0; i < Math.floor(stage.width / bS + 2); i ++){
            this.platforms.create(bS * i + (bS/3), stage.height - (bS/2), "block")
        }

        // playerの作成
        this.player = this.physics.add.sprite(100, 450, 'mans');
        this.player.setGravityY(6000)
        this.player.setCollideWorldBounds(true);
        this.playerPlatformCollider = this.physics.add.collider(this.player, this.platforms);

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

        //cursorsにユーザーのキーボードの操作を検知させる
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(){
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
    }
}

var config = {
    type: Phaser.AUTO,
    width: Math.min(window.innerWidth, 1920),
    height: Math.min(window.innerHeight, 1080),
    backgroundColor: '#fff',
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

const s = document.getElementById("stageSelect")
const b = document.getElementById("blur")

const d1 = document.getElementById("d1")
const d2 = document.getElementById("d2")
const d3 = document.getElementById("d3")

window.addEventListener("keydown", (event) => {
    console.log(event.key)
    if(event.key == "Escape"){
        b.classList.add("dN")
        s.classList.add("dN")
        return
    };
    if(event.key == "ArrowRight"){
        d3.classList.add("action")
    }
    if(event.key == "ArrowUp"){
        d1.classList.add("action")
    }
    if(event.key == "ArrowLeft"){
        d2.classList.add("action")
    }
    if(event.key != "ArrowRight"&&event.key != "ArrowUp"&&event.key != "ArrowLeft"&&event.key != "ArrowDown"){
        b.classList.remove("dN")
        s.classList.remove("dN")
    }
})

window.addEventListener("keyup",(event) => {
    d3.classList.remove("action")
    d1.classList.remove("action")
    d2.classList.remove("action")
})


// document.addEventListener('DOMContentLoaded', function() {
//     // selected要素を取得
//     const selectedElement = document.querySelector('.selected');
//     // stageSelect内のすべてのa要素を取得
//     const stageLinks = document.querySelectorAll('#stageSelect a');

//     // a要素にhoverしたときの処理
//     stageLinks.forEach(function(link) {
//         link.addEventListener('mouseenter', function() {
//             // a要素の位置を取得
//             const rect = link.getBoundingClientRect();

//             // selected要素の位置を更新
//             selectedElement.style.top = rect.top + window.scrollY + 'px';
//             selectedElement.style.left = rect.left + window.scrollX + 'px';
//         });
//     });

//     // a要素から離れたときの処理
//     stageLinks.forEach(function(link) {
//         link.addEventListener('mouseleave', function() {
//             // selected要素を元の位置に戻す (必要であれば)
//             selectedElement.style.top = '22%';
//             selectedElement.style.left = '0%';
//         });
//     });
// });