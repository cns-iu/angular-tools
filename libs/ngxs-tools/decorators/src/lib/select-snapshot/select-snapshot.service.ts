import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { StoreConnectable } from '../store-connectable/store-connectable';
import { Selector, SelectSnapshotOptions } from './select-snapshot.decorator';


/** Service for initializing and controlling SelectSnapshot and co. */
@Injectable({ providedIn: 'root' })
export class SelectSnapshotService {
  /**
   * Creates an instance of select SnapshotService
   *
   * @param store Global store
   */
  constructor(private readonly store: Store) { }

  /**
   * Initializes the subscriptions for SelectSnapshot
   *
   * @param instance Instance to connect
   * @param key Property key to store values
   * @param selector Selector to get values
   * @param options Additional options
   */
  initialize(
    instance: StoreConnectable,
    key: PropertyKey,
    selector: Selector<unknown>,
    options?: SelectSnapshotOptions
  ): void {
    const cdr = this.getCdr(instance, options?.markForCheck);
    const sub = this.store.select(selector as string).subscribe(value => {
      (instance as unknown as Record<PropertyKey, unknown>)[key] = value;
      cdr?.markForCheck();
    });

    instance.subscriptions.add(sub);
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
