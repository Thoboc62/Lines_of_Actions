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
        this._verifierPion();

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
                let piece = this._board[y][x];

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

    _get_possible_move_list(piece) {
        let moves = [];

        let x_destination = piece.coordinates().x();
        let y_destination = piece.coordinates().y();
        let dernier_y = parseInt(piece.coordinates().y()) + parseInt(this._compterPionsLigne(x_destination));
        let taille_grille = 8;
        parseInt(x_destination); parseInt(y_destination); parseInt(dernier_y); parseInt(taille_grille);
        let place_trouvee = false;

        console.log("place_trouvee: " + place_trouvee);
        console.log("y_destination: " + y_destination);
        console.log("taille_grille: " + taille_grille);
        console.log("dernier_y: " + dernier_y);
        while(!place_trouvee && y_destination < taille_grille && y_destination < dernier_y) {
            console.log("***** ENTREE DANS LA BOUCLE *****");
            let y_suivant = parseInt(y_destination)+parseInt(1);

            /* TESTS */

            console.log("y_destination: " + y_destination);
            console.log("type case suivante " + typeof this._board[x_destination][y_suivant]);


            //on vérifie si la case suivante est vide
            if(typeof this._board[x_destination][y_suivant] === "undefined") {
                y_destination = y_suivant;
                place_trouvee = false;
                console.log("Case suivante vide");
                if(y_suivant === dernier_y) {
                    y_destination = y_suivant;
                    place_trouvee = true;
                    break;
                }
                else {
                    continue;
                }
            }
            //ou si elle contient une couleur (number)
            else if(typeof this._board[x_destination][y_suivant] === "object" || typeof this._board[x_destination][y_suivant] === "number") {
                console.log("Case suivante contient un pion");
                //on vérifie si un pion adverse coupe la route (on ne peut pas l'écraser car la distance à effectuer est plus grande)
                if(this._board[x_destination][y_suivant].color() !== piece.color() && y_suivant !== dernier_y) {
                    console.log("Un adversaire coupe la route");
                    place_trouvee = true;
                    break;
                }

                //on vérifie si on peut sauter le pion de couleur allié sur la case voisine, et qu'on peut encore se déplacer après
                if(this._board[x_destination][y_suivant].color() === piece.color() && y_suivant !== dernier_y) {
                    console.log("On peut passer au dessus du pion allié suivant");
                    y_destination = y_suivant;
                    continue;
                }

                //on vérifie si on peut écraser le pion adverse (y_suivant le plus loin possible)
                if(this._board[x_destination][y_suivant].color() !== piece.color() && y_suivant === dernier_y) {
                    console.log("On peut écraser le pion adverse");
                    place_trouvee = true;
                    y_destination = y_suivant;
                    break;
                }
            }
            //y_destination = y_suivant;
        }

        if(place_trouvee === true && y_destination !== piece.coordinates().y()) {
            console.log("Destination possible: (" + x_destination + "," + y_destination + ")");
            moves.push(new Move(piece.clone(), new Coordinates(x_destination, y_destination)));
        }
        else {
            console.log("Aucune position trouvée sur la ligne à droite.");
        }


/*
                while(y_destination+1 < taille_grille
                    && y_destination+1 <= piece.coordinates().y()+ this._compterPionsLigne(piece.coordinates().x())) {

                    //si le dernier mouvement possible tombe sur un pion ennemi
                    if(y_destination+1 === piece.coordinates().y()+this._compterPionsLigne(piece.coordinates().x())
                        && this._board[piece.coordinates().x()][y_destination+1]._color() !== piece.color()
                    ) {
                        console.log("y_destination: " + y_destination);
                    }
                }*/

                /*
                while(y_destination+1 < taille_grille &&
                    (this._board[x_destination][y_destination+1].color()===piece.color()
                        || typeof this._board[x_destination][y_destination+1]==="undefined"
                    )
                    && y_destination+1 <= piece.coordinates().y()+ this._compterPionsLigne(piece.coordinates().x())) {

                    if((y_destination === piece.coordinates().y() + this._compterPionsLigne(x_destination))
                        && (piece.color() !== this._board[x_destination][y_destination+1].color())) {
                        ++y_destination;
                        console.log("y_destination: " + y_destination);
                    }
                }

                if(piece.coordinates().y() !== y_destination) {
                    console.log("Destination possible: (" + x_destination + "," + y_destination + ")");
                    moves.push(new Move(piece.clone(), new Coordinates(x_destination, y_destination)));
                }

                */

        return moves;
        /*if (piece.color() === this._color) {
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
        }*/
    }

    _initialize_board() {
        this._board = new Array(8);

        for (let i = 0; i < 8; i++) {
            this._board[i] = new Array(8);
        }
        for(let i = 1; i < 7; i++) {
            this._board[i][0] = new Piece(Color.WHITE, new Coordinates(i, 0));
            this._board[i][7] = new Piece(Color.WHITE, new Coordinates(i, 7));
            this._board[7][i] = new Piece(Color.BLACK, new Coordinates(7, i));
            this._board[0][i] = new Piece(Color.BLACK, new Coordinates(0, i));

        }

        this._board[2][6] = new Piece(Color.BLACK, new Coordinates(2,6));

        this.show_board();

    }

    _verifierPion() {
        let x = prompt("Saisir x");
        console.log(x);
        let y = prompt("Saisir y");
        console.log(y);
        console.log("Pion aux coordonnées " + "(" + y +"," + x + ")");
        this._afficherPion(y,x);
        this._compterPionsAlentours(y,x);
        let pieceTest = new Piece(Color.WHITE, new Coordinates(x,y));
        this._get_possible_move_list(pieceTest);
    }

    _afficherPion(x,y) {
        let piece = this._board[x][y];
        if(typeof piece === "undefined") {
            console.log("VIDE");
        }
        else if(piece.color() === Color.WHITE) {
            console.log("BLANC");
        }
        else if(piece.color() === Color.BLACK) {
            console.log("NOIR");
        }
    }

    _compterPionsAlentours(x,y) {
        console.log("Nombre de pions sur la ligne: " + this._compterPionsLigne(x));
        console.log("Nombre de pions sur la colonne: " + this._compterPionsColonne(y));
    }

    _compterPionsLigne(x) {
        let nbPions = 0;
        let y;
        for(y=0; y<8; ++y) {
            let piece = this._board[x][y];
            if(typeof piece !== "undefined") {
                nbPions = nbPions +1;
            }
        }
        return nbPions;
    }
    _compterPionsColonne(y) {
        let nbPions = 0;
        let x;
        for(x=0; x<8; ++x) {
            let piece = this._board[x][y];
            if (typeof piece !== "undefined") {
                nbPions = nbPions + 1;

            }
        }

        return nbPions;
    }
