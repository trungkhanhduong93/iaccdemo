// Nút biểu tượng Excel và nút Thêm mới dạng split button gom nhóm thao tác (T42)
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Dropdown, MenuHead, MenuItem, MenuSep } from './Dropdown'
import { Icon } from './Icon'
import { useSession } from '../app/session'
import { HopXacNhan } from './LocNangCao'

/** Logo Excel màu xanh lá: tờ bảng tính phía sau, khối chữ X phía trước */
export function LogoExcel() {
  return (
    <svg className="ic sm logo-excel" viewBox="0 0 24 24" aria-hidden>
      <rect x="8" y="3" width="13" height="18" rx="1.6" fill="#fff" stroke="#1f7a46" strokeWidth="1.4" />
      <path d="M14 7h5M14 10.5h5M14 14h5M14 17.5h5" stroke="#1f7a46" strokeWidth="1.2" />
      <rect x="2.5" y="6" width="10.5" height="12" rx="1.6" fill="#1f7a46" />
      <path d="M5.3 9l4.9 6M10.2 9l-4.9 6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function NutExcel({
  onNhap,
  onXuat,
  title = 'Excel: nhập, xuất danh sách',
  align = 'end',
  width = 190,
  label,
  children,
}: {
  onNhap?: () => void
  onXuat?: () => void
  title?: string
  align?: 'start' | 'end'
  width?: number
  label?: ReactNode
  children?: (dong: () => void) => ReactNode
}) {
  return (
    <Dropdown btnClass="nut-vuong ds-nut-excel" align={align} width={width} title={title} label={label ?? <LogoExcel />}>
      {dong => (children ? children(dong) : <>
        <MenuHead>Excel</MenuHead>
        {onNhap && <MenuItem icon="upload" onClick={() => { onNhap(); dong() }}>Nhập Excel</MenuItem>}
        {onXuat && <MenuItem icon="download" onClick={() => { onXuat(); dong() }}>Xuất Excel</MenuItem>}
      </>)}
    </Dropdown>
  )
}

/** Nút chỉ xuất Excel, cùng biểu tượng với NutExcel; dùng ở màn chỉ xem, vd màn chi tiết mở từ trang chủ gói Free (T232) */
export function NutXuatExcel({ onXuat }: { onXuat: () => void }) {
  return <button type="button" className="nut-vuong ds-nut-excel" title="Xuất Excel" aria-label="Xuất Excel" onClick={onXuat}><LogoExcel /></button>
}

/** Nút "Thêm mới" (T510): 1 lựa chọn → 1 nút xanh đi thẳng tới form; từ 2 loại → nút xanh kèm mũi tên dính liền,
 * bấm chỗ nào cũng thả cùng 1 menu chọn loại. `nhan`, `taiNguon` còn trong kiểu cho nơi gọi cũ, không hiển thị nữa */
export function NutThemMoiSplit({
  toMoi,
  loai,
  tenLoai,
  thamSo = 'loai',
  so,
}: {
  nhan?: string
  so?: number                      // số đếm nhỏ cạnh chữ, vd số khoản chờ phân bổ chưa tạo thẻ (T287)
  toMoi: string
  loai?: { k: string; ten: string; prefix?: string; icon?: string }[]
  tenLoai?: Record<string, string> // đổi chữ trong menu theo mã loại, vd { thu: 'Thu tiền' }
  thamSo?: string                  // tên tham số loại trên đường dẫn, danh mục dùng 'moi'
  taiNguon?: { ten: string; onTai: () => void }
}) {
  const noiDung = (
    <>
      <Icon n="plus" className="ic sm" />
      <span>Thêm mới</span>
      {so ? <span className="ds-nut-so" title={`${so} khoản cần xử lý`}>{so}</span> : null}
    </>
  )

  if (!loai || loai.length < 2) {
    return <Link className="btn pri ds-nut-them" to={toMoi}>{noiDung}</Link>
  }

  const basePath = toMoi.split('?')[0]
  return (
    <div className="ds-split-them">
      <Dropdown
        btnClass="btn pri ds-them-trai ds-them-mot"
        align="end"
        width={240}
        title="Chọn loại để thêm mới"
        label={<>{noiDung}<span className="ds-them-phai"><Icon n="chevd" className="ic sm" /></span></>}
      >
        {dong => (
          <>
            <MenuHead>Thêm theo loại</MenuHead>
            {loai.map(v => (
              <MenuItem
                key={v.k}
                to={`${basePath}?${thamSo}=${v.k}`}
                icon={v.icon ?? 'doc'}
                desc={v.prefix ? `Số ${v.prefix}…` : undefined}
                onClick={dong}
              >
                {tenLoai?.[v.k] ?? v.ten}
              </MenuItem>
            ))}
          </>
        )}
      </Dropdown>
    </div>
  )
}

/** Nút vuông chỉ icon đồng bộ, cạnh Excel và Tuỳ chỉnh cột (T510) */
export function NutDongBo({ ten, onDongBo }: { ten: string; onDongBo: () => void }) {
  const t = `Đồng bộ từ ${ten}`
  return <button type="button" className="nut-vuong ds-nut-dong-bo" title={t} aria-label={t} onClick={onDongBo}><Icon n="refresh" className="ic sm" /></button>
}
