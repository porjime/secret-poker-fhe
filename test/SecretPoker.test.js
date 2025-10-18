const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecretPoker", function () {
  let secretPoker;
  let owner, player1, player2, player3;
  const BUY_IN = ethers.parseEther("1");

  beforeEach(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();

    const SecretPoker = await ethers.getContractFactory("SecretPoker");
    secretPoker = await SecretPoker.deploy();
    await secretPoker.waitForDeployment();
  });

  describe("Game Creation", function () {
    it("Should create a new game", async function () {
      const tx = await secretPoker.connect(player1).createGame({ value: BUY_IN });
      const receipt = await tx.wait();
      
      const gameId = await secretPoker.gameCounter();
      expect(gameId).to.equal(1);
    });

    it("Should fail to create game without buy-in", async function () {
      await expect(
        secretPoker.connect(player1).createGame({ value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("Must send exact buy-in amount");
    });

    it("Should fail if player already in a game", async function () {
      await secretPoker.connect(player1).createGame({ value: BUY_IN });
      
      await expect(
        secretPoker.connect(player1).createGame({ value: BUY_IN })
      ).to.be.revertedWith("Already in a game");
    });
  });

  describe("Joining Games", function () {
    let gameId;

    beforeEach(async function () {
      await secretPoker.connect(player1).createGame({ value: BUY_IN });
      gameId = await secretPoker.gameCounter();
    });

    it("Should allow player to join existing game", async function () {
      await expect(
        secretPoker.connect(player2).joinGame(gameId, { value: BUY_IN })
      ).to.not.be.reverted;
    });

    it("Should auto-start game when minimum players join", async function () {
      await secretPoker.connect(player2).joinGame(gameId, { value: BUY_IN });
      
      const gameInfo = await secretPoker.getGameInfo(gameId);
      // GameState.PreFlop = 1
      expect(gameInfo.state).to.equal(1);
    });

    it("Should not allow more than max players", async function () {
      // Join 5 more players (total 6)
      await secretPoker.connect(player2).joinGame(gameId, { value: BUY_IN });
      
      const [, p3, p4, p5, p6, p7] = await ethers.getSigners();
      await secretPoker.connect(p3).joinGame(gameId, { value: BUY_IN });
      await secretPoker.connect(p4).joinGame(gameId, { value: BUY_IN });
      await secretPoker.connect(p5).joinGame(gameId, { value: BUY_IN });
      await secretPoker.connect(p6).joinGame(gameId, { value: BUY_IN });
      
      // 7th player should fail
      await expect(
        secretPoker.connect(p7).joinGame(gameId, { value: BUY_IN })
      ).to.be.revertedWith("Game is full");
    });
  });

  describe("Game Play", function () {
    let gameId;

    beforeEach(async function () {
      await secretPoker.connect(player1).createGame({ value: BUY_IN });
      gameId = await secretPoker.gameCounter();
      await secretPoker.connect(player2).joinGame(gameId, { value: BUY_IN });
    });

    it("Should allow current player to fold", async function () {
      const gameInfo = await secretPoker.getGameInfo(gameId);
      const currentPlayer = gameInfo.currentPlayer;
      
      // Get signer for current player
      const signers = await ethers.getSigners();
      let currentSigner;
      for (let signer of signers) {
        if (signer.address === currentPlayer) {
          currentSigner = signer;
          break;
        }
      }
      
      if (currentSigner) {
        await expect(
          secretPoker.connect(currentSigner).fold(gameId)
        ).to.not.be.reverted;
      }
    });

    it("Should not allow non-current player to act", async function () {
      const gameInfo = await secretPoker.getGameInfo(gameId);
      const currentPlayer = gameInfo.currentPlayer;
      
      // Find a player who is NOT current
      const notCurrentPlayer = player1.address === currentPlayer ? player2 : player1;
      
      await expect(
        secretPoker.connect(notCurrentPlayer).fold(gameId)
      ).to.be.revertedWith("Not your turn");
    });

    it("Should track pot correctly", async function () {
      const gameInfo = await secretPoker.getGameInfo(gameId);
      
      // Should have blinds in pot
      const SMALL_BLIND = ethers.parseEther("0.01");
      const BIG_BLIND = ethers.parseEther("0.02");
      const expectedPot = SMALL_BLIND + BIG_BLIND;
      
      expect(gameInfo.pot).to.equal(expectedPot);
    });
  });

  describe("Game Info", function () {
    let gameId;

    beforeEach(async function () {
      await secretPoker.connect(player1).createGame({ value: BUY_IN });
      gameId = await secretPoker.gameCounter();
    });

    it("Should return correct game info", async function () {
      const gameInfo = await secretPoker.getGameInfo(gameId);
      
      expect(gameInfo.state).to.equal(0); // Waiting state
      expect(gameInfo.numPlayers).to.equal(1);
    });

    it("Should allow player to view their encrypted cards", async function () {
      await secretPoker.connect(player2).joinGame(gameId, { value: BUY_IN });
      
      // Cards should be dealt after game starts
      const cards = await secretPoker.connect(player1).getMyCards(gameId);
      expect(cards).to.not.be.undefined;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle game that doesn't exist", async function () {
      await expect(
        secretPoker.connect(player1).joinGame(999, { value: BUY_IN })
      ).to.be.revertedWith("Game does not exist");
    });

    it("Should end game when all but one player folds", async function () {
      await secretPoker.connect(player1).createGame({ value: BUY_IN });
      const gameId = await secretPoker.gameCounter();
      await secretPoker.connect(player2).joinGame(gameId, { value: BUY_IN });
      
      // Have player fold until only one remains
      const gameInfo = await secretPoker.getGameInfo(gameId);
      const currentPlayer = gameInfo.currentPlayer;
      
      const signers = await ethers.getSigners();
      let currentSigner;
      for (let signer of signers) {
        if (signer.address === currentPlayer) {
          currentSigner = signer;
          break;
        }
      }
      
      if (currentSigner) {
        await secretPoker.connect(currentSigner).fold(gameId);
        
        const finalGameInfo = await secretPoker.getGameInfo(gameId);
        // Should be finished (state 6)
        expect(finalGameInfo.state).to.equal(6);
      }
    });
  });
});

