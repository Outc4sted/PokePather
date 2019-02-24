import React, { Component } from 'react';
import shortid from 'shortid';
import { Grid } from 'styled-css-grid';
import { Button, Card, Popover } from 'antd';

import grassTile from './images/grasstile.png';
import rockTile from './images/rocktile.png';
import finishTile from './images/finishtile.png';
import bulbasaur from './images/bulbasaur.png';

import MapTools from './components/MapTools';
import GridNode from './components/GridNode';
import './App.css';

const cellSize = '70px';
const tiles = {
  grass: grassTile,
  rock: rockTile,
  end: finishTile,
  start: bulbasaur,
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      gridSize: 4,
      loading: false,
      walking: false,
      moves: [],
      mapTool: 'start',
      rows: `repeat(4, ${cellSize})`,
      columns: `repeat(4, ${cellSize})`,
      cells: [],
      error: null,
      showErrorPopover: false,
      animIntervalId: null,
    };
  }

  componentDidMount() {
    const { gridSize } = this.state;
    this.rebuildGrid(gridSize);
  }

  handleVisibleChange = showErrorPopover => {
    showErrorPopover = this.state.error ? showErrorPopover: false
    this.setState({ showErrorPopover });
  }

  updateTool = ({target:{ value }}) => this.setState({ mapTool: value })

  rebuildGrid = gridSize => {
    if(!isNaN(gridSize)) {
      const cells = Array(gridSize).fill().map(() => Array(gridSize).fill());

      for (let yIndex = 0; yIndex < gridSize; yIndex++)
        for (let xIndex = 0; xIndex < gridSize; xIndex++)
          cells[yIndex][xIndex] = {
            key: shortid.generate(),
            tile: tiles.grass,
          };

      this.setState({
        gridSize,
        cells,
        rows: `repeat(${gridSize}, ${cellSize})`,
        columns: `repeat(${gridSize}, ${cellSize})`,
      });
    }
  }

  clickTile = cellKey => this.setState(state => {
    const startDupe = state.cells.flat().find(cell => cell.tile === tiles.start) && state.mapTool === 'start';
    const endDupe = state.cells.flat().find(cell => cell.tile === tiles.end) && state.mapTool === 'end';

    const cells = state.cells.map(row => row.map(cell => {
      if ((startDupe && cell.tile === tiles.start) || (endDupe && cell.tile === tiles.end))
        cell.tile = tiles.grass;
      else if(cell.key === cellKey)
        cell.tile = tiles[state.mapTool];
      return cell;
    }));

    return { cells };
  });

  buildMapRequest = () => {
    const { cells, gridSize } = this.state;
    const reqBody = {
      sideLength: gridSize,
      impassables: [],
      startingLoc: null,
      endingLoc: null,
    };

    cells.forEach((row, y) => row.forEach((cell, x) => {
      switch(cells[y][x].tile) {
        case tiles.rock: reqBody.impassables.push({ x, y }); break;
        case tiles.start: reqBody.startingLoc = { x, y }; break;
        case tiles.end: reqBody.endingLoc = { x, y }; break;
        default: return;
      }
    }));

    return reqBody;
  }

  getPokemonPath = () => {
    const reqBody = this.buildMapRequest();

    if (!reqBody.startingLoc)
      this.setState({ error: `Where's that pokemon?!`});
    else if (!reqBody.endingLoc)
      this.setState({ error: `Missing the pokemon's home`});
    else {
      this.setState({
        loading: true,
        error: null
      });

      fetch('https://frozen-reef-96768.herokuapp.com/find-path', {
        method: 'POST',
        body: JSON.stringify(reqBody),
        mode: 'cors',
        headers:{
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(({ moves }) => {
        this.setState({
          loading: false,
          walking: true,
          moves,
        }, this.navigatePokemon(moves));
      });
    }
  }

  navigatePokemon = moves => {
    if (moves.length > 0) {
      const direction = moves.shift();
      let currentLoc, nextLocation;

      this.state.cells.forEach((row, x) => {
        const y = row.findIndex(cell => cell.tile === tiles.start);
        if (y !== -1) {
          currentLoc = { x, y, key: row[y].key };
          nextLocation = { x, y };
          return;
        }
      });

      switch(direction) {
        case 'U': nextLocation.x--; break;
        case 'D': nextLocation.x++; break;
        case 'R': nextLocation.y++; break;
        case 'L': nextLocation.y--; break;
        default: console.log(`Not sure which direction '${direction}' is in`);
      }

      nextLocation.key = this.state.cells[nextLocation.x][nextLocation.y].key;

      const cells = this.state.cells.map(row => row.map(cell => {
        if (cell.key === currentLoc.key)
          cell.tile = tiles.grass;
        else if (cell.key === nextLocation.key)
          cell.tile = tiles.start;
        return cell;
      }));

      setTimeout(() => {
        this.setState({ cells }, this.navigatePokemon(moves));
      }, 800);
    }
    else this.setState({ walking: false });
  }

  render() {
    const { cells, rows, columns, loading, walking, showErrorPopover, error } = this.state;

    return (
      <div className="App">
        <MapTools updateTool={this.updateTool} rebuildGrid={this.rebuildGrid} />

        <Grid
          className="pokegrid"
          columns={columns}
          rows={rows}
          justifyContent="center"
        >
          {cells.map(row => row.map(cell =>
            <GridNode className="cell" key={cell.key} cellKey={cell.key} clickTile={this.clickTile} tile={cell.tile} />
          ))}
        </Grid>

        <Card bordered={false}>
          <Popover
            content={error}
            title="I think you forgot something..."
            trigger="click"
            visible={showErrorPopover}
            onVisibleChange={this.handleVisibleChange}
          >
            <Button type="primary" size="large" loading={loading} disabled={walking} onClick={this.getPokemonPath}>Bring Home</Button>
          </Popover>
        </Card>
      </div>
    );
  }
}

export default App;
