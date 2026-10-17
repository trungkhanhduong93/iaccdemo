import { useEffect, useMemo, useState, type FC } from 'react'
import type { ScreenDef } from '../../modules/types'
import { cuaHangHienTai, dsCuaHang, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { CAU_HINH_BC } from '../../modules/bao-cao/danh-sach'
import {
  datKyNhap,
  datLoc,
  useTrangThaiLoc,
  xemBaoCao,
  xoaLoc,
} from '../bao-cao/tuyChinhBC'
import { ChonKhoangNgay, type KhoangNgay } from '../ChonNgay'
import { Icon } from '../Icon'
import {
  datKhoangNgayMobile,
  dinhDangKyMobile,
  layKhoangNgayMobile,
  ngayCuoiThang,
} from './kyBaoCaoMobile'

export interface MBaoCaoLocProps {
  mo: boolean
  onDong: () => void
  path: string
  sc?: ScreenDef
}

export const MBaoCaoLoc: FC<MBaoCaoLocProps> = ({ mo, onDong, path, sc }) => {
  const { s, set } = useSession()
  const { loc, daXem } = useTrangThaiLoc(path)

  const [draftTuNgay, setDraftTuNgay] = useState<string>(() => layKhoangNgayMobile(path, daXem?.ky).tu)
  const [draftDenNgay, setDraftDenNgay] = useState<string>(() => layKhoangNgayMobile(path, daXem?.ky).den)
  const [draftCn, setDraftCn] = useState<string>(() => s.cuaHang || 'all')
  const [draftLoc, setDraftLoc] = useState<Record<string, string[]>>(() => ({ ...(daXem?.loc || {}) }))

  const [trangCon, setTrangCon] = useState<string | null>(null)
  const [timKiem, setTimKiem] = useState('')

  // Trạng thái tạm để Huỷ quay về giá trị trước khi mở bảng con (T343)
  const [tamKy, setTamKy] = useState<{ tu: string; den: string }>({ tu: '', den: '' })
  const [tamCn, setTamCn] = useState<string>('all')
  const [tamLocRieng, setTamLocRieng] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (mo) {
      const kn = layKhoangNgayMobile(path, daXem?.ky)
      setDraftTuNgay(kn.tu)
      setDraftDenNgay(kn.den)
      setDraftCn(s.cuaHang || 'all')
      setDraftLoc({ ...(daXem?.loc || {}) })
      setTrangCon(null)
      setTimKiem('')
    }
  }, [mo, daXem, s.cuaHang, path])

  if (!mo) return null

  const dsCn = dsCuaHang(s).length ? dsCuaHang(s) : CUA_HANG
  const cnObj = dsCn.find(c => c.id === draftCn)
  const tenCn = draftCn === 'all' || !cnObj ? 'Tất cả cửa hàng' : ((cnObj as { ngan?: string; ten: string }).ngan ?? cnObj.ten)

  const tenKy = dinhDangKyMobile(draftTuNgay, draftDenNgay, daXem?.ky)

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

  const chonThangNay = () => {
    setDraftTuNgay('2026-10-01')
    setDraftDenNgay('2026-10-31')
  }

  const chonThangTruoc = () => {
    setDraftTuNgay('2026-09-01')
    setDraftDenNgay('2026-09-30')
  }

  const isThangNay = draftTuNgay === '2026-10-01' && (draftDenNgay === '2026-10-31' || draftDenNgay === '2026-10-07')
  const isThangTruoc = draftTuNgay === '2026-09-01' && draftDenNgay === '2026-09-30'

  // Bảng lịch chạm Từ ngày rồi Đến ngày (T322); số liệu tính theo tháng của Từ ngày nên Đến ngày không vượt cuối tháng đó
  const khoangLich = useMemo<KhoangNgay>(() => {
    const doc = (v: string) => {
      const [y, m, d] = v.split('-').map(Number)
      return new Date(y, m - 1, d)
    }
    return { tu: doc(draftTuNgay), den: doc(draftDenNgay) }
  }, [draftTuNgay, draftDenNgay])

  const handleChonKhoang = (k: KhoangNgay) => {
    const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const y = k.tu.getFullYear()
    const m = k.tu.getMonth() + 1
    const tu = iso(y, m, k.tu.getDate())
    const den = iso(k.den.getFullYear(), k.den.getMonth() + 1, k.den.getDate())
    const maxD = iso(y, m, ngayCuoiThang(y, m))
    setDraftTuNgay(tu)
    setDraftDenNgay(den > maxD ? maxD : den)
  }

  const handleReset = () => {
    setDraftTuNgay('2026-09-01')
    setDraftDenNgay('2026-09-30')
    setDraftCn('all')
    setDraftLoc({})
  }

  const handleApply = () => {
    const thang = String(Number(draftTuNgay.split('-')[1]) || 9)
    datKyNhap(path, thang)
    datKhoangNgayMobile(path, { tu: draftTuNgay, den: draftDenNgay })
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
          <div
            className="m-loc-dong"
            onClick={() => {
              setTamKy({ tu: draftTuNgay, den: draftDenNgay })
              setTrangCon('ky')
            }}
          >
            <div className="m-loc-dong-trai">
              <span className="m-loc-dong-nhan">Kỳ báo cáo</span>
              <span className="m-loc-dong-tri">{tenKy}</span>
            </div>
            <Icon n="chevr" className="ic sm m-loc-dong-ic" />
          </div>

          {/* Dòng Cửa hàng */}
          <div
            className="m-loc-dong"
            onClick={() => {
              setTamCn(draftCn)
              setTrangCon('cn')
            }}
          >
            <div className="m-loc-dong-trai">
              <span className="m-loc-dong-nhan">Cửa hàng</span>
              <span className="m-loc-dong-tri">{tenCn}</span>
            </div>
            <Icon n="chevr" className="ic sm m-loc-dong-ic" />
          </div>

          {/* Các dòng lọc riêng của báo cáo */}
          {dsLocRieng.map(l => (
            <div
              key={l.k}
              className="m-loc-dong"
              onClick={() => {
                setTamLocRieng({ ...draftLoc })
                setTrangCon(`rieng-${l.k}`)
              }}
            >
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

      {/* Lớp nền mờ khi bảng con bật lên đè lên bảng chính */}
      {trangCon && (
        <div
          className="m-loc-con-overlay"
          onClick={e => {
            e.stopPropagation()
            if (trangCon === 'ky') {
              setDraftTuNgay(tamKy.tu)
              setDraftDenNgay(tamKy.den)
            } else if (trangCon === 'cn') {
              setDraftCn(tamCn)
            } else if (trangCon.startsWith('rieng-')) {
              setDraftLoc(tamLocRieng)
              setTimKiem('')
            }
            setTrangCon(null)
          }}
        />
      )}

      {/* Trang con chọn kỳ (cao 50% màn hình, đè lên bảng chính) */}
      {trangCon === 'ky' && (
        <div className="m-loc-trang-con" onClick={e => e.stopPropagation()}>
          <div className="m-loc-dau">
            <h2 className="m-loc-tieu-de">Chọn kỳ báo cáo</h2>
            <button
              type="button"
              className="m-loc-btn-dong"
              onClick={() => {
                setDraftTuNgay(tamKy.tu)
                setDraftDenNgay(tamKy.den)
                setTrangCon(null)
              }}
              aria-label="Đóng"
            >
              <Icon n="x" className="ic sm" />
            </button>
          </div>
          <div className="m-loc-con-than">
            <div className="m-loc-the-nhan">Chọn nhanh</div>
            <div className="m-loc-ky-ds">
              <button
                type="button"
                className={`m-loc-ky-btn ${isThangNay ? 'on' : ''}`}
                onClick={chonThangNay}
              >
                Tháng này
              </button>
              <button
                type="button"
                className={`m-loc-ky-btn ${isThangTruoc ? 'on' : ''}`}
                onClick={chonThangTruoc}
              >
                Tháng trước
              </button>
            </div>

            <div className="m-loc-the-nhan m-loc-cach-tren">Khoảng ngày trong kỳ</div>
            <div className="m-loc-kn-picker">
              <ChonKhoangNgay value={khoangLich} onChange={handleChonKhoang} />
            </div>
          </div>

          <div className="m-loc-day">
            <button
              type="button"
              className="m-loc-btn-reset"
              onClick={() => {
                setDraftTuNgay(tamKy.tu)
                setDraftDenNgay(tamKy.den)
                setTrangCon(null)
              }}
            >
              Huỷ
            </button>
            <button
              type="button"
              className="m-loc-btn-apply m-loc-con-btn-xong"
              onClick={() => setTrangCon(null)}
            >
              Xong
            </button>
          </div>
        </div>
      )}

      {/* Trang con chọn cửa hàng (cao 50% màn hình, đè lên bảng chính) */}
      {trangCon === 'cn' && (
        <div className="m-loc-trang-con" onClick={e => e.stopPropagation()}>
          <div className="m-loc-dau">
            <h2 className="m-loc-tieu-de">Chọn cửa hàng</h2>
            <button
              type="button"
              className="m-loc-btn-dong"
              onClick={() => {
                setDraftCn(tamCn)
                setTrangCon(null)
              }}
              aria-label="Đóng"
            >
              <Icon n="x" className="ic sm" />
            </button>
          </div>
          <div className="m-loc-ds-muc" style={{ padding: '8px 16px' }}>
            <div
              className={`m-loc-muc-dong ${draftCn === 'all' ? 'on' : ''}`}
              onClick={() => setDraftCn('all')}
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
                  onClick={() => setDraftCn(c.id)}
                >
                  <span className="m-loc-muc-ten">{c.ten}</span>
                  {chon && <Icon n="check" className="ic sm" />}
                </div>
              )
            })}
          </div>

          <div className="m-loc-day">
            <button
              type="button"
              className="m-loc-btn-reset"
              onClick={() => {
                setDraftCn(tamCn)
                setTrangCon(null)
              }}
            >
              Huỷ
            </button>
            <button
              type="button"
              className="m-loc-btn-apply m-loc-con-btn-xong"
              onClick={() => setTrangCon(null)}
            >
              Xong
            </button>
          </div>
        </div>
      )}

      {/* Trang con lọc riêng (cao 50% màn hình, đè lên bảng chính) */}
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
            <div className="m-loc-dau">
              <h2 className="m-loc-tieu-de">{item.nhan}</h2>
              <button
                type="button"
                className="m-loc-btn-dong"
                onClick={() => {
                  setDraftLoc(tamLocRieng)
                  setTrangCon(null)
                  setTimKiem('')
                }}
                aria-label="Đóng"
              >
                <Icon n="x" className="ic sm" />
              </button>
            </div>

            {dsMuc.length > 5 && (
              <div style={{ padding: '8px 16px', flex: 'none' }}>
                <div className="m-ds-tim">
                  <Icon n="search" className="m-ds-tim-ic ic sm" />
                  <input
                    type="text"
                    className="m-ds-tim-inp m-loc-tim-inp"
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
                className="m-loc-btn-reset"
                onClick={() => {
                  setDraftLoc(tamLocRieng)
                  setTrangCon(null)
                  setTimKiem('')
                }}
              >
                Huỷ
              </button>
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
