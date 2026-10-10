// Ghi tăng hàng loạt thẻ chi phí phân bổ: các dòng phiếu chi lý do Chi phí chờ phân bổ chưa thành thẻ (sau bổ sung hoá đơn mua hàng).
// Mỗi dòng thành một thẻ: chọn loại thẻ, ngày bắt đầu phân bổ, số kỳ; số thẻ tự sinh, số tiền mỗi kỳ tự tính. Bấm Tạo để ghi tăng.
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Row } from '../types'
import { useSession } from '../../app/session'
import { FormToanMan } from '../../ui/FormToanMan'
import { Table } from '../../ui/Table'
import { Select } from '../../ui/Dropdown'
import { docSoQT, soQT } from '../../ui/format'
import { useDaXoa } from '../../ui/generic/daXoa'
import { LOAI_THE, ONhap } from './the-phan-bo'
import { ChonDanhMuc } from '../../ui/ChonDanhMuc'
import { CCDC_HANG } from '../../data/mock'

const LY_CHO = 'Chi phí chờ phân bổ'
const MAN_THU_CHI = 'tien/2-1-1'

/** Dòng phiếu chi chờ phân bổ mẫu: [số chứng từ, ngày chứng từ, nội dung, số tiền] */
const CHO_MAU: [string, string, string, number][] = [
  ['PC2610-0240', '03/10/2026', 'Mua bộ ly thuỷ tinh 300ml', 7_200_000],
  ['UNC2610-0245', '04/10/2026', 'Tiền thuê kho lạnh 3 tháng', 45_000_000],
  ['UNC2610-0245', '04/10/2026', 'Phí bảo trì máy lạnh 12 tháng', 18_000_000],
  ['PC2610-0250', '06/10/2026', 'Mua tủ mát 2 cánh', 28_500_000],
]

/** Dòng phiếu đã tạo thẻ trong phiên, không hiện lại ở lần mở sau */
const daTao = new Set<string>()

const ngaySo = (d: string) => { const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); return m ? +m[3] * 10000 + +m[2] * 100 + +m[1] : NaN }

interface DongCho {
  key: string; chon: boolean; soCt: string; ngayCt: string; ten: string; gt: number; loai: string; ngayPb: string; ky: string; _goc?: string
  ma?: string; tenCc?: string; dvt?: string; sl?: string   // dòng loại CCDC: chọn mã từ danh mục hàng hoá; số tiền giữ theo chứng từ gốc, đơn giá = số tiền / số lượng
}
const CCDC = 'Công cụ dụng cụ'

