# Deployment Strategy

- **Containers:** Dockerized full-stack container running Express, utilizing Node's built-in ESBundle compilation for optimized cold-starts.
- **Infrastructure:** Google Cloud Run (Autoscaling container compute) ensuring zero downtime and high availability for the backend.
- **Database:** Google Cloud SQL (PostgreSQL) configured with `pgvector` for semantic memory retrieval.
- **CI/CD:** Automated pipelines enforcing TypeScript typing and formatting prior to pushing image to Artifact Registry.
