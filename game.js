    var config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 300 },
                debug: false
            }
        },
        parent: 'container',
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    var game = new Phaser.Game(config);
    var platforms;
    var score = 0;
    var scoreText;
    var level = 1;
    var levelText;
    var timedEvent;
    var time = 30;
    var timeText;
    var gameOver = false;
    var gameOverText;

    function preload() {
        this.load.image('grass', 'assets/ground_grass.png');
        this.load.image('cake', 'assets/ground_cake.png');
        this.load.image('sand', 'assets/ground_sand.png');
        this.load.image('enemy', 'assets/spikeBall1.png');
        this.load.image('player', 'assets/bunny1_stand.png');
        this.load.image('stand', 'assets/bunny1_stand.png');
        this.load.image('walk1', 'assets/bunny1_walk1.png');
        this.load.image('walk2', 'assets/bunny1_walk2.png');
        this.load.image('gold', 'assets/gold_1.png');
        this.load.image('background', 'assets/bg_layer2.png');
    }

    function create() {
        this.add.image(400, 300, 'background');
        platforms = this.physics.add.staticGroup();
        platforms.create(100, 575, 'grass').setScale(0.5).refreshBody();
        platforms.create(300, 575, 'grass').setScale(0.5).refreshBody();
        platforms.create(500, 575, 'grass').setScale(0.5).refreshBody();
        platforms.create(700, 575, 'grass').setScale(0.5).refreshBody();
        platforms.create(500, 420, 'cake').setScale(0.5).refreshBody();
        platforms.create(700, 420, 'cake').setScale(0.5).refreshBody();
        platforms.create(100, 265, 'sand').setScale(0.5).refreshBody();
        platforms.create(300, 265, 'sand').setScale(0.5).refreshBody();
        platforms.create(700, 265, 'sand').setScale(0.5).refreshBody();

        timeText = this.add.text(80, 5, 'Time: ' + time, { fontSize: '32px bold', fill: '#fff' });
        levelText = this.add.text(330, 5, 'Level: ' + level, { fontSize: '32px bold', fill: '#fff' });
        scoreText = this.add.text(580, 5, 'Score: ' + score, { fontSize: '32px bold', fill: '#fff' });
        gameOverText = this.add.text(270, 245, '', { fontSize: '68px bold', fill: '#F00' });

        player = this.physics.add.sprite(100, 450, 'player');
        player.setScale(0.3);
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);

        this.physics.add.collider(player, platforms);

        this.anims.create({
            key: 'idle',
            frames: [
                { key: 'stand' }
            ],
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: [
                { key: 'walk1' },
                { key: 'walk2' }
            ],
            frameRate: 8,
            repeat: -1
        });

        cursors = this.input.keyboard.createCursorKeys();

        coins = this.physics.add.group({
            key: 'gold',
            repeat: 11,
            setXY: { x: 15, y: 0, stepX: 70 }
        });

        coins.children.iterate(function (coin) {
            coin.setScale(0.35);
            coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        this.physics.add.collider(coins, platforms);
        this.physics.add.overlap(player, coins, collectCoins, null, this);

        enemies = this.physics.add.group();
        this.physics.add.collider(enemies, platforms);
        this.physics.add.collider(player, enemies, hitEnemy, null, this);

        timedEvent = this.time.delayedCall(30000, onEvent, [], this);
    }

    function update() {
        if (!gameOver) {
            if (cursors.left.isDown) {
                if (player.flipX == false) {
                    player.flipX = true;
                }
                player.setVelocityX(-160);
                player.anims.play('walk', true);
            }
            else if (cursors.right.isDown) {
                if (player.flipX == true) {
                    player.flipX = false;
                }
                player.setVelocityX(160);
                player.anims.play('walk', true);
            }
            else {
                player.setVelocityX(0);
                player.anims.play('idle');
            }
            if (cursors.up.isDown && player.body.touching.down) {
                player.setVelocityY(-330);
            }

            strTime = timedEvent.getElapsedSeconds();
            timeText.setText("Time: " + (time - Math.ceil(strTime)));
        }
    }

    function collectCoins(player, coin) {
        coin.disableBody(true, true);
        score += 10;
        scoreText.setText('Score: ' + score);
        if (coins.countActive(true) === 0) {
            level++;
            timedEvent.reset();
            timedEvent = this.time.delayedCall(30000, onEvent, [], this);
            levelText.setText("Level: " + level);
            coins.children.iterate(function (coin) {
                coin.enableBody(true, coin.x, 0, true, true);
            });
            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
            var enemy = enemies.create(x, 16, 'enemy');
            enemy.setScale(0.5);
            enemy.setBounce(1);
            enemy.setCollideWorldBounds(true);
            enemy.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }

    function hitEnemy(player, enemy) {
        this.anims.pauseAll();
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        gameOver = true;
        showGameOver();
    }

    function onEvent() {
        gameOver = true;
        showGameOver();
    }

    function showGameOver() {
        gameOverText.setText("Game Over");
    }