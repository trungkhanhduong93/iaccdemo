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
    <Dropdown btnClass="nut-vuong ds-nut-excel" align="end" width={190} title="Excel: nhập, xuất danh sách" label={<LogoExcel />}>
      {dong => <>
        <MenuHead>Excel</MenuHead>
        <MenuItem icon="upload" onClick={() => { onNhap(); dong() }}>Nhập Excel</MenuItem>
        <MenuItem icon="download" onClick={() => { onXuat(); dong() }}>Xuất Excel</MenuItem>
      </>}
    </Dropdown>
  )
}

/** Nút xổ liền cạnh "Thêm mới" (split button "Thêm mới | ⌄"):
 * nửa trái mở form thêm mới; nửa phải mở menu gom Thêm theo loại và Tải từ nguồn (T43) */
export function NutThemMoiSplit({
  toMoi,
  loai,
  taiNguon,
}: {
  toMoi: string
  loai?: { k: string; ten: string; prefix?: string; icon?: string }[]
  taiNguon?: { ten: string; onTai: () => void }
}) {
  const coMenu = (loai && loai.length > 0) || Boolean(taiNguon)

  if (!coMenu) {
    return (
      <Link className="btn pri ds-nut-them" to={toMoi}>
        <Icon n="plus" className="ic sm" />
        <span>Thêm mới</span>
      </Link>
    )
  }

  return (
    <div className="ds-split-them">
      <Link className="btn pri ds-them-trai" to={toMoi}>
        <Icon n="plus" className="ic sm" />
        <span>Thêm mới</span>
      </Link>
      <Dropdown
        btnClass="btn pri ds-them-phai"
        align="end"
        width={240}
        title="Thêm và nguồn dữ liệu"
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
                      desc={v.prefix ? `Số ${v.prefix}…` : undefined}
                      onClick={dong}
                    >
                      {v.ten}
                    </MenuItem>
                  )
                })}
              </>
            )}

            {loai && loai.length > 0 && taiNguon && <MenuSep />}

            {/* 2. Nhóm Tải từ nguồn */}
            {taiNguon && (
              <>
                <MenuHead>Nguồn dữ liệu</MenuHead>
                <MenuItem
                  icon="refresh"
                  onClick={() => {
                    taiNguon.onTai()
                    dong()
                  }}
                >
                  Tải từ {taiNguon.ten}
                </MenuItem>
              </>
            )}
          </>
        )}
      </Dropdown>
    </div>
  )
}
