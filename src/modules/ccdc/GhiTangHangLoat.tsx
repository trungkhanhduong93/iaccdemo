// Ghi tăng thẻ chi phí phân bổ (nút Ghi tăng, trước là Ghi tăng hàng loạt): các dòng phiếu chi, hoá đơn mua hàng (T822) lý do Chi phí phân bổ nhiều kỳ chưa thành thẻ.
// Mỗi dòng thành một thẻ: chọn loại thẻ, ngày bắt đầu phân bổ, số kỳ; số thẻ tự sinh, số tiền mỗi kỳ tự tính. Bấm Tạo để ghi tăng.
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Row } from '../types'
import { useSession } from '../../app/session'
import { FormToanMan } from '../../ui/FormToanMan'
import { Table } from '../../ui/Table'
import { Select } from '../../ui/Dropdown'
import { docSoQT, money, short, soQT } from '../../ui/format'
import { apKhoPhieu, suaPhieu, useDaXoa } from '../../ui/generic/daXoa'
import { ONhap, loaiTheTheoGoi, soTheKeTiep } from './the-phan-bo'
import { ChonDanhMuc } from '../../ui/ChonDanhMuc'
import { CCDC_HANG, MA_LY_CHO_PHAN_BO } from '../../data/mock'
import { laLyPhanBo, laMaCcdc } from '../../ui/generic/danhMucStore'
import { coTrongGoi } from '../../app/plan'
import { MAN_HDM, hoaDonMuaMau } from '../mua-hang/hoa-don-mua'

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

export type DongGoc = Pick<DongCho, 'key' | 'soCt' | 'ngayCt' | 'ten' | 'gt' | '_goc'> & Partial<Pick<DongCho, 'loai' | 'ma' | 'tenCc' | 'dvt' | 'sl'>> & { cn?: string }   // cn: cửa hàng của chứng từ, điện thoại tạo thẻ đúng cửa hàng (T827)

/** Hoá đơn mua hàng mẫu, sinh một lần */
let hdmMau: Row[] | undefined

/** Dòng chờ phân bổ của các chứng từ chưa có thẻ: dòng lý do tích Chi phí phân bổ nhiều kỳ (T700).
 *  Dòng hàng loại Công cụ dụng cụ (hoá đơn mua hàng) thì mặc định thẻ CCDC, mang Mã, Tên, ĐVT, Số lượng (T822) */
function dongChoCua(man: string, phieu: Row[], s: Parameters<typeof laLyPhanBo>[1]): DongGoc[] {
  return phieu.filter(p => !(Array.isArray(p._theCp) && p._theCp.length)).flatMap(p => ((p._dong as Row[] | undefined) ?? []).map((d, i) => ({ d, i }))
    .filter(({ d }) => laLyPhanBo(String(d.ly ?? p._lyDo ?? ''), s))
    .map(({ d, i }) => ({
      key: `${man}|${p.id}-${i}`, cn: String(p.cn ?? ''), soCt: String(p.so), ngayCt: String(p.ngay).split(' ')[0], ten: String(d.ten ?? ''), gt: Number(d.tien) || 0, _goc: `/app/${man}/${p.id}`,
      ...(laMaCcdc(d.ma) ? { loai: CCDC, ma: String(d.ma), tenCc: String(d.ten ?? ''), dvt: String(d.dvt ?? ''), sl: String(d.sl || 1) } : {}),
    })))
}

/** Dòng chờ: mẫu cộng các phiếu chi lưu trong phiên có dòng lý do tích Chi phí phân bổ nhiều kỳ (T700), bỏ dòng đã tạo thẻ.
 *  Dùng chung cho form Ghi tăng và cảnh báo ở danh sách thẻ (T287); tính lại mỗi lần vẽ vì daTao đổi khi tạo thẻ */
export function useDongCho(): DongGoc[] {
  const { s } = useSession()
  const { phieuMoi: moi, apSua } = useDaXoa(MAN_THU_CHI)
  useDaXoa(MAN_HDM)   // tính lại khi lập, sửa, xoá hoá đơn mua hàng
  // Phiếu đã có thẻ (tạo ngay khi lưu phiếu, T419) thì không còn là khoản chờ
  // Hoá đơn mua hàng (mẫu, lập thêm, đã sửa, bỏ đã xoá) chỉ ở gói có màn này (T822)
  const hoaDon = coTrongGoi('4.1.2', s.goi) ? apKhoPhieu(MAN_HDM, hdmMau ??= hoaDonMuaMau()) : []
  return [
    ...CHO_MAU.map(([soCt, ngayCt, ten, gt], i): DongGoc => ({ key: `mau-${i}`, soCt, ngayCt, ten, gt })),
    ...dongChoCua(MAN_THU_CHI, moi.map(apSua), s),
    ...dongChoCua(MAN_HDM, hoaDon, s),
  ].filter(d => !daTao.has(d.key))
}

/** Thẻ của dòng chờ: mỗi chứng từ gốc một thẻ, mỗi dòng chứng từ một mục chi tiết của thẻ (T828, web và điện thoại) */
export const theCuaDong = (d: { _goc?: string; soCt: string }) => d._goc || `ct:${d.soCt}`

/** Đánh dấu dòng chờ đã tạo thẻ, dùng ở màn Tạo thẻ bổ sung trên điện thoại (T827) */
export function danhDauDaTao(keys: string[]) { keys.forEach(k => daTao.add(k)) }

/** Các bước lập thẻ cho người ít nghiệp vụ, mở từ link Cách làm ở dải cảnh báo (T287) */
const CACH_LAM = (
  <div className="cach-lam">
    <b>Lập thẻ chi phí phân bổ</b>
    <ol>
      <li>Lập phiếu chi, lý do <b>Chi phí chờ phân bổ</b>:{' '}
        <Link to={`/app/${MAN_THU_CHI}/moi?loai=chi&ly=${MA_LY_CHO_PHAN_BO}`}>Chi tiền mặt</Link> ·{' '}
        <Link to={`/app/${MAN_THU_CHI}/moi?loai=unc&ly=${MA_LY_CHO_PHAN_BO}`}>Chi ngân hàng</Link></li>
      <li>Lưu phiếu, bấm <b>Tiếp tục</b> ở thông báo: chọn Loại thẻ, nhập Số tháng phân bổ, bấm Lưu.</li>
      <li>Khoản nào còn sót chưa có thẻ: bấm <b>Ghi tăng bổ sung</b>, điền thông số từng khoản rồi bấm Tạo.</li>
    </ol>
  </div>
)

/** Khoản chờ phân bổ chưa ghi tăng thẻ tới hết kỳ yyyymm (gồm kỳ trước), dùng ở bước kiểm tra Khoá sổ gói Free (T315) */
export function useChoGhiTang(ky: number) {
  const ds = useDongCho().filter(d => Math.floor(ngaySo(d.ngayCt) / 100) <= ky)
  return { so: ds.length, tong: ds.reduce((s, d) => s + d.gt, 0) }
}

/** Dải trên danh sách thẻ (T287): còn khoản chờ phân bổ chưa tạo thẻ (ngày chứng từ tới hết kỳ số liệu yyyymm, gồm khoản tồn kỳ trước)
 *  thì cảnh báo vàng; hết thì gợi ý xám cách lập thẻ. Cả hai có link Cách làm */
