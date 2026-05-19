# Agent Pipelines & Orchestration

Institutional grade platforms rely on non-blocking event-driven architectures:

1. **Market Event Ingestion:** External APIs push ticks to our system.
2. **Analysis Trigger:** Ticks hit a Kafka/Redis topic.
3. **Agent Activation:** Node.js backend subscribes to the topic. The **Risk-Guardian** is triggered immediately to validate margin. If valid, the **Quant Agent** utilizes Gemini to build a rationale.
4. **Broadcast:** Results are pushed to the client via WebSockets.
