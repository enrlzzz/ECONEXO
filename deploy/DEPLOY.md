# Deploy EcoNexo no VPS Hostinger

Guia para subir o EcoNexo em um VPS Hostinger (Ubuntu 22.04 / 24.04 LTS).

**Arquitetura no servidor:**
```
                Internet (porta 80/443)
                       │
                       ▼
                    nginx
                  /       \
        /api/*  /           \  /*
                ▼             ▼
       Spring Boot         dist/ (HTML/CSS/JS)
       (localhost:8080)   /var/www/econexo/frontend
                │
                ▼
              MySQL
       (localhost:3306)
```

---

## 1. Preparar o VPS (uma vez só)

SSH no servidor (IP que a Hostinger te passou):

```sh
ssh root@SEU_IP_HOSTINGER
```

Instalar dependências:

```sh
apt update && apt upgrade -y
apt install -y openjdk-21-jdk-headless mysql-server nginx ufw

# usuário de aplicação (sem login interativo)
useradd --system --shell /usr/sbin/nologin --home /var/www/econexo econexo
mkdir -p /var/www/econexo/{backend,frontend}
chown -R econexo:econexo /var/www/econexo

# firewall: só SSH + HTTP + HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

---

## 2. Configurar MySQL (uma vez só)

```sh
mysql_secure_installation        # define senha root, remove acesso anônimo
```

Criar banco e usuário de aplicação (substitua a senha antes de rodar):

```sh
# edite deploy/setup-mysql.sql trocando 'TROQUE_POR_UMA_SENHA_FORTE'
sudo mysql < /tmp/setup-mysql.sql      # depois de subir o arquivo
```

Carregar schema inicial:

```sh
sudo mysql Econexo < /tmp/schema.sql
```

---

## 3. Configurar variáveis de ambiente do backend

```sh
mkdir -p /etc/econexo
cp /tmp/backend.env /etc/econexo/backend.env
chmod 600 /etc/econexo/backend.env
chown econexo:econexo /etc/econexo/backend.env
nano /etc/econexo/backend.env       # editar DB_PASS, APP_ALLOWED_ORIGINS
```

---

## 4. Build local + upload

**No seu Windows, na raiz do projeto:**

```powershell
# Build do backend
cd backend
.\mvnw.cmd -B clean package
# gera: backend/target/ECONEXO-0.0.1-SNAPSHOT.jar

# Build do frontend
cd ..\frontend
npm run build
# gera: frontend/dist/
```

**Upload (scp, WinSCP, FileZilla...):**

```sh
# do Windows
scp backend/target/ECONEXO-0.0.1-SNAPSHOT.jar root@SEU_IP:/var/www/econexo/backend/
scp -r frontend/dist/* root@SEU_IP:/var/www/econexo/frontend/
scp database/schema.sql root@SEU_IP:/tmp/
scp deploy/setup-mysql.sql root@SEU_IP:/tmp/
scp deploy/backend.env.example root@SEU_IP:/tmp/backend.env
scp deploy/econexo-backend.service root@SEU_IP:/etc/systemd/system/
scp deploy/nginx.conf root@SEU_IP:/etc/nginx/sites-available/econexo
```

No servidor:

```sh
chown -R econexo:econexo /var/www/econexo
```

---

## 5. Subir o backend como serviço

```sh
systemctl daemon-reload
systemctl enable --now econexo-backend
systemctl status econexo-backend
journalctl -u econexo-backend -f             # ver logs
```

Teste local no servidor:

```sh
curl http://localhost:8080/api/usuarios       # deve retornar []
```

---

## 6. Subir o nginx

```sh
# edite o arquivo trocando seudominio.com pelo domínio real
nano /etc/nginx/sites-available/econexo

ln -s /etc/nginx/sites-available/econexo /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t                                      # testa sintaxe
systemctl reload nginx
```

Teste pelo IP/domínio:

```sh
curl http://seudominio.com/                   # HTML do React
curl http://seudominio.com/api/usuarios       # JSON do backend
```

---

## 7. HTTPS com Let's Encrypt

```sh
apt install -y certbot python3-certbot-nginx
certbot --nginx -d seudominio.com -d www.seudominio.com
# escolha "redirect" para forçar HTTPS
```

Renovação automática já vem configurada via systemd timer.

Depois de habilitar HTTPS, atualize `/etc/econexo/backend.env`:

```
APP_ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com
```

E reinicie: `systemctl restart econexo-backend`.

---

## 8. Atualizações futuras (deploy de novas versões)

**Backend novo:**

```sh
# no Windows
cd backend && .\mvnw.cmd -B clean package
scp target/ECONEXO-0.0.1-SNAPSHOT.jar root@SEU_IP:/var/www/econexo/backend/

# no servidor
sudo systemctl restart econexo-backend
```

**Frontend novo:**

```sh
# no Windows
cd frontend && npm run build
scp -r dist/* root@SEU_IP:/var/www/econexo/frontend/

# nginx serve direto, não precisa reload
```

---

## Troubleshooting

| Sintoma | Onde olhar |
|---|---|
| 502 Bad Gateway no /api | `journalctl -u econexo-backend -n 50` — backend caiu |
| 404 ao recarregar /menu-user/projects | Faltou `try_files` no nginx — verifique o `nginx.conf` |
| CORS error no browser | Confira `APP_ALLOWED_ORIGINS` em `/etc/econexo/backend.env` |
| `Access denied for user` | Senha em `backend.env` diferente da do MySQL |
| Backend não inicia | `java -jar ECONEXO-0.0.1-SNAPSHOT.jar` direto pra ver erro |
| nginx 403 | `chown -R econexo:econexo /var/www/econexo/frontend` |
