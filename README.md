# Aurum — Gold Trading App

A full-stack XAU/USD trading dashboard with live candlestick charts, real-time P&L tracking, and AI-powered trade signals via Claude. Designed to run on **AWS EC2 free tier** with zero monthly cost for the first 12 months.

---

## Features

- **Live candlestick chart** — OHLCV candles with wicks, real-time price ticker
- **Day Trade** — place buy/sell orders, set stop-loss & take-profit, close positions
- **AI Advisor** — chat with Claude about your positions, market conditions, when to trade
- **Trade History** — full P&L record, win rate, avg win/loss stats
- **Deposit** — add funds to your paper trading account
- **Auto-deploy** — push to GitHub → live on EC2 in 2 minutes

---

## Project Structure

```
gold-trading-app/
├── backend/
│   ├── server.js          # Express API + AI signal endpoint
│   ├── package.json
│   └── .env               # API keys (never commit this)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   └── CandleChart.jsx
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── DayTrade.jsx
│   │       ├── AIAdvisor.jsx
│   │       ├── History.jsx
│   │       └── Deposit.jsx
│   ├── index.html
│   └── vite.config.js
├── deploy/
│   └── ec2-setup.sh       # One-time server setup script
├── .github/
│   └── workflows/
│       └── deploy.yml     # Auto-deploy on push to main
└── .env.example
```

---

## Quickstart (Local Development)

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/gold-trading-app.git
cd gold-trading-app

# 2. Install dependencies
npm run install:all

# 3. Set up environment variables
cp .env.example backend/.env
# Edit backend/.env with your API keys

# 4. Run backend (terminal 1)
npm run dev:backend

# 5. Run frontend (terminal 2)
npm run dev:frontend

# Open http://localhost:5173
```

---

## AWS EC2 Deployment (Free Tier)

### Step 1 — Launch EC2 instance
1. Go to AWS Console → EC2 → Launch Instance
2. Select **Ubuntu 22.04 LTS**
3. Choose **t2.micro** (free tier eligible)
4. Create or select a key pair — download the `.pem` file
5. Security group: allow **port 22** (SSH) and **port 80** (HTTP)
6. Launch

### Step 2 — Run setup script on EC2
```bash
# SSH into your instance
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Download and run the setup script
curl -o setup.sh https://raw.githubusercontent.com/YOUR_USERNAME/gold-trading-app/main/deploy/ec2-setup.sh
bash setup.sh
```

### Step 3 — Add API keys
```bash
nano /home/ubuntu/gold-trading-app/backend/.env
# Fill in CLAUDE_API_KEY, GOLD_API_KEY, FINNHUB_KEY
# Save: Ctrl+O, Enter, Ctrl+X

pm2 restart gold-app
```

### Step 4 — Set GitHub Secrets for auto-deploy
In your GitHub repo → Settings → Secrets → Actions:

| Secret | Value |
|--------|-------|
| `EC2_HOST` | Your EC2 public IP address |
| `EC2_SSH_KEY` | Contents of your `.pem` file |

### Step 5 — Push and go live
```bash
git push origin main
# GitHub Actions builds frontend + deploys to EC2 automatically
# App live at: http://YOUR_EC2_PUBLIC_IP
```

---

## API Keys (All Free Tiers Available)

| Service | Purpose | Free Tier | Sign Up |
|---------|---------|-----------|---------|
| goldapi.io | XAU/USD price feed | 250 req/month | goldapi.io |
| Finnhub | WebSocket live ticks | 60 req/min | finnhub.io |
| Anthropic | AI trade signals | $5 free credit | console.anthropic.com |
| Alpha Vantage | Historical candles | 25 req/day | alphavantage.co |

**Note:** Free tier gold data has 15-60 min delay. Suitable for learning and paper trading. For live day trading, upgrade to a paid feed (~$30/month).

---

## Useful PM2 Commands

```bash
pm2 status              # Check if app is running
pm2 logs gold-app       # View live logs
pm2 restart gold-app    # Restart after .env changes
pm2 stop gold-app       # Stop the app
pm2 monit               # Live monitoring dashboard
```

---

## Upgrading to Live Trading

When ready to trade with real money:
1. Connect **Alpaca** or **OANDA** broker API for order execution
2. Add **Stripe** for real deposits/withdrawals
3. Upgrade gold feed to **metals-api.com** paid tier for real-time prices
4. Consider upgrading from t2.micro to t3.small (~$15/month) for more users

---

## After 12 Months (Free Tier Expires)

Options to keep costs low:
- **AWS t2.micro** — ~$8.50/month (still very affordable)
- **Oracle Cloud** — always-free tier, more powerful than t2.micro
- **Hetzner VPS** — €3.79/month, excellent performance

---

## License

MIT — use freely for personal and commercial projects.
