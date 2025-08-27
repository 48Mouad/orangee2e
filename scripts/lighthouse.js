const { execSync } = require('child_process')
const url = 'https://boutique.orange.ma/prepaid-mobile-plans'
console.log('Running Lighthouse on:', url)
try {
  const cmd = `npx lighthouse ${url} --preset=desktop --output=json --output-path=./lighthouse-report.json --quiet`
  execSync(cmd, { stdio: 'inherit' })
  console.log('Lighthouse report saved to lighthouse-report.json')
} catch (e) {
  console.error('Lighthouse run failed:', e.message)
  process.exit(1)
}
