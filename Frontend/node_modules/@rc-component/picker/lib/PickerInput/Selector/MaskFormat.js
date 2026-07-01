"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var FORMAT_KEYS = ['YYYY', 'MM', 'DD', 'HH', 'mm', 'ss', 'SSS'];
// Use Chinese character to avoid conflict with the mask format
var REPLACE_KEY = '顧';
var MaskFormat = exports.default = /*#__PURE__*/function () {
  function MaskFormat(format) {
    _classCallCheck(this, MaskFormat);
    _defineProperty(this, "format", void 0);
    _defineProperty(this, "maskFormat", void 0);
    _defineProperty(this, "cells", void 0);
    _defineProperty(this, "maskCells", void 0);
    this.format = format;

    // Generate mask format
    var replaceKeys = FORMAT_KEYS.map(function (key) {
      return "(".concat(key, ")");
    }).join('|');
    var replaceReg = new RegExp(replaceKeys, 'g');
    this.maskFormat = format.replace(replaceReg,
    // Use Chinese character to avoid user use it in format
    function (key) {
      return REPLACE_KEY.repeat(key.length);
    });

    // Generate cells
    var cellReg = new RegExp("(".concat(FORMAT_KEYS.join('|'), ")"));
    var strCells = (format.split(cellReg) || []).filter(function (str) {
      return str;
    });
    var offset = 0;
    this.cells = strCells.map(function (text) {
      var mask = FORMAT_KEYS.includes(text);
      var start = offset;
      var end = offset + text.length;
      offset = end;
      return {
        text: text,
        mask: mask,
        start: start,
        end: end
      };
    });

    // Mask cells
    this.maskCells = this.cells.filter(function (cell) {
      return cell.mask;
    });
  }
  _createClass(MaskFormat, [{
    key: "getSelection",
    value: function getSelection(maskCellIndex) {
      var _ref = this.maskCells[maskCellIndex] || {},
        start = _ref.start,
        end = _ref.end;
      return [start || 0, end || 0];
    }

    /** Check given text match format */
  }, {
    key: "match",
    value: function match(text) {
      for (var i = 0; i < this.maskFormat.length; i += 1) {
        var maskChar = this.maskFormat[i];
        var textChar = text[i];
        if (!textChar || maskChar !== REPLACE_KEY && maskChar !== textChar) {
          return false;
        }
      }
      return true;
    }

    /** Get mask cell count */
  }, {
    key: "size",
    value: function size() {
      return this.maskCells.length;
    }
  }, {
    key: "getMaskCellIndex",
    value: function getMaskCellIndex(anchorIndex) {
      var closetDist = Number.MAX_SAFE_INTEGER;
      var closetIndex = 0;
      for (var i = 0; i < this.maskCells.length; i += 1) {
        var _this$maskCells$i = this.maskCells[i],
          start = _this$maskCells$i.start,
          end = _this$maskCells$i.end;
        if (anchorIndex >= start && anchorIndex <= end) {
          return i;
        }
        var dist = Math.min(Math.abs(anchorIndex - start), Math.abs(anchorIndex - end));
        if (dist < closetDist) {
          closetDist = dist;
          closetIndex = i;
        }
      }
      return closetIndex;
    }
  }]);
  return MaskFormat;
}();