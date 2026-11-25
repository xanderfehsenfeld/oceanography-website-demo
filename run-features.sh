#!/usr/bin/env bash
set -e

MODEL="ollama_chat/qwen3:8b"

# Feature 1: Backend schema & validation
aider --model "$MODEL" --yes-always --auto-test --test-cmd "npm run typecheck" \
  --message "Add a Zod schema for UserRegistration in src/schemas/user.ts with email, password (min 10 chars), and role fields, plus inferred TypeScript types." \
  src/schemas/user.ts

# Feature 2: API route handler (only passes the new schema + route file)
aider --model "$MODEL" --yes-always --auto-test --test-cmd "npm test" \
  --message "Implement POST /api/register in src/routes/auth.ts using UserRegistration from src/schemas/user.ts. Return 400 with structured JSON validation errors on failure." \
  src/schemas/user.ts src/routes/auth.ts

# Feature 3: React UI component
aider --model "$MODEL" --yes-always --auto-test --test-cmd "npm run typecheck" \
  --message "Build a RegistrationForm component in src/components/RegistrationForm.tsx that posts JSON to /api/register and displays field-level validation errors." \
  src/schemas/user.ts src/components/RegistrationForm.tsx