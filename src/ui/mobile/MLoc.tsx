import { useEffect, useState, type FC } from 'react'
import { HOM_NAY } from '../../data/mock'
import { dmy, fold } from '../format'
import { khoangThang, thangNay, type KhoangNgay } from '../ChonNgay'
import { Icon } from '../Icon'
import { MChonKhoangNgay } from './MChonKhoangNgay'

export type KyThoiGian = 'hom-nay' | 'tuan-nay' | 'thang-nay' | 'thang-truoc' | 'tat-ca' | 'tuy-chon'

export interface GtLocMobile {
  thoiGian: KyThoiGian
  khoangNgay?: KhoangNgay | null
  doiTuong: string[]
  nguon: string[]
  kho: string[]
  lyDo?: string[]
  loaiPhieu?: string[]   // mã loại phiếu, vd thu, chi, bc, unc, cq (T569)
  chiNhanh?: string
  trangThai?: string
}

export const MAC_DINH_LOC_MOBILE: GtLocMobile = {
  thoiGian: 'thang-nay',
  khoangNgay: null,
  doiTuong: [],
  nguon: [],
  kho: [],
  lyDo: [],
  loaiPhieu: [],
  chiNhanh: 'all',
  trangThai: 'all',
}

export function coLocKhacMacDinh(gt: GtLocMobile): boolean {
  if (gt.thoiGian !== 'thang-nay') return true
  if (gt.doiTuong && gt.doiTuong.length > 0) return true
  if (gt.nguon && gt.nguon.length > 0) return true
  if (gt.kho && gt.kho.length > 0) return true
  if (gt.lyDo && gt.lyDo.length > 0) return true
  if (gt.loaiPhieu && gt.loaiPhieu.length > 0) return true
  if (gt.chiNhanh && gt.chiNhanh !== 'all' && gt.chiNhanh !== '') return true
  if (gt.trangThai && gt.trangThai !== 'all' && gt.trangThai !== '') return true
  return false
}

export function tinhKhoangNgay(ky: KyThoiGian, knTuyChon?: KhoangNgay | null): KhoangNgay | null {
  if (ky === 'tat-ca') return null
  if (ky === 'tuy-chon') return knTuyChon ?? null
  if (ky === 'hom-nay') {
    const d = new Date(HOM_NAY)
    return {
      tu: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
      den: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59),
    }
  }
  if (ky === 'tuan-nay') {
    const day = HOM_NAY.getDay() || 7
    const mon = new Date(HOM_NAY)
    mon.setDate(HOM_NAY.getDate() - day + 1)
    const sun = new Date(mon)
    sun.setDate(mon.getDate() + 6)
    return {
      tu: new Date(mon.getFullYear(), mon.getMonth(), mon.getDate()),
      den: new Date(sun.getFullYear(), sun.getMonth(), sun.getDate(), 23, 59, 59),
    }
  }
  if (ky === 'thang-truoc') {
    return khoangThang(HOM_NAY.getMonth(), HOM_NAY.getFullYear())
  }
  return thangNay()
}

export interface MLocProps {
  mo: boolean
  onDong: () => void
  giaTri: GtLocMobile
  onApDung: (gt: GtLocMobile) => void
  dsDoiTuong?: string[]
  nhanDoiTuong?: string
  dsNguon?: { k: string; ten: string }[]
  dsKho?: string[]
  dsLyDo?: string[]
  dsLoaiPhieu?: { k: string; ten: string }[]   // có thì hiện dòng Loại phiếu, chọn nhiều (T569)
  dsChiNhanh?: { k: string; ten: string }[]
  dsTrangThai?: { k: string; ten: string; dem?: number }[]
}

const CAC_KY: { k: KyThoiGian; ten: string }[] = [
  { k: 'hom-nay', ten: 'Hôm nay' },
  { k: 'tuan-nay', ten: 'Tuần này' },
  { k: 'thang-nay', ten: 'Tháng này' },
  { k: 'thang-truoc', ten: 'Tháng trước' },
  { k: 'tat-ca', ten: 'Tất cả' },
]