export function GhiTangHangLoat({ soDong, onDong }: { soDong: number; onDong: () => void }) {
  const { toast } = useSession()
  const { phieuMoi } = useDaXoa(MAN_THU_CHI)
  // Dòng chờ: mẫu cộng các phiếu chi lưu trong phiên có dòng lý do Chi phí chờ phân bổ, bỏ dòng đã tạo thẻ
  const goc = useMemo((): DongCho[] => [
    ...CHO_MAU.map(([soCt, ngayCt, ten, gt], i) => ({ key: `mau-${i}`, soCt, ngayCt, ten, gt })),
    ...phieuMoi.flatMap(p => ((p._dong as Row[] | undefined) ?? []).map((d, i) => ({ d, i })).filter(({ d }) => d.ly === LY_CHO)
      .map(({ d, i }) => ({ key: `${p.id}-${i}`, soCt: String(p.so), ngayCt: String(p.ngay), ten: String(d.ten ?? ''), gt: Number(d.tien) || 0, _goc: `/app/${MAN_THU_CHI}/${p.id}` }))),
  ].filter(d => !daTao.has(d.key)).map(d => ({ ...d, chon: true, loai: 'Chi phí trả trước', ngayPb: d.ngayCt, ky: '' })), [phieuMoi])
  const [ds, setDs] = useState(goc)
  const [loi, setLoi] = useState<Set<string>>(new Set())
  const sua = (key: string, p: Partial<DongCho>) => { setDs(x => x.map(d => d.key === key ? { ...d, ...p } : d)); setLoi(l => { const n = new Set(l); n.delete(key); return n }) }

  // Số thẻ nối tiếp các thẻ đã có, chỉ đánh cho dòng được chọn; số tiền mỗi kỳ = số tiền / số kỳ, làm tròn tới đồng
  let thu = soDong
  const rows = ds.map(d => {
    const ky = docSoQT(d.ky), [, mm, yy] = d.ngayCt.split('/')
    return { ...d, soThe: d.chon ? `TPB${yy.slice(2)}${mm}-${String(++thu).padStart(4, '0')}` : '', tienKy: ky > 0 ? Math.round(d.gt / ky) : 0 }
  })
  const chon = rows.filter(r => r.chon)
  const coCcdc = ds.some(d => d.loai === CCDC)
  const tatCa = ds.length > 0 && ds.every(d => d.chon)

  const tao = () => {
    if (!chon.length) { toast('Chọn ít nhất một dòng để ghi tăng thẻ'); return }
    const thieuMa = (r: DongCho) => r.loai === CCDC && !r.ma
    const thieuSl = (r: DongCho) => r.loai === CCDC && docSoQT(r.sl) <= 0
    const sai = chon.filter(r => thieuMa(r) || thieuSl(r) || docSoQT(r.ky) <= 0 || !(ngaySo(r.ngayPb) >= ngaySo(r.ngayCt)))
    if (sai.length) {
      setLoi(new Set(sai.map(r => r.key)))
      const r = sai[0]
      toast(thieuMa(r) ? `${r.soCt} – ${r.ten}: cần chọn mã CCDC` : thieuSl(r) ? `${r.soCt} – ${r.ten}: số lượng CCDC phải lớn hơn 0` : docSoQT(r.ky) <= 0 ? `${r.soCt} – ${r.ten}: cần nhập số kỳ phân bổ`
        : `${r.soCt} – ${r.ten}: ngày bắt đầu phân bổ phải bằng hoặc sau ngày chứng từ ${r.ngayCt}`)
      return
    }
    chon.forEach(r => daTao.add(r.key))
    toast(`Đã ghi tăng ${chon.length} thẻ chi phí phân bổ`)
    onDong()
  }

  return (
    <FormToanMan icon="tool" title="Ghi tăng hàng loạt thẻ chi phí phân bổ" onClose={onDong}
      meta={<span className="muted">Các dòng phiếu chi lý do Chi phí chờ phân bổ chưa tạo thẻ. Mỗi dòng được chọn thành một thẻ.</span>}
      foot={(
        <>
          <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          <span className="grow" />
          <button type="button" className="btn pri" onClick={tao}>Tạo ({chon.length} thẻ)</button>
        </>
      )}>
      <section className="card bang-sua gt-hl">
        {rows.length ? (
          <Table motDong rows={rows} rowCls={r => loi.has(r.key) ? 'gt-hl-loi' : ''}
            sum={{ ten: `Cộng ${chon.length} dòng chọn`, gt: soQT(chon.reduce((s, r) => s + r.gt, 0)), tienKy: soQT(chon.reduce((s, r) => s + r.tienKy, 0)) }}
            cols={[
              { k: 'chon', t: '', w: 36, c: true, r: r => r.key === undefined ? null
                : <input type="checkbox" aria-label={`Chọn ${r.soCt} ${r.ten}`} checked={r.chon} onChange={e => sua(r.key, { chon: e.target.checked })} /> },
              { k: 'soCt', t: 'Số chứng từ', w: 120, r: r => r._goc ? <Link className="tt-mua-so" to={r._goc}>{r.soCt}</Link> : r.soCt },
              { k: 'ngayCt', t: 'Ngày chứng từ', w: 110 },
              { k: 'ten', t: 'Nội dung chi tiết', r: r => r.key === undefined ? <b>{r.ten}</b> : r.ten },
              { k: 'gt', t: 'Số tiền', num: true, w: 130, r: r => r.key === undefined ? <b>{r.gt}</b> : soQT(r.gt) },
              { k: 'loai', t: 'Loại thẻ', w: 170, r: r => r.key === undefined ? null
                : <Select className="inp" value={r.loai} aria-label={`Loại thẻ ${r.ten}`}
                  // Chuyển sang CCDC: số lượng mặc định 1
                  onChange={e => sua(r.key, { loai: e.target.value, ...(e.target.value === CCDC && !r.sl ? { sl: '1' } : {}) })}
                  ds={Object.keys(LOAI_THE).map(l => ({ v: l, t: l }))} /> },
              // Có dòng loại CCDC thì thêm cột như khi ghi tăng thẻ: Mã, Tên, ĐVT, Số lượng, Đơn giá; dòng loại khác để trống
              ...(coCcdc ? [
                { k: 'ma', t: 'Mã CCDC', w: 110, r: (r: Row) => r.key === undefined || r.loai !== CCDC ? null
                  : <ChonDanhMuc dm="ccdc" nhan="công cụ dụng cụ" coMa chiMa className="inp sm" trong="Chọn" value={r.ma ?? ''}
                    ds={CCDC_HANG.map(h => ({ v: h.ma, t: `${h.ma} - ${h.ten}` }))}
                    onChange={(ma, m) => { const h = CCDC_HANG.find(x => x.ma === ma); sua(r.key, { ma, tenCc: h?.ten ?? m?.t.split(' - ').slice(1).join(' - '), dvt: h?.dvt ?? '' }) }} /> },
                { k: 'tenCc', t: 'Tên CCDC', w: 180, r: (r: Row) => r.key === undefined || r.loai !== CCDC ? null
                  : <ONhap v={r.tenCc} ten={`Tên CCDC ${r.ten}`} onDoi={t => sua(r.key, { tenCc: t })} /> },
                { k: 'dvt', t: 'ĐVT', w: 60, r: (r: Row) => r.key === undefined || r.loai !== CCDC ? null : <ONhap v={r.dvt} ten={`ĐVT ${r.ten}`} chiDoc /> },
                { k: 'sl', t: 'Số lượng', num: true, w: 80, r: (r: Row) => r.key === undefined || r.loai !== CCDC ? null
                  : <ONhap v={r.sl} so ten={`Số lượng ${r.ten}`} onDoi={t => sua(r.key, { sl: t })} /> },
                // Số tiền cố định theo chứng từ gốc; đơn giá chỉ đọc = số tiền / số lượng (khi số lượng > 0)
                { k: 'dg', t: 'Đơn giá', num: true, w: 120, r: (r: Row) => r.key === undefined || r.loai !== CCDC ? null
                  : <ONhap v={docSoQT(r.sl) > 0 ? Math.round(r.gt / docSoQT(r.sl) * 100) / 100 : ''} so ten={`Đơn giá ${r.ten}`} chiDoc /> },
              ] : []),
              { k: 'soThe', t: 'Số thẻ', w: 125 },
              { k: 'ngayGt', t: 'Ngày ghi tăng', w: 110, r: r => r.key === undefined ? null : r.ngayCt },
              { k: 'ngayPb', t: 'Ngày bắt đầu phân bổ', w: 130, r: r => r.key === undefined ? null
                : <ONhap v={r.ngayPb} ten={`Ngày bắt đầu phân bổ ${r.ten}`} onDoi={s => sua(r.key, { ngayPb: s })} /> },
              { k: 'ky', t: 'Số kỳ phân bổ', num: true, w: 100, r: r => r.key === undefined ? null
                : <ONhap v={r.ky} so ten={`Số kỳ phân bổ ${r.ten}`} onDoi={s => sua(r.key, { ky: s })} /> },
              { k: 'tienKy', t: 'Số tiền phân bổ hằng kỳ', num: true, w: 150, r: r => r.key === undefined ? <b>{r.tienKy}</b> : <ONhap v={r.tienKy} so ten="Số tiền phân bổ hằng kỳ" chiDoc /> },
            ]} />
        ) : <div className="empty"><b>Không còn dòng phiếu chi chờ phân bổ nào chưa tạo thẻ</b></div>}
        {rows.length > 0 && (
          <label className="row gt-hl-chon">
            <input type="checkbox" checked={tatCa} onChange={e => setDs(x => x.map(d => ({ ...d, chon: e.target.checked })))} />
            <span>Chọn tất cả ({ds.length} dòng)</span>
          </label>
        )}
      </section>
    </FormToanMan>
  )
}
