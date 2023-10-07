import "phaser"
import Tile from "./tile.js"

export default class Cell {
    #scene;
    #x;
    #y;
    #mergeTile;
    #tile;
    #width;
    #destination;
    #tileSpeed = 600;
    
    get x() {
        return this.#x;
    }
    
    get y() {
        return this.#y;
    }

    get width() {
        return this.#width;
    }

    get tile() {
        return this.#tile;
    }
    
    set tile(v) {
        this.#tile = v;
    }
    get destination() {
        return this.#destination;
    }
    
    set destination(v) {
        this.#destination = v;
    }

    get mergeTile() {
        return this.#mergeTile;
    }
    
    set mergeTile(v) {
        this.#mergeTile = v;
    }
    // get tileIsMoving() {
    //     if (this.#tile == null) {
    //         return false;
    //     }
    //     return (
    //         this.#x != this.#tile.x || this.#y != this.#tile.y
    //     );    
    // }

    constructor(scene, x, y, w) {
        this.#scene = scene;
        this.#x = x;
        this.#y = y;
        this.#width = w;
    }
    
    addTile() {
        this.#tile = new Tile(this.#scene, this.#x, this.#y, this.#width);
    }
    
    removeTile() {
        this.#tile.gameObj.destroy();
        this.#tile = null;
    }
    
    moveTileTo(cell) {
        let gameObj = this.#tile.gameObj;
        let coorX = cell.x * cell.width + cell.width / 2;
        let coorY = cell.y * cell.width + cell.width / 2;
        let target = new Phaser.Math.Vector2(coorX, coorY);
        this.#scene.physics.moveToObject(gameObj, target, this.#tileSpeed);
        // set tile x y to the destined cell
        this.#tile.x = cell.x;
        this.#tile.y = cell.y;
        if (!cell.mergeTile) {
            cell.tile = this.#tile;
        }
        this.#destination = this.#tile;
        this.#tile = null;

    }
    
    canAccept(cell) {
        return (this.#tile == null ||
            (this.#mergeTile == null && this.#tile.val == cell.tile.val));
    }
}