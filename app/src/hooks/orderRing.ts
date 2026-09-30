let ctx: AudioContext | null = null
let master: DynamicsCompressorNode | null = null

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

                                          // A loud, old-style phone ring: ten sharp alternating beeps
                                          export function ringOnce() {
                                            if (!ctx || !master) return
                                              if (ctx.state === 'suspended') void ctx.resume()
                                                const tones = [1000, 1400]
                                                  for (let i = 0; i < 10; i++) {
                                                      const start = ctx.currentTime + i * 0.14
                                                          const osc = ctx.createOscillator()
                                                              const gain = ctx.createGain()
                                                                  osc.type = 'square'
                                                                      osc.frequency.value = tones[i % 2]
                                                                          gain.gain.setValueAtTime(1, start)
                                                                              gain.gain.setValueAtTime(0, start + 0.11)
                                                                                  osc.connect(gain)
                                                                                      gain.connect(master)
                                                                                          osc.start(start)
                                                                                              osc.stop(start + 0.13)
                                                                                                }
                                                                                                  navigator.vibrate?.([300, 100, 300, 100, 300])
                                                                                                  }
                                                                                                  