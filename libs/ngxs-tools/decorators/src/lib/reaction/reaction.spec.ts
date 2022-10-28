import { Injector } from '@angular/core';
import { ActionContext, ActionStatus } from '@cns-iu/ngxs-tools/actions';
import { Subject } from 'rxjs';

import { addInitializer, StoreConnectable } from '../store-connectable/store-connectable';
import { Reaction } from './reaction.decorator';
import { ReactionService } from './reaction.service';


jest.mock('../store-connectable/store-connectable');


describe(Reaction, () => {
  function defineReaction(event?: ActionStatus[]) {
    class Test extends StoreConnectable {
      @Reaction({ type: 'test' }, { event })
      reaction() { /* Empty */ }
    }

    return Test;
  }

  it('adds an initializer', () => {
    (addInitializer as jest.Mock).mockClear();
    defineReaction();
    expect(addInitializer).toHaveBeenCalled();
  });

  it('uses the service to initialize instances', () => {
    const add = addInitializer as jest.MockedFunction<typeof addInitializer>;
    add.mockClear();
    defineReaction([ActionStatus.Dispatched]);

    const init = add.mock.lastCall[1];
    const instance = new StoreConnectable();
    const initialize = jest.fn();
    const get = instance.injector.get as jest.MockedFunction<Injector['get']>;
    get.mockReturnValue({ initialize });
    init(instance);

    expect(initialize).toHaveBeenCalled();
  });
});

describe(ReactionService, () => {
  let actions: Subject<ActionContext>;
  let service: ReactionService;

  beforeEach(() => {
    actions = new Subject();
    service = new ReactionService(actions);
  });

  describe('initialize', () => {
    class Test extends StoreConnectable {
      handler() { /* Empty */ }
    }

    const types = new Set(['test']);
    const events = new Set([ActionStatus.Successful]);
    const passingEvent = { action: { type: 'test' }, status: ActionStatus.Successful };
    let instance: Test;

    beforeEach(() => {
      instance = new Test();
    });

    it('calls the handler on action events', () => {
      const handler = jest.spyOn(instance, 'handler');
      service.initialize(instance, 'handler', types, events);
      actions.next(passingEvent);
      expect(handler).toHaveBeenCalledWith(passingEvent.action, passingEvent.status, undefined);
    });

    it('marks the instance for change detection', () => {
      const markForCheck = jest.fn();
      const get = instance.injector.get as jest.MockedFunction<Injector['get']>;
      get.mockReturnValue({ markForCheck });
      service.initialize(instance, 'handler', types, events);
      actions.next(passingEvent);
      expect(markForCheck).toHaveBeenCalled();
    });

    it('never calls markForCheck if option is set to false', () => {
      const markForCheck = jest.fn();
      const get = instance.injector.get as jest.MockedFunction<Injector['get']>;
      get.mockReturnValue({ markForCheck });
      service.initialize(instance, 'handler', types, events, { markForCheck: false });
      actions.next(passingEvent);
      expect(markForCheck).not.toHaveBeenCalled();
    });
  });
});
