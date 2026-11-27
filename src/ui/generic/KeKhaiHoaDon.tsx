// Phiếu chi tiền mặt có hoá đơn: tab Kê khai hoá đơn (hàng hoá dịch vụ, TK thuế, tiền trước thuế, thuế suất, tiền thuế, nhóm HHDV mua vào)
import { Icon } from '../Icon'
import { Select } from '../Dropdown'
import { ChonDanhMuc } from '../ChonDanhMuc'
import { money } from '../format'
import { DM_THUE_SUAT, DS_LOAI_THUE_DONG } from '../../modules/danh-muc/thue-suat'
import { OSo } from './BangSua'
import { ThKeo, type DoRong } from '../Table'
import type { Dong } from './gen'

/** Danh mục Nhóm HHDV mua vào: mã 1 đến 5 theo tờ khai 01/GTGT */
export const DM_NHOM_HHDV_MUA: { ma: string; ten: string }[] = [
  { ma: '1', ten: 'Hàng hoá dịch vụ dùng riêng cho SXKD chịu thuế GTGT đủ điều kiện khấu trừ' },
  { ma: '2', ten: 'Hàng hoá, dịch vụ không đủ điều kiện khấu trừ' },
  { ma: '3', ten: 'Hàng hoá dịch vụ dùng cho SXKD chịu thuế và không chịu thuế đủ điều kiện khấu trừ' },
  { ma: '4', ten: 'Hàng hoá, dịch vụ cho dự án đầu tư đủ điều kiện được khấu trừ thuế' },
  { ma: '5', ten: 'Hàng hoá, dịch vụ không phải tổng hợp trên tờ khai 01/GTGT' },
]

const DS_TK_DU = [{ v: '1111', t: '1111 - Tiền Việt Nam' }, { v: '1121', t: '1121 - Tiền gửi ngân hàng' }, { v: '331', t: '331 - Phải trả cho người bán' }]
const DS_TK_THUE = [{ v: '1331', t: '1331 - Thuế GTGT được khấu trừ của hàng hoá, dịch vụ' }, { v: '1332', t: '1332 - Thuế GTGT được khấu trừ của TSCĐ' }]

export interface DongKkHd {
  hhdv: string        // hàng hoá dịch vụ
  tkThue: string      // TK thuế GTGT được khấu trừ
  tien: number        // tiền trước thuế
  loaiThue: string    // mã loại thuế theo danh mục (DM_THUE_SUAT.ma)
  thue: number        // tiền thuế
  nhom: string        // mã nhóm HHDV mua vào, 1 đến 5
  tkDu: string        // TK đối ứng: tài khoản Có của dòng chi tiết liên kết; thuế ghi Nợ TK thuế, Có TK này
  lk?: number         // thứ tự dòng bên tab Chi tiết mà dòng kê khai liên kết; thiếu là dòng thêm tay
  suaTien?: boolean   // đã gõ lại số tiền, không chạy theo tab Chi tiết nữa
  suaTen?: boolean    // đã gõ lại hàng hoá dịch vụ
}

export const tyLe = (ma: string) => {
  const t = DM_THUE_SUAT.find(x => x.ma === ma)
  return t && /^\d+$/.test(t.gt) ? Number(t.gt) : 0
}

export const dongKkMoi = (o: Partial<DongKkHd> = {}): DongKkHd => ({ hhdv: '', tkThue: '1331', tien: 0, loaiThue: '10', thue: 0, nhom: '1', tkDu: '', ...o })

/** Đồng bộ bảng kê khai với tab Chi tiết: mỗi dòng chi tiết có tiền một dòng kê khai (số tiền, tên, TK đối ứng chạy theo, trừ ô đã gõ lại);
 *  dòng chi tiết bị xoá thì dòng kê khai đi theo; dòng thêm tay giữ nguyên */
export function dongBoKk(cur: DongKkHd[], ct: Dong[], tkCoMd: (d: Dong) => string): DongKkHd[] {
  const lk = new Map(cur.filter(r => r.lk !== undefined).map(r => [r.lk as number, r]))
  const next: DongKkHd[] = []
  ct.forEach((d, i) => {
    const r = lk.get(i)
    if (!r && !((d.tien || 0) > 0)) return
    if (!r) { next.push(dongKkMoi({ lk: i, hhdv: d.ten, tien: d.tien, thue: Math.round(d.tien * 0.1), tkDu: tkCoMd(d) })); return }
    const tien = r.suaTien ? r.tien : d.tien || 0
    next.push({ ...r, hhdv: r.suaTen ? r.hhdv : d.ten, tien, thue: tien === r.tien ? r.thue : Math.round(tien * tyLe(r.loaiThue) / 100), tkDu: tkCoMd(d) })
  })
  return [...next, ...cur.filter(r => r.lk === undefined)]
}

