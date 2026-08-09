'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Wallet, Copy, Check, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/use-wallet'
import { TOKEN_CONFIG } from '@/lib/constants'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const NAV_LINKS = [
  { href: '/#projects', label: 'Projects' },
  { href: '/tokenomics', label: 'Tokenomics' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/team', label: 'Team' },
  { href: '/faq', label: 'FAQ' },
  { href: '/whitepaper', label: 'Whitepaper' },
]

const ACTION_LINKS = [
  { href: '/buy', label: 'Buy' },
  { href: '/claim', label: 'Claim' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const {
    address,
    isConnected,
    isConnecting,
    balance,
    formatAddress,
    copyAddress,
    disconnectWallet,
    connectWallet,
  } = useWallet()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleCopy = () => {
    copyAddress()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConnect = () => {
    connectWallet()
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'glass border-b border-border shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center"
              >
                <Image src="/logoGaia.png" alt="Gaia Logo" width={40} height={40} / >
              </motion.div>
              <span className="text-xl font-semibold tracking-tight">{TOKEN_CONFIG.name}</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-primary/5 border border-primary/10 text-primary text-[10px] font-semibold tracking-wide uppercase rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Solana
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 2xl:px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
              <div className="w-px h-6 bg-border mx-1" />
              {ACTION_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 2xl:px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors rounded-lg whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {isConnected ? (
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="hidden sm:inline">{formatAddress(address!)}</span>
                        <Wallet className="w-4 h-4 sm:hidden" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <div className="px-3 py-2">
                        <p className="text-xs text-muted-foreground">Connected Wallet</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="font-mono text-sm">{formatAddress(address!)}</p>
                          <button
                            onClick={handleCopy}
                            className="p-1 hover:bg-muted rounded transition-colors"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <div className="px-3 py-2">
                        <p className="text-xs text-muted-foreground">USDC Balance</p>
                        <p className="font-medium">{balance} USDC</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/buy" className="w-full">Join the Presale</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/claim" className="w-full">Claim Tokens</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={disconnectWallet} className="text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Disconnect
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Link href="/buy">
                <Button className="gap-2">
                  <span className="hidden sm:inline">Join the Presale</span>
                  <span className="sm:hidden">Buy</span>
                </Button>
              </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 xl:hidden"
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-background border-l border-border shadow-xl"
            >
              <div className="pt-20 px-4 pb-4 h-full overflow-y-auto">
                <nav className="space-y-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t border-border my-2 pt-2">
                    {ACTION_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
