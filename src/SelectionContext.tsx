import React from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

export interface ISelectionContext<T> {
  isSelected: (item: T) => boolean;
  selectGroup: (items: T[]) => void;
  selectSingle: (item: T) => void;
  unselectGroup: (items: T[]) => void;
  getSelected: () => T[];
  unselectAll: () => void;
}

export const SelectionContext = createContext<ISelectionContext<any> | null>(
  null
);

interface SelectionProviderProps<T> {
  children: React.ReactNode;
  getId: (item: T) => string;
}

export function SelectionProvider<T>({
  children,
  getId,
}: SelectionProviderProps<T>) {
  const [selected, setSelected] = useState<Map<string, T>>(new Map());

  const value = useMemo<ISelectionContext<T>>(() => {
    const isSelected = (item: T) => selected.has(getId(item));

    const selectGroup = (items: T[]) => {
      setSelected((current) => {
        const newSelection = new Map(current);
        items.forEach((item) => newSelection.set(getId(item), item));
        return newSelection;
      });
    };

    const selectSingle = (item: T) => {
      setSelected((current) => {
        const id = getId(item);
        const newSelection = new Map(current);
        if (newSelection.has(id)) {
          newSelection.delete(id);
        } else {
          newSelection.set(id, item);
        }
        return newSelection;
      });
    };

    const unselectGroup = (items: T[]) => {
      setSelected((current) => {
        const newSelection = new Map(current);
        items.forEach((item) => newSelection.delete(getId(item)));
        return newSelection;
      });
    };

    const getSelected = () => Array.from(selected.values());

    const unselectAll = () => setSelected(new Map());

    return {
      isSelected,
      selectGroup,
      selectSingle,
      unselectGroup,
      getSelected,
      unselectAll,
    };
  }, [selected, getId]);

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection<T>() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context as ISelectionContext<T>;
}
