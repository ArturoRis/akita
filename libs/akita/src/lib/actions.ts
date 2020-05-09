export const currentAction = {
  type: null,
  entityIds: null,
  skip: false,
  payload: null,
};

let customActionActive = false;

export function resetCustomAction() {
  customActionActive = false;
}

// public API for custom actions. Custom action always wins
export function logAction(type: string, entityIds?, payload?) {
  setAction(type, entityIds, payload);
  customActionActive = true;
}

export function setAction(type: string, entityIds?, payload?) {
  if (customActionActive === false) {
    currentAction.type = type;
    currentAction.entityIds = entityIds;
    currentAction.payload = payload;
  }
}

export function setSkipAction(skip = true) {
  currentAction.skip = skip;
}

export function action(action: string, entityIds?) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function(...args) {
      const payload = getArgsNames(originalMethod).reduce((acc, argName, i) => {
        acc[argName] = args[i];
        return acc;
      }, {});
      logAction(action, entityIds, payload);
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// The function that automagically extract args names from the function.
// Code from https://stackoverflow.com/a/31194949
function getArgsNames(func) {
  return (func + '')
    .replace(/[/][/].*$/gm, '') // strip single-line comments
    .replace(/\s+/g, '') // strip white space
    .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments
    .split('){', 1)[0]
    .replace(/^[^(]*[(]/, '') // extract the parameters
    .replace(/=[^,]+/g, '') // strip any ES6 defaults
    .split(',')
    .filter(Boolean); // split & filter [""]
}
