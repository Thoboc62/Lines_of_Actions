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
//utile?
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

    _get_possible_move_list(piece) {
        let moves = [];

        let pieceDestination;

        //positions possibles sur la ligne

            //verifier si la piece destination à gauche n'est pas de la meme couleur que celle en argument
            pieceDestination = this._board[piece.x()][piece.y()-this._compterPionsLigne(piece.x())];
            if(piece.color() !== pieceDestination.color()) {
                moves.push(new Move(piece.clone(), new Coordinates(piece.x(), piece.y()-this._compterPionsLigne(piece.x()))));
            }
            else {
                moves.push(new Move(piece.clone(), new Coordinates(piece.x(), piece.y()-this._compterPionsLigne(piece.x())+1)));
            }

            //verifier si la piece destination à droite n'est pas de la meme couleur que celle en argument
            pieceDestination = this._board[piece.x()][piece.y()+this._compterPionsLigne(piece.x())];
            if(piece.color() !== pieceDestination.color()) {
                moves.push(new Move(piece.clone(), new Coordinates(piece.x(), piece.y()+this._compterPionsLigne(piece.x()))));
            }
            else {
                moves.push(new Move(piece.clone(), new Coordinates(piece.x(), piece.y()-this._compterPionsLigne(piece.x())-1)));
            }

        //position possible sur la colonne

            //verifier si la piece destination au dessus n'est pas de la meme couleur que celle en argument
            pieceDestination = this._board[piece.x()-this._compterPionsColonne(piece.y())][piece.y()];
            if(piece.color() !== pieceDestination.color()) {
                moves.push(new Move(piece.clone(), new Coordinates(piece.x()-this._compterPionsColonne(piece.y()), piece.y())));
            }
            else {
                moves.push(new Move(piece.clone(), new Coordinates(piece.x()-this._compterPionsColonne(piece.y())+1, piece.y())));
            }

            //verifier si la piece destination en dessous n'est pas de la meme couleur que celle en argument
            pieceDestination = this._board[piece.x()+this._compterPionsColonne(piece.y())][piece.y()];
            if(piece.color() !== pieceDestination.color()) {
                moves.push(new Move(piece.clone(), new Coordinates(piece.x()+this._compterPionsColonne(piece.y()), piece.y())));
            }
            else {
                moves.push(new Move(piece.clone(), new Coordinates(piece.x()-this._compterPionsColonne(piece.y())-1, piece.y())));
            }

        //positions possibles sur la diagonale


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
        for(let i = 0; i < 8; i++) {
            this._board[i][0] = new Piece(Color.WHITE, new Coordinates(i, 0));
            this._board[i][7] = new Piece(Color.WHITE, new Coordinates(i, 7));
            this._board[7][i] = new Piece(Color.BLACK, new Coordinates(7, i));
            this._board[0][i] = new Piece(Color.BLACK, new Coordinates(0, i));

        }

        this.show_board();

    }

    _verifierPion() {
        let x = prompt("Saisir x");
        console.log(x);
        let y = prompt("Saisir y");
        console.log(y);
        console.log("Pion aux coordonnées " + "(" + x +"," + y + ")");
        this._afficherPion(x,y);
        this._compterPionsAlentours(x,y);
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
        let nb=this._cptDiagoDescendante(x,y);
        console.log(nb);
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
    //test Joseph


    //fonction test vers le haut
    _testVersLeBas(x,y,cpt,bas,X,Y) {
        /*console.log("-+*+*+*+*+*+*+*")
        console.log(typeof(x));
        console.log(typeof(y));
        console.log(typeof(X));
        console.log(typeof(Y));
        console.log("yes");
*/
        while (x >= 0 && x<8 && y >= 0 && y <8 && bas===true){
           //console.log(this._board[parseInt(X)][parseInt(Y)].color());
          /*  console.log("x="+x);
            console.log("y="+y);
            console.log("X="+X);
            console.log("Y="+Y);
            console.log(cpt);
            console.log("------------------");*/
            if (typeof(this._board[x][y])!=="undefined") {
                    ++cpt;
                    //console.log("cptcptcpt");

                }
        console.log("-********///////////-----------***************//////////");
                this._afficherPion(x,y);
        this._testVersLeBas(++x,++y,cpt,bas,X,Y);
        }
        bas=false;
    }

    _testVersLeHaut(x,y,cpt,bas,X,Y){
        while(x>=0 && x<8 && y>=0 && y<8 && bas===false) {

                if (typeof(this._board[x][y])!=="undefined") {
                    ++cpt;
                }

            this._testVersLeHaut(--x , --y, cpt,bas,X,Y);
        }
    }

    _cptDiagoDescendante(x,y){

        let positionDepX =x;
        let positionDepY =y;

        let cpt = 0;
        let bas = true;

        if(bas===true) {
            this._testVersLeBas(x, y, cpt,bas, positionDepX, positionDepY);
        }
        if(bas===false) {
            this._testVersLeHaut(x,y, cpt, bas, positionDepX, positionDepY);
        }
        return cpt;
    }











//test kevin

/*
//Gauche
    verif_gauche(piece)
    {
        let x = piece.coordinates().x();
        let y = piece.coordinates().y();
        let piece_g;

        if(x > 0)
        {
            piece_g=this._board[x-1][y];

            if(piece_g.color()===piece.color())
            {
                console.log("voisin trouver");
                return true;
            }

        }
        return false;

    }



//Droite
    verif_droite(piece)
    {
        let x = piece.coordinates().x();
        let y = piece.coordinates().y();
        let piece_d;

        if(x < 8)
        {
            piece_d=this._board[x+1][y];

            if(piece_d.color()===piece.color())
            {
                console.log("voisin trouver");
                return true;
            }

        }
        return false;

    }


//Haut
    verif_haut(piece)
    {

        let x = piece.coordinates().x();
        let y = piece.coordinates().y();
        let piece_h;

        if(y > 0)
        {
            piece_h=this._board[x][y-1];

            if(piece_h.color()===piece.color())
            {
                console.log("voisin trouver");
                return true;
            }

        }
        return false;

    }


//Bas
    verif_bas(piece)
    {

        let x = piece.coordinates().x();
        let y = piece.coordinates().y();
        let piece_b;

        if(y < 8){
            piece_b=this._board[x][y+1];

            if(piece_b.color()===piece.color())
            {
                console.log("voisin trouver");
                return true;
            }

        }
        return false;

    }*/
}

export default Engine;