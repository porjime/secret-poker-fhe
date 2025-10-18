const hre = require("hardhat");
const readline = require('readline');

// 交互式命令行界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

let contract;
let signer;
let myGameId;

async function main() {
  console.log("🎮 Secret Poker 交互式控制台\n");

  // 加载部署的合约
  const deploymentInfo = require("../deployment-info.json");
  const contractAddress = deploymentInfo.contractAddress;

  console.log("合约地址:", contractAddress);
  console.log("网络:", hre.network.name);

  // 获取签名者
  [signer] = await ethers.getSigners();
  console.log("当前账户:", signer.address);

  const balance = await ethers.provider.getBalance(signer.address);
  console.log("账户余额:", ethers.formatEther(balance), "ETH\n");

  // 连接合约
  const SecretPoker = await ethers.getContractFactory("SecretPoker");
  contract = SecretPoker.attach(contractAddress);

  // 显示菜单
  await showMenu();
}

async function showMenu() {
  console.log("\n" + "=".repeat(50));
  console.log("📋 操作菜单");
  console.log("=".repeat(50));
  console.log("1. 创建新游戏");
  console.log("2. 加入游戏");
  console.log("3. 查看游戏信息");
  console.log("4. 查看我的手牌");
  console.log("5. 弃牌 (Fold)");
  console.log("6. 过牌 (Check)");
  console.log("7. 跟注 (Call)");
  console.log("8. 加注 (Raise)");
  console.log("9. 查看我的游戏 ID");
  console.log("0. 退出");
  console.log("=".repeat(50));

  const choice = await question("\n请选择操作 (0-9): ");

  switch (choice.trim()) {
    case "1":
      await createGame();
      break;
    case "2":
      await joinGame();
      break;
    case "3":
      await getGameInfo();
      break;
    case "4":
      await getMyCards();
      break;
    case "5":
      await fold();
      break;
    case "6":
      await check();
      break;
    case "7":
      await call();
      break;
    case "8":
      await raise();
      break;
    case "9":
      await getMyGameId();
      break;
    case "0":
      console.log("\n👋 再见！祝你好运！");
      rl.close();
      return;
    default:
      console.log("❌ 无效的选择");
  }

  await showMenu();
}

async function createGame() {
  console.log("\n🎲 创建新游戏...");
  
  try {
    const buyIn = ethers.parseEther("1");
    const tx = await contract.createGame({ value: buyIn });
    console.log("交易哈希:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ 游戏创建成功!");
    
    // 获取游戏 ID
    myGameId = await contract.gameCounter();
    console.log("游戏 ID:", myGameId.toString());
    
    // 获取 PlayerToGame
    const playerGame = await contract.playerToGame(signer.address);
    console.log("你的游戏 ID:", playerGame.toString());
  } catch (error) {
    console.error("❌ 创建失败:", error.message);
  }
}

async function joinGame() {
  const gameIdInput = await question("请输入游戏 ID: ");
  const gameId = parseInt(gameIdInput);
  
  console.log(`\n🤝 加入游戏 #${gameId}...`);
  
  try {
    const buyIn = ethers.parseEther("1");
    const tx = await contract.joinGame(gameId, { value: buyIn });
    console.log("交易哈希:", tx.hash);
    
    await tx.wait();
    console.log("✅ 成功加入游戏!");
    myGameId = gameId;
  } catch (error) {
    console.error("❌ 加入失败:", error.message);
  }
}

async function getGameInfo() {
  const gameIdInput = await question("请输入游戏 ID (回车使用当前游戏): ");
  const gameId = gameIdInput.trim() ? parseInt(gameIdInput) : myGameId;
  
  if (!gameId) {
    console.log("❌ 请先创建或加入游戏");
    return;
  }
  
  console.log(`\n📊 游戏 #${gameId} 信息:`);
  
  try {
    const info = await contract.getGameInfo(gameId);
    
    const states = ["等待中", "Pre-Flop", "Flop", "Turn", "River", "Showdown", "已结束"];
    
    console.log("状态:", states[info.state]);
    console.log("玩家数:", info.numPlayers.toString());
    console.log("奖池:", ethers.formatEther(info.pot), "ETH");
    console.log("当前玩家索引:", info.currentPlayerIndex.toString());
    console.log("当前玩家地址:", info.currentPlayer);
    
    if (info.winner !== ethers.ZeroAddress) {
      console.log("赢家:", info.winner);
    }
  } catch (error) {
    console.error("❌ 获取失败:", error.message);
  }
}

async function getMyCards() {
  if (!myGameId) {
    console.log("❌ 请先创建或加入游戏");
    return;
  }
  
  console.log(`\n🎴 你的手牌 (游戏 #${myGameId}):`);
  
  try {
    const cards = await contract.getMyCards(myGameId);
    console.log("注意：手牌是加密的，需要通过前端界面使用 fhevmjs 解密");
    console.log("Card 1 (encrypted):", cards[0]);
    console.log("Card 2 (encrypted):", cards[1]);
  } catch (error) {
    console.error("❌ 获取失败:", error.message);
  }
}

async function fold() {
  if (!myGameId) {
    console.log("❌ 请先创建或加入游戏");
    return;
  }
  
  console.log(`\n🚫 弃牌 (游戏 #${myGameId})...`);
  
  try {
    const tx = await contract.fold(myGameId);
    console.log("交易哈希:", tx.hash);
    
    await tx.wait();
    console.log("✅ 已弃牌");
  } catch (error) {
    console.error("❌ 操作失败:", error.message);
  }
}

async function check() {
  if (!myGameId) {
    console.log("❌ 请先创建或加入游戏");
    return;
  }
  
  console.log(`\n✋ 过牌 (游戏 #${myGameId})...`);
  
  try {
    const tx = await contract.check(myGameId);
    console.log("交易哈希:", tx.hash);
    
    await tx.wait();
    console.log("✅ 已过牌");
  } catch (error) {
    console.error("❌ 操作失败:", error.message);
  }
}

async function call() {
  if (!myGameId) {
    console.log("❌ 请先创建或加入游戏");
    return;
  }
  
  console.log(`\n💵 跟注 (游戏 #${myGameId})...`);
  
  try {
    const tx = await contract.call(myGameId);
    console.log("交易哈希:", tx.hash);
    
    await tx.wait();
    console.log("✅ 已跟注");
  } catch (error) {
    console.error("❌ 操作失败:", error.message);
  }
}

async function raise() {
  if (!myGameId) {
    console.log("❌ 请先创建或加入游戏");
    return;
  }
  
  const amountInput = await question("请输入加注金额 (ETH): ");
  const amount = ethers.parseEther(amountInput);
  
  console.log(`\n📈 加注 ${amountInput} ETH (游戏 #${myGameId})...`);
  
  try {
    const tx = await contract.raise(myGameId, amount);
    console.log("交易哈希:", tx.hash);
    
    await tx.wait();
    console.log("✅ 已加注");
  } catch (error) {
    console.error("❌ 操作失败:", error.message);
  }
}

async function getMyGameId() {
  try {
    const gameId = await contract.playerToGame(signer.address);
    if (gameId.toString() === "0") {
      console.log("\n❌ 你当前没有参与任何游戏");
    } else {
      console.log(`\n✅ 你当前的游戏 ID: ${gameId.toString()}`);
      myGameId = gameId;
    }
  } catch (error) {
    console.error("❌ 查询失败:", error.message);
  }
}

main()
  .then(() => {})
  .catch((error) => {
    console.error("❌ 错误:", error);
    rl.close();
    process.exit(1);
  });

