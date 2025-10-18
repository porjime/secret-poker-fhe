'use client'

import PlayingCard from './PlayingCard'

interface Player {
  address: string
  chips: number
  hasFolded: boolean
  isActive: boolean
}

interface PokerTableProps {
  gameId: number
  players: Player[]
  communityCards: number[]
  pot: number
}

export default function PokerTable({ gameId, players, communityCards, pot }: PokerTableProps) {
  // Position players around the table (max 6 players)
  const playerPositions = [
    { top: '50%', left: '10%', transform: 'translateY(-50%)' },    // Left
    { top: '10%', left: '25%' },                                    // Top-Left
    { top: '10%', left: '75%', transform: 'translateX(-100%)' },   // Top-Right
    { top: '50%', right: '10%', transform: 'translateY(-50%)' },   // Right
    { bottom: '10%', right: '25%' },                                // Bottom-Right
    { bottom: '10%', left: '25%' },                                 // Bottom-Left (Player)
  ]

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Poker Table */}
      <div className="poker-table aspect-[16/10] relative">
        {/* Game Info Center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="bg-black bg-opacity-70 px-8 py-4 rounded-lg border-2 border-poker-gold">
            <div className="text-sm text-gray-400 mb-1">奖池</div>
            <div className="text-4xl font-bold text-poker-gold">
              💰 {pot.toFixed(3)} ETH
            </div>
          </div>
        </div>

        {/* Community Cards */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-20">
          <div className="flex gap-2 justify-center">
            {communityCards.length > 0 ? (
              communityCards.map((card, idx) => (
                <PlayingCard key={idx} cardValue={card} isRevealed={true} />
              ))
            ) : (
              // Placeholder for no community cards
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="card-back">
                    <div className="text-white text-xs">?</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Players */}
        {players.map((player, idx) => {
          const position = playerPositions[idx]
          return (
            <div
              key={player.address}
              className="player-spot"
              style={position}
            >
              <div className="text-center min-w-[120px]">
                <div className="font-mono text-sm text-gray-300 mb-2">
                  {player.address.substring(0, 6)}...
                </div>
                <div className={`chip-stack ${player.hasFolded ? 'bg-gray-600' : 'bg-green-600'}`}>
                  💎 {player.chips.toFixed(2)} ETH
                </div>
                {player.hasFolded && (
                  <div className="text-red-500 text-xs mt-1 font-bold">已弃牌</div>
                )}
              </div>
            </div>
          )
        })}

        {/* Dealer Button */}
        <div className="absolute bottom-[15%] left-[30%] bg-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-poker-dark shadow-lg border-2 border-poker-gold">
          D
        </div>
      </div>

      {/* Game Status Bar */}
      <div className="mt-4 bg-poker-felt bg-opacity-30 rounded-lg p-4 border border-green-700">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-400">游戏 ID: </span>
            <span className="font-bold">#{gameId}</span>
          </div>
          <div>
            <span className="text-gray-400">玩家: </span>
            <span className="font-bold">{players.length}/6</span>
          </div>
          <div>
            <span className="text-gray-400">状态: </span>
            <span className="font-bold text-green-400">进行中</span>
          </div>
        </div>
      </div>
    </div>
  )
}

