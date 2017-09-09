'use strict';

System.register(['app/plugins/sdk', 'app/core/time_series2', 'app/core/utils/kbn', 'app/core/config', 'lodash', 'jquery', './d3_bundle', './sample', './sample2', './external/d3.flameGraph.css!', './css/flame-graph-panel.css!'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, TimeSeries, kbn, config, _, $, d3, sample, sample2, _createClass, panelDefaults, FlameGraphCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_appCoreTime_series) {
      TimeSeries = _appCoreTime_series.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_appCoreConfig) {
      config = _appCoreConfig.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_d3_bundle) {
      d3 = _d3_bundle;
    }, function (_sample) {
      sample = _sample.default;
    }, function (_sample2) {
      sample2 = _sample2.default;
    }, function (_externalD3FlameGraphCss) {}, function (_cssFlameGraphPanelCss) {}],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      panelDefaults = {
        mapping: {
          signatureFieldName: 'signature',
          signatureSeparator: '#'
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
        colorSingle: '#C05018'
      };

      _export('MetricsPanelCtrl', _export('FlameGraphCtrl', FlameGraphCtrl = function (_MetricsPanelCtrl) {
        _inherits(FlameGraphCtrl, _MetricsPanelCtrl);

        function FlameGraphCtrl($scope, $injector) {
          _classCallCheck(this, FlameGraphCtrl);

          var _this = _possibleConstructorReturn(this, (FlameGraphCtrl.__proto__ || Object.getPrototypeOf(FlameGraphCtrl)).call(this, $scope, $injector));

          _.defaultsDeep(_this.panel, panelDefaults);

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-error', _this.onDataError.bind(_this));
          _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));

          _this.panelWidth = null;
          _this.panelHeight = null;
          return _this;
        }

        _createClass(FlameGraphCtrl, [{
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            // determine the path to this plugin
            var panels = grafanaBootData.settings.panels;
            var thisPanel = panels[this.pluginId];
            var thisPanelPath = thisPanel.baseUrl + '/';
            // add the relative path to the editor
            var editorPath = thisPanelPath + 'editor.html';

            this.addEditorTab('Options', editorPath, 2);
          }
        }, {
          key: 'onDataError',
          value: function onDataError(err) {
            this.onDataReceived([]);
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            var data = dataList.map(this.tableHandler.bind(this));
            if (!data || data.length === 0) {
              // const error = new Error();
              // error.message = 'No data or malformed series';
              // error.data = 'FlameGraph Panel expects at least 1 serie with signature column.\n\nResponse:\n' + JSON.stringify(data);
              // throw error;
              return;
            }

            this.tree = this.setValues(data[0]);

            var panelTitleOffset = 0;
            if (this.panel.title !== "") panelTitleOffset = 25;
            this.panelWidth = this.getPanelWidthBySpan();
            this.panelHeight = this.getPanelHeight() - panelTitleOffset;

            this.render();
          }
        }, {
          key: 'getPanelWidthBySpan',
          value: function getPanelWidthBySpan() {
            var viewPortWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            // get the pixels of a span
            var pixelsPerSpan = viewPortWidth / 12;
            // multiply num spans by pixelsPerSpan
            return Math.round(this.panel.span * pixelsPerSpan) - this.panel.panelMargin.left - this.panel.panelMargin.right;
          }
        }, {
          key: 'getPanelHeight',
          value: function getPanelHeight() {
            // panel can have a fixed height via options
            var tmpPanelHeight = this.panel.height;
            // if that is blank, try to get it from our row
            if (typeof tmpPanelHeight === 'undefined') {
              // get from the row instead
              tmpPanelHeight = this.row.height;
              // default to 250px if that was undefined also
              if (typeof tmpPanelHeight === 'undefined') {
                tmpPanelHeight = 250;
              }
            } else {
              // convert to numeric value
              tmpPanelHeight = tmpPanelHeight.replace("px", "");
            }
            return parseInt(tmpPanelHeight) - this.panel.panelMargin.top - this.panel.panelMargin.bottom;
          }
        }, {
          key: 'getColumnId',
          value: function getColumnId(data, columnName) {
            for (var i = 0; i < data.columns.length; i++) {
              if (data.columns[i].text === columnName) return i;
            }
            return null;
          }
        }, {
          key: 'setValueRec',
          value: function setValueRec(tree, signature, value) {
            // `signature` is the current node
            if (signature.length == 0) {
              tree.value = value;
              return tree;
            }

            var currentPart = signature[0];
            signature.shift();

            // already existing children
            for (var i = 0; i < tree.children.length; i++) {
              if (tree.children[i].name === currentPart) return this.setValueRec(tree.children[i], signature, value);
            }

            // new children
            tree.children.push(this.setValueRec({ name: currentPart, value: value, children: [] }, signature, value));
            return tree;
          }
        }, {
          key: 'setValues',
          value: function setValues(data) {
            var _this2 = this;

            return Object.keys(data).reduce(function (acc, current) {
              // in case of data based on time (round)
              if (data[current] == 0) data[current] = 1;
              _this2.setValueRec(acc, current.split(_this2.panel.mapping.signatureSeparator), data[current]
              // data[current] == 0 ? 1 : data[current]
              );
              return acc;
            }.bind(this), { name: 'root', value: 1, children: [] });
          }
        }, {
          key: 'tableHandler',
          value: function tableHandler(tableData) {
            var columnIdSignature = this.getColumnId(tableData, this.panel.mapping.signatureFieldName);
            var columnIdValue = this.getColumnId(tableData, 'Value');

            if (columnIdSignature == null || columnIdValue == null) {
              console.error('columns:', tableData.columns);
              console.error('signature column name:', this.panel.mapping.signatureFieldName);
              var error = new Error();
              error.message = 'No data or malformed series';
              error.data = 'Metric query returns ' + tableData.rows.length + ' series. FlameGraph Panel expects at least 1 serie with signature column.\n\nResponse:\n' + JSON.stringify(tableData);
              throw error;
            }

            return tableData.rows.reduce(function (acc, current) {
              var signature = current[columnIdSignature];
              if (acc[signature] == null) acc[signature] = current[columnIdValue];else acc[signature] += current[columnIdValue];
              // DEBUG
              // acc[signature] = 1;
              return acc;
            }, {});
          }
        }, {
          key: 'colorFunction_random',
          value: function colorFunction_random() {}
        }, {
          key: 'colorFunction_single',
          value: function colorFunction_single() {}
        }, {
          key: 'colorFunction_module',
          value: function colorFunction_module() {}
        }, {
          key: 'colorFunction_scale',
          value: function colorFunction_scale() {}
        }, {
          key: 'setFrameColor',
          value: function setFrameColor() {
            var colorFunctions = {
              'random': colorFunction_random,
              'single': colorFunction_single,
              'module': colorFunction_module,
              'scale': colorFunction_scale
            };
            if (colorFunctions[this.colorFunction]) colorFunctions[this.colorFunction]();
          }
        }, {
          key: 'link',
          value: function link(scope, elem, attrs, ctrl) {
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
              var flameGraph = d3.flameGraph(d3).width(ctrl.panelWidth).cellHeight(18).transitionDuration(750).transitionEase(d3.easeCubic).sort(true).title("");

              d3.select("#chart").datum(ctrl.tree).call(flameGraph);

              setTimeout(function () {
                flameGraph.resetZoom();
              }, 5000);
            }

            this.events.on('render', function () {
              render();
              ctrl.renderingCompleted();
            });
          }
        }]);

        return FlameGraphCtrl;
      }(MetricsPanelCtrl)));

      FlameGraphCtrl.templateUrl = 'module.html';

      _export('FlameGraphCtrl', FlameGraphCtrl);

      _export('MetricsPanelCtrl', FlameGraphCtrl);
    }
  };
});
//# sourceMappingURL=flame_graph_ctrl.js.map
