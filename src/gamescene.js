import "phaser"
import Grid from "./grid.js"

export default class GameScene extends Phaser.Scene {
    #N = 4;
    #EDGE_LEN = 100;
    #TOLERANCE = 2;
    #isMoving;
    #keyIsHandling;
    #grid;
    #isPlaying;

    get grid() {
        return this.#grid;
    }

    get isMoving() {
        return this.#isMoving;
    }
    
    set isMoving(v) {
        this.#isMoving = v;
    }
    
    get keyIsHandling() {
        return this.#keyIsHandling;
    }
    
    set keyIsHandling(v) {
        this.#keyIsHandling = v;
    }

    create() {
        this.initGame();
        //this.testAssignXY();
        this.#isMoving = false;
        this.#keyIsHandling = false;
        this.#isPlaying = true;
        this.input.keyboard.on('keydown', this.handleKeys);
    }

    update(time, delta) {
        if (!this.#isPlaying) {
            return;
        }

        this.#isMoving = this.checkTilesStopMoving();
        if (this.#isMoving) {
            this.processTilesStop();
        }
        else if (this.#keyIsHandling) {
            this.processTilesMerging();

            if (this.checkGameWin()) return;

            if (!this.#grid.gridIsFull) {
                this.#grid.randomEmptyCell().addTile();
            }
            this.#keyIsHandling = false;
            this.checkGameOver();
        }
    }

    handleKeys(e) {
        if (e.key === 'ArrowUp') {
            if (!this.scene.canMoveUp()) {
                return;
            }
            this.scene.isMoving = true;
            this.scene.slideTiles(this.scene.grid.groupByColumns);
        }
        else if (e.key === 'ArrowDown') {
            if (!this.scene.canMoveDown()) {
                return;
            }
            this.scene.isMoving = true;
            this.scene.slideTiles(this.scene.grid.groupByColumnsReverse);
        }
        else if (e.key === 'ArrowLeft') {
            if (!this.scene.canMoveLeft()) {
                return;
            }
            this.scene.isMoving = true;
            this.scene.slideTiles(this.scene.grid.groupByRows);
        }
        else if (e.key === 'ArrowRight') {
            if (!this.scene.canMoveRight()) {
                return;
            }
            this.scene.isMoving = true;
            this.scene.slideTiles(this.scene.grid.groupByRowsReverse);
        }
    }
    
