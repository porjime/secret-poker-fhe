'use client'

interface WalletConnectProps {
  account: string
  onConnect: () => void
}

export default function WalletConnect({ account, onConnect }: WalletConnectProps) {
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  return (
    <div>
      {!account ? (
        <button onClick={onConnect} className="btn-primary">
          连接钱包 👛
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-poker-felt bg-opacity-50 px-4 py-2 rounded-lg border border-green-600">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-mono font-bold">{formatAddress(account)}</span>
        </div>
      )}
    </div>
  )
}

