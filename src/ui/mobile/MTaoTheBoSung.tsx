// Tạo thẻ bổ sung trên điện thoại (T827), như Ghi tăng bổ sung trên web: các khoản chi phí chờ phân bổ chưa có thẻ
// (phiếu chi, hoá đơn mua hàng lý do Chi phí phân bổ nhiều kỳ, tới hết kỳ đang xem). Mỗi chứng từ gốc một thẻ, mỗi dòng một mục
// (Loại thẻ, ngày phân bổ chung, mỗi mục một số tháng), như web (T828).
import { useMemo, useState, type FC } from 'react'
import { useSession } from '../../app/session'
import { danhDauDaTao, theCuaDong, useDongCho, type DongGoc } from '../../modules/ccdc/GhiTangHangLoat'
import { loaiTheTheoGoi, soTheKeTiep } from '../../modules/ccdc/the-phan-bo'
import { MAN_HDM } from '../../modules/mua-hang/hoa-don-mua'
import { suaPhieu } from '../generic/daXoa'
import { money } from '../format'
import { LichDon } from '../ChonNgay'
import { MChon } from './MChon'
import type { TheMobile } from './MThePhanBo'

const CCDC = 'Công cụ dụng cụ'
const thangCua = (ngay: string) => { const m = ngay.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); return m ? +m[3] * 100 + +m[2] : 0 }
const ngaySo = (d: string) => { const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); return m ? +m[3] * 10000 + +m[2] * 100 + +m[1] : NaN }

interface Muc { key: string; ten: string; gt: number; ma?: string; dvt?: string; sl?: string; ky: string }
interface Nhom { key: string; chon: boolean; laHd: boolean; soCt: string; ngayCt: string; cn: string; _goc?: string; loai: string; ngayPb: string; muc: Muc[] }

/** Khoản chờ tạo thẻ tới hết kỳ yyyymm (gồm kỳ trước), như dải cảnh báo web */
export function useKhoanCho(ky: number): DongGoc[] {
  const ds = useDongCho()
  return ds.filter(d => thangCua(d.ngayCt) <= ky)
}

/** Gom khoản chờ thành thẻ: các dòng của cùng một chứng từ gốc chung một thẻ (T828) */
function gomNhom(ds: DongGoc[], cnMacDinh: string, loaiCo: string[]): Nhom[] {
  const map = new Map<string, Nhom>()
  for (const d of ds) {
    const laHd = Boolean(d._goc?.startsWith(`/app/${MAN_HDM}/`))
    const k = theCuaDong(d)
    const muc: Muc = { key: d.key, ten: d.tenCc || d.ten, gt: d.gt, ma: d.ma, dvt: d.dvt, sl: d.sl, ky: '' }
    const n = map.get(k)
    if (n) { n.muc.push(muc); continue }
    map.set(k, { key: k, chon: true, laHd, soCt: d.soCt, ngayCt: d.ngayCt, cn: d.cn || cnMacDinh, _goc: d._goc, loai: '', ngayPb: d.ngayCt, muc: [muc] })
  }
  // Mọi dòng có mã công cụ dụng cụ thì thẻ mặc định loại CCDC (T822); loại không có trong gói thì về Chi phí trả trước
  return [...map.values()].map(n => {
    const loai = ds.filter(d => n.muc.some(m => m.key === d.key)).every(d => d.loai === CCDC) ? CCDC : 'Chi phí trả trước'
    return { ...n, loai: loaiCo.includes(loai) ? loai : loaiCo[0] }
  })
}

