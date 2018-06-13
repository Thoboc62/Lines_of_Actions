"use strict";

import OpenXum from '../../openxum/engine.mjs';
import Coordinates from './coordinates.mjs';
import Piece from './piece.mjs';
import Color from './color.mjs';
import Move from './move.mjs';

class Engine extends OpenXum.Engine {
    constructor(t, c) {
        super();

        this._type = t;
        this._color = c;
        this._current_round = 0;
        this._count_white_pawn = 12;
        this._count_black_pawn = 12;
        this._is_finished = false;
        this._winner_color = Color.NONE;
        this._initialize_board();

    }

    // public methods
    apply_moves(moves) {

    }

    clone() {
        let o = new Engine(this._type, this._color);
        let b = new Array(8);
        
        for(let i = 0; i < 8; i++) {
            b[i] = new Array(8);
        }

        for(let x = 0; x < 8; x++) {
            for(let y = 0; y < 8; y++) {
                if (this._board[x][y] !== undefined) {
                    b[x][y] = this._board[x][y].clone();
                }
            }
        }

        o._set(this._is_finished, this._winner_color, b, this._king);

        return o;
    }

    current_color() {
        return this._color;
    }

    get_name() {
        return 'LinesOfActions';
    }

    get_possible_move_list() {
        let moves = [];

        for(let x = 0; x < 8; x++) {
            for(let y = 0; y < 8; y++) {
                if (this._board[x][y] !== undefined) {
                    moves = moves.concat(this._get_possible_move_list(this._board[x][y]));
                }
            }
        }

        return moves;
    }

    get_type() {
        return this._type;
    }

    is_finished() {
        return this._is_finished;
    }

    move(move) {
        let fromX = move.from().x();
        let fromY = move.from().y();

        let piece = move.piece().clone();
        piece.set_coordinates(move.to());

        this._board[move.to().x()][move.to().y()] = piece;
        this._board[fromX][fromY] = undefined;

        this._check_winner();

        if (!this.is_finished()) {
            this._change_color();
        }
    }

    parse(str) {
        // TODO
    }

    to_string() {
        // TODO
    }

    winner_is() {
        return this._winner_color;
    }

    get_opponent_piece_next_to(piece, direction) {
        let x = piece.coordinates().x();
        let y = piece.coordinates().y();
        let op_piece = undefined;
        
        switch(direction) {
            // TOP
            case 0:
                if (y > 0) {
                    op_piece = this._board[x][y - 1];
                }
                break;

            // BOTTOM
            case 1:
                if (y < 10) {
                    op_piece = this._board[x][y + 1];
                }
                break;

            // RIGHT
            case 2:
                if (x < 10) {
                    op_piece = this._board[x + 1][y];
                }
                break;

            // LEFT
            case 3:
                if (x > 0) {
                    op_piece = this._board[x - 1][y];
                }
                break;
        }

        if (op_piece !== undefined && op_piece.color() === piece.color())
        {
            op_piece = undefined;
        }

        return op_piece;
    }

    get_count_black_pawn() {
        return this._count_black_pawn;
    }

    get_count_white_pawn() {
        return this._count_white_pawn;
    }

    get_distance_to(c1, c2) {
        return Math.abs(c1.x() - c2.x()) + Math.abs(c1.y() - c2.y());
    }

    equals(b1, b2) {
        
        for(let x = 0; x < 11; x++) {
            for(let y = 0; y < 11; y++) {
                let piece1 = b1._board[x][y];
                let piece2 = b2._board[x][y];

                if (piece1 !== undefined && !piece1.equals(piece2) || (piece2 !== undefined && !piece2.equals(piece1)))
                {
                    return false;
                }
            }
        }

        if (!b1.get_king().equals(b2.get_king())) return false;
        if (b1.is_finished() !== b2.is_finished()) return false;

        return true;
    }

    show_board() {
        console.log(" ");
        for(let x = 0; x < 8; x++) {
            let text = "";
            for(let y = 0; y < 8; y++) {
                let piece = this._board[x][y];

                if (piece === undefined) text += "*";
                else if (piece.color() === Color.WHITE) text +="W";
                else if (piece.color() === Color.BLACK) text += "B";
            }
            
            console.log(text);
        }
    }

