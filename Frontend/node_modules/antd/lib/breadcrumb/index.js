"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Breadcrumb = _interopRequireDefault(require("./Breadcrumb"));
var _BreadcrumbItem = _interopRequireDefault(require("./BreadcrumbItem"));
var _BreadcrumbSeparator = _interopRequireDefault(require("./BreadcrumbSeparator"));
const Breadcrumb = _Breadcrumb.default;
Breadcrumb.Item = _BreadcrumbItem.default;
Breadcrumb.Separator = _BreadcrumbSeparator.default;
var _default = exports.default = Breadcrumb;