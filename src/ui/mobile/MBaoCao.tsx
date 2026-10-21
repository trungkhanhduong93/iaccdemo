import { useMemo, useState, useEffect, useRef, type FC } from 'react'
import { quayLaiMobile } from './quayLai'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { ScreenDef, ScreenProps } from '../../modules/types'
import { GOI, anNgoaiGoi } from '../../app/plan'
import { hienMan, moDuoc, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { layNhomBaoCao } from '../../modules/bao-cao/TrungTam'
import { kyHieuBC, tenBCNgan } from '../../modules/bao-cao/danh-sach'
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
    case 'so-sach':
      return icBaoCao
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

  // Xác định nhóm hiện tại nếu mở thẳng nhóm hoặc ?nhom=so-sach
  const keyNhom = useMemo(() => {
    if (sc.slug.startsWith('nhom-')) return sc.slug.slice(5)
    if (sc.kind === 'baocao') return mod.key
    if (sc.slug === 'tat-ca' && searchParams.get('nhom') === 'so-sach') return 'so-sach'
    return null
  }, [sc.slug, sc.kind, mod.key, searchParams])

  const nhomDangXem = useMemo(() => {
    if (!keyNhom) return null
    return nhomTatCa.find(g => g.mod.key === keyNhom) ?? null
  }, [keyNhom, nhomTatCa])

  // Danh sách báo cáo trong nhóm đang xem
  const dsBcTrongNhom = useMemo(() => {
    if (!nhomDangXem) return []
    return nhomDangXem.screens.filter(x => hienMan(x, s.goi, s.cheDo, s) && (!anNgoaiGoi(s.goi) || moDuoc(x, s.goi)))
  }, [nhomDangXem, s])

  const chonNhom = (key: string) => {
    if (key === 'so-sach') {
      nav('/app/bao-cao/tat-ca?nhom=so-sach')
    } else {
      nav(`/app/bao-cao/nhom-${key}`)
    }
  }

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
      const ten = tenBCNgan(x.code, s.cheDo, s) ?? tenMan(x)
      const tenGoc = tenMan(x)
      const full = `${ten} ${tenGoc} ${ma} ${kyHieu}`
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
          {nhomDangXem && (
            <button
              type="button"
              className="m-bc-hdr-back"
              onClick={() => quayLaiMobile(nav, '/app/bao-cao/tat-ca')}
            >
              <Icon n="chevl" className="ic sm" />
              <span>Tất cả nhóm</span>
            </button>
          )}
          <div className="m-bc-hdr-tieu-de-hang">
            <h1 className="m-bc-hdr-tieu-de">{nhomDangXem ? nhomDangXem.mod.ten : 'Báo cáo'}</h1>
            <span className="m-bc-hdr-chip-goi">
              {s.goi === 'F' ? 'FREE' : GOI[s.goi]?.ten?.toUpperCase() ?? 'FREE'}
            </span>
          </div>
          <div className="m-bc-hdr-phu">
            {nhomDangXem
              ? `${dsBcTrongNhom.length} báo cáo`
              : `${tongSoBc} báo cáo · ${tongSoNhom} nhóm`}
          </div>
        </div>

        {/* Ô tìm kiếm ở cấp 1 */}
        {!nhomDangXem && (
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
        )}
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
                    const ten = tenBCNgan(item.code, s.cheDo, s) ?? tenMan(item)
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
                          {daGhimItem && <Icon n="star-fill" className="m-bc-row-star ic xs" />}
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
        ) : nhomDangXem ? (
          /* Đang xem một nhóm cụ thể (?nhom=so-sach hoặc nhom-<key>) */
          <div className="m-bc-ds-nhom-figma">
            {dsBcTrongNhom.length === 0 ? (
              <MTrong
                kieu="chung"
                tieuDe="Chưa có báo cáo"
                moTa="Nhóm này chưa có báo cáo áp dụng"
              />
            ) : (
              <div className="m-bc-nhom-card">
                <div className="m-bc-nhom-card-hdr">
                  <div className="m-bc-nhom-ic-box">
                    <img src={layIconNhom(nhomDangXem.mod.key)} alt="" className="m-bc-nhom-ic-img" />
                  </div>
                  <div className="m-bc-nhom-hdr-info">
                    <div className="m-bc-nhom-hdr-line1">
                      <h2 className="m-bc-nhom-ten">{nhomDangXem.mod.ten}</h2>
                      <span className="m-bc-nhom-badge">{dsBcTrongNhom.length}</span>
                    </div>
                    <div className="m-bc-nhom-mota">{nhomDangXem.mod.mota ?? `${dsBcTrongNhom.length} báo cáo`}</div>
                  </div>
                </div>

                <div className="m-bc-nhom-ds">
                  {dsBcTrongNhom.map(item => {
                    const ma = kyHieuBC(item.code, s.cheDo, s) ?? item.code
                    const ten = tenBCNgan(item.code, s.cheDo, s) ?? tenMan(item)
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
                          {daGhimItem && <Icon n="star-fill" className="m-bc-row-star ic xs" />}
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
                      {tenBCNgan(item.code, s.cheDo, s) ?? tenMan(item)}
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
                        <Icon n="star-fill" className="ic xs m-bc-chip-star" />
                        <span>{tenBCNgan(item.code, s.cheDo, s) ?? tenMan(item)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Danh sách nhóm theo mẫu IVT: mỗi nhóm 1 thẻ trắng bo 16, không liệt kê báo cáo con */}
            <div className="m-bc-ds-nhom-ivt">
              {nhomHienThi.map(g => {
                const iconSvg = layIconNhom(g.mod.key)
                const moTa = g.mod.mota ?? `${g.screens.length} báo cáo`
                return (
                  <div
                    key={g.mod.key}
                    className="m-bc-nhom-the-ivt"
                    onClick={() => chonNhom(g.mod.key)}
                  >
                    <div className="m-bc-nhom-the-ic-box">
                      <img src={iconSvg} alt="" className="m-bc-nhom-the-ic-img" />
                    </div>
                    <div className="m-bc-nhom-the-info">
                      <div className="m-bc-nhom-the-ten">{g.mod.ten}</div>
                      <div className="m-bc-nhom-the-mota">{moTa}</div>
                    </div>
                    <Icon n="chevr" className="ic sm m-bc-nhom-the-chev" />
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
