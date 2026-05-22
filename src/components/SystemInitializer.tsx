import React, { useEffect } from 'react';
import { useSystemStore } from '../store/systemStore';

export const SystemInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    addPipelineEvent, 
    updateAgentState, 
    setSystemIntelligence 
  } = useSystemStore();

  useEffect(() => {
    // 1. Fetch System Intelligence Snapshot
    const fetchIntelligence = async () => {
      try {
        // Assume default portfolio ID or fetch from somewhere. For now, hardcode or hit endpoints
        // In real app, we need active portfolio. For now, we will query without it or a default.
        // The API might require it. We will fetch portfolios first.
        const portRes = await fetch("/api/portfolio/me");
        if (!portRes.ok) throw new Error("Failed to fetch portfolios");
        const portData = await portRes.json();
        const ports = portData.portfolios;
        if (ports && ports.length > 0) {
          const portfolioId = ports[0].id;
          const intelRes = await fetch(`/api/system/intelligence?portfolioId=${portfolioId}`);
          if (intelRes.ok) {
            const data = await intelRes.json();
            setSystemIntelligence(data);
          } else {
            console.error("System intelligence request failed:", intelRes.statusText);
          }
        }
      } catch (err) {
        console.error("Failed to fetch system intelligence", err);
      }
    };
    
    // Poll loosely every 10s for snapshot updates
    fetchIntelligence();
    const interval = setInterval(fetchIntelligence, 10000);

    // 2. Listen to WebSocket Events for live state updates
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/agent-telemetry`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        // Push event
        addPipelineEvent(msg);

        // Map status logic
        if (msg.agent_name && msg.status) {
           updateAgentState(msg.agent_name, {
             status: msg.status as any,
             lastMessage: msg.message,
           });
        }
      } catch (err) {
        console.error("WS Parse error", err);
      }
    };

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, []);

  return <>{children}</>;
};
