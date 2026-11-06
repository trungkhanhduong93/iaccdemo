import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { duongDan, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { IconFigmaSearch } from '../../ui/IconFigma'
import { Select } from '../../ui/Dropdown'
import { CO_TRANG_DM, PhanTrang } from '../../ui/PhanTrang'
import { ONgay, docNgay } from '../../ui/ChonNgay'
import { NutExcel, NutThemMoiSplit } from '../../ui/CongCuDs'
import { BoLoc, ChipTrangThai, NutTuyChinhCot, useCauHinhLoc, useCotDs, useLocNhap, type Chip, type OLocDef } from '../../ui/LocNangCao'
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
  const locCt = useLocNhap(() => ({ q: '', ngay: '', sp: '', cuaHang: '' }))

  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(50)

  const dsSp = useMemo(() => {
    return [...new Set(ds.map(c => String(c.spMa)))].map(ma => ({
      v: ma,
      t: `${hangCua(ma)?.ten ?? ma} - ${ma}`,
    }))
  }, [ds])

  const apLoc = () => {
    locCt.loc()
    setTrang(1)
  }

  const xoaHetLoc = () => {
    locCt.xoaHet()
    setChip('on')
    setTrang(1)
  }

  // Bộ lọc nâng cao dùng chung như danh mục hàng hoá (T760)
  const oNgay = <ONgay value={locCt.nhap.ngay} placeholder="Áp dụng từ ngày" onChange={v => locCt.dat('ngay', v)} />
  const oLoc: OLocDef[] = [
    {
      k: 'tim', ten: 'Tìm kiếm', coGiaTri: Boolean(locCt.nhap.q.trim()),
      o: <input className="ds-o-inp" value={locCt.nhap.q} placeholder="Tìm theo mã, tên" onChange={e => locCt.dat('q', e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') apLoc() }} />,
    },
    { k: 'ngay', ten: 'Áp dụng từ ngày', coGiaTri: Boolean(locCt.nhap.ngay), o: oNgay },
    {
      k: 'sp', ten: 'Sản phẩm', coGiaTri: Boolean(locCt.nhap.sp),
      o: <Select className="ds-o-sel" aria-label="Sản phẩm" value={locCt.nhap.sp} onChange={e => locCt.dat('sp', e.target.value)} ds={[{ v: '', t: 'Tất cả' }, ...dsSp]} />,
    },
    {
      k: 'cuaHang', ten: 'Cửa hàng', coGiaTri: Boolean(locCt.nhap.cuaHang),
      o: <Select className="ds-o-sel" aria-label="Cửa hàng" value={locCt.nhap.cuaHang} onChange={e => locCt.dat('cuaHang', e.target.value)} ds={[{ v: '', t: 'Tất cả' }, ...CUA_HANG.map(c => ({ v: c.ten, t: c.ten }))]} />,
    },
  ]
  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(path, oLoc.map(o => o.k), ['tim', 'ngay'])

  const truocChip = useMemo(() => {
    const { q: tim, ngay, sp, cuaHang } = locCt.ap
    const q = fold(tim.trim())
    const tuNgay = ngay ? docNgay(ngay) : null

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
      if (sp && c.spMa !== sp) return false
      if (cuaHang && !apDungCuaHang(c.cuaHang as string[], cuaHang)) return false
      return true
    })
  }, [ds, locCt.ap])

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
            <BoLoc
              ds={oLoc}
              cauHinh={cauHinhLoc}
              datCauHinh={datCauHinhLoc}
              dangLoc={locCt.dangLoc}
              khacNhap={locCt.khacNhap}
              onLoc={apLoc}
              onXoaHet={xoaHetLoc}
              chiNutPheu
              ngoaiRieng={{
                tim: (
                  <div key="tim" className="ds-tim-figma">
                    <IconFigmaSearch size={16} />
                    <input
                      type="text"
                      placeholder="Tìm theo mã, tên"
                      title="Tìm theo mã, tên"
                      aria-label="Tìm kiếm"
                      value={locCt.nhap.q}
                      onChange={e => locCt.dat('q', e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') apLoc() }}
                    />
                  </div>
                ),
                ngay: <div key="ngay" className="ctpl-ngay">{oNgay}</div>,
              }}
            />

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
