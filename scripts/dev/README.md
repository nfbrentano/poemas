# scripts/dev

Esta pasta guarda o export original do WordPress dos poemas:

- `poemasdenatanael.WordPress.2026-04-25.xml`: backup bruto dos poemas, na forma em que saíram do WordPress (abril de 2026). É a fonte original, por isso foi mantido no repositório.

## Scripts removidos

Scripts de migração e correção pontual (importação do WordPress, limpeza de HTML, reclassificação de tags, migração prev/next e outros) foram removidos por já terem sido aplicados e, em sua maioria, usarem o Supabase, que não é mais o banco do projeto.

Eles continuam no histórico do git. O commit `582bbe0` ainda contém todos. Para recuperar um deles:

```bash
git show 582bbe0:scripts/dev/<nome-do-script>.js > <nome-do-script>.js
```

Para ver a lista completa do que existia:

```bash
git ls-tree --name-only 582bbe0 scripts/dev/
```
