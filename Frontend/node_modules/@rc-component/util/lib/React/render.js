"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = render;
exports.unmount = unmount;
var _client = require("react-dom/client");
const MARK = '__rc_react_root__';

// ========================== Render ==========================

function render(node, container) {
  const root = container[MARK] || (0, _client.createRoot)(container);
  root.render(node);
  container[MARK] = root;
}

// ========================= Unmount ==========================
async function unmount(container) {
  // Delay to unmount to avoid React 18 sync warning
  return Promise.resolve().then(() => {
    container[MARK]?.unmount();
    delete container[MARK];
  });
}