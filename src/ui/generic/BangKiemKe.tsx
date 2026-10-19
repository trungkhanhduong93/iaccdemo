// Bảng chi tiết phiếu kiểm kê (T124): tồn hệ thống, tồn thực tế, chênh lệch và loại xử lý của từng mặt hàng.
// Kho chọn ở đầu phiếu nên bảng không có cột Kho; không có số tiền, thuế
import { useEffect, useState } from 'react'
import { NVL } from '../../data/mock'
import { ChonDanhMuc } from '../ChonDanhMuc'
import { Icon } from '../Icon'
import { money } from '../format'
import { OLoc, dangLoc, dsGiaTri, khopLoc, type GiaTriLoc, type KieuLoc, type LocCot } from '../LocCot'
import type { Dong } from './gen'
import { ThemHangLoat } from './ThemHangLoat'

/** Các cột ẩn hiện được qua Tuỳ chỉnh giao diện phiếu */
export const COT_KK: [string, string][] = [
  ['ma', 'Mã hàng'], ['dvt', 'ĐVT'], ['tonHt', 'Tồn hệ thống'], ['tonTt', 'Tồn thực tế'], ['chenh', 'Chênh lệch'], ['loaiXl', 'Loại'], ['ghiChu', 'Ghi chú'],
]

/** Tồn thực tế trừ tồn hệ thống: âm là thiếu, dương là thừa */
const chenhCua = (d: Dong) => (d.tonTt ?? 0) - (d.tonHt ?? 0)
/** Thiếu thì xuất điều chỉnh, thừa thì nhập điều chỉnh, khớp thì không xử lý */
export const loaiXuLy = (d: Dong) => { const c = chenhCua(d); return c < 0 ? 'Xuất điều chỉnh' : c > 0 ? 'Nhập điều chỉnh' : '' }

/** Ô nhập số lượng: gõ số thô, rời ô hiện có dấu chấm */
function OSl({ val, onChange }: { val: number; onChange: (v: number) => void }) {
  const [focus, setFocus] = useState(false)
  const [str, setStr] = useState(String(val))
  useEffect(() => { if (!focus) setStr(String(val)) }, [val, focus])
  return (
    <input type="text" className="inp sm num" value={focus ? str : money(val)}
      onFocus={() => { setFocus(true); setStr(val ? String(val) : '') }}
      onChange={e => setStr(e.target.value.replace(/[^0-9.]/g, ''))}
      onBlur={() => { setFocus(false); onChange(parseFloat(str) || 0) }} />
  )
}

