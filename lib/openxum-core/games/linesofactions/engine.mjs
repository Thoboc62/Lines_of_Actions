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
        this._count_white_pawn = 12;
        this._count_black_pawn = 12;
        this._is_finished = false;
        this._winner_color = Color.NONE;
        this._initialize_board();
        //this._verifierPion();

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

        o._set(this._is_finished, this._winner_color, b);

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

        this._check_pawn_taken(move);
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

    equals(b1, b2) {

        for(let x = 0; x < 8; x++) {
            for(let y = 0; y < 8; y++) {
                let piece1 = b1._board[x][y];
                let piece2 = b2._board[x][y];

                if (piece1 !== undefined && !piece1.equals(piece2) || (piece2 !== undefined && !piece2.equals(piece1)))
                {
                    return false;
                }
            }
        }

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

    // private methods

    _set(isf, wc, b) {
        this._is_finished = isf;
        this._winner_color = wc;
        this._board = b;
    }

    _change_color() {
        this._color = (this._color === Color.WHITE) ? Color.BLACK : Color.WHITE;
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

    _possible_move_list_bottom(piece, moves, x_destination, y_destination, last_y, grid_size, place_found) {
        while(!place_found && y_destination < grid_size && y_destination < last_y && last_y <= grid_size) {
            let end_treatment = false;
            let next_y = parseInt(y_destination)+parseInt(1);

            //on vérifie si la case suivante est vide
            if(typeof this._board[x_destination][next_y] === "undefined") {
                if(next_y === last_y) {
                    y_destination = next_y;
                    place_found = true;
                    end_treatment = true;
                }
                else {
                    y_destination = next_y;
                    end_treatment = true;
                }
            }
            //ou si elle contient une couleur (number)
            else if(typeof this._board[x_destination][next_y] === "object" || typeof this._board[x_destination][next_y] === "number") {
                //on vérifie si un pion adverse coupe la route (on ne peut pas l'écraser car la distance à effectuer est plus grande)
                if(this._board[x_destination][next_y].color() !== piece.color() && next_y !== last_y && !end_treatment) {
                    end_treatment = true;
                }

                //on vérifie si on peut sauter le pion de couleur allié sur la case voisine, et qu'on peut encore se déplacer après
                if(this._board[x_destination][next_y].color() === piece.color() && next_y !== last_y && !end_treatment) {
                    y_destination = next_y;
                    end_treatment = true;
                }
                else {
                    //on vérifie si on peut écraser le pion adverse (y_suivant le plus loin possible)
                    if(this._board[x_destination][next_y].color() !== piece.color() && next_y === last_y && !end_treatment) {
                        place_found = true;
                        end_treatment = true;
                        y_destination = next_y;
                    }
                    else {
                        end_treatment = true;
                        place_found = true;
                        y_destination = piece.coordinates().y();
                    }
                }
            }
        }

        if(place_found && y_destination !== piece.coordinates().y()) {
            console.log("Destination possible en bas: (" + x_destination + "," + y_destination + ")");
            moves.push(new Move(piece.clone(), new Coordinates(x_destination, y_destination)));
        }
        else {
            console.log("Aucune position trouvée sur la ligne en bas.");
        }

    }

    _possible_move_list_top(piece, moves, x_destination, y_destination, last_y, place_found) {
        while(!place_found && y_destination > 0 && y_destination > last_y && last_y >= 0) {
            let end_treatment = false;
            let next_y = parseInt(y_destination)-parseInt(1);

            //on vérifie si la case suivante est vide
            if(typeof this._board[x_destination][next_y] === "undefined") {
                if(next_y === last_y) {
                    y_destination = next_y;
                    place_found = true;
                    end_treatment = true;
                }
                else {
                    y_destination = next_y;
                    end_treatment = true;
                }
            }
            //ou si elle contient une couleur (number)
            else if(typeof this._board[x_destination][next_y] === "object" || typeof this._board[x_destination][next_y] === "number") {
                //on vérifie si un pion adverse coupe la route (on ne peut pas l'écraser car la distance à effectuer est plus grande)
                if(this._board[x_destination][next_y].color() !== piece.color() && next_y !== last_y && !end_treatment) {
                    place_found = false;
                    end_treatment = true;
                }

                //on vérifie si on peut sauter le pion de couleur allié sur la case voisine, et qu'on peut encore se déplacer après
                if(this._board[x_destination][next_y].color() === piece.color() && next_y !== last_y && !end_treatment) {
                    y_destination = next_y;
                    end_treatment = true;
                }
                else {
                    //on vérifie si on peut écraser le pion adverse (y_suivant le plus loin possible)
                    if(this._board[x_destination][next_y].color() !== piece.color() && next_y === last_y && !end_treatment) {
                        place_found = true;
                        y_destination = next_y;
                        end_treatment = true;
                    }
                    else {
                        end_treatment = true;
                        place_found = true;
                        y_destination = piece.coordinates().y();
                    }
                }
            }
        }

        if(place_found && y_destination !== piece.coordinates().y()) {
            console.log("Destination possible en bas: (" + x_destination + "," + y_destination + ")");
            moves.push(new Move(piece.clone(), new Coordinates(x_destination, y_destination)));
        }
        else {
            console.log("Aucune position trouvée sur la ligne en haut.");
        }
    }

    _possible_move_list_left(piece, moves, x_destination, y_destination, last_x, place_found) {
        while(!place_found && x_destination > 0 && x_destination > last_x && last_x >= 0) {
            let end_treatment = false;
            let next_x= parseInt(x_destination)-parseInt(1);

            //on vérifie si la case suivante est vide
            if(typeof this._board[next_x][y_destination] === "undefined") {
                if(next_x === last_x) {
                    x_destination = next_x;
                    place_found = true;
                    end_treatment = true;
                }
                else {
                    x_destination = next_x;
                    end_treatment = true;
                }
            }
            //ou si elle contient une couleur (number)
            else if(typeof this._board[next_x][y_destination] === "object" || typeof this._board[next_x][y_destination] === "number") {
                //on vérifie si un pion adverse coupe la route (on ne peut pas l'écraser car la distance à effectuer est plus grande)
                if(this._board[next_x][y_destination].color() !== piece.color() && next_x !== last_x && !end_treatment) {
                    place_found = false;
                    end_treatment = true;
                }

                //on vérifie si on peut sauter le pion de couleur allié sur la case voisine, et qu'on peut encore se déplacer après
                if(this._board[next_x][y_destination].color() === piece.color() && next_x !== last_x && !end_treatment) {
                    x_destination = next_x;
                    end_treatment = true;
                }
                else {
                    //on vérifie si on peut écraser le pion adverse (y_suivant le plus loin possible)
                    if(this._board[next_x][y_destination].color() !== piece.color() && next_x === last_x && !end_treatment) {
                        place_found = true;
                        x_destination = next_x;
                        end_treatment = true;
                    }
                    else {
                        end_treatment = true;
                        place_found = true;
                        x_destination = piece.coordinates().x();
                    }
                }
            }
        }

        if(place_found && x_destination !== piece.coordinates().x()) {
            console.log("Destination possible à gauche: (" + x_destination + "," + y_destination + ")");
            moves.push(new Move(piece.clone(), new Coordinates(x_destination, y_destination)));
        }
        else {
            console.log("Aucune position trouvée sur la ligne à gauche.");
        }
    }

    _possible_move_list_right(piece, moves, x_destination, y_destination, last_x, grid_size, place_found) {
        while(!place_found && x_destination < grid_size && x_destination < last_x && last_x < grid_size) {
            let end_treatment = false;
            let next_x = parseInt(x_destination)+parseInt(1);

            //on vérifie si la case suivante est vide
            if(typeof this._board[next_x][y_destination] === "undefined") {
                if(next_x === last_x) {
                    x_destination = next_x;
                    place_found = true;
                    end_treatment = true;
                }
                else {
                    x_destination = next_x;
                    end_treatment = true;
                }
            }
            //ou si elle contient une couleur (number)
            else if(typeof this._board[next_x][y_destination] === "object" || typeof this._board[next_x][y_destination] === "number") {
                //on vérifie si un pion adverse coupe la route (on ne peut pas l'écraser car la distance à effectuer est plus grande)
                if(this._board[next_x][y_destination].color() !== piece.color() && next_x !== last_x && !end_treatment) {
                    place_found = false;
                    end_treatment = true;
                }

                //on vérifie si on peut sauter le pion de couleur allié sur la case voisine, et qu'on peut encore se déplacer après
                if(this._board[next_x][y_destination].color() === piece.color() && next_x !== last_x && !end_treatment) {
                    x_destination = next_x;
                    end_treatment = true;
                }
                else {
                    //on vérifie si on peut écraser le pion adverse (y_suivant le plus loin possible)
                    if(this._board[next_x][y_destination].color() !== piece.color() && next_x === last_x && !end_treatment) {
                        place_found = true;
                        x_destination = next_x;
                        end_treatment = true;
                    }
                    else {
                        end_treatment = true;
                        place_found = true;
                        x_destination = piece.coordinates().x();
                    }

                }
            }
        }

        if(place_found && x_destination !== piece.coordinates().x()) {
            console.log("Destination possible à droite: (" + x_destination + "," + y_destination + ")");
            moves.push(new Move(piece.clone(), new Coordinates(x_destination, y_destination)));
        }
        else {
            console.log("Aucune position trouvée sur la ligne à droite.");
        }
    }

    _possible_move_list_top_left(piece, moves, x_destination, y_destination, last_x, last_y, place_found) {
        while(!place_found && x_destination > 0 && x_destination > last_x && last_x >= 0 && y_destination > 0
        && y_destination > last_y && last_y >= 0) {
            let end_treatment = false;
            let next_x= parseInt(x_destination)-parseInt(1);
            let next_y = parseInt(y_destination)-parseInt(1);

            //on vérifie si la case suivante est vide
            if(typeof this._board[next_x][next_y] === "undefined") {
                if(next_x === last_x || next_y === last_y) {
                    x_destination = next_x;
                    y_destination = next_y;
                    place_found = true;
                    end_treatment = true;
                }
                else {
                    x_destination = next_x;
                    y_destination = next_y;
                    end_treatment = true;
                }
            }

            //ou si elle contient une couleur (number)
            else if(typeof this._board[next_x][next_y] === "object" || typeof this._board[next_x][next_y] === "number") {

                //on vérifie si un pion adverse coupe la route (on ne peut pas l'écraser car la distance à effectuer est plus grande)
                if(this._board[next_x][next_y].color() !== piece.color() && next_x !== last_x && next_y !== last_y && !end_treatment) {
                    place_found = false;
                    end_treatment = true;
                }

                //on vérifie si on peut sauter le pion de couleur allié sur la case voisine, et qu'on peut encore se déplacer après
                if(this._board[next_x][next_y].color() === piece.color() && (next_x !== last_x && next_y !== last_y) && !end_treatment) {
                    x_destination = next_x;
                    y_destination = next_y;
                    end_treatment = true;
                }
                else {

                    //on vérifie si on peut écraser le pion adverse (y_suivant le plus loin possible)
                    if(this._board[next_x][next_y].color() !== piece.color() && (next_x === last_x || next_y === last_y) && !end_treatment) {
                        place_found = true;
                        x_destination = next_x;
                        y_destination = next_y;
                        end_treatment = true;
                    }
                    else { //le pion a la place la plus lointaine est un pion allié, on ne peut pas l'écraser
                        end_treatment = true;
                        place_found = true;
                        x_destination = piece.coordinates().x();
                        y_destination = piece.coordinates().y();
                    }
                }
            }
        }

        if(place_found && x_destination !== piece.coordinates().x() && y_destination !== piece.coordinates().y()) {
            console.log("Destination possible en haut à gauche: (" + x_destination + "," + y_destination + ")");
            moves.push(new Move(piece.clone(), new Coordinates(x_destination, y_destination)));
        }
        else {
            console.log("Aucune position trouvée en haut à gauche.");
        }
    }


    _possible_move_list_bottom_right(piece, moves, x_destination, y_destination, last_x, last_y, grid_size, place_found) {
        while(!place_found && x_destination < grid_size && x_destination < last_x && last_x < grid_size && y_destination < grid_size
        && y_destination < last_y && last_y < grid_size) {
            let end_treatment = false;
            let next_x= parseInt(x_destination)+parseInt(1);
            let next_y = parseInt(y_destination)+parseInt(1);

            //on vérifie si la case suivante est vide
            if(typeof this._board[next_x][next_y] === "undefined") {
                if(next_x === last_x || next_y === last_y) {
                    x_destination = next_x;
                    y_destination = next_y;
                    place_found = true;
                    end_treatment = true;
                }
                else {
                    x_destination = next_x;
                    y_destination = next_y;
                    end_treatment = true;
                }
            }

            //ou si elle contient une couleur (number)
            else if(typeof this._board[next_x][next_y] === "object" || typeof this._board[next_x][next_y] === "number") {

                //on vérifie si un pion adverse coupe la route (on ne peut pas l'écraser car la distance à effectuer est plus grande)
                if(this._board[next_x][next_y].color() !== piece.color() && next_x !== last_x && next_y !== last_y && !end_treatment) {
                    place_found = false;
                    end_treatment = true;
                }

                //on vérifie si on peut sauter le pion de couleur allié sur la case voisine, et qu'on peut encore se déplacer après
                if(this._board[next_x][next_y].color() === piece.color() && (next_x !== last_x && next_y !== last_y) && !end_treatment) {
                    x_destination = next_x;
                    y_destination = next_y;
                    end_treatment = true;
                }
                else {

                    //on vérifie si on peut écraser le pion adverse (y_suivant le plus loin possible)
                    if(this._board[next_x][next_y].color() !== piece.color() && (next_x === last_x || next_y === last_y) && !end_treatment) {
                        place_found = true;
                        x_destination = next_x;
                        y_destination = next_y;
                        end_treatment = true;
                    }
                    else { //le pion a la place la plus lointaine est un pion allié, on ne peut pas l'écraser
                        end_treatment = true;
                        place_found = true;
                        x_destination = piece.coordinates().x();
                        y_destination = piece.coordinates().y();
                    }
                }
            }
        }

        if(place_found && x_destination !== piece.coordinates().x() && y_destination !== piece.coordinates().y()) {
            console.log("Destination possible en bas à droite: (" + x_destination + "," + y_destination + ")");
            moves.push(new Move(piece.clone(), new Coordinates(x_destination, y_destination)));
        }
        else {
            console.log("Aucune position trouvée en bas à droite.");
        }
    }

    _possible_move_list_bottom_left(piece, moves, x_destination, y_destination, last_x, last_y, grid_size, place_found) {
        while(!place_found && x_destination > 0 && x_destination > last_x && last_x >= 0 && y_destination < grid_size
        && y_destination < last_y && last_y < grid_size) {
            let end_treatment = false;
            let next_x= parseInt(x_destination)-parseInt(1);
            let next_y = parseInt(y_destination)+parseInt(1);

            //on vérifie si la case suivante est vide
            if(typeof this._board[next_x][next_y] === "undefined") {
                if(next_x === last_x || next_y === last_y) {
                    x_destination = next_x;
                    y_destination = next_y;
                    place_found = true;
                    end_treatment = true;
                }
                else {
                    x_destination = next_x;
                    y_destination = next_y;
                    end_treatment = true;
                }
            }

            //ou si elle contient une couleur (number)
            else if(typeof this._board[next_x][next_y] === "object" || typeof this._board[next_x][next_y] === "number") {

                //on vérifie si un pion adverse coupe la route (on ne peut pas l'écraser car la distance à effectuer est plus grande)
                if(this._board[next_x][next_y].color() !== piece.color() && next_x !== last_x && next_y !== last_y && !end_treatment) {
                    place_found = false;
                    end_treatment = true;
                }

                //on vérifie si on peut sauter le pion de couleur allié sur la case voisine, et qu'on peut encore se déplacer après
                if(this._board[next_x][next_y].color() === piece.color() && (next_x !== last_x && next_y !== last_y) && !end_treatment) {
                    x_destination = next_x;
                    y_destination = next_y;
                    end_treatment = true;
                }
                else {

                    //on vérifie si on peut écraser le pion adverse (y_suivant le plus loin possible)
                    if(this._board[next_x][next_y].color() !== piece.color() && (next_x === last_x || next_y === last_y) && !end_treatment) {
                        place_found = true;
                        x_destination = next_x;
                        y_destination = next_y;
                        end_treatment = true;
                    }
                    else { //le pion a la place la plus lointaine est un pion allié, on ne peut pas l'écraser
                        end_treatment = true;
                        place_found = true;
                        x_destination = piece.coordinates().x();
                        y_destination = piece.coordinates().y();
                    }
                }
            }
        }

        if(place_found && x_destination !== piece.coordinates().x() && y_destination !== piece.coordinates().y()) {
            console.log("Destination possible en bas à gauche: (" + x_destination + "," + y_destination + ")");
            moves.push(new Move(piece.clone(), new Coordinates(x_destination, y_destination)));
        }
        else {
            console.log("Aucune position trouvée en bas à gauche.");
        }
    }

    _possible_move_list_top_right(piece, moves, x_destination, y_destination, last_x, last_y, grid_size, place_found) {
        while(!place_found && x_destination < grid_size && x_destination < last_x && last_x < grid_size && y_destination > 0
        && y_destination > last_y && last_y >= 0) {
            let end_treatment = false;
            let next_x= parseInt(x_destination)+parseInt(1);
            let next_y = parseInt(y_destination)-parseInt(1);

            //on vérifie si la case suivante est vide
            if(typeof this._board[next_x][next_y] === "undefined") {
                if(next_x === last_x || next_y === last_y) {
                    x_destination = next_x;
                    y_destination = next_y;
                    place_found = true;
                    end_treatment = true;
                }
                else {
                    x_destination = next_x;
                    y_destination = next_y;
                    end_treatment = true;
                }
            }

            //ou si elle contient une couleur (number)
            else if(typeof this._board[next_x][next_y] === "object" || typeof this._board[next_x][next_y] === "number") {

                //on vérifie si un pion adverse coupe la route (on ne peut pas l'écraser car la distance à effectuer est plus grande)
                if(this._board[next_x][next_y].color() !== piece.color() && next_x !== last_x && next_y !== last_y && !end_treatment) {
                    place_found = false;
                    end_treatment = true;
                }

                //on vérifie si on peut sauter le pion de couleur allié sur la case voisine, et qu'on peut encore se déplacer après
                if(this._board[next_x][next_y].color() === piece.color() && (next_x !== last_x && next_y !== last_y) && !end_treatment) {
                    x_destination = next_x;
                    y_destination = next_y;
                    end_treatment = true;
                }
                else {

                    //on vérifie si on peut écraser le pion adverse (y_suivant le plus loin possible)
                    if(this._board[next_x][next_y].color() !== piece.color() && (next_x === last_x || next_y === last_y) && !end_treatment) {
                        place_found = true;
                        x_destination = next_x;
                        y_destination = next_y;
                        end_treatment = true;
                    }
                    else { //le pion a la place la plus lointaine est un pion allié, on ne peut pas l'écraser
                        end_treatment = true;
                        place_found = true;
                        x_destination = piece.coordinates().x();
                        y_destination = piece.coordinates().y();
                    }
                }
            }
        }

        if(place_found && x_destination !== piece.coordinates().x() && y_destination !== piece.coordinates().y()) {
            console.log("Destination possible en haut à droite: (" + x_destination + "," + y_destination + ")");
            moves.push(new Move(piece.clone(), new Coordinates(x_destination, y_destination)));
        }
        else {
            console.log("Aucune position trouvée en haut à droite.");
        }
    }

    _get_possible_move_list(piece) {

        let moves = [];
        let x_destination = piece.coordinates().x(); let y_destination = piece.coordinates().y();
        let last_x; let last_y;
        let grid_size = 8; parseInt(grid_size);

        //POSITION POSSIBLE EN BAS
        last_y = parseInt(piece.coordinates().y()) + parseInt(this._count_nb_pieces_line(x_destination));
        this._possible_move_list_bottom(piece, moves, x_destination, y_destination, last_y, grid_size, false);

        //POSITION POSSIBLE EN HAUT
        last_y = parseInt(piece.coordinates().y()) - parseInt(this._count_nb_pieces_line(x_destination));
        this._possible_move_list_top(piece, moves, x_destination, y_destination, last_y, false);

        //POSITION POSSIBLE A DROITE
        last_x = parseInt(piece.coordinates().x()) + parseInt(this._count_nb_pieces_column(y_destination));
        this._possible_move_list_right(piece, moves, x_destination, y_destination, last_x, grid_size, false);

        //POSITION POSSIBLE A GAUCHE
        last_x = parseInt(piece.coordinates().x()) - parseInt(this._count_nb_pieces_column(y_destination));
        this._possible_move_list_left(piece, moves, x_destination, y_destination, last_x, false);

        //POSITION POSSIBLE A EN HAUT A GAUCHE
        last_x = parseInt(piece.coordinates().x()) - parseInt(this._count_top_left_bottom_right(piece));
        last_y = parseInt(piece.coordinates().y()) - parseInt(this._count_top_left_bottom_right(piece));
        this._possible_move_list_top_left(piece, moves, x_destination, y_destination, last_x, last_y, false);

        //POSITION POSSIBLE A EN BAS A DROITE
        last_x = parseInt(piece.coordinates().x()) + parseInt(this._count_top_left_bottom_right(piece));
        last_y = parseInt(piece.coordinates().y()) + parseInt(this._count_top_left_bottom_right(piece));
        this._possible_move_list_bottom_right(piece, moves, x_destination, y_destination, last_x, last_y, grid_size, false);

        //POSITION POSSIBLE A EN BAS A GAUCHE
        last_x = parseInt(piece.coordinates().x()) - parseInt(this._count_bottom_left_top_right(piece));
        last_y = parseInt(piece.coordinates().y()) + parseInt(this._count_bottom_left_top_right(piece));
        this._possible_move_list_bottom_left(piece, moves, x_destination, y_destination, last_x, last_y, grid_size, false);

        //POSITION POSSIBLE A EN HAUT A DROITE
        last_x = parseInt(piece.coordinates().x()) + parseInt(this._count_bottom_left_top_right(piece));
        last_y = parseInt(piece.coordinates().y()) - parseInt(this._count_bottom_left_top_right(piece));
        this._possible_move_list_top_right(piece, moves, x_destination, y_destination, last_x, last_y, grid_size, false);

        return moves;

    }

    _initialize_board() {
        this._board = new Array(8);

        for (let i = 0; i < 8; i++) {
            this._board[i] = new Array(8);
        }

        for(let i = 1; i < 7; i++) {
            this._board[i][0] = new Piece(Color.BLACK, false, new Coordinates(i, 0));
            this._board[i][7] = new Piece(Color.BLACK, false, new Coordinates(i, 7));
            this._board[7][i] = new Piece(Color.WHITE, false, new Coordinates(7, i));
            this._board[0][i] = new Piece(Color.WHITE, false, new Coordinates(0, i));

        }

        this.show_board();

    }

    _count_nb_pieces_column(y) {
        let nbPions = 0;
        for(let x=0; x<8; ++x) {
            let piece=this._board[x][y];
            if(typeof piece !== "undefined") {
                nbPions = nbPions +1;
            }
        }
        return nbPions;
    }

    _count_nb_pieces_line(x) {
        let nbPions = 0;
        for(let y=0; y<8; ++y) {
            let piece=this._board[x][y];
            if(typeof piece !== "undefined") {
                nbPions = nbPions +1;
            }
        }
        return nbPions;
    }


    _count_top_left_bottom_right(piece){
        //copie position initiale
        let x=parseInt(piece.coordinates().x());
        let y=parseInt(piece.coordinates().y());
        let startPositionX =x;
        let startPositionY =y;
        //compteur de pions
        let count = 0;
        //compteur vers le haut ou bas
        let down = true;

        while (x >= 0 && x<8 && y >= 0 && y <8 && down){
            let piece1 = this._board[x][y];
            if (typeof piece1 !== "undefined") {
                count=count + 1;
            }
            x=x+1;
            y=y+1;
        }

        x=startPositionX;
        y=startPositionY;
        down=false;

        while (x >= 0 && x<8 && y >= 0 && y <8 && !down){
            let piece2 = this._board[x][y];
            if (typeof piece2 !== "undefined") {
                ++count;
            }
            x=x-1;
            y=y-1;
        }

        count=count-1;
        console.log("diagonale descentante :"+count);
        return count;
    }

    _count_bottom_left_top_right(piece){
        //copie position initiale
        let x=parseInt(piece.coordinates().x());
        let y=parseInt(piece.coordinates().y());
        let startPositionX =x;
        let startPositionY =y;
        //compteur de pions
        let count = 0;
        //compteur vers le haut ou bas
        let down = true;

        while (x >= 0 && x<8 && y >= 0 && y <8 && down){
            let piece1 = this._board[x][y];
            if (typeof piece1 !== "undefined") {
                count=count+1;
            }
            x=x-1;
            y=y+1;
        }

        x=startPositionX;
        y=startPositionY;
        down=false;

        while (x >= 0 && x<8 && y >= 0 && y <8 && !down){
            let piece2 = this._board[x][y];
            if (typeof piece2 !== "undefined") {
                count=count+1;
            }
            x=x+1;
            y=y-1;
        }
        //decrementation meme case
        count=count-1;
        console.log("diagonale montante:"+count);
        return count;
    }



}

export default Engine;