// Cloudflare Worker — cron scheduler for watchforme.me
// Deployed separately from Pages. Calls the Pages API endpoints on a schedule.
// Deploy: cd cron-worker && wrangler deploy
// Secrets: wrangler secret put CRON_SECRET

const APP_URL = 'https://watchforme.me'

async function callEndpoint(env, path) {
  try {
    const res = await fetch(`${APP_URL}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    })
    let data = {}
    try { data = await res.json() } catch {}
    return { path, status: res.status, ok: res.ok, ...data }
  } catch (e) {
    return { path, status: 0, ok: false, error: String(e) }
  }
}

function hasFailures(results) {
  return results.some(r => !r.ok || (r.failed !== undefined && r.failed > 0))
}

async function notifyIfFailed(env, hour, results) {
  if (!hasFailures(results)) return
  try {
    await fetch(`${APP_URL}/api/cron/notify-failure`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hour, results }),
    })
  } catch (e) {
    console.error(JSON.stringify({ event: 'notify_failure_error', error: String(e) }))
  }
}

export default {
  async scheduled(event, env, ctx) {
    const hour = new Date(event.scheduledTime).getUTCHours()
    const results = []

    if (hour === 6) {
      // 06:00 UTC — fetch India fuel (11:30 IST) split by fuel type to stay
      // under Cloudflare's 50 subrequest/invocation limit (39 cities × 1 fuel + DB = 41)
      for (const fuel of ['petrol', 'diesel', 'cng']) {
        results.push(await callEndpoint(env, `/api/cron/fetch-india-fuel?fuel=${fuel}`))
      }
      results.push(await callEndpoint(env, '/api/cron/check-alerts'))
    }

    if (hour === 7) {
      // 07:00 UTC — fetch India metals (12:30 IST) after MCX opens
      for (const metal of ['gold', 'silver']) {
        results.push(await callEndpoint(env, `/api/cron/fetch-india-metals?metal=${metal}`))
      }
      results.push(await callEndpoint(env, '/api/cron/check-alerts'))
    }

    if (hour === 14) {
      // 14:00 UTC — fetch US fuel (09:00 ET) and US metal spot prices
      const usFuel = await callEndpoint(env, '/api/cron/fetch-us-fuel')
      results.push(usFuel)
      results.push(await callEndpoint(env, '/api/cron/fetch-us-metals'))
      if (usFuel.ok) {
        results.push(await callEndpoint(env, '/api/cron/check-alerts'))
      }
    }

    console.log(JSON.stringify({ event: 'cron_run', hour, results }))
    await notifyIfFailed(env, hour, results)
  },
}
