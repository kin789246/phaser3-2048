import "phaser";
import GameScene from "./gamescene.js";

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 400,
    backgroundColor: '#0000FF',
    physics: {
        default: 'arcade',
    },
    scene: [ GameScene ]
};

const game = new Phaser.Game(config);