"use strict";

class Piece {
    constructor(c, co) {
        this._color = c;
        this._coordinates = co;
    }

    set_coordinates(c) {
        this._coordinates = c;
    }

    color() {
        return this._color;
    }

    coordinates() {
        return this._coordinates;
    }

    equals(p) {
            if (p !== undefined)
            return !(p.coordinates().x() !== this._coordinates.x() || p.coordinates().y() !== this._coordinates.y() || p.color() !== this._color);

        return false;
    }

    clone() {
        return new Piece(this._color, this._coordinates);
    }


}

export default Piece;