"use strict";

import OpenXum from '../../openxum/manager.mjs';
import LinesOfActions from '../../../openxum-core/games/linesofactions/index.mjs';

class Manager extends OpenXum.Manager {
  constructor(e, g, o, s) {
    super(e, g, o, s);
    this.that(this);
  }

  build_move() {
    return new LinesOfActions.Move();
  }

  get_current_color() {
    return this.engine().current_color() === LinesOfActions.Color.WHITE ? 'White' : 'Black';
  }

  static get_name() {
    return 'linesofactions';
  }

  get_winner_color() {
    return this.engine().winner_is() === LinesOfActions.Color.WHITE ? 'White' : 'Black';
  }

  process_move() { }
}

export default {
  Manager: Manager
};