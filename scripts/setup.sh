#!/bin/bash

echo "🎮 Secret Poker - 项目设置脚本"
echo "================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js，请先安装 Node.js (>= 18.0.0)"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 未找到 npm"
    exit 1
fi

echo "✅ npm 版本: $(npm --version)"
echo ""

# 安装根目录依赖
echo "📦 安装智能合约依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 智能合约依赖安装完成"
echo ""

# 安装前端依赖
echo "📦 安装前端依赖..."
cd frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ 前端依赖安装失败"
    exit 1
fi

cd ..
echo "✅ 前端依赖安装完成"
echo ""

# 创建 .env 文件（如果不存在）
if [ ! -f .env ]; then
    echo "📝 创建 .env 文件..."
    cp .env.example .env
    echo "✅ .env 文件已创建，请编辑并填入你的私钥"
else
    echo "ℹ️  .env 文件已存在"
fi

echo ""
echo "================================"
echo "✅ 项目设置完成！"
echo ""
echo "📋 下一步操作："
echo "1. 编辑 .env 文件，填入你的私钥"
echo "2. 运行 'npm run compile' 编译合约"
echo "3. 运行 'npm run test' 测试合约"
echo "4. 运行 'npm run deploy' 部署合约"
echo "5. 运行 'npm run dev' 启动前端"
echo ""
echo "🎰 祝你好运！"

