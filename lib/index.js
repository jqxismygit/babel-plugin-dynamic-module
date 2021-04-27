"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

function _react() {
  var data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var defaultModules = ['@sensoro/core', '@sensoro/layout', '@sensoro/library'];

function sourceFormatter(moduleName) {
  return "window._".concat(moduleName.replace(/\@/g, '').replace(/\//g, ''), "_");
}

function _default(_ref) {
  var types = _ref.types,
      template = _ref.template;
  return {
    name: 'babel-plugin-dynamic-module',
    visitor: {
      ImportDeclaration: function ImportDeclaration(path, state) {
        var node = path.node;
        var opts = state.opts;
        var _opts$modules = opts.modules,
            modules = _opts$modules === void 0 ? defaultModules : _opts$modules; // path maybe removed by prev instances.

        if (modules.indexOf(node.source.value) === -1 || !node) return;
        var source = sourceFormatter(node.source.value); //导出的默认

        var defaultExport;
        var exports = [];
        node.specifiers.forEach(function (specifier) {
          if (specifier.type === 'ImportSpecifier') {
            if (specifier.imported.name === 'default' && specifier.imported.name !== specifier.local.name) {
              defaultExport = specifier.local.name;
            } else if (specifier.imported.name !== specifier.local.name) {
              exports.push({
                imported: specifier.imported.name,
                local: specifier.local.name
              });
            } else {
              exports.push(specifier.local.name);
            }
          } else if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier') {
            defaultExport = specifier.local.name;
          }
        });
        var sourceString = '';

        if (defaultExport) {
          sourceString = "const ".concat(defaultExport, " = ").concat(source, ";");
        }

        if (exports.length > 0) {
          sourceString += "const {";
          exports.forEach(function (element) {
            if (_typeof(element) === 'object') {
              sourceString += "".concat(element.imported, ":").concat(element.local);
            } else {
              sourceString += "".concat(element, ",");
            }
          });
          sourceString += "} = ".concat(defaultExport ? defaultExport : source);
        }

        var ast = template.ast(sourceString);

        if (defaultExport && exports.length > 0) {
          path.replaceWithMultiple(ast);
        } else {
          path.replaceWith(ast);
        }
      }
    }
  };
}