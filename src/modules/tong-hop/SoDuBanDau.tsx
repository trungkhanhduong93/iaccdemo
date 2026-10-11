// Màn Số dư ban đầu (10.1.3, T141): lưới thẻ theo loại số dư, bảng số dư chi tiết có dòng tổng.
// Loại số dư theo gói và chế độ: gói Free chỉ số dư tiền (mở ở Thu chi); TT58, TT152 khai tiền, công nợ, tồn kho, không có tài khoản;
// TT133, TT99 thêm số dư tài khoản và cột Số hiệu TK, Dư Nợ, Dư Có.
import { useMemo, useState } from 'react'
import type { Col, Row, ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { kieuGhiSo } from '../../app/plan'
import { ngayDauNam, useSession } from '../../app/session'
import { Icon } from '../../ui/Icon'
import { PageHead } from '../../ui/Page'
import { Table } from '../../ui/Table'
import { fold, k, money } from '../../ui/format'
import { ThanhLoc } from '../../ui/ThanhLoc'
import { CHI_NHANH, KHACH, NCC, NVL } from '../../data/mock'
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

/** Dòng số dư mẫu lấy từ số dư đầu kỳ sổ cái: tài khoản, tiền theo quỹ (danh mục quỹ tiền 1.12), công nợ, tồn kho */
export function soDuRows(): Row[] {
  const m = soCai(8).mo
  const du = (tk: string, ct: string, v: number, them: Row = {}) => ({ tk, ten: TEN_TK[tk], ct, no: Math.max(0, v), co: Math.max(0, -v), du: v, ...them })
  const tkRows = Object.keys(m).map(tk => ({ loai: 'tk', ...du(tk, '', m[tk]) }))
  const tm = tach(m['1111'] ?? 0, CHI_NHANH.map((_, i, a) => i === a.length - 1 ? 1 : 1 / a.length))
  const nh = tach(m['1121'] ?? 0, [0.7, 0.3])
  const tien = [
    ...CHI_NHANH.map((c, i) => ({ loai: 'tien', ...du('1111', `Quỹ tiền mặt ${c.ngan}`, tm[i], { ma: `TM0${i + 1}`, kieu: 'Tiền mặt', cn: c.ten }) })),
    { loai: 'tien', ...du('1121', 'Vietcombank, chi nhánh Sài Gòn', nh[0], { ma: 'NH01', kieu: 'Ngân hàng', cn: 'Tất cả' }) },
    { loai: 'tien', ...du('1121', 'Techcombank, nhận tiền QR', nh[1], { ma: 'NH02', kieu: 'Ngân hàng', cn: 'Tất cả' }) },
  ]
  const khach3 = KHACH.filter(x => x.ma !== 'KL').slice(0, 3)
  const kh = tach(m['131'] ?? 0, [0.45, 0.35, 0.2]).map((v, i) => ({ loai: 'kh', ...du('131', khach3[i].ten, v, { ma: khach3[i].ma }) }))
  const ncc3 = NCC.slice(0, 3)
  const ncc = tach(m['331'] ?? 0, [0.5, 0.3, 0.2]).map((v, i) => ({ loai: 'ncc', ...du('331', ncc3[i].ten, v, { ma: ncc3[i].ma }) }))
  const nvl4 = NVL.slice(0, 4)
  const kho = tach(m['152'] ?? 0, [0.45, 0.25, 0.15, 0.15]).map((v, i) => ({
    loai: 'kho', ...du('152', nvl4[i].ten, v, { ma: nvl4[i].ma, kho: 'Kho tổng', dvt: nvl4[i].dvt, sl: Math.round(v / nvl4[i].gia) }),
  }))
  return [...tkRows, ...tien, ...kh, ...ncc, ...kho]
}

type TabKey = 'tk' | 'tien' | 'kh' | 'ncc' | 'kho'

const THES: { k: TabKey; ten: string; icon: string }[] = [
  { k: 'tk', ten: 'Số dư tài khoản', icon: 'book' },
  { k: 'tien', ten: 'Số dư tiền', icon: 'wallet' },
  { k: 'kh', ten: 'Công nợ khách hàng', icon: 'users' },
  { k: 'ncc', ten: 'Công nợ nhà cung cấp', icon: 'truck' },
  { k: 'kho', ten: 'Tồn kho vật tư, hàng hoá', icon: 'box' },
]

/** Loại số dư khai được: gói Free chỉ tiền; chế độ Nợ/Có thêm số dư tài khoản */
function loaiTheo(goi: string, noCo: boolean): TabKey[] {
  if (goi === 'F') return ['tien']
  return noCo ? ['tk', 'tien', 'kh', 'ncc', 'kho'] : ['tien', 'kh', 'ncc', 'kho']
}

export function SoDuBanDau({ sc, mod }: ScreenProps) {
  const { s, toast } = useSession()
  const noCo = kieuGhiSo(s.cheDo) === 'noco'
  const all = useMemo(() => soDuRows(), [])
  const loai = loaiTheo(s.goi, noCo)
  const [chon, setTab] = useState<TabKey>(loai[0])
  const tab = loai.includes(chon) ? chon : loai[0]
  const [q, setQ] = useState('')

  const theData = useMemo(() => THES.filter(t => loai.includes(t.k)).map(t => {
    const ds = all.filter(r => r.loai === t.k)
    const no = ds.reduce((a, r) => a + (Number(r.no) || 0), 0)
    const co = ds.reduce((a, r) => a + (Number(r.co) || 0), 0)
    return { ...t, rows: ds, phu: noCo ? `${ds.length} dòng · dư Nợ ${money(no)} đ, dư Có ${money(co)} đ` : `${ds.length} dòng · ${money(no - co)} đ` }
  }), [all, loai.join(), noCo])   // eslint-disable-line react-hooks/exhaustive-deps

  const curThe = theData.find(t => t.k === tab) ?? theData[0]
  const cardRows = curThe.rows
  const rows = useMemo(() => {
    if (!q) return cardRows
    return cardRows.filter(r => fold(Object.values(r).join(' ')).includes(fold(q)))
  }, [cardRows, q])

  const cols = useMemo((): Col[] => {
    const tien = (t: string): Col[] => noCo ? [{ k: 'no', t: 'Dư Nợ', num: true }, { k: 'co', t: 'Dư Có', num: true }] : [{ k: 'du', t, num: true }]
    const tk: Col[] = noCo ? [{ k: 'tk', t: 'Số hiệu TK', cls: 'code' }] : []
    if (tab === 'tk') return [{ k: 'tk', t: 'Số hiệu TK', cls: 'code' }, { k: 'ten', t: 'Tên tài khoản' }, ...tien('')]
    if (tab === 'tien') return [{ k: 'ma', t: 'Mã quỹ', cls: 'code' }, { k: 'ct', t: 'Tên quỹ' }, { k: 'kieu', t: 'Loại' }, { k: 'cn', t: 'Chi nhánh', cls: 'dim' }, ...tk, ...tien('Số dư')]
    if (tab === 'kho') return [{ k: 'kho', t: 'Kho' }, { k: 'ma', t: 'Mã hàng', cls: 'code' }, { k: 'ct', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT' }, { k: 'sl', t: 'Số lượng', num: true }, ...tk, ...tien('Giá trị tồn')]
    return [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ct', t: tab === 'kh' ? 'Khách hàng' : 'Nhà cung cấp' }, ...tk, ...tien(tab === 'kh' ? 'Còn phải thu' : 'Còn phải trả')]
  }, [tab, noCo])

  const sum = useMemo(() => {
    const no = rows.reduce((a, r) => a + (Number(r.no) || 0), 0)
    const co = rows.reduce((a, r) => a + (Number(r.co) || 0), 0)
    const dau = cols[0].k
    return noCo ? { [dau]: 'Tổng cộng', no, co } : { [dau]: 'Tổng cộng', du: no - co }
  }, [rows, cols, noCo])

  return (
    <div className="page">
      <PageHead crumb={[mod.ten]} title={tenMan(sc)} code={sc.code} meta={<span className="muted">Số dư tại ngày {ngayDauNam(s)}, ngày bắt đầu năm tài chính</span>}>
        <button type="button" className="btn"><Icon n="upload" className="ic sm" />Nhập Excel</button>
        <button type="button" className="btn"><Icon n="download" className="ic sm" />Xuất Excel</button>
        <button type="button" className="btn pri" onClick={() => toast('Thêm mới')}><Icon n="plus" className="ic sm" />Thêm mới</button>
      </PageHead>
      {theData.length > 1 && (
        <div className="rpt-grid" style={{ gridTemplateColumns: `repeat(${theData.length}, minmax(0, 1fr))`, marginBottom: 14 }}>
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
      )}
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
