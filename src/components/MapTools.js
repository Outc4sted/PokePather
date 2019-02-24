import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { InputNumber, Card, Radio, Col, Row } from 'antd';

class MapTools extends Component {
  render() {
    const { rebuildGrid, updateTool } = this.props;

    return (
      <Row className="map-tools" type="flex" justify="center" gutter={6}>
        <Col span={3}>
          <Card title="Grid Size" size="small">
            <InputNumber min={2} defaultValue={4} onChange={rebuildGrid} />
          </Card>
        </Col>
        <Col span={3}>
          <Card title="Map Tiles" size="small">
            <Radio.Group size="large" defaultValue="start" onChange={updateTool} buttonStyle="solid">
              <Radio.Button value="start">Pokemon</Radio.Button>
              <Radio.Button value="grass">Grass</Radio.Button>
              <Radio.Button value="end">End</Radio.Button>
              <Radio.Button value="rock">Rock</Radio.Button>
            </Radio.Group>
          </Card>
        </Col>
      </Row>
    );
  }
}

MapTools.propTypes = {
  updateTool: PropTypes.func.isRequired,
  rebuildGrid: PropTypes.func.isRequired,
};

export default MapTools;
