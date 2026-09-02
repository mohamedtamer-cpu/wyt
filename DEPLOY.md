# Deployment Guide — WYT Smart Vending Platform

Complete guide for deploying WYT to production using Docker, Nginx, and Let's Encrypt SSL.

## Prerequisites

- **Linux VPS** (Ubuntu 20.04+ recommended)
- **Domain name** (e.g., `yourdomain.com`)
- **Docker & Docker Compose** installed
- **Basic SSH knowledge**
- **Email** for Let's Encrypt certificate

## 1. Server Setup

### Connect to Your VPS

```bash
ssh root@your-server-ip
```

### Update System

```bash
apt update && apt upgrade -y
```

### Install Docker

```bash
apt install -y docker.io docker-compose curl git
systemctl start docker
systemctl enable docker
```

### Add Your User to Docker Group (Optional)

```bash
usermod -aG docker $USER
newgrp docker
```

## 2. Clone/Upload Your Project

### Option A: Clone from Git

```bash
cd /opt
git clone https://github.com/your-repo/wyt.git
cd wyt
```

### Option B: Upload via SCP

```bash
# From your local machine
scp -r ./wyt root@your-server-ip:/opt/
ssh root@your-server-ip
cd /opt/wyt
```

## 3. Configure Environment

### Create Production `.env`

```bash
nano .env
```

```
GMAIL_USER=your-gmail@gmail.com
GMAIL_PASS=your-16-char-app-password
ADMIN_PASSWORD=super-secure-password-here
PORT=3000
NODE_ENV=production
```

**Save:** `Ctrl+X` → `Y` → `Enter`

## 4. DNS Configuration

Point your domain to your server:

1. Go to your **Domain Registrar** (GoDaddy, Namecheap, etc.)
2. Add an **A record**:
   - Name: `@` (for `yourdomain.com`)
   - Type: `A`
   - Value: Your VPS IP address
3. **Wait 24-48 hours** for DNS propagation (or up to 1 hour)

Verify DNS resolution:

```bash
dig yourdomain.com
# Should show your VPS IP
```

## 5. SSL Certificate with Let's Encrypt

### Update Domain in Nginx Config

Edit the nginx configuration:

```bash
nano nginx/conf.d/wyt.conf
```

Replace `yourdomain.com` with your actual domain (appears twice).

### Obtain SSL Certificate

```bash
# Create necessary directories
mkdir -p certbot/webroot certbot/certs

# Run Certbot
docker run -it --rm \
  -v certbot-webroot:/var/www/certbot \
  -v certbot-certs:/etc/letsencrypt \
  certbot/certbot:latest certonly \
  --webroot -w /var/www/certbot \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email
```

**This will:**
- Verify you own the domain
- Create SSL certificates
- Store in Docker volumes

### Update docker-compose.yml

The docker-compose.yml already includes Certbot. Update the service if needed:

```yaml
certbot:
  image: certbot/certbot:latest
  container_name: wyt-certbot
  volumes:
    - certbot-webroot:/var/www/certbot
    - certbot-certs:/etc/letsencrypt
  entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

## 6. Switch to HTTPS

### Update Nginx Configuration

Use the HTTPS config instead of HTTP:

```bash
# Backup the current config
cp nginx/conf.d/wyt.conf nginx/conf.d/wyt.conf.http

# Copy the SSL config
cp nginx/conf.d/wyt-ssl.conf nginx/conf.d/wyt.conf
```

Edit `nginx/conf.d/wyt.conf` (the copied SSL config):

```bash
nano nginx/conf.d/wyt.conf
```

Replace all instances of `yourdomain.com` with your actual domain.

**Certificate paths should point to:**
```
/etc/letsencrypt/live/yourdomain.com/fullchain.pem
/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Update docker-compose.yml Volumes

```yaml
nginx:
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - ./nginx/conf.d:/etc/nginx/conf.d:ro
    - certbot-webroot:/var/www/certbot:ro
    - certbot-certs:/etc/letsencrypt:ro
  depends_on:
    - app
```

## 7. Build and Deploy

### Build Docker Images

```bash
cd /opt/wyt
docker compose build
```

