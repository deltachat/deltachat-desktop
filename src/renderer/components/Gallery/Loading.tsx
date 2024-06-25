import React, { PureComponent } from 'react'

const Dead = 0
const Alive = 1
const Cancer = 2
type CAState = Dead | Alive | Cancer
// see this: https://math.uchicago.edu/~alephnil/en/talks/logm-conway-poster.pdf
// done with <3 by Farooq!

function getNeighbors(
  i: number,
  j: number,
  currentState: CAState[][]
): number[] {
  const width = currentState[0].length
  const height = currentState.length
  let alives: number = 0
  let deads: number = 0
  let cancers: number = 0
  for (let di = -1; di <= 1; di++) {
    for (let dj = -1; dj <= 1; dj++) {
      switch (
        currentState[(i + di + height) % height][(j + dj + width) % width]
      ) {
        case Alive:
          alives++
          break
        case Dead:
          deads++
          break
        case Cancer:
          cancers++
          break
      }
    }
  }
  return [deads, alives, cancers]
}

function computeNewState(currentState: CAState[][]): CAState[][] {
  const newState: CAState[][] = Array.from(currentState)
  for (let i = 0; i < currentState.length; i++) {
    for (let j = 0; j < currentState[i].length; j++) {
      const cell = currentState[i][j]
      const [_deads, alives, cancers] = getNeighbors(i, j, currentState)
      const nonDeads = alives + cancers
      switch (cell) {
        case Alive:
          if (nonDeads === 2 || nonDeads === 3) {
            newState[i][j] = alives > cancers ? Alive : Cancer
          } else {
            newState[i][j] = Dead
          }
          break
        case Dead:
          if (nonDeads == 3) {
            newState[i][j] = alives > cancers ? Alive : Cancer
          }
          break
        case Cancer:
          if (nonDeads >= 1 && nonDeads <= 3) {
            newState[i][j] = Cancer
          } else {
            newState[i][j] = Dead
          }
          break
      }
    }
  }
  return newState
}

function generateRandomInitialState(): CAState[][] {
  const state = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ]

  for (let i = 0; i < state.length; i++) {
    for (let j = 0; j < state[0].length; j++) {
      const r = Math.random()
      if (r >= 0.3) {
        if (r <= 0.9) {
          state[i][j] = Alive
        } else {
          state[i][j] = Cancer
        }
      }
    }
  }
  return state
}

interface State {
  generation: number
}

export default class Loading extends PureComponent<{}, State> {
  board: CAState[][] = []
  interval: number = 0

  constructor(props) {
    super(props)
    this.board = generateRandomInitialState()
    this.state = {
      generation: 0,
    }
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.board = computeNewState(this.board)
      this.setState({ generation: this.state.generation + 1 })
    }, 750)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', margin: 'auto' }}>
        {this.board.map((row, idx) => (
          <CellRow row={row} key={idx.toString() + 'r'} />
        ))}
      </div>
    )
  }
}

const CellColor = ['#ffffff', '#3584e4', '#e01b24']

function CellRow({ row }: { row: CAState[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {row.map((cell, idx) => (
        <Cell state={cell} key={idx.toString() + 'c'} />
      ))}
    </div>
  )
}

function Cell({ state }: { state: CAState }) {
  return (
    <div
      style={{
        height: '36px',
        width: '36px',
        borderColor: '#000',
        borderWidth: '2px',
        borderRadius: '2px',
        backgroundColor: CellColor[state],
      }}
    >
      &nbsp;
    </div>
  )
}
