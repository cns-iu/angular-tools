import { Action, ActionGroup } from './action';

jest.mock('./unique');

describe(Action, () => {
  const type = 'test';

  it('creates a new class', () => {
    expect(Action(type)).toEqual(expect.any(Function));
  });

  it('has a type property', () => {
    expect(Action(type)).toHaveProperty('type', type);
  });

  it('has a type property on new instances', () => {
    expect(new (Action(type))).toHaveProperty('type', type);
  });
});

describe(ActionGroup, () => {
  const group = 'group';
  const type = 'test';

  it('creates a factory', () => {
    expect(ActionGroup(group)).toEqual(expect.any(Function));
  });

  it('prepends the group to type', () => {
    expect(ActionGroup(group)(type)).toHaveProperty('type', expect.stringContaining(group));
  });
});
