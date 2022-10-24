/**
 * Definitions should come directly from ngxs in a future version
 * https://github.com/ngxs/store/pull/1766
 */
import { AnyAction } from './action';



/** Action lifecycle status */
export const enum ActionStatus {
  Dispatched = 'DISPATCHED',
  Successful = 'SUCCESSFUL',
  Canceled = 'CANCELED',
  Errored = 'ERRORED'
}

/** Context emitted by ngxs' `Actions` injectable */
export interface ActionContext<T = AnyAction> {
  /** Status */
  status: ActionStatus;
  /** Action */
  action: T;
  /** Cause if status === Errored */
  error?: Error;
}
