import { useEffect, useMemo, useState, type FC } from 'react'
import type { ScreenDef } from '../../modules/types'
import { cuaHangHienTai, dsCuaHang, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { KY_CHON } from '../generic/ReportScreen'
import { CAU_HINH_BC } from '../../modules/bao-cao/danh-sach'
import {
  datKyNhap,
  datLoc,
  useTrangThaiLoc,
  xemBaoCao,
  xoaLoc,
} from '../bao-cao/tuyChinhBC'
import { Icon } from '../Icon'

export interface MBaoCaoLocProps {
  mo: boolean
  onDong: () => void
  path: string
  sc?: ScreenDef
}

export const MBaoCaoLoc: FC<MBaoCaoLocProps> = ({ mo, onDong, path, sc }) => {
  const { s, set } = useSession()
  const { loc, daXem } = useTrangThaiLoc(path)

  const [draftKy, setDraftKy] = useState<string>(() => daXem?.ky || '9')
  const [draftCn, setDraftCn] = useState<string>(() => s.cuaHang || 'all')
  const [draftLoc, setDraftLoc] = useState<Record<string, string[]>>(() => ({ ...(daXem?.loc || {}) }))

  const [trangCon, setTrangCon] = useState<string | null>(null)
  const [timKiem, setTimKiem] = useState('')

  useEffect(() => {
    if (mo) {
      setDraftKy(daXem?.ky || '9')
      setDraftCn(s.cuaHang || 'all')
      setDraftLoc({ ...(daXem?.loc || {}) })
      setTrangCon(null)
      setTimKiem('')
    }
  }, [mo, daXem, s.cuaHang])

  if (!mo) return null

  const dsCn = dsCuaHang(s).length ? dsCuaHang(s) : CUA_HANG
  const cnObj = dsCn.find(c => c.id === draftCn)
  const tenCn = draftCn === 'all' || !cnObj ? 'Tất cả cửa hàng' : ((cnObj as { ngan?: string; ten: string }).ngan ?? cnObj.ten)

  const tenKy = useMemo(() => {
    const found = KY_CHON.find(k => k[0] === draftKy)
    return found ? found[1].replace(' (đến 07/10)', '') : `Tháng ${draftKy}/2026`
  }, [draftKy])

  // Lấy các bộ lọc riêng khai trong CAU_HINH_BC hoặc sc.report
  const code = sc?.code ?? (sc?.slug?.includes('-') ? sc.slug.replace(/-/g, '.') : undefined)
  const cfgBc = code ? CAU_HINH_BC[code] : undefined
  const dsLocRieng = useMemo(() => {
    const res: { k: string; nhan: string; ds?: string[] }[] = []
    for (const l of cfgBc?.loc ?? []) {
      if (l.cheDo && !l.cheDo.includes(s.cheDo)) continue
      res.push({
        k: l.k,
        nhan: l.nhan,
        ds: l.ds ? l.ds(cuaHangHienTai(s)?.id) : undefined,
      })
    }
    return res
  }, [cfgBc, s])

  const handleReset = () => {
    setDraftKy('9')
    setDraftCn('all')
    setDraftLoc({})
  }

  const handleApply = () => {
    datKyNhap(path, draftKy)
    if (draftCn !== s.cuaHang) {
      set({ cuaHang: draftCn })
    }
    xoaLoc(path)
    Object.entries(draftLoc).forEach(([k, vals]) => {
      if (vals && vals.length > 0) {
        datLoc(path, k, vals)
      }
    })
    xemBaoCao(path)
    onDong()
  }

  const moTaLocRieng = (k: string, nhan: string) => {
    const vals = draftLoc[k] ?? []
    if (vals.length === 0) return 'Tất cả'
    if (vals.length === 1) return vals[0]
    return `${vals.length} ${nhan.toLowerCase()}`
  }

  const toggleChonMuc = (k: string, val: string) => {
    const cur = draftLoc[k] ?? []
    const next = cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val]
    setDraftLoc(prev => ({ ...prev, [k]: next }))
  }

  return (
    <div className="m-loc-overlay" onClick={onDong}>
      <div className="m-loc-tam" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="m-loc-dau">
          <h2 className="m-loc-tieu-de">Bộ lọc báo cáo</h2>
          <button type="button" className="m-loc-btn-dong" onClick={onDong} aria-label="Đóng">
            <Icon n="x" className="ic sm" />
          </button>
        </div>

        {/* Thân lọc */}
        <div className="m-loc-than">
          {/* Dòng Kỳ báo cáo */}
          <div className="m-loc-dong" onClick={() => setTrangCon('ky')}>
            <div className="m-loc-dong-trai">
              <span className="m-loc-dong-nhan">Kỳ báo cáo</span>
              <span className="m-loc-dong-tri">{tenKy}</span>
            </div>
            <Icon n="chevr" className="ic sm m-loc-dong-ic" />
          </div>

          {/* Dòng Cửa hàng */}
          <div className="m-loc-dong" onClick={() => setTrangCon('cn')}>
            <div className="m-loc-dong-trai">
              <span className="m-loc-dong-nhan">Cửa hàng</span>
              <span className="m-loc-dong-tri">{tenCn}</span>
            </div>
            <Icon n="chevr" className="ic sm m-loc-dong-ic" />
          </div>

          {/* Các dòng lọc riêng của báo cáo */}
          {dsLocRieng.map(l => (
            <div key={l.k} className="m-loc-dong" onClick={() => setTrangCon(`rieng-${l.k}`)}>
              <div className="m-loc-dong-trai">
                <span className="m-loc-dong-nhan">{l.nhan}</span>
                <span className="m-loc-dong-tri">{moTaLocRieng(l.k, l.nhan)}</span>
              </div>
              <Icon n="chevr" className="ic sm m-loc-dong-ic" />
            </div>
          ))}
        </div>

        {/* Chân lọc */}
        <div className="m-loc-day">
          <button type="button" className="m-loc-btn-reset" onClick={handleReset}>
            Đặt lại
          </button>
          <button type="button" className="m-loc-btn-apply" onClick={handleApply}>
            Áp dụng
          </button>
        </div>
      </div>

      {/* Trang con chọn kỳ */}
      {trangCon === 'ky' && (
        <div className="m-loc-trang-con" onClick={e => e.stopPropagation()}>
          <div className="m-thanh-tren">
            <div className="m-thanh-tren-trai">
              <button
                type="button"
                className="m-nut-back"
                onClick={() => setTrangCon(null)}
                aria-label="Quay lại"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            </div>
            <h1 className="m-thanh-tren-tieu-de">Chọn kỳ báo cáo</h1>
          </div>
          <div className="m-loc-ds-muc" style={{ padding: '8px 16px' }}>
            {KY_CHON.map(([k, t]) => {
              const chon = draftKy === k
              return (
                <div
                  key={k}
                  className={`m-loc-muc-dong ${chon ? 'on' : ''}`}
                  onClick={() => {
                    setDraftKy(k)
                    setTrangCon(null)
                  }}
                >
                  <span className="m-loc-muc-ten">{t.replace(' (đến 07/10)', '')}</span>
                  {chon && <Icon n="check" className="ic sm" />}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Trang con chọn cửa hàng */}
      {trangCon === 'cn' && (
        <div className="m-loc-trang-con" onClick={e => e.stopPropagation()}>
          <div className="m-thanh-tren">
            <div className="m-thanh-tren-trai">
              <button
                type="button"
                className="m-nut-back"
                onClick={() => setTrangCon(null)}
                aria-label="Quay lại"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            </div>
            <h1 className="m-thanh-tren-tieu-de">Chọn cửa hàng</h1>
          </div>
          <div className="m-loc-ds-muc" style={{ padding: '8px 16px' }}>
            <div
              className={`m-loc-muc-dong ${draftCn === 'all' ? 'on' : ''}`}
              onClick={() => {
                setDraftCn('all')
                setTrangCon(null)
              }}
            >
              <span className="m-loc-muc-ten">Tất cả cửa hàng</span>
              {draftCn === 'all' && <Icon n="check" className="ic sm" />}
            </div>
            {dsCn.map(c => {
              const chon = draftCn === c.id
              return (
                <div
                  key={c.id}
                  className={`m-loc-muc-dong ${chon ? 'on' : ''}`}
                  onClick={() => {
                    setDraftCn(c.id)
                    setTrangCon(null)
                  }}
                >
                  <span className="m-loc-muc-ten">{c.ten}</span>
                  {chon && <Icon n="check" className="ic sm" />}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Trang con lọc riêng */}
      {trangCon?.startsWith('rieng-') && (() => {
        const k = trangCon.replace('rieng-', '')
        const item = dsLocRieng.find(x => x.k === k)
        if (!item) return null
        const dsMuc = item.ds ?? []
        const dsLoc = timKiem.trim()
          ? dsMuc.filter(m => m.toLowerCase().includes(timKiem.trim().toLowerCase()))
          : dsMuc

        return (
          <div className="m-loc-trang-con" onClick={e => e.stopPropagation()}>
            <div className="m-thanh-tren">
              <div className="m-thanh-tren-trai">
                <button
                  type="button"
                  className="m-nut-back"
                  onClick={() => {
                    setTrangCon(null)
                    setTimKiem('')
                  }}
                  aria-label="Quay lại"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
              </div>
              <h1 className="m-thanh-tren-tieu-de">{item.nhan}</h1>
            </div>

            {dsMuc.length > 5 && (
              <div style={{ padding: '8px 16px' }}>
                <div className="m-ds-tim">
                  <Icon n="search" className="m-ds-tim-ic ic sm" />
                  <input
                    type="text"
                    className="m-ds-tim-inp"
                    placeholder={`Tìm ${item.nhan.toLowerCase()}...`}
                    value={timKiem}
                    onChange={e => setTimKiem(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="m-loc-ds-muc" style={{ padding: '8px 16px' }}>
              {dsLoc.length === 0 ? (
                <div className="m-loc-muc-trong">Không có dữ liệu lọc</div>
              ) : (
                dsLoc.map(val => {
                  const chon = (draftLoc[k] ?? []).includes(val)
                  return (
                    <div
                      key={val}
                      className={`m-loc-muc-dong ${chon ? 'on' : ''}`}
                      onClick={() => toggleChonMuc(k, val)}
                    >
                      <div className={`m-loc-checkbox ${chon ? 'on' : ''}`}>
                        {chon && <Icon n="check" className="ic sm" />}
                      </div>
                      <span className="m-loc-muc-ten">{val}</span>
                    </div>
                  )
                })
              )}
            </div>

            <div className="m-loc-day">
              <button
                type="button"
                className="m-loc-btn-apply m-loc-con-btn-xong"
                onClick={() => {
                  setTrangCon(null)
                  setTimKiem('')
                }}
              >
                Xong
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
