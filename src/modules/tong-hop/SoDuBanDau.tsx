// Màn Số dư ban đầu (10.1.3): lưới thẻ theo loại số dư, bảng số dư chi tiết có dòng tổng
import { useMemo, useState } from 'react'
import type { Col, Row, ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { Icon } from '../../ui/Icon'
import { PageHead } from '../../ui/Page'
import { Table } from '../../ui/Table'
import { fold, k, money } from '../../ui/format'
import { ThanhLoc } from '../../ui/ThanhLoc'
import { KHACH, NCC, NVL } from '../../data/mock'
import { TEN_TK, soCai } from './so-cai'

function tach(tong: number, tyLe: number[]) {
  let con = tong
  return tyLe.map((tl, i) => {
    if (i === tyLe.length - 1) return con
    const v = k(tong * tl)
    con -= v
    return v
  })
}

export function soDuRows(): Row[] {
  const m = soCai(8).mo
  const tkRows = Object.keys(m).map(tk => ({ loai: 'Tài khoản', tk, ten: TEN_TK[tk], ct: '', sl: '', no: Math.max(0, m[tk]), co: Math.max(0, -m[tk]) }))
  const khach3 = KHACH.filter(x => x.ma !== 'KL').slice(0, 3)
  const cn131 = tach(m['131'] ?? 0, [0.45, 0.35, 0.2]).map((v, i) => ({
    loai: 'Công nợ', tk: '131', ten: TEN_TK['131'], ct: khach3[i].ten, sl: '', no: Math.max(0, v), co: Math.max(0, -v),
  }))
  const ncc3 = NCC.slice(0, 3)
  const cn331 = tach(m['331'] ?? 0, [0.5, 0.3, 0.2]).map((v, i) => ({
    loai: 'Công nợ', tk: '331', ten: TEN_TK['331'], ct: ncc3[i].ten, sl: '', no: Math.max(0, v), co: Math.max(0, -v),
  }))
  const nvl4 = NVL.slice(0, 4)
  const kho152 = tach(m['152'] ?? 0, [0.45, 0.25, 0.15, 0.15]).map((v, i) => ({
    loai: 'Tồn kho', tk: '152', ten: TEN_TK['152'], ct: `Kho tổng · ${nvl4[i].ten}`, sl: Math.round(v / nvl4[i].gia), no: Math.max(0, v), co: Math.max(0, -v),
  }))
  return [...tkRows, ...cn131, ...cn331, ...kho152]
}

type TabKey = 'tk' | 'kh' | 'ncc' | 'kho'

interface TheItem {
  k: TabKey
  ten: string
  icon: string
  loc: (r: Row) => boolean
}

const THES: TheItem[] = [
  { k: 'tk', ten: 'Số dư tài khoản', icon: 'book', loc: r => r.loai === 'Tài khoản' },
  { k: 'kh', ten: 'Công nợ khách hàng', icon: 'users', loc: r => r.loai === 'Công nợ' && r.tk === '131' },
  { k: 'ncc', ten: 'Công nợ nhà cung cấp', icon: 'truck', loc: r => r.loai === 'Công nợ' && r.tk === '331' },
  { k: 'kho', ten: 'Tồn kho vật tư, hàng hoá', icon: 'box', loc: r => r.loai === 'Tồn kho' },
]

export function SoDuBanDau({ sc, mod }: ScreenProps) {
  const { toast } = useSession()
  const all = useMemo(() => soDuRows(), [])
  const [tab, setTab] = useState<TabKey>('tk')
  const [q, setQ] = useState('')

  // Dữ liệu cho từng thẻ
  const theData = useMemo(() => {
    return THES.map(t => {
      const ds = all.filter(t.loc)
      const no = ds.reduce((a, r) => a + (Number(r.no) || 0), 0)
      const co = ds.reduce((a, r) => a + (Number(r.co) || 0), 0)
      return {
        ...t,
        rows: ds,
        phu: `${ds.length} dòng · tổng dư Nợ ${money(no)} đ, dư Có ${money(co)} đ`,
      }
    })
  }, [all])

  const curThe = theData.find(t => t.k === tab) ?? theData[0]
  const cardRows = curThe.rows
  const rows = useMemo(() => {
    if (!q) return cardRows
    return cardRows.filter(r => fold(Object.values(r).join(' ')).includes(fold(q)))
  }, [cardRows, q])

  const cols = useMemo((): Col[] => {
    const list: Col[] = [
      { k: 'tk', t: 'Số hiệu TK', cls: 'code' },
      { k: 'ten', t: 'Tên tài khoản' },
    ]
    if (tab !== 'tk') {
      list.push({ k: 'ct', t: 'Chi tiết' })
    }
    if (tab === 'kho') {
      list.push({ k: 'sl', t: 'Số lượng', num: true })
    }
    list.push(
      { k: 'no', t: 'Dư Nợ', num: true },
      { k: 'co', t: 'Dư Có', num: true },
    )
    return list
  }, [tab])

  const sum = useMemo(() => {
    return {
      tk: 'Tổng cộng',
      no: rows.reduce((a, r) => a + (Number(r.no) || 0), 0),
      co: rows.reduce((a, r) => a + (Number(r.co) || 0), 0),
    }
  }, [rows])

  return (
    <div className="page">
      <PageHead crumb={[mod.ten]} title={tenMan(sc)} code={sc.code}>
        <button type="button" className="btn"><Icon n="upload" className="ic sm" />Nhập Excel</button>
        <button type="button" className="btn"><Icon n="download" className="ic sm" />Xuất Excel</button>
        <button type="button" className="btn pri" onClick={() => toast('Thêm số dư')}><Icon n="plus" className="ic sm" />Thêm số dư</button>
      </PageHead>
      <div className="rpt-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', marginBottom: 14 }}>
        {theData.map(t => {
          const sel = t.k === tab
          return (
            <button
              type="button"
              key={t.k}
              className="rpt-card"
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                ...(sel ? { borderColor: 'var(--blue)', boxShadow: '0 0 0 1px var(--blue)' } : {}),
              }}
              onClick={() => { setTab(t.k); setQ('') }}
            >
              <span className="ri"><Icon n={t.icon} /></span>
              <span className="grow" style={{ minWidth: 0 }}>
                <b>{t.ten}</b>
                <small>{t.phu}</small>
              </span>
            </button>
          )
        })}
      </div>
      <section className="card">
        <ThanhLoc
          tim={{
            value: q,
            onChange: setQ,
            placeholder: 'Tìm theo mã, tên',
          }}
          phai={<span className="muted" style={{ fontSize: 12 }}>{rows.length}/{cardRows.length} dòng</span>}
        />
        {rows.length ? <Table cols={cols} rows={rows} sum={sum} /> : (
          cardRows.length ? <div className="empty"><b>Không có dòng khớp bộ lọc</b><button type="button" className="btn sm" style={{ marginTop: 10 }} onClick={() => setQ('')}>Xoá bộ lọc</button></div>
            : <div className="empty"><b>Chưa có dữ liệu</b></div>
        )}
      </section>
    </div>
  )
}
