import { Resend } from 'resend'
import type { Alert } from '@/types'

const FROM = process.env.EMAIL_FROM ?? 'alerts@watchforme.me'
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me').replace(/\/$/, '')

function getResend() {
  const key = process.env.EMAIL_API_KEY
  if (!key) throw new Error('EMAIL_API_KEY is not set')
  return new Resend(key)
}

function fuelLabel(subtype: string) {
  return subtype.charAt(0).toUpperCase() + subtype.slice(1)
}

function locationLabel(country: string, region: string | null): string {
  if (!region) return country === 'IN' ? 'India' : 'USA'
  return region.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function operatorLabel(operator: string): string {
  if (operator === 'above') return 'goes above'
  if (operator === 'below') return 'drops below'
  return 'changes by more than'
}

function formatValue(value: number, unit: string, isPct = false): string {
  if (isPct) return `${value}%`
  const sym = unit.startsWith('₹') ? '₹' : '$'
  return `${sym}${value.toFixed(2)}`
}

export async function sendConfirmationEmail(alert: Alert, unit: string): Promise<void> {
  if (!alert.email) return

  const confirmUrl = `${APP_URL}/api/alerts/confirm/${alert.token}`
  const unsubscribeUrl = `${APP_URL}/api/alerts/unsubscribe/${alert.token}`
  const fuel = fuelLabel(alert.subtype)
  const location = locationLabel(alert.country, alert.region)
  const condition = `${fuel} in ${location} ${operatorLabel(alert.operator)} ${formatValue(alert.threshold, unit, alert.operator === 'change_pct')}`

  await getResend().emails.send({
    from: FROM,
    to: alert.email,
    subject: `Confirm your price alert: ${fuel} in ${location}`,
    html: buildConfirmationHtml({ condition, confirmUrl, unsubscribeUrl, location, fuel }),
  })
}

export async function sendTriggerEmail(alert: Alert, currentValue: number, unit: string): Promise<void> {
  if (!alert.email) return

  const unsubscribeUrl = `${APP_URL}/api/alerts/unsubscribe/${alert.token}`
  const fuel = fuelLabel(alert.subtype)
  const location = locationLabel(alert.country, alert.region)
  const sym = unit.startsWith('₹') ? '₹' : '$'
  const condition = `${operatorLabel(alert.operator)} ${formatValue(alert.threshold, unit, alert.operator === 'change_pct')}`

  await getResend().emails.send({
    from: FROM,
    to: alert.email,
    subject: `Price alert fired: ${fuel} in ${location} is now ${sym}${currentValue.toFixed(2)}`,
    html: buildTriggerHtml({ fuel, location, currentValue, unit, condition, unsubscribeUrl }),
  })
}

// ─── HTML templates ───────────────────────────────────────────────────────────

function wrapper(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e5ea;">
        <tr>
          <td style="background:#1B59D8;padding:20px 28px;">
            <span style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:-0.03em;">watchforme</span><span style="color:rgba(255,255,255,0.7);font-size:15px;font-weight:500;letter-spacing:-0.01em;">.me</span>
          </td>
        </tr>
        <tr><td style="padding:28px;">${content}</td></tr>
        <tr>
          <td style="padding:16px 28px;border-top:1px solid #e2e5ea;background:#f9fafb;">
            <p style="margin:0;font-size:12px;color:#8a909e;line-height:1.6;">
              You're receiving this because you set a price alert on watchforme.me.
              No account needed &mdash; alerts are one-time and free.<br>
              <a href="${APP_URL}" style="color:#1B59D8;text-decoration:none;">watchforme.me</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function buildConfirmationHtml({ condition, confirmUrl, unsubscribeUrl, location, fuel }: {
  condition: string
  confirmUrl: string
  unsubscribeUrl: string
  location: string
  fuel: string
}) {
  return wrapper(`
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111826;line-height:1.3;">
      Confirm your price alert
    </h1>
    <p style="margin:0 0 20px;font-size:15px;color:#5C6478;line-height:1.6;">
      You asked to be notified when <strong style="color:#111826;">${condition}</strong>.
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:#5C6478;line-height:1.6;">
      Click the button below to activate this alert. The link expires in 7 days.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:#1B59D8;border-radius:8px;">
          <a href="${confirmUrl}"
             style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
            Activate alert
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#8a909e;line-height:1.6;">
      Or paste this URL in your browser:<br>
      <span style="color:#1B59D8;word-break:break-all;">${confirmUrl}</span>
    </p>
    <p style="margin:16px 0 0;font-size:12px;color:#8a909e;">
      Didn't set this alert? <a href="${unsubscribeUrl}" style="color:#8a909e;">Cancel it here.</a>
    </p>
  `)
}

function buildTriggerHtml({ fuel, location, currentValue, unit, condition, unsubscribeUrl }: {
  fuel: string
  location: string
  currentValue: number
  unit: string
  condition: string
  unsubscribeUrl: string
}) {
  const sym = unit.startsWith('₹') ? '₹' : '$'
  const denom = unit.replace(/^[₹$]/, '')

  return wrapper(`
    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#1B59D8;text-transform:uppercase;letter-spacing:0.05em;">
      Price alert fired
    </p>
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#111826;line-height:1.3;">
      ${fuel} in ${location}
    </h1>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#f4f5f7;border-radius:10px;padding:20px;width:100%;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:13px;color:#8a909e;">Current price</p>
          <p style="margin:0;font-size:36px;font-weight:700;color:#111826;font-variant-numeric:tabular-nums;letter-spacing:-0.02em;">
            ${sym}${currentValue.toFixed(2)}<span style="font-size:16px;font-weight:400;color:#5C6478;">${denom}</span>
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 24px;font-size:14px;color:#5C6478;line-height:1.6;">
      Your alert condition was met: price ${condition}.
    </p>
    <p style="margin:0;font-size:12px;color:#8a909e;line-height:1.6;">
      This alert has been used up. <a href="/" style="color:#1B59D8;text-decoration:none;">Set a new alert</a> to keep watching.<br>
      <a href="${unsubscribeUrl}" style="color:#8a909e;">Unsubscribe from all alerts for this condition.</a>
    </p>
  `)
}
