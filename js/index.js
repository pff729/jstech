var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ref = _;
var range = _ref.range;
var sampleSize = _ref.sampleSize;
var flatten = _ref.flatten; 

var initialWidth = 10;
var initialHeight = 10;
var initialMines = 10;


var helpers = {
 

  assignCell: function assignCell(state, cellId, props) {
    var grid = state.grid;

    var cell = this.getCell(state, cellId);
    var x = cell.x;
    var y = cell.y;

    var row = grid[cell.y];
    return _extends({}, state, {
      grid: [].concat(grid.slice(0, y), [[].concat(row.slice(0, x), [_extends({}, cell, props)], row.slice(x + 1))], grid.slice(y + 1))
    });
  },

  
  assignCells: function assignCells(state, cellIds, props) {
    return _extends({}, state, {
      grid: state.grid.map(function (row) {
        return row.map(function (cell) {
          return cellIds.includes(cell.id) ? _extends({}, cell, props) : cell;
        });
      })
    });
  },

  
  getCell: function getCell(state, cellId) {
    return flatten(state.grid).find(function (cell) {
      return cell.id === cellId;
    });
  },

  
  getCellAt: function getCellAt(state, _ref2) {
    var x = _ref2.x;
    var y = _ref2.y;
    var grid = state.grid;
    var width = state.width;
    var height = state.height;

    if (x >= 0 && y >= 0 && x < width && y < height) {
     
      return grid[y][x];
    }
    return null;
  },

  
  getNeighbors: function getNeighbors(state, cellId) {
    var grid = state.grid;

    var _getCell = this.getCell(state, cellId);

    var x = _getCell.x;
    var y = _getCell.y;

    return [this.getCellAt(state, { x: x - 1, y: y - 1 }), 
    this.getCellAt(state, { x: x, y: y - 1 }), 
    this.getCellAt(state, { x: x + 1, y: y - 1 }), 

    this.getCellAt(state, { x: x - 1, y: y }), 
    this.getCellAt(state, { x: x + 1, y: y }), 

    this.getCellAt(state, { x: x - 1, y: y + 1 }), 
    this.getCellAt(state, { x: x, y: y + 1 }), 
    this.getCellAt(state, { x: x + 1, y: y + 1 })]. 
    filter(function (cell) {
      return !!cell;
    }); 
  },

  
  getRevealCells: function getRevealCells(state, startCellId) {
    var _this = this;

    var visited = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    var cell = this.getCell(state, startCellId);
    if (cell.mine) {
      
      return [startCellId];
    }
    var neighbors = this.getNeighbors(state, startCellId);
    var neighborMines = neighbors.filter(function (cell) {
      return cell.mine;
    });
    visited.push(startCellId); 

    if (neighborMines.length) {
     
      return [startCellId];
    } else {
      var toReveal = neighbors.filter(function (neighbor) {
        return !neighbor.flagged && !visited.includes(neighbor.id);
      }) 
      .map(function (neighbor) {
        return neighbor.id;
      });

      return flatten([startCellId].concat(toReveal.map(function (cellId) {
        return _this.getRevealCells(state, cellId, visited);
      })));
    }
  },

    countMinesAround: function countMinesAround(state, cellId) {
    return this.getNeighbors(state, cellId).filter(function (c) {
      return c.mine;
    }).length;
  },

    hasLost: function hasLost(state) {
    var cells = flatten(state.grid);
    return cells.some(function (c) {
      return c.mine && c.revealed;
    });
  },

    hasWon: function hasWon(state) {
    var cells = flatten(state.grid);
    var nonMines = cells.filter(function (c) {
      return !c.mine;
    });
    return nonMines.every(function (c) {
      return c.revealed;
    });
  }
};

var minesweeperActions = {
  "@@redux/INIT": function reduxINIT(state) {
    return state;
  },
  FLAG_CELL: function FLAG_CELL(state, _ref3) {
    var cellId = _ref3.cellId;

    var cell = helpers.getCell(state, cellId);
    if (cell.revealed) {
      return state;
    } else {
      return helpers.assignCell(state, cellId, {
        flagged: !cell.flagged
      });
    }
  },

  REVEAL_CELL: function REVEAL_CELL(state, _ref4) {
    var cellId = _ref4.cellId;

    if (state.won || state.lost || helpers.getCell(state, cellId).flagged) {
      return state;
    }
    if (!state.minesPlaced) {
      state = this.PLACE_MINES(state, { cellIdToAvoid: cellId });
    }
    var toReveal = helpers.getRevealCells(state, cellId);
    var newState = helpers.assignCells(state, toReveal, { revealed: true, flagged: false });
    var hasLost = helpers.hasLost(newState);
    var hasWon = !hasLost && helpers.hasWon(newState);
    return _extends({}, newState, {
      won: hasWon,
      lost: hasLost,
      endTime: Date.now()
    });
  },
  REVEAL_AROUND_CELL: function REVEAL_AROUND_CELL(state, _ref5) {
    var _this2 = this;

    var cellId = _ref5.cellId;

    var cell = helpers.getCell(state, cellId);
    var neighbors = helpers.getNeighbors(state, cellId);
    var neighborMineCount = neighbors.filter(function (n) {
      return n.mine;
    }).length;
    var neighborFlagCount = neighbors.filter(function (n) {
      return n.flagged;
    }).length;
    if (cell.revealed && neighborMineCount === neighborFlagCount) {
      var nonFlaggedNeighborIds = neighbors.filter(function (n) {
        return !n.flagged;
      }).map(function (n) {
        return n.id;
      });
      return nonFlaggedNeighborIds.reduce(function (state, cellId) {
        return _this2.REVEAL_CELL(state, { cellId: cellId });
      }, state);
    }
    return state;
  },
  PLACE_MINES: function PLACE_MINES(state, _ref6) {
    var cellIdToAvoid = _ref6.cellIdToAvoid;

    var validCells = flatten(state.grid).filter(function (c) {
      return c.id !== cellIdToAvoid;
    }).map(function (c) {
      return c.id;
    });
    var mines = sampleSize(validCells, state.mineCount);
    return _extends({}, helpers.assignCells(state, mines, { mine: true }), {
      minesPlaced: true,
      startTime: Date.now()
    });
  }
};

var store = getMinesweeperStore({ width: initialWidth, height: initialHeight, mineCount: initialMines });

function minesweeperReducer(state, action) {
  if (minesweeperActions.hasOwnProperty(action.type)) {
   
    return minesweeperActions[action.type](state, action);
  } else {
    console.warn("Invalid minesweeper action: \"" + action.type + "\" (ignoring)");
    return state;
  }
}

function getMinesweeperStore(_ref7) {
  var width = _ref7.width;
  var height = _ref7.height;
  var mineCount = _ref7.mineCount;

  var initialState = {
    width: width, height: height, mineCount: mineCount,
    minesPlaced: false,
    lost: false,
    won: false,
    startTime: null, 
    endTime: null, 
    grid: range(0, height).map(function (y) {
      return range(0, width).map(function (x) {
       
        return {
          id: "cell-" + x + "-" + y,
          x: x, y: y,
          flagged: false,
          mine: false,
          revealed: false
        };
      });
    })
  };
  return Redux.createStore(function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
    var action = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    return minesweeperReducer(state, action);
  });
}

function PopBox(props) {
  var className = classNames("pop-box", props.inset ? "pop-box--inset" : null, props.className);
  return React.createElement("div", _extends({}, props, { className: className }));
}

function Minefield(props) {
  return React.createElement(PopBox, _extends({}, props, { className: "minefield", inset: true }));
}

function MinefieldRow(props) {
  return React.createElement("div", _extends({}, props, { className: "minefield-row" }));
}

function MineCell(props) {
  var revealed = props.revealed;
  var flagged = props.flagged;
  var mine = props.mine;

  var className = classNames("mine-cell", "mine-cell--" + (revealed ? "revealed" : "hidden"), mine ? "mine-cell--mine" : null, flagged ? "mine-cell--flagged" : null);

  return React.createElement(PopBox, _extends({}, props, { className: className, revealed: true }));
}

function MineCellNumber(_ref8) {
  var number = _ref8.number;

  var className = "mine-cell-number mine-cell-number--" + number;
  return React.createElement(
    "span",
    { className: className },
    number || ""
  );
}

function CellContent(_ref9) {
  var revealed = _ref9.revealed;
  var mine = _ref9.mine;
  var borderMineCount = _ref9.borderMineCount;

  if (!mine && borderMineCount && revealed) {
    return React.createElement(MineCellNumber, { number: borderMineCount });
  }
  return null;
}

function DigitalCounter(props) {
  var number = props.number;

  var paddedNumber = padNumber(number, 3);
  return React.createElement(
    "div",
    _extends({}, props, { className: "digital-counter" }),
    paddedNumber
  );
}

var Minesweeper = function (_React$Component) {
  _inherits(Minesweeper, _React$Component);

  function Minesweeper() {
    _classCallCheck(this, Minesweeper);

    return _possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  Minesweeper.prototype.componentWillUnmount = function componentWillUnmount() {
    this.stopTimer();
  };

  Minesweeper.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    var _props = this.props;
    var minesPlaced = _props.minesPlaced;
    var won = _props.won;
    var lost = _props.lost;

    if (!minesPlaced && nextProps.minesPlaced) {
      this.startTimer();
    }
    if (!won && nextProps.won || !lost && nextProps.lost) {
      clearInterval(this.timer);
      this.stopTimer();
    }
  };

  Minesweeper.prototype.startTimer = function startTimer() {
    var _this4 = this;

    this.timer = setInterval(function () {
      return _this4.forceUpdate();
    }, 500);
  };

  Minesweeper.prototype.stopTimer = function stopTimer() {
    clearInterval(this.timer);
  };

  Minesweeper.prototype.onCellMouseUp = function onCellMouseUp(cell, event) {
    event.preventDefault();
    var store = this.props.store;
    var which = event.nativeEvent.which;

    switch (event.nativeEvent.which) {
      case 1:
        store.dispatch({
          type: "REVEAL_CELL",
          cellId: cell.id
        });
        break;
      case 2:
        store.dispatch({
          type: "REVEAL_AROUND_CELL",
          cellId: cell.id
        });
        break;
    }
    return false;
  };

  Minesweeper.prototype.onCellMouseDown = function onCellMouseDown(cell, event) {
    event.preventDefault();
    if (event.nativeEvent.which === 3) {
      var _store = this.props.store;

      _store.dispatch({
        type: "FLAG_CELL",
        cellId: cell.id
      });
    }
    return false;
  };

  Minesweeper.prototype.render = function render() {
    var _this5 = this;

    var _props2 = this.props;
    var store = _props2.store;
    var grid = _props2.grid;
    var won = _props2.won;
    var lost = _props2.lost;
    var mineCount = _props2.mineCount;
    var startTime = _props2.startTime;
    var endTime = _props2.endTime;
    var onReset = _props2.onReset;

    var flagCount = flatten(grid).filter(function (c) {
      return c.flagged;
    }).length;
    var now = Date.now();

    return React.createElement(
      PopBox,
      { className: "minesweeper" },
      React.createElement(
        PopBox,
        { className: "minesweeper__info", inset: true },
        React.createElement(DigitalCounter, { number: mineCount - flagCount }),
        React.createElement(
          "button",
          { className: "minesweeper__win-label", onClick: onReset },
          won ? "You won!" : lost ? "You Lost" : "Reset"
        ),
        React.createElement(DigitalCounter, { number: startTime ? Math.floor(((won || lost ? endTime : now) - startTime) / 1000) : 0 })
      ),
      React.createElement(
        Minefield,
        null,
        grid.map(function (row, i) {
          return React.createElement(
            MinefieldRow,
            { key: "row-" + i },
            row.map(function (cell) {
              return React.createElement(
                MineCell,
                _extends({}, cell, {
                  key: cell.id,
                  revealed: cell.revealed || (won || lost) && !cell.flagged && cell.mine,
                  onMouseDown: _this5.onCellMouseDown.bind(_this5, cell),
                  onClick: _this5.onCellMouseUp.bind(_this5, cell),
                  onContextMenu: function onContextMenu(e) {
                    return e.preventDefault(), false;
                  }
                }),
                React.createElement(CellContent, _extends({}, cell, { borderMineCount: helpers.countMinesAround(_this5.props, cell.id) }))
              );
            })
          );
        })
      )
    );
  };

  return Minesweeper;
}(React.Component);

var App = function (_React$Component2) {
  _inherits(App, _React$Component2);

  function App(props) {
    _classCallCheck(this, App);

    var _this6 = _possibleConstructorReturn(this, _React$Component2.call(this, props));

    _this6.store = store;
    _this6.state = {
      width: initialWidth,
      height: initialHeight,
      mineCount: initialMines,
      storeState: store.getState()
    };
    return _this6;
  }

  App.prototype.componentDidMount = function componentDidMount() {
    this.subscribe();
  };

  App.prototype.componentWillUnmount = function componentWillUnmount() {
    this.unsubscribe();
  };

  App.prototype.subscribe = function subscribe() {
    var _this7 = this;

    this.unsub = this.store.subscribe(function () {
      return _this7.setState({
        storeState: _this7.store.getState()
      });
    });
  };

  App.prototype.unsubscribe = function unsubscribe() {
    if (this.unsub) {
      this.unsub();
      this.unsub = null;
    }
  };

  App.prototype.updateStateInt = function updateStateInt(key, event) {
    var _setState;

    this.setState((_setState = {}, _setState[key] = parseInt(event.target.value), _setState));
  };

  App.prototype.reset = function reset() {
    var _state = this.state;
    var width = _state.width;
    var height = _state.height;
    var mineCount = _state.mineCount;

    this.unsubscribe();
    this.store = getMinesweeperStore({ width: width, height: height, mineCount: mineCount });
    this.subscribe();
    this.setState({ storeState: this.store.getState() });
  };

  App.prototype.render = function render() {
    var _state2 = this.state;
    var storeState = _state2.storeState;
    var width = _state2.width;
    var height = _state2.height;
    var mineCount = _state2.mineCount;

    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { className: "game-container" },
        React.createElement(Minesweeper, _extends({}, storeState, { store: this.store, onReset: this.reset.bind(this) }))
      ),
      React.createElement(
        "div",
        { className: "game-controls" },
        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            null,
            "Width"
          ),
          React.createElement("input", { type: "number", value: width, onChange: this.updateStateInt.bind(this, "width"), min: "0", max: "50" })
        ),
        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            null,
            "Height"
          ),
          React.createElement("input", { type: "number", value: height, onChange: this.updateStateInt.bind(this, "height"), min: "0", max: "50" })
        ),
        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            null,
            "Mines"
          ),
          React.createElement("input", { type: "number", value: mineCount, onChange: this.updateStateInt.bind(this, "mineCount"), min: "0", max: "2499" })
        ),
        React.createElement(
          "button",
          { onClick: this.reset.bind(this) },
          "Start"
        )
      )
    );
  };

  return App;
}(React.Component);

function padNumber(n, length) {
  var isNegative = n < 0;
  if (isNegative) {
    n = n * -1;
    length -= 1; 
  };
  n = n.toString();
  while (n.length < length) {
    n = "0" + n;
  }
  if (isNegative) {
    n = "-" + n;
  }
  return n;
}

function classNames() {
  for (var _len = arguments.length, names = Array(_len), _key = 0; _key < _len; _key++) {
    names[_key] = arguments[_key];
  }

  return names.filter(function (n) {
    return !!n;
  }).join(" ");
}

ReactDOM.render(React.createElement(App, null), document.querySelector(".outlet"));