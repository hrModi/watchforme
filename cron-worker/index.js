// Cloudflare Worker — cron scheduler for watchforme.me
// Deployed separately from Pages. Calls the Pages API endpoints on a schedule.
// Deploy: cd cron-worker && wrangler deploy
// Secrets: wrangler secret put CRON_SECRET

const APP_URL = 'https://watchforme.me'

async function callEndpoint(env, path) {
  const res = await fetch(`${APP_URL}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.CRON_SECRET}`,
      'Content-Type': 'application/json',
    },
  })
  return { path, status: res.status, ok: res.ok }
}

export default {
  async scheduled(event, env, ctx) {
    const hour = new Date(event.scheduledTime).getUTCHours()
    const results = []

    if (hour === 6) {
      // 06:00 UTC — fetch India fuel (11:30 IST), then check alerts
      const fetch = await callEndpoint(env, '/api/cron/fetch-india-fuel')
      results.push(fetch)
      if (fetch.ok) {
        results.push(await callEndpoint(env, '/api/cron/check-alerts'))
      }
    }

    if (hour === 14) {
      // 14:00 UTC — fetch US fuel (09:00 ET), then check alerts
      const fetch = await callEndpoint(env, '/api/cron/fetch-us-fuel')
      results.push(fetch)
      if (fetch.ok) {
        results.push(await callEndpoint(env, '/api/cron/check-alerts'))
      }
    }

    console.log(JSON.stringify({ event: 'cron_run', hour, results }))
  },
}
