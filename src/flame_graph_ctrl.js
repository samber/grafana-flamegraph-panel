import {MetricsPanelCtrl} from 'app/plugins/sdk';

import _ from 'lodash';
import * as d3 from './d3_bundle';

import './external/d3.flameGraph.css!';
import './css/flame-graph-panel.css!';

const panelDefaults = {
  mapping: {
    signatureFieldName: 'signature',
    signatureSeparator: '#',
  },

  panelMargin: {
    left: 35,
    right: 35,
    top: 10,
    bottom: 20
  },

  panelWidth: null,
  panelHeight: 500,

  // fixed: fixed color
  // module: based on a column name
  // random: hashColor() function from d3.flameGraph lib
  // scale depending of the height
  availableColorFunctions: ['random', 'fixed', 'module', 'scale'],
  colorFunction: 'random',
  colorModuleColumnName: 'module',
  colorSingle: '#C05018',
};

export class FlameGraphCtrl extends MetricsPanelCtrl {
  static templateUrl = 'module.html';
  constructor($scope, $injector) {
    super($scope, $injector);
    _.defaultsDeep(this.panel, panelDefaults);

    this.events.on('data-received', this.onDataReceived);
    this.events.on('data-snapshot-load', this.onDataReceived);
    this.events.on('init-edit-mode', this.onInitEditMode);
    this.events.on('data-error', this.onDataError);

    this.events.on('render', this.onRender);
    // custom event from link -> render()
    this.events.on('render-complete', this.onRenderComplete)
  }

  onInitEditMode = () => {
    // determine the path to this plugin
    let panels = grafanaBootData.settings.panels;
    let thisPanel = panels[this.pluginId];
    let thisPanelPath = thisPanel.baseUrl + '/';
    // add the relative path to the editor
    let editorPath = thisPanelPath + 'editor.html';

    this.addEditorTab('Options', editorPath, 2);
  };

  onDataError = (err) => {
    this.onDataReceived([]);
  };

  onDataReceived = (dataList) => {
    const data = dataList.map(this.tableHandler.bind(this));
    if (!data || data.length === 0) {
      return;
    }

    this.tree = this.setValues(data[0]);
    this.render();
  };


  getColumnId = (data, columnName) => {
    for (let i = 0; i < data.columns.length; i++) {
      if (data.columns[i].text === columnName)
        return i;
    }
    return null;
  };

  setValueRec = (tree, signature, value) => {
    // `signature` is the current node
    if (signature.length == 0) {
      tree.value = value;
      return tree;
    }

    const currentPart = signature[0];
    signature.shift();

    // already existing children
    for (let i = 0; i < tree.children.length; i++) {
      if (tree.children[i].name === currentPart)
        return this.setValueRec(tree.children[i], signature, value);
    }

    // new children
    tree.children.push(this.setValueRec({name: currentPart, value: value, children: []}, signature, value));
    return tree;
  };

  setValues = (data) => {
    let tree = Object.keys(data).reduce(((acc, current) => {
      // in case of data based on time (round)
      if (data[current] == 0) {
        data[current] = 1;
      }
      this.setValueRec(
        acc,
        current.split(this.panel.mapping.signatureSeparator),
        data[current]
      );
      return acc;
    }).bind(this), {name: 'root', value: 1, children: []});
    return tree;
  };

  tableHandler = (tableData) => {
    const columnIdSignature = this.getColumnId(tableData, this.panel.mapping.signatureFieldName);
    const columnIdValue = this.getColumnId(tableData, 'Value');

    if (columnIdSignature == null || columnIdValue == null) {
      console.error('columns:', tableData.columns);
      console.error('signature column name:', this.panel.mapping.signatureFieldName);
      const error = new Error();
      error.message = 'No data or malformed series';
      error.data = 'Metric query returns ' + tableData.rows.length +
        ' series. FlameGraph Panel expects at least 1 serie with signature column.\n\nResponse:\n' + JSON.stringify(tableData);
      throw error;
    }

    return tableData.rows.reduce((acc, current) => {
      const signature = current[columnIdSignature];
      if (acc[signature] == null)
        acc[signature] = current[columnIdValue];
      else
        acc[signature] += current[columnIdValue];
      // DEBUG
      // acc[signature] = 1;
      return acc;
    }, {});
  };

  colorFunction_random = () => {
  };

  colorFunction_single = () => {
  };

  colorFunction_module = () => {
  };

  colorFunction_scale = () => {
  };

  setFrameColor = () => {
    const colorFunctions = {
      'random': colorFunction_random,
      'single': colorFunction_single,
      'module': colorFunction_module,
      'scale': colorFunction_scale,
    };
    if (colorFunctions[this.colorFunction])
      colorFunctions[this.colorFunction]();
  };

  onRender = () => {
    if (typeof this.tree == 'undefined') {
      return;
    }
  };

  onRenderComplete = (data) => {
    this.panel.panelWidth = data.panelWidth;
    this.renderingCompleted();
  };


  link = (scope, elem, attrs, ctrl) => {
    // D3 object
    let flameGraph;
    // jQuery object
    let $flamegraph = elem.find('.flame-graph-panel');
    let height, width;

    ctrl.events.on('render', () => {
      render();
    });


    function render() {
      if (!ctrl.tree || !setFlamegraphSize()) {
        return;
      }
      if (!flameGraph) {
        flameGraph = d3.flameGraph(d3)
          .width(width)
          .height(height)
          .cellHeight(16)
          .transitionDuration(500)
          .transitionEase(d3.easeCubic)
          .sort(true)
          .title("");
      } else {
        flameGraph.width(width).height(height)
      }

      d3.select("#chart")
        .datum(ctrl.tree)
        .call(flameGraph);

      flameGraph.resetZoom();

      ctrl.events.emit('render-complete', {
        "panelWidth": width
      });
    }

    function setFlamegraphSize() {
      try {
        height = ctrl.height || ctrl.panel.height || ctrl.row.height;
        if (_.isString(height)) {
          height = parseInt(height.replace('px', ''), 10);
        }
        $flamegraph.css('height', height + 'px');

        height = Math.floor($flamegraph.height()) - (ctrl.panel.panelMargin.top + ctrl.panel.panelMargin.bottom);
        width = Math.floor($flamegraph.width()) - (ctrl.panel.panelMargin.left + ctrl.panel.panelMargin.right);

        return true;
      } catch (e) { // IE throws errors sometimes
        return false;
      }
    }

  };
}


