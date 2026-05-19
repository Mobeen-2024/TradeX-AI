# TradeX OS Agent Routing

This repository uses specialized context files.

Priority order:

1. docs/execution.md → active sprint tasks
2. docs/constraints.md → mandatory limits
3. docs/architecture.md → reference only
4. docs/database.md → only for persistence work
5. docs/deployment.md → only for infra work
6. docs/agents.md → only for agent pipelines & orchestration

Rules:
- For infrastructure, database, auth, or backend tasks: execution.md must be loaded before making changes.
- Never treat architecture.md as universal instruction.
- Use the minimum context required for the requested task.
- Do not infer backend work from frontend requests.
- Do not modify files outside explicit task scope.
- Ask before structural refactors.
