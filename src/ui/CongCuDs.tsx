// Nút biểu tượng Excel và nút Thêm mới dạng split button gom nhóm thao tác (T42)
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Dropdown, MenuHead, MenuItem, MenuSep } from './Dropdown'
import { Icon } from './Icon'
import { IconFigmaSheet } from './IconFigma'
import { useSession } from '../app/session'
import { HopXacNhan } from './LocNangCao'


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
    <Dropdown btnClass="nut-vuong ds-nut-excel" align={align} width={width} title={title} label={label ?? <IconFigmaSheet />}>
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
  return <button type="button" className="nut-vuong ds-nut-excel" title="Xuất Excel" aria-label="Xuất Excel" onClick={onXuat}><IconFigmaSheet /></button>
}

/** Đổi icon dạng khối/đặc sang icon nét mảnh cùng kiểu trong menu Thêm theo loại (T542) */
const ICON_NET_MENU: Record<string, string> = {
  cashin: 'download',
  cashout: 'upload',
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
        popClass="ds-them-pop"
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
                icon={v.icon ? (ICON_NET_MENU[v.icon] ?? v.icon) : 'doc'}
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
