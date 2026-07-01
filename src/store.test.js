import { describe, it, expect, vi } from 'vitest';
import { createStore } from './store.js';

describe('createStore', () => {
  it('returns initial state', () => {
    const store = createStore({ count: 0 });
    expect(store.getState()).toEqual({ count: 0 });
  });

  it('merges patches into state via setState', () => {
    const store = createStore({ count: 0, name: 'a' });
    store.setState({ count: 1 });
    expect(store.getState()).toEqual({ count: 1, name: 'a' });
  });

  it('notifies subscribers with the new state on setState', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.setState({ count: 5 });
    expect(listener).toHaveBeenCalledWith({ count: 5 });
  });

  it('stops notifying after unsubscribe', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.setState({ count: 5 });
    expect(listener).not.toHaveBeenCalled();
  });
});
