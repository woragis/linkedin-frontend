# Frontend — plano dual-realm

Espelha o plano do backend: [backend/docs/REALM_PLAN.md](../../backend/docs/REALM_PLAN.md)

## R0 (este repo)

- `src/lib/realm.ts` — `live` (default) | `volume`
- Header `X-App-Realm` em `api.ts`
- `RealmToggle` no `AppShell` — troca → logout + `/login`

## Próximas fases

- **R2:** `ReactionBar` em comentários
- **R3:** perfil expandido (vivo)
- Badge/avisos no modo volume na página `/network`
