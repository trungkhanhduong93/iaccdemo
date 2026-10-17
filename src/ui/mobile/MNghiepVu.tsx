import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useSession } from '../../app/session'
import { MODULES, duongDan, hienMan, hienPhanHe, moDuoc, nhanTab, phanHeKhoa, tabCua, tenPhanHe } from '../../app/registry'
import { anNgoaiGoi, minGoi, type Goi } from '../../app/plan'
import type { ModuleDef, ScreenDef } from '../../modules/types'
import { Icon } from '../Icon'
import { Pk } from '../Page'
import { coManMobile, manDauMobile, manMobile } from './manMobile'
import { MChiMayTinh } from './MChiMayTinh'

interface ChucNang {
  ten: string
  to: string
  icon: string
  khoa?: boolean
  goiMin?: Goi
}

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

  // Lấy các chức năng điện thoại của từng phân hệ theo kiểu danh sách gọn iOS (T353 điểm 13)
  const layCacChucNang = (m: ModuleDef): ChucNang[] => {
    // 1. Phân hệ Thu chi: thêm Chuyển quỹ, mở thẳng /moi?loai=cq
    if (m.key === 'tien') {
      const items: ChucNang[] = [
        {
          ten: 'Thu, chi tiền',
          to: '/app/tien/2-1-1',
          icon: 'wallet',
        },
        {
          ten: 'Chuyển quỹ',
          to: '/app/tien/2-1-1/moi?loai=cq',
          icon: 'swap',
        },
      ]
      if (s.goi === 'F') {
        items.push({
          ten: 'Số dư ban đầu',
          to: '/app/tien/so-du-ban-dau',
          icon: 'db',
        })
      }
      return items
    }

    // 2. Các phân hệ khác: lấy màn điện thoại từ tabCua(m) (bỏ Báo cáo)
    const screens = tabCua(m).filter(
      sc =>
        sc.kind !== 'quytrinh' &&
        sc.kind !== 'baocao' &&
        sc.slug !== 'bao-cao' &&
        nhanTab(sc) !== 'Báo cáo' &&
        manMoTrenMobile(sc) &&
        (!anNgoaiGoi(s.goi) || moDuoc(sc, s.goi)) &&
        manMobile(sc, m) !== MChiMayTinh
    )

    if (screens.length > 0) {
      return screens.map(sc => ({
        ten: nhanTab(sc),
        to: duongDan(m, sc),
        icon: sc.icon || m.icon || 'doc',
        khoa: !anNgoaiGoi(s.goi) && !moDuoc(sc, s.goi),
        goiMin: sc.code ? minGoi(sc.code) : undefined,
      }))
    }

    // Màn đầu điện thoại nếu không có màn nào trong tabCua
    const md = manDauMobile(m, s.goi)
    return [
      {
        ten: nhanTab(md) || tenPhanHe(m, s.goi).ten,
        to: duongDan(m, md),
        icon: md.icon || m.icon || 'doc',
        khoa: !anNgoaiGoi(s.goi) && !moDuoc(md, s.goi),
        goiMin: md.code ? minGoi(md.code) : undefined,
      },
    ]
  }

  return (
    <div className="m-nghiep-vu mnv-the">
      {/* ── Danh sách phân hệ dạng thẻ danh sách gọn kiểu iOS Settings (T353 điểm 13) ── */}
      <div className="mnv-ds">
        {dsPhanHe
          .filter(m => !anNgoaiGoi(s.goi) || !phanHeKhoa(m, s.goi))
          .map(m => {
            const chucNangs = layCacChucNang(m)
            if (chucNangs.length === 0) return null

            return (
              <div key={m.key} className="mnv-nhom">
                <div className="mnv-nhom-tieu-de">{tenPhanHe(m, s.goi).ten.toUpperCase()}</div>
                <div className="mnv-nhom-the">
                  {chucNangs.map(cn => (
                    <Link key={cn.to} to={cn.to} className="mnv-dong">
                      <span className="mnv-dong-ic">
                        <Icon n={cn.icon} kieu="khoi" className="ic" />
                      </span>
                      <span className="mnv-dong-ten">{cn.ten}</span>
                      {cn.khoa && cn.goiMin && (
                        <span className="mnv-dong-kh">
                          <Pk g={cn.goiMin} o />
                        </span>
                      )}
                      <Icon n="chevr" className="ic sm mnv-dong-mui" />
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

