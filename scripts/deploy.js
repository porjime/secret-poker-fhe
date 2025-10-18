const hre = require("hardhat");

async function main() {
  console.log("🚀 开始部署 Secret Poker 合约...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("账户余额:", ethers.formatEther(balance), "ETH\n");

  // Deploy SecretPoker contract
  console.log("正在部署 SecretPoker 合约...");
  const SecretPoker = await ethers.getContractFactory("SecretPoker");
  const secretPoker = await SecretPoker.deploy();
  
  await secretPoker.waitForDeployment();
  const contractAddress = await secretPoker.getAddress();

  console.log("✅ SecretPoker 合约已部署!");
  console.log("合约地址:", contractAddress);
  console.log("\n" + "=".repeat(60));
  console.log("📋 部署摘要");
  console.log("=".repeat(60));
  console.log("合约名称: SecretPoker");
  console.log("合约地址:", contractAddress);
  console.log("部署者:", deployer.address);
  console.log("网络:", hre.network.name);
  console.log("=".repeat(60));

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    contractName: "SecretPoker",
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    buyIn: "1 ETH",
    smallBlind: "0.01 ETH",
    bigBlind: "0.02 ETH",
    minPlayers: 2,
    maxPlayers: 6,
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n💾 部署信息已保存到 deployment-info.json");
  console.log("\n📝 下一步操作:");
  console.log("1. 将合约地址复制到 frontend/src/app/page.tsx");
  console.log("2. 运行 'cd frontend && npm install' 安装前端依赖");
  console.log("3. 运行 'cd frontend && npm run dev' 启动前端");
  console.log("4. 在浏览器中打开 http://localhost:3000");
  console.log("\n🎮 开始游戏!");

  // Verify contract (if not on hardhat network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n等待区块确认用于验证...");
    await secretPoker.deploymentTransaction().wait(5);
    
    console.log("正在验证合约...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ 合约验证成功!");
    } catch (error) {
      console.log("❌ 合约验证失败:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });

