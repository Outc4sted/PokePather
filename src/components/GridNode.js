import React, { Component } from 'react';
import { Cell } from 'styled-css-grid';
import PropTypes from 'prop-types';

class GridNode extends Component {
  render() {
    const { cellKey, tile, clickTile } = this.props;

    return (
      <Cell
        className="cell"
        center
        middle
        onClick={() => clickTile(cellKey)}
      >
        <img alt="maptile" className="cell-bg" src={tile} />
      </Cell>
    );
  }
}

GridNode.propTypes = {
  cellKey: PropTypes.string.isRequired,
  clickTile: PropTypes.func.isRequired,
  tile: PropTypes.string.isRequired,
};

export default GridNode;
