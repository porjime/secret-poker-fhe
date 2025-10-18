# 🏗️ Secret Poker 技术架构文档

## 📐 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                         用户界面                              │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐         │
│  │ Next.js UI │  │ React组件库  │  │ TailwindCSS │         │
│  └────────────┘  └──────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↕ (Web3 APIs)
┌─────────────────────────────────────────────────────────────┐
│                     Web3 连接层                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐        │
│  │  ethers.js  │  │   fhevmjs    │  │  MetaMask   │        │
│  └─────────────┘  └──────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                           ↕ (JSON-RPC)
┌─────────────────────────────────────────────────────────────┐
│                     区块链层                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Zama FHEVM Network                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │   │
│  │  │   EVM      │  │ FHE Coprocessor │  │  Storage │  │   │
│  │  └────────────┘  └────────────┘  └──────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                    智能合约层                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              SecretPoker.sol                         │   │
│  │                                                       │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────┐  │   │
│  │  │ 游戏逻辑    │  │ FHE 加密     │  │ 状态管理 │  │   │
│  │  └─────────────┘  └──────────────┘  └──────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 FHE 加密架构

### 加密数据类型

```solidity
// 玩家结构体
struct Player {
    address addr;           // 公开：玩家地址
    euint8 card1;          // 加密：第一张底牌 (0-51)
    euint8 card2;          // 加密：第二张底牌 (0-51)
    euint64 chips;         // 加密：筹码数量
    euint64 currentBet;    // 加密：当前下注
    bool hasFolded;        // 公开：是否弃牌
    bool isActive;         // 公开：是否活跃
}
```

### 加密流程

```
1. 发牌阶段
   ┌─────────────┐
   │ 生成随机数  │ → 链上或 VRF
   └──────┬──────┘
          ↓
   ┌─────────────┐
   │ FHE 加密    │ → TFHE.asEuint8(cardValue)
   └──────┬──────┘
          ↓
   ┌─────────────┐
   │ 权限设置    │ → TFHE.allow(card, playerAddr)
   └──────┬──────┘
          ↓
   ┌─────────────┐
   │ 存储到合约  │
   └─────────────┘

2. 下注阶段
   ┌─────────────┐
   │ 玩家输入金额│
   └──────┬──────┘
          ↓
   ┌─────────────┐
   │ FHE 加密    │ → TFHE.asEuint64(amount)
   └──────┬──────┘
          ↓
   ┌─────────────┐
   │ 更新筹码    │ → TFHE.sub(chips, bet)
   └──────┬──────┘
          ↓
   ┌─────────────┐
   │ 更新奖池    │ → pot += amount (公开累加)
   └─────────────┘

3. 摊牌阶段
   ┌─────────────┐
   │ 请求解密    │ → Gateway 请求
   └──────┬──────┘
          ↓
   ┌─────────────┐
   │ FHE 解密    │ → 链下 FHE 协处理器
   └──────┬──────┘
          ↓
   ┌─────────────┐
   │ 比较手牌    │ → 确定赢家
   └──────┬──────┘
          ↓
   ┌─────────────┐
   │ 分配奖池    │
   └─────────────┘
```

## 🎮 游戏状态机

```
                    ┌──────────┐
                    │ Waiting  │ 等待玩家
                    └────┬─────┘
                         │ startGame()
                         ↓
                    ┌──────────┐
              ┌────→│ PreFlop  │ 前三张前下注
              │     └────┬─────┘
              │          │ _advanceGameState()
              │          ↓
              │     ┌──────────┐
              │     │   Flop   │ 翻开3张公共牌
              │     └────┬─────┘
              │          │
下注轮次      │          ↓
(fold/check/  │     ┌──────────┐
call/raise)   │     │   Turn   │ 翻开第4张牌
              │     └────┬─────┘
              │          │
              │          ↓
              │     ┌──────────┐
              │     │  River   │ 翻开第5张牌
              │     └────┬─────┘
              │          │
              └──────────┤
                         ↓
                    ┌──────────┐
                    │ Showdown │ 摊牌比较
                    └────┬─────┘
                         │ _endGame()
                         ↓
                    ┌──────────┐
                    │ Finished │ 游戏结束
                    └──────────┘
```

## 💾 数据存储结构

### 游戏映射

```solidity
// 游戏 ID → 游戏数据
mapping(uint256 => Game) public games;

// 玩家地址 → 游戏 ID
mapping(address => uint256) public playerToGame;
```

### Gas 优化策略

1. **使用事件代替存储**
   ```solidity
   // ❌ 昂贵：存储历史记录
   struct GameHistory {
       uint256[] actions;
   }
   
   // ✅ 便宜：使用事件
   event PlayerAction(uint256 indexed gameId, address indexed player, Action action);
   ```

2. **批量操作**
   ```solidity
   // ❌ 多次存储写入
   for (uint i = 0; i < players.length; i++) {
       players[i].isActive = false;
   }
   
   // ✅ 单次状态更新
   gameState = GameState.Finished;
   ```

3. **紧凑数据结构**
   ```solidity
   // 使用 uint8 而非 uint256（如适用）
   uint8 public communityCardsRevealed;  // 0-5
   GameState public state;  // enum (uint8)
   ```

## 🔄 交互流程

### 创建游戏流程

