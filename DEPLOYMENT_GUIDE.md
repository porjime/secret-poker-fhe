# 🚀 Secret Poker 部署指南

本指南将帮助你将 Secret Poker 部署到 Zama Devnet 或其他网络。

---

## 📋 前置要求

### 必需工具
- ✅ Node.js >= 18.0.0
- ✅ npm 或 yarn
- ✅ Git
- ✅ MetaMask 或其他 Web3 钱包

### 网络要求
- Zama Devnet 测试币（从水龙头获取）
- 或其他 EVM 兼容网络的原生币

---

## 🔧 步骤 1: 克隆并安装

```bash
# 克隆项目（或解压项目文件）
cd secret-poker-fhe

# 运行自动化设置脚本
./scripts/setup.sh

# 或手动安装
npm install
cd frontend && npm install && cd ..
```

---

## 🔑 步骤 2: 配置环境变量

### 2.1 创建 .env 文件

```bash
cp .env.example .env
```

### 2.2 编辑 .env 文件

```env
# 你的部署账户私钥（不要包含 0x 前缀）
PRIVATE_KEY=你的私钥

# Zama RPC URL
ZAMA_RPC_URL=https://devnet.zama.ai

# 部署后填写
CONTRACT_ADDRESS=
```

⚠️ **安全提示**：
- 永远不要提交 `.env` 文件到 Git
- 不要在生产环境使用有大量资金的私钥
- 建议使用专门的测试账户

---

## 🏗️ 步骤 3: 编译合约

```bash
# 编译智能合约
npm run compile

# 你应该看到
✓ Compiled 1 Solidity file successfully
```

**常见问题**：
- 如果编译失败，检查 Solidity 版本是否为 0.8.24
- 确保 `fhevm` 和 `fhevm-contracts` 依赖已安装

---

## 🧪 步骤 4: 运行测试

```bash
# 运行测试套件
npm run test

# 预期输出
  SecretPoker
    Game Creation
      ✓ Should create a new game
      ✓ Should fail to create game without buy-in
      ✓ Should fail if player already in a game
    ...
  
  ✓ All tests passed
```

**如果测试失败**：
- 检查代码是否有语法错误
- 确保所有依赖已正确安装
- 查看错误消息并修复相应问题

---

## 🌐 步骤 5: 部署到 Zama Devnet

### 5.1 获取测试币

访问 Zama 水龙头获取测试币：
- 网址：https://faucet.zama.ai/
- 输入你的钱包地址
- 等待测试币到账

### 5.2 部署合约

```bash
# 部署到 Zama Devnet
npx hardhat run scripts/deploy.js --network zama
```

### 5.3 预期输出

```
🚀 开始部署 Secret Poker 合约...

部署账户: 0x1234...5678
账户余额: 10.0 ETH

正在部署 SecretPoker 合约...
✅ SecretPoker 合约已部署!
合约地址: 0xabcd...ef01

============================================================
📋 部署摘要
============================================================
合约名称: SecretPoker
合约地址: 0xabcd...ef01
部署者: 0x1234...5678
网络: zama
============================================================

💾 部署信息已保存到 deployment-info.json
```

### 5.4 保存合约地址

部署成功后，合约地址会保存在 `deployment-info.json` 文件中：

```json
{
  "contractName": "SecretPoker",
  "contractAddress": "0xabcd...ef01",
  "deployer": "0x1234...5678",
  "network": "zama",
  "deployedAt": "2025-10-18T12:00:00.000Z",
  "buyIn": "1 ETH",
  "smallBlind": "0.01 ETH",
  "bigBlind": "0.02 ETH",
  "minPlayers": 2,
  "maxPlayers": 6
}
```

---

## 🎨 步骤 6: 配置前端

### 6.1 更新合约地址

编辑 `frontend/src/app/page.tsx`，找到这一行：

```typescript
// TODO: Initialize contract with deployed address
// const pokerContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
```

替换为：

```typescript
const CONTRACT_ADDRESS = "0xabcd...ef01" // 你的合约地址
const pokerContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
setContract(pokerContract)
```

### 6.2 添加合约 ABI

创建 `frontend/src/contracts/SecretPoker.json`，复制编译后的 ABI：

```bash
# 复制 ABI 文件
cp artifacts/contracts/SecretPoker.sol/SecretPoker.json frontend/src/contracts/
```

在 `page.tsx` 中导入：

```typescript
import SecretPokerABI from '@/contracts/SecretPoker.json'

// 使用 ABI
const pokerContract = new ethers.Contract(
  CONTRACT_ADDRESS, 
  SecretPokerABI.abi, 
  signer
)
```

---

## 🎮 步骤 7: 启动前端

```bash
# 开发模式
npm run dev

# 生产构建
npm run build
cd frontend && npm run build
```

前端将在 **http://localhost:3000** 启动

---

