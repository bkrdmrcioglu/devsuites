# DevSuites

**https://devsuites.dev** — hosted on Coolify (static site).

| Path | Page |
|---|---|
| `/` | Suite hub |
| `/devdock/` | DevDock product |
| `/devmail/` | DevMail product |
| `/devsql/` | DevSQL product |

## Deploy

Push to `main` → Coolify rebuilds from https://github.com/bkrdmrcioglu/devsuites.git

```bash
# local preview
python3 -m http.server 8088
```

Point `devsuites.dev` DNS at your Coolify host (not GitHub Pages).
