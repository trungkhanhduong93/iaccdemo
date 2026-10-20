import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useSession } from '../../app/session'
import { MODULES, duongDan, hienMan, hienPhanHe, moDuoc, nhanTab, phanHeKhoa, tabCua, tenPhanHe } from '../../app/registry'
import { anNgoaiGoi, minGoi, type Goi } from '../../app/plan'
import type { ModuleDef, ScreenDef } from '../../modules/types'
import { Icon } from '../Icon'
import { FigmaMobileIcon } from '../FigmaIcon'
import { Pk } from '../Page'
import { coManMobile, manDauMobile, manMobile } from './manMobile'
import { MChiMayTinh } from './MChiMayTinh'

interface ChucNang {
  ten: string
  to: string
  icon: string
  code?: string
  slug?: string
  khoa?: boolean
  goiMin?: Goi
}

/** Map icon cố định theo khoá ổn định (slug hoặc mã màn) cho các mục nghiệp vụ chính (T495) */
function layIconMobile(cn: ChucNang) {
  const key = cn.slug || cn.code || ''
  let figmaName: string | null = null

  if (key === '2-1-1' || key === '2.1.1' || cn.ten === 'Thu, chi tiền') {
    figmaName = 'thu-chi-tien'
  } else if (key === 'chuyen-quy' || cn.to.includes('loai=cq') || cn.ten === 'Chuyển quỹ') {
    figmaName = 'chuyen-quy'
  } else if (key === 'so-du-ban-dau' || key === '10-1-3' || key === '10.1.3' || cn.ten === 'Số dư ban đầu') {
    figmaName = 'so-du-ban-dau'
  } else if (key === '3-1-1' || key === '3.1.1' || cn.ten === 'Xuất bán POS') {
    figmaName = 'xuat-ban-pos'
  } else if (key === '4-1-1' || key === '4.1.1' || cn.ten === 'Mua hàng' || cn.ten === 'Phiếu mua hàng') {
    figmaName = 'mua-hang'
  } else if (key === '5-1-10' || key === '5.1.10' || cn.ten === 'Kiểm kê' || cn.ten === 'Kiểm kê kho') {
    figmaName = 'kiem-ke'
  } else if (key === '8-1-1' || key === '8.1.1' || key === 'the-chi-phi' || cn.ten === 'Thẻ chi phí' || cn.ten === 'Danh sách thẻ chi phí') {
    figmaName = 'the-chi-phi'
  }

  if (figmaName) {
    const figmaIcon = FigmaMobileIcon({ name: figmaName, className: 'ic' })
    if (figmaIcon) return figmaIcon
  }

  return <Icon n={cn.icon} kieu="khoi" className="ic" />
}

export function MNghiepVu() {
  const { s } = useSession()
  const [params] = useSearchParams()
  const [tuKhoa, setTuKhoa] = useState('')
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
          code: '2.1.1',
          slug: '2-1-1',
        },
        {
          ten: 'Chuyển quỹ',
          to: '/app/tien/2-1-1/moi?loai=cq',
          icon: 'swap',
          slug: 'chuyen-quy',
        },
      ]
      if (s.goi === 'F') {
        items.push({
          ten: 'Số dư ban đầu',
          to: '/app/tien/so-du-ban-dau',
          icon: 'db',
          code: '10.1.3',
          slug: 'so-du-ban-dau',
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
        code: sc.code,
        slug: sc.slug,
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
        code: md.code,
        slug: md.slug,
        khoa: !anNgoaiGoi(s.goi) && !moDuoc(md, s.goi),
        goiMin: md.code ? minGoi(md.code) : undefined,
      },
    ]
  }

  // Tên nhóm theo chuẩn Figma MB02
  const layTenNhom = (key: string, tenGoc: string) => {
    if (key === 'tien') return 'THU CHI'
    if (key === 'ban-hang') return 'KẾ TOÁN BÁN HÀNG'
    if (key === 'mua-hang') return 'KẾ TOÁN MUA HÀNG'
    if (key === 'kho') return 'KIỂM KÊ'
    if (key === 'ccdc') return 'CHI PHÍ PHÂN BỔ'
    return tenGoc.toUpperCase()
  }

  const q = tuKhoa.trim().toLowerCase()

  const dsHien = dsPhanHe
    .filter(m => !anNgoaiGoi(s.goi) || !phanHeKhoa(m, s.goi))
    .map(m => {
      const all = layCacChucNang(m)
      const loc = q ? all.filter(cn => cn.ten.toLowerCase().includes(q) || (cn.code && cn.code.includes(q))) : all
      return { mod: m, items: loc }
    })
    .filter(g => g.items.length > 0)

  return (
    <div className="m-t498-nv-trang">
      {/* ── Header nền sáng theo Figma MB02 (T498) ── */}
      <div className="m-t498-nv-header">
        <h1 className="m-t498-nv-tieu-de">Nghiệp vụ</h1>
        <div className="m-t498-nv-tim-hop">
          <Icon n="search" className="ic sm m-t498-nv-tim-ic" />
          <input
            type="text"
            className="m-t498-nv-tim-inp"
            placeholder="Tìm nghiệp vụ, chứng từ…"
            value={tuKhoa}
            onChange={e => setTuKhoa(e.target.value)}
          />
          {tuKhoa && (
            <button
              type="button"
              className="m-t498-nv-tim-xoa"
              onClick={() => setTuKhoa('')}
              aria-label="Xoá tìm kiếm"
            >
              <Icon n="x" className="ic sm" />
            </button>
          )}
        </div>
      </div>

      {/* ── Danh sách phân hệ dạng thẻ theo Figma MB02 ── */}
      <div className="m-t498-nv-ds">
        {dsHien.length === 0 ? (
          <div className="m-t498-nv-trong">
            Không tìm thấy nghiệp vụ phù hợp
          </div>
        ) : (
          dsHien.map(({ mod, items }) => (
            <div key={mod.key} className="m-t498-nv-nhom">
              <div className="m-t498-nv-nhom-tieu">
                {layTenNhom(mod.key, tenPhanHe(mod, s.goi).ten)}
              </div>
              <div className="m-t498-nv-card">
                {items.map((cn, idx) => (
                  <div key={cn.to} className="m-t498-nv-item-wrap">
                    <Link to={cn.to} className="m-t498-nv-item">
                      <div className="m-t498-nv-item-ic">
                        {layIconMobile(cn)}
                      </div>
                      <span className="m-t498-nv-item-ten">{cn.ten}</span>
                      {cn.ten === 'Mua hàng' && (
                        <span className="m-t498-nv-badge-no">Nợ 138,2 tr</span>
                      )}
                      {cn.khoa && cn.goiMin && (
                        <span className="m-t498-nv-khoa">
                          <Pk g={cn.goiMin} o />
                        </span>
                      )}
                      <Icon n="chevr" className="ic sm m-t498-nv-mui" />
                    </Link>
                    {idx < items.length - 1 && <div className="m-t498-nv-divider" />}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
