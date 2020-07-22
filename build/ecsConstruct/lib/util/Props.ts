//
// This custom module implements a decorator approach to organizing
// the way resources are shared between stacks.
//
// To use, decorate any stack class definition with @exportsProps
// and any exportable property with @prop. The result will be a
// method `getProps` attached to the stack instance. Invoking this
// function will retrieve a Map object containing all of the named
// properties and their corresponding resources. This object can
// then be used as the "props" argument to another stack constructor.

// Map to hold prop metadata
const propsMap: Map<string, { [key: string]: string }> = new Map();

// @exportProps class decorator
export function exportsProps(name?: string) {
  return function(f: Function) {
    f.prototype.getProps = function(this) {
      const _props = propsMap.get(f.name);
      const retProps: { [key: string]: any } = {};
      if (_props) {
        Object.keys(_props).forEach(k => (retProps[k] = this[k]));
      }
      return name ? { [name]: retProps } : { [f.name]: retProps };
    };
  };
}

// @prop property decorator implementation
export function prop<T extends object>(target: T, property: string): void {
  let prop = propsMap.get(target.constructor.name);
  if (!prop) {
    prop = {};
  }
  prop[property] = property;
  propsMap.set(target.constructor.name, prop);
}
