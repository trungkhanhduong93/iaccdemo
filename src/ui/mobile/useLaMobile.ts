import { useSyncExternalStore } from 'react'

const MQ = '(max-width: 767px)'
const dangKy = (bao: () => void) => {
  const m = window.matchMedia(MQ)
  m.addEventListener('change', bao)
  return () => m.removeEventListener('change', bao)
}
export const useLaMobile = () => useSyncExternalStore(dangKy, () => window.matchMedia(MQ).matches)