    undo_move(move) {
        let pawns_taken = move.get_pawns_taken();

        this._board[move.to().x()][move.to().y()] = undefined;
        this._board[move.from().x()][move.from().y()] = move.piece();

        if (move.piece().isKing()) {
            this._king = move.piece();
        }

        for(let i = 0; i < pawns_taken.length; i++) {
            let piece = pawns_taken[i];
            this._board[piece.coordinates().x()][piece.coordinates().y()] = piece;

            if (piece.color() === Color.WHITE) {
                this._count_white_pawn++;
            }
            else {
                this._count_black_pawn++;
            }
        }

        this._winner_color = Color.NONE;
        this._is_finished = false;

        this._change_color();
    }

    // private methods

    _set(isf, wc, b, k) {
        this._is_finished = isf;
        this._winner_color = wc;
        this._board = b;
        this._king = k;
    }

    _change_color() {
        this._color = (this._color === Color.WHITE) ? Color.BLACK : Color.WHITE;
    }

    _check_winner() {
        let whiteWins = this._board[0][0] !== undefined || 
                        this._board[10][0] !== undefined || 
                        this._board[0][10] !== undefined || 
                        this._board[10][10] !== undefined;

        let blackWins = true;

        for(let d = 0; d < 4; d ++) {
            if (this.get_opponent_piece_next_to(this._king, d) === undefined) {
                blackWins = false;
                break;
            }
        }

        if (this._color === Color.BLACK) {
            this._change_color();
            if (this.get_possible_move_list().length === 0) {
                blackWins = true;
            }
            this._change_color();
        }
        else {
            this._change_color();
            if (this.get_possible_move_list().length === 0) {
                whiteWins = true;
            }
            this._change_color();
        }

        if (blackWins) {
            this._winner_color = Color.BLACK;
            this._is_finished = true;
        }
        else if (whiteWins) {
            this._winner_color = Color.WHITE;
            this._is_finished = true;
        }
        else {
            this._winner_color = Color.NONE;
            this._is_finished = false;
        }
    }

    _verify_moving(piece, x, y) {
        let possible_moves = this._get_possible_move_list(piece);
        let val = false;

        possible_moves.forEach(function(move) {
            if (move.to().x() === x && move.to().y() === y) {
                val = true;
            }
        });

        return val;
    }

    _get_possible_move_list(piece) {
        let moves = [];

        if (piece.color() === this._color) {
            let pc = piece.coordinates();

            // Right
            if (pc.x() < 7) {
                for(let x = 1; x < (8 - pc.x()); x++) {
                    if (this._board[pc.x() + x][pc.y()] === undefined) {
                            moves.push(new Move(piece.clone(), new Coordinates(pc.x() + x, pc.y())));
                    }
                    else {
                        break;
                    }
                }
            }

            // Left
            if (pc.x() > 0) {
                for(let x = 1; x < pc.x() + 1; x++) {
                    if (this._board[pc.x() - x][pc.y()] === undefined) {
                            moves.push(new Move(piece.clone(), new Coordinates(pc.x() - x, pc.y())));
                    }
                    else {
                        break;
                    }
                }
            }

            // Top
            if (pc.y() > 0) {
                for(let y = 1; y < pc.y() + 1; y++) {
                    if (this._board[pc.x()][pc.y() - y] === undefined) {
                            moves.push(new Move(piece.clone(), new Coordinates(pc.x(), pc.y() - y)));
                    }
                    else {
                        break;
                    }
                }
            }

            // Bottom
            if (pc.y() < 7) {
                for(let y = 1; y < (8 - pc.y()); y++) {
                    if (this._board[pc.x()][pc.y() + y] === undefined) {
                            moves.push(new Move(piece.clone(), new Coordinates(pc.x(), pc.y() + y)));
                    }
                    else {
                        break;
                    }
                }
            }
        }

        return moves;
    }

    _initialize_board() {
        this._board = new Array(8);

        for (let i = 0; i < 8; i++) {
            this._board[i] = new Array(8);
        }

        for(let i = 1; i < 7; i++) {
            this._board[i][0] = new Piece(Color.WHITE, false, new Coordinates(i, 0));
            this._board[i][7] = new Piece(Color.WHITE, false, new Coordinates(i, 7));
            this._board[7][i] = new Piece(Color.BLACK, false, new Coordinates(7, i));
            this._board[0][i] = new Piece(Color.BLACK, false, new Coordinates(0, i));

        }

        this.show_board();

    }
}

export default Engine;