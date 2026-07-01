"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = findDOMNode;
exports.getDOM = getDOM;
exports.isDOM = isDOM;
function isDOM(node) {
  // https://developer.mozilla.org/en-US/docs/Web/API/Element
  // Since XULElement is also subclass of Element, we only need HTMLElement and SVGElement
  return node instanceof HTMLElement || node instanceof SVGElement;
}

/**
 * Retrieves a DOM node via a ref, and does not invoke `findDOMNode`.
 */
function getDOM(node) {
  if (node && typeof node === 'object' && isDOM(node.nativeElement)) {
    return node.nativeElement;
  }
  if (isDOM(node)) {
    return node;
  }
  return null;
}

/**
 * Return if a node is a DOM node. Else will return by `findDOMNode`
 */
function findDOMNode(node) {
  const domNode = getDOM(node);
  if (domNode) {
    return domNode;
  }
  if (node && typeof node === 'object' && 'current' in node) {
    const refDomNode = getDOM(node.current);
    if (refDomNode) {
      return refDomNode;
    }
  }
  return null;
}