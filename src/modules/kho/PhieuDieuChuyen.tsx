// Màn xuất điều chuyển, nhập điều chuyển, chuyển kho (T155). Danh sách dùng chung với phiếu sản xuất, form phiếu dùng form chứng từ chung
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useSession } from '../../app/session'
import type { Col, ScreenProps } from '../types'
import { ChungTuForm } from '../../ui/generic/ChungTuForm'
import { useDsPhieuDcn } from './BangDieuChuyen'
import { DCN } from './dieu-chuyen'
import { DsPhieuTc, type KieuDs } from './PhieuSanXuat'

const COT_NGUOI: Col[] = [{ k: 'ngay', t: 'Ngày', w: 110 }, { k: 'ghiChu', t: 'Ghi chú' }, { k: 'nguoiTao', t: 'Người tạo', w: 140 }]

/** Cột, chip theo loại phiếu: xuất, nhập có Chờ nhập (phiếu nhập sinh kèm phiếu xuất, T748), Đã nhập, Đã huỷ; bỏ cột Cửa hàng nhận (T748); chuyển kho không có trạng thái, không có tiền */
const KIEU: Record<'xdc' | 'ndc' | 'ck', KieuDs> = {
  xdc: { ten: DCN.xdc.ten, nhap: false, manDoi: DCN.ndc.man, chips: ['cho', 'da', 'huy'], nhanKho: 'Kho xuất', coTien: true,
    cot: [{ k: 'kho', t: 'Kho xuất', w: 170 }, { k: 'khoNhan', t: 'Kho nhận', w: 170 }, ...COT_NGUOI] },
  ndc: { ten: DCN.ndc.ten, nhap: true, manDoi: DCN.xdc.man, chips: ['cho', 'da', 'huy'], nhanKho: 'Kho nhận', coTien: true, khongThem: true,
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
  const { s } = useSession()
  const nav = useNavigate()
  // Gói Plus gộp Xuất, Nhập điều chuyển vào một tab Điều chuyển, chuyển qua lại bằng tab con (T721)
  const tabCon = s.goi === 'PL' && loai !== 'ck' ? (
    <div className="tabs dcn-tabs" role="tablist" aria-label="Xuất, nhập điều chuyển">
      {(['xdc', 'ndc'] as const).map(k => (
        <button key={k} type="button" role="tab" aria-selected={k === loai} className={k === loai ? 'on' : ''}
          onClick={() => { if (k !== loai) nav(`/app/${DCN[k].man}`) }}>{DCN[k].ten}</button>
      ))}
    </div>
  ) : undefined
  if (id !== undefined) {
    if (id === 'moi' && loai === 'ndc') return <Navigate to={`/app/${DCN.ndc.man}`} replace />   // phiếu nhập điều chuyển chỉ sinh từ phiếu xuất (T748)
    const row = id === 'moi' ? undefined : rows.find(r => r.id === id)
    return <ChungTuForm key={loc.key + loc.search} sc={sc} mod={mod} cfg={cfg} row={row} rows={rows} />
  }
  return <DsPhieuTc sc={sc} mod={mod} kieu={{ ...KIEU[loai], tabCon }} rows={rows} />
}
