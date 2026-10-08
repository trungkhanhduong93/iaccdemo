// Nút biểu tượng Excel và nút Thêm mới dạng split button gom nhóm thao tác (T42)
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropdown, MenuHead, MenuItem, MenuSep } from './Dropdown'
import { Icon } from './Icon'
import { useSession } from '../app/session'
import { HopXacNhan } from './LocNangCao'

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

/** Nút xổ liền cạnh "Thêm mới" (split button "Thêm mới | ⌄"):
 * nửa trái mở form thêm mới; nửa phải mở menu gom Thêm theo loại, Dữ liệu (Tải từ nguồn, Excel), và Hàng loạt (T42) */
export function NutThemMoiSplit({
  toMoi,
  loai,
  taiNguon,
  onNhapExcel,
  onXuatExcel,
  soChon,
  ghi,
  onBoChon,
}: {
  toMoi: string
  loai?: { k: string; ten: string; prefix?: string; icon?: string }[]
  taiNguon?: { ten: string; onTai: () => void }
  onNhapExcel: () => void
  onXuatExcel: () => void
  soChon: number
  ghi: boolean
  onBoChon: () => void
}) {
  const { toast } = useSession()
  const [hoiXoa, setHoiXoa] = useState(false)

  const lam = (msg: string) => {
    toast(msg)
    onBoChon()
  }

  return (
    <>
      <div className="ds-split-them">
        <Link className="btn pri ds-them-trai" to={toMoi}>
          <Icon n="plus" className="ic sm" />
          <span>Thêm mới</span>
        </Link>
        <Dropdown
          btnClass="btn pri ds-them-phai"
          align="end"
          width={260}
          title="Thêm và công cụ"
          label={<Icon n="chevd" className="ic sm" />}
        >
          {dong => (
            <>
              {/* 1. Nhóm Thêm theo loại (chỉ màn có loai) */}
              {loai && loai.length > 0 && (
                <>
                  <MenuHead>Thêm theo loại</MenuHead>
                  {loai.map(v => {
                    const basePath = toMoi.split('?')[0]
                    return (
                      <MenuItem
                        key={v.k}
                        to={`${basePath}?loai=${v.k}`}
                        icon={v.icon ?? 'doc'}
                        desc={`Số ${v.prefix}…`}
                        onClick={dong}
                      >
                        {v.ten}
                      </MenuItem>
                    )
                  })}
                  <MenuSep />
                </>
              )}

              {/* 2. Nhóm Dữ liệu */}
              <MenuHead>Dữ liệu</MenuHead>
              {taiNguon && (
                <MenuItem
                  icon="refresh"
                  onClick={() => {
                    taiNguon.onTai()
                    dong()
                  }}
                >
                  Tải từ {taiNguon.ten}
                </MenuItem>
              )}
              <MenuItem
                icon="upload"
                onClick={() => {
                  onNhapExcel()
                  dong()
                }}
              >
                Nhập Excel
              </MenuItem>
              <MenuItem
                icon="download"
                onClick={() => {
                  onXuatExcel()
                  dong()
                }}
              >
                Xuất Excel
              </MenuItem>
              <MenuSep />

              {/* 3. Nhóm Hàng loạt (n đã chọn) */}
              <MenuHead>Hàng loạt{soChon > 0 ? ` (${soChon} đã chọn)` : ''}</MenuHead>
              {soChon === 0 && (
                <div className="ds-menu-goi-y">Tick chọn phiếu trong bảng để dùng</div>
              )}
              {ghi && (
                <MenuItem
                  icon="check"
                  lock={soChon === 0}
                  onClick={soChon > 0 ? () => { lam(`Đã ghi sổ ${soChon} phiếu`); dong() } : undefined}
                >
                  Ghi sổ {soChon > 0 ? `${soChon} ` : ''}phiếu
                </MenuItem>
              )}
              {ghi && (
                <MenuItem
                  icon="back"
                  lock={soChon === 0}
                  onClick={soChon > 0 ? () => { lam(`Đã bỏ ghi sổ ${soChon} phiếu`); dong() } : undefined}
                >
                  Bỏ ghi sổ {soChon > 0 ? `${soChon} ` : ''}phiếu
                </MenuItem>
              )}
              <MenuItem
                icon="printer"
                lock={soChon === 0}
                onClick={soChon > 0 ? () => { lam(`In ${soChon} phiếu`); dong() } : undefined}
              >
                In {soChon > 0 ? `${soChon} ` : ''}phiếu
              </MenuItem>
              <MenuItem
                icon="download"
                lock={soChon === 0}
                onClick={soChon > 0 ? () => { lam(`Đã xuất ${soChon} phiếu ra Excel`); dong() } : undefined}
              >
                Xuất Excel {soChon > 0 ? `${soChon} ` : ''}phiếu
              </MenuItem>
              <MenuItem
                icon="trash"
                danger
                lock={soChon === 0}
                onClick={soChon > 0 ? () => { dong(); setHoiXoa(true) } : undefined}
              >
                Xoá {soChon > 0 ? `${soChon} ` : ''}phiếu
              </MenuItem>
              <MenuSep />
              <MenuItem
                icon="x"
                lock={soChon === 0}
                onClick={soChon > 0 ? () => { onBoChon(); dong() } : undefined}
              >
                Bỏ chọn
              </MenuItem>
            </>
          )}
        </Dropdown>
      </div>

      {hoiXoa && (
        <HopXacNhan
          tieuDe={`Xoá ${soChon} phiếu?`}
          nut={`Xoá ${soChon} phiếu`}
          onDong={() => setHoiXoa(false)}
          onDongY={() => {
            setHoiXoa(false)
            lam(`Đã xoá ${soChon} phiếu`)
          }}
        >
          Phiếu đã xoá không lấy lại được. Phiếu đã ghi sổ cần bỏ ghi sổ trước khi xoá.
        </HopXacNhan>
      )}
    </>
  )
}
