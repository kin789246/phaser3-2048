import Cell from './cell.js'

export default class Grid {
    #cells = [];
    #scene;
    #row;
    #column;
    #width;
    
    get gridIsFull() {
        return this.#emptyCells.length === 0;
    }

    get cells() {
        return this.#cells;
    }

    get #emptyCells() {
        return this.#cells.filter(c => c.tile == null );
    }

    // slide up
    get groupByColumns() {
        return this.#cells.reduce((gridCells, cell) => {
            gridCells[cell.x] = gridCells[cell.x] || [];
            gridCells[cell.x][cell.y] = cell;
            return gridCells;
        }, []);
    }
    
    // slide left
    get groupByRows() {
        return this.#cells.reduce((gridCells, cell) => {
            gridCells[cell.y] = gridCells[cell.y] || [];
            gridCells[cell.y][cell.x] = cell;
            return gridCells;
        }, []);
    }

    // slide down
    get groupByColumnsReverse() {
        return this.groupByColumns.map(column => [...column].reverse());
    }

    // slide right
    get groupByRowsReverse() {
        return this.groupByRows.map(row => [...row].reverse());
    }

    constructor(scene, r, c, w) {
        this.#scene = scene;
        this.#row = r;
        this.#column = c;
        this.#width = w;
        for (let y=0; y<this.#row; y++) {
            for (let x=0; x<this.#column; x++) {
                let cell = new Cell(this.#scene, x, y, this.#width);
                this.#cells.push(cell);
            }
        }    
    }

    randomEmptyCell() {
        let empty = this.#emptyCells;
        if (empty.length === 0) {
            //console.log("grid is full");
            return;
        }
        let rnd = Math.floor(Math.random() * empty.length);

        return empty[rnd];
    }
}