import { act, renderHook } from '@testing-library/react';
import { SelectionProvider, useSelection } from './SelectionContext';

type Item = { id: string; name: string };
const getId = (item: Item) => item.id;

describe('SelectionProvider', () => {
  it('should correctly determine if an item is selected', () => {
    const { result } = renderHook(() => useSelection<Item>(), {
      wrapper: ({ children }) => (
        <SelectionProvider getId={getId}>{children}</SelectionProvider>
      ),
    });

    const item = { id: '1', name: 'Item 1' };
    expect(result.current.isSelected(item)).toBe(false);

    act(() => {
      result.current.selectGroup([item]);
    });

    expect(result.current.isSelected(item)).toBe(true);
  });

  it('should select a group of items', () => {
    const { result } = renderHook(() => useSelection<Item>(), {
      wrapper: ({ children }) => (
        <SelectionProvider getId={getId}>{children}</SelectionProvider>
      ),
    });

    const items = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ];

    act(() => {
      result.current.selectGroup(items);
    });

    expect(result.current.getSelected()).toEqual(items);
  });

  it('should toggle selection of a single item', () => {
    const { result } = renderHook(() => useSelection<Item>(), {
      wrapper: ({ children }) => (
        <SelectionProvider getId={getId}>{children}</SelectionProvider>
      ),
    });

    const item = { id: '1', name: 'Item 1' };

    act(() => {
      result.current.selectSingle(item);
    });
    expect(result.current.isSelected(item)).toBe(true);

    act(() => {
      result.current.selectSingle(item);
    });
    expect(result.current.isSelected(item)).toBe(false);
  });

  it('should unselect a group of items', () => {
    const { result } = renderHook(() => useSelection<Item>(), {
      wrapper: ({ children }) => (
        <SelectionProvider getId={getId}>{children}</SelectionProvider>
      ),
    });

    const items = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ];

    act(() => {
      result.current.selectGroup(items);
    });
    expect(result.current.getSelected()).toEqual(items);

    act(() => {
      result.current.unselectGroup(items);
    });
    expect(result.current.getSelected()).toEqual([]);
  });

  it('should clear all selections', () => {
    const { result } = renderHook(() => useSelection<Item>(), {
      wrapper: ({ children }) => (
        <SelectionProvider getId={getId}>{children}</SelectionProvider>
      ),
    });

    const items = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ];

    act(() => {
      result.current.selectGroup(items);
    });
    expect(result.current.getSelected()).toEqual(items);

    act(() => {
      result.current.unselectAll();
    });
    expect(result.current.getSelected()).toEqual([]);
  });
});
