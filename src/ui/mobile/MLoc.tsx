import { useEffect, useState, type FC } from 'react'
import { HOM_NAY } from '../../data/mock'
import { khoangThang, thangNay, type KhoangNgay } from '../ChonNgay'
import { Icon } from '../Icon'

export type KyThoiGian = 'hom-nay' | 'tuan-nay' | 'thang-nay' | 'thang-truoc' | 'tat-ca'

export interface GtLocMobile {
  thoiGian: KyThoiGian
  doiTuong?: string
  nguon?: string
  kho?: string
}

export const MAC_DINH_LOC_MOBILE: GtLocMobile = {
  thoiGian: 'thang-nay',
  doiTuong: '',
  nguon: '',
  kho: '',
}

export function coLocKhacMacDinh(gt: GtLocMobile): boolean {
  return gt.thoiGian !== 'thang-nay' || Boolean(gt.doiTuong) || Boolean(gt.nguon) || Boolean(gt.kho)
}

export function tinhKhoangNgay(ky: KyThoiGian): KhoangNgay | null {
  if (ky === 'tat-ca') return null
  if (ky === 'hom-nay') {
    const d = new Date(HOM_NAY)
    return {
      tu: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
      den: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59),
    }
  }
  if (ky === 'tuan-nay') {
    const day = HOM_NAY.getDay() || 7
    const mon = new Date(HOM_NAY)
    mon.setDate(HOM_NAY.getDate() - day + 1)
    const sun = new Date(mon)
    sun.setDate(mon.getDate() + 6)
    return {
      tu: new Date(mon.getFullYear(), mon.getMonth(), mon.getDate()),
      den: new Date(sun.getFullYear(), sun.getMonth(), sun.getDate(), 23, 59, 59),
    }
  }
  if (ky === 'thang-truoc') {
    return khoangThang(HOM_NAY.getMonth(), HOM_NAY.getFullYear())
  }
  return thangNay()
}

export interface MLocProps {
  mo: boolean
  onDong: () => void
  giaTri: GtLocMobile
  onApDung: (gt: GtLocMobile) => void
  dsDoiTuong?: string[]
  nhanDoiTuong?: string
  dsNguon?: { k: string; ten: string }[]
  dsKho?: string[]
}

const CAC_KY: { k: KyThoiGian; ten: string }[] = [
  { k: 'hom-nay', ten: 'Hôm nay' },
  { k: 'tuan-nay', ten: 'Tuần này' },
  { k: 'thang-nay', ten: 'Tháng này' },
  { k: 'thang-truoc', ten: 'Tháng trước' },
]

export const MLoc: FC<MLocProps> = ({
  mo,
  onDong,
  giaTri,
  onApDung,
  dsDoiTuong,
  nhanDoiTuong = 'Đối tượng',
  dsNguon,
  dsKho,
}) => {
  const [draft, setDraft] = useState<GtLocMobile>(giaTri)

  useEffect(() => {
    if (mo) {
      setDraft(giaTri)
    }
  }, [mo, giaTri])

  if (!mo) return null

  const nguons = dsNguon ?? [
    { k: 'tay', ten: 'Thủ công' },
    { k: 'FABi', ten: 'FABi' },
    { k: 'IVT', ten: 'iPOS Inventory' },
    { k: 'HĐ', ten: 'iPOS Invoice' },
    { k: 'excel', ten: 'Excel' },
  ]

  const handleReset = () => {
    setDraft({ ...MAC_DINH_LOC_MOBILE })
  }

  const handleApply = () => {
    onApDung(draft)
    onDong()
  }

  return (
    <div className="m-loc-man">
      <div className="m-thanh-tren">
        <div className="m-thanh-tren-trai">
          <button type="button" className="m-nut-back" onClick={onDong} aria-label="Quay lại">
            <Icon n="chevl" className="ic sm" />
          </button>
        </div>
        <h1 className="m-thanh-tren-tieu-de">Bộ lọc</h1>
        <div className="m-thanh-tren-phai" style={{ width: 36 }} />
      </div>

      <div className="m-loc-than">
        {/* Khoảng thời gian */}
        <div className="m-loc-the">
          <div className="m-loc-the-nhan">Thời gian</div>
          <div className="m-loc-ky-ds">
            {CAC_KY.map(ky => (
              <button
                key={ky.k}
                type="button"
                className={`m-loc-ky-btn ${draft.thoiGian === ky.k ? 'on' : ''}`}
                onClick={() => setDraft(prev => ({ ...prev, thoiGian: ky.k }))}
              >
                {ky.ten}
              </button>
            ))}
          </div>
        </div>

        {/* Kho */}
        {dsKho && dsKho.length > 0 && (
          <div className="m-loc-the">
            <label className="m-loc-the-nhan" htmlFor="m-loc-kho">Kho</label>
            <select
              id="m-loc-kho"
              className="m-loc-sel"
              value={draft.kho ?? ''}
              onChange={e => setDraft(prev => ({ ...prev, kho: e.target.value }))}
            >
              <option value="">Tất cả</option>
              {dsKho.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        )}

        {/* Đối tượng */}
        {dsDoiTuong && dsDoiTuong.length > 0 && (
          <div className="m-loc-the">
            <label className="m-loc-the-nhan" htmlFor="m-loc-dt">{nhanDoiTuong}</label>
            <select
              id="m-loc-dt"
              className="m-loc-sel"
              value={draft.doiTuong ?? ''}
              onChange={e => setDraft(prev => ({ ...prev, doiTuong: e.target.value }))}
            >
              <option value="">Tất cả</option>
              {dsDoiTuong.map(dt => (
                <option key={dt} value={dt}>{dt}</option>
              ))}
            </select>
          </div>
        )}

        {/* Nguồn */}
        <div className="m-loc-the">
          <label className="m-loc-the-nhan" htmlFor="m-loc-nguon">Nguồn dữ liệu</label>
          <select
            id="m-loc-nguon"
            className="m-loc-sel"
            value={draft.nguon ?? ''}
            onChange={e => setDraft(prev => ({ ...prev, nguon: e.target.value }))}
          >
            <option value="">Tất cả</option>
            {nguons.map(n => (
              <option key={n.k} value={n.k}>{n.ten}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="m-loc-day">
        <button type="button" className="m-loc-btn-reset" onClick={handleReset}>
          Thiết lập lại
        </button>
        <button type="button" className="m-loc-btn-apply" onClick={handleApply}>
          Áp dụng
        </button>
      </div>
    </div>
  )
}
