export const MOCK_SIGNALS = {
  BTC: {
    '15m': { type: 'BUY', confidence: 78, targetMove: '+1.2%', risk: 'Medium', tp: '64,200', sl: '62,800', timestamp: '2 mins ago' },
    '30m': { type: 'HOLD', confidence: 55, targetMove: '+0.4%', risk: 'Low', tp: '64,100', sl: '62,900', timestamp: '5 mins ago' },
    '1h': { type: 'BUY', confidence: 82, targetMove: '+2.1%', risk: 'Medium', tp: '65,000', sl: '62,500', timestamp: '10 mins ago' }
  },
  ETH: {
    '15m': { type: 'HOLD', confidence: 52, targetMove: '+0.1%', risk: 'Low', tp: '2,480', sl: '2,420', timestamp: '1 min ago' },
    '30m': { type: 'SELL', confidence: 72, targetMove: '-0.8%', risk: 'Medium', tp: '2,400', sl: '2,510', timestamp: '4 mins ago' },
    '1h': { type: 'SELL', confidence: 68, targetMove: '-1.5%', risk: 'High', tp: '2,350', sl: '2,550', timestamp: '8 mins ago' }
  },
  SOL: {
    '15m': { type: 'BUY', confidence: 85, targetMove: '+1.8%', risk: 'Medium', tp: '148', sl: '138', timestamp: '3 mins ago' },
    '30m': { type: 'BUY', confidence: 81, targetMove: '+2.5%', risk: 'High', tp: '152', sl: '135', timestamp: '6 mins ago' },
    '1h': { type: 'BUY', confidence: 76, targetMove: '+3.2%', risk: 'High', tp: '160', sl: '130', timestamp: '12 mins ago' }
  }
}

export const MOCK_STATS = {
  BTC: { price: '63,450.20', change: '+2.45', vol: '2.1B', cap: '1.24T' },
  ETH: { price: '2,450.15', change: '-1.12', vol: '840M', cap: '294B' },
  SOL: { price: '142.60', change: '+4.82', vol: '420M', cap: '63B' }
}

export const MOCK_INDICATORS = [
  { name: 'RSI', value: '62', status: 'Bullish', color: '#22C55E' },
  { name: 'MACD', value: 'Positive', status: 'Strong', color: '#3B82F6' },
  { name: 'Volume', value: 'Increasing', status: 'Healthy', color: '#22C55E' },
  { name: 'Open Interest', value: 'Rising', status: 'Caution', color: '#EF4444' },
  { name: 'Funding', value: 'Neutral', status: 'Stable', color: '#9CA3AF' }
]
