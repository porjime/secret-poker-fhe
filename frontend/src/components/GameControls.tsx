'use client'

import { useState } from 'react'

interface GameControlsProps {
  gameId: number
  isMyTurn: boolean
  currentBet: number
}

export default function GameControls({ gameId, isMyTurn, currentBet }: GameControlsProps) {
  const [raiseAmount, setRaiseAmount] = useState<string>('')

  const handleFold = () => {
    console.log('Fold')
    // TODO: Call contract fold function
  }

  const handleCheck = () => {
    console.log('Check')
    // TODO: Call contract check function
  }

  const handleCall = () => {
    console.log('Call')
    // TODO: Call contract call function
  }

  const handleRaise = () => {
    console.log('Raise:', raiseAmount)
    // TODO: Call contract raise function
  }

  return (
    <div className="bg-poker-felt bg-opacity-30 rounded-lg p-6 border border-green-700">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-poker-gold">操作面板</h3>
          {isMyTurn && (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              轮到你了！
            </span>
          )}
        </div>
        
        <div className="bg-black bg-opacity-50 p-3 rounded-lg mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">当前下注：</span>
            <span className="font-bold text-poker-gold">{currentBet.toFixed(3)} ETH</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Fold */}
        <button
          onClick={handleFold}
          disabled={!isMyTurn}
          className="btn-danger w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          弃牌 (Fold) 🚫
        </button>

        {/* Check */}
        <button
          onClick={handleCheck}
          disabled={!isMyTurn || currentBet > 0}
          className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          过牌 (Check) ✋
        </button>

        {/* Call */}
        <button
          onClick={handleCall}
          disabled={!isMyTurn || currentBet === 0}
          className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          跟注 (Call) {currentBet > 0 ? `${currentBet.toFixed(3)} ETH` : ''} 💵
        </button>

        {/* Raise */}
        <div className="space-y-2">
          <input
            type="number"
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(e.target.value)}
            placeholder="加注金额 (ETH)"
            disabled={!isMyTurn}
            className="w-full bg-black bg-opacity-50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-poker-gold disabled:opacity-50"
            step="0.01"
            min={currentBet * 2}
          />
          <button
            onClick={handleRaise}
            disabled={!isMyTurn || !raiseAmount || parseFloat(raiseAmount) < currentBet * 2}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            加注 (Raise) 📈
          </button>
        </div>

        {/* Quick Raise Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            onClick={() => setRaiseAmount((currentBet * 2).toString())}
            disabled={!isMyTurn}
            className="bg-amber-700 hover:bg-amber-600 text-white py-2 rounded text-sm font-bold disabled:opacity-50"
          >
            2x
          </button>
          <button
            onClick={() => setRaiseAmount((currentBet * 3).toString())}
            disabled={!isMyTurn}
            className="bg-amber-700 hover:bg-amber-600 text-white py-2 rounded text-sm font-bold disabled:opacity-50"
          >
            3x
          </button>
          <button
            onClick={() => setRaiseAmount('1')}
            disabled={!isMyTurn}
            className="bg-amber-700 hover:bg-amber-600 text-white py-2 rounded text-sm font-bold disabled:opacity-50"
          >
            All In
          </button>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        💡 提示：加注必须至少是当前下注的 2 倍
      </div>
    </div>
  )
}

