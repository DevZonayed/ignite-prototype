import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { listChildren } from '../api/endpoints';
import { useApi } from '../api/useApi';

/**
 * The parent's children, and which one the app is currently showing.
 *
 * Every screen in this app is scoped to one child, and the switcher has to
 * agree with all of them, so the list and the selection live here rather than
 * being refetched and re-derived per screen.
 */
const ChildContext = createContext({
  children: [],
  activeChild: null,
  activeChildId: null,
  setActiveChildId: () => {},
  loading: false,
  error: null,
  reload: () => {},
});

export function ChildProvider({ children: node }) {
  const { data, error, loading, reload } = useApi(() => listChildren(), [], { initial: [] });
  const [selectedId, setSelectedId] = useState(null);

  // Default to the first child once they arrive, and recover if the selected
  // one disappears rather than showing a blank screen.
  useEffect(() => {
    if (!data?.length) {
      if (selectedId !== null) setSelectedId(null);
      return;
    }
    if (!data.some((c) => c.id === selectedId)) setSelectedId(data[0].id);
  }, [data, selectedId]);

  const value = useMemo(() => {
    const list = data || [];
    const activeChild = list.find((c) => c.id === selectedId) ?? null;
    return {
      children: list,
      activeChild,
      activeChildId: activeChild?.id ?? null,
      setActiveChildId: setSelectedId,
      loading,
      error,
      reload,
    };
  }, [data, selectedId, loading, error, reload]);

  return <ChildContext.Provider value={value}>{node}</ChildContext.Provider>;
}

export function useChildren() {
  return useContext(ChildContext);
}
