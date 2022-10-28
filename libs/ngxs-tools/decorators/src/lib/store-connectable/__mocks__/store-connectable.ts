/// <reference types="jest" />

export const checkStoreConnectable = jest.fn();
export const addInitializer = jest.fn();

export class StoreConnectable {
  injector = {
    get: jest.fn((...args: unknown[]) => {
      if (args.length > 1) {
        return args[1];
      }

      throw new Error('Injector token not found');
    })
  }

  subscriptions = {
    add: jest.fn()
  }
}
