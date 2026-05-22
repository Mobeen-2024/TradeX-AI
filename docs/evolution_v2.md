# V2 System Evolution Architecture

## 1. Architecture Changes

* **Decoupled Logical Clock**: To use the existing event pipeline for backtesting, we must replace `CURRENT_TIMESTAMP` with a simulated Logical Clock. Events will carry a `logical_timestamp`. The event dispatcher runs in "simulation mode", advancing time only when all worker queues are empty for the current tick.
* **Execution Simulator Layer**: Introduce a middle layer between trade intent generation and execution logging. This intercepts approved trade decisions and applies empirical models for synthetic slippage, latency blocks, and spread expansion based on current market volatility and trade volume.
* **Continuous Feedback Engine**: Introduce an outcome evaluator pipeline. After closing a trade, this calculates predicted alpha vs actual alpha, mapping the trade context and decision to the outcome for future RAG (Retrieval-Augmented Generation).

## 2. Required DB Schema Updates

```sql
-- Adaptive Risk Parameters (Portfolio Level)
CREATE TABLE portfolio_risk_controls (
    portfolio_id UUID PRIMARY KEY,
    current_drawdown DECIMAL(5,2) DEFAULT 0.0,
    max_position_size DECIMAL(10,2),
    volatility_scaler DECIMAL(5,2) DEFAULT 1.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Realism Modeling (Execution Metrics)
CREATE TABLE execution_metrics (
    trade_id UUID PRIMARY KEY,
    intended_price DECIMAL(18,8),
    executed_price DECIMAL(18,8),
    slippage_bps DECIMAL(5,2),
    latency_ms INTEGER,
    spread_paid DECIMAL(18,8)
);

-- Agent Learning & Feedback Loop
CREATE TABLE trade_outcomes (
    trade_id UUID PRIMARY KEY,
    correlation_id UUID,
    decision_context JSONB,
    predicted_alpha DECIMAL(5,2),
    actual_alpha DECIMAL(5,2),
    expectancy_contribution DECIMAL(10,4),
    feedback_vector vector(1536) -- Emdedding for Agent RAG
);

-- Real-time Performance Tracking
CREATE TABLE portfolio_metrics_history (
    id SERIAL PRIMARY KEY,
    portfolio_id UUID,
    logical_time TIMESTAMP WITH TIME ZONE,
    portfolio_value DECIMAL(18,8),
    daily_return DECIMAL(5,4),
    rolling_sharpe DECIMAL(5,2),
    rolling_drawdown DECIMAL(5,2),
    win_rate DECIMAL(5,2)
);
```

## 3. Agent Modifications

* **RiskGuardian (Dynamic Sizing)**: Transitions from binary Pass/Fail output to dynamic size allocation. Evaluates Kelly Criterion constraints scaled dynamically by the `volatility_scaler` state. Also enforces trailing drawdown thresholds.
* **Coordinator (Confidence Index)**: Requires emitting a precise expected `confidence_score` (0.00-1.00) alongside specific Alpha horizons (e.g. "estimating +2% margin over 4 hours").
* **All Decision Agents (RAG Memory)**: Adds a learning context retrieval step. Before deciding, the agents query `trade_outcomes` for the closest 5 similar market contexts, observing past mispredictions to avoid repeating errors.

## 4. New Services/Workers

* **ExecutionSimulatorWorker**: Listens to `TRADE_APPROVED` events. Models capacity impact, injects synthetic network/venue latency queues, computes slippage delta, and emits `TRADE_EXECUTED` back to the system.
* **MetricsAggregatorWorker**: Listens to `MARKET_TICK` and `TRADE_EXECUTED`. Continuously maintains the rolling dataset to update `portfolio_metrics_history` (Sharpe, Drawdown, Expectancy), triggering `MARGIN_WARNING` if limits are clipped.
* **OutcomeEvaluatorWorker**: Off-cycle asynchronous worker. Runs when a position is closed. Analyzes the sequence, compares actual return to the Coordinator's original logged expectation, and generates an optimized vector summary for `trade_outcomes`.

## 5. Risks & Tradeoffs

* **Logical vs. Wall Time Synchronization**: Running an idempotency-based asynchronous worker system in backtest mode creates state race conditions if a backtest tick advances faster than worker evaluations. **Mitigation**: Introduce strict sequence barriers or synchronous ticks for backtesting overrides.
* **Agent Context Bloat & "Catastrophic Forgetting"**: Injecting historical RAG errors constantly could cause LLM over-correction, paralyzing trading via recency bias. **Mitigation**: Curate the RAG feedback buffer to maintain a balanced standard deviation of successful trades vs failures.
* **Database IO Saturation**: Metrics aggregation on every `MARKET_TICK` across multiple active simulated portfolios could crater Postgres connection limits and CPU. **Mitigation**: Batch aggregation states in Redis-like memory or process metrics snapshots heuristically every X simulated minutes.
