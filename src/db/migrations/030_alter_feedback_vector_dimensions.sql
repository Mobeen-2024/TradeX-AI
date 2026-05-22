-- Migration 030: Alter feedback_vector dimension in trade_outcomes
-- Gemini embeddings (text-embedding-004) use 768 dimensions. We alter the vector length to match.

ALTER TABLE trade_outcomes
ALTER COLUMN feedback_vector TYPE vector(768);
