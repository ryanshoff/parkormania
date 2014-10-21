var BasicGame = {};
var style = { font: "40px Arial", fill: "#ff0044", align: "left" };
var smallstyle = { font: "30px Arial", fill: "#ff0044", align: "left" };
var facing = 'left';
var bg;
var layer;
var map;
var player;
var robot;
var tileset;
var jumptimer = 0;
var cursors;
var jumpbutton;
var quitbutton;
var level = 'level1';
var score = 0;
var scoreText;

function collisionHandler (obj1, obj2) {
	robot.kill();

	score += 10;
	scoreText.text = 'Score: ' + score;
	console.log(scoreText.text);

	if(score >= 50)
		this.state.start('MainMenu');
}

function robotkilled () {
	robot.reset(0,0);
}

BasicGame.Boot = function(game) {};
BasicGame.Boot.prototype = {
 	preload: function() {
		console.log('BasicGame Boot preload');
	},
	create: function() {
		console.log('BasicGame Boot create');
		this.state.start('Preloader');
	}
};

BasicGame.Preloader = function(game) {};
BasicGame.Preloader.prototype = {
 preload: function() {
    console.log('BasicGame Preloader preload');
    this.load.tilemap('level3', 'level3.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('level2', 'level2.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('level1', 'level1.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('tiles-1', 'tiles-1.png');
    this.load.spritesheet('dude', 'dude.png', 32, 48);
    this.load.spritesheet('droid', 'droid.png', 32, 32);
    this.load.spritesheet('kate', 'kate2.png', 143, 200);
    this.load.image('starSmall', 'star.png');
    this.load.image('starBig', 'star2.png');
    this.load.image('background', 'background2.png');
    this.load.image('compass', 'compass_rose.png');
    this.load.image('touch_segment', 'touch_segment.png');
    this.load.image('touch', 'touch.png');
 },
 create: function() {
	console.log('BasicGame Preloader create');
	this.state.start('MainMenu');
 }
};

BasicGame.MainMenu = function(game) {};
BasicGame.MainMenu.prototype = {
	create: function() {
		console.log('BasicGame MainMenu create');
		this.add.text(0,0, "Parkour Mania", style);
		this.add.text(0,50, "by Kate and Ben", style);
		this.startButton1 = this.add.button(100, 100, 'dude', this.level1, this, 1, 0, 2);
		this.add.text(150,110, "Level 1", smallstyle);
		this.startButton2 = this.add.button(100, 150, 'droid', this.level2, this, 1, 0, 2);
		this.add.text(150,160, "Level 2", smallstyle);
		this.startButton3 = this.add.button(100, 200, 'dude', this.level3, this, 1, 0, 2);
		this.add.text(150,210, "Level 3", smallstyle);
	},
	level1: function() {
		level = 'level1';
		this.state.start('Game');
	},
	level2: function() {
		level = 'level2';
		this.state.start('Game');
	},
	level3: function() {
		level = 'level3';
		this.state.start('Game');
	}
};

BasicGame.Game = function(game) {
};

BasicGame.Game.prototype = {
 create: function() {
    console.log('BasicGame Game create');
    score = 0;

    this.game.touchControl = this.game.plugins.add(Phaser.Plugin.TouchControl);
    this.game.touchControl.inputEnable();

    this.physics.startSystem(Phaser.Physics.ARCADE);

    this.stage.backgroundcolor = '#000000';

    bg = this.add.tileSprite(0, 0, 800, 600, 'background');
    bg.fixedtocamera = true;

    map = this.add.tilemap(level);

    map.addTilesetImage('tiles-1');

    map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51 ]);

    layer = map.createLayer('Tile Layer 1');

    //  un-comment this on to see the collision tiles
    // layer.Debug = true;

    layer.resizeWorld();

    scoreText = this.add.text(16, 16, "score: 0", smallstyle);
    scoreText.fixedToCamera = true;

    this.physics.arcade.gravity.y = 250;

    player = this.add.sprite(32, 32, 'dude');
    this.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.bounce.y = 0.2;
    player.body.collideWorldBounds = true;
    player.body.setSize(20, 32, 5, 16);

    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('turn', [4], 20, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //robot = this.add.sprite(332, 32, 'droid');
    robot = this.add.sprite(332, 32, 'kate');
    this.physics.enable(robot, Phaser.Physics.ARCADE);

    robot.body.bounce.y = 0.2;
    robot.body.collideWorldBounds = true;
    //robot.body.setSize(20, 32, 5, 16);
    robot.events.onKilled.add(robotkilled);

    robot.animations.add('move', [0, 1, 2, 3], 10, true);

    this.camera.follow(player);

    cursors = this.input.keyboard.createCursorKeys();
    jumpbutton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    quitbutton = this.input.keyboard.addKey(Phaser.Keyboard.Q);

 },

 update: function() {

    this.physics.arcade.collide(player, layer);
    this.physics.arcade.collide(robot, layer);
    this.physics.arcade.collide(player, robot, collisionHandler, null, this);

    robot.body.velocity.x = 15;
    robot.animations.play('move');

    player.body.velocity.x = 0;

    if (cursors.left.isDown || this.game.touchControl.cursors.left)
    {
        player.body.velocity.x = -150;

        if (facing != 'left')
        {
            player.animations.play('left');
            facing = 'left';
        }
    }
    else if (cursors.right.isDown || this.game.touchControl.cursors.right)
    {
        player.body.velocity.x = 150;

        if (facing != 'right')
        {
            player.animations.play('right');
            facing = 'right';
        }
    }
    else
    {
        if (facing != 'idle')
        {
            player.animations.stop();

            if (facing == 'left')
            {
                player.frame = 0;
            }
            else
            {
                player.frame = 5;
            }

            facing = 'idle';
        }
    }
    
    if ( (jumpbutton.isDown || this.game.touchControl.cursors.up ) 
           && player.body.onFloor() && this.time.now > jumptimer)
    {
        player.body.velocity.y = -250;
        jumptimer = this.time.now + 750;
    }
    if (quitbutton.isDown)
    {
		this.state.start('MainMenu');
    }
 } 
};

//function render () {

    // game.debug.text(game.time.physicselapsed, 32, 32);
    // game.debug.body(player);
    // game.debug.bodyinfo(player, 16, 24);

//}

