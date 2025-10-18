#!/bin/bash

echo "🚀 Secret Poker - 快速启动"
echo "=========================="
echo ""

# 编译合约
echo "1️⃣  编译智能合约..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ 编译失败"
    exit 1
fi

echo "✅ 编译成功"
echo ""

# 运行测试
echo "2️⃣  运行测试..."
npm run test

if [ $? -ne 0 ]; then
    echo "❌ 测试失败"
    exit 1
fi

echo "✅ 测试通过"
echo ""

# 部署到本地网络
echo "3️⃣  部署到本地 Hardhat 网络..."
npm run deploy

if [ $? -ne 0 ]; then
    echo "❌ 部署失败"
    exit 1
fi

echo "✅ 部署成功"
echo ""

# 启动前端（在后台）
echo "4️⃣  启动前端..."
cd frontend
npm run dev &
FRONTEND_PID=$!

cd ..

echo "✅ 前端已启动"
echo ""
echo "=========================="
echo "🎮 Secret Poker 已准备就绪！"
echo ""
echo "📍 前端地址: http://localhost:3000"
echo "📍 Hardhat Network: http://localhost:8545"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 等待用户中断
wait $FRONTEND_PID

