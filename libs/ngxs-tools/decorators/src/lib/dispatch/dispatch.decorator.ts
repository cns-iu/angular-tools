import { AnyAction } from '@cns-iu/ngxs-tools/actions';
import { ObservableInput } from 'rxjs';

import { checkStoreConnectable, StoreConnectable } from '../store-connectable/store-connectable';
import { DispatchService } from './dispatch.service';


/** Any method type */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMethod = (this: any, ...args: any[]) => any;

/** Possible return types for dispatch decorated methods */
export type Dispatchable = AnyAction | AnyAction[] | ObservableInput<AnyAction | AnyAction[]> | null;

/**
 * Wraps a method to dispatch the returned actions
 *
 * @param method Original method
 * @returns New method
 */
function createDispatcher(method: AnyMethod): AnyMethod {
  return function (this: StoreConnectable, ...args: unknown[]): unknown {
    const result = method.apply(this, args);
    this.injector.get(DispatchService).dispatch(this, result);
    return result;
  }
}

/**
 * Decorates a property to automatically wrap values with action dispatching
 *
 * @param target Class prototype
 * @param key Property key
 */
function decorateProperty(target: unknown, key: PropertyKey): void {
  const methodKey = Symbol(`__dispatch_method_${String(key)}`);
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: false,
    get(): AnyMethod {
      return this[methodKey];
    },
    set(method: AnyMethod | undefined) {
      this[methodKey] = method && createDispatcher(method).bind(this);
    }
  });
}

/**
 * Wraps a method with action dispatching
 *
 * @param desc Method property descriptor
 */
function decorateMethod(desc: PropertyDescriptor): void {
  desc.value = createDispatcher(desc.value);
}

/**
 * Decorate a method or property method to automatically dispatch the
 * return value as actions on the store. The decorated method can return
 * an action, array of actions, anything convertable to an observable
 * of actions (such as promises, iterators, etc.), or `null` to skip dispatching.
 * Further more property methods are automatically bound to their instance.
 *
 * @returns Decorator function
 * @throws If not applied to a method or property
 *
 * @example <caption>Method decorator</caption>
 * class MethodDispatching extends StoreConnectable {
 *   @Dispatch()
 *   method(): Dispatchable {
 *     return null;
 *   }
 * }
 *
 * @example <caption>Property decorator</caption>
 * class PropertyMethodDispatching extends StoreConnectable {
 *   @Dispatch()
 *   readonly property = () => null;
 * }
 */
export function Dispatch(): PropertyDecorator & MethodDecorator {
  return (target: object, key: PropertyKey, desc?: PropertyDescriptor) => {
    checkStoreConnectable(target);

    if (!desc) {
      decorateProperty(target, key);
    } else if (typeof desc.value === 'function') {
      decorateMethod(desc);
    } else {
      const msg = '@Dispatch() can only be applied to a method or property';
      throw new Error(msg);
    }
  };
}
