import { useMemo, useState, type FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { duongDan } from '../../app/registry'
import { useSession } from '../../app/session'
import { money } from '../format'
import { theCuaPhieu } from '../generic/ChungTuForm'
import { MLichSu } from './MLichSu'
import { useDongChungTu } from '../generic/VoucherScreen'
import { HopXacNhan } from '../LocNangCao'
import type { Dong } from '../generic/gen'
import { tinhButToan } from './butToan'
import { CUA_HANG, LY_CHI_PHI } from '../../data/mock'

export interface MDtThuChiXemProps extends ScreenProps {
  row: Row
  moSua: () => void
  thucHienXoa: () => void
  hoiBoGhi: boolean
  setHoiBoGhi: (v: boolean) => void
  hoiKhongSua: boolean
  setHoiKhongSua: (v: boolean) => void
  hoiXoa: boolean
  setHoiXoa: (v: boolean) => void
  handleMenuChon: (k: string) => void
  quayLai: () => void
  dsDong: Dong[]
  triQuy: string
  triLyDo: string
  triNguoiGiaoDich: string
  cuaHangTen: string
}

type TabType = 'chitiet' | 'dinhkem' | 'lichsu'

export const MDtThuChiXem: FC<MDtThuChiXemProps> = ({
  sc,
  mod,
  row,
  moSua,
  thucHienXoa,
  hoiBoGhi,
  setHoiBoGhi,
  hoiKhongSua,
  setHoiKhongSua,
  hoiXoa,
  setHoiXoa,
  handleMenuChon,
  quayLai,
  dsDong,
  triQuy,
  triLyDo,
  triNguoiGiaoDich,
  cuaHangTen,
}) => {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)

  const [tab, setTab] = useState<TabType>('chitiet')
  // Gói Free chỉ có 2 tab Chi tiết và Lịch sử, nếu đang ở Đính kèm thì về Chi tiết (T527)
  const tabHien = (s.goi === 'S' && tab === 'dinhkem') ? 'chitiet' : tab
  const [moSheetThaoTac, setMoSheetThaoTac] = useState(false)

  const isChi = row.loai === 'chi' || row.loai === 'unc'
  const isThu = row.loai === 'thu' || row.loai === 'bc'
  const isCq = row.loai === 'cq'

  const tenLoaiPhieu = row.tenLoai
    ? String(row.tenLoai)
    : isChi
    ? (row.loai === 'unc' ? 'Chi ngân hàng' : 'Chi tiền mặt')
    : isThu
    ? (row.loai === 'bc' ? 'Thu ngân hàng' : 'Thu tiền mặt')
    : 'Chuyển quỹ'

  const soCt = String(row.so ?? '')
  const tongSoTien = Number(row.tong) || Number(row.tien) || 0
  const laFabi = row.nguon === 'FABi' || soCt.startsWith('FB')

  const diaChiHienThi = String(
    row._diaChi ||
    row.diaChi ||
    '128 Hai Bà Trưng, Đa Kao, Quận 1, TP.HCM',
  )

  const thangChiPhi = `Tháng ${row.thang || 10}/2026`
  const ghiChu = String(row._ghiChu || row.dienGiai || 'Tiền nhà 6 tháng')
  const theCpDs = Array.isArray(row._theCp) ? (row._theCp as string[]) : []

  // Bút toán cho gói Plus, Pro
  const { cfg } = useDongChungTu(sc, mod)
  const dsButToan = useMemo(() => {
    if (s.goi === 'S') return []
    return tinhButToan(
      cfg,
      dsDong,
      tongSoTien,
      0,
      0,
      String(row.doiTuong ?? ''),
      String(row.cn ?? ''),
      s.cheDo,
      isChi ? 'chi' : isThu ? 'thu' : 'cq',
      row.loai === 'chi' || row.loai === 'thu' ? 'tienmat' : 'chuyenkhoan',
    )
  }, [s.goi, cfg, dsDong, tongSoTien, row, s.cheDo, isChi, isThu])

  const tieuDeNav = `${isChi ? 'Phiếu chi' : isThu ? 'Phiếu thu' : 'Phiếu chuyển quỹ'} ${soCt}`

  return (
    <div className="m-tc-xem-man m-xp">
      {/* ── HEADER NAVIGATION ── */}
      <header className="m-tc-xem-header">
        <button
          type="button"
          className="m-tc-btn-nav"
          onClick={quayLai}
          aria-label="Quay lại"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="m-tc-xem-tieu-de">{tieuDeNav}</h1>
        <div className="m-tc-nav-khoang-trong" />
      </header>

      {/* ── THÂN CUỘN ── */}
      <main className="m-tc-xem-content">
        {/* 1. Card Tóm tắt phiếu theo Figma MB04 */}
        <section className="m-tc-xem-the-tom-tat">
          {/* Bỏ chip loại phiếu, tên loại đã có trên thanh đầu (T655) */}
          <div className="m-tc-xem-dong-cn">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>{cuaHangTen}</span>
            {/* Nguồn chứng từ cùng dòng cửa hàng (T539) */}
            <span className="m-tc-badge-nguon m-tc-xem-nguon">{laFabi ? 'FABi' : 'Thủ công'}</span>
          </div>

          <div className="m-tc-xem-nhan-tong">Tổng tiền</div>
          <div className={`m-tc-xem-so-tien ${isChi ? 'chi' : isThu ? 'thu' : 'cq'}`}>
            {money(tongSoTien)} đ
          </div>
          <span className="m-xp-so" style={{ display: 'none' }}>{soCt}</span>
          <span className="m-xp-loai" style={{ display: 'none' }}>{tenLoaiPhieu}</span>
          <span className="m-xp-day-tong" style={{ display: 'none' }}>{money(tongSoTien)}</span>

          <div className="m-tc-xem-khoi-quy">
            <span className="m-tc-xem-quy-nhan">
              {isChi ? 'Quỹ tiền mặt *' : isThu ? 'Quỹ thu tiền *' : 'Từ quỹ *'}
            </span>
            <span className="m-tc-xem-quy-ten">{triQuy}</span>
          </div>
        </section>

        {/* 2. Segmented control 3 options */}
        <div className="m-tc-segmented" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tabHien === 'chitiet'}
            className={`m-tc-seg-btn${tabHien === 'chitiet' ? ' on' : ''}`}
            onClick={() => setTab('chitiet')}
          >
            Chi tiết
          </button>
          {/* Gói Free không có tab Đính kèm (T527) */}
          {s.goi !== 'S' && (
            <button
              type="button"
              role="tab"
              aria-selected={tabHien === 'dinhkem'}
              className={`m-tc-seg-btn${tabHien === 'dinhkem' ? ' on' : ''}`}
              onClick={() => setTab('dinhkem')}
            >
              Đính kèm
            </button>
          )}
          <button
            type="button"
            role="tab"
            aria-selected={tabHien === 'lichsu'}
            className={`m-tc-seg-btn${tabHien === 'lichsu' ? ' on' : ''}`}
            onClick={() => setTab('lichsu')}
          >
            Lịch sử
          </button>
        </div>

        {/* 3. Nội dung tab Chi tiết */}
        {tabHien === 'chitiet' && (
          <>
            {/* Nhóm Thông tin phiếu */}
            <div className="m-tc-nhom-chu">
              {isChi ? 'THÔNG TIN PHIẾU CHI' : isThu ? 'THÔNG TIN PHIẾU THU' : 'THÔNG TIN CHỨNG TỪ'}
            </div>
            <div className="m-tc-card-thong-tin m-xp-the-dau">
              <div className="m-tc-dong-thong-tin">
                <span className="nhan">Ngày chứng từ *</span>
                <span className="tri">{row.ngay || '07/10/2026'}</span>
              </div>
              <div className="m-tc-vach-ngang" />

              {row.doiTuong && (
                <>
                  <div className="m-tc-dong-thong-tin">
                    <span className="nhan">Đối tượng</span>
                    <span className="tri">{String(row.doiTuong)}</span>
                  </div>
                  <div className="m-tc-vach-ngang" />
                </>
              )}

              {triNguoiGiaoDich && (
                <>
                  <div className="m-tc-dong-thong-tin">
                    <span className="nhan">Người giao dịch</span>
                    <span className="tri">{triNguoiGiaoDich}</span>
                  </div>
                  <div className="m-tc-vach-ngang" />
                </>
              )}

              {triLyDo && (
                <>
                  <div className="m-tc-dong-thong-tin">
                    <span className="nhan">{isChi ? 'Lý do chi' : 'Lý do thu'}</span>
                    <span className="tri ly-do-wrap">
                      <span>{triLyDo}</span>
                      {isChi && LY_CHI_PHI.includes(triLyDo) && <span className="m-tc-badge-nhom-cp">Chi phí</span>}
                    </span>
                  </div>
                  <div className="m-tc-vach-ngang" />
                </>
              )}

              <div className="m-tc-dong-thong-tin">
                <span className="nhan">Địa chỉ</span>
                <span className="tri dia-chi">{diaChiHienThi}</span>
              </div>
              <div className="m-tc-vach-ngang" />

              <div className="m-tc-dong-thong-tin">
                <span className="nhan">Tháng ghi nhận chi phí</span>
                <span className="tri">{thangChiPhi}</span>
              </div>
              <div className="m-tc-vach-ngang" />

              <div className="m-tc-dong-thong-tin">
                <span className="nhan">Ghi chú</span>
                <span className="tri">{ghiChu}</span>
              </div>

              {theCpDs.length > 0 && (
                <>
                  <div className="m-tc-vach-ngang" />
                  <div className="m-tc-dong-thong-tin">
                    <span className="nhan">Tham chiếu</span>
                    <span className="tri link">
                      {theCpDs.map(maThe => (
                        <Link
                          key={maThe}
                          to={`/app/ccdc/8-1-1?mo=${maThe}`}
                          className="m-tc-link-the"
                        >
                          <span>{maThe}</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </Link>
                      ))}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Nhóm Chi tiết */}
            <div className="m-tc-nhom-chu">
              CHI TIẾT ({dsDong.length} DÒNG)
            </div>
            <div className="m-tc-card-chi-tiet">
              {dsDong.map((d, idx) => (
                <div key={idx} className="m-tc-dong-muc">
                  <div className="m-tc-stt-tron">{idx + 1}</div>
                  <span className="m-tc-muc-ten">{d.ten || d.ly || ghiChu}</span>
                  <span className="m-tc-muc-tien">{money(d.tien || tongSoTien)}</span>
                </div>
              ))}
              {dsDong.length > 1 && (
                <div className="m-tc-dong-tong-muc">
                  <span>Tổng cộng ({dsDong.length} dòng)</span>
                  <span className="so">{money(tongSoTien)} đ</span>
                </div>
              )}
            </div>

            {/* Bút toán hạch toán nếu gói Plus/Pro (phục vụ test 15A/16A/17A) */}
            {s.goi !== 'S' && dsButToan.length > 0 && (
              <div className="m-xp-the-ht" style={{ margin: '0 16px 16px' }}>
                <div className="m-tc-nhom-chu" style={{ margin: '8px 0 4px' }}>HẠCH TOÁN</div>
                <div className="m-tc-card-thong-tin" style={{ padding: '8px 12px' }}>
                  {dsButToan.map((bt, idx) => (
                    <div key={idx} className="m-xp-ht-dong m-ht-dong" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                      <span className="m-ht-tk" style={{ fontSize: '13px', color: '#1f2225' }}>
                        {bt.kieu === 'no' ? 'Nợ' : 'Có'} {bt.so} <i style={{ color: '#6b7280', fontStyle: 'normal' }}>({bt.ten})</i>
                      </span>
                      <span className="m-ht-so" style={{ fontSize: '13px', fontWeight: 600 }}>{money(bt.tien)} đ</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 4. Tab Đính kèm (chỉ gói Plus/Pro) (T527) */}
        {s.goi !== 'S' && tabHien === 'dinhkem' && (
          <div className="m-tc-tab-trong">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
            <p>Chưa có tài liệu đính kèm</p>
          </div>
        )}

        {/* 5. Tab Lịch sử */}
        {tabHien === 'lichsu' && (
          <MLichSu goi={s.goi} man={`${mod.key}/${sc.slug}`} id={String(row.id)} />
        )}
      </main>

      {/* ── FOOTER CỐ ĐỊNH ĐÁY ── */}
      <footer className="m-tc-xem-footer">
        <button
          type="button"
          className="m-tc-btn-more-vuong m-xp-nut-menu"
          onClick={() => setMoSheetThaoTac(true)}
          aria-label="Thao tác khác"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>

        <button
          type="button"
          className="m-tc-btn-sua-chinh"
          onClick={moSua}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span>Sửa phiếu</span>
        </button>
      </footer>

      {/* ── BOTTOM SHEET THAO TÁC CHỨNG TỪ THEO FIGMA MB04.1 ── */}
      {moSheetThaoTac && (
        <div className="m-tc-sheet-overlay" onClick={() => setMoSheetThaoTac(false)}>
          <div className="m-tc-sheet-tam" onClick={e => e.stopPropagation()}>
            <div className="m-tc-sheet-handle" />
            <h2 className="m-tc-sheet-tieu-de">Thao tác chứng từ</h2>

            <div className="m-tc-sheet-ds">
              <button
                type="button"
                className="m-tc-sheet-item"
                onClick={() => {
                  setMoSheetThaoTac(false)
                  moSua()
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span>Sửa chứng từ</span>
              </button>
              <div className="m-tc-sheet-divider" />

              <button
                type="button"
                className="m-tc-sheet-item"
                onClick={() => {
                  setMoSheetThaoTac(false)
                  handleMenuChon('copy')
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Sao chép chứng từ</span>
              </button>
              <div className="m-tc-sheet-divider" />

              <button
                type="button"
                className="m-tc-sheet-item xoa"
                onClick={() => {
                  setMoSheetThaoTac(false)
                  handleMenuChon('xoa')
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>Xoá chứng từ</span>
              </button>
            </div>

            <button
              type="button"
              className="m-tc-sheet-btn-dong"
              onClick={() => setMoSheetThaoTac(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Hộp xác nhận bỏ ghi sổ */}
      {hoiBoGhi && (
        <HopXacNhan
          tieuDe={`Bỏ ghi sổ ${soCt}?`}
          nut="Bỏ ghi sổ"
          onDong={() => setHoiBoGhi(false)}
          onDongY={() => {
            setHoiBoGhi(false)
            toast('Đã bỏ ghi sổ')
          }}
        >
          Bỏ ghi sổ sẽ huỷ các bút toán và cập nhật lại số dư sổ sách liên quan.
        </HopXacNhan>
      )}

      {/* Phiếu chi còn thẻ chi phí phân bổ (T475) */}
      {hoiKhongSua && (
        <HopXacNhan
          tieuDe={`Không sửa được ${soCt}`}
          nut="Mở thẻ"
          nutHuy="Đóng"
          nutDo={false}
          onDong={() => setHoiKhongSua(false)}
          onDongY={() => {
            setHoiKhongSua(false)
            nav(`/app/ccdc/8-1-1?mo=${theCuaPhieu(row)[0]}`, { state: { veGoc: `${path}/${row.id}` } })
          }}
        >
          Phiếu đã có thẻ chi phí phân bổ {theCuaPhieu(row).join(', ')}. Xoá thẻ trước rồi mới sửa được phiếu.
        </HopXacNhan>
      )}

      {/* Hộp xác nhận xoá */}
      {hoiXoa && (
        <HopXacNhan
          tieuDe={`Xoá ${soCt}?`}
          nut="Xoá phiếu"
          onDong={() => setHoiXoa(false)}
          onDongY={thucHienXoa}
        >
          Phiếu đã xoá không lấy lại được.
        </HopXacNhan>
      )}
    </div>
  )
}
