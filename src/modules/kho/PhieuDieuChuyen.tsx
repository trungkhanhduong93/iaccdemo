// Màn xuất điều chuyển, nhập điều chuyển, chuyển kho (T155). Danh sách dùng chung với phiếu sản xuất, form phiếu dùng form chứng từ chung
import { useLocation, useParams } from 'react-router-dom'
import type { Col, ScreenProps } from '../types'
import { ChungTuForm } from '../../ui/generic/ChungTuForm'
import { useDsPhieuDcn } from './BangDieuChuyen'
import { DCN } from './dieu-chuyen'
import { DsPhieuTc, type KieuDs } from './PhieuSanXuat'

const COT_NGUOI: Col[] = [{ k: 'ngay', t: 'Thời gian', w: 140 }, { k: 'ghiChu', t: 'Ghi chú' }, { k: 'nguoiTao', t: 'Người tạo', w: 140 }]

/** Cột, chip theo loại phiếu: xuất có Chờ nhập, nhập chỉ Đã nhập, Đã huỷ; chuyển kho không có trạng thái, không có tiền */
const KIEU: Record<'xdc' | 'ndc' | 'ck', KieuDs> = {
  xdc: { ten: DCN.xdc.ten, nhap: false, manDoi: DCN.ndc.man, chips: ['cho', 'da', 'huy'], nhanKho: 'Kho xuất', coTien: true,
    cot: [{ k: 'kho', t: 'Kho xuất', w: 170 }, { k: 'cnNhan', t: 'Cửa hàng nhận', w: 170 }, { k: 'khoNhan', t: 'Kho nhận', w: 170 }, ...COT_NGUOI] },
  ndc: { ten: DCN.ndc.ten, nhap: true, manDoi: DCN.xdc.man, chips: ['da', 'huy'], nhanKho: 'Kho nhận', coTien: true,
    cot: [{ k: 'cnXuat', t: 'Cửa hàng xuất', w: 170 }, { k: 'khoXuat', t: 'Kho xuất', w: 170 }, { k: 'kho', t: 'Kho nhận', w: 170 }, ...COT_NGUOI] },
  ck: { ten: DCN.ck.ten, nhap: false, nhanKho: 'Kho xuất', coTien: false,
    cot: [{ k: 'kho', t: 'Kho xuất', w: 170 }, { k: 'khoNhan', t: 'Kho nhận', w: 170 }, ...COT_NGUOI] },
}

export function PhieuDieuChuyen({ sc, mod }: ScreenProps) {
  const { id } = useParams()
  const loc = useLocation()
  const cfg = sc.voucher!
  const loai = cfg.dieuChuyen!
  const rows = useDsPhieuDcn(loai)
  if (id !== undefined) {
    const row = id === 'moi' ? undefined : rows.find(r => r.id === id)
    return <ChungTuForm key={loc.key + loc.search} sc={sc} mod={mod} cfg={cfg} row={row} rows={rows} />
  }
  return <DsPhieuTc sc={sc} mod={mod} kieu={KIEU[loai]} rows={rows} />
}
