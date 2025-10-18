// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

/**
 * @title SecretPoker
 * @dev A fully on-chain Texas Hold'em poker game using FHEVM for encrypted cards and betting
 * @notice This contract demonstrates the power of FHE for gaming applications
 */
contract SecretPoker is GatewayCaller {
    // Card representation: 0-51 (13 ranks * 4 suits)
    // Ranks: 2=0, 3=1, ..., 10=8, J=9, Q=10, K=11, A=12
    // Suits: Hearts=0, Diamonds=1, Clubs=2, Spades=3
    
    uint256 public constant MIN_PLAYERS = 2;
    uint256 public constant MAX_PLAYERS = 6;
    uint256 public constant BUY_IN = 1 ether;
    uint256 public constant SMALL_BLIND = 0.01 ether;
    uint256 public constant BIG_BLIND = 0.02 ether;
    
    enum GameState {
        Waiting,      // Waiting for players
        PreFlop,      // Cards dealt, betting round 1
        Flop,         // 3 community cards revealed
        Turn,         // 4th community card revealed
        River,        // 5th community card revealed
        Showdown,     // Reveal and determine winner
        Finished      // Game over
    }
    
    enum PlayerAction {
        None,
        Fold,
        Check,
        Call,
        Raise
    }
    
    struct Player {
        address addr;
        euint8 card1;           // First hole card (encrypted)
        euint8 card2;           // Second hole card (encrypted)
        euint64 chips;          // Player's chip count (encrypted)
        euint64 currentBet;     // Current bet in this round (encrypted)
        bool hasFolded;
        bool isActive;
        PlayerAction lastAction;
    }
    
    struct Game {
        uint256 gameId;
        GameState state;
        Player[] players;
        mapping(address => uint256) playerIndex;
        euint8[5] communityCards;  // Flop, Turn, River (encrypted)
        uint8 communityCardsRevealed;
        uint256 pot;
        uint256 currentPlayerIndex;
        uint256 dealerIndex;
        uint256 currentRound;
        uint256 lastRaiseAmount;
        uint256 playersRemaining;
        address winner;
        bool exists;
    }
    
    uint256 public gameCounter;
    mapping(uint256 => Game) public games;
    mapping(address => uint256) public playerToGame;
    
    // Events
    event GameCreated(uint256 indexed gameId, address indexed creator);
    event PlayerJoined(uint256 indexed gameId, address indexed player);
    event GameStarted(uint256 indexed gameId, uint256 numPlayers);
    event StateChanged(uint256 indexed gameId, GameState newState);
    event PlayerAction(uint256 indexed gameId, address indexed player, PlayerAction action, uint256 amount);
    event CommunityCardsRevealed(uint256 indexed gameId, uint8 numCards);
    event GameFinished(uint256 indexed gameId, address indexed winner, uint256 amount);
    
    modifier onlyInGame(uint256 gameId) {
        require(games[gameId].exists, "Game does not exist");
        require(playerToGame[msg.sender] == gameId, "Not in this game");
        _;
    }
    
    modifier onlyCurrentPlayer(uint256 gameId) {
        Game storage game = games[gameId];
        require(
            game.players[game.currentPlayerIndex].addr == msg.sender,
            "Not your turn"
        );
        _;
    }
    
    /**
     * @dev Create a new poker game
     */
    function createGame() external payable returns (uint256) {
        require(msg.value == BUY_IN, "Must send exact buy-in amount");
        require(playerToGame[msg.sender] == 0, "Already in a game");
        
        gameCounter++;
        uint256 gameId = gameCounter;
        
        Game storage game = games[gameId];
        game.gameId = gameId;
        game.state = GameState.Waiting;
        game.exists = true;
        game.dealerIndex = 0;
        game.playersRemaining = 0;
        
        // Add creator as first player
        _addPlayer(gameId, msg.sender, msg.value);
        
        emit GameCreated(gameId, msg.sender);
        return gameId;
    }
    
    /**
     * @dev Join an existing game
     */
    function joinGame(uint256 gameId) external payable {
        require(games[gameId].exists, "Game does not exist");
        require(msg.value == BUY_IN, "Must send exact buy-in amount");
        require(playerToGame[msg.sender] == 0, "Already in a game");
        
        Game storage game = games[gameId];
        require(game.state == GameState.Waiting, "Game already started");
        require(game.players.length < MAX_PLAYERS, "Game is full");
        
        _addPlayer(gameId, msg.sender, msg.value);
        
        emit PlayerJoined(gameId, msg.sender);
        
        // Auto-start if we have enough players
        if (game.players.length >= MIN_PLAYERS) {
            _startGame(gameId);
        }
    }
    
    /**
     * @dev Start the game (can be called manually or auto-triggered)
     */
    function startGame(uint256 gameId) external onlyInGame(gameId) {
        Game storage game = games[gameId];
        require(game.state == GameState.Waiting, "Game already started");
        require(game.players.length >= MIN_PLAYERS, "Not enough players");
        
        _startGame(gameId);
    }
    
    /**
     * @dev Internal function to add a player
     */
    function _addPlayer(uint256 gameId, address playerAddr, uint256 buyIn) internal {
        Game storage game = games[gameId];
        
        Player memory newPlayer;
        newPlayer.addr = playerAddr;
        newPlayer.chips = TFHE.asEuint64(buyIn);
        newPlayer.currentBet = TFHE.asEuint64(0);
        newPlayer.hasFolded = false;
        newPlayer.isActive = true;
        newPlayer.lastAction = PlayerAction.None;
        
        game.players.push(newPlayer);
        game.playerIndex[playerAddr] = game.players.length - 1;
        game.playersRemaining++;
        playerToGame[playerAddr] = gameId;
    }
    
    /**
     * @dev Internal function to start the game
     */
    function _startGame(uint256 gameId) internal {
        Game storage game = games[gameId];
        
        // Deal cards (in real implementation, use VRF for randomness)
        _dealCards(gameId);
        
        // Post blinds
        _postBlinds(gameId);
        
        game.state = GameState.PreFlop;
        game.currentPlayerIndex = (game.dealerIndex + 3) % game.players.length;
        
        emit GameStarted(gameId, game.players.length);
        emit StateChanged(gameId, GameState.PreFlop);
    }
    
    /**
     * @dev Deal encrypted cards to all players
     * NOTE: In production, use Zama's random number generation
     */
    function _dealCards(uint256 gameId) internal {
        Game storage game = games[gameId];
        
        // Simplified: In real implementation, use proper shuffling with FHE
        // For demo purposes, we assign cards deterministically
        uint256 cardIndex = 0;
        
        for (uint256 i = 0; i < game.players.length; i++) {
            game.players[i].card1 = TFHE.asEuint8(uint8(cardIndex));
            TFHE.allowThis(game.players[i].card1);
            TFHE.allow(game.players[i].card1, game.players[i].addr);
            cardIndex++;
            
            game.players[i].card2 = TFHE.asEuint8(uint8(cardIndex));
            TFHE.allowThis(game.players[i].card2);
            TFHE.allow(game.players[i].card2, game.players[i].addr);
            cardIndex++;
        }
        
        // Deal community cards (kept encrypted until revealed)
        for (uint256 i = 0; i < 5; i++) {
            game.communityCards[i] = TFHE.asEuint8(uint8(cardIndex));
            TFHE.allowThis(game.communityCards[i]);
            cardIndex++;
        }
    }
    
    /**
     * @dev Post small and big blinds
     */
    function _postBlinds(uint256 gameId) internal {
        Game storage game = games[gameId];
        
        uint256 smallBlindIdx = (game.dealerIndex + 1) % game.players.length;
        uint256 bigBlindIdx = (game.dealerIndex + 2) % game.players.length;
        
        // Small blind
        game.players[smallBlindIdx].currentBet = TFHE.asEuint64(SMALL_BLIND);
        game.players[smallBlindIdx].chips = TFHE.sub(
            game.players[smallBlindIdx].chips,
            TFHE.asEuint64(SMALL_BLIND)
        );
        game.pot += SMALL_BLIND;
        
        // Big blind
        game.players[bigBlindIdx].currentBet = TFHE.asEuint64(BIG_BLIND);
        game.players[bigBlindIdx].chips = TFHE.sub(
            game.players[bigBlindIdx].chips,
            TFHE.asEuint64(BIG_BLIND)
        );
        game.pot += BIG_BLIND;
        
        game.lastRaiseAmount = BIG_BLIND;
    }
    
    /**
     * @dev Player folds their hand
     */
    function fold(uint256 gameId) external onlyInGame(gameId) onlyCurrentPlayer(gameId) {
        Game storage game = games[gameId];
        require(game.state != GameState.Finished, "Game is over");
        
        uint256 playerIdx = game.playerIndex[msg.sender];
        game.players[playerIdx].hasFolded = true;
        game.players[playerIdx].lastAction = PlayerAction.Fold;
        game.playersRemaining--;
        
        emit PlayerAction(gameId, msg.sender, PlayerAction.Fold, 0);
        
        // Check if only one player remains
        if (game.playersRemaining == 1) {
            _endGame(gameId);
        } else {
            _nextPlayer(gameId);
        }
    }
    
    /**
     * @dev Player checks (no bet required)
     */
    function check(uint256 gameId) external onlyInGame(gameId) onlyCurrentPlayer(gameId) {
        Game storage game = games[gameId];
        require(game.state != GameState.Finished, "Game is over");
        
        uint256 playerIdx = game.playerIndex[msg.sender];
        game.players[playerIdx].lastAction = PlayerAction.Check;
        
        emit PlayerAction(gameId, msg.sender, PlayerAction.Check, 0);
        
        _nextPlayer(gameId);
    }
    
    /**
     * @dev Player calls the current bet
     */
    function call(uint256 gameId) external onlyInGame(gameId) onlyCurrentPlayer(gameId) {
        Game storage game = games[gameId];
        require(game.state != GameState.Finished, "Game is over");
        
        uint256 playerIdx = game.playerIndex[msg.sender];
        uint256 callAmount = game.lastRaiseAmount;
        
        game.players[playerIdx].currentBet = TFHE.asEuint64(callAmount);
        game.players[playerIdx].chips = TFHE.sub(
            game.players[playerIdx].chips,
            TFHE.asEuint64(callAmount)
        );
        game.players[playerIdx].lastAction = PlayerAction.Call;
        game.pot += callAmount;
        
        emit PlayerAction(gameId, msg.sender, PlayerAction.Call, callAmount);
        
        _nextPlayer(gameId);
    }
    
    /**
     * @dev Player raises the bet
     */
    function raise(uint256 gameId, uint256 raiseAmount) external onlyInGame(gameId) onlyCurrentPlayer(gameId) {
        Game storage game = games[gameId];
        require(game.state != GameState.Finished, "Game is over");
        require(raiseAmount >= game.lastRaiseAmount * 2, "Raise must be at least 2x current bet");
        
        uint256 playerIdx = game.playerIndex[msg.sender];
        
        game.players[playerIdx].currentBet = TFHE.asEuint64(raiseAmount);
        game.players[playerIdx].chips = TFHE.sub(
            game.players[playerIdx].chips,
            TFHE.asEuint64(raiseAmount)
        );
        game.players[playerIdx].lastAction = PlayerAction.Raise;
        game.pot += raiseAmount;
        game.lastRaiseAmount = raiseAmount;
        
        emit PlayerAction(gameId, msg.sender, PlayerAction.Raise, raiseAmount);
        
        _nextPlayer(gameId);
    }
    
    /**
     * @dev Move to next player or next round
     */
    function _nextPlayer(uint256 gameId) internal {
        Game storage game = games[gameId];
        
        // Find next active player
        uint256 nextIdx = (game.currentPlayerIndex + 1) % game.players.length;
        while (game.players[nextIdx].hasFolded && nextIdx != game.currentPlayerIndex) {
            nextIdx = (nextIdx + 1) % game.players.length;
        }
        
        // Check if betting round is complete
        bool roundComplete = _isBettingRoundComplete(gameId, nextIdx);
        
        if (roundComplete) {
            _advanceGameState(gameId);
        } else {
            game.currentPlayerIndex = nextIdx;
        }
    }
    
    /**
     * @dev Check if betting round is complete
     */
    function _isBettingRoundComplete(uint256 gameId, uint256 nextIdx) internal view returns (bool) {
        Game storage game = games[gameId];
        
        // Simple check: if we're back to dealer position and everyone has acted
        return nextIdx == game.dealerIndex;
    }
    
    /**
     * @dev Advance to next game state
     */
    function _advanceGameState(uint256 gameId) internal {
        Game storage game = games[gameId];
        
        if (game.state == GameState.PreFlop) {
            game.state = GameState.Flop;
            game.communityCardsRevealed = 3;
            emit CommunityCardsRevealed(gameId, 3);
        } else if (game.state == GameState.Flop) {
            game.state = GameState.Turn;
            game.communityCardsRevealed = 4;
            emit CommunityCardsRevealed(gameId, 4);
        } else if (game.state == GameState.Turn) {
            game.state = GameState.River;
            game.communityCardsRevealed = 5;
            emit CommunityCardsRevealed(gameId, 5);
        } else if (game.state == GameState.River) {
            game.state = GameState.Showdown;
            _showdown(gameId);
        }
        
        emit StateChanged(gameId, game.state);
        
        // Reset for next betting round
        game.currentPlayerIndex = (game.dealerIndex + 1) % game.players.length;
        game.lastRaiseAmount = 0;
    }
    
    /**
     * @dev Showdown - reveal cards and determine winner
     */
    function _showdown(uint256 gameId) internal {
        Game storage game = games[gameId];
        
        // In a real implementation, decrypt cards and evaluate poker hands
        // For this demo, we'll use a simplified winner selection
        
        address winner = address(0);
        for (uint256 i = 0; i < game.players.length; i++) {
            if (!game.players[i].hasFolded) {
                winner = game.players[i].addr;
                break;
            }
        }
        
        game.winner = winner;
        _endGame(gameId);
    }
    
    /**
     * @dev End the game and distribute pot to winner
     */
    function _endGame(uint256 gameId) internal {
        Game storage game = games[gameId];
        
        // Find winner (last player standing or showdown winner)
        if (game.winner == address(0)) {
            for (uint256 i = 0; i < game.players.length; i++) {
                if (!game.players[i].hasFolded) {
                    game.winner = game.players[i].addr;
                    break;
                }
            }
        }
        
        // Transfer pot to winner
        uint256 winnings = game.pot;
        game.pot = 0;
        game.state = GameState.Finished;
        
        // Clear player associations
        for (uint256 i = 0; i < game.players.length; i++) {
            playerToGame[game.players[i].addr] = 0;
        }
        
        payable(game.winner).transfer(winnings);
        
        emit GameFinished(gameId, game.winner, winnings);
        emit StateChanged(gameId, GameState.Finished);
    }
    
    /**
     * @dev Get player's encrypted cards (only callable by player)
     */
    function getMyCards(uint256 gameId) external view onlyInGame(gameId) returns (euint8, euint8) {
        Game storage game = games[gameId];
        uint256 playerIdx = game.playerIndex[msg.sender];
        return (game.players[playerIdx].card1, game.players[playerIdx].card2);
    }
    
    /**
     * @dev Get community cards (encrypted until revealed)
     */
    function getCommunityCards(uint256 gameId) external view returns (euint8[5] memory) {
        Game storage game = games[gameId];
        return game.communityCards;
    }
    
    /**
     * @dev Get game info
     */
    function getGameInfo(uint256 gameId) external view returns (
        GameState state,
        uint256 numPlayers,
        uint256 pot,
        uint256 currentPlayerIndex,
        address currentPlayer,
        address winner
    ) {
        Game storage game = games[gameId];
        return (
            game.state,
            game.players.length,
            game.pot,
            game.currentPlayerIndex,
            game.players[game.currentPlayerIndex].addr,
            game.winner
        );
    }
    
    /**
     * @dev Get player info
     */
    function getPlayerInfo(uint256 gameId, address playerAddr) external view returns (
        bool isActive,
        bool hasFolded,
        PlayerAction lastAction
    ) {
        Game storage game = games[gameId];
        uint256 playerIdx = game.playerIndex[playerAddr];
        Player storage player = game.players[playerIdx];
        
        return (
            player.isActive,
            player.hasFolded,
            player.lastAction
        );
    }
}

