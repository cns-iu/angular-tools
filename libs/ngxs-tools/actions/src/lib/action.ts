import { assertUniqueAction } from './unique';


/** Action instance */
export type Action = { readonly type: string };
/** Action instance including actions by external libraries */
export type AnyAction = Action | object;

/** Action constructor */
export type ActionConstructor = { readonly type: string } & (new () => Action);
/** Action factory */
export type ActionFactory = (type: string) => ActionConstructor;


/**
 * Create an action base class
 *
 * @param type Unique action type
 * @returns A new class
 * @throws If the type is not unique
 */
export function Action(type: string): ActionConstructor {
  assertUniqueAction(type);

  return class BaseAction {
    static readonly type = type;

    readonly type = type;
  }
}

/**
 * Create an action factory with a prefix
 *
 * @param group Prefix added to all types
 * @returns A factory function
 */
export function ActionGroup(group: string): ActionFactory {
  return type => Action(`[${group}] ${type}`);
}
