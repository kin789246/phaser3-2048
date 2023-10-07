import "phaser"

export default class Tile {
    #scene;
    #x;
    #y;
    #val;
    #width;
    #gameObj;
    #textObj;
    #squareObj;
    #strokeColor = 0xefc53f;
    #textColor = '#c51b7d';
    #textStrokeColor = '#F8F8FF'; // ghost white
    #textFont = 'Arial Black';
    #textSize = {
        2: 60,
        4: 60,
        8: 60,
        16: 48,
        32: 48,
        64: 48,
        128: 34,
        256: 34,
        512: 34,
        1024: 28,
        2048: 28
    };
    #tileColor = {
        2: 0x8A2BE2, // blue violet
        4: 0x6495ED, // cornflower blue
        8: 0x008B8B, // dark cyan
        16: 0xA9A9A9, // dark grey
        32: 0x2F4F4F, // dark slate grey
        64: 0x00BFFF, // deep sky blue
        128: 0x1E90FF, // dodger blue
        256: 0x696969, // dim grey
        512: 0x00CED1, // dark turquoise
        1024: 0x483D8B, // dark slate blue
        2048: 0x8FBC8F  // dark sea green
    };
    get x() {
        return this.#x;
    }
    
    set x(v) {
        this.#x = v;
    }

    get y() {
        return this.#y;
    }

    set y(v) {
        this.#y = v;
    }

    set val(v) {
        this.#val = v;
        this.#textObj.setText(v);
        this.#textObj.setFontSize(this.#textSize[this.#val]);
        this.#squareObj.setFillStyle(this.#tileColor[this.#val]);
    }
    
    get val() {
        return this.#val;
    }

    get gameObj() {
        return this.#gameObj;
    }

    get body() {
        return this.#gameObj.body;
    }

    constructor(scene, x, y, width, val = Math.random() > 0.6 ? 4 : 2) {
        this.#scene = scene;
        this.#x = x;
        this.#y = y;
        this.#val = val;
        this.#width = width;
        
        this.#squareObj = this.#scene.add.rectangle(0, 0, this.#width, this.#width, this.#tileColor[this.#val]);
        this.#squareObj.setStrokeStyle(2, this.#strokeColor);

        this.#textObj = this.#scene.add.text(0, 0, this.#val,
            { fontFamily: this.#textFont, fontSize: this.#textSize[this.#val], color: this.#textColor});
        this.#textObj.setStroke(this.#textStrokeColor, 5);
        this.#textObj.setOrigin(0.5);

        let coorX = this.#x * this.#width + this.#width / 2;
        let coorY = this.#y * this.#width + this.#width / 2;
        this.#gameObj = this.#scene.add.container(coorX, coorY, [this.#squareObj, this.#textObj]);
        this.#gameObj.setSize(this.#width, this.#width);
        this.#scene.physics.add.existing(this.#gameObj);
        // this.#gameObj.body.collideWorldBounds = true;
    }
}