'use strict';

System.register(['app/plugins/sdk', 'lodash', './d3_bundle', './external/d3.flameGraph.css!', './css/flame-graph-panel.css!'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _, d3, panelDefaults, FlameGraphCtrl;

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
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_d3_bundle) {
      d3 = _d3_bundle;
    }, function (_externalD3FlameGraphCss) {}, function (_cssFlameGraphPanelCss) {}],
    execute: function () {
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

      _export('FlameGraphCtrl', FlameGraphCtrl = function (_MetricsPanelCtrl) {
        _inherits(FlameGraphCtrl, _MetricsPanelCtrl);

        function FlameGraphCtrl($scope, $injector) {
          _classCallCheck(this, FlameGraphCtrl);

          var _this = _possibleConstructorReturn(this, (FlameGraphCtrl.__proto__ || Object.getPrototypeOf(FlameGraphCtrl)).call(this, $scope, $injector));

          _this.onInitEditMode = function () {
            // determine the path to this plugin
            var panels = grafanaBootData.settings.panels;
            var thisPanel = panels[_this.pluginId];
            var thisPanelPath = thisPanel.baseUrl + '/';
            // add the relative path to the editor
            var editorPath = thisPanelPath + 'editor.html';

            _this.addEditorTab('Options', editorPath, 2);
          };

          _this.onDataError = function (err) {
            _this.onDataReceived([]);
          };

          _this.onDataReceived = function (dataList) {
            var data = dataList.map(_this.tableHandler.bind(_this));
            if (!data || data.length === 0) {
              return;
            }

            _this.tree = _this.setValues(data[0]);
            _this.render();
          };

          _this.getColumnId = function (data, columnName) {
            for (var i = 0; i < data.columns.length; i++) {
              if (data.columns[i].text === columnName) return i;
            }
            return null;
          };

          _this.setValueRec = function (tree, signature, value) {
            // `signature` is the current node
            if (signature.length == 0) {
              tree.value = value;
              return tree;
            }

            var currentPart = signature[0];
            signature.shift();

            // already existing children
            for (var i = 0; i < tree.children.length; i++) {
              if (tree.children[i].name === currentPart) return _this.setValueRec(tree.children[i], signature, value);
            }

            // new children
            tree.children.push(_this.setValueRec({ name: currentPart, value: value, children: [] }, signature, value));
            return tree;
          };

          _this.setValues = function (data) {
            var tree = Object.keys(data).reduce(function (acc, current) {
              // in case of data based on time (round)
              if (data[current] == 0) {
                data[current] = 1;
              }
              _this.setValueRec(acc, current.split(_this.panel.mapping.signatureSeparator), data[current]);
              return acc;
            }.bind(_this), { name: 'root', value: 1, children: [] });
            return tree;
          };

          _this.tableHandler = function (tableData) {
            var columnIdSignature = _this.getColumnId(tableData, _this.panel.mapping.signatureFieldName);
            var columnIdValue = _this.getColumnId(tableData, 'Value');

            if (columnIdSignature == null || columnIdValue == null) {
              console.error('columns:', tableData.columns);
              console.error('signature column name:', _this.panel.mapping.signatureFieldName);
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
          };

          _this.colorFunction_random = function () {};

          _this.colorFunction_single = function () {};

          _this.colorFunction_module = function () {};

          _this.colorFunction_scale = function () {};

          _this.setFrameColor = function () {
            var colorFunctions = {
              'random': colorFunction_random,
              'single': colorFunction_single,
              'module': colorFunction_module,
              'scale': colorFunction_scale
            };
            if (colorFunctions[_this.colorFunction]) colorFunctions[_this.colorFunction]();
          };

          _this.onRender = function () {
            if (typeof _this.tree == 'undefined') {
              return;
            }
          };

          _this.onRenderComplete = function (data) {
            _this.panel.panelWidth = data.panelWidth;
            _this.renderingCompleted();
          };

          _this.link = function (scope, elem, attrs, ctrl) {
            // D3 object
            var flameGraph = void 0;
            // jQuery object
            var $flamegraph = elem.find('.flame-graph-panel');
            var height = void 0,
                width = void 0;

            ctrl.events.on('render', function () {
              render();
            });

            function render() {
              if (!ctrl.tree || !setFlamegraphSize()) {
                return;
              }
              if (!flameGraph) {
                flameGraph = d3.flameGraph(d3).width(width).height(height).cellHeight(16).transitionDuration(500).transitionEase(d3.easeCubic).sort(true).title("");
              } else {
                flameGraph.width(width).height(height);
              }

              d3.select("#chart").datum(ctrl.tree).call(flameGraph);

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
              } catch (e) {
                // IE throws errors sometimes
                return false;
              }
            }
          };

          _.defaultsDeep(_this.panel, panelDefaults);

          _this.events.on('data-received', _this.onDataReceived);
          _this.events.on('data-snapshot-load', _this.onDataReceived);
          _this.events.on('init-edit-mode', _this.onInitEditMode);
          _this.events.on('data-error', _this.onDataError);

          _this.events.on('render', _this.onRender);
          // custom event from link -> render()
          _this.events.on('render-complete', _this.onRenderComplete);
          return _this;
        }

        return FlameGraphCtrl;
      }(MetricsPanelCtrl));

      _export('FlameGraphCtrl', FlameGraphCtrl);

      FlameGraphCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=flame_graph_ctrl.js.map
