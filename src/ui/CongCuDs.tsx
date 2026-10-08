// Cụm nút biểu tượng trên đầu màn danh sách: Excel (nhập, xuất), tuỳ chỉnh giao diện (ẩn hiện cột), theo mẫu iPOS Inventory (T39)
import type { Col } from '../modules/types'
import { Dropdown, MenuHead, MenuItem, MenuSep } from './Dropdown'
import { Icon } from './Icon'

/** Logo Excel màu xanh lá: tờ bảng tính phía sau, khối chữ X phía trước */
function LogoExcel() {
  return (
    <svg className="ic sm logo-excel" viewBox="0 0 24 24" aria-hidden>
      <rect x="8" y="3" width="13" height="18" rx="1.6" fill="#fff" stroke="#1f7a46" strokeWidth="1.4" />
      <path d="M14 7h5M14 10.5h5M14 14h5M14 17.5h5" stroke="#1f7a46" strokeWidth="1.2" />
      <rect x="2.5" y="6" width="10.5" height="12" rx="1.6" fill="#1f7a46" />
      <path d="M5.3 9l4.9 6M10.2 9l-4.9 6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function NutExcel({ onNhap, onXuat }: { onNhap: () => void; onXuat: () => void }) {
  return (
    <Dropdown btnClass="btn-vuong" align="end" width={190} title="Excel: nhập, xuất danh sách" label={<LogoExcel />}>
      {dong => <>
        <MenuHead>Excel</MenuHead>
        <MenuItem icon="upload" onClick={() => { onNhap(); dong() }}>Nhập Excel</MenuItem>
        <MenuItem icon="download" onClick={() => { onXuat(); dong() }}>Xuất Excel</MenuItem>
      </>}
    </Dropdown>
  )
}

/** Ẩn hiện cột của bảng; cột cố định không có trong danh sách chọn */
export function NutGiaoDien({ cols, an, doi, hienHet }: { cols: Col[]; an: Set<string>; doi: (k: string) => void; hienHet: () => void }) {
  return (
    <Dropdown btnClass="btn-vuong" align="end" width={210} title="Tuỳ chỉnh giao diện: ẩn, hiện cột" label={<Icon n="chinh" className="ic sm" />}>
      <MenuHead>Hiển thị cột</MenuHead>
      {cols.map(c => <MenuItem key={c.k} on={!an.has(c.k)} onClick={() => doi(c.k)}>{c.t}</MenuItem>)}
      <MenuSep />
      <MenuItem onClick={hienHet}>Hiện tất cả cột</MenuItem>
    </Dropdown>
  )
}
