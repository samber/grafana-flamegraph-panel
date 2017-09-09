"use strict";

System.register([], function (_export, _context) {
  "use strict";

  return {
    setters: [],
    execute: function () {
      _export("default", {
        "name": "root",
        "value": 1,
        "children": [{
          "name": "(root)",
          "value": 1,
          "children": [{
            "name": "_handle.close",
            "value": 1,
            "children": [{
              "name": "emit",
              "value": 1,
              "children": [{
                "name": "emitOne",
                "value": 1,
                "children": [{
                  "name": "socketOnClose",
                  "value": 1,
                  "children": [{
                    "name": "freeParser",
                    "value": 31,
                    "children": []
                  }]
                }]
              }]
            }]
          }, {
            "name": "onParserExecute",
            "value": 1,
            "children": [{
              "name": "onParserExecuteCommon",
              "value": 31,
              "children": []
            }]
          }, {
            "name": "parserOnMessageComplete",
            "value": 31,
            "children": [{
              "name": "Readable.push",
              "value": 1,
              "children": [{
                "name": "readableAddChunk",
                "value": 1,
                "children": [{
                  "name": "chunkInvalid",
                  "value": 31,
                  "children": []
                }]
              }]
            }, {
              "name": "readStart",
              "value": 31,
              "children": []
            }]
          }]
        }]
      });
    }
  };
});
//# sourceMappingURL=sample2.js.map
