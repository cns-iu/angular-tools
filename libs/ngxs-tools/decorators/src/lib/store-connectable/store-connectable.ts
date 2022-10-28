import { inject, Injectable, Injector, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';


/** Initializer callback */
export type InitializerFn = (instance: StoreConnectable) => void;

/** Initializers with optional reference to parent initializers */
type Initializers = [parent?: Initializers, ...initFns: InitializerFn[]];


/** Used to indicate that a class extends StoreConnectable */
const STORE_CONNECTABLE_MARKER = Symbol('StoreConnectableMarker');

/** Token used to store initializer functions */
export const INITIALIZERS = Symbol('Initializers');

/** StoreConnectable constructor type */
interface StoreConnectableConstructor extends Function {
  /** Whether the class extends StoreConnectable */
  [STORE_CONNECTABLE_MARKER]?: boolean;
  /** Initializer functions */
  [INITIALIZERS]?: Initializers;
}


/**
 * Test whether an object has an own property
 *
 * @param obj The object
 * @param property Property key
 * @returns true if property is an own property, false otherwise
 */
function hasOwn(obj: object, property: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(obj, property);
}

/**
 * Gets the constructor function for a class
 *
 * @param target The constructor or prototype
 * @returns The constructor
 */
function getConstructor(target: object): StoreConnectableConstructor {
  type StoreConnectablePrototype = Record<'constructor', StoreConnectableConstructor>;
  return typeof target === 'function' ?
    target : (target as StoreConnectablePrototype).constructor;
}

/**
 * Applies all initializers to an instance
 *
 * @param initializers Initializer functions
 * @param instance Class instance
 */
function applyInitializers(initializers: Initializers, instance: StoreConnectable): void {
  const [parent, ...initFns] = initializers;
  parent && applyInitializers(parent, instance);
  initFns.forEach(init => init(instance));
}

/**
 * Checks whether a class (or its prototype) extends StoreConnectable
 *
 * @param target The object to check
 * @throws If the target is not store connectable
 */
export function checkStoreConnectable(target: object): void {
  const constructor = getConstructor(target);
  if (!constructor[STORE_CONNECTABLE_MARKER]) {
    const msg = `${constructor.name} does not extends StoreConnectable`;
    throw new Error(msg);
  }
}

/**
 * Adds an initializer function to a class
 *
 * @param target The constructor or prototype
 * @param init Initializer function to add
 */
export function addInitializer(target: object, init: InitializerFn): void {
  checkStoreConnectable(target);

  const constructor = getConstructor(target);
  if (!hasOwn(constructor, INITIALIZERS)) {
    constructor[INITIALIZERS] = [constructor[INITIALIZERS]];
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  constructor[INITIALIZERS]!.push(init);
}


/**
 * Base class to extend to be able to use decorators defined in this entry point
 */
@Injectable()
export class StoreConnectable implements OnDestroy {
  /** Class marker */
  static readonly [STORE_CONNECTABLE_MARKER] = true;

  /** Reference to the instance's injector */
  readonly injector = inject(Injector);
  /** Managed subscriptions */
  readonly subscriptions = new Subscription();

  /**
   * Creates an instance of StoreConnectable. Runs all defined initializers
   */
  constructor() {
    const constructor = this.constructor as StoreConnectableConstructor;
    const initializers = constructor[INITIALIZERS] ?? [];
    applyInitializers(initializers, this);
  }

  /**
   * Clean up all subscriptions
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
