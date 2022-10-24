
/** All registered action types */
const registeredActionTypes = new Set<string>();


/**
 * Asserts that an action type has not already been registered
 *
 * @param type Action type
 * @throws If type was previously registered
 */
export function assertUniqueAction(type: string): void {
  if (registeredActionTypes.has(type)) {
    const msg = `An action with type '${type}' already exists`;
    throw new Error(msg);
  }

  registeredActionTypes.add(type);
}