export const MLoc: FC<MLocProps> = ({
  mo,
  onDong,
  giaTri,
  onApDung,
  dsDoiTuong,
  nhanDoiTuong = 'Đối tượng',
  dsNguon,
  dsKho,
  dsLyDo,
  dsLoaiPhieu,
  dsChiNhanh,
  dsTrangThai,
}) => {
  const [draft, setDraft] = useState<GtLocMobile>(giaTri)
  const [trangCon, setTrangCon] = useState<'doiTuong' | 'nguon' | 'kho' | 'lyDo' | 'loaiPhieu' | 'chiNhanh' | 'trangThai' | null>(null)
  const [timKiem, setTimKiem] = useState('')

  useEffect(() => {
    if (mo) {
      setDraft(giaTri)
      setTrangCon(null)
      setTimKiem('')
    }
  }, [mo, giaTri])

  if (!mo) return null

  const nguons = dsNguon ?? [
    { k: 'tay', ten: 'Thủ công' },
    { k: 'FABi', ten: 'FABi' },
    { k: 'IVT', ten: 'iPOS Inventory' },
    { k: 'HĐ', ten: 'iPOS Invoice' },
    { k: 'excel', ten: 'Excel' },
  ]

  const handleReset = () => {
    setDraft({ ...MAC_DINH_LOC_MOBILE })
  }

  const handleApply = () => {
    onApDung(draft)
    onDong()
  }

  // Tóm tắt hiển thị trên từng dòng của tấm chính
  const moTaChiNhanh = () => {
    if (!draft.chiNhanh || draft.chiNhanh === 'all' || draft.chiNhanh === '') return 'Tất cả'
    const found = dsChiNhanh?.find(c => c.k === draft.chiNhanh)
    return found ? found.ten : 'Tất cả'
  }

  const moTaTrangThai = () => {
    if (!draft.trangThai || draft.trangThai === 'all' || draft.trangThai === '') return 'Tất cả'
    const found = dsTrangThai?.find(t => t.k === draft.trangThai)
    return found ? (found.dem !== undefined ? `${found.ten} (${found.dem})` : found.ten) : 'Tất cả'
  }

  const moTaThoiGian = () => {
    if (draft.thoiGian === 'tuy-chon') {
      if (draft.khoangNgay) {
        return `${dmy(draft.khoangNgay.tu)} - ${dmy(draft.khoangNgay.den)}`
      }
      return 'Tuỳ chọn'
    }
    const found = CAC_KY.find(k => k.k === draft.thoiGian)
    return found ? found.ten : 'Tháng này'
  }

  const moTaDoiTuong = () => {
    const len = draft.doiTuong.length
    if (len === 0) return 'Tất cả'
    if (len === 1) return draft.doiTuong[0]
    return `${len} ${nhanDoiTuong.toLowerCase()}`
  }

  const moTaNguon = () => {
    const len = draft.nguon.length
    if (len === 0) return 'Tất cả'
    if (len === 1) {
      const found = nguons.find(n => n.k === draft.nguon[0])
      return found ? found.ten : draft.nguon[0]
    }
    return `${len} nguồn`
  }

  const moTaKho = () => {
    const len = draft.kho.length
    if (len === 0) return 'Tất cả'
    if (len === 1) return draft.kho[0]
    return `${len} kho`
  }

  const moTaLyDo = () => {
    const len = draft.lyDo?.length ?? 0
    if (len === 0) return 'Tất cả'
    if (len === 1) return draft.lyDo![0]
    return `${len} lý do`
  }

  const moTaLoaiPhieu = () => {
    const len = draft.loaiPhieu?.length ?? 0
    if (len === 0) return 'Tất cả'
    if (len === 1) return dsLoaiPhieu?.find(l => l.k === draft.loaiPhieu![0])?.ten ?? draft.loaiPhieu![0]
    return `${len} loại phiếu`
  }

  // Tên hiện của mục chọn nhiều: nguồn, loại phiếu lưu mã, các trường khác lưu tên
  const tenMuc = (truong: string, val: string) =>
    truong === 'nguon' ? (nguons.find(n => n.k === val)?.ten ?? val)
      : truong === 'loaiPhieu' ? (dsLoaiPhieu?.find(l => l.k === val)?.ten ?? val)
      : val

  // Khoảng chọn trên lịch trùng kỳ có tên thì lưu theo kỳ, còn lại là Tuỳ chọn
  const chonKhoang = (kn: KhoangNgay) => {
    const ky = (['hom-nay', 'tuan-nay', 'thang-nay', 'thang-truoc'] as const).find(k => {
      const x = tinhKhoangNgay(k)
      return x && dmy(x.tu) === dmy(kn.tu) && dmy(x.den) === dmy(kn.den)
    })
    setDraft(prev => ({ ...prev, thoiGian: ky ?? 'tuy-chon', khoangNgay: ky ? null : kn }))
  }

  // Toggle chọn / bỏ chọn mục
  const toggleChon = (truong: 'doiTuong' | 'nguon' | 'kho' | 'lyDo' | 'loaiPhieu', val: string) => {
    setDraft(prev => {
      const cur = prev[truong] ?? []
      const next = cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val]
      return { ...prev, [truong]: next }
    })
  }

  const chonTatCa = (truong: 'doiTuong' | 'nguon' | 'kho' | 'lyDo' | 'loaiPhieu', ds: string[]) => {
    setDraft(prev => ({ ...prev, [truong]: Array.from(new Set([...(prev[truong] ?? []), ...ds])) }))
  }

  const boChonTatCa = (truong: 'doiTuong' | 'nguon' | 'kho' | 'lyDo' | 'loaiPhieu', ds: string[]) => {
    setDraft(prev => ({
      ...prev,
      [truong]: (prev[truong] ?? []).filter(x => !ds.includes(x)),
    }))
  }

  return (
    <div className="m-loc-overlay" onClick={onDong}>
      {/* ── TẤM LỌC NỔI TỪ ĐÁY (T299) ── */}
      <div className="m-loc-tam" onClick={e => e.stopPropagation()}>
        <div className="m-tam-keo" />
        <div className="m-loc-dau">
          <h2 className="m-loc-tieu-de">Bộ lọc</h2>
          <button type="button" className="m-loc-btn-dong" onClick={onDong} aria-label="Đóng">
            <Icon n="x" className="ic sm" />
          </button>
        </div>

        <div className="m-loc-than">
          {/* Dòng Thời gian: bấm mở hộp lịch chọn khoảng ngày dùng chung điện thoại (T571) */}
          <MChonKhoangNgay
            value={tinhKhoangNgay(draft.thoiGian, draft.khoangNgay) ?? thangNay()}
            onChange={chonKhoang}
            nut={moLich => (
              <div className="m-loc-dong" onClick={moLich}>
                <div className="m-loc-dong-trai">
                  <span className="m-loc-dong-nhan">Thời gian</span>
                  <span className="m-loc-dong-tri">{moTaThoiGian()}</span>
                </div>
                <Icon n="chevr" className="ic sm m-loc-dong-ic" />
              </div>
            )}
          />

          {/* Dòng Chi nhánh (T521) */}
          {dsChiNhanh && dsChiNhanh.length > 0 && (
            <div className="m-loc-dong" onClick={() => setTrangCon('chiNhanh')}>
              <div className="m-loc-dong-trai">
                <span className="m-loc-dong-nhan">Chi nhánh</span>
                <span className="m-loc-dong-tri">{moTaChiNhanh()}</span>
              </div>
              <Icon n="chevr" className="ic sm m-loc-dong-ic" />
            </div>
          )}

          {/* Dòng Trạng thái (T521) */}
          {dsTrangThai && dsTrangThai.length > 0 && (
            <div className="m-loc-dong" onClick={() => setTrangCon('trangThai')}>
              <div className="m-loc-dong-trai">
                <span className="m-loc-dong-nhan">Trạng thái</span>
                <span className="m-loc-dong-tri">{moTaTrangThai()}</span>
              </div>
              <Icon n="chevr" className="ic sm m-loc-dong-ic" />
            </div>
          )}

          {/* Dòng Loại phiếu (T569) */}
          {dsLoaiPhieu && dsLoaiPhieu.length > 0 && (
            <div className="m-loc-dong" onClick={() => setTrangCon('loaiPhieu')}>
              <div className="m-loc-dong-trai">
                <span className="m-loc-dong-nhan">Loại phiếu</span>
                <span className="m-loc-dong-tri">{moTaLoaiPhieu()}</span>
              </div>
              <Icon n="chevr" className="ic sm m-loc-dong-ic" />
            </div>
          )}

          {/* Dòng Đối tượng */}
          {dsDoiTuong && dsDoiTuong.length > 0 && (
            <div className="m-loc-dong" onClick={() => setTrangCon('doiTuong')}>
              <div className="m-loc-dong-trai">
                <span className="m-loc-dong-nhan">{nhanDoiTuong}</span>
                <span className="m-loc-dong-tri">{moTaDoiTuong()}</span>
              </div>
              <Icon n="chevr" className="ic sm m-loc-dong-ic" />
            </div>
          )}

          {/* Dòng Nguồn */}
          <div className="m-loc-dong" onClick={() => setTrangCon('nguon')}>
            <div className="m-loc-dong-trai">
              <span className="m-loc-dong-nhan">Nguồn dữ liệu</span>
              <span className="m-loc-dong-tri">{moTaNguon()}</span>
            </div>
            <Icon n="chevr" className="ic sm m-loc-dong-ic" />
          </div>

          {/* Dòng Kho */}
          {dsKho && dsKho.length > 0 && (
            <div className="m-loc-dong" onClick={() => setTrangCon('kho')}>
              <div className="m-loc-dong-trai">
                <span className="m-loc-dong-nhan">Kho</span>
                <span className="m-loc-dong-tri">{moTaKho()}</span>
              </div>
              <Icon n="chevr" className="ic sm m-loc-dong-ic" />
            </div>
          )}

          {/* Dòng Lý do nghiệp vụ (T394) */}
          {dsLyDo && dsLyDo.length > 0 && (
            <div className="m-loc-dong" onClick={() => setTrangCon('lyDo')}>
              <div className="m-loc-dong-trai">
                <span className="m-loc-dong-nhan">Lý do nghiệp vụ</span>
                <span className="m-loc-dong-tri">{moTaLyDo()}</span>
              </div>
              <Icon n="chevr" className="ic sm m-loc-dong-ic" />
            </div>
          )}
        </div>

        <div className="m-loc-day">
          <button type="button" className="m-loc-btn-reset" onClick={handleReset}>
            Đặt lại
          </button>
          <button type="button" className="m-loc-btn-apply" onClick={handleApply}>
            Áp dụng
          </button>
        </div>
      </div>

      {/* ── TRANG DANH MỤC CON TRƯỢT VÀO ── */}
      {trangCon && (
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" vectorEffect="non-scaling-stroke" />
                </svg>
              </button>
            </div>
            <h1 className="m-thanh-tren-tieu-de">
              {trangCon === 'chiNhanh'
                  ? 'Chi nhánh'
                  : trangCon === 'trangThai'
                    ? 'Trạng thái'
                    : trangCon === 'doiTuong'
                      ? nhanDoiTuong
                      : trangCon === 'nguon'
                        ? 'Nguồn dữ liệu'
                        : trangCon === 'kho'
                          ? 'Kho'
                          : trangCon === 'loaiPhieu'
                            ? 'Loại phiếu'
                            : 'Lý do nghiệp vụ'}
            </h1>
            <div className="m-thanh-tren-phai" style={{ width: 36 }} />
          </div>

          <div className="m-loc-con-than">
            {trangCon === 'chiNhanh' ? (
              <div className="m-loc-ky-ds-doc">
                {dsChiNhanh?.map(c => {
                  const chon = (draft.chiNhanh ?? 'all') === c.k || (!draft.chiNhanh && (c.k === 'all' || c.k === ''))
                  return (
                    <div
                      key={c.k}
                      className={`m-loc-muc-dong ${chon ? 'on' : ''}`}
                      onClick={() => setDraft(prev => ({ ...prev, chiNhanh: c.k }))}
                    >
                      <span className="m-loc-muc-ten">{c.ten}</span>
                      {chon && <Icon n="check" className="ic sm m-loc-muc-tick" />}
                    </div>
                  )
                })}
              </div>
            ) : trangCon === 'trangThai' ? (
              <div className="m-loc-ky-ds-doc">
                {dsTrangThai?.map(t => {
                  const chon = (draft.trangThai ?? 'all') === t.k || (!draft.trangThai && (t.k === 'all' || t.k === ''))
                  const nhan = t.dem !== undefined ? `${t.ten} (${t.dem})` : t.ten
                  return (
                    <div
                      key={t.k}
                      className={`m-loc-muc-dong ${chon ? 'on' : ''}`}
                      onClick={() => setDraft(prev => ({ ...prev, trangThai: t.k }))}
                    >
                      <span className="m-loc-muc-ten">{nhan}</span>
                      {chon && <Icon n="check" className="ic sm m-loc-muc-tick" />}
                    </div>
                  )
                })}
              </div>
            ) : (
              <>
                {/* Ô tìm kiếm */}
                <div className="m-loc-tim-hop">
                  <Icon n="search" className="ic sm m-loc-tim-ic" />
                  <input
                    type="search"
                    className="m-loc-tim-inp"
                    placeholder={`Tìm ${
                      trangCon === 'doiTuong'
                        ? nhanDoiTuong.toLowerCase()
                        : trangCon === 'nguon'
                          ? 'nguồn'
                          : trangCon === 'kho'
                            ? 'kho'
                            : trangCon === 'loaiPhieu'
                              ? 'loại phiếu'
                              : 'lý do'
                    }...`}
                    value={timKiem}
                    onChange={e => setTimKiem(e.target.value)}
                    autoFocus
                  />
                  {timKiem && (
                    <button
                      type="button"
                      className="m-loc-tim-x"
                      onClick={() => setTimKiem('')}
                      aria-label="Xoá tìm kiếm"
                    >
                      <Icon n="x" className="ic sm" />
                    </button>
                  )}
                </div>

                {/* Hàng nút Chọn tất cả / Bỏ chọn */}
                {(() => {
                  const dsHienTai = (
                    trangCon === 'doiTuong'
                      ? (dsDoiTuong ?? [])
                      : trangCon === 'nguon'
                        ? nguons.map(n => n.k)
                        : trangCon === 'kho'
                          ? (dsKho ?? [])
                          : trangCon === 'loaiPhieu'
                            ? (dsLoaiPhieu ?? []).map(l => l.k)
                            : (dsLyDo ?? [])
                  ).filter(item => {
                    if (!timKiem.trim()) return true
                    return fold(tenMuc(trangCon, item)).includes(fold(timKiem))
                  })

                  return (
                    <>
                      <div className="m-loc-tac-vu">
                        <button
                          type="button"
                          className="m-loc-btn-tv"
                          onClick={() => chonTatCa(trangCon, dsHienTai)}
                        >
                          Chọn tất cả ({dsHienTai.length})
                        </button>
                        <button
                          type="button"
                          className="m-loc-btn-tv"
                          onClick={() => boChonTatCa(trangCon, dsHienTai)}
                        >
                          Bỏ chọn
                        </button>
                      </div>

                      {/* Danh sách các mục */}
                      <div className="m-loc-ds-muc">
                        {dsHienTai.length === 0 ? (
                          <div className="m-loc-muc-trong">Không có kết quả</div>
                        ) : (
                          dsHienTai.map(val => {
                            const chon = (draft[trangCon] ?? []).includes(val)
                            const tenHienThi = tenMuc(trangCon, val)

                            return (
                              <div
                                key={val}
                                className={`m-loc-muc-dong ${chon ? 'on' : ''}`}
                                onClick={() => toggleChon(trangCon, val)}
                              >
                                <div className={`m-loc-checkbox ${chon ? 'on' : ''}`}>
                                  {chon && <Icon n="check" className="ic sm" />}
                                </div>
                                <span className="m-loc-muc-ten">{tenHienThi}</span>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </>
                  )
                })()}
              </>
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
      )}
    </div>
  )
}
