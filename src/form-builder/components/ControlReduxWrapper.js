import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { selectControl } from 'form-builder/actions/control';
import { Draggable } from 'bahmni-form-controls';
import get from 'lodash/get';

class ControlWrapper extends Draggable {
  constructor(props) {
    super(props);
    this.control = window.componentStore.getDesignerComponent(props.context.type).control;
    this.props = props;
    this.controlContext = Object.assign({}, props.context);
    this.onSelected = this.onSelected.bind(this);
    this.updateMetadata = this.updateMetadata.bind(this);
    const id = String(window.bahmniIDGenerator.getId());
    this.controlContext.data.id = id;
  }

  onSelected(event, id) {
    this.props.dispatch(selectControl(id));
    event.stopPropagation();
  }

  componentWillMount() {
    this.props.onUpdateMetadata(this.controlContext.data);
  }

  componentWillUpdate(newProps) {
    const concept = get(newProps.conceptToControlMap, this.props.context.data.id);
    if (concept && !this.controlContext.data.concept) {
      const newMetadata = this.control.injectConceptToMetadata(this.controlContext.data, concept);
      this.controlContext.data = newMetadata;
      this.props.onUpdateMetadata(newMetadata);
    } else if (this.controlContext.data.id !== newProps.context.data.id) {
      this.controlContext = Object.assign({}, this.controlContext, newProps.context);
    }
  }

  updateMetadata(newData) {
    this.controlContext.data = Object.assign({}, this.controlContext.data, newData);
    this.props.onUpdateMetadata(this.controlContext.data);
  }

  render() {
    return (
      <div onDragEnd={ this.onDragEnd(this.controlContext) }
        onDragStart={ this.onDragStart(this.controlContext) }
      >
        <this.control metadata={ this.controlContext.data }
          onSelect={ this.onSelected }
          onUpdateMetadata={ this.updateMetadata }
        />
      </div>
    );
  }
}

ControlWrapper.propTypes = {
  context: PropTypes.shape({
    type: PropTypes.string,
    metadata: PropTypes.object,
  }),
  onUpdateMetadata: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return { conceptToControlMap: state.conceptToControlMap };
}

export default connect(mapStateToProps)(ControlWrapper);
