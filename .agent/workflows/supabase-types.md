---
description: Regenerate Supabase TypeScript types
---

# Supabase Project Info

- **Project Ref**: `nthzqqeakvtkbrxponng`
- **URL**: `https://nthzqqeakvtkbrxponng.supabase.co`

## Generate Types Command

```bash
// turbo
npx supabase gen types typescript --project-id nthzqqeakvtkbrxponng > src/types/database.types.ts
```

## Alternative: Link Project First

```bash
npx supabase login
npx supabase link --project-ref nthzqqeakvtkbrxponng
npx supabase gen types typescript --linked > src/types/database.types.ts
```