export function BangKiemKe({ dong, onChange, cheDo, an = [], khongTong = false, hienLoc = false }: {
  dong: Dong[]; onChange?: (ds: Dong[]) => void; cheDo: 'xem' | 'sua'; an?: string[]; khongTong?: boolean
  hienLoc?: boolean   // hàng lọc như danh sách chứng từ, bấm phễu sau tab mới hiện (T383)
}) {
  const hien = (k: string) => !an.includes(k)
  const sua = cheDo === 'sua' && Boolean(onChange)
  const capNhat = (i: number, p: Partial<Dong>) => onChange?.(dong.map((d, j) => (j === i ? { ...d, ...p } : d)))
  const chonMa = (i: number, ma: string) => {
    const h = NVL.find(x => x.ma === ma)
    if (h) capNhat(i, { ma: h.ma, ten: h.ten, dvt: h.dvt })
  }
  const themDong = () => {
    const h = NVL[0]
    onChange?.([...dong, { ma: h.ma, ten: h.ten, dvt: h.dvt, sl: 0, gia: 0, tien: 0, ts: 0, thue: 0, tonHt: 0, tonTt: 0, ghiChu: '' }])
  }
  // Thêm hàng loạt (T465): mỗi nguyên vật liệu đã tích thành một dòng như Thêm dòng
  const [moHangLoat, setMoHangLoat] = useState(false)
  const tong = (f: (d: Dong) => number) => dong.reduce((a, d) => a + f(d), 0)
  const soCotDau = 2 + Number(hien('ma')) + Number(hien('dvt'))
  // Lọc dòng (T383): [khoá, tên cột, có hiện, chữ của dòng, số của dòng (cột số)]
  const [gtLoc, setGtLoc] = useState<Record<string, GiaTriLoc>>({})
  useEffect(() => { if (!hienLoc) setGtLoc({}) }, [hienLoc])
  const cotLoc: [string, string, boolean, (d: Dong) => string, ((d: Dong) => number)?][] = [
    ['ma', 'Mã hàng', hien('ma'), d => d.ma ?? ''], ['ten', 'Tên hàng hoá', true, d => d.ten ?? ''], ['dvt', 'ĐVT', hien('dvt'), d => d.dvt ?? ''],
    ['tonHt', 'Tồn hệ thống', hien('tonHt'), d => money(d.tonHt ?? 0), d => d.tonHt ?? 0],
    ['tonTt', 'Tồn thực tế', hien('tonTt'), d => money(d.tonTt ?? 0), d => d.tonTt ?? 0],
    ['chenh', 'Chênh lệch', hien('chenh'), d => money(chenhCua(d)), chenhCua],
    ['loaiXl', 'Loại', hien('loaiXl'), d => loaiXuLy(d) || 'Khớp'], ['ghiChu', 'Ghi chú', hien('ghiChu'), d => d.ghiChu ?? ''],
  ]
  const kieuLoc = (k: string): KieuLoc => cotLoc.find(c => c[0] === k)?.[4] ? 'so' : 'chon'   // cột chữ lọc kiểu chọn (T466)
  const loc: LocCot = { gt: gtLoc, dat: (k, g) => setGtLoc(t => ({ ...t, [k]: g })), kieu: c => kieuLoc(c.k),
    layLuaChon: k => { const lay = cotLoc.find(c => c[0] === k)?.[3]; return lay ? dsGiaTri(dong, lay) : [] } }
  const khop = (d: Dong) => !hienLoc || cotLoc.every(([k, , co, lay, so]) => !co || !dangLoc(gtLoc[k]) || khopLoc(kieuLoc(k), gtLoc[k], lay(d), so?.(d)))

  return (
    <div className="bang-sua-wrap">
      <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
        <table className={`tbl${sua ? ' bang-sua' : ''} bang-kk`}>
          <thead>
            <tr>
              <th className="dim" style={{ width: 40 }}>#</th>
              {hien('ma') && <th style={{ width: sua ? 150 : 100 }}>Mã hàng</th>}
              <th style={{ minWidth: 180 }}>Tên hàng hoá</th>
              {hien('dvt') && <th style={{ width: 70 }}>ĐVT</th>}
              {hien('tonHt') && <th className="num" style={{ width: 120 }}>Tồn hệ thống</th>}
              {hien('tonTt') && <th className="num" style={{ width: 120 }}>Tồn thực tế</th>}
              {hien('chenh') && <th className="num" style={{ width: 110 }}>Chênh lệch</th>}
              {hien('loaiXl') && <th style={{ width: 150 }}>Loại</th>}
              {hien('ghiChu') && <th style={{ minWidth: 180 }}>Ghi chú</th>}
              {sua && <th style={{ width: 44 }} />}
            </tr>
            {hienLoc && (
              <tr className="loc-hang">
                <th />
                {cotLoc.filter(c => c[2]).map(([k, t]) => <th key={k}><OLoc c={{ k, t }} loc={loc} /></th>)}
                {sua && <th />}
              </tr>
            )}
          </thead>
          <tbody>
            {dong.map((d, i) => {
              if (!khop(d)) return null
              const c = chenhCua(d), loai = loaiXuLy(d)
              return (
                <tr key={i}>
                  <td className="dim c">{i + 1}</td>
                  {hien('ma') && (
                    <td className={sua ? undefined : 'code'}>
                      {sua ? (
                        <ChonDanhMuc dm="nvl" nhan="nguyên vật liệu" coMa chiMa className="inp sm" trong="Chọn" value={d.ma} gon
                          onChange={v => chonMa(i, v)} ds={NVL.map(x => ({ v: x.ma, t: `${x.ma} - ${x.ten}` }))} />
                      ) : d.ma}
                    </td>
                  )}
                  <td>{d.ten}</td>
                  {hien('dvt') && <td>{d.dvt}</td>}
                  {/* Tồn hệ thống do mua, bán tổng hợp ra, không sửa tay */}
                  {hien('tonHt') && <td className="num">{money(d.tonHt ?? 0)}</td>}
                  {hien('tonTt') && <td className="num">{sua ? <OSl val={d.tonTt ?? 0} onChange={v => capNhat(i, { tonTt: v })} /> : money(d.tonTt ?? 0)}</td>}
                  {hien('chenh') && <td className={`num kk-chenh${c < 0 ? ' thieu' : c > 0 ? ' thua' : ''}`}>{c > 0 ? `+${money(c)}` : money(c)}</td>}
                  {hien('loaiXl') && <td>{loai ? <span className={`kk-loai${c < 0 ? ' thieu' : ' thua'}`}>{loai}</span> : <span className="dim">Khớp</span>}</td>}
                  {hien('ghiChu') && (
                    <td>{sua ? <input className="inp sm" value={d.ghiChu ?? ''} placeholder="Lý do chênh lệch" onChange={e => capNhat(i, { ghiChu: e.target.value })} /> : d.ghiChu}</td>
                  )}
                  {sua && (
                    <td className="c">
                      <button type="button" className="icon-btn sm" title="Xoá dòng" onClick={() => onChange?.(dong.filter((_, j) => j !== i))}>
                        <Icon n="trash" className="ic sm" />
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
          {!khongTong && (
            <tfoot>
              <tr className="sum">
                <td colSpan={soCotDau}>Tổng cộng ({dong.length} dòng)</td>
                {hien('tonHt') && <td className="num">{money(tong(d => d.tonHt ?? 0))}</td>}
                {hien('tonTt') && <td className="num">{money(tong(d => d.tonTt ?? 0))}</td>}
                {hien('chenh') && <td className="num">{money(tong(chenhCua))}</td>}
                {hien('loaiXl') && <td className="dim">{dong.filter(d => chenhCua(d) < 0).length} thiếu, {dong.filter(d => chenhCua(d) > 0).length} thừa</td>}
                {hien('ghiChu') && <td />}
                {sua && <td />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {sua && (
        <div className="row" style={{ padding: '8px 12px', gap: 10 }}>
          <button type="button" className="btn sm ghost" onClick={themDong}><Icon n="plus" className="ic sm" />Thêm dòng</button>
          <button type="button" className="btn sm ghost" onClick={() => setMoHangLoat(true)}><Icon n="plus" className="ic sm" />Thêm hàng loạt</button>
          {moHangLoat && (
            <ThemHangLoat
              ds={NVL.map(h => ({ ma: h.ma, ten: h.ten, dvt: h.dvt, nhom: h.nhom, loai: 'Nguyên vật liệu' }))}
              daCo={dong.map(d => d.ma ?? '')}
              onDong={() => setMoHangLoat(false)}
              onXacNhan={ds => onChange?.([...dong, ...ds.map(h => ({ ma: h.ma, ten: h.ten, dvt: h.dvt, sl: 0, gia: 0, tien: 0, ts: 0, thue: 0, tonHt: 0, tonTt: 0, ghiChu: '' }))])}
            />
          )}
          {dong.length > 0 && (
            <button type="button" className="btn sm ghost" onClick={() => onChange?.([])} style={{ color: 'var(--red)' }}>
              <Icon n="trash" className="ic sm" />Xoá hết
            </button>
          )}
        </div>
      )}
    </div>
  )
}