```
用户 → 前端 → MetaMask → FHEVM → SecretPoker.sol
  │      │        │          │           │
  │      │        │          │           ↓
  │      │        │          │      createGame()
  │      │        │          │           ↓
  │      │        │          │      初始化游戏
  │      │        │          │           ↓
  │      │        │          ←───── GameCreated 事件
  │      │        │          │
  │      │        ←──────────┤
  │      │        │
  │      ←────────┤
  │      │
  ←──────┤ 显示游戏 ID
```

### 加入游戏流程

```
用户 → joinGame(gameId) → 验证状态 → 发送 1 ETH
  │                           │              │
  ↓                           ↓              ↓
显示等待             检查玩家数量    添加到玩家列表
  │                           │              │
  ↓                           ↓              ↓
自动刷新         玩家 >= 2 ?         发牌 + 盲注
  │                    │                     │
  ↓                    ↓                     ↓
游戏开始          状态 → PreFlop      通知所有玩家
```

### 下注流程

```
当前玩家 → 选择操作 → 签名交易 → 更新状态 → 下一玩家
   │          │           │           │          │
   ↓          ↓           ↓           ↓          ↓
 Fold     Check       更新奖池    加密筹码    轮换索引
 Call     Raise       发送事件    验证有效    或下一阶段
```

## 🛡️ 安全机制

### 1. 访问控制

```solidity
modifier onlyInGame(uint256 gameId) {
    require(games[gameId].exists, "Game does not exist");
    require(playerToGame[msg.sender] == gameId, "Not in this game");
    _;
}

modifier onlyCurrentPlayer(uint256 gameId) {
    require(
        games[gameId].players[games[gameId].currentPlayerIndex].addr == msg.sender,
        "Not your turn"
    );
    _;
}
```

### 2. 重入保护

```solidity
// 使用检查-效果-交互模式
function _endGame(uint256 gameId) internal {
    Game storage game = games[gameId];
    
    // 1. 检查
    require(game.state != GameState.Finished, "Already finished");
    
    // 2. 效果（修改状态）
    uint256 winnings = game.pot;
    game.pot = 0;
    game.state = GameState.Finished;
    
    // 3. 交互（外部调用）
    payable(game.winner).transfer(winnings);
}
```

### 3. 输入验证

```solidity
function raise(uint256 gameId, uint256 raiseAmount) external {
    require(raiseAmount >= game.lastRaiseAmount * 2, "Raise too small");
    require(raiseAmount <= playerChips, "Insufficient chips");
    // ...
}
```

### 4. FHE 权限控制

```solidity
// 只允许玩家查看自己的牌
game.players[i].card1 = TFHE.asEuint8(cardValue);
TFHE.allowThis(game.players[i].card1);  // 合约可访问
TFHE.allow(game.players[i].card1, game.players[i].addr);  // 玩家可访问
```

## 📊 性能考虑

### Gas 消耗估算

| 操作 | Gas 估算 | 优化建议 |
|------|---------|---------|
| 创建游戏 | ~300K | 减少初始化存储 |
| 加入游戏 | ~200K | 批量发牌 |
| Fold | ~50K | 最小化状态更新 |
| Call | ~100K | 使用事件记录 |
| Raise | ~120K | 优化加密计算 |
| Showdown | ~500K | 链下计算手牌 |

### 扩展性设计

1. **支持多个同时进行的游戏**
   - 使用游戏 ID 隔离
   - 每个游戏独立状态
   - 玩家可同时参与多局（如移除限制）

2. **可升级架构**
   - 考虑使用代理模式（未来版本）
   - 数据和逻辑分离
   - 保留升级接口

3. **链下计算**
   - 手牌评估可移至链下
   - 使用预言机或 ZK 证明
   - 减少链上计算负担

## 🔮 未来优化方向

### 1. 真正的随机洗牌

```solidity
// 集成 Chainlink VRF
function dealCards(uint256 gameId, uint256 randomness) internal {
    // 使用 VRF 生成的随机数洗牌
    uint256[] memory shuffled = shuffle(randomness);
    // 发牌
}
```

### 2. 高级手牌评估

```solidity
// 在 FHE 下计算手牌等级
function evaluateHand(euint8 card1, euint8 card2, euint8[5] memory community)
    internal
    returns (euint16)
{
    // 返回加密的手牌强度值
}
```

### 3. 时间限制机制

```solidity
// 添加操作超时
mapping(uint256 => uint256) public lastActionTime;

function checkTimeout(uint256 gameId) public {
    if (block.timestamp - lastActionTime[gameId] > TIMEOUT) {
        // 自动弃牌或执行 check
    }
}
```

### 4. 多币种支持

```solidity
// 支持 ERC-20 代币
address public tokenAddress;

function createGameWithToken(address token, uint256 amount) external {
    IERC20(token).transferFrom(msg.sender, address(this), amount);
    // ...
}
```

## 📚 参考资料

- [Zama FHEVM 文档](https://docs.zama.ai/fhevm)
- [Solidity 文档](https://docs.soliditylang.org/)
- [德州扑克规则](https://en.wikipedia.org/wiki/Texas_hold_%27em)
- [智能合约安全最佳实践](https://consensys.github.io/smart-contract-best-practices/)

---

**文档版本**: v1.0.0  
**最后更新**: 2025-10-18

