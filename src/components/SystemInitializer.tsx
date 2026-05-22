import React, { useEffect } from "react";
import { useSystemStore } from "../store/systemStore";

export const SystemInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { connectWebSocket } = useSystemStore();

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  return <>{children}</>;
};
