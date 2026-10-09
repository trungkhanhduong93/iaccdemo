// Kéo thả đổi thứ tự bằng HTML5 cho danh sách của khung thiết kế: chỉ tay nắm kéo được, ô nhập trong dòng vẫn bôi chọn chữ bình thường
import { useState, type DragEvent } from 'react'

/** Chuyển phần tử ở vị trí tu sang vị trí den */
export function doiCho<T>(ds: T[], tu: number, den: number): T[] {
  if (tu === den || den < 0 || den >= ds.length) return ds
  const moi = [...ds]
  const [x] = moi.splice(tu, 1)
  moi.splice(den, 0, x)
  return moi
}

export function useKeoDong(doi: (tu: number, den: number) => void) {
  const [keo, setKeo] = useState<number | null>(null)
  const [dich, setDich] = useState<number | null>(null)
  const xong = () => { setKeo(null); setDich(null) }
  /** Gắn vào tay nắm: kéo cả dòng chứa nó */
  const tay = (i: number) => ({
    draggable: true,
    onDragStart: (e: DragEvent<HTMLElement>) => {
      setKeo(i)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', String(i))
      const dong = e.currentTarget.closest<HTMLElement>('[data-dong]')
      if (dong) e.dataTransfer.setDragImage(dong, 12, 12)
    },
    onDragEnd: xong,
  })
  /** Gắn vào dòng: nhận chỗ thả */
  const dong = (i: number) => ({
    'data-dong': i,
    onDragOver: (e: DragEvent<HTMLElement>) => { if (keo !== null && keo !== i) { e.preventDefault(); setDich(i) } },
    onDrop: (e: DragEvent<HTMLElement>) => {
      e.preventDefault()
      if (keo !== null && keo !== i) doi(keo, i)
      xong()
    },
  })
  return { tay, dong, keo, dich }
}
