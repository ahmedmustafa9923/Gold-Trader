#!/bin/bash
# =============================================================
# Aurum Gold Trading App — EC2 Free Tier Setup Script
# Run once on a fresh Ubuntu 22.04 t2.micro instance
# Usage: bash ec2-setup.sh
# =============================================================

set -e
echo "======================================"
echo "  Aurum Gold Trading App — EC2 Setup"
echo "======================================"

# ── System update ──
echo "[1/8] Updating system..."
sudo apt-get update -y && sudo apt-get upgrade -y

# ── Install Node.js 20 ──
echo "[2/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# ── Install PM2 globally ──
echo "[3/8] Installing PM2 process manager..."
sudo npm install -g pm2

# ── Install Nginx ──
echo "[4/8] Installing Nginx (reverse proxy)..."
sudo apt-get install -y nginx

# ── Configure Nginx ──
echo "[5/8] Configuring Nginx..."
sudo tee /etc/nginx/sites-available/gold-app > /dev/null <<'NGINX'
server {
    listen 80;
    server_name _;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;

        # Timeouts for live price streaming
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Serve static assets with cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        proxy_pass http://localhost:3000;
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/gold-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
sudo systemctl enable nginx

# ── Clone repo ──
echo "[6/8] Cloning repository..."
cd /home/ubuntu
if [ ! -d "gold-trading-app" ]; then
    # Replace with your actual GitHub repo URL
    git clone https://github.com/YOUR_USERNAME/gold-trading-app.git
fi
cd gold-trading-app

# ── Create .env file ──
echo "[7/8] Creating environment file..."
cat > backend/.env << 'ENV'
# Port (must match PM2 start command)
PORT=3000

# Claude AI API key (get from console.anthropic.com)
CLAUDE_API_KEY=your_claude_api_key_here

# Gold price API (get from goldapi.io - free tier available)
GOLD_API_KEY=your_goldapi_key_here

# Finnhub WebSocket (get from finnhub.io - free tier)
FINNHUB_KEY=your_finnhub_key_here

# Node environment
NODE_ENV=production
ENV

echo "⚠  Edit backend/.env with your actual API keys!"

# ── Install backend deps and start ──
echo "[8/8] Starting the app..."
cd backend
npm install --production
cd ..

# Start with PM2
pm2 start backend/server.js --name gold-app
pm2 startup ubuntu
pm2 save

echo ""
echo "======================================"
echo "  ✓ Setup complete!"
echo "======================================"
echo ""
echo "  App running at: http://$(curl -s ifconfig.me)"
echo "  PM2 status:     pm2 status"
echo "  App logs:       pm2 logs gold-app"
echo "  Restart app:    pm2 restart gold-app"
echo ""
echo "  Next steps:"
echo "  1. Edit backend/.env with your API keys"
echo "  2. Add EC2_HOST and EC2_SSH_KEY to GitHub Secrets"
echo "  3. Push to main branch to trigger auto-deploy"
echo ""
echo "  GitHub Secrets to add:"
echo "  EC2_HOST    = $(curl -s ifconfig.me)"
echo "  EC2_SSH_KEY = (contents of your .pem file)"
echo "======================================"
