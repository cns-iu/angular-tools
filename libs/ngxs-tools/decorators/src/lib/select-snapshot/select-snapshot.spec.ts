import { Injector } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';

import { addInitializer, StoreConnectable } from '../store-connectable/store-connectable';
import { QuerySelectSnapshot, SelectSnapshot } from './select-snapshot.decorator';
import { SelectSnapshotService } from './select-snapshot.service';


jest.mock('../store-connectable/store-connectable');


describe(SelectSnapshot, () => {
  function defineSelectSnapshot() {
    class Test extends StoreConnectable {
      @SelectSnapshot(() => undefined)
      value: unknown;
    }
    return Test;
  }

  it('adds an initializer', () => {
    (addInitializer as jest.Mock).mockClear();
    defineSelectSnapshot();
    expect(addInitializer).toHaveBeenCalled();
  });

  it('calls the SelectSnapshotService to initialize', () => {
    const add = addInitializer as jest.MockedFunction<typeof addInitializer>;
    add.mockClear();
    defineSelectSnapshot();

    const init = add.mock.lastCall[1];
    const instance = new StoreConnectable();
    const initialize = jest.fn();
    const get = instance.injector.get as jest.MockedFunction<Injector['get']>;
    get.mockReturnValue({ initialize });
    init(instance);

    expect(initialize).toHaveBeenCalled();
  });
});

describe(QuerySelectSnapshot, () => {
  function defineQuerySelectSnapshot(query = (value: string) => value) {
    class Test extends StoreConnectable {
      @QuerySelectSnapshot(() => query, ['dep'])
      value: unknown;

      dep = 'abc';
    }
    return Test;
  }

  it('adds an initializer', () => {
    (addInitializer as jest.Mock).mockClear();
    defineQuerySelectSnapshot();
    expect(addInitializer).toHaveBeenCalled();
  });

  it('calls the SelectSnapshotService to initialize', () => {
    const add = addInitializer as jest.MockedFunction<typeof addInitializer>;
    add.mockClear();
    defineQuerySelectSnapshot();

    const init = add.mock.lastCall[1];
    const instance = new StoreConnectable();
    const initialize = jest.fn();
    const get = instance.injector.get as jest.MockedFunction<Injector['get']>;
    get.mockReturnValue({ initialize });
    init(instance);

    expect(initialize).toHaveBeenCalled();
  });

  it('calls the query function when getting the property', () => {
    const query = jest.fn((value: string) => value);
    const add = addInitializer as jest.MockedFunction<typeof addInitializer>;
    add.mockClear();

    const instance = new (defineQuerySelectSnapshot(query));
    const get = instance.injector.get as jest.MockedFunction<Injector['get']>;
    const init = add.mock.lastCall[1];
    get.mockReturnValue({
      initialize(instance: Record<symbol, unknown>, key: symbol) {
        instance[key] = query;
      }
    });
    init(instance);

    expect(instance.value).toEqual(instance.dep);
    expect(query).toHaveBeenCalledWith(instance.dep);
  });
});

describe(SelectSnapshotService, () => {
  const selector = () => undefined;
  let select: Subject<unknown>;
  let store: Store;
  let instance: StoreConnectable;
  let service: SelectSnapshotService;

  beforeEach(() => {
    select = new Subject();
    store = { select: jest.fn().mockReturnValue(select) } as Partial<Store> as Store;
    instance = new StoreConnectable();
    service = new SelectSnapshotService(store);
  });

  describe('initialize', () => {
    it('selects state with using the selector', () => {
      service.initialize(instance, 'prop', selector);
      expect(store.select).toHaveBeenCalledWith(selector);
    });

    it('updates the property with the latest value', () => {
      service.initialize(instance, 'prop', selector);
      select.next(123);
      expect(instance).toHaveProperty('prop', 123);
    });

    it('calls the change detector on value updates', () => {
      const markForCheck = jest.fn();
      (instance.injector.get as jest.MockedFunction<Injector['get']>).mockReturnValue({ markForCheck });
      service.initialize(instance, 'prop', selector);
      select.next(123);
      expect(markForCheck).toHaveBeenCalled();
    });

    it('does not call the change detector if markForCheck option is false', () => {
      const markForCheck = jest.fn();
      (instance.injector.get as jest.MockedFunction<Injector['get']>).mockReturnValue({ markForCheck });
      service.initialize(instance, 'prop', selector, { markForCheck: false });
      select.next(123);
      expect(markForCheck).not.toHaveBeenCalled();
    });
  })
});
