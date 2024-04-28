import Phaser, { NONE } from "phaser";
import io from "socket.io-client";
const socket = io("https://6v27k7-3000.csb.app");
// socket.emit("message", `Random number ${Math.floor(Math.random() * 100)}`);

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  antialias: true,
  physics: {
    default: "arcade",
    arcade: {
      fps: 60,
      gravity: { y: 0 },
    },
  },
  scene: {
    key: "main",
    preload: preload,
    create: null,
    update: update,
  },
};
var game = null;
var ball;
var leftPaddle;
var rightPaddle;
var controlPaddle = null;
var controlSide = null;
var leftGoal;
var rightGoal;
var collisionGraphics;
var p1Score = 0;
var p2Score = 0;
var p1ScoreText;
var p2ScoreText;
var multiplier = [1, -1];

socket.on("side", (data) => {
  if (socket.id === data.socketID) {
    if (data.side === "left") {
      controlSide = "left";
    } else if (data.side === "right") {
      controlSide = "right";
    }
  }
  console.log(controlSide);
});

socket.on("full", () => {
  console.log("Game is full please try again later");
});
socket.on("start", () => {
  config.scene.create = create;
  game = new Phaser.Game(config);
  console.log(socket.id + " game start");
});

function preload() {}
function create() {
  this.physics.world.createDebugGraphic();

  var graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(10, 10, 10);
  var ballTexture = graphics.generateTexture("ball", 20, 20);
  graphics.destroy();

  ball = this.physics.add.image(config.width / 2, config.height / 2, "ball");
  ball.setCollideWorldBounds(true);
  ball.setBounce(1, 1);
  ball.setVelocity(
    200 * multiplier[Math.floor(Math.random() * multiplier.length)],
    200 * multiplier[Math.floor(Math.random() * multiplier.length)],
  );

  var graphics = this.add.graphics();
  createPaddle(graphics, "left");
  leftPaddle = this.physics.add.image(100, config.height / 2, "paddleleft");
  leftPaddle.setCollideWorldBounds(true);
  leftPaddle.setImmovable(true);

  var graphics = this.add.graphics();
  createPaddle(graphics, "right");
  rightPaddle = this.physics.add.image(
    config.width - 100,
    config.height / 2,
    "paddleright",
  );
  rightPaddle.setCollideWorldBounds(true);
  rightPaddle.setImmovable(true);

  graphics = this.add.graphics();
  graphics.fillStyle(0xc72457, 1);
  graphics.fillRect(0, 0, 10, config.height);
  var goalTexture = graphics.generateTexture("goal", 10, config.height);
  graphics.destroy();

  leftGoal = this.physics.add.image(0, config.height / 2, "goal");
  leftGoal.setCollideWorldBounds(true);
  leftGoal.setImmovable(true);

  rightGoal = this.physics.add.image(config.width, config.height / 2, "goal");
  rightGoal.setCollideWorldBounds(true);
  rightGoal.setImmovable(true);

  this.physics.add.collider(
    ball,
    [leftPaddle, rightPaddle],
    handleCollision,
    null,
    this,
  );

  this.physics.add.collider(
    ball,
    [leftGoal, rightGoal],
    GoalCollision,
    null,
    this,
  );

  collisionGraphics = this.add.graphics();

  p1ScoreText = this.add.text(config.width / 2 - 50, 20, "0", {
    fontSize: "48px",
    fill: "#ffffff",
  });
  p1ScoreText.setScrollFactor(0);
  p2ScoreText = this.add.text(config.width / 2 + 25, 20, "0", {
    fontSize: "48px",
    fill: "#ffffff",
  });
  p2ScoreText.setScrollFactor(0);

  controlPaddle = controlSide == "left" ? leftPaddle : rightPaddle;
}
function update() {
  var cursors = this.input.keyboard.createCursorKeys();
  if (controlPaddle != null) {
    if (cursors.up.isDown) {
      controlPaddle.setVelocityY(-500);
    } else if (cursors.down.isDown) {
      controlPaddle.setVelocityY(500);
    } else {
      controlPaddle.setVelocityY(0);
    }
  }
}

function createPaddle(graphics, side) {
  graphics.fillStyle(controlSide == side ? 0x345eeb : 0xc72457, 1);
  graphics.fillRect(0, 0, 20, 150);
  var paddleTexture = graphics.generateTexture("paddle" + side, 20, 150);
  graphics.destroy();
}

function handleCollision(ball, object) {
  collisionGraphics.clear();
  collisionGraphics.fillStyle(0x24c752, 1);
  collisionGraphics.fillCircle(ball.x, ball.y, 5);
  if (ball.body.velocity.x < 400 && ball.body.velocity.x > -400) {
    ball.setVelocityX(ball.body.velocity.x * 1.2);
    ball.setVelocityY(ball.body.velocity.x * 1.2);
  }
  if (ball.body.velocity.y < 400 && ball.body.velocity.y > -400) {
    ball.setVelocityX(ball.body.velocity.y * 1.2);
    ball.setVelocityY(ball.body.velocity.y * 1.2);
  }
}
function GoalCollision(ball, object) {
  if (object === leftGoal) {
    p1Score++;
    p1ScoreText.setText(p1Score);
  }
  if (object === rightGoal) {
    p2Score++;
    p2ScoreText.setText(p2Score);
  }
  collisionGraphics.clear();
  collisionGraphics.fillStyle(0xff0000, 1);
  collisionGraphics.fillCircle(ball.x, ball.y, 5);
  ball.setPosition(config.width / 2, config.height / 2);
  ball.setVelocity(
    ball.body.velocity.x *
      multiplier[Math.floor(Math.random() * multiplier.length)],
    ball.body.velocity.y *
      multiplier[Math.floor(Math.random() * multiplier.length)],
  );
}
export default game;
