import lib from '../lib/openxum-core/openxum';

let nb_victoires_white = 0;
let nb_victoires_black = 0;
let nb_coups = 0;

for(let i=0; i<100; ++i) {
  let e = new lib.OpenXum.LinesOfActions.Engine(lib.OpenXum.LinesOfActions.GameType.STANDARD, lib.OpenXum.LinesOfActions.Color.BLACK);
  let p1 = new lib.OpenXum.RandomPlayer(lib.OpenXum.LinesOfActions.Color.BLACK, e);
  let p2 = new lib.OpenXum.RandomPlayer(lib.OpenXum.LinesOfActions.Color.WHITE, e);
  let p = p1;
  let moves = [];

  while (!e.is_finished()) {
    let move = p.move();

    moves.push(move);
    e.move(move);
    p = p === p1 ? p2 : p1;
  }

  if(e.winner_is() === 1) {
    ++nb_victoires_white;
  }
  else{
    ++nb_victoires_black;
  }

  console.log("Winner is " + (e.winner_is() === lib.OpenXum.LinesOfActions.Color.BLACK ? "player 1" : "player 2"));
  console.log(moves.length);
  nb_coups = nb_coups + moves.length;
  /*for (let index = 0; index < moves.length; ++index) {
    console.log(moves[index].to_string());
  }*/
}

let nb_coups_moyen = nb_coups / 100;

console.log("NB victoires BLANC: " + nb_victoires_white);
console.log("NB victoires NOIR: " + nb_victoires_black);
console.log("NB coups moyen: " + nb_coups_moyen);
