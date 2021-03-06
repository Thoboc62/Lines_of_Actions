"use strict";

import Color from './color.mjs';
import Coordinates from './coordinates.mjs';
import Piece from './piece.mjs';

class Move {
    constructor(p, t) {
        this._piece = p;
        this._to = t;
        //this._pawnsTaken = [];
    }

    // public methods

    piece() {
        return this._piece;
    }

    from() {
        return this._piece.coordinates();
    }

    to() {
        return this._to;
    }

    get() {
        return (this._piece.color() === Color.WHITE) ? 'W' : 'B' + this._piece.coordinates().to_string() + this._to.to_string();
    }

    parse(str) {
        let color = Color.NONE;
        if (str.charAt(0) === 'W') {
            color = Color.WHITE;
        }
        else if (str.charAt(0) === 'B'){
            color = Color.BLACK;
        }

        let coords = str.split(/[()]+/).filter(function(e) { return e; });

        this._to = new Coordinates(parseInt(coords[2].split(',')[0]), parseInt(coords[2].split(',')[1]));
        this._color = color;
        this._piece = new Piece(color, new Coordinates(parseInt(coords[1].split(',')[0]), parseInt(coords[1].split(',')[1])));
    }

    to_string() {
        return 'move' +  (((this._piece.color() === Color.WHITE) ? " white pawn" : " black pawn")) + " from " + this._piece.coordinates().to_string() + " to " + this._to.to_string();
    }
}

export default Move;