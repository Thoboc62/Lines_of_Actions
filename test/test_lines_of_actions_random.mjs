import lib from '../lib/openxum-core/openxum';

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

console.log("Winner is " + (e.winner_is() === lib.OpenXum.LinesOfActions.Color.BLACK ? "player 1" : "player 2"));
/*for (let index = 0; index < moves.length; ++index) {
  console.log(moves[index].to_string());
}*/