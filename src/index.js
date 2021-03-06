import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const backgroundColor = props.focused && 'blue';
  return (
    <button className="square" onClick={props.onClick} style={{ backgroundColor }}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const { winnerSequence } = this.props;
    let focused = false;
    if (winnerSequence) {
      focused = winnerSequence.includes(i)
    }

    return <Square key={i} value={this.props.squares[i]} onClick={() => this.props.onClick(i)} focused={focused} />;
  }

  renderCols(increment) {
    const cols = [];
    for (let i = 0; i < 3; i++) {
      const squareId = increment + i;
      cols.push(this.renderSquare(squareId));
    }
    return cols;
  }

  renderRows() {
    const rows = [];
    for (let i = 0; i < 3; i++) {
      const squares = this.renderCols(i * 3);
      rows.push(
        <div className="board-row" key={`board-row-${i}`}>
          {squares}
        </div>
      )
    }
    return rows;
  }

  render() {
    return (
      <div>
        {this.renderRows()}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      historySort: true
    }
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  sortHistory() {
    this.setState({ sortHistory: !this.state.sortHistory });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const calculatedWinner = calculateWinner(current.squares);
    const winner = calculatedWinner && calculatedWinner[0];
    const winnerSequence = calculatedWinner && calculatedWinner[1];    

    const moves = history.map((step, move) => {
      var desc = move ? 'Go to move # ' + move : 'Go to game start';
      
      // check whick moviment is (colXrow)
      const beforeStep = history[move - 1];
      if (beforeStep) {
        beforeStep.squares.forEach((element, index) => {
          const isSameValue = step.squares[index] === element;
          if (!isSameValue) {
            // get row action
            const divide = index / 3;
            let row;
            if (divide <= 1) row = 1;
            else if (divide <= 2) row = 2;
            else row = 3;
            // get col action
            let col;
            if (index <= 3) col = index;
            else if (index <= 6) col = index - 3;
            else col = index - 6;
            // add coordinates info
            desc += ` / Row: ${row}, Col: ${col+1}`;
          }
        });
      }

      const isCurrentMove = this.state.stepNumber === move;
      const fontWeight = isCurrentMove ? 'bold' : 'normal';

      return (
        <li key={move}>
          <button
            onClick={() => this.jumpTo(move)}
            style={{ fontWeight }}
          >{desc}</button>
        </li>
      );
    })

    const allSquaresFilled = !current.squares.filter(el => el === null).length;

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (allSquaresFilled) {
      status = 'Tie!';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winnerSequence={winnerSequence}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <button onClick={() => this.sortHistory()}>Sort history list</button>
          </div>
          <ol reversed={this.state.sortHistory}>{!this.state.sortHistory ? moves : moves.reverse()}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

/** 
 * @returns array - [letter, sequence]
*/
function calculateWinner(squares) {
  const winCombinnations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const combinnation of winCombinnations) {
    const [a, b, c] = combinnation;
    if (
      squares[a]
      && squares[a] === squares[b]
      && squares[a] === squares[c]
    ) {
      return [squares[a], [a, b, c]];
    }
  }

  return null;
}