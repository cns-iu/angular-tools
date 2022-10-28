import { ProviderToken, Type } from '@angular/core';
import { StateToken } from '@ngxs/store';

import { addInitializer, StoreConnectable } from '../store-connectable/store-connectable';
import { isPropertyKey } from '../utils';
import { SelectSnapshotService } from './select-snapshot.service';


/** Helper to remove warnings */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

/** Creates a tuple of the same length but with different elements */
type SameLengthTuple<T, U, Res extends U[] = []> =
  T extends [Any, ...infer Rest] ? SameLengthTuple<Rest, U, [...Res, U]> : Res;

/** Selector types */
export type Selector<T> = ((...args: Any[]) => T) | StateToken<T> | Type<unknown> | string;

/** Query selector type */
export type QuerySelector<T, Args extends Any[]> = (...args: Any[]) => (...qargs: Args) => T;

/** SelectSnapshot and related decorators options */
export interface SelectSnapshotOptions {
  /** Whether to mark for change detection when a new value is set */
  markForCheck?: boolean;
}


/**
 * Selects part of the state an writes it to the specified property.
 * It automatically calls ChangeDetectorRef.markForCheck if available (and not disabled)
 * whenever the value changes.
 *
 * @param selector State selector
 * @param [options] Additional options
 * @returns Decorator function
 *
 * @example <caption>Select state</caption>
 * class MyComponent extends StoreConnectable {
 *   @SelectSnapshot(myselector)
 *   value: string;
 * }
 *
 * @example <caption>Using setter</caption>
 * class MyComponent extends StoreConnectable {
 *   @SelectSnapshot(myselector)
 *   set value(v: number) {
 *     // Do something interesting
 *     // Note that this may be called before the instance has been
 *     // fully initialized so use with care!
 *   }
 * }
 */
export function SelectSnapshot<T>(selector: Selector<T>, options?: SelectSnapshotOptions): PropertyDecorator {
  return (target, key) => addInitializer(target, instance => {
    const service = instance.injector.get(SelectSnapshotService);
    service.initialize(instance, key, selector, options);
  });
}

/**
 * Selects a part of the state with a query function. Equivalent to using a
 * regular SelectSnapshot together with a getter to do the querying.
 *
 * @param selector Query selector
 * @param deps Dependencies, either properties or injection tokens
 * @param options Additional options
 * @returns Decorator function
 */
export function QuerySelectSnapshot<T, Args extends Any[]>(
  selector: QuerySelector<T, Args>,
  deps: SameLengthTuple<Args, PropertyKey | ProviderToken<Any>>,
  options?: SelectSnapshotOptions
): PropertyDecorator {
  return (target, key) => {
    const queryKey = Symbol(`__query_method_${String(key)}`);
    type InstanceType = StoreConnectable & { [queryKey]: (...args: Args) => T } & Record<PropertyKey, Any>;

    SelectSnapshot(selector, options)(target, queryKey);
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: true,
      get(this: InstanceType) {
        const { injector, [queryKey]: query } = this;
        const values = deps.map(dep => isPropertyKey(dep) ? this[dep] : injector.get(dep));
        return query.apply(query, values as Args);
      }
    });
  }
}
