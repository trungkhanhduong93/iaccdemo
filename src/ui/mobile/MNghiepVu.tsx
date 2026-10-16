import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useSession } from '../../app/session'
import { MODULES, duongDan, hienMan, hienPhanHe, moDuoc, phanHeKhoa, tabCua, tenPhanHe } from '../../app/registry'
import { GOIS, anNgoaiGoi, minGoi, type Goi } from '../../app/plan'
import type { ModuleDef, ScreenDef } from '../../modules/types'
import { ONen } from '../Icon'
import { Pk } from '../Page'
import { coManMobile, manDauMobile } from './manMobile'

const minGoiPhanHe = (m: ModuleDef): Goi => GOIS.find(g => !phanHeKhoa(m, g)) ?? 'PR'

export function MNghiepVu() {
  const { s } = useSession()
  const [params] = useSearchParams()
  const modKey = params.get('m')

  // Chỉ hiện màn mà gói Free hoặc Standard mở được trên điện thoại, áp cho mọi gói (Trum chốt 13/10/2026, T194)
  const manMoTrenMobile = (sc: ScreenDef) =>
    hienMan(sc, s.goi, s.cheDo, s) && (moDuoc(sc, 'F') || moDuoc(sc, 'S'))

  const dsPhanHe = MODULES.filter(
    m =>
      hienPhanHe(m, s.goi) &&
      m.key !== 'trang-chu' &&
      m.key !== 'bao-cao' &&
      m.key !== 'danh-muc' &&
      m.key !== 'he-thong' &&
      m.key !== 'thao-tac-nhanh' &&
      (!anNgoaiGoi(s.goi) || !phanHeKhoa(m, s.goi)) &&
      tabCua(m).some(sc => manMoTrenMobile(sc) && (!anNgoaiGoi(s.goi) || moDuoc(sc, s.goi))) &&
      coManMobile(m, s.goi)
  )

  const modHienTai = modKey ? dsPhanHe.find(m => m.key === modKey) : null

  // Chuyển hướng thẳng nếu truy cập theo query m=... cũ
  if (modHienTai) {
    return <Navigate to={duongDan(modHienTai, manDauMobile(modHienTai, s.goi))} replace />
  }

  return (
    <div className="m-nghiep-vu">
      <div className="m-nv-luoi">
        {dsPhanHe.filter(m => !anNgoaiGoi(s.goi) || !phanHeKhoa(m, s.goi)).map(m => {
          const khoa = phanHeKhoa(m, s.goi)
          return (
            <Link
              key={m.key}
              to={duongDan(m, manDauMobile(m, s.goi))}
              className={`m-nv-o${khoa ? ' khoa' : ''}`}
            >
              <div className="m-nv-o-ic">
                <ONen n={m.icon} kieu="nhat" co="md" />
                {khoa && (
                  <span className="m-nv-o-lk" title="Ngoài gói">
                    <Pk g={minGoiPhanHe(m)} o />
                  </span>
                )}
              </div>
              <span className="m-nv-o-ten">{tenPhanHe(m, s.goi).ten}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
