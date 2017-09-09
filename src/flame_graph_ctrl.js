
import {MetricsPanelCtrl} from 'app/plugins/sdk';


import TimeSeries from 'app/core/time_series2';
import kbn from 'app/core/utils/kbn';
import config from 'app/core/config';

import _ from 'lodash';
import $ from 'jquery';
import * as d3 from './d3_bundle';

import sample from './sample';
import sample2 from './sample2';

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

class FlameGraphCtrl extends MetricsPanelCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);
    _.defaultsDeep(this.panel, panelDefaults);

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));

    this.panelWidth = null;
    this.panelHeight = null;
  }

  onInitEditMode() {
    // determine the path to this plugin
    var panels = grafanaBootData.settings.panels;
    var thisPanel = panels[this.pluginId];
    var thisPanelPath = thisPanel.baseUrl + '/';
    // add the relative path to the editor
    var editorPath = thisPanelPath + 'editor.html';

    this.addEditorTab('Options', editorPath, 2);
  }

  onDataError(err) {
    this.onDataReceived([]);
  }

  onDataReceived(dataList) {
    const data = dataList.map(this.tableHandler.bind(this));
    if (!data || data.length === 0) {
      // const error = new Error();
      // error.message = 'No data or malformed series';
      // error.data = 'FlameGraph Panel expects at least 1 serie with signature column.\n\nResponse:\n' + JSON.stringify(data);
      // throw error;
      return;
    }

    this.tree = this.setValues(data[0]);
    
    let panelTitleOffset = 0;
    if (this.panel.title !== "")
      panelTitleOffset = 25;
    this.panelWidth = this.getPanelWidthBySpan();
    this.panelHeight = this.getPanelHeight() - panelTitleOffset;
    
    this.render();
  }

  getPanelWidthBySpan() {
    const viewPortWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    // get the pixels of a span
    const pixelsPerSpan = viewPortWidth / 12;
    // multiply num spans by pixelsPerSpan
    return Math.round(this.panel.span * pixelsPerSpan) - this.panel.panelMargin.left - this.panel.panelMargin.right;
  }

  getPanelHeight() {
    // panel can have a fixed height via options
    let tmpPanelHeight = this.panel.height;
    // if that is blank, try to get it from our row
    if (typeof tmpPanelHeight === 'undefined') {
      // get from the row instead
      tmpPanelHeight = this.row.height;
      // default to 250px if that was undefined also
      if (typeof tmpPanelHeight === 'undefined') {
        tmpPanelHeight = 250;
      }
    }
    else {
      // convert to numeric value
      tmpPanelHeight = tmpPanelHeight.replace("px","");
    }
    return parseInt(tmpPanelHeight) - this.panel.panelMargin.top - this.panel.panelMargin.bottom;
  }

  getColumnId(data, columnName) {
    for (let i = 0; i < data.columns.length; i++) {
      if (data.columns[i].text === columnName)
        return i;
    }
    return null;
  }

  setValueRec(tree, signature, value) {
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
  }

  setValues(data) {
    return Object.keys(data).reduce(((acc, current) => {
      // in case of data based on time (round)
      if (data[current] == 0)
        data[current] = 1;
      this.setValueRec(
        acc,
        current.split(this.panel.mapping.signatureSeparator),
        data[current]
        // data[current] == 0 ? 1 : data[current]
      );
      return acc;
    }).bind(this), {name: 'root', value: 1, children: []});
  }

  tableHandler(tableData) {
    const columnIdSignature = this.getColumnId(tableData, this.panel.mapping.signatureFieldName);
    const columnIdValue = this.getColumnId(tableData, 'Value');
    
    if (columnIdSignature == null || columnIdValue == null) {
      console.error('columns:', tableData.columns);
      console.error('signature column name:', this.panel.mapping.signatureFieldName);
      const error = new Error();
      error.message = 'No data or malformed series';
      error.data = 'Metric query returns ' + tableData.rows.length +
        ' series. FlameGraph Panel expects at least 1 serie with signature column.\n\nResponse:\n'+JSON.stringify(tableData);
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
  }

  colorFunction_random() {
  }
  colorFunction_single() {
  }
  colorFunction_module() {
  }
  colorFunction_scale() {
  }

  setFrameColor() {
    const colorFunctions = {
      'random': colorFunction_random,
      'single': colorFunction_single,
      'module': colorFunction_module,
      'scale': colorFunction_scale,
    };
    if (colorFunctions[this.colorFunction])
      colorFunctions[this.colorFunction]();
  }

  link(scope, elem, attrs, ctrl) {
    elem = elem.find('.grafana-flamegraph-panel');
    
    function render() {
      if (!ctrl.tree) {
        return;
      }
      // console.log(JSON.stringify(ctrl.tree));

      // ctrl.tree = sample2;

      // console.info(ctrl.tree);
      // ctrl.panel.height = 900;
      // console.log(ctrl.panelWidth);
      const flameGraph = d3.flameGraph(d3)
        .width(ctrl.panelWidth)
        .cellHeight(18)
        .transitionDuration(750)
        .transitionEase(d3.easeCubic)
        .sort(true)
        .title("");

      d3.select("#chart")
        .datum(ctrl.tree)
        .call(flameGraph);

      setTimeout(function () {
        flameGraph.resetZoom();
      }, 5000);
    }

    this.events.on('render', () => {
      render();
      ctrl.renderingCompleted();
    });

  }
}

FlameGraphCtrl.templateUrl = 'module.html';

export {
	FlameGraphCtrl,
	FlameGraphCtrl as MetricsPanelCtrl
};
