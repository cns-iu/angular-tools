import { Store } from '@ngxs/store';

import { checkStoreConnectable, StoreConnectable } from '../store-connectable/store-connectable';
import { Dispatch } from './dispatch.decorator';
import { DispatchService } from './dispatch.service';


jest.mock('../store-connectable/store-connectable');


describe(Dispatch, () => {
  function defineMethodClass() {
    class Test extends StoreConnectable {
      @Dispatch()
      method() {
        return null;
      }
    }
    return Test;
  }

  function definePropertyClass() {
    class Test extends StoreConnectable {
      @Dispatch()
      property? = () => null;
    }
    return Test;
  }

  function defineInvalidClass() {
    class Test extends StoreConnectable {
      @Dispatch()
      get fail() {
        return undefined;
      }
    }
    return Test;
  }

  it('checks that the decorated class is store connectable', () => {
    (checkStoreConnectable as jest.MockedFunction<typeof checkStoreConnectable>).mockClear();
    defineMethodClass();
    expect(checkStoreConnectable).toHaveBeenCalled();
  });

  it('can be applied to methods', () => {
    expect(defineMethodClass).not.toThrow();
  });

  it('can be applied to properties', () => {
    expect(definePropertyClass).not.toThrow();
  });

  it('throws if applied to anything other than a method or property', () => {
    expect(defineInvalidClass).toThrowError(/dispatch/i);
  });

  describe('property method', () => {
    it('can be set to undefined', () => {
      const instance = new (definePropertyClass());
      expect(() => (instance.property = undefined)).not.toThrow();
    });

    it('returns undefined if not set', () => {
      const instance = new (definePropertyClass());
      instance.property = undefined;
      expect(instance.property).toBeUndefined();
    });
  });

  describe('on method call', () => {
    function setInjector(instance: unknown) {
      const dispatch = jest.fn<unknown, [StoreConnectable, unknown]>();
      (instance as Record<'injector', unknown>).injector = {
        get: () => ({ dispatch })
      };

      return dispatch;
    }

    it('calls the original method', () => {
      const instance = new (definePropertyClass());
      const method = jest.fn();
      setInjector(instance);
      instance.property = method;
      instance.property();
      expect(method).toHaveBeenCalled();
    });

    it('calls dispatch on DispatchService', () => {
      const instance = new (defineMethodClass());
      const dispatch = setInjector(instance);
      instance.method();
      expect(dispatch).toHaveBeenCalledWith(instance, null);
    });
  });
});

describe(DispatchService, () => {
  const action1 = { type: 'custom action' };
  let store: Store;
  let instance: StoreConnectable;
  let service: DispatchService;

  beforeEach(() => {
    store = { dispatch: jest.fn() } as Partial<Store> as Store;
    instance = new StoreConnectable();
    service = new DispatchService(store);
  });

  describe('dispatch', () => {
    it('accepts action objects input', () => {
      service.dispatch(instance, action1);
      expect(store.dispatch).toHaveBeenCalledWith(action1)
    });

    it('accepts anything convertable to observable as input', () => {
      service.dispatch(instance, [action1]);
      expect(store.dispatch).toHaveBeenCalledWith(action1);
    });

    it('does nothing for null values', () => {
      service.dispatch(instance, null);
      expect(instance.subscriptions.add).not.toHaveBeenCalled();
    });

    it('throws for undefined values', () => {
      expect(() => {
        // @ts-expect-error Runtime check for Dispatch decorator
        service.dispatch(instance, undefined);
      }).toThrow();
    });

    it('throws for non-observable inputs', () => {
      expect(() => service.dispatch(instance, { bad: 'type' })).toThrow();
    });
  });
});