export function KeKhaiHoaDon({ dong, onChange, sua, dsTk, doRong }: {
  dong: DongKkHd[]
  onChange: (d: DongKkHd[]) => void
  sua: boolean
  dsTk?: { v: string; t: string }[]
  doRong?: DoRong   // kéo giãn độ rộng cột, nhớ theo tab
}) {
  const cap = (i: number, p: Partial<DongKkHd>) => onChange(dong.map((d, k) => (k === i ? { ...d, ...p } : d)))
  const tongTien = dong.reduce((a, d) => a + (d.tien || 0), 0)
  const tongThue = dong.reduce((a, d) => a + (d.thue || 0), 0)
  const tenNhom = (ma: string) => DM_NHOM_HHDV_MUA.find(n => n.ma === ma)
  return (
    <div className="bang-sua-wrap">
      <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
        <table className="tbl bang-sua">
          <thead>
            <tr>
              <th className="dim" style={{ width: 36 }}>#</th>
              <ThKeo k="hhdv" minW={220} doRong={doRong}>Hàng hoá dịch vụ</ThKeo>
              <ThKeo k="tkThue" w={110} doRong={doRong}>TK thuế</ThKeo>
              <ThKeo k="tkDu" w={110} doRong={doRong}>TK đối ứng</ThKeo>
              <ThKeo k="tien" className="num" w={150} doRong={doRong}>Tiền trước thuế</ThKeo>
              <ThKeo k="loaiThue" w={190} doRong={doRong}>Thuế suất</ThKeo>
              <ThKeo k="thue" className="num" w={140} doRong={doRong}>Tiền thuế</ThKeo>
              <ThKeo k="nhom" minW={260} doRong={doRong}>Nhóm HHDV mua vào</ThKeo>
              {sua && <th style={{ width: 44 }} />}
            </tr>
          </thead>
          <tbody>
            {dong.map((d, i) => (
              <tr key={i}>
                <td className="dim">{i + 1}</td>
                <td>{sua ? <input className="inp sm" value={d.hhdv} onChange={e => cap(i, { hhdv: e.target.value, suaTen: true })} aria-label="Hàng hoá dịch vụ" /> : d.hhdv}</td>
                <td>{sua
                  ? <ChonDanhMuc dm="taiKhoan" nhan="tài khoản" className="inp sm" chiMa khongThem trong="—" value={d.tkThue} onChange={v => cap(i, { tkThue: v })}
                    ds={dsTk ?? DS_TK_THUE} />
                  : d.tkThue}</td>
                <td>{sua && d.lk === undefined
                  ? <ChonDanhMuc dm="taiKhoan" nhan="tài khoản" className="inp sm" chiMa khongThem trong="—" value={d.tkDu} onChange={v => cap(i, { tkDu: v })} ds={DS_TK_DU} />
                  : <span className="code">{d.tkDu || '—'}</span>}</td>
                <td className="num"><OSo val={d.tien} disabled={!sua} onChange={tien => cap(i, { tien, suaTien: true, thue: Math.round(tien * tyLe(d.loaiThue) / 100) })} /></td>
                <td>{sua
                  ? <Select className="inp sm" value={d.loaiThue} aria-label="Thuế suất"
                    onChange={e => cap(i, { loaiThue: e.target.value, thue: Math.round((d.tien || 0) * tyLe(e.target.value) / 100) })}>
                    {DS_LOAI_THUE_DONG.map(t => <option key={t.v} value={t.v}>{t.t}</option>)}
                  </Select>
                  : (DS_LOAI_THUE_DONG.find(t => t.v === d.loaiThue)?.t ?? d.loaiThue)}</td>
                <td className="num"><OSo val={d.thue} disabled={!sua} onChange={thue => cap(i, { thue })} /></td>
                <td>{sua
                  ? <ChonDanhMuc dm="nhomHhdvMua" nhan="nhóm HHDV mua vào" className="inp sm" chiMa khongThem trong="Chọn" value={d.nhom} onChange={v => cap(i, { nhom: v })}
                    ds={DM_NHOM_HHDV_MUA.map(n => ({ v: n.ma, t: `${n.ma} - ${n.ten}` }))} />
                  : <span title={tenNhom(d.nhom)?.ten}>{d.nhom}</span>}</td>
                {sua && <td className="c"><button type="button" className="icon-btn sm" title="Xoá dòng" onClick={() => onChange(dong.filter((_, k) => k !== i))}><Icon n="trash" className="ic sm" /></button></td>}
              </tr>
            ))}
            {!dong.length && <tr><td colSpan={sua ? 9 : 8} className="c dim">Chưa có dòng kê khai</td></tr>}
          </tbody>
          <tfoot>
            <tr className="sum">
              <td colSpan={4}>Tổng cộng ({dong.length} dòng)</td>
              <td className="num">{money(tongTien)}</td>
              <td />
              <td className="num">{money(tongThue)}</td>
              <td />
              {sua && <td />}
            </tr>
          </tfoot>
        </table>
      </div>
      {sua && (
        <div className="row" style={{ padding: '8px 12px', gap: 10 }}>
          <button type="button" className="btn sm ghost" onClick={() => onChange([...dong, dongKkMoi()])}><Icon n="plus" className="ic sm" />Thêm dòng</button>
          {dong.length > 0 && <button type="button" className="btn sm ghost" style={{ color: 'var(--red)' }} onClick={() => onChange([])}><Icon n="trash" className="ic sm" />Xoá hết</button>}
        </div>
      )}
    </div>
  )
}
