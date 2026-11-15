// Xuất kho định lượng (T849): mỗi phiếu Xuất bán POS sinh một phiếu xuất kho định lượng,
// lưới dạng cây món và nguyên vật liệu theo công thức chế biến.
import { Fragment, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { duongDan, tenMan } from '../../app/registry'
import { cuaHangHienTai, useSession } from '../../app/session'
import { Icon } from '../../ui/Icon'
import { Table } from '../../ui/Table'
import { PhanTrang } from '../../ui/PhanTrang'
import { ChonKhoangNgay, docNgay, thangMacDinh, trongKhoang, type KhoangNgay } from '../../ui/ChonNgay'
import { FormToanMan, useDong } from '../../ui/FormToanMan'
import { fold, money, moneyD, soLuong } from '../../ui/format'
import { useDsPhieuXdl, type PhieuXdl } from './xuat-dinh-luong'

export function XuatDinhLuong({ sc, mod }: ScreenProps) {
  const { id } = useParams()
  const rows = useDsPhieuXdl()

  if (id !== undefined) {
    const row = rows.find(r => r.id === id)
    return <ChiTietXuatDinhLuong sc={sc} mod={mod} row={row} />
  }

  return <DanhSachXuatDinhLuong sc={sc} mod={mod} rows={rows} />
}

function DanhSachXuatDinhLuong({ sc, mod, rows }: ScreenProps & { rows: PhieuXdl[] }) {
  const { s } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const cnChon = cuaHangHienTai(s)

  const [thoiGian, setThoiGian] = useState<KhoangNgay>(thangMacDinh)
  const [tim, setTim] = useState('')
  const [cn, setCn] = useState('')
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(50)

  const dsCn = useMemo(() => [...new Set(rows.map(r => r.cn))].sort(), [rows])

  const rowsLoc = useMemo(() => {
    return rows.filter(r => {
      if (!trongKhoang(docNgay(r.ngay), thoiGian)) return false
      if (cnChon && r.cn !== cnChon.ten) return false
      if (cn && r.cn !== cn) return false
      if (tim.trim()) {
        const kw = fold(tim.trim())
        const text = fold(`${r.so} ${r.posSo} ${r.ghiChu} ${r.cn} ${r.nguon} ${r.dong.map(m => m.ten).join(' ')}`)
        if (!text.includes(kw)) return false
      }
      return true
    })
  }, [rows, thoiGian, cnChon, cn, tim])

  const batDau = (trang - 1) * coTrang
  const rowsTrang = rowsLoc.slice(batDau, batDau + coTrang)

  const cols: Col[] = [
    { k: 'stt', t: '#', w: 45, cls: 'dim' },
    { k: 'ngay', t: 'Ngày', w: 110 },
    {
      k: 'so',
      t: 'Số chứng từ',
      cls: 'code',
      w: 140,
      r: (r: Row) => (
        <button
          type="button"
          className="ds-link-so"
          title="Mở chi tiết phiếu xuất kho định lượng"
          onClick={e => {
            e.stopPropagation()
            nav(`${path}/${r.id}`)
          }}
        >
          {r.so}
        </button>
      ),
    },
    { k: 'ghiChu', t: 'Ghi chú' },
    ...(cnChon ? [] : [{ k: 'cn', t: 'Cửa hàng', w: 150 } as Col]),
    {
      k: 'thamChieu',
      t: 'Tham chiếu',
      cls: 'code',
      w: 150,
      r: (r: Row) => (
        <Link
          to={`/app/ban-hang/3-1-1/${r.posId}`}
          className="ds-link-so"
          title="Mở chứng từ Xuất bán POS"
          onClick={e => e.stopPropagation()}
        >
          {r.posSo}
        </Link>
      ),
    },
    { k: 'ngayTao', t: 'Ngày tạo', w: 140 },
    { k: 'nguoiTao', t: 'Người tạo', w: 120 },
    {
      k: 'nguon',
      t: 'Nguồn',
      w: 90,
      r: (r: Row) => <span className="chip info">{String(r.nguon ?? 'FABi')}</span>,
    },
    { k: 'tong', t: 'Tổng tiền', num: true, w: 130, dinh: 'phai' },
  ]

  const rowsBang: Row[] = rowsTrang.map((r, i) => ({
    ...r,
    stt: batDau + i + 1,
    thamChieu: r.posSo,
  }))

  const tongTien = rowsLoc.reduce((a, r) => a + r.tong, 0)

  return (
    <div className="page xdl-page">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <div className="xdl-thanh-loc">
        <ChonKhoangNgay value={thoiGian} onChange={k => { setThoiGian(k); setTrang(1) }} />
        <div className="ds-tim">
          <Icon n="search" className="ic sm" />
          <input
            className="ds-o-inp"
            value={tim}
            placeholder="Tìm theo số phiếu, tham chiếu, món..."
            title="Tìm kiếm"
            aria-label="Tìm kiếm"
            onChange={e => { setTim(e.target.value); setTrang(1) }}
          />
          {tim && (
            <button type="button" className="icon-btn sm" onClick={() => { setTim(''); setTrang(1) }} title="Xoá tìm kiếm">
              <Icon n="x" className="ic sm" />
            </button>
          )}
        </div>
        {!cnChon && dsCn.length > 1 && (
          <select
            className="ds-o-sel"
            value={cn}
            aria-label="Chọn cửa hàng"
            onChange={e => { setCn(e.target.value); setTrang(1) }}
          >
            <option value="">Tất cả cửa hàng</option>
            {dsCn.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <span className="dim xdl-dem-phieu">{rowsLoc.length} phiếu</span>
      </div>

      <div className="card" style={{ padding: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        <Table
          cols={cols}
          rows={rowsBang}
          onRow={r => nav(`${path}/${r.id}`)}
          sum={{ ngay: `Tổng (${rowsLoc.length} phiếu)`, tong: tongTien }}
        />
      </div>

      <PhanTrang trang={trang} tong={rowsLoc.length} coTrang={coTrang} onTrang={setTrang} onCoTrang={setCoTrang} />
    </div>
  )
}

function ChiTietXuatDinhLuong({ sc, mod, row }: ScreenProps & { row?: PhieuXdl }) {
  const { s } = useSession()
  const dongForm = useDong(duongDan(mod, sc))
  const [tab, setTab] = useState<'ct' | 'ht'>('ct')
  const [daThu, setDaThu] = useState<Record<string, boolean>>({})

  if (!row) {
    return (
      <FormToanMan icon={mod.icon} iconNet xem onClose={dongForm} title="Xuất kho định lượng" foot={<button type="button" className="btn" onClick={dongForm}>Đóng</button>}>
        <div className="p-4 dim">Không tìm thấy phiếu xuất kho định lượng.</div>
      </FormToanMan>
    )
  }

  const isPro = s.goi === 'PR'
  const toggleThu = (k: string) => setDaThu(prev => ({ ...prev, [k]: !prev[k] }))

  return (
    <FormToanMan
      icon={mod.icon}
      iconNet
      xem
      onClose={dongForm}
      title="Xuất kho định lượng"
      giua={<span className="fsf-tt xem">Phiếu <b>{row.so}</b></span>}
      meta={
        <>
          <span className="chip ok">Đã xuất kho</span>
          <span className="src">Hệ thống</span>
          <span className="chip info"><Icon n="cuahang" className="ic sm" />{row.cn}</span>
        </>
      }
      footClass="fsf-f-xem"
      foot={
        <>
          <div className="xp-footer-trai">
            <button type="button" className="xp-btn-in" onClick={() => window.print()}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12H2.66667C2.31304 12 1.97391 11.8595 1.72386 11.6095C1.47381 11.3594 1.33333 11.0203 1.33333 10.6667V7.33333C1.33333 6.97971 1.47381 6.64057 1.72386 6.39052C1.97391 6.14048 2.31304 6 2.66667 6H13.3333C13.687 6 14.0261 6.14048 14.2761 6.39052C14.5262 6.64057 14.6667 6.97971 14.6667 7.33333V10.6667C14.6667 11.0203 14.5262 11.3594 14.2761 11.6095C13.687 12 13.3333 12 13.3333 12H12" />
                <path d="M4 6V2C4 1.82319 4.07024 1.65362 4.19526 1.5286C4.32029 1.40357 4.48986 1.33333 4.66667 1.33333H11.3333C11.5101 1.33333 11.6797 1.40357 11.8047 1.5286C11.9298 1.65362 12 1.82319 12 2V6" />
                <path d="M4.66667 9.33333H11.3333C11.7015 9.33333 12 9.63181 12 10V14C12 14.3682 11.7015 14.6667 11.3333 14.6667H4.66667C4.29848 14.6667 4 14.3682 4 14V10C4 9.63181 4.29848 9.33333 4.66667 9.33333Z" />
              </svg>
              <span>In phiếu</span>
            </button>
          </div>
          <div className="fsf-tong">
            <small>Tổng tiền vốn:</small><b>{moneyD(row.tong)}</b>
          </div>
        </>
      }
    >
      <div className="stack" style={{ gap: 14 }}>
        <p className="pos-nhac" style={{ margin: 0 }}>
          <Icon n="info" className="ic sm" />
          Phiếu xuất kho theo định lượng sinh tự động từ chứng từ Xuất bán POS. Phiếu chỉ xem, không sửa hay xoá.
        </p>

        <section className="xdl-dau-phieu">
          <div className="xdl-dau-o">
            <small>Số chứng từ</small>
            <b className="code">{row.so}</b>
          </div>
          <div className="xdl-dau-o">
            <small>Ngày xuất kho</small>
            <b>{row.ngay}</b>
          </div>
          <div className="xdl-dau-o">
            <small>Cửa hàng</small>
            <b>{row.cn}</b>
          </div>
          <div className="xdl-dau-o">
            <small>Tham chiếu (Xuất bán POS)</small>
            <Link to={`/app/ban-hang/3-1-1/${row.posId}`} className="ds-link-so" title="Mở chứng từ Xuất bán POS">
              {row.posSo}
            </Link>
          </div>
          <div className="xdl-dau-o" style={{ gridColumn: 'span 2' }}>
            <small>Ghi chú</small>
            <span>{row.ghiChu}</span>
          </div>
          <div className="xdl-dau-o">
            <small>Nguồn / Người tạo</small>
            <span>{row.nguon} · {row.nguoiTao}</span>
          </div>
        </section>

        {isPro && (
          <div className="xdl-tabs">
            <button
              type="button"
              className={`xdl-tab${tab === 'ct' ? ' on' : ''}`}
              onClick={() => setTab('ct')}
            >
              Chi tiết xuất kho ({row.dong.length} món)
            </button>
            <button
              type="button"
              className={`xdl-tab${tab === 'ht' ? ' on' : ''}`}
              onClick={() => setTab('ht')}
            >
              Hạch toán
            </button>
          </div>
        )}

        {tab === 'ct' && (
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <table className="table xdl-tree-table">
              <thead>
                <tr>
                  <th style={{ width: 45 }}>#</th>
                  <th style={{ width: 250 }}>Hàng hoá</th>
                  <th style={{ width: 250 }}>Nguyên vật liệu</th>
                  <th style={{ width: 85, textAlign: 'center' }}>Đơn vị tính</th>
                  <th style={{ width: 95, textAlign: 'right' }}>Số lượng</th>
                  <th style={{ width: 110, textAlign: 'right' }}>Giá vốn</th>
                  <th style={{ width: 130, textAlign: 'right' }}>Tiền vốn</th>
                </tr>
              </thead>
              <tbody>
                {row.dong.map((m, i) => {
                  const key = `${m.ma}-${i}`
                  const thu = daThu[key]
                  return (
                    <Fragment key={key}>
                      <tr className={`xdl-row-cha${!m.coCongThuc ? ' xdl-khong-ct' : ''}`}>
                        <td className="dim">{i + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {m.coCongThuc ? (
                              <button
                                type="button"
                                className="xdl-toggle-btn"
                                onClick={() => toggleThu(key)}
                                title={thu ? 'Mở danh sách nguyên vật liệu' : 'Thu gọn danh sách nguyên vật liệu'}
                              >
                                <Icon n={thu ? 'chevron-right' : 'chevron-down'} className="ic sm" />
                              </button>
                            ) : (
                              <span style={{ display: 'inline-block', width: 22 }} />
                            )}
                            <span>
                              <b>{m.ten}</b> <small className="code dim">({m.ma})</small>
                            </span>
                          </div>
                        </td>
                        <td>
                          {!m.coCongThuc && <span className="dim xdl-chua-ct">Chưa có công thức</span>}
                        </td>
                        <td style={{ textAlign: 'center' }}>{m.dvt}</td>
                        <td style={{ textAlign: 'right' }}><b>{soLuong(m.sl)}</b></td>
                        <td style={{ textAlign: 'right' }}>—</td>
                        <td style={{ textAlign: 'right' }}><b>{m.tienVon ? money(m.tienVon) : '—'}</b></td>
                      </tr>
                      {m.coCongThuc && !thu && m.nvl.map((n, j) => (
                        <tr key={`${key}-${n.ma}-${j}`} className="xdl-row-con">
                          <td className="dim" style={{ textAlign: 'right', fontSize: 12 }}>{i + 1}.{j + 1}</td>
                          <td></td>
                          <td style={{ paddingLeft: 28 }}>
                            <span className="xdl-nvl-ten">{n.ten}</span> <small className="code dim">({n.ma})</small>
                          </td>
                          <td style={{ textAlign: 'center' }}>{n.dvt}</td>
                          <td style={{ textAlign: 'right' }}>{soLuong(n.sl)}</td>
                          <td style={{ textAlign: 'right' }}>{money(n.gia)}</td>
                          <td style={{ textAlign: 'right' }}>{money(n.tien)}</td>
                        </tr>
                      ))}
                    </Fragment>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}><b>Tổng cộng</b></td>
                  <td style={{ textAlign: 'right' }}><b>{soLuong(row.dong.reduce((a, m) => a + m.sl, 0))}</b></td>
                  <td></td>
                  <td style={{ textAlign: 'right' }}><b>{money(row.tong)}</b></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {tab === 'ht' && isPro && (
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 45 }}>#</th>
                  <th>Diễn giải</th>
                  <th style={{ width: 120 }}>TK Nợ</th>
                  <th style={{ width: 120 }}>TK Có</th>
                  <th style={{ width: 140, textAlign: 'right' }}>Số tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="dim">1</td>
                  <td>Giá vốn xuất bán theo định lượng</td>
                  <td className="code">632</td>
                  <td className="code">152</td>
                  <td style={{ textAlign: 'right' }}><b>{money(row.tong)}</b></td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}><b>Tổng cộng</b></td>
                  <td style={{ textAlign: 'right' }}><b>{money(row.tong)}</b></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </FormToanMan>
  )
}
