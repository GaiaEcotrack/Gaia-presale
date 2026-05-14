'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Twitter, 
  MessageCircle, 
  Github, 
  FileText, 
  Shield, 
  Scale,
  ExternalLink 
} from 'lucide-react'
import { TOKEN_CONFIG, SOCIAL_LINKS } from '@/lib/constants'

const FOOTER_LINKS = {
  protocol: [
    { href: '/whitepaper', label: 'Whitepaper' },
    { href: '/tokenomics', label: 'Tokenomics' },
    { href: '/roadmap', label: 'Roadmap' },
    { href: '/team', label: 'Team' },
  ],
  resources: [
    { href: '/how-to-buy', label: 'How To Buy' },
    { href: '/faq', label: 'FAQ' },
    { href: '/buy', label: 'Buy Tokens' },
  ],
  legal: [
    { href: '/terms', label: 'Terms & Conditions' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/disclaimer', label: 'Disclaimer' },
  ],
}

const SOCIAL_ICONS = [
  { href: SOCIAL_LINKS.twitter, icon: Twitter, label: 'Twitter' },
  { href: SOCIAL_LINKS.telegram, icon: MessageCircle, label: 'Telegram' },
  { href: SOCIAL_LINKS.github, icon: Github, label: 'GitHub' },
  { href: SOCIAL_LINKS.medium, icon: FileText, label: 'Medium' },
]

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl  flex items-center justify-center">
                <Image src="/logoGaia.png" alt="Gaia Logo" width={40} height={40} />
              </div>
              <span className="text-xl font-semibold">{TOKEN_CONFIG.name}</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-6">
              {TOKEN_CONFIG.name} is building the future of decentralized finance. 
              Join our presale and be part of the revolution.
            </p>
            
            {/* Contract Address */}
            <div className="bg-muted/50 rounded-lg p-3 inline-flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="text-foreground">Contract:</span>
              <span>{TOKEN_CONFIG.contractAddress.slice(0, 10)}...{TOKEN_CONFIG.contractAddress.slice(-8)}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(TOKEN_CONFIG.contractAddress)}
                className="hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Protocol Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Protocol</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.protocol.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} {TOKEN_CONFIG.name}. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {SOCIAL_ICONS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Risk Warning */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Risk Disclaimer:</strong> This is not financial advice. 
                Cryptocurrency investments carry significant risk. Only invest what you can afford to lose. 
                Past performance does not guarantee future results. Please conduct your own research before investing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
