import { supabase } from '../../lib/supabaseClient'

async function resize(file: File, max = 900): Promise<Blob> {
  const url = URL.createObjectURL(file)
    try {
        const img = await new Promise<HTMLImageElement>((res, rej) => {
              const i = new Image()
                    i.onload = () => res(i)
                          i.onerror = () => rej(new Error('Could not read that image'))
                                i.src = url
                                    })
                                        const scale = Math.min(1, max / Math.max(img.width, img.height))
                                            const canvas = document.createElement('canvas')
                                                canvas.width = Math.round(img.width * scale)
                                                    canvas.height = Math.round(img.height * scale)
                                                        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
                                                            return await new Promise<Blob>((res, rej) =>
                                                                  canvas.toBlob(
                                                                          (b) => (b ? res(b) : rej(new Error('Could not process the image'))),
                                                                                  'image/jpeg',
                                                                                          0.82
                                                                                                )
                                                                                                    )
                                                                                                      } finally {
                                                                                                          URL.revokeObjectURL(url)
                                                                                                            }
                                                                                                            }

                                                                                                            export async function uploadDishPhoto(restaurantId: string, itemId: string, file: File) {
                                                                                                              const blob = await resize(file)
                                                                                                                const path = `${restaurantId}/${itemId}-${Date.now()}.jpg`

                                                                                                                  const { error } = await supabase.storage
                                                                                                                      .from('menu-images')
                                                                                                                          .upload(path, blob, { contentType: 'image/jpeg' })
                                                                                                                            if (error) throw error

                                                                                                                              const { data } = supabase.storage.from('menu-images').getPublicUrl(path)

                                                                                                                                const { error: saveError } = await supabase
                                                                                                                                    .from('menu_items')
                                                                                                                                        .update({ image_url: data.publicUrl })
                                                                                                                                            .eq('id', itemId)
                                                                                                                                              if (saveError) throw saveError

                                                                                                                                                return data.publicUrl
                                                                                                                                                }
                                                                                                                                                