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
 *
 * @example <caption>Simple action</caption>
 * class CustomAction extends Action('custom') { }
 *
 * @example <caption>Action with parameters</caption>
 * class CustomAction extends Action('custom') {
 *   constructor(readonly value: number) { super(); }
 * }
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
 *
 * @example <caption>Create multiple actions with a common prefix</caption>
 * const Action = ActionGroup('MyGroup')
 *
 * // type = '[MyGroup] action-1'
 * class Action1 extends Action('action-1') {}
 *
 * // type = '[MyGroup] action-2'
 * class Action2 extends Action('action-2') {}
 */
export function ActionGroup(group: string): ActionFactory {
  return type => Action(`[${group}] ${type}`);
}
