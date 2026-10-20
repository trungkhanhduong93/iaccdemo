import { useMemo, useState, useEffect, useRef, type FC } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { ScreenDef, ScreenProps } from '../../modules/types'
import { GOI, anNgoaiGoi } from '../../app/plan'
import { hienMan, moDuoc, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { layNhomBaoCao } from '../../modules/bao-cao/TrungTam'
import { kyHieuBC } from '../../modules/bao-cao/danh-sach'
import { fold } from '../format'
import { Icon } from '../Icon'
import { MTrong } from './MTrong'

import icThuTien from '../../assets/figma/gradient/thu-tien.svg'
import icChiTien from '../../assets/figma/gradient/chi-tien.svg'
import icBanHang from '../../assets/figma/gradient/ban-hang.svg'
import icMuaHang from '../../assets/figma/gradient/mua-hang.svg'
import icNhapKho from '../../assets/figma/gradient/nhap-kho.svg'
import icBaoCao from '../../assets/figma/gradient/bao-cao.svg'
import icKeKhaiThue from '../../assets/figma/gradient/ke-khai-thue.svg'
import icDanhMuc from '../../assets/figma/gradient/danh-muc.svg'

function layIconNhom(key: string): string {
  switch (key) {
    case 'tien':
      return icThuTien
    case 'ban-hang':
      return icBanHang
    case 'mua-hang':
      return icMuaHang
    case 'cong-no':
      return icChiTien
    case 'kho':
      return icNhapKho
    case 'tong-hop':
      return icBaoCao
    case 'thue':
      return icKeKhaiThue
    case 'danh-muc':
      return icDanhMuc
    default:
      return icBaoCao
  }
}

function docGhim(): string[] {
  try {
    const raw = localStorage.getItem('bc-ghim')
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function luuGhim(slugs: string[]) {
  try {
    localStorage.setItem('bc-ghim', JSON.stringify(slugs))
  } catch {}
}

function docGanDay(): string[] {
  try {
    const raw = localStorage.getItem('bc-gan-day')
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

// Báo cáo mặc định ban đầu cho mục Gần đây nếu chưa có lịch sử (T500)
const MAC_DINH_GAN_DAY = ['2-2-1', '5-2-1', '10-2-3']

export const MBaoCao: FC<ScreenProps> = ({ sc, mod }) => {
  const { s } = useSession()
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [ghim, setGhim] = useState<string[]>(() => docGhim())
  const [ganDay, setGanDay] = useState<string[]>(() => {
    const ds = docGanDay()
    return ds.length > 0 ? ds : MAC_DINH_GAN_DAY
  })

  // Timer để phát hiện nhấn giữ trên điện thoại
  const holdTimerRef = useRef<number | null>(null)

  const nhomTatCa = useMemo(() => layNhomBaoCao(s), [s])

  // Lấy toàn bộ màn báo cáo hợp lệ trong gói để tra cứu
  const tatCaBcHien = useMemo(() => {
    const map = new Map<string, ScreenDef>()
    for (const g of nhomTatCa) {
      for (const item of g.screens) {
        if (hienMan(item, s.goi, s.cheDo, s) && (!anNgoaiGoi(s.goi) || moDuoc(item, s.goi))) {
          map.set(item.slug, item)
        }
      }
    }
    return Array.from(map.values())
  }, [nhomTatCa, s])

  // Danh sách các nhóm có ít nhất 1 báo cáo hợp lệ
  const nhomHienThi = useMemo(() => {
    return nhomTatCa
      .map(g => ({
        ...g,
        screens: g.screens.filter(x => hienMan(x, s.goi, s.cheDo, s) && (!anNgoaiGoi(s.goi) || moDuoc(x, s.goi))),
      }))
      .filter(g => g.screens.length > 0)
  }, [nhomTatCa, s])

  // Tổng số báo cáo và tổng số nhóm
  const tongSoBc = useMemo(() => {
    return nhomHienThi.reduce((acc, g) => acc + g.screens.length, 0)
  }, [nhomHienThi])

  const tongSoNhom = nhomHienThi.length

  // Báo cáo gần đây (lấy tối đa 6 chip)
  const dsGanDay = useMemo(() => {
    const res: ScreenDef[] = []
    const seen = new Set<string>()
    for (const slug of ganDay) {
      if (seen.has(slug)) continue
      seen.add(slug)
      const found = tatCaBcHien.find(x => x.slug === slug || x.code === slug || x.slug.replace(/-/g, '.') === slug)
      if (found) res.push(found)
    }
    return res.slice(0, 6)
  }, [ganDay, tatCaBcHien])

  // Báo cáo đã ghim
  const dsGhim = useMemo(() => {
    const res: ScreenDef[] = []
    for (const slug of ghim) {
      const found = tatCaBcHien.find(x => x.slug === slug || x.code === slug || x.slug.replace(/-/g, '.') === slug)
      if (found) res.push(found)
    }
    return res
  }, [ghim, tatCaBcHien])

  // Tìm kiếm không dấu theo mã hoặc tên
  const dsTimKiem = useMemo(() => {
    const tuKhoa = q.trim()
    if (!tuKhoa) return []
    const qFold = fold(tuKhoa)
    return tatCaBcHien.filter(x => {
      const ma = x.code ?? ''
      const kyHieu = kyHieuBC(x.code, s.cheDo, s) ?? ''
      const ten = tenMan(x)
      const full = `${ten} ${ma} ${kyHieu}`
      return fold(full).includes(qFold)
    })
  }, [q, tatCaBcHien, s])

  const moBaoCao = (item: ScreenDef) => {
    // Lưu vào lịch sử gần đây
    try {
      const moi = [item.slug, ...ganDay.filter(x => x !== item.slug)].slice(0, 8)
      setGanDay(moi)
      localStorage.setItem('bc-gan-day', JSON.stringify(moi))
    } catch {}
    nav(`/app/bao-cao/${item.slug}`)
  }

  const toggleGhim = (slug: string) => {
    setGhim(prev => {
      const exists = prev.includes(slug)
      const moi = exists ? prev.filter(x => x !== slug) : [...prev, slug]
      luuGhim(moi)
      return moi
    })
  }

  const handleTouchStart = (slug: string) => {
    holdTimerRef.current = window.setTimeout(() => {
      toggleGhim(slug)
      if (navigator.vibrate) navigator.vibrate(50)
    }, 500)
  }

  const handleTouchEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }

  const dangTim = q.trim().length > 0

  return (
    <div className="m-bc m-bc-figma">
      {/* Header gradient xanh theo Figma T500 */}
      <header className="m-bc-hdr-gradient">
        <div className="m-bc-hdr-top">
          <div className="m-bc-hdr-tieu-de-hang">
            <h1 className="m-bc-hdr-tieu-de">Báo cáo</h1>
            <span className="m-bc-hdr-chip-goi">
              {s.goi === 'F' ? 'FREE' : GOI[s.goi]?.ten?.toUpperCase() ?? 'FREE'}
            </span>
          </div>
          <div className="m-bc-hdr-phu">
            {tongSoBc} báo cáo · {tongSoNhom} nhóm
          </div>
        </div>

        {/* Ô tìm kiếm trong header */}
        <div className="m-bc-hdr-tim-wrap">
          <div className="m-bc-hdr-tim">
            <Icon n="search" className="m-bc-hdr-tim-ic ic sm" />
            <input
              type="text"
              className="m-bc-hdr-tim-inp"
              placeholder="Tìm báo cáo theo tên hoặc mã…"
              value={q}
              onChange={e => setQ(e.target.value)}
              aria-label="Tìm kiếm báo cáo"
            />
            {q && (
              <button
                type="button"
                className="m-bc-hdr-tim-x"
                onClick={() => setQ('')}
                aria-label="Xoá tìm kiếm"
              >
                <Icon n="x" className="ic sm" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Thân danh sách */}
      <div className="m-bc-than-figma">
        {dangTim ? (
          /* Kết quả tìm kiếm */
          <div className="m-bc-ket-qua-tim">
            <div className="m-bc-nhom-dem-tim">
              Kết quả tìm kiếm ({dsTimKiem.length})
            </div>
            {dsTimKiem.length === 0 ? (
              <MTrong
                kieu="tim"
                tieuDe="Không tìm thấy báo cáo"
                moTa="Thử gõ mã hoặc tên khác."
              />
            ) : (
              <div className="m-bc-nhom-card">
                <div className="m-bc-nhom-ds">
                  {dsTimKiem.map(item => {
                    const ma = kyHieuBC(item.code, s.cheDo, s) ?? item.code
                    const ten = tenMan(item)
                    const daGhimItem = ghim.includes(item.slug)
                    return (
                      <div
                        key={item.slug}
                        className="m-bc-row"
                        onClick={() => moBaoCao(item)}
                        onContextMenu={e => {
                          e.preventDefault()
                          toggleGhim(item.slug)
                        }}
                        onTouchStart={() => handleTouchStart(item.slug)}
                        onTouchEnd={handleTouchEnd}
                        onTouchMove={handleTouchEnd}
                      >
                        <div className="m-bc-row-ten">{ten}</div>
                        <div className="m-bc-row-phai">
                          {daGhimItem && <Icon n="star" className="m-bc-row-star ic xs" />}
                          {ma && <span className="m-bc-row-ma">{ma}</span>}
                          <Icon n="chevr" className="m-bc-row-chev ic sm" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Thẻ Truy cập nhanh */}
            <div className="m-bc-nhom-card m-bc-quick-card">
              <div className="m-bc-quick-sec">
                <div className="m-bc-quick-hdr">GẦN ĐÂY</div>
                <div className="m-bc-quick-chips">
                  {dsGanDay.map(item => (
                    <button
                      key={item.slug}
                      type="button"
                      className="m-bc-quick-chip"
                      onClick={() => moBaoCao(item)}
                    >
                      {tenMan(item)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="m-bc-quick-sep" />

              <div className="m-bc-quick-sec">
                <div className="m-bc-quick-hdr">ĐÃ GHIM</div>
                {dsGhim.length === 0 ? (
                  <div className="m-bc-ghim-trong">
                    Nhấn giữ một báo cáo để ghim lên đây
                  </div>
                ) : (
                  <div className="m-bc-quick-chips">
                    {dsGhim.map(item => (
                      <button
                        key={item.slug}
                        type="button"
                        className="m-bc-quick-chip m-bc-quick-chip-ghim"
                        onClick={() => moBaoCao(item)}
                      >
                        <Icon n="star" className="ic xs m-bc-chip-star" />
                        <span>{tenMan(item)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Các nhóm báo cáo */}
            <div className="m-bc-ds-nhom-figma">
              {nhomHienThi.map(g => {
                const iconSvg = layIconNhom(g.mod.key)
                const moTa = g.mod.mota ?? `${g.screens.length} báo cáo`
                return (
                  <div key={g.mod.key} className="m-bc-nhom-card">
                    {/* Header của thẻ nhóm */}
                    <div className="m-bc-nhom-card-hdr">
                      <div className="m-bc-nhom-ic-box">
                        <img src={iconSvg} alt="" className="m-bc-nhom-ic-img" />
                      </div>
                      <div className="m-bc-nhom-hdr-info">
                        <div className="m-bc-nhom-hdr-line1">
                          <h2 className="m-bc-nhom-ten">{g.mod.ten}</h2>
                          <span className="m-bc-nhom-badge">{g.screens.length}</span>
                        </div>
                        <div className="m-bc-nhom-mota">{moTa}</div>
                      </div>
                    </div>

                    {/* Danh sách báo cáo trong nhóm */}
                    <div className="m-bc-nhom-ds">
                      {g.screens.map(item => {
                        const ma = kyHieuBC(item.code, s.cheDo, s) ?? item.code
                        const ten = tenMan(item)
                        const daGhimItem = ghim.includes(item.slug)
                        return (
                          <div
                            key={item.slug}
                            className="m-bc-row"
                            onClick={() => moBaoCao(item)}
                            onContextMenu={e => {
                              e.preventDefault()
                              toggleGhim(item.slug)
                            }}
                            onTouchStart={() => handleTouchStart(item.slug)}
                            onTouchEnd={handleTouchEnd}
                            onTouchMove={handleTouchEnd}
                          >
                            <div className="m-bc-row-ten">{ten}</div>
                            <div className="m-bc-row-phai">
                              {daGhimItem && <Icon n="star" className="m-bc-row-star ic xs" />}
                              {ma && <span className="m-bc-row-ma">{ma}</span>}
                              <Icon n="chevr" className="m-bc-row-chev ic sm" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
