import { ChangeDetectorRef, Injectable } from '@angular/core';
import { ActionContext, ActionStatus } from '@cns-iu/ngxs-tools/actions';
import { Actions, getActionTypeFromInstance } from '@ngxs/store';
import { filter, Observable } from 'rxjs';

import { StoreConnectable } from '../store-connectable/store-connectable';

import type { ReactionHandler, ReactionOptions } from './reaction.decorator';


/** Service for initializing reactions */
@Injectable({ providedIn: 'root' })
export class ReactionService {
  /**
   * Creates an instance of ReactionService
   *
   * @param actions Store action events
   */
  constructor(private readonly actions: Actions) { }

  /**
   * Initializes a reaction subscription for an instance
   *
   * @param instance Instance to send events to
   * @param key Instance method property
   * @param types Action types to react to
   * @param events Events to react to
   * @param options Additional options
   */
  initialize(
    instance: StoreConnectable,
    key: PropertyKey,
    types: Set<string>,
    events: Set<ActionStatus>,
    options?: ReactionOptions
  ): void {
    type HandlerObj = Record<PropertyKey, ReactionHandler>;
    const actions = this.filterActions(types, events);
    const cdr = this.getCdr(instance, options?.markForCheck);
    const handler = instance as unknown as HandlerObj;
    const sub = actions.subscribe(({ action, status, error }) => {
      const result = handler[key](action, status, error);
      result !== false && cdr?.markForCheck();
    });

    instance.subscriptions.add(sub);
  }

  /**
   * Filters actions by type and status
   *
   * @param types Action types
   * @param events Action events
   * @returns Filtered actions
   */
  private filterActions(types: Set<string>, events: Set<ActionStatus>): Observable<ActionContext> {
    return this.actions.pipe(
      filter(({ action, status }: ActionContext) => {
        const type = getActionTypeFromInstance(action) as string;
        return types.has(type) && events.has(status);
      })
    );
  }

  /**
   * Gets a reference to the instance's change detector or
   * null if it doesn't exist or is disabled
   *
   * @param instance Instance to get change detector
   * @param markForCheck Whether change detection is disabled
   * @returns Change detector or null
   */
  private getCdr(instance: StoreConnectable, markForCheck?: boolean): ChangeDetectorRef | null {
    return markForCheck !== false ?
      instance.injector.get(ChangeDetectorRef, null) : null;
  }
}
