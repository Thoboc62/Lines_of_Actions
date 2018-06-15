"use strict";

import OpenXum from '../../../openxum/player.mjs';
import IALinesOfActions from './player.mjs';

class IALinesOfActions extends OpenXum.Player {
  constructor(c, e) {
    super(c, e);
  }

// public methods
  confirm() {
    return false;
  }

  is_ready() {
    return true;
  }

  is_remote() {
    return false;
  }

  move() {
    return (new IALinesOfActions.Player(this._color, this._engine, 3)).move();
  }

  reinit(e) {
    this._engine = e;
  }
}

export default {
    IALinesOfActions: IALinesOfActions
};