    canMoveUp() {
        return this.canMoveTiles(this.#grid.groupByColumns);   
    }

    canMoveDown() {
        return this.canMoveTiles(this.#grid.groupByColumnsReverse);   
    }
    
    canMoveLeft() {
        return this.canMoveTiles(this.#grid.groupByRows);   
    }

    canMoveRight() {
        return this.canMoveTiles(this.#grid.groupByRowsReverse);   
    }

    canMoveTiles(cells) {
        if (this.#isMoving || !this.#isPlaying) return false;

        return cells.some(group => {
            return group.some((cell, index) => {
                if (index === 0) return false;
                if (cell.tile == null) return false;
                const toCell = group[index-1];
                return toCell.canAccept(cell);                
            });
        });  
    }

    slideTiles(cells) {
        this.#keyIsHandling = true;
        cells.map((group) => {
            for (let i=1; i<group.length; i++) {
                let fromCell = group[i];
                if (fromCell.tile == null) continue;
                let lastValidCell;
                for(let j=i-1; j>=0; j--) {
                    let toCell = group[j];
                    if(!toCell.canAccept(fromCell)) break;
                    lastValidCell = toCell;
                }
                if (lastValidCell != null) {
                    if (lastValidCell.tile != null) {
                        lastValidCell.mergeTile = fromCell.tile;    
                        //console.log("need merge", lastValidCell)
                    }
                    fromCell.moveTileTo(lastValidCell);
                }
            }
        });
    }
    
    processTilesStop() {
        this.#grid.cells.forEach((cell)=> {
            if(cell.destination) {
                let coorX = cell.destination.x * cell.width + cell.width / 2;
                let coorY = cell.destination.y * cell.width + cell.width / 2;
                let target = new Phaser.Math.Vector2(coorX, coorY);
                let distance = Phaser.Math.Distance.BetweenPoints(cell.destination.gameObj, target);
                if (distance < this.#TOLERANCE) {
                    cell.destination.body.reset(coorX, coorY);
                    cell.destination = null;
                }
            }
        });
    }

    checkTilesStopMoving() {
        return this.#grid.cells.some( (cell) => {
            return cell.destination != null;
        });
        //if (this.#isMoving) console.log("moving")
    }

    initGame() {
        this.#grid = new Grid(this, this.#N, this.#N, this.#EDGE_LEN);
        this.#grid.randomEmptyCell().addTile();
        this.#grid.randomEmptyCell().addTile();
    }

    processTilesMerging() {
        if (this.#isMoving) return;
        
        let needToMerge = this.#grid.cells.some((cell) => {
            if (cell.mergeTile) return true;
            return false;
        });
        if (needToMerge) {
            this.#grid.cells.map((cell) => {
                if (cell.mergeTile) {
                    let from = cell.mergeTile;
                    let to = cell.tile;
                    from.gameObj.destroy();
                    cell.mergeTile = null;
                    to.val *= 2;
                }
            });
        }
        
        this.#keyIsHandling = false;
        //console.log("need to merge", needToMerge);
    }

    checkGameOver() {
        if (!this.canMoveUp() && !this.canMoveDown() && !this.canMoveLeft() && !this.canMoveRight()) {
            //console.log("game over");
            this.#isPlaying = false;
            this.drawGameOver();
            // setTimeout(() => {
            //     this.scene.restart();
            // }, 3000);
        }
    }
    
    checkGameWin() {
        let win = this.#grid.cells.some( cell => {
            if(cell.tile) {
                return cell.tile.val === 2048;
            }
            return false;
        });
        if (win) {
            this.#isPlaying = false;
            this.drawGameWin();
            return true;
        }
        return false;
    }

    drawGameOver() {
        let width = this.#N * this.#EDGE_LEN;
        let greyBg = this.add.rectangle(0, 0, width, width, 0xa9a9a9, 0.8);
        greyBg.setOrigin(0, 0);
        let textColor = '#c51b7d';
        let textStrokeColor = '#F8F8FF'; // ghost white
        let textFont = 'Arial Black';
        let textObj = this.add.text(width/2, width/2, "GAME OVER",
            { fontFamily: textFont, fontSize: 50, color: textColor});
        textObj.setStroke(textStrokeColor, 5);
        textObj.setOrigin(0.5);
    }

    drawGameWin() {
        let width = this.#N * this.#EDGE_LEN;
        let greyBg = this.add.rectangle(0, 0, width, width, 0xa9a9a9, 0.8);
        greyBg.setOrigin(0, 0);
        let textColor = '#c51b7d';
        let textStrokeColor = '#F8F8FF'; // ghost white
        let textFont = 'Arial Black';
        let textObj = this.add.text(width/2, width/2, "YOU WIN",
            { fontFamily: textFont, fontSize: 50, color: textColor});
        textObj.setStroke(textStrokeColor, 5);
        textObj.setOrigin(0.5);
    }

    testFillBoard() {
        this.#grid = new Grid(this, this.#N, this.#N, this.#EDGE_LEN);
        for(let i=0; i<16; i++)
        {
            this.#grid.randomEmptyCell().addTile();
        }
    }
    
    testAssignXY() {
        this.#grid = new Grid(this, this.#N, this.#N, this.#EDGE_LEN);
        let XY = [
            [0, 0, 16], [1, 0, 2], [2, 0, 256], [3, 0, 16],
            [0, 1, 8], [1, 1, 128], [2, 1, 16], [3, 1, 32], 
            [0, 2, 16], [1, 2, 256], [2, 2, 1024], [3, 2, 4],
            [0, 3, 8], [1, 3, 16], [2, 3, 1024],/* [3, 3, 2]*/
        ];
        XY.map(p=>{
            let i = p[0] + p[1] * this.#N;
            this.#grid.cells[i].addTile();
            this.#grid.cells[i].tile.val = p[2];
        });
    }
}