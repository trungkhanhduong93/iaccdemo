import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { duongDan, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Select, Popover } from '../../ui/Dropdown'
import { CO_TRANG_DM, PhanTrang } from '../../ui/PhanTrang'
import { ONgay, docNgay } from '../../ui/ChonNgay'
import { NutExcel, NutThemMoiSplit } from '../../ui/CongCuDs'
import { NutTuyChinhCot, useCotDs } from '../../ui/LocNangCao'
import { fold } from '../../ui/format'
import { hangCua, apDungCuaHang, TT_CONG_THUC } from './san-xuat'
import { useDsCongThuc } from './CongThuc'
import { FormCongThucPlus } from './CongThucPlusForm'

export function CongThucPlusScreen({ sc, mod }: ScreenProps) {
  const { id } = useParams()
  const ds = useDsCongThuc('cb')

  return (
    <>
      <DsCongThucPlus sc={sc} mod={mod} ds={ds} />
      {id !== undefined && (
        <FormCongThucPlus
          key={id}
          sc={sc}
          mod={mod}
          ct={id === 'moi' ? undefined : ds.find(c => c.id === id)}
          soCt={ds.length}
        />
      )}
    </>
  )
}

// ── Màn 1: Danh sách ──

const COT_CO_DINH = new Set(['ma'])

function DsCongThucPlus({ sc, mod, ds }: ScreenProps & { ds: Row[] }) {
  const { toast } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)

  const [tim, setTim] = useState('')
  const [ngay, setNgay] = useState('')
  const [locTt, setLocTt] = useState('')
  const [locSp, setLocSp] = useState('')
  const [locCuaHang, setLocCuaHang] = useState('')

  const [apTim, setApTim] = useState('')
  const [apNgay, setApNgay] = useState('')
  const [apTt, setApTt] = useState('')
  const [apSp, setApSp] = useState('')
  const [apCuaHang, setApCuaHang] = useState('')

  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(50)

  const nutPheu = useRef<HTMLButtonElement>(null)
  const [moPheu, setMoPheu] = useState(false)

  const dsSp = useMemo(() => {
    return [...new Set(ds.map(c => String(c.spMa)))].map(ma => ({
      v: ma,
      t: `${hangCua(ma)?.ten ?? ma} - ${ma}`,
    }))
  }, [ds])

  const apLoc = () => {
    setApTim(tim)
    setApNgay(ngay)
    setApTt(locTt)
    setApSp(locSp)
    setApCuaHang(locCuaHang)
    setTrang(1)
  }

  const lamMoiPheu = () => {
    setLocTt('')
    setLocSp('')
    setLocCuaHang('')
  }

  const apDungPheu = () => {
    setApTt(locTt)
    setApSp(locSp)
    setApCuaHang(locCuaHang)
    setTrang(1)
    setMoPheu(false)
  }

  const xoaHetLoc = () => {
    setTim('')
    setNgay('')
    setLocTt('')
    setLocSp('')
    setLocCuaHang('')
    setApTim('')
    setApNgay('')
    setApTt('')
    setApSp('')
    setApCuaHang('')
    setTrang(1)
  }

  const dangLoc = Boolean(apTim || apNgay || apTt || apSp || apCuaHang)
  const khacNhap = tim !== apTim || ngay !== apNgay || locTt !== apTt || locSp !== apSp || locCuaHang !== apCuaHang
  const soDangLocTrongPheu = [apTt, apSp, apCuaHang].filter(Boolean).length

  const list = useMemo(() => {
    const q = fold(apTim.trim())
    const tuNgay = apNgay ? docNgay(apNgay) : null

    return ds.filter(c => {
      if (q && !fold(String(c.ma ?? '')).includes(q)) return false
      if (tuNgay) {
        const d = docNgay(String(c.ngay))
        if (d.getTime() < tuNgay.getTime()) return false
      }
      if (apTt && c.tt !== apTt) return false
      if (apSp && c.spMa !== apSp) return false
      if (apCuaHang && !apDungCuaHang(c.cuaHang as string[], apCuaHang)) return false
      return true
    })
  }, [ds, apTim, apNgay, apTt, apSp, apCuaHang])

  const cols: Col[] = [
    { k: 'ma', t: 'Mã công thức', w: 140 },
    { k: 'spMa', t: 'Mã sản phẩm', w: 130 },
    { k: 'spTen', t: 'Tên sản phẩm', w: 220 },
    { k: 'dvt', t: 'Đơn vị tính', w: 100 },
    { k: 'ngay', t: 'Ngày áp dụng', w: 120 },
    { k: 'moTa', t: 'Mô tả', w: 200 },
    { k: 'tt', t: 'Trạng thái', w: 140 },
  ]
  const cot = useCotDs(path, cols, COT_CO_DINH)

  const trangHt = Math.min(trang, Math.max(1, Math.ceil(list.length / coTrang)))
  const batDau = (trangHt - 1) * coTrang
  const trangNay = list.slice(batDau, batDau + coTrang)

  return (
    <div className="page page-voucher page-dm ctpl-ds">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <div className="dm-khung">
        <section className="card dm-bang">
          <div className="ds-toolbar-figma">
            <div className="ctpl-tim">
              <input
                type="text"
                className="inp"
                placeholder="Tìm theo mã công thức"
                value={tim}
                onChange={e => setTim(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') apLoc() }}
              />
            </div>
            <div className="ctpl-ngay">
              <ONgay
                value={ngay}
                placeholder="Áp dụng từ ngày"
                onChange={v => setNgay(v)}
              />
            </div>
            <button
              ref={nutPheu}
              type="button"
              className={`ds-btn-pheu-figma${moPheu || soDangLocTrongPheu > 0 ? ' on' : ''}`}
              title="Bộ lọc"
              aria-label="Bộ lọc"
              aria-expanded={moPheu}
              onClick={() => setMoPheu(o => !o)}
            >
              <Icon n="filter" className="ic sm" />
              {soDangLocTrongPheu > 0 && <span className="ds-badge-so">{soDangLocTrongPheu}</span>}
            </button>
            <button
              type="button"
              className="btn pri ds-nut-loc ctpl-nut-loc"
              title={khacNhap ? 'Có điều kiện mới, bấm Lọc để tải lại' : undefined}
              onClick={apLoc}
            >
              Lọc{khacNhap && <span className="ds-cham-nhap" />}
            </button>

            <Popover
              anchor={nutPheu}
              open={moPheu}
              onClose={() => setMoPheu(false)}
              align="start"
              role="dialog"
              className="ctpl-pheu-pop"
            >
              <label className="ctpl-loc-o">
                <span>Trạng thái</span>
                <Select
                  value={locTt}
                  onChange={e => setLocTt(e.target.value)}
                  ds={[{ v: '', t: 'Tất cả' }, ...TT_CONG_THUC.map(([v, t]) => ({ v, t }))]}
                />
              </label>
              <label className="ctpl-loc-o">
                <span>Sản phẩm</span>
                <Select
                  value={locSp}
                  onChange={e => setLocSp(e.target.value)}
                  ds={[{ v: '', t: 'Tất cả' }, ...dsSp]}
                />
              </label>
              <label className="ctpl-loc-o">
                <span>Cửa hàng</span>
                <Select
                  value={locCuaHang}
                  onChange={e => setLocCuaHang(e.target.value)}
                  ds={[{ v: '', t: 'Tất cả' }, ...CUA_HANG.map(c => ({ v: c.ten, t: c.ten }))]}
                />
              </label>
              <div className="ctpl-loc-day">
                <button type="button" className="btn sm" onClick={lamMoiPheu}>Làm mới</button>
                <button type="button" className="btn sm pri" onClick={apDungPheu}>Áp dụng</button>
              </div>
            </Popover>

            <div className="ds-toolbar-phai">
              <NutExcel
                onNhap={() => toast('Nhập công thức từ Excel')}
                onXuat={() => toast(`Đã xuất ${list.length} công thức ra Excel`)}
              />
              <NutTuyChinhCot
                cols={cot.colsDu}
                an={cot.an}
                coDinh={COT_CO_DINH}
                macDinh={cot.macDinh}
                dongBang={cot.dongBang}
                onLuu={cot.luu}
                onDoRongTuDong={cot.datDoRongTuDong}
              />
              <NutThemMoiSplit toMoi={`${path}/moi`} />
            </div>
          </div>

          {list.length > 0 ? (
            <>
              <div className="tbl-wrap">
                <table className="tbl ctpl-bang">
                  <thead>
                    <tr>
                      {cot.colsHien.map(c => (
                        <th key={c.k} style={c.w ? { width: c.w } : undefined}>
                          {c.t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trangNay.map(c => {
                      const ttDef = TT_CONG_THUC.find(t => t[0] === c.tt) ?? TT_CONG_THUC[0]
                      return (
                        <tr
                          key={String(c.id)}
                          className="click"
                          onClick={() => nav(`${path}/${c.id}`)}
                        >
                          {cot.colsHien.map(col => (
                            <td key={col.k}>
                              {col.k === 'ma' ? (
                                <span className="code">{c.ma}</span>
                              ) : col.k === 'spMa' ? (
                                c.spMa
                              ) : col.k === 'spTen' ? (
                                hangCua(String(c.spMa))?.ten ?? c.spMa
                              ) : col.k === 'dvt' ? (
                                c.dvt || hangCua(String(c.spMa))?.dvt || ''
                              ) : col.k === 'ngay' ? (
                                c.ngay
                              ) : col.k === 'moTa' ? (
                                c.moTa
                              ) : col.k === 'tt' ? (
                                <span className="ctpl-tt">
                                  <i className="ctpl-tt-dot" style={{ background: ttDef[2] }} />
                                  <span>{ttDef[1]}</span>
                                </span>
                              ) : null}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <PhanTrang
                tong={list.length}
                trang={trangHt}
                coTrang={coTrang}
                dsCoTrang={CO_TRANG_DM}
                onTrang={setTrang}
                onCoTrang={ct => { setCoTrang(ct); setTrang(1) }}
              />
            </>
          ) : (
            <div className="empty">
              <b>Không có công thức khớp bộ lọc</b>
              <button type="button" className="btn sm empty-btn" onClick={xoaHetLoc}>
                Xoá bộ lọc
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
