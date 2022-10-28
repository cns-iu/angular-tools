import { inject, Injector } from '@angular/core';
import { addInitializer, checkStoreConnectable, INITIALIZERS, StoreConnectable } from './store-connectable';


jest.mock('@angular/core');


describe(checkStoreConnectable, () => {
  it('returns nothing if connectable', () => {
    expect(() => checkStoreConnectable(StoreConnectable)).not.toThrow();
  });

  it('throws if not connectable', () => {
    expect(() => checkStoreConnectable(class {})).toThrow();
  });

  it('can check prototypes', () => {
    expect(() => checkStoreConnectable(StoreConnectable.prototype)).not.toThrow();
  });
});

describe(addInitializer, () => {
  it('adds the initializer on the class', () => {
    class Test extends StoreConnectable { };
    const init = () => undefined;
    addInitializer(Test, init);
    // @ts-expect-error Untyped access
    expect(Test[INITIALIZERS]).toEqual([undefined, init]);
  });
});

describe(StoreConnectable, () => {
  it('injects the instance injector', () => {
    new StoreConnectable();
    expect(inject).toHaveBeenCalledWith(Injector);
  });

  it('runs initializers', () => {
    class Test extends StoreConnectable { };
    const init = jest.fn();
    addInitializer(Test, init);
    const instance = new Test();
    expect(init).toHaveBeenCalledWith(instance);
  });

  it('runs parent initializers', () => {
    class Base extends StoreConnectable { }
    class Derived extends Base { }
    const init1 = jest.fn();
    const init2 = jest.fn();
    addInitializer(Base, init1);
    addInitializer(Derived, init2);
    new Derived();

    expect(init1).toHaveBeenCalled();
    expect(init2).toHaveBeenCalled();
  });

  it('clears subscriptions on destroy', () => {
    const instance = new StoreConnectable();
    const spy = jest.spyOn(instance.subscriptions, 'unsubscribe');
    instance.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});