### Start Services

```bash
docker compose up -d
```

Check logs:

```bash
docker compose logs -f app
docker compose logs -f nginx
```

### Verify Deployment

Visit your site:
- **Website:** https://yourdomain.com
- **Admin:** https://yourdomain.com/admin?pass=your-password

## 8. SSL Renewal

Certbot will automatically renew certificates 30 days before expiration. The renewal process runs in the Certbot container in the background.

### Manual Renewal

```bash
docker compose exec certbot certbot renew
docker compose exec nginx nginx -s reload
```

## 9. Monitoring & Maintenance

### Check Container Status

```bash
docker compose ps
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f nginx
```

### Check Disk Usage

```bash
docker system df
```

### Backup Your Data

```bash
# Backup CMS content and submissions
tar -czf backup-wyt-$(date +%Y%m%d).tar.gz \
  /opt/wyt/data/ \
  /opt/wyt/uploads/

# Upload to secure location
scp backup-wyt-*.tar.gz your-local-machine:~/backups/
```

### Scale for Traffic

If you need more performance:

```bash
# In docker-compose.yml, add more Node processes
# Or use a load balancer like Caddy
```

## 10. Troubleshooting

### 503 Service Unavailable

```bash
# Check if app container is running
docker compose ps

# Restart services
docker compose restart

# Check logs
docker compose logs app
```

### SSL Certificate Error

```bash
# Check certificate validity
docker compose exec nginx openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -text -noout

# Renew certificate
docker compose run certbot certonly --webroot -w /var/www/certbot \
  -d yourdomain.com -d www.yourdomain.com
```

### Domain Not Resolving

```bash
# Test DNS resolution
dig yourdomain.com
nslookup yourdomain.com

# May take 24-48 hours to propagate
```

### Emails Not Sending

```bash
# Check Gmail app password is correct
# Verify 2FA is enabled on Gmail
# Check Gmail's [App Passwords](https://myaccount.google.com/apppasswords)

# Test from inside container
docker compose exec app node -e \
  "console.log(process.env.GMAIL_USER)"
```

### High Memory Usage

```bash
# Monitor container resources
docker stats

# Limit resources in docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

## 11. Security Checklist

- ✅ Change `ADMIN_PASSWORD` to something strong
- ✅ Use HTTPS for all connections
- ✅ Keep Docker images updated: `docker compose pull && docker compose up -d`
- ✅ Regular backups of `data/` folder
- ✅ Monitor logs for suspicious activity
- ✅ Use firewall to restrict admin access if possible

### Optional: Restrict Admin Panel Access

Edit `wyt.conf` to only allow certain IPs:

```nginx
location /admin {
    # Allow office IP
    allow 203.0.113.0;
    
    # Block everyone else
    deny all;
    
    proxy_pass http://app:3000;
    # ... other proxy settings
}
```

## 12. Performance Optimization

### Enable Gzip Compression (Already Configured)

Already in `nginx/nginx.conf`:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### Add Caching

Edit `nginx/conf.d/wyt.conf`:

```nginx
location ~* \.(js|css|png|jpg|gif|ico|svg)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### Database Optimization

For large deployments, consider migrating from JSON to:
- MongoDB
- PostgreSQL
- SQLite

## 13. Updates & Maintenance

### Update Node.js Version

Edit `Dockerfile`:

```dockerfile
FROM node:20-alpine  # Change version if needed
```

Rebuild:

```bash
docker compose build && docker compose up -d
```

### Rollback to Previous Version

```bash
# Stop containers
docker compose down

# Restore backup
tar -xzf backup-wyt-20240101.tar.gz

# Restart
docker compose up -d
```

## 14. Next Steps

1. ✅ Deploy successfully
2. 🔐 Set strong admin password
3. 📧 Configure Gmail app password
4. 📝 Add your company content via admin panel
5. 📅 Set up automated backups
6. 📞 Test contact form and emails
7. 🔍 Monitor logs and performance

---

**Production URL:** https://yourdomain.com

**Admin Panel:** https://yourdomain.com/admin?pass=your-password

**Need Help?** Check Docker logs: `docker compose logs -f`
