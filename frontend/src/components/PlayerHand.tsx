'use client'

import PlayingCard from './PlayingCard'

interface PlayerHandProps {
  cards: number[]
}

export default function PlayerHand({ cards }: PlayerHandProps) {
  return (
    <div className="bg-poker-felt bg-opacity-30 rounded-lg p-6 border border-green-700">
      <h3 className="text-xl font-bold mb-4 text-poker-gold">你的手牌 🎴</h3>
      
      <div className="flex gap-4 justify-center mb-4">
        {cards.length > 0 ? (
          cards.map((card, idx) => (
            <PlayingCard key={idx} cardValue={card} isRevealed={true} />
          ))
        ) : (
          <>
            <div className="card-back">
              <div className="text-white text-xs">等待发牌...</div>
            </div>
            <div className="card-back">
              <div className="text-white text-xs">等待发牌...</div>
            </div>
          </>
        )}
      </div>

      <div className="text-center text-sm text-gray-400">
        🔒 你的手牌使用 FHE 加密，只有你能看到
      </div>
    </div>
  )
}

