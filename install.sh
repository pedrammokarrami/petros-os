#!/usr/bin/env bash
set -e

# ==============================================================================
# 🚀 CODGAR Universal Zero-Config Installer & Launcher
# Works on RAW/FRESH macOS, Ubuntu/Debian, Fedora/CentOS, WSL
# Checks, installs, or updates Node.js, Git, NPM and project dependencies
# ==============================================================================

BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}${BOLD}======================================================${NC}"
echo -e "${BLUE}${BOLD}   🚀 نصب‌کننده و راه‌انداز خودکار کدگر (CODGAR AI)    ${NC}"
echo -e "${BLUE}${BOLD}======================================================${NC}"

# Detect OS
OS_TYPE="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
  OS_TYPE="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  OS_TYPE="linux"
fi

echo -e "${YELLOW}🔍 بررسی پیش‌نیازهای سیستم...${NC}"

# Function to check and install Node.js
check_and_install_node() {
  local NEED_NODE=false
  if ! command -v node >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️ Node.js روی سیستم یافت نشد.${NC}"
    NEED_NODE=true
  else
    NODE_MAJOR=$(node -v | cut -d'.' -f1 | tr -d 'v')
    echo -e "${GREEN}✓ Node.js شناسایی شد: v$(node -v | tr -d 'v')${NC}"
    if [ "$NODE_MAJOR" -lt 18 ]; then
      echo -e "${YELLOW}⚠️ نسخه Node.js قدیمی است (زیر 18). نیاز به ارتقاء دارد.${NC}"
      NEED_NODE=true
    fi
  fi

  if [ "$NEED_NODE" = true ]; then
    echo -e "${BLUE}📦 در حال نصب یا ارتقاء Node.js (نسخه 20 LTS)...${NC}"
    if [ "$OS_TYPE" == "macos" ]; then
      if command -v brew >/dev/null 2>&1; then
        brew install node@20 || brew upgrade node || true
        brew link --overwrite --force node@20 2>/dev/null || true
      else
        echo -e "${BLUE}در حال دانلود و نصب پکیج رسمی Node.js برای مک...${NC}"
        curl -fsSL https://nodejs.org/dist/v20.18.0/node-v20.18.0.pkg -o /tmp/node.pkg
        sudo installer -pkg /tmp/node.pkg -target /
        rm -f /tmp/node.pkg
      fi
    elif [ "$OS_TYPE" == "linux" ]; then
      echo -e "${BLUE}در حال نصب Node.js 20 از مخزن رسمی NodeSource...${NC}"
      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - || true
      sudo apt-get install -y nodejs || sudo dnf install -y nodejs || true
    fi
  fi
}

# Function to check and install Git
check_and_install_git() {
  if ! command -v git >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️ Git یافت نشد. در حال نصب...${NC}"
    if [ "$OS_TYPE" == "macos" ]; then
      xcode-select --install 2>/dev/null || brew install git || true
    elif [ "$OS_TYPE" == "linux" ]; then
      sudo apt-get update && sudo apt-get install -y git || sudo dnf install -y git || true
    fi
  else
    echo -e "${GREEN}✓ Git شناسایی شد: $(git --version)${NC}"
  fi
}

check_and_install_git
check_and_install_node

# Verify Node & NPM are functional
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo -e "${RED}❌ خطا در بارگذاری Node.js / NPM. لطفاً ترمینال را یک‌بار ببندید و دوباره باز کنید.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ محیط اجرایی جاوااسکریپت: Node $(node -v) / NPM v$(npm -v)${NC}"

# Navigate to project directory if script is run directly
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# 1. Setup .env file
if [ ! -f .env ]; then
  echo -e "${BLUE}⚙️ ایجاد فایل پیکربندی .env از روی .env.example...${NC}"
  if [ -f .env.example ]; then
    cp .env.example .env
  else
    echo "PORT=3000" > .env
  fi
fi

# 2. Install / Update NPM dependencies
echo -e "${BLUE}📦 نصب و همگام‌سازی تمام پکیج‌های فرانت‌اند و بک‌اند...${NC}"
npm install --no-audit --no-fund

echo -e "${GREEN}${BOLD}======================================================${NC}"
echo -e "${GREEN}${BOLD}   ✅ نصب و پیکربندی با موفقیت کامل انجام شد!         ${NC}"
echo -e "${GREEN}${BOLD}======================================================${NC}"
echo -e "${BLUE}🚀 در حال راه‌اندازی سرور کدگر روی پورت 3000...${NC}"
echo -e "${YELLOW}🌐 آدرس دسترسی محلی: http://localhost:3000${NC}"
echo ""

# Start the dev server
npm run dev
