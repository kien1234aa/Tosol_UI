import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ListScreenFilterPickerSessionValue = {
  activeKey: string | null;
  requestOpen: (key: string) => void;
  requestClose: () => void;
};

const ListScreenFilterPickerSessionContext =
  createContext<ListScreenFilterPickerSessionValue | null>(null);

export function ListScreenFilterPickerSessionProvider({
  children,
  sheetVisible = true,
}: {
  children: ReactNode;
  /** Đóng sheet lọc → đóng luôn picker con đang mở. */
  sheetVisible?: boolean;
}) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const requestOpen = useCallback((key: string) => {
    setActiveKey(key);
  }, []);
  const requestClose = useCallback(() => {
    setActiveKey(null);
  }, []);

  useEffect(() => {
    if (!sheetVisible) {
      setActiveKey(null);
    }
  }, [sheetVisible]);

  const value = useMemo(
    () => ({ activeKey, requestOpen, requestClose }),
    [activeKey, requestOpen, requestClose],
  );

  return (
    <ListScreenFilterPickerSessionContext.Provider value={value}>
      {children}
    </ListScreenFilterPickerSessionContext.Provider>
  );
}

export function useListScreenFilterPickerSession() {
  return useContext(ListScreenFilterPickerSessionContext);
}
