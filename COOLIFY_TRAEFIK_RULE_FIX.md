# Fix Gateway Timeout – Traefik “empty Host” rule (Coolify)

**One-time setup:** add the dynamic config (or disable Coolify proxy for this app). After that, every deploy uses the same service name (`frontend`) — no manual steps after push/deploy.

## Permanent fix A: dynamic config file (recommended)

Use Traefik’s **file provider** so juellehairgh.com is routed by a dedicated config file. Your proxy already loads files from the dynamic config directory. **Do not edit** `default_redirect_503.yaml` (Coolify-managed); add a **new** file. Our routers use **priority 1000**, so they take precedence over the default catch-all (priority -1000).

### Option 1: Add via Coolify UI

1. In Coolify go to **Servers** → select your server → **Proxy** tab → **Dynamic Configurations**.
2. Click **"+ Add"**.
3. **Filename:** `juellehairgh.yaml`
4. **Content:** paste the contents of **`coolify-proxy-dynamic-juellehairgh.yaml`** from this repo (you can omit the comment lines at the top).
5. Save, then click **Restart Proxy**.

### Option 2: Add via SSH on the server

1. Create the file:
   ```bash
   sudo mkdir -p /data/coolify/proxy/dynamic
   sudo nano /data/coolify/proxy/dynamic/juellehairgh.yaml
   ```
2. Paste the contents of **`coolify-proxy-dynamic-juellehairgh.yaml`** from this repo.
3. Save and restart the proxy:
   ```bash
   docker restart coolify-proxy
   ```
   (Or use **Restart Proxy** in Coolify.)

The file uses the **Compose service name** `frontend:3000`. Coolify attaches the proxy to your app’s network, so `frontend` resolves to your frontend container there. If you still get Bad Gateway, try `juelle-hair-frontend-prod:3000` (container name) as the URL in the config.

---

## Permanent fix B: use only our proxy labels (no Coolify labels)

Coolify v4 injects its own Traefik labels that are buggy (`Host(``) && PathPrefix(\`domain\`)`). As long as those labels are on the container, Traefik can fail or misroute.

**Best fix:** tell Coolify **not** to add proxy labels for this application, and use **only** the routers defined in `docker-compose.frontend.yml`.

1. In Coolify, open **juellehairgh.com** → **Configuration**.
2. Go to **Advanced** (or look for **Proxy** / **Networking**).
3. Find the option that controls proxy/routing, e.g.:
   - **“Proxy”** or **“Enable Proxy”** → set to **“None”** or **“Disabled”**, or  
   - **“Use custom Traefik labels only”** / **“Don’t generate proxy labels”** → enable it.
4. Save and **Redeploy**.
5. Restart the proxy: on the server run `docker restart coolify-proxy`.

After that, only the labels in `docker-compose.frontend.yml` apply (our dedicated routers with correct `Host(...)` rules). No Coolify-generated routers, no parse errors, no Gateway Timeout.

---

## What you see (when the bug is present)

- **Browser:** “Gateway Timeout” when opening `juellehairgh.com`
- **coolify-proxy logs:**  
  `error while parsing rule Host(``) && PathPrefix(\`juellehairgh.com\`): ... error while checking rule Host: empty args for matcher Host, []`

So the **proxy** never routes requests to your frontend container. The backend can be fine (your Nest logs show it’s up); the problem is Traefik.

## Cause

Coolify is creating routers whose rule is:

- `Host(``) && PathPrefix(\`juellehairgh.com\`)`

So:

- **Host** is **empty** (invalid).
- The domain is in **PathPrefix** instead of **Host**.

Traefik then rejects that rule. Your app’s own labels in `docker-compose.frontend.yml` use the correct form (`Host(\`juellehairgh.com\`)`), but Coolify is adding **extra** routers with this broken rule (e.g. `http-0-a8cc0408w8kw8csc888o44ks-frontend@docker`). That’s a known Coolify v4 domain/routing bug.

## Fix (on the Coolify server)

Do this in the **Coolify UI** for the **juellehairgh.com** application (the one that deploys this repo).

### 1. Set the domain correctly (so Coolify generates `Host(...)`)

- Open the **Application** (or **Service**) for juellehairgh.com.
- Go to the **Configuration** / **Domains** / **FQDN** (or equivalent) section.
- Set the **main domain** to exactly: **`juellehairgh.com`** (no path, no `https://`).
- If you want `www` as well, add **`www.juellehairgh.com`** in the same place (or in the “Additional domains” field, depending on your Coolify version).
- Save and **Redeploy** the application so Coolify regenerates Traefik config.

Goal: Coolify should generate rules like `Host(\`juellehairgh.com\`)` (and optionally `Host(\`www.juellehairgh.com\`)`), **not** `Host(``) && PathPrefix(\`juellehairgh.com\`)`.

### 2. If Coolify keeps generating the wrong rule

- Check if there is an option like **“Use custom Traefik labels only”** or **“Disable automatic proxy labels”** and enable it, so Coolify **does not** add its own `http-0-...-frontend` / `http-1-...-frontend` routers. Your `docker-compose.frontend.yml` already has correct labels (`juellehairgh-frontend`, `juellehairgh-frontend-http`); those would then be the only ones.
- Or upgrade Coolify to a version that fixes the bug (check [Coolify changelog/issues](https://github.com/coollabsio/coolify) for “Traefik” / “Host” / “PathPrefix” / “empty args”).

### 3. Restart the proxy (after changing config)

On the server:

```bash
docker restart coolify-proxy
```

Then test: `https://juellehairgh.com` and `https://www.juellehairgh.com`.

## Quick check after fix

- **coolify-proxy:**  
  `docker logs --tail=50 coolify-proxy`  
  The “empty args for matcher Host” errors for `juellehairgh.com` should stop.
- **Browser:**  
  Open `https://juellehairgh.com` – you should get the site instead of Gateway Timeout.

## Summary

| Symptom              | Cause                                      | Fix                                              |
|----------------------|--------------------------------------------|--------------------------------------------------|
| Gateway Timeout      | Traefik rule has empty `Host()`            | Set domain to `juellehairgh.com` in Coolify      |
| `Host(``) && PathPrefix(...)` in logs | Coolify generating wrong router rule | Correct FQDN/domain in UI; optionally disable auto proxy labels |

Your backend and frontend containers can be running; fixing the **Coolify/Traefik domain configuration** is what resolves the Gateway Timeout.
