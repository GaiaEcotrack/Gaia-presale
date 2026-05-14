import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, polygon, bsc, arbitrum } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

const projectId = 'nexus-presale-demo'

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, bsc, arbitrum],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    coinbaseWallet({
      appName: 'NEXUS Presale',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [arbitrum.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
