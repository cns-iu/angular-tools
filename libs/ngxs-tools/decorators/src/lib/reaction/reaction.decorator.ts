import { Action, ActionStatus } from '@cns-iu/ngxs-tools/actions';
import { getActionTypeFromInstance } from '@ngxs/store';

import { addInitializer } from '../store-connectable/store-connectable';
import { castArray } from '../utils';
import { ReactionService } from './reaction.service';


/** Reaction decorator options */
export interface ReactionOptions {
  /** Action events to listen for (default: ActionStatus.Successful) */
  event?: ActionStatus | ActionStatus[];
  /** Whether to mark the instance for change detection after reaction call (default: true) */
  markForCheck?: boolean;
}

/** Type of reaction methods */
export type ReactionHandler = <T>(action: T, status: ActionStatus, error?: Error) => false | void;


/**
 * Decorates a method to be called each time a specified action event happens.
 *
 * @param actions Actions to listen to
 * @param options Additional options
 * @returns Decorator function
 *
 * @example <caption>Simple usage</caption>
 * class ReactionClass extends StoreConnectable {
 *   @Reaction(MyAction)
 *   reaction(action: MyAction) {
 *     // Do something interesting
 *   }
 * }
 */
export function Reaction(
  actions: Action | Action[],
  options?: ReactionOptions
): PropertyDecorator {
  const types = new Set(castArray(actions).map(
    action => getActionTypeFromInstance(action) as string
  ));
  const events = new Set(castArray(options?.event ?? ActionStatus.Successful));

  return (target, key) => addInitializer(target, instance => {
    const service = instance.injector.get(ReactionService);
    service.initialize(instance, key, types, events, options);
  });
}
