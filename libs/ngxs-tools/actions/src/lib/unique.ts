
/** All registered action types */
export const actionTypesRegistry = new Set<string>();


/**
 * Asserts that an action type has not already been registered
 *
 * @param type Action type
 * @throws If type was previously registered
 */
export function assertUniqueAction(type: string): void {
  if (actionTypesRegistry.has(type)) {
    const msg = `An action with type '${type}' already exists`;
    throw new Error(msg);
  }

  actionTypesRegistry.add(type);
}