export const MTaoTheBoSung: FC<{ ky: number; cnMacDinh: string; dsSoThe: string[]; onDong: () => void; onTao: (ds: TheMobile[]) => void }> = ({ ky, cnMacDinh, dsSoThe, onDong, onTao }) => {
  const { s, toast } = useSession()
  const khoan = useKhoanCho(ky)
  const loaiCo = loaiTheTheoGoi(s.goi)
  const [ds, setDs] = useState<Nhom[]>(() => gomNhom(khoan, cnMacDinh, loaiCo))
  const [loi, setLoi] = useState<Set<string>>(new Set())
  const [chonLoai, setChonLoai] = useState<string | null>(null)
  const [lichPb, setLichPb] = useState<string | null>(null)

  const sua = (k: string, p: Partial<Nhom>) => { setDs(x => x.map(n => n.key === k ? { ...n, ...p } : n)); setLoi(l => { const m = new Set(l); m.delete(k); return m }) }
  const suaKy = (k: string, mk: string, v: string) => sua(k, { muc: ds.find(n => n.key === k)!.muc.map(m => m.key === mk ? { ...m, ky: v.replace(/\D/g, '').slice(0, 3) } : m) })

  // Số thẻ nối tiếp theo tháng ghi tăng (ngày chứng từ), chỉ đánh cho thẻ được chọn, như web (T284)
  const soThe = useMemo(() => {
    const daDanh: unknown[] = [...dsSoThe]
    const kq = new Map<string, string>()
    ds.forEach(n => { if (!n.chon) return; const so = soTheKeTiep(daDanh, 'the', n.ngayCt); daDanh.push(so); kq.set(n.key, so) })
    return kq
  }, [ds, dsSoThe])
  const chon = ds.filter(n => n.chon)
  const tongChon = chon.reduce((a, n) => a + n.muc.reduce((b, m) => b + m.gt, 0), 0)
  const soKhoanChon = chon.reduce((a, n) => a + n.muc.length, 0)
  const tatCa = ds.length > 0 && ds.every(n => n.chon)

  const tao = () => {
    if (!chon.length) { toast('Chọn ít nhất một khoản để tạo thẻ'); return }
    const sai = chon.filter(n => n.muc.some(m => !(Number(m.ky) > 0)) || !(ngaySo(n.ngayPb) >= ngaySo(n.ngayCt)))
    if (sai.length) {
      setLoi(new Set(sai.map(n => n.key)))
      const n = sai[0]
      toast(n.muc.some(m => !(Number(m.ky) > 0)) ? `${n.soCt}: nhập số tháng phân bổ` : `${n.soCt}: ngày bắt đầu phân bổ phải bằng hoặc sau ngày chứng từ ${n.ngayCt}`)
      return
    }
    const the: TheMobile[] = chon.map(n => {
      const gt = n.muc.reduce((a, m) => a + m.gt, 0)
      const ten = n.muc.length === 1 ? n.muc[0].ten : n.muc.length === 2 ? `${n.muc[0].ten} và ${n.muc[1].ten}` : `${n.muc[0].ten} và ${n.muc.length - 1} mục khác`
      return {
        soThe: soThe.get(n.key)!, loai: n.loai, ngay: n.ngayCt, ngayPb: n.ngayPb, ten, cn: n.cn, gt, ky: Math.max(...n.muc.map(m => Number(m.ky))),
        soCt: n.soCt, ngayCt: n.ngayCt, ghiChuCt: ten, _goc: n._goc ?? '',
        dong: n.muc.map(m => {
          const sl = Number(m.sl) > 0 ? Number(m.sl) : 1
          return { ...(m.ma ? { ma: m.ma, _maTay: true } : {}), ten: m.ten, ...(m.dvt ? { dvt: m.dvt } : {}), gt: m.gt, ky: Number(m.ky), sl, dg: Math.round(m.gt / sl), ngayPb: n.ngayPb }
        }),
      }
    })
    // Đánh dấu khoản đã có thẻ; ghi số thẻ vào chứng từ gốc để chứng từ hiện Thẻ chi phí (như web T168, T421)
    danhDauDaTao(chon.flatMap(n => n.muc.map(m => m.key)))
    const theoGoc = new Map<string, string[]>()
    chon.forEach(n => { if (n._goc) theoGoc.set(n._goc, [...(theoGoc.get(n._goc) ?? []), soThe.get(n.key)!]) })
    theoGoc.forEach((so, goc) => { const m = goc.match(/^\/app\/(.+)\/([^/]+)$/); if (m) suaPhieu(m[1], m[2], { _theCp: so }) })
    toast(`Đã tạo ${the.length} thẻ chi phí phân bổ`)
    onTao(the)
  }

  const nhomChonLoai = ds.find(n => n.key === chonLoai)
  const nhomLich = ds.find(n => n.key === lichPb)

  return (
    <div className="m-pb-man">
      <header className="m-pb-thanh-dau">
        <button type="button" className="m-pb-btn-back" onClick={onDong} aria-label="Quay lại">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="m-pb-tieu-de">Tạo thẻ bổ sung</h1>
        <span className="m-pb-thanh-dau-phai" />
      </header>

      <div className="m-pb-noi-dung">
        <div className="m-t827-dau">
          <span>{khoan.length} khoản chờ tạo thẻ</span>
          {ds.length > 0 && (
            <button type="button" onClick={() => setDs(x => x.map(n => ({ ...n, chon: !tatCa })))}>{tatCa ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</button>
          )}
        </div>
        {!ds.length && <div className="m-t827-trong">Chưa có khoản chi phí chờ phân bổ nào</div>}
        {ds.map(n => {
          const tong = n.muc.reduce((a, m) => a + m.gt, 0)
          const nhieu = n.muc.length > 1
          return (
            <div key={n.key} className={`m-t827-the${n.chon ? ' chon' : ''}${loi.has(n.key) ? ' loi' : ''}`}>
              <div className={`m-t827-the-dau${nhieu ? ' nhom' : ''}`}>
                <button type="button" role="checkbox" aria-checked={n.chon} aria-label={`Chọn ${n.soCt}`} className={`m-t827-tich${n.chon ? ' on' : ''}`} onClick={() => sua(n.key, { chon: !n.chon })}>
                  {n.chon && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>}
                </button>
                <div className="m-t827-ten">
                  {nhieu ? (
                    <><b>{n.soCt}</b><span>{n.laHd ? 'Hoá đơn mua hàng · ' : ''}{n.ngayCt} · {n.muc.length} dòng</span></>
                  ) : (
                    <><b>{n.muc[0].ten}</b><span>{n.soCt} · {n.ngayCt}{n.muc[0].ma ? ` · Mã ${n.muc[0].ma}` : ''}</span></>
                  )}
                </div>
                <b className="m-t827-tien">{money(tong)}</b>
              </div>
              {n.chon && (
                <div className="m-t827-than">
                  {nhieu && <div className="m-t827-mot">Một thẻ, {n.muc.length} mục phân bổ <span>· {soThe.get(n.key)}</span></div>}
                  <div className="m-t827-luoi">
                    <div><span>Loại thẻ</span><button type="button" onClick={() => setChonLoai(n.key)}>{n.loai}</button></div>
                    <div><span>Phân bổ từ ngày</span><button type="button" onClick={() => setLichPb(n.key)}>{n.ngayPb}</button></div>
                  </div>
                  {n.muc.map((m, i) => (
                    <div key={m.key} className="m-t827-muc">
                      {nhieu && <div className="m-t827-muc-ten"><span><b>Mục {i + 1}</b> · {m.ten}</span><b>{money(m.gt)}</b></div>}
                      <div className="m-t827-muc-ky">
                        <span>{nhieu && m.ma ? `${m.ma} · ` : ''}{Number(m.ky) > 0 ? `Mỗi tháng ${money(Math.round(m.gt / Number(m.ky)))} đ` : 'Số tháng phân bổ *'}</span>
                        <label className={!(Number(m.ky) > 0) && loi.has(n.key) ? 'loi' : ''}>
                          <input type="text" inputMode="numeric" aria-label={`Số tháng phân bổ ${m.ten}`} placeholder="Nhập" value={m.ky} onChange={e => suaKy(n.key, m.key, e.target.value)} />
                          tháng
                        </label>
                      </div>
                    </div>
                  ))}
                  {!nhieu && <div className="m-t827-so">{soThe.get(n.key)}</div>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="m-t827-tong"><span>Đã chọn {soKhoanChon} khoản · {chon.length} thẻ</span><b>{money(tongChon)} đ</b></div>
      <div className="m-pb-day">
        <button type="button" className="m-pb-btn-huy" onClick={onDong}>Huỷ</button>
        <button type="button" className="m-pb-btn-luu" onClick={tao}>Tạo {chon.length} thẻ</button>
      </div>

      <MChon
        mo={Boolean(nhomChonLoai)}
        onDong={() => setChonLoai(null)}
        tieuDe="Loại thẻ"
        ds={loaiCo.map(k => ({ k, ten: k }))}
        chon={nhomChonLoai?.loai}
        onChon={k => { if (nhomChonLoai) sua(nhomChonLoai.key, { loai: k }); setChonLoai(null) }}
      />
      {nhomLich && (
        <LichDon value={nhomLich.ngayPb} onChange={v => sua(nhomLich.key, { ngayPb: v })} onDong={() => setLichPb(null)} />
      )}
    </div>
  )
}
