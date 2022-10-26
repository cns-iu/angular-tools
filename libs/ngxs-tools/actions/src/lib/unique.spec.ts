import { actionTypesRegistry, assertUniqueAction } from './unique';


describe(assertUniqueAction, () => {
  beforeEach(() => {
    actionTypesRegistry.clear();
  });

  it('adds the type to the registry', () => {
    assertUniqueAction('test');
    expect(actionTypesRegistry.has('test')).toBeTruthy();
  });

  it('throws if the type is already registered', () => {
    actionTypesRegistry.add('test');
    expect(() => assertUniqueAction('test')).toThrow();
  });
});
