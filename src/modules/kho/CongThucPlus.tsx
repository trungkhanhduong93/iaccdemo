import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { duongDan, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { IconFigmaSearch } from '../../ui/IconFigma'
import { Select, Popover } from '../../ui/Dropdown'
import { CO_TRANG_DM, PhanTrang } from '../../ui/PhanTrang'
import { ONgay, docNgay } from '../../ui/ChonNgay'
import { NutExcel, NutThemMoiSplit } from '../../ui/CongCuDs'
import { ChipTrangThai, NutTuyChinhCot, useCotDs, type Chip } from '../../ui/LocNangCao'
import { fold } from '../../ui/format'
import { hangCua, apDungCuaHang, TT_CONG_THUC, soLuong, type NvlCongThuc } from './san-xuat'
import { nvlCua, useDsCongThuc } from './CongThuc'
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
const COT_NHOM_CT = ['nvlMa', 'nvlTen', 'nvlSl']

function dinhDangKenh(kenh?: string[]): string {
  if (!kenh || kenh.length === 0) return ''
  if (kenh.length === 1) return kenh[0]
  return `${kenh[0]} +${kenh.length - 1} kênh`
}

function dinhDangCuaHang(cuaHang?: string[]): string {
  if (!cuaHang || cuaHang.length === 0) return 'Tất cả cửa hàng'
  if (cuaHang.length === 1) return cuaHang[0]
  return `${cuaHang[0]} +${cuaHang.length - 1}`
}

function dinhDangSl(item?: NvlCongThuc): string {
  if (!item) return ''
  const dvt = item.dvt || hangCua(item.ma)?.dvt || ''
  const slStr = soLuong(item.sl)
  return dvt ? `${slStr} ${dvt}` : slStr
}

function renderOItem(k: string, item?: NvlCongThuc) {
  if (k === 'nvlMa') return <td key={k}>{item ? item.ma : ''}</td>
  if (k === 'nvlTen') return <td key={k}>{item ? (hangCua(item.ma)?.ten ?? item.ma) : ''}</td>
  if (k === 'nvlSl') return <td key={k} className="num">{dinhDangSl(item)}</td>
  return <td key={k} />
}

function renderODungChung(k: string, c: Row, ttDef: [string, string, string]) {
  if (k === 'ma') return <span className="code">{c.ma}</span>
  if (k === 'spMa') return c.spMa
  if (k === 'spTen') return hangCua(String(c.spMa))?.ten ?? c.spMa
  if (k === 'dvt') return c.dvt || hangCua(String(c.spMa))?.dvt || ''
  if (k === 'ngay') return c.ngay
  if (k === 'kenh') return dinhDangKenh(c.kenh as string[])
  if (k === 'cuaHang') return dinhDangCuaHang(c.cuaHang as string[])
  if (k === 'tt') {
    return (
      <span className="ctpl-tt">
        <i className="ctpl-tt-dot" style={{ background: ttDef[2] }} />
        <span>{ttDef[1]}</span>
      </span>
    )
  }
  if (k === 'moTa') return c.moTa ?? ''
  return null
}

function DsCongThucPlus({ sc, mod, ds }: ScreenProps & { ds: Row[] }) {
  const { toast } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)

  const [chip, setChip] = useState<string>('on')
  const [tim, setTim] = useState('')
  const [ngay, setNgay] = useState('')
  const [locSp, setLocSp] = useState('')
  const [locCuaHang, setLocCuaHang] = useState('')

  const [apTim, setApTim] = useState('')
  const [apNgay, setApNgay] = useState('')
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
    setApSp(locSp)
    setApCuaHang(locCuaHang)
    setTrang(1)
  }

  const lamMoiPheu = () => {
    setLocSp('')
    setLocCuaHang('')
  }

  const apDungPheu = () => {
    setApSp(locSp)
    setApCuaHang(locCuaHang)
    setTrang(1)
    setMoPheu(false)
  }

  const xoaHetLoc = () => {
    setTim('')
    setNgay('')
    setLocSp('')
    setLocCuaHang('')
    setApTim('')
    setApNgay('')
    setApSp('')
    setApCuaHang('')
    setChip('on')
    setTrang(1)
  }

  const dangLoc = Boolean(apTim || apNgay || apSp || apCuaHang)
  const khacNhap = tim !== apTim || ngay !== apNgay || locSp !== apSp || locCuaHang !== apCuaHang
  const soDangLocTrongPheu = [apSp, apCuaHang].filter(Boolean).length

  const truocChip = useMemo(() => {
    const q = fold(apTim.trim())
    const tuNgay = apNgay ? docNgay(apNgay) : null

    return ds.filter(c => {
      if (q) {
        const maCt = fold(String(c.ma ?? ''))
        const spMa = fold(String(c.spMa ?? ''))
        const spTen = fold(hangCua(String(c.spMa))?.ten ?? '')
        if (!maCt.includes(q) && !spMa.includes(q) && !spTen.includes(q)) return false
      }
      if (tuNgay) {
        const d = docNgay(String(c.ngay))
        if (d.getTime() < tuNgay.getTime()) return false
      }
      if (apSp && c.spMa !== apSp) return false
      if (apCuaHang && !apDungCuaHang(c.cuaHang as string[], apCuaHang)) return false
      return true
    })
  }, [ds, apTim, apNgay, apSp, apCuaHang])

  const chips: Chip[] = TT_CONG_THUC.map(([k, ten, mau]) => ({
    k,
    ten,
    mau,
    so: truocChip.filter(c => c.tt === k).length,
  }))

  const list = useMemo(() => {
    return chip ? truocChip.filter(c => c.tt === chip) : truocChip
  }, [truocChip, chip])

  const cols: Col[] = [
    { k: 'ma', t: 'Mã công thức', w: 104 },
    { k: 'spMa', t: 'Mã sản phẩm', w: 96 },
    { k: 'spTen', t: 'Tên sản phẩm', w: 170 },
    { k: 'dvt', t: 'Đơn vị tính', w: 76 },
    { k: 'ngay', t: 'Ngày áp dụng', w: 100 },
    { k: 'kenh', t: 'Kênh áp dụng', w: 130 },
    { k: 'nvlMa', t: 'Mã nguyên vật liệu', w: 104 },
    { k: 'nvlTen', t: 'Tên nguyên vật liệu', w: 170 },
    { k: 'nvlSl', t: 'Số lượng', w: 90, num: true },
    { k: 'cuaHang', t: 'Cửa hàng áp dụng', w: 150 },
    { k: 'tt', t: 'Trạng thái', w: 136 },
    { k: 'moTa', t: 'Mô tả', w: 200, an: true },
  ]
  const cot = useCotDs(path, cols, COT_CO_DINH)

  const nhomCtHien = cot.colsHien.filter(c => COT_NHOM_CT.includes(c.k))
  const soCotNhomHien = nhomCtHien.length

  const trangHt = Math.min(trang, Math.max(1, Math.ceil(list.length / coTrang)))
  const batDau = (trangHt - 1) * coTrang
  const trangNay = list.slice(batDau, batDau + coTrang)

  return (
    <div className="page page-voucher page-dm ctpl-ds">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <div className="dm-khung">
        <section className="card dm-bang">
          <div className="ds-toolbar-figma">
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
            <div className="ds-tim-figma">
              <IconFigmaSearch size={16} />
              <input
                type="text"
                placeholder="Tìm theo mã, tên"
                title="Tìm theo mã, tên"
                aria-label="Tìm kiếm"
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
              <NutThemMoiSplit toMoi={`${path}/moi`} />
            </div>
          </div>

          <div className="ds-hang-trang-thai">
            <div className="ds-thanh-h2-trai">
              <ChipTrangThai
                ds={chips}
                chon={chip}
                onChon={k => {
                  setChip(k)
                  setTrang(1)
                }}
              />
            </div>
            <div className="ds-toolbar-phai ds-cong-cu-h2">
              <span className="muted" style={{ fontSize: 12, marginRight: 4 }}>
                {list.length}/{ds.length} công thức
              </span>
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
            </div>
          </div>

          {list.length > 0 ? (
            <>
              <div className="tbl-wrap">
                <table className="tbl ctpl-bang">
                  <thead>
                    <tr>
                      {cot.colsHien.map(c => {
                        if (COT_NHOM_CT.includes(c.k)) {
                          if (c.k === nhomCtHien[0]?.k) {
                            return (
                              <th
                                key="nhom-ct"
                                colSpan={soCotNhomHien}
                                className="c"
                                style={{ textAlign: 'center' }}
                              >
                                Công thức
                              </th>
                            )
                          }
                          return null
                        }
                        return (
                          <th
                            key={c.k}
                            rowSpan={soCotNhomHien > 0 ? 2 : 1}
                            className={c.num ? 'num' : undefined}
                            style={c.w ? { width: c.w } : undefined}
                          >
                            {c.t}
                          </th>
                        )
                      })}
                    </tr>
                    {soCotNhomHien > 0 && (
                      <tr>
                        {nhomCtHien.map(c => (
                          <th
                            key={c.k}
                            className={c.num ? 'num' : undefined}
                            style={c.w ? { width: c.w } : undefined}
                          >
                            {c.t}
                          </th>
                        ))}
                      </tr>
                    )}
                  </thead>
                  {trangNay.map(c => {
                    const nvl = nvlCua(c)
                    const soDong = soCotNhomHien > 0 ? Math.max(1, nvl.length) : 1
                    const ttDef = TT_CONG_THUC.find(t => t[0] === c.tt) ?? TT_CONG_THUC[0]
                    return (
                      <tbody key={String(c.id)}>
                        {Array.from({ length: soDong }, (_, j) => {
                          const item = nvl[j]
                          return (
                            <tr
                              key={j}
                              className="click"
                              onClick={() => nav(`${path}/${c.id}`)}
                            >
                              {j === 0
                                ? cot.colsHien.map(col => {
                                    if (COT_NHOM_CT.includes(col.k)) {
                                      return renderOItem(col.k, item)
                                    }
                                    return (
                                      <td
                                        key={col.k}
                                        rowSpan={soDong}
                                        className="ctpl-gop"
                                        style={{ verticalAlign: 'top' }}
                                      >
                                        {renderODungChung(col.k, c, ttDef)}
                                      </td>
                                    )
                                  })
                                : nhomCtHien.map(col => renderOItem(col.k, item))}
                            </tr>
                          )
                        })}
                      </tbody>
                    )
                  })}
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
