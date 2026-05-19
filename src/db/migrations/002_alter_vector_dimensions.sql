-- Migration 002: Alter vector dimensions for Gemini embeddings

-- Gemini embeddings (text-embedding-004) use 768 dimensions by default. 
-- We change the column type so it can accept 768 length array from pgvector.

ALTER TABLE semantic_memory_logs
ALTER COLUMN vector_embedding TYPE VECTOR(768);