export function useCanhBaoCho(ky: number) {
  const ds = useDongCho().filter(d => Math.floor(ngaySo(d.ngayCt) / 100) <= ky)
  if (!ds.length) return {
    so: 0, cachLam: CACH_LAM,
    noiDung: <>Có khoản chi cần phân bổ nhiều kỳ? Lập phiếu chi với lý do <b>Chi phí chờ phân bổ</b>, lưu xong phần mềm mở tạo thẻ.</>,
  }
  const truoc = ds.filter(d => Math.floor(ngaySo(d.ngayCt) / 100) < ky).length
  return {
    so: ds.length, cachLam: CACH_LAM,
    noiDung: <>
      <b>Còn {ds.length} khoản chi phí chờ phân bổ chưa tạo thẻ</b> · tổng {money(ds.reduce((s, d) => s + d.gt, 0))}
      {truoc > 0 && <> · trong đó {truoc} khoản từ kỳ trước</>}.
    </>,
    hanhDong: { nhan: 'Ghi tăng bổ sung', to: '?moi=hang-loat' },
    gon: <><b>{ds.length} khoản chờ tạo thẻ</b> · {short(ds.reduce((s, d) => s + d.gt, 0))}</>,   // chữ ngắn trong thanh công cụ (T429)
  }
}

