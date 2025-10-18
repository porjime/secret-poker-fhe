# 🤝 贡献指南

感谢你考虑为 Secret Poker 项目做出贡献！

## 📋 贡献方式

### 报告 Bug

如果你发现 bug，请创建一个 Issue，包含：

- Bug 的详细描述
- 重现步骤
- 预期行为 vs 实际行为
- 环境信息（浏览器、钱包、网络等）
- 截图或视频（如果适用）

### 提出新功能

我们欢迎新功能建议！请创建 Issue 说明：

- 功能描述和用途
- 使用场景
- 可能的实现方式
- 是否愿意自己实现

### 提交代码

1. **Fork 项目**
   ```bash
   # 点击 GitHub 页面的 Fork 按钮
   ```

2. **克隆到本地**
   ```bash
   git clone https://github.com/your-username/secret-poker-fhe.git
   cd secret-poker-fhe
   ```

3. **创建特性分支**
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **安装依赖**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

5. **进行修改**
   - 遵循现有代码风格
   - 添加注释
   - 更新文档（如需要）

6. **运行测试**
   ```bash
   npm run test
   ```

7. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加某某功能"
   ```

8. **推送到 GitHub**
   ```bash
   git push origin feature/amazing-feature
   ```

9. **创建 Pull Request**
   - 访问你的 fork 页面
   - 点击 "New Pull Request"
   - 填写详细的 PR 描述

## 📝 代码规范

### Solidity

- 使用 Solidity 0.8.24
- 遵循 [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- 添加 NatSpec 注释
- 优化 Gas 消耗

```solidity
/**
 * @dev 函数描述
 * @param gameId 游戏 ID
 * @return 返回值描述
 */
function myFunction(uint256 gameId) external returns (bool) {
    // 实现
}
```

### TypeScript/React

- 使用 TypeScript strict 模式
- 使用函数式组件和 Hooks
- 遵循 React 最佳实践
- 添加类型注释

```typescript
interface MyComponentProps {
  gameId: number
  onAction: (action: string) => void
}

export default function MyComponent({ gameId, onAction }: MyComponentProps) {
  // 实现
}
```

### 提交信息格式

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
类型(作用域): 简短描述

详细描述（可选）

BREAKING CHANGE: 重大变更说明（可选）
```

**类型**：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 添加测试
- `chore`: 构建过程或辅助工具的变动

**示例**：
```
feat(contract): 添加锦标赛模式

实现多桌锦标赛功能，包括：
- 玩家注册
- 自动分配桌位
- 淘汰赛逻辑

fix(ui): 修复扑克牌显示错误

当玩家手牌为 A 时，花色显示不正确

docs(readme): 更新部署说明

添加 Zama Devnet 部署步骤
```

## 🧪 测试要求

所有代码更改必须包含测试：

### 智能合约测试

```javascript
describe("NewFeature", function () {
  it("Should do something", async function () {
    // 测试实现
  });
});
```

### 前端测试

```typescript
import { render, screen } from '@testing-library/react'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

## 📚 文档要求

- 更新 README.md（如添加新功能）
- 添加代码注释
- 更新 API 文档（如有变更）
- 添加使用示例

## 🔍 代码审查流程

1. 自动化检查（CI/CD）
   - 代码风格检查
   - 单元测试
   - 编译检查

2. 人工审查
   - 代码质量
   - 功能正确性
   - 安全性
   - 性能影响

3. 反馈和修改
   - 及时响应审查意见
   - 进行必要的修改
   - 更新 PR 描述

## 🎯 开发优先级

当前重点开发方向：

### 高优先级
- [ ] VRF 随机数洗牌
- [ ] 完整手牌评估算法
- [ ] 超时和断线重连机制

### 中优先级
- [ ] 锦标赛模式
- [ ] 游戏历史记录
- [ ] 玩家统计数据

### 低优先级
- [ ] 观战模式
- [ ] 聊天系统
- [ ] 社交功能

## ⚠️ 注意事项

### 不要提交

- 私钥或助记词
- `.env` 文件
- `node_modules` 目录
- 编译产物（除非必要）
- 个人配置文件

### 安全考虑

- 不要引入已知漏洞的依赖
- 避免重入攻击
- 谨慎处理用户输入
- 遵循智能合约安全最佳实践

### Gas 优化

- 减少存储操作
- 使用事件而非存储记录
- 批量操作合并
- 优化循环

## 💬 交流渠道

- **GitHub Issues**: 问题报告和功能建议
- **GitHub Discussions**: 一般讨论
- **Discord**: Zama 社区频道
- **Email**: [项目维护者邮箱]

## 📜 许可证

通过贡献代码，你同意你的贡献将在 MIT 许可证下授权。

## 🙏 致谢

感谢所有贡献者！

- 查看 [Contributors](https://github.com/your-username/secret-poker-fhe/graphs/contributors) 列表

---

**再次感谢你的贡献！让我们一起打造最好的 FHE 扑克游戏！** 🎮🚀

