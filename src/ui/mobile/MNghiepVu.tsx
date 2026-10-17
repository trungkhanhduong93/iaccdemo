import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useSession } from '../../app/session'
import { MODULES, duongDan, hienMan, hienPhanHe, moDuoc, nhanTab, phanHeKhoa, tabCua, tenPhanHe, timMan } from '../../app/registry'
import { GOIS, anNgoaiGoi, minGoi, type Goi } from '../../app/plan'
import type { ModuleDef, ScreenDef } from '../../modules/types'
import { Icon, ONen } from '../Icon'
import { Pk } from '../Page'
import { coManMobile, manDauMobile, manMobile } from './manMobile'
import { MChiMayTinh } from './MChiMayTinh'

const minGoiPhanHe = (m: ModuleDef): Goi => GOIS.find(g => !phanHeKhoa(m, g)) ?? 'PR'

// ── Lập nhanh: 4 nút tạo chứng từ hay dùng ──

interface NutLapNhanh {
  id: string
  ten: string
  icon: string
  modKey: string
  slug: string
  to: string
  loai?: string
}

const DS_LAP_NHANH: NutLapNhanh[] = [
  { id: 'thu', ten: 'Phiếu thu', icon: 'cashin', modKey: 'tien', slug: '2-1-1', to: '/app/tien/2-1-1/moi?loai=thu', loai: 'thu' },
  { id: 'chi', ten: 'Phiếu chi', icon: 'cashout', modKey: 'tien', slug: '2-1-1', to: '/app/tien/2-1-1/moi?loai=chi', loai: 'chi' },
  { id: 'ban', ten: 'Bán hàng', icon: 'cart', modKey: 'ban-hang', slug: '3-1-7', to: '/app/ban-hang/3-1-7/moi' },
  { id: 'mua', ten: 'Mua hàng', icon: 'truck', modKey: 'mua-hang', slug: '4-1-1', to: '/app/mua-hang/4-1-1/moi' },
]

export function MNghiepVu() {
  const { s } = useSession()
  const [params] = useSearchParams()
  const modKey = params.get('m')

  // Chỉ hiện màn mà gói Free hoặc Standard mở được trên điện thoại, áp cho mọi gói (Trum chốt 13/10/2026, T194; gói Free ẩn màn ngoài gói, T299)
  const manMoTrenMobile = (sc: ScreenDef) =>
    hienMan(sc, s.goi, s.cheDo, s) && (anNgoaiGoi(s.goi) ? moDuoc(sc, s.goi) : (moDuoc(sc, 'F') || moDuoc(sc, 'S')))

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

  // Lọc nút Lập nhanh: ẩn nút mà gói không mở được màn đó
  const dsLapNhanh = DS_LAP_NHANH.filter(n => {
    const { sc } = timMan(n.modKey, n.slug)
    return sc && moDuoc(sc, s.goi) && hienMan(sc, s.goi, s.cheDo, s)
  })

  // Lấy tối đa 3 màn điện thoại của mỗi phân hệ để hiện chip
  const layManChinh = (m: ModuleDef): ScreenDef[] =>
    tabCua(m)
      .filter(
        sc =>
          sc.kind !== 'quytrinh' &&
          manMoTrenMobile(sc) &&
          (!anNgoaiGoi(s.goi) || moDuoc(sc, s.goi)) &&
          manMobile(sc, m) !== MChiMayTinh
      )
      .slice(0, 3)

  return (
    <div className="m-nghiep-vu mnv-the">
      {/* ── Lập nhanh ── */}
      {dsLapNhanh.length > 0 && (
        <div className="mnv-lap-nhanh">
          <div className="mnv-ln-tieu">Lập nhanh</div>
          <div className="mnv-ln-luoi">
            {dsLapNhanh.map(n => (
              <Link key={n.id} to={n.to} className="mnv-ln-nut">
                <span className="mnv-ln-ic">
                  <Icon n={n.icon} kieu="khoi" className="ic" />
                </span>
                <span className="mnv-ln-ten">{n.ten}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Danh sách phân hệ dạng thẻ ── */}
      <div className="mnv-ds">
        {dsPhanHe.filter(m => !anNgoaiGoi(s.goi) || !phanHeKhoa(m, s.goi)).map(m => {
          const khoa = !anNgoaiGoi(s.goi) && phanHeKhoa(m, s.goi)
          const manChinh = layManChinh(m)
          return (
            <div key={m.key} className={`mnv-the-ph${khoa ? ' khoa' : ''}`}>
              <Link
                to={duongDan(m, manDauMobile(m, s.goi))}
                className="mnv-the-lk"
              >
                <span className="mnv-the-ic">
                  <ONen n={m.icon} kieu="nhat" co="lg" />
                </span>
                <span className="mnv-the-nd">
                  <span className="mnv-the-ten">{tenPhanHe(m, s.goi).ten}</span>
                </span>
                {khoa && (
                  <span className="mnv-the-kh">
                    <Pk g={minGoiPhanHe(m)} o />
                  </span>
                )}
                <Icon n="chevr" className="ic sm mnv-the-mui" />
              </Link>
              {/* Chip bấm thẳng tới màn hay dùng */}
              {manChinh.length > 0 && (
                <div className="mnv-chip-hang">
                  {manChinh.map(sc => (
                    <Link
                      key={sc.slug}
                      to={duongDan(m, sc)}
                      className="mnv-chip"
                    >
                      {nhanTab(sc)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