export function GhiTangHangLoat({ rows: daCo, onDong }: { soDong: number; rows: Row[]; onDong: () => void }) {
  const { s, toast } = useSession()
  const dongCho = useDongCho()
  // Loại thẻ chung cho cả chứng từ: mọi dòng là công cụ dụng cụ thì CCDC, còn lại Chi phí trả trước (T828)
  const goc = useMemo((): DongCho[] => dongCho.map(d => {
    const cung = dongCho.filter(x => theCuaDong(x) === theCuaDong(d))
    return { ...d, chon: true, loai: cung.every(x => x.loai === CCDC) ? CCDC : 'Chi phí trả trước', ngayPb: d.ngayCt, ky: '' }
  }), [])
  const [ds, setDs] = useState(goc)
  const [loi, setLoi] = useState<Set<string>>(new Set())
  // Đổi loại thẻ ở một dòng thì đổi cả các dòng cùng chứng từ (cùng một thẻ, T828); chuyển sang CCDC thì số lượng mặc định 1
  const sua = (key: string, p: Partial<DongCho>) => {
    setDs(x => {
      const g = x.find(d => d.key === key)
      return x.map(d => d.key === key ? { ...d, ...p }
        : p.loai !== undefined && g && theCuaDong(d) === theCuaDong(g) ? { ...d, loai: p.loai, ...(p.loai === CCDC && !d.sl ? { sl: '1' } : {}) } : d)
    })
    setLoi(l => { const n = new Set(l); n.delete(key); return n })
  }

  // Số thẻ theo Cấu hình kế toán TPB{YY}{MM}-{0000}, tháng theo ngày chứng từ, nối tiếp số đã có cùng tháng (gồm cả số vừa đánh cho dòng trên);
  // chỉ đánh cho dòng được chọn; các dòng cùng chứng từ chung một số thẻ (T828); số tiền mỗi kỳ = số tiền / số kỳ, làm tròn tới đồng (T284)
  const daDanh: unknown[] = daCo.map(r => r.soThe)
  const soTheNhom = new Map<string, string>()
  const nhomChon = new Set(ds.filter(d => d.chon).map(theCuaDong))   // thẻ có ít nhất một dòng được chọn: mọi dòng của thẻ hiện số thẻ ở ô gộp
  const dauThe = new Set(ds.filter((d, i) => i === 0 || theCuaDong(ds[i - 1]) !== theCuaDong(d)).map(d => d.key))
  const rows = ds.map(d => {
    const ky = docSoQT(d.ky)
    const g = theCuaDong(d)
    let soThe = ''
    if (nhomChon.has(g)) {
      soThe = soTheNhom.get(g) ?? soTheKeTiep(daDanh, 'the', d.ngayCt)
      if (!soTheNhom.has(g)) { soTheNhom.set(g, soThe); daDanh.push(soThe) }
    }
    return { ...d, soThe, tienKy: ky > 0 ? Math.round(d.gt / ky) : 0 }
  })
  const chon = rows.filter(r => r.chon)
  const soTheChon = soTheNhom.size
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
    // Ghi số thẻ vào phiếu chi gốc để phiếu hiện dòng Thẻ chi phí (T168, T421)
    const theoPhieu = new Map<string, string[]>()
    chon.forEach(r => { if (r._goc && !theoPhieu.get(r._goc)?.includes(r.soThe)) theoPhieu.set(r._goc, [...(theoPhieu.get(r._goc) ?? []), r.soThe]) })
    theoPhieu.forEach((so, goc) => { const m = goc.match(/^\/app\/(.+)\/([^/]+)$/); if (m) suaPhieu(m[1], m[2], { _theCp: so }) })
    toast(`Đã ghi tăng ${soTheChon} thẻ chi phí phân bổ`)
    onDong()
  }

  return (
    <FormToanMan icon="phanbo" iconNet title="Ghi tăng thẻ chi phí phân bổ" onClose={onDong}
      meta={<span className="muted">Danh sách lấy từ các phiếu chi{coTrongGoi('4.1.2', s.goi) ? ', hoá đơn mua hàng' : ''} có lý do chi phí chờ phân bổ chưa tạo thẻ. Mỗi chứng từ một thẻ, mỗi dòng một mục chi tiết của thẻ.</span>}
      foot={(
        <>
          <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          <span className="grow" />
          <button type="button" className="btn pri" onClick={tao}>Tạo ({soTheChon} thẻ)</button>
        </>
      )}>
      <section className="card bang-sua gt-hl">
        {rows.length ? (
          <Table motDong rows={rows} rowCls={r => [loi.has(r.key) ? 'gt-hl-loi' : '', dauThe.has(r.key) ? 'gt-hl-dau' : ''].join(' ')}
            gopO={r => r.key === undefined ? undefined : theCuaDong(r as DongCho)}   // thông tin chung của một thẻ gộp một ô cho các dòng của thẻ (T828)
            sum={{ ten: `Cộng ${soTheChon} thẻ chọn (${chon.length} dòng)`, gt: soQT(chon.reduce((s, r) => s + r.gt, 0)), tienKy: soQT(chon.reduce((s, r) => s + r.tienKy, 0)) }}
            cols={[
              // Tích theo thẻ (T828): một ô gộp cho các dòng của thẻ, chọn hoặc bỏ cả thẻ
              { k: 'chon', t: '', w: 36, c: true, gop: true, r: r => r.key === undefined ? null
                : <input type="checkbox" aria-label={`Chọn thẻ của ${r.soCt}`} checked={r.chon}
                  onChange={e => { const g = theCuaDong(r as DongCho), on = e.target.checked; setDs(x => x.map(d => theCuaDong(d) === g ? { ...d, chon: on } : d)) }} /> },
              { k: 'soCt', t: 'Số chứng từ', w: 120, gop: true, r: r => r._goc ? <Link className="tt-mua-so" to={r._goc}>{r.soCt}</Link> : r.soCt },
              { k: 'ngayCt', t: 'Ngày chứng từ', w: 110, gop: true },
              { k: 'ten', t: 'Nội dung chi tiết', r: r => r.key === undefined ? <b>{r.ten}</b> : r.ten },
              { k: 'gt', t: 'Số tiền', num: true, w: 130, r: r => r.key === undefined ? <b>{r.gt}</b> : soQT(r.gt) },
              { k: 'loai', t: 'Loại thẻ', w: 170, gop: true, r: r => r.key === undefined ? null
                : <Select className="inp" value={r.loai} aria-label={`Loại thẻ của ${r.soCt}`}
                  // Chuyển sang CCDC: số lượng mặc định 1
                  onChange={e => sua(r.key, { loai: e.target.value, ...(e.target.value === CCDC && !r.sl ? { sl: '1' } : {}) })}
                  ds={loaiTheTheoGoi(s.goi).map(l => ({ v: l, t: l }))} /> },
              // Có dòng loại CCDC thì thêm cột như khi ghi tăng thẻ: Mã, Tên, ĐVT, Số lượng, Đơn giá; dòng loại khác để trống
              ...(coCcdc ? [
                { k: 'ma', t: 'Mã CCDC', w: 110, r: (r: Row) => r.key === undefined || r.loai !== CCDC ? null
                  : <ChonDanhMuc dm="ccdc" nhan="công cụ dụng cụ" coMa chiMa className="inp sm" trong="Chọn" value={r.ma ?? ''} gon
                    ds={CCDC_HANG.map(h => ({ v: h.ma, t: `${h.ma} - ${h.ten}` }))}
                    onChange={(ma, m) => { const h = CCDC_HANG.find(x => x.ma === ma); sua(r.key, { ma, tenCc: h?.ten ?? m?.t.split(' - ').slice(1).join(' - '), dvt: h?.dvt ?? m?.dvt ?? '' }) }} /> },
                { k: 'tenCc', t: 'Tên CCDC', w: 180, r: (r: Row) => r.key === undefined || r.loai !== CCDC ? null
                  : <ONhap v={r.tenCc} ten={`Tên CCDC ${r.ten}`} onDoi={t => sua(r.key, { tenCc: t })} /> },
                { k: 'dvt', t: 'ĐVT', w: 60, r: (r: Row) => r.key === undefined || r.loai !== CCDC ? null : <ONhap v={r.dvt} ten={`ĐVT ${r.ten}`} chiDoc /> },
                { k: 'sl', t: 'Số lượng', num: true, w: 80, r: (r: Row) => r.key === undefined || r.loai !== CCDC ? null
                  : <ONhap v={r.sl} so ten={`Số lượng ${r.ten}`} onDoi={t => sua(r.key, { sl: t })} /> },
                // Số tiền cố định theo chứng từ gốc; đơn giá chỉ đọc = số tiền / số lượng (khi số lượng > 0)
                { k: 'dg', t: 'Đơn giá', num: true, w: 120, r: (r: Row) => r.key === undefined || r.loai !== CCDC ? null
                  : <ONhap v={docSoQT(r.sl) > 0 ? Math.round(r.gt / docSoQT(r.sl) * 100) / 100 : ''} so ten={`Đơn giá ${r.ten}`} chiDoc /> },
              ] : []),
              { k: 'soThe', t: 'Số thẻ', w: 125, gop: true },
              { k: 'ngayGt', t: 'Ngày ghi tăng', w: 110, gop: true, r: r => r.key === undefined ? null : r.ngayCt },
              { k: 'ngayPb', t: 'Ngày bắt đầu phân bổ', w: 130, r: r => r.key === undefined ? null
                : <ONhap v={r.ngayPb} ten={`Ngày bắt đầu phân bổ ${r.ten}`} onDoi={s => sua(r.key, { ngayPb: s })} /> },
              { k: 'ky', t: 'Số kỳ phân bổ', num: true, w: 100, r: r => r.key === undefined ? null
                : <ONhap v={r.ky} so ten={`Số kỳ phân bổ ${r.ten}`} onDoi={s => sua(r.key, { ky: s })} /> },
              { k: 'tienKy', t: 'Số tiền phân bổ hằng kỳ', num: true, w: 150, r: r => r.key === undefined ? <b>{r.tienKy}</b> : <ONhap v={r.tienKy} so ten="Số tiền phân bổ hằng kỳ" chiDoc /> },
            ]} />
        ) : <div className="empty"><b>Chưa có khoản chi phí chờ phân bổ nào</b></div>}
        {rows.length > 0 && (
          <label className="row gt-hl-chon">
            <input type="checkbox" checked={tatCa} onChange={e => setDs(x => x.map(d => ({ ...d, chon: e.target.checked })))} />
            <span>Chọn tất cả ({new Set(ds.map(theCuaDong)).size} thẻ)</span>
          </label>
        )}
      </section>
    </FormToanMan>
  )
}
