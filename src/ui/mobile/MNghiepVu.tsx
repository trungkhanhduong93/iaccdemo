import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useSession } from '../../app/session'
import { MODULES, duongDan, hienMan, hienPhanHe, moDuoc, nhanTab, phanHeKhoa, tabCua, tenPhanHe } from '../../app/registry'
import { GOI, anNgoaiGoi, minGoi, type Goi } from '../../app/plan'
import type { ModuleDef, ScreenDef } from '../../modules/types'
import { Icon } from '../Icon'
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
    // 1. Phân hệ Thu chi chỉ một mục Thu, chi tiền (T572): Chuyển quỹ đã là tab trong danh sách, số dư ban đầu khai ở Danh mục Quỹ tiền
    if (m.key === 'tien') {
      return [{ ten: 'Thu, chi tiền', to: '/app/tien/2-1-1', icon: 'wallet', code: '2.1.1', slug: '2-1-1' }]
    }

    // 2. Các phân hệ khác: lấy màn điện thoại từ tabCua(m) (bỏ Báo cáo)
    const screens = tabCua(m).filter(
      sc =>
        sc.kind !== 'quytrinh' &&
        sc.kind !== 'baocao' &&
        sc.slug !== 'bao-cao' &&
        nhanTab(sc) !== 'Báo cáo' &&
        !sc.voucher?.dieuChinh &&   // Xuất, Nhập điều chỉnh là tab trong màn Kiểm kê (T588)
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

  // Danh sách phân hệ và chức năng đã lọc theo gói, chưa lọc từ khoá
  const dsNhomDayDu = dsPhanHe
    .filter(m => !anNgoaiGoi(s.goi) || !phanHeKhoa(m, s.goi))
    .map(m => ({ mod: m, items: layCacChucNang(m) }))
    .filter(g => g.items.length > 0)

  const tongSoNv = dsNhomDayDu.reduce((acc, g) => acc + g.items.length, 0)
  const tongSoNhom = dsNhomDayDu.length

  const q = tuKhoa.trim().toLowerCase()

  const dsHien = q
    ? dsNhomDayDu
        .map(g => ({
          ...g,
          items: g.items.filter(cn => cn.ten.toLowerCase().includes(q) || (cn.code && cn.code.includes(q))),
        }))
        .filter(g => g.items.length > 0)
    : dsNhomDayDu

  return (
    <div className="m-t498-nv-trang">
      {/* ── Header gradient xanh theo MBaoCao (T505) ── */}
      <header className="m-bc-hdr-gradient">
        <div className="m-bc-hdr-top">
          <div className="m-bc-hdr-tieu-de-hang">
            <h1 className="m-bc-hdr-tieu-de">Nghiệp vụ</h1>
            <span className="m-bc-hdr-chip-goi">
              {s.goi === 'F' ? 'FREE' : GOI[s.goi]?.ten?.toUpperCase() ?? 'FREE'}
            </span>
          </div>
          <div className="m-bc-hdr-phu">
            {`${tongSoNv} nghiệp vụ · ${tongSoNhom} nhóm`}
          </div>
        </div>

        <div className="m-bc-hdr-tim-wrap">
          <div className="m-bc-hdr-tim">
            <Icon n="search" className="m-bc-hdr-tim-ic ic sm" />
            <input
              type="text"
              className="m-bc-hdr-tim-inp"
              placeholder="Tìm nghiệp vụ, chứng từ…"
              value={tuKhoa}
              onChange={e => setTuKhoa(e.target.value)}
              aria-label="Tìm kiếm nghiệp vụ"
            />
            {tuKhoa && (
              <button
                type="button"
                className="m-bc-hdr-tim-x"
                onClick={() => setTuKhoa('')}
                aria-label="Xoá tìm kiếm"
              >
                <Icon n="x" className="ic sm" />
              </button>
            )}
          </div>
        </div>
      </header>

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
                        <Icon n={cn.icon} kieu="khoi" className="ic" />
                      </div>
                      <span className="m-t498-nv-item-ten">{cn.ten}</span>
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
