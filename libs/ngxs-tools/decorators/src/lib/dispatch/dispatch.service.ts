import { Injectable } from '@angular/core';
import { AnyAction } from '@cns-iu/ngxs-tools/actions';
import { getActionTypeFromInstance, Store } from '@ngxs/store';
import { from, mergeMap, Observable, ObservableInput, of } from 'rxjs';

import { StoreConnectable } from '../store-connectable/store-connectable';
import { Dispatchable } from './dispatch.decorator';


/** Service for dispatching actions */
@Injectable({ providedIn: 'root' })
export class DispatchService {
  /**
   * Creates an instance of DispatchService
   *
   * @param store Global store
   */
  constructor(private readonly store: Store) { }

  /**
   * Dispatches actions
   *
   * @param instance The instance from which the actions originated
   * @param value The dispatchable actions
   * @throws If the value cannot be converted to an observable of actions
   */
  dispatch(instance: StoreConnectable, value: Dispatchable): void {
    if (value != null) {
      const obs = this.toObservable(value).pipe(
        mergeMap(actions => this.store.dispatch(actions))
      );

      instance.subscriptions.add(obs.subscribe());
    } else if (value === undefined) {
      const msg = 'Returning `undefined` from a @Dispatch() method may indicate a programmer error\n' +
        'Explicitly return `null` or `[]` instead';
      throw new Error(msg);
    }
  }

  /**
   * Converts a dispatchable value to an observable of actions
   *
   * @param value The value to convert
   * @returns An observable of actions
   * @throws If the value cannot be converted to an observable of actions
   */
  private toObservable(value: NonNullable<Dispatchable>): Observable<AnyAction | AnyAction[]> {
    if (getActionTypeFromInstance(value) !== undefined) {
      return of(value as AnyAction);
    }

    try {
      return from(value as ObservableInput<AnyAction | AnyAction[]>);
    } catch (_error) {
      const msg = `Bad return value from a @Dispatch() method, got: ${value}`;
      throw new Error(msg)
    }
  }
}
