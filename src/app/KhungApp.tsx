import { Shell } from './Shell'
import { MobileShell } from '../ui/mobile/MobileShell'
import { useLaMobile } from '../ui/mobile/useLaMobile'
import { TroLy } from '../ui/TroLy'

export function KhungApp() {
  const laMobile = useLaMobile()
  return laMobile ? <MobileShell /> : <><Shell /><TroLy /></>
}
