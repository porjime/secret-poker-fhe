'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import PokerTable from '@/components/PokerTable'
import GameControls from '@/components/GameControls'
import PlayerHand from '@/components/PlayerHand'
import WalletConnect from '@/components/WalletConnect'

export default function Home() {
  const [account, setAccount] = useState<string>('')
  const [gameId, setGameId] = useState<number | null>(null)
  const [gameState, setGameState] = useState<any>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const web3Provider = new ethers.BrowserProvider((window as any).ethereum)
      setProvider(web3Provider)
    }
  }, [])

  const connectWallet = async () => {
    if (!provider) return
    
    try {
      const accounts = await provider.send('eth_requestAccounts', [])
      setAccount(accounts[0])
      
      // TODO: Initialize contract with deployed address
      // const signer = await provider.getSigner()
      // const pokerContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
      // setContract(pokerContract)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const createGame = async () => {
    // TODO: Call contract to create game
    console.log('Creating game...')
  }

  const joinGame = async (id: number) => {
    // TODO: Call contract to join game
    console.log('Joining game:', id)
    setGameId(id)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-poker-dark via-gray-900 to-poker-dark">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black bg-opacity-50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🃏</div>
            <div>
              <h1 className="text-3xl font-bold text-poker-gold">Secret Poker</h1>
              <p className="text-sm text-gray-400">基于 FHEVM 的链上加密扑克</p>
            </div>
          </div>
          
          <WalletConnect 
            account={account} 
            onConnect={connectWallet}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!account ? (
          /* Welcome Screen */
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="text-8xl mb-8">🎰</div>
            <h2 className="text-5xl font-bold mb-6 text-poker-gold">
              欢迎来到 Secret Poker
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              全球首个使用全同态加密（FHE）技术的链上扑克游戏<br/>
              你的手牌完全加密，只有你能看到，智能合约处理一切逻辑
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-poker-felt bg-opacity-30 p-6 rounded-lg border border-green-700">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="text-xl font-bold mb-2">完全加密</h3>
                <p className="text-gray-400">使用 FHEVM 技术，手牌在区块链上完全加密</p>
              </div>
              <div className="bg-poker-felt bg-opacity-30 p-6 rounded-lg border border-green-700">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-xl font-bold mb-2">公平透明</h3>
                <p className="text-gray-400">智能合约保证游戏规则公平，无法作弊</p>
              </div>
              <div className="bg-poker-felt bg-opacity-30 p-6 rounded-lg border border-green-700">
                <div className="text-4xl mb-3">🎮</div>
                <h3 className="text-xl font-bold mb-2">真实体验</h3>
                <p className="text-gray-400">完整实现德州扑克规则，支持 2-6 人对战</p>
              </div>
            </div>

            <button 
              onClick={connectWallet}
              className="btn-primary text-xl py-4 px-12"
            >
              连接钱包开始游戏 🚀
            </button>
          </div>
        ) : !gameId ? (
          /* Game Lobby */
          <div className="max-w-3xl mx-auto">
            <div className="bg-poker-felt bg-opacity-20 rounded-lg p-8 border border-green-700 mb-8">
              <h2 className="text-3xl font-bold mb-6 text-poker-gold">游戏大厅</h2>
              
              <div className="grid gap-4 mb-6">
                <div className="bg-black bg-opacity-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">买入金额：</span>
                    <span className="text-2xl font-bold text-poker-gold">1 ETH</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">小盲注：</span>
                    <span className="text-xl">0.01 ETH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">大盲注：</span>
                    <span className="text-xl">0.02 ETH</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={createGame}
                className="btn-primary w-full text-xl"
              >
                创建新游戏 🎲
              </button>
            </div>

            {/* Available Games List (placeholder) */}
            <div className="bg-poker-felt bg-opacity-20 rounded-lg p-8 border border-green-700">
              <h3 className="text-2xl font-bold mb-4">可加入的游戏</h3>
              <div className="text-center text-gray-500 py-8">
                暂无可加入的游戏，创建一个新游戏吧！
              </div>
            </div>
          </div>
        ) : (
          /* Active Game */
          <div className="space-y-6">
            <PokerTable 
              gameId={gameId}
              players={gameState?.players || []}
              communityCards={gameState?.communityCards || []}
              pot={gameState?.pot || 0}
            />
            
            <div className="grid md:grid-cols-2 gap-6">
              <PlayerHand 
                cards={gameState?.myCards || []}
              />
              
              <GameControls 
                gameId={gameId}
                isMyTurn={gameState?.isMyTurn || false}
                currentBet={gameState?.currentBet || 0}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20 py-6 text-center text-gray-500">
        <p>🔐 由 Zama FHEVM 技术驱动 | 安全 · 公平 · 去中心化</p>
      </footer>
    </main>
  )
}

