// Phân trang báo cáo điện thoại (T273)
import React, { type FC } from 'react'
import type { Row } from '../../modules/types'

export interface KetQuaPhanTrang {
  trangHt: number
  soTrang: number
  tongDong: number
  batDau: number
  ketThuc: number
  rowsHienThi: Row[]
  dongTong: Row[]
  canPhanTrang: boolean
}

/**
 * Tách dòng dữ liệu và dòng tổng cộng, phân trang 100 dòng một trang (T273).
 * Dòng tổng cộng luôn là của toàn bộ báo cáo, hiện ở cuối mỗi trang.
 * Dòng tiêu đề nhóm (nếu có) đi theo dòng con, không tính vào số dòng dữ liệu.
 */
export function tinhPhanTrang(rows: Row[], trang: number, coTrang: number = 100): KetQuaPhanTrang {
  // Tách dòng tổng cộng _t ở cuối danh sách
  let idx = rows.length
  while (idx > 0 && rows[idx - 1]?._t && !rows[idx - 1]?._nhom) {
    idx--
  }
  const dongThan = rows.slice(0, idx)
  const dongTong = rows.slice(idx)

  const coNhom = dongThan.some(r => r._nhom)

  if (!coNhom) {
    const tongDong = dongThan.length
    const soTrang = Math.max(1, Math.ceil(tongDong / coTrang))
    const trangHt = Math.min(Math.max(1, trang), soTrang)
    const batDau = (trangHt - 1) * coTrang
    const ketThuc = Math.min(batDau + coTrang, tongDong)
    const slice = dongThan.slice(batDau, ketThuc)
    return {
      trangHt,
      soTrang,
      tongDong,
      batDau: tongDong === 0 ? 0 : batDau + 1,
      ketThuc,
      rowsHienThi: [...slice, ...dongTong],
      dongTong,
      canPhanTrang: tongDong > coTrang,
    }
  }

  // Báo cáo có nhóm: dòng dữ liệu là !r._nhom, dòng _nhom đi kèm dòng con
  type NhomData = { header?: Row; items: Row[] }
  const dsNhom: NhomData[] = []
  let nhomHienTai: NhomData = { items: [] }

  for (const r of dongThan) {
    if (r._nhom) {
      if (nhomHienTai.header || nhomHienTai.items.length) {
        dsNhom.push(nhomHienTai)
      }
      nhomHienTai = { header: r, items: [] }
    } else {
      nhomHienTai.items.push(r)
    }
  }
  if (nhomHienTai.header || nhomHienTai.items.length) {
    dsNhom.push(nhomHienTai)
  }

  const tongDong = dsNhom.reduce((a, n) => a + n.items.length, 0)
  const soTrang = Math.max(1, Math.ceil(tongDong / coTrang))
  const trangHt = Math.min(Math.max(1, trang), soTrang)
  const idxDau = (trangHt - 1) * coTrang
  const idxCuoi = Math.min(idxDau + coTrang, tongDong)

  const rowsTrang: Row[] = []
  let dem = 0
  for (const nhom of dsNhom) {
    const len = nhom.items.length
    const nhomDau = dem
    const nhomCuoi = dem + len
    dem += len

    if (nhomCuoi > idxDau && nhomDau < idxCuoi) {
      const layTu = Math.max(0, idxDau - nhomDau)
      const layDen = Math.min(len, idxCuoi - nhomDau)
      const itemsCon = nhom.items.slice(layTu, layDen)
      if (itemsCon.length > 0) {
        if (nhom.header) {
          rowsTrang.push(nhom.header)
        }
        rowsTrang.push(...itemsCon)
      }
    }
  }

  return {
    trangHt,
    soTrang,
    tongDong,
    batDau: tongDong === 0 ? 0 : idxDau + 1,
    ketThuc: idxCuoi,
    rowsHienThi: [...rowsTrang, ...dongTong],
    dongTong,
    canPhanTrang: tongDong > coTrang,
  }
}

export interface ThanhPhanTrangMProps {
  trang: number
  soTrang: number
  batDau: number
  ketThuc: number
  tongDong: number
  onDoiTrang: (trangMoi: number) => void
}

/**
 * Thanh phân trang dưới chân bảng báo cáo điện thoại (T273)
 * Mẫu: "Trước", "Trang 2/5 · 101–200 / 432 dòng", "Sau"
 */
export const ThanhPhanTrangM: FC<ThanhPhanTrangMProps> = ({
  trang,
  soTrang,
  batDau,
  ketThuc,
  tongDong,
  onDoiTrang,
}) => {
  return (
    <div className="m-sbc-phan-trang">
      <button
        type="button"
        className="m-sbc-pt-nut"
        disabled={trang <= 1}
        onClick={() => onDoiTrang(trang - 1)}
      >
        Trước
      </button>
      <span className="m-sbc-pt-chu">
        Trang {trang}/{soTrang} · {batDau}–{ketThuc} / {tongDong} dòng
      </span>
      <button
        type="button"
        className="m-sbc-pt-nut"
        disabled={trang >= soTrang}
        onClick={() => onDoiTrang(trang + 1)}
      >
        Sau
      </button>
    </div>
  )
}
