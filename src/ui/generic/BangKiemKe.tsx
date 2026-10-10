// Bảng chi tiết phiếu kiểm kê (T124): tồn hệ thống, tồn thực tế, chênh lệch và loại xử lý của từng mặt hàng.
// Kho chọn ở đầu phiếu nên bảng không có cột Kho; không có số tiền, thuế
import { useEffect, useState } from 'react'
import { NVL } from '../../data/mock'
import { ChonDanhMuc } from '../ChonDanhMuc'
import { Icon } from '../Icon'
import { money } from '../format'
import type { Dong } from './gen'

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

export function BangKiemKe({ dong, onChange, cheDo, an = [], khongTong = false }: {
  dong: Dong[]; onChange?: (ds: Dong[]) => void; cheDo: 'xem' | 'sua'; an?: string[]; khongTong?: boolean
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
  const tong = (f: (d: Dong) => number) => dong.reduce((a, d) => a + f(d), 0)
  const soCotDau = 2 + Number(hien('ma')) + Number(hien('dvt'))

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
          </thead>
          <tbody>
            {dong.map((d, i) => {
              const c = chenhCua(d), loai = loaiXuLy(d)
              return (
                <tr key={i}>
                  <td className="dim c">{i + 1}</td>
                  {hien('ma') && (
                    <td className={sua ? undefined : 'code'}>
                      {sua ? (
                        <ChonDanhMuc dm="nvl" nhan="nguyên vật liệu" coMa chiMa className="inp sm" trong="Chọn" value={d.ma}
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
