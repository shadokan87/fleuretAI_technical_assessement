"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface Tray {
  id: string;
  name: string;
  vulnerabilityIds: string[];
}

interface TrayContextType {
  trays: Tray[];
  activeTrayId: string | null;
  setActiveTrayId: (id: string | null) => void;
  createTray: (name: string) => Tray;
  deleteTray: (id: string) => void;
  renameTray: (id: string, name: string) => void;
  addToTray: (trayId: string, vulnId: string) => void;
  removeFromTray: (trayId: string, vulnId: string) => void;
  manageModalOpen: boolean;
  manageModalDefaultValue: string | null;
  openManageModal: (defaultValue?: string) => void;
  closeManageModal: () => void;
  autoActivateOnAdd: boolean;
  setAutoActivateOnAdd: (value: boolean) => void;
}

const TrayContext = createContext<TrayContextType | undefined>(undefined);

let nextTrayId = 1;

export function TrayProvider({ children }: { children: ReactNode }) {
  const [trays, setTrays] = useState<Tray[]>([]);
  const [activeTrayId, setActiveTrayId] = useState<string | null>(null);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [manageModalDefaultValue, setManageModalDefaultValue] = useState<string | null>(null);
  const [autoActivateOnAdd, setAutoActivateOnAdd] = useState(true);

  const createTray = useCallback((name: string) => {
    const id = `tray-${nextTrayId++}`;
    const tray: Tray = { id, name, vulnerabilityIds: [] };
    setTrays((prev) => [...prev, tray]);
    if (!activeTrayId) setActiveTrayId(id);
    return tray;
  }, [activeTrayId]);

  const deleteTray = useCallback((id: string) => {
    setTrays((prev) => prev.filter((t) => t.id !== id));
    setActiveTrayId((prev) => (prev === id ? null : prev));
  }, []);

  const renameTray = useCallback((id: string, name: string) => {
    setTrays((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
  }, []);

  const addToTray = useCallback((trayId: string, vulnId: string) => {
    setTrays((prev) =>
      prev.map((t) =>
        t.id === trayId && !t.vulnerabilityIds.includes(vulnId)
          ? { ...t, vulnerabilityIds: [...t.vulnerabilityIds, vulnId] }
          : t
      )
    );
    if (autoActivateOnAdd) setActiveTrayId(trayId);
  }, [autoActivateOnAdd]);

  const removeFromTray = useCallback((trayId: string, vulnId: string) => {
    setTrays((prev) =>
      prev.map((t) =>
        t.id === trayId
          ? { ...t, vulnerabilityIds: t.vulnerabilityIds.filter((v) => v !== vulnId) }
          : t
      )
    );
  }, []);

  const openManageModal = useCallback((defaultValue?: string) => {
    setManageModalDefaultValue(defaultValue ?? null);
    setManageModalOpen(true);
  }, []);
  const closeManageModal = useCallback(() => {
    setManageModalOpen(false);
    setManageModalDefaultValue(null);
  }, []);

  return (
    <TrayContext.Provider
      value={{
        trays,
        activeTrayId,
        setActiveTrayId,
        createTray,
        deleteTray,
        renameTray,
        addToTray,
        removeFromTray,
        manageModalOpen,
        manageModalDefaultValue,
        openManageModal,
        closeManageModal,
        autoActivateOnAdd,
        setAutoActivateOnAdd,
      }}
    >
      {children}
    </TrayContext.Provider>
  );
}

export function useTray() {
  const ctx = useContext(TrayContext);
  if (!ctx) {
    throw new Error("useTray must be used within a TrayProvider");
  }
  return ctx;
}
