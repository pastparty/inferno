import { combineFrom, isNull } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { InfernoNode, VNode } from './../../core/types';

// We need EMPTY_OBJ defined in one place.
// Its used for comparison so we cant inline it into shared
export const EMPTY_OBJ = {};
export const Fragment: string = '$F';
export const LIFECYCLE: Function[] = [];

if (process.env.NODE_ENV !== 'production') {
  Object.freeze(EMPTY_OBJ);
}

export function appendChild(parentDOM, dom) {
  parentDOM.appendChild(dom);
}

export function insertOrAppend(parentDOM: Element, newNode, nextNode) {
  if (isNull(nextNode)) {
    appendChild(parentDOM, newNode);
  } else {
    parentDOM.insertBefore(newNode, nextNode);
  }
}

export function documentCreateElement(tag, isSVG: boolean): Element {
  if (isSVG) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }

  return document.createElement(tag);
}

export function replaceChild(parentDOM: Element, newDom, lastDom) {
  parentDOM.replaceChild(newDom, lastDom);
}

export function removeChild(parentDOM: Element, childNode: Element) {
  parentDOM.removeChild(childNode);
}

export function callAll(arrayFn: Function[]) {
  let listener;
  while ((listener = arrayFn.shift()) !== undefined) {
    listener();
  }
}

export function findDOMfromVNode(vNode: VNode) {
  let flags;
  let children;

  while (vNode) {
    flags = vNode.flags;

    if (flags & VNodeFlags.DOMRef) {
      return vNode.dom;
    }

    children = vNode.children;

    if (flags & VNodeFlags.Fragment) {
      vNode = vNode.childFlags === ChildFlags.HasVNodeChildren ? (children as VNode) : (children as VNode[])[0];
    } else if (flags & VNodeFlags.ComponentClass) {
      vNode = (children as any).$LI;
    } else {
      vNode = children;
    }
  }

  return null;
}

export function removeVNodeDOM(vNode: VNode, parentDOM: Element) {
  const flags = vNode.flags;

  if (flags & VNodeFlags.DOMRef) {
    removeChild(parentDOM, vNode.dom as Element);
  } else {
    const children = vNode.children as any;

    if (flags & VNodeFlags.ComponentClass) {
      removeVNodeDOM(children.$LI, parentDOM);
    } else if (flags & VNodeFlags.ComponentFunction) {
      removeVNodeDOM(children, parentDOM);
    } else if (flags & VNodeFlags.Fragment) {
      if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
        removeVNodeDOM(children, parentDOM);
      } else {
        for (let i = 0, len = children.length; i < len; i++) {
          removeVNodeDOM(children[i], parentDOM);
        }
      }
    }
  }
}

export function moveVNodeDOM(vNode, parentDOM, nextNode) {
  const flags = vNode.flags;

  if (flags & VNodeFlags.DOMRef) {
    insertOrAppend(parentDOM, vNode.dom, nextNode);
  } else {
    const children = vNode.children as any;

    if (flags & VNodeFlags.ComponentClass) {
      moveVNodeDOM(children.$LI, parentDOM, nextNode);
    } else if (flags & VNodeFlags.ComponentFunction) {
      moveVNodeDOM(children, parentDOM, nextNode);
    } else if (flags & VNodeFlags.Fragment) {
      if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
        moveVNodeDOM(children, parentDOM, nextNode);
      } else {
        for (let i = 0, len = children.length; i < len; i++) {
          moveVNodeDOM(children[i], parentDOM, nextNode);
        }
      }
    }
  }
}

export function getComponentName(instance): string {
  // Fallback for IE
  return instance.name || instance.displayName || instance.constructor.name || (instance.toString().match(/^function\s*([^\s(]+)/) || [])[1];
}

export function createDerivedState(instance, nextProps, state) {
  if (instance.constructor.getDerivedStateFromProps) {
    return combineFrom(state, instance.constructor.getDerivedStateFromProps(nextProps, state));
  }

  return state;
}

export const options: {
  componentComparator: ((lastVNode: VNode, nextVNode: VNode) => boolean) | null;
  createVNode: ((vNode: VNode) => void) | null;
  renderComplete: ((rootInput: VNode | InfernoNode, parentDOM: Element | SVGAElement | ShadowRoot | DocumentFragment | HTMLElement | Node) => void) | null;
  reactStyles?: boolean;
} = {
  componentComparator: null,
  createVNode: null,
  renderComplete: null
};
