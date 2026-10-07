import { supabase } from '../lib/supabaseClient'

let ctx: AudioContext | null = null
let master: DynamicsCompressorNode | null = null
let style = 'phone'
let loadedAt = 0

export function unlockAudio() {
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
    master = ctx.createDynamicsCompressor()
    master.threshold.value = -20
    master.ratio.value = 12
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
}

export function setAlertStyle(s: string) {
  style = s || 'phone'
  loadedAt = Date.now()
}

async function refreshStyle() {
  if (Date.now() - loadedAt < 60000) return
  loadedAt = Date.now()
  try {
    const { data: u } = await supabase.auth.getUser()
    if (!u.user) return
    const { data: p } = await supabase.from('profiles').select('restaurant_id').eq('id', u.user.id).maybeSingle()
    if (!p?.restaurant_id) return
    const { data: r } = await supabase.from('restaurants').select('alert_style').eq('id', p.restaurant_id).maybeSingle()
    style = r?.alert_style || 'phone'
  } catch {
    /* keep the current style */
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, vol: number) {
  if (!ctx || !master) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(vol, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur)
  osc.connect(gain)
  gain.connect(master)
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

export function ringOnce() {
  if (!ctx || !master) return
  void refreshStyle()
  if (ctx.state === 'suspended') void ctx.resume()
  const t0 = ctx.currentTime
  if (style === 'chime') {
    const notes = [523, 659, 784, 1047]
    for (let r = 0; r < 2; r++) {
      notes.forEach((f, i) => tone(f, t0 + r * 1.2 + i * 0.22, 0.9, 'sine', 0.7))
    }
  } else if (style === 'phone') {
    const tones = [1000, 1400]
    for (let i = 0; i < 10; i++) {
      tone(tones[i % 2], t0 + i * 0.14, 0.13, 'square', 1)
    }
  } else {
    for (let r = 0; r < 3; r++) {
      tone(880, t0 + r * 1.0, 0.8, 'triangle', 0.9)
      tone(660, t0 + r * 1.0 + 0.45, 0.9, 'triangle', 0.9)
    }
  }
  navigator.vibrate?.([300, 100, 300, 100, 300])
}