## 🔍 步骤 8: 验证部署

### 8.1 在区块链浏览器上验证

访问 Zama 区块链浏览器：
- 输入合约地址
- 查看合约代码
- 验证交易历史

### 8.2 测试合约功能

使用交互脚本测试：

```bash
node scripts/interact.js
```

或在前端进行测试：
1. 连接 MetaMask
2. 创建新游戏
3. 用另一个账户加入
4. 测试游戏流程

---

## 🌍 步骤 9: 部署到其他网络（可选）

### 部署到本地 Hardhat 网络

```bash
# 启动本地节点
npx hardhat node

# 在新终端部署
npx hardhat run scripts/deploy.js --network localhost
```

### 部署到其他网络

编辑 `hardhat.config.js`，添加新网络：

```javascript
networks: {
  polygon: {
    url: "https://polygon-rpc.com",
    accounts: [process.env.PRIVATE_KEY],
    chainId: 137,
  },
  // ... 其他网络
}
```

然后部署：

```bash
npx hardhat run scripts/deploy.js --network polygon
```

---

## 📱 步骤 10: 配置 MetaMask

### 添加 Zama Devnet 到 MetaMask

1. 打开 MetaMask
2. 点击网络下拉菜单
3. 选择"添加网络"
4. 输入以下信息：

```
网络名称: Zama Devnet
RPC URL: https://devnet.zama.ai
链 ID: 8009
货币符号: ZAMA
区块浏览器: [如果有]
```

5. 保存并切换到 Zama Devnet

---

## 🐛 常见问题排查

### 问题 1: 编译失败

**错误**: `Error: Cannot find module 'fhevm'`

**解决**:
```bash
npm install fhevm fhevm-contracts
```

### 问题 2: 部署失败 - 余额不足

**错误**: `Error: insufficient funds`

**解决**:
- 确保账户有足够的测试币
- 从水龙头获取更多测试币
- 检查网络连接

### 问题 3: MetaMask 连接失败

**错误**: `User rejected the request`

**解决**:
- 确保 MetaMask 已安装
- 检查网络是否正确
- 刷新页面重试

### 问题 4: 前端无法连接合约

**错误**: `Contract not deployed`

**解决**:
- 确认合约地址正确
- 检查 ABI 文件是否正确导入
- 验证网络是否匹配

### 问题 5: 交易失败

**错误**: `Transaction reverted`

**解决**:
- 检查买入金额是否正确（1 ETH）
- 确保不在其他游戏中
- 查看合约事件日志了解具体原因

---

## 📊 Gas 费用估算

| 操作 | 估算 Gas | 估算费用 (Gas Price: 1 Gwei) |
|------|---------|------------------------------|
| 部署合约 | ~3,000,000 | ~0.003 ETH |
| 创建游戏 | ~300,000 | ~0.0003 ETH |
| 加入游戏 | ~200,000 | ~0.0002 ETH |
| Fold | ~50,000 | ~0.00005 ETH |
| Call | ~100,000 | ~0.0001 ETH |
| Raise | ~120,000 | ~0.00012 ETH |

*实际费用取决于网络状况和 Gas 价格*

---

## 🔐 安全检查清单

部署前确保：

- [ ] ✅ 私钥安全存储，未提交到 Git
- [ ] ✅ 使用测试账户，非生产账户
- [ ] ✅ 合约代码已审查
- [ ] ✅ 所有测试通过
- [ ] ✅ 前端连接正确的合约地址
- [ ] ✅ 网络配置正确
- [ ] ✅ 紧急暂停机制测试（如有）

---

## 📝 部署后操作

### 1. 保存重要信息

创建 `DEPLOYMENT_INFO.txt`：

```
部署时间: 2025-10-18
网络: Zama Devnet
合约地址: 0xabcd...ef01
部署者: 0x1234...5678
交易哈希: 0x...
区块号: 123456
```

### 2. 通知团队

- 在 Discord/Telegram 分享合约地址
- 更新项目文档
- 发布公告

### 3. 监控

- 监控合约交互
- 跟踪 Gas 使用情况
- 记录错误和问题

### 4. 提交到 Zama

- 访问 [Guild.xyz](https://guild.xyz/zama/developer-program)
- 提交项目信息
- 包含合约地址和演示视频

---

## 🎉 完成！

恭喜你成功部署了 Secret Poker！

### 下一步

1. **测试游戏**: 邀请朋友一起玩
2. **收集反馈**: 记录用户体验
3. **持续改进**: 根据反馈优化
4. **社区建设**: 在社交媒体分享

### 获取帮助

- 📖 阅读 [README.md](README.md)
- 🏗️ 查看 [ARCHITECTURE.md](ARCHITECTURE.md)
- 💬 加入 Zama Discord
- 🐛 在 GitHub 提交 Issue

---

**祝你游戏愉快！Good luck! 🍀**

