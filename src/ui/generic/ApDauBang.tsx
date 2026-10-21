// Ô Thuế GTGT, Chiết khấu trên thanh tab phiếu mua hàng, áp xuống mọi dòng chi tiết (T492)
import { useEffect, useRef, useState } from 'react'
import { Select } from '../Dropdown'
import { Icon } from '../Icon'
import { money } from '../format'
import { OSoGo } from '../OSoGo'
import type { Dong } from './gen'

type KieuCk = 'pt' | 'tien'

const tinhThue = (d: Dong, ck: number) => Math.round(((d.tien || 0) - ck) * (d.ts ?? 0) / 100)

/** % áp nguyên cho mọi dòng; số tiền chia theo thành tiền, dòng có tiền cuối cùng nhận phần lẻ cho khớp tổng */
function apCk(dong: Dong[], kieu: KieuCk, gt: number): Dong[] {
  if (kieu === 'pt') return dong.map(d => {
    const ck = Math.round((d.tien || 0) * gt / 100)
    return { ...d, ptCk: gt, ck, thue: tinhThue(d, ck) }
  })
  const tong = dong.reduce((a, d) => a + (d.tien || 0), 0)
  const cuoi = dong.reduce((k, d, i) => (d.tien || 0) > 0 ? i : k, -1)
  let daChia = 0
  return dong.map((d, i) => {
    const tien = d.tien || 0
    const ck = tong <= 0 || tien <= 0 ? 0 : i === cuoi ? Math.min(gt, tong) - daChia : Math.round(Math.min(gt, tong) * tien / tong)
    daChia += ck
    return { ...d, ptCk: tien ? Math.round(ck / tien * 10000) / 100 : 0, ck, thue: tinhThue(d, ck) }
  })
}

export function ApDauBang({ dong, onChange, an, coThue, coCk }: {
  dong: Dong[]
  an?: boolean
  onChange: (ds: Dong[]) => void
  coThue: boolean
  coCk: boolean
}) {
  const [kieu, setKieu] = useState<KieuCk>('pt')
  const [gt, setGt] = useState(0)
  const [tsDau, setTsDau] = useState<number | null>(null)   // thuế suất đã chọn ở đầu bảng, dòng thêm sau lấy mặc định mức này
  const soDong = useRef(dong.length)
  // Thuế suất chung: mọi dòng cùng mức thì hiện mức đó, khác nhau thì hiện "Nhiều mức"
  const tsChung = dong.length && dong.every(d => (d.ts ?? 0) === (dong[0].ts ?? 0)) ? String(dong[0].ts ?? 0) : ''

  function apThue(v: string) {
    if (v === '') return
    const ts = Number(v)
    setTsDau(ts)
    onChange(dong.map(d => ({ ...d, ts, thue: Math.round(((d.tien || 0) - (d.ck || 0)) * ts / 100) })))
  }

  function doiCk(k: KieuCk, v: number) {
    const gtMoi = k === 'pt' ? Math.min(Math.max(v, 0), 100) : Math.max(v, 0)
    setKieu(k)
    setGt(gtMoi)
    onChange(apCk(dong, k, gtMoi))
  }

  // Dòng mới lấy thuế suất đầu bảng (vẫn chọn lại được trên dòng); thêm, xoá dòng hoặc đổi thành tiền thì áp lại chiết khấu đầu bảng để tổng chiết khấu vẫn đúng
  const khoaTien = dong.map(d => d.tien || 0).join(',')
  useEffect(() => {
    const truoc = soDong.current
    soDong.current = dong.length
    let moi = tsDau === null || dong.length <= truoc ? dong
      : dong.map((d, i) => i < truoc ? d : { ...d, ts: tsDau, thue: Math.round(((d.tien || 0) - (d.ck || 0)) * tsDau / 100) })
    if (gt) moi = apCk(moi, kieu, gt)
    if (moi.some((d, i) => d.ck !== dong[i].ck || d.ts !== dong[i].ts || d.thue !== dong[i].thue)) onChange(moi)
  }, [khoaTien])   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ct-ap-dau" hidden={an}>
      {coCk && (
        <div className="ct-ap-o">
          <span>Chiết khấu</span>
          <div className="ct-ap-kieu" role="group" aria-label="Cách nhập chiết khấu">
            <button type="button" className={kieu === 'pt' ? 'on' : ''} aria-pressed={kieu === 'pt'} title="Chiết khấu theo %" aria-label="Chiết khấu theo %" onClick={() => kieu !== 'pt' && doiCk('pt', 0)}>%</button>
            <button type="button" className={kieu === 'tien' ? 'on' : ''} aria-pressed={kieu === 'tien'} title="Chiết khấu theo số tiền" aria-label="Chiết khấu theo số tiền" onClick={() => kieu !== 'tien' && doiCk('tien', 0)}>đ</button>
          </div>
          <OSoGo key={kieu} val={gt} onChange={v => doiCk(kieu, v)} hien={kieu === 'pt' ? v => String(v).replace('.', ',') : money}
            thapPhan={kieu === 'pt'} max={kieu === 'pt' ? 100 : undefined} className={`inp sm num ${kieu === 'pt' ? 'ct-ap-pt' : 'ct-ap-tien'}`} />
          <span className="ct-ap-dv">{kieu === 'pt' ? '%' : 'đ'}</span>
        </div>
      )}
      {coThue && (
        <div className="ct-ap-o">
          <span>Thuế GTGT</span>
          <Select className="inp sm ct-ap-ts" value={tsChung} aria-label="Thuế GTGT áp cho mọi dòng" onChange={e => apThue(e.target.value)}
            ds={[...(tsChung === '' ? [{ v: '', t: 'Nhiều mức' }] : []), { v: '0', t: '0%' }, { v: '5', t: '5%' }, { v: '8', t: '8%' }, { v: '10', t: '10%' }]} />
        </div>
      )}
    </div>
  )
}
