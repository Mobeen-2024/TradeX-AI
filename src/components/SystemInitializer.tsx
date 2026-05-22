import React, { useEffect } from "react";
import { useSystemStore } from "../store/systemStore";

export const SystemInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { connectWebSocket, fetchInitialData } = useSystemStore();

  useEffect(() => {
    connectWebSocket();
    fetchInitialData();
  }, [connectWebSocket, fetchInitialData]);

  return <>{children}</>;
};