/*
    //fonction test vers le haut

    _testVersLeHaut(x,y,cpt,bas,X,Y){
        while(x>=0 && x<=8 && y>=0 && y<=8 && piece[X][Y].color()===piece[x][y].color() && bas) {
            ++cpt;
            testVersLeBas(x + 1, y + 1, cpt)
        }
        bas=false;
    }

    _testVersLeHaut(x,y,cpt,bas,X,Y){
        while(x>=0 && x<=8 && y>=0 && y<=8 && piece[X][Y].color()===piece[x][y].color() && !bas) {
            ++cpt;
            testVersLeBas(x + 1, y + 1, cpt)
        }
    }

    _testDiagodescendante(x,y){

        let positionDepX = x;
        let positionDepY = y;
        let cpt = 0;
        let bas = true;

        while (x >= 0 && x <= 8 && y >= 0 && y <= 8 && bas) {
            if (piece[x][y].color() === piece[positionDepX][positionDepY].color()) {
                ++cpt;
            }
            this.testVersLeHaut(x, y, cpt, positionDepX, positionDepY);
        }

        while (x >= 0 && x <= 8 && y >= 0 && y <= 8 && !bas){
            if (piece[x][y].color() === piece[positionDepX][positionDepY].color()) {
                ++cpt;
            }
            this.testVersLeBas(x, y, cpt, positionDepX, positionDepY);
        }
    }*/
}

export default Engine;