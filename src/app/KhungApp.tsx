import { Shell } from './Shell'
import { MobileShell } from '../ui/mobile/MobileShell'
import { useLaMobile } from '../ui/mobile/useLaMobile'

export function KhungApp() {
  const laMobile = useLaMobile()
  return laMobile ? <MobileShell /> : <Shell />
}
