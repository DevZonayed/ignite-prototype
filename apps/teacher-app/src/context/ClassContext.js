import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { listClasses } from '../api/endpoints';
import { useApi } from '../api/useApi';

/**
 * The teacher's classes, and which one the app is currently showing.
 *
 * Nearly every teaching screen is scoped to one class, and asking each of them
 * to fetch the class list separately would mean the same request several times
 * per navigation and no shared idea of "the current class". This holds both.
 *
 * A teacher with no classes yet is a normal state, not an error: `activeClass`
 * stays null and screens show their empty state.
 */
const ClassContext = createContext({
  classes: [],
  activeClass: null,
  activeClassId: null,
  setActiveClassId: () => {},
  loading: false,
  error: null,
  reload: () => {},
});

export function ClassProvider({ children }) {
  const { data: classes, error, loading, reload } = useApi(() => listClasses(), [], {
    initial: [],
  });
  const [selectedId, setSelectedId] = useState(null);

  // Default to the first class once they arrive, and recover if the selected
  // class disappears (reassigned, deleted) rather than showing a blank screen.
  useEffect(() => {
    if (!classes?.length) {
      if (selectedId !== null) setSelectedId(null);
      return;
    }
    const stillThere = classes.some((c) => c.id === selectedId);
    if (!stillThere) setSelectedId(classes[0].id);
  }, [classes, selectedId]);

  const value = useMemo(() => {
    const activeClass = (classes || []).find((c) => c.id === selectedId) ?? null;
    return {
      classes: classes || [],
      activeClass,
      activeClassId: activeClass?.id ?? null,
      setActiveClassId: setSelectedId,
      loading,
      error,
      reload,
    };
  }, [classes, selectedId, loading, error, reload]);

  return <ClassContext.Provider value={value}>{children}</ClassContext.Provider>;
}

export function useClasses() {
  return useContext(ClassContext);
}
