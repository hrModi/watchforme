import type { WatcherDef } from '@/types'

export const WATCHERS: WatcherDef[] = [
  {
    slug: 'fuel-price',
    watcher_type: 'fuel',
    name: 'Fuel Price Watcher',
    description: 'Daily petrol & diesel prices across all major Indian cities, and weekly US gasoline prices by state.',
    countries: ['IN', 'US'],
    status: 'live',
    icon: '⛽',
  },
  {
    slug: 'gold-price',
    watcher_type: 'gold',
    name: 'Gold & Silver Rate Watcher',
    description: 'Live gold and silver rates updated every 15 minutes during market hours.',
    countries: ['IN', 'US'],
    status: 'coming_soon',
    icon: '🥇',
  },
  {
    slug: 'currency-rate',
    watcher_type: 'currency',
    name: 'Currency Rate Watcher',
    description: 'Global exchange rates — set alerts for any currency pair, updated in real time.',
    countries: ['IN', 'US'],
    status: 'coming_soon',
    icon: '💱',
  },
  {
    slug: 'loan-rate',
    watcher_type: 'loan',
    name: 'Loan & Mortgage Rate Watcher',
    description: 'Home loan and mortgage rates from major lenders, updated when banks revise them.',
    countries: ['IN', 'US'],
    status: 'coming_soon',
    icon: '🏦',
  },
  {
    slug: 'fd-rate',
    watcher_type: 'fd',
    name: 'Savings & FD Rate Watcher',
    description: 'Fixed deposit and savings account rates from top banks — get notified when rates improve.',
    countries: ['IN', 'US'],
    status: 'coming_soon',
    icon: '📈',
  },
  {
    slug: 'stock-price',
    watcher_type: 'stock',
    name: 'Stock Price Watcher',
    description: 'Set price alerts for NSE/BSE listed stocks — no account, just an email or WhatsApp.',
    countries: ['IN'],
    status: 'coming_soon',
    icon: '📊',
  },
  {
    slug: 'pnr-status',
    watcher_type: 'pnr',
    name: 'Train PNR Waitlist Watcher',
    description: 'Get notified the moment your PNR waitlist position moves — no more manual checking.',
    countries: ['IN'],
    status: 'coming_soon',
    icon: '🚂',
  },
]

export const FUEL_WATCHER = WATCHERS[0]
