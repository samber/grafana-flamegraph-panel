'use strict';

System.register(['./external/d3.v4', './external/d3.tip.js', './external/d3.flameGraph.js'], function (_export, _context) {
  "use strict";

  return {
    setters: [function (_externalD3V) {
      var _exportObj = {};

      for (var _key in _externalD3V) {
        if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _externalD3V[_key];
      }

      _export(_exportObj);
    }, function (_externalD3TipJs) {
      var _exportObj2 = {};
      _exportObj2.tip = _externalD3TipJs.default;

      _export(_exportObj2);
    }, function (_externalD3FlameGraphJs) {
      var _exportObj3 = {};
      _exportObj3.flameGraph = _externalD3FlameGraphJs.default;

      _export(_exportObj3);
    }],
    execute: function () {}
  };
});
//# sourceMappingURL=d3_bundle.js.map
