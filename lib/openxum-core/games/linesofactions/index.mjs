"use strict";

// namespace LinesOfActions
import GameType from './game_type.mjs';
import Color from './color.mjs';
import Engine from './engine.mjs';
import Move from './move.mjs';
import IA from './ia/ia_hnefatafl_player.mjs';
import Coordinates from './coordinates.mjs';

export default {
  Color: Color,
  Engine: Engine,
  GameType: GameType,
  Move: Move,
  IA : IA,
    Coordinates: Coordinates
};