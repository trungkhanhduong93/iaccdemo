import { useMemo, useState, type FC } from 'react'
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

export const MBaoCao: FC<ScreenProps> = ({ sc, mod }) => {
  const { s } = useSession()
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const [q, setQ] = useState('')

  const nhomTatCa = useMemo(() => layNhomBaoCao(s), [s])

  // Xác định nhóm hiện tại nếu mở thẳng nhóm
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

  // Danh sách toàn bộ báo cáo hiện được để tìm kiếm (T299: gói Free chỉ giữ màn trong gói)
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

  // Lọc tìm kiếm không dấu theo mã hoặc tên
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

  // Nhóm hiển thị ở tab Tất cả (dùng đúng các nhóm của TrungTamBaoCao)
  const nhomHienThi = nhomTatCa

  // Danh sách báo cáo trong nhóm đang xem (T299: gói Free chỉ giữ màn trong gói)
  const dsBcTrongNhom = useMemo(() => {
    if (!nhomDangXem) return []
    return nhomDangXem.screens.filter(x => hienMan(x, s.goi, s.cheDo, s) && (!anNgoaiGoi(s.goi) || moDuoc(x, s.goi)))
  }, [nhomDangXem, s])

  const moBaoCao = (item: ScreenDef) => {
    nav(`/app/bao-cao/${item.slug}`)
  }

  const chonNhom = (key: string) => {
    if (key === 'so-sach') {
      nav('/app/bao-cao/tat-ca?nhom=so-sach')
    } else {
      nav(`/app/bao-cao/nhom-${key}`)
    }
  }

  const dangTim = q.trim().length > 0

  return (
    <div className="m-bc">
      {/* Đầu trang theo ảnh 11: nền chuyển sắc vàng kem nhạt xuống trắng */}
      <div className="m-bc-dau">
        <div className="m-bc-dau-hang">
          <div className="m-bc-dau-trai">
            <h1 className="m-bc-tieu-de">Báo cáo</h1>
            <span className="m-bc-chip-goi">{GOI[s.goi].ten}</span>
          </div>
        </div>
        <div className="m-bc-tim-wrap">
          <div className="m-ds-tim">
            <Icon n="search" className="m-ds-tim-ic ic sm" />
            <input
              type="text"
              className="m-ds-tim-inp"
              placeholder="Tìm theo mã hoặc tên báo cáo..."
              value={q}
              onChange={e => setQ(e.target.value)}
              aria-label="Tìm kiếm báo cáo"
            />
            {q && (
              <button
                type="button"
                className="m-ds-tim-x"
                onClick={() => setQ('')}
                aria-label="Xoá tìm kiếm"
              >
                <Icon n="x" className="ic sm" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="m-bc-than">
        {dangTim ? (
          // Đang gõ tìm kiếm: hiện kết quả tìm kiếm trên toàn bộ báo cáo
          <div className="m-bc-ket-qua-tim">
            <div className="m-bc-nhom-dem">
              Kết quả tìm kiếm ({dsTimKiem.length})
            </div>
            {dsTimKiem.length === 0 ? (
              <MTrong
                kieu="tim"
                tieuDe="Không tìm thấy báo cáo"
                moTa="Thử gõ mã hoặc tên khác."
              />
            ) : (
              <div className="m-bc-ds-the">
                {dsTimKiem.map(item => {
                  const ma = kyHieuBC(item.code, s.cheDo, s) ?? item.code
                  const ten = tenMan(item)
                  return (
                    <div
                      key={item.slug}
                      className="m-bc-the-bc"
                      onClick={() => moBaoCao(item)}
                    >
                      <div className="m-bc-the-bc-nd">
                        <div className="m-bc-the-bc-ten">{ten}</div>
                        {ma && <div className="m-bc-the-bc-ma">{ma}</div>}
                      </div>
                      <Icon n="chevr" className="ic sm m-bc-the-bc-icon" />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : nhomDangXem ? (
          // Đang xem danh sách báo cáo của một nhóm cụ thể
          <div className="m-bc-nhom-chi-tiet">
            <div className="m-bc-nhom-thanh-dau">
              <button
                type="button"
                className="m-bc-nhom-back"
                onClick={() => nav('/app/bao-cao/tat-ca')}
              >
                <Icon n="chevl" className="ic sm" />
                <span>Tất cả nhóm</span>
              </button>
              <h2 className="m-bc-nhom-tieu-de-nhom">{nhomDangXem.mod.ten}</h2>
            </div>

            {dsBcTrongNhom.length === 0 ? (
              <MTrong
                kieu="chung"
                tieuDe="Chưa có báo cáo"
                moTa="Nhóm này chưa có báo cáo áp dụng"
              />
            ) : (
              <div className="m-bc-ds-the">
                {dsBcTrongNhom.map(item => {
                  const ma = kyHieuBC(item.code, s.cheDo, s) ?? item.code
                  const ten = tenMan(item)
                  return (
                    <div
                      key={item.slug}
                      className="m-bc-the-bc"
                      onClick={() => moBaoCao(item)}
                    >
                      <div className="m-bc-the-bc-nd">
                        <div className="m-bc-the-bc-ten">{ten}</div>
                        {ma && <div className="m-bc-the-bc-ma">{ma}</div>}
                      </div>
                      <Icon n="chevr" className="ic sm m-bc-the-bc-icon" />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          // Màn chính: hiển thị các thẻ nhóm A, B, C...
          <div className="m-bc-ds-nhom">
            {nhomHienThi.filter(g => g.screens.some(x => hienMan(x, s.goi, s.cheDo, s) && (!anNgoaiGoi(s.goi) || moDuoc(x, s.goi)))).map((g, index) => {   // nhóm không có báo cáo thì ẩn (T252, T299)
              const char = String.fromCharCode(65 + index)
              const soBc = g.screens.filter(x => hienMan(x, s.goi, s.cheDo, s) && (!anNgoaiGoi(s.goi) || moDuoc(x, s.goi))).length
              const moTa = g.mod.mota ?? `${soBc} báo cáo`
              return (
                <div
                  key={g.mod.key}
                  className="m-bc-the-nhom"
                  onClick={() => chonNhom(g.mod.key)}
                >
                  <div className="m-bc-nhom-ic">{char}</div>
                  <div className="m-bc-nhom-nd">
                    <div className="m-bc-nhom-ten">{g.mod.ten}</div>
                    <div className="m-bc-nhom-mota">{moTa}</div>
                  </div>
                  <Icon n="chevr" className="ic sm m-bc-nhom-mui-ten" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
