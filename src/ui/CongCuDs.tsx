// Nút biểu tượng Excel (nhập, xuất) trên thanh công cụ màn danh sách, theo mẫu iPOS Inventory (T39).
// Tuỳ chỉnh cột hiển thị chuyển sang hộp NutTuyChinhCot trong LocNangCao.tsx (T41)
import { Dropdown, MenuHead, MenuItem } from './Dropdown'

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
