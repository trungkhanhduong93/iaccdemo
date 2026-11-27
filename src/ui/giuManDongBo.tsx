import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ThongBao } from './ThongBao'

export function useGiuManDongBo(dangChay: boolean, onRoi: () => void): ReactNode {
  const [hrefCho, setHrefCho] = useState<string | null>(null)
  const onRoiRef = useRef(onRoi)
  onRoiRef.current = onRoi

  useEffect(() => {
    if (!dangChay) {
      setHrefCho(null)
      return
    }

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (!(e.target instanceof Element)) return
      const a = e.target.closest('a[href^="#/"]')
      if (!a) return
      const href = a.getAttribute('href')
      if (!href) return
      e.preventDefault()
      e.stopPropagation()
      setHrefCho(href)
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('click', onClick, true)
    }
  }, [dangChay])

  if (!dangChay || !hrefCho) return null

  return (
    <ThongBao
      loai="hoi"
      tieuDe="Đang đồng bộ"
      moTa="Rời màn này sẽ huỷ tiến trình, dữ liệu đã về giữ nguyên."
      nut={{
        ten: 'Rời và huỷ',
        onClick: () => {
          const dich = hrefCho
          setHrefCho(null)
          onRoiRef.current()
          window.location.hash = dich.slice(1)
        },
      }}
      nutPhu="Ở lại"
      onDong={() => setHrefCho(null)}
    />
  )
}
