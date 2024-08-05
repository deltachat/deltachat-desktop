/*
 * This is a loading screen currently used when Gallery
 * is loading media. It is a 3 state version of game of life which
 * itself is a 2D Cellular Automata. --Farooq
 */

import React, { PureComponent } from 'react'
import './Loading.css'

const Dead = 0
const Alive = 1
const Cancer = 2
type CAState = 0 | 1 | 2
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
          // an alive cell is alive if there are exactly 2 or 3
          // alive neighbors, otherwise dead. an alive cell will be
          // alive if there are more cancer cells than alive cells
          if (nonDeads === 2 || nonDeads === 3) {
            newState[i][j] = alives > cancers ? Alive : Cancer
          } else {
            newState[i][j] = Dead
          }
          break
        case Dead:
          // a dead cell will become alive if there are exactly 3 non dead
          // neighbors. if there are more cancer cells than alive cells, it'll be cancer
          if (nonDeads == 3) {
            newState[i][j] = alives > cancers ? Alive : Cancer
          }
          break
        case Cancer:
          // a cancer cell will remain cancer if there are 1 to 3 non dead cells
          // otherwise will die.
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
  const state: CAState[][] = [
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

  constructor(props: any) {
    super(props)
    this.board = generateRandomInitialState()
    this.state = {
      generation: 0,
    }
  }

  componentDidMount() {
    this.interval = window.setInterval(() => {
      this.board = computeNewState(this.board)
      this.setState({ generation: this.state.generation + 1 })
    }, 750)
  }

  componentWillUnmount() {
    window.clearInterval(this.interval)
  }

  render() {
    return (
      <div className='loading'>
        <p>Please wait...</p>
        <div>
          {this.board.map((row: CAState[], idx) => (
            <CellRow row={row} key={idx.toString() + 'r'} />
          ))}
        </div>
      </div>
    )
  }
}

const CellColor = [
  'var(--buttonPrimaryText)',
  'var(--buttonPrimaryBackground',
  'var(--buttonDangerText)',
]

function CellRow({ row }: { row: CAState[] }) {
  return (
    <div className='cell-row'>
      {row.map((cell: CAState, idx) => (
        <Cell state={cell} key={idx.toString() + 'c'} />
      ))}
    </div>
  )
}

function Cell({ state }: { state: CAState }) {
  return (
    <div
      className='cell'
      style={{
        backgroundColor: CellColor[state],
      }}
    >
      &nbsp;
    </div>
  )
}
