"use strict";

//namespace LinesOfActions
let LinesOfActions = {};

import Gui from './gui.mjs';
import Manager from './manager.mjs';

LinesOfActions = Object.assign(LinesOfActions, Gui);
LinesOfActions = Object.assign(LinesOfActions, Manager);

export default LinesOfActions;