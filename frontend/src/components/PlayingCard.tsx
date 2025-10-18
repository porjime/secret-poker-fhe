'use client'

interface PlayingCardProps {
  cardValue: number  // 0-51 (13 ranks * 4 suits)
  isRevealed: boolean
}

export default function PlayingCard({ cardValue, isRevealed }: PlayingCardProps) {
  const suits = ['♥️', '♦️', '♣️', '♠️']
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
  
  if (!isRevealed) {
    return (
      <div className="card-back">
        <div className="text-white text-2xl">🂠</div>
      </div>
    )
  }
  
  const suit = suits[Math.floor(cardValue / 13)]
  const rank = ranks[cardValue % 13]
  const isRed = suit === '♥️' || suit === '♦️'
  
  return (
    <div className={`card ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
      <div className="text-center">
        <div className="text-2xl font-bold">{rank}</div>
        <div className="text-3xl">{suit}</div>
      </div>
    </div>
  )
}

