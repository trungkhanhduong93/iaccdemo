import { useEffect, useMemo, useState, type FC } from 'react'
import { fold, money } from '../format'
import { Icon } from '../Icon'
import { CUA_HANG } from '../../data/mock'
import { ghiNhatKy, soKeTiep, suaPhieu, themPhieu, type PhieuTt } from '../generic/daXoa'
import { MAN_THU_CHI, TEN_CT_TT, TIEN_TO_CT_TT } from '../generic/ChungTuForm'

export interface QuyMau {
  k: string
  ten: string
  loai: 'tm' | 'nh'
  soDu: number
}

export const BANG_SO_DU_QUY: Record<string, number> = {
  'Quỹ tiền mặt Nguyễn Trãi': 12450000,
  'Quỹ tiền mặt Lê Lợi': 8200000,
  'Quỹ tiền mặt văn phòng': 3100000,
  'Quỹ tiền mặt Thảo Điền': 32500000,
  'Techcombank 1903 4455 6677 88': 319850000,
  'Vietcombank 0071 0012 34567': 144800000,
  'Vietcombank · 0071 0012 3456': 186300000,
  'VPBank, chi nhánh Quận 1': 3320000,
}

export const soDuQuy = (tenQuy: string): number => {
  if (BANG_SO_DU_QUY[tenQuy] !== undefined) return BANG_SO_DU_QUY[tenQuy]
  if (tenQuy.includes('VPBank')) return 3320000
  if (tenQuy.includes('Techcombank')) return 319850000
  if (tenQuy.includes('Vietcombank')) return 186300000
  if (tenQuy.includes('văn phòng')) return 3100000
  if (tenQuy.includes('Lê Lợi')) return 8200000
  if (tenQuy.startsWith('Quỹ tiền mặt')) return 12450000
  return 15000000
}

export const DS_QUY_MAU: QuyMau[] = [
  ...CUA_HANG.map(c => ({
    k: `Quỹ tiền mặt ${c.ngan}`,
    ten: `Quỹ tiền mặt ${c.ngan}`,
    loai: 'tm' as const,
    soDu: soDuQuy(`Quỹ tiền mặt ${c.ngan}`),
  })),
  { k: 'Vietcombank 0071 0012 34567', ten: 'Vietcombank 0071 0012 34567', loai: 'nh', soDu: 144800000 },
  { k: 'Techcombank 1903 4455 6677 88', ten: 'Techcombank 1903 4455 6677 88', loai: 'nh', soDu: 319850000 },
  { k: 'VPBank, chi nhánh Quận 1', ten: 'VPBank, chi nhánh Quận 1', loai: 'nh', soDu: 3320000 },
]

export interface ThongTinTt {
  hinhThuc: 'tienmat' | 'chuyenkhoan'
  quy: string
  ngay: string
  soTien: number
  dienGiai: string
}

// Lập luôn phiếu chi tiền mặt hoặc uỷ nhiệm chi trả nhà cung cấp, ghi vào thanh toán của phiếu mua (T655)
export function lapPhieuChiTraNcc(tt: ThongTinTt, mua: {
  man: string
  id: string
  so: string
  di: string
  dsTtCu: PhieuTt[]
  cn: unknown
  doiTuong: string
  diaChi: string
  nguoiGiaoDich: string
  goi: string
  ai: string
}): string {
  const loai = tt.hinhThuc === 'tienmat' ? 'chi' : 'unc'
  const lyDo = 'Thanh Toán Công Nợ Nhà Cung Cấp'
  const so = soKeTiep(MAN_THU_CHI, `${TIEN_TO_CT_TT[loai]}2610-`)
  const id = `phieu-${Date.now()}`
  themPhieu(MAN_THU_CHI, {
    id,
    so,
    loai,
    tenLoai: TEN_CT_TT[loai],
    ngay: tt.ngay,
    thang: Number(tt.ngay.split('/')[1]) || 10,
    cn: mua.cn,
    doiTuong: mua.doiTuong,
    _diaChi: mua.diaChi,
    _nguoiGiao: mua.nguoiGiaoDich,
    _quy: tt.quy,
    _lyDo: lyDo,
    _ghiChu: tt.dienGiai,
    dienGiai: tt.dienGiai,
    tien: tt.soTien,
    tong: tt.soTien,
    _dong: [{
      ten: tt.dienGiai,
      ly: lyDo,
      tien: tt.soTien,
      gia: tt.soTien,
      ...(mua.goi !== 'S' ? { tkNo: '331', tkCo: loai === 'chi' ? '1111' : '1121' } : {}),
    }],
    tt: mua.goi === 'S' ? 'ghi' : 'nhap',
    nguon: 'tay',
    _thamChieu: mua.so,
    _thamChieuDi: mua.di,
  }, mua.ai)
  ghiNhatKy(MAN_THU_CHI, id, so, mua.ai, `Lập mới chứng từ ${so}`)
  suaPhieu(mua.man, mua.id, {
    _dsTt: [...mua.dsTtCu, { id, so, loai, tien: tt.soTien, ngay: tt.ngay, quy: tt.quy }],
    _httt: 'congno',
  })
  ghiNhatKy(mua.man, mua.id, mua.so, mua.ai, `Thanh toán ${money(tt.soTien)} bằng ${so}`)
  return so
}

export interface MThanhToanNgayProps {
  mo: boolean
  onDong: () => void
  soPhieu?: string
  soCt?: string
  nccTen?: string
  cuaHang?: string
  cuaHangTen?: string
  conNo?: number
  conLai?: number
  ngayMacDinh?: string
  onLapPhieuChi: (thongTin: ThongTinTt) => void
}

export const MThanhToanNgay: FC<MThanhToanNgayProps> = ({
  mo,
  onDong,
  soPhieu,
  soCt,
  nccTen,
  cuaHang,
  cuaHangTen,
  conNo,
  conLai,
  ngayMacDinh,
  onLapPhieuChi,
}) => {
  const soCtHienThi = soPhieu || soCt || ''
  const chHienThi = cuaHang || cuaHangTen || 'Phố Mây Nguyễn Trãi'
  const tienNo = conNo ?? conLai ?? 0

  const cnNgan = useMemo(() => {
    return CUA_HANG.find(c => c.ten === chHienThi || c.ngan === chHienThi || c.id === chHienThi)?.ngan
      ?? CUA_HANG.find(c => chHienThi.includes(c.ngan))?.ngan
      ?? 'Nguyễn Trãi'
  }, [chHienThi])

  const quyTmMacDinh = useMemo(() => {
    return `Quỹ tiền mặt ${cnNgan}`
  }, [cnNgan])

  const [htSheet, setHtSheet] = useState<'tienmat' | 'chuyenkhoan'>('tienmat')
  const [quySheet, setQuySheet] = useState(quyTmMacDinh)
  const [quyTam, setQuyTam] = useState(quyTmMacDinh)
  const [ngaySheet, setNgaySheet] = useState(ngayMacDinh || '18/10/2026')
  const [tienSheet, setTienSheet] = useState(tienNo)
  const [dgSheet, setDgSheet] = useState(`Chi tiền mua hàng theo ${soCtHienThi}`)
  const [moBangChonQuy, setMoBangChonQuy] = useState(false)
  const [timQuy, setTimQuy] = useState('')

  useEffect(() => {
    if (mo) {
      setHtSheet('tienmat')
      setQuySheet(quyTmMacDinh)
      setQuyTam(quyTmMacDinh)
      setNgaySheet(ngayMacDinh || '18/10/2026')
      setTienSheet(tienNo)
      setDgSheet(`Chi tiền mua hàng theo ${soCtHienThi}`)
      setMoBangChonQuy(false)
      setTimQuy('')
    }
  }, [mo, soCtHienThi, tienNo, quyTmMacDinh, ngayMacDinh])

  const dsQuyTmLoc = useMemo(() => {
    const list = DS_QUY_MAU.filter(q => q.loai === 'tm' && q.ten === quyTmMacDinh)
    const ds = list.length > 0 ? list : [{ k: quyTmMacDinh, ten: quyTmMacDinh, loai: 'tm' as const, soDu: soDuQuy(quyTmMacDinh) }]
    return ds.filter(q => !timQuy.trim() || fold(q.ten).includes(fold(timQuy.trim())))
  }, [quyTmMacDinh, timQuy])

  const dsQuyNhLoc = useMemo(() => {
    return DS_QUY_MAU
      .filter(q => q.loai === 'nh')
      .filter(q => !timQuy.trim() || fold(q.ten).includes(fold(timQuy.trim())))
  }, [timQuy])

  if (!mo) return null

  const handleLap = () => {
    // Mọi gói đều sửa được số tiền, không vượt số còn phải trả (T655, thay khoá gói Standard của T630)
    const soTienThuc = tienSheet
    if (soTienThuc <= 0 || soTienThuc > tienNo || !quySheet) return
    onLapPhieuChi({
      hinhThuc: htSheet,
      quy: quySheet,
      ngay: ngaySheet,
      soTien: soTienThuc,
      dienGiai: dgSheet,
    })
  }

  return (
    <>
      {/* ── B2: SHEET THANH TOÁN NGAY CHO PHIẾU MUA (85dvh) ── */}
      <div className="m-tam-overlay" onClick={onDong}>
        <div className="m-tam-hop m-t600-sheet-85" onClick={e => e.stopPropagation()}>
          <div className="m-tam-dau">
            <h2 className="m-tam-tieu">Thanh toán ngay cho {soCtHienThi}</h2>
            <button
              type="button"
              className="m-tam-dong-btn"
              onClick={onDong}
              aria-label="Đóng"
            >
              <Icon n="x" className="ic sm" kieu="net" />
            </button>
          </div>

          <div className="m-t600-sheet-than" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="m-t600-o-nhap-f">
              <label className="m-t600-lbl">Quỹ thanh toán <em>*</em></label>
              <button
                type="button"
                className="m-t600-o-quy-tt"
                onClick={() => {
                  setQuyTam(quySheet)
                  setMoBangChonQuy(true)
                }}
              >
                <div className={`m-t600-quy-ic ${htSheet === 'tienmat' ? 'tm' : 'nh'}`}>
                  <Icon n={htSheet === 'tienmat' ? 'dollar' : 'bank'} className="ic" kieu="net" />
                </div>
                <div className="m-t600-quy-info">
                  <b>{quySheet || 'Chọn quỹ'}</b>
                  <small>Số dư {money(soDuQuy(quySheet))} đ</small>
                </div>
                <Icon n="chevd" className="ic sm" kieu="net" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="m-t600-o-nhap-f">
                <label className="m-t600-lbl">Ngày chứng từ <em>*</em></label>
                <input
                  type="text"
                  className="m-t600-inp"
                  style={{ fontSize: 16 }}
                  value={ngaySheet}
                  onChange={e => setNgaySheet(e.target.value)}
                  placeholder="DD/MM/YYYY"
                />
              </div>
              <div className="m-t600-o-nhap-f">
                <label className="m-t600-lbl">Số tiền <em>*</em></label>
                <input
                  type="text"
                  className="m-t600-inp"
                  inputMode="numeric"
                  aria-label="Số tiền thanh toán"
                  style={{
                    textAlign: 'right',
                    fontWeight: 600,
                    color: 'var(--blue)',
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: 16,
                  }}
                  value={money(tienSheet)}
                  onChange={e => setTienSheet(Number(e.target.value.replace(/\D/g, '')) || 0)}
                />
              </div>
            </div>

            <div className="m-t600-o-nhap-f">
              <label className="m-t600-lbl">Diễn giải</label>
              <input
                type="text"
                className="m-t600-inp"
                style={{ fontSize: 16 }}
                value={dgSheet}
                onChange={e => setDgSheet(e.target.value)}
              />
            </div>

            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
              Còn phải trả {money(tienNo)} đ. Trả một phần thì sửa Số tiền. Bấm Lập phiếu là lập ngay phiếu {htSheet === 'tienmat' ? 'chi tiền mặt' : 'chi ngân hàng'} bên Thu chi, không phải điền lại.
            </div>
            {tienSheet <= 0 && <div style={{ fontSize: 12, color: 'var(--red)' }}>Số tiền phải lớn hơn 0</div>}
            {tienSheet > tienNo && (
              <div style={{ fontSize: 12, color: 'var(--red)' }}>Không vượt số còn phải trả {money(tienNo)} đ</div>
            )}
            {!quySheet && <div style={{ fontSize: 12, color: 'var(--red)' }}>Vui lòng chọn quỹ</div>}
          </div>

          <div className="m-t600-sheet-day">
            <button
              type="button"
              className="m-t601-btn-foot-huy"
              onClick={onDong}
            >
              Huỷ
            </button>
            <button
              type="button"
              className="m-t601-btn-foot-pri"
              disabled={tienSheet <= 0 || tienSheet > tienNo || !quySheet}
              onClick={handleLap}
            >
              {htSheet === 'tienmat' ? 'Lập phiếu chi tiền mặt' : 'Lập uỷ nhiệm chi'}
            </button>
          </div>
        </div>
      </div>

      {/* ── BẢNG CHỌN QUỸ ĐÈ LÊN SHEET THANH TOÁN (thấp hơn sheet mẹ ~60px, lộ tiêu đề sheet mẹ) ── */}
      {moBangChonQuy && (
        <div className="m-tam-overlay" style={{ zIndex: 1200, background: 'rgba(14,26,43,.35)' }} onClick={() => setMoBangChonQuy(false)}>
          <div className="m-tam-hop m-t600-sheet-70 m-t610-sheet-con" onClick={e => e.stopPropagation()}>
            <div className="m-tam-dau">
              <div>
                <h2 className="m-tam-tieu">Chọn quỹ thanh toán</h2>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                  Cửa hàng {chHienThi} · cần trả <b style={{ color: 'var(--ink)' }}>{money(tienSheet)} đ</b>
                </div>
              </div>
              <button type="button" className="m-tam-dong-btn" onClick={() => setMoBangChonQuy(false)} aria-label="Đóng">
                <Icon n="x" className="ic sm" kieu="net" />
              </button>
            </div>

            <div className="m-t600-sheet-than" style={{ padding: '8px 16px' }}>
              <div style={{ padding: '0 0 10px' }}>
                <div className="m-t601-o-tim">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-4-4" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Tìm quỹ…"
                    style={{ fontSize: 16 }}
                    value={timQuy}
                    onChange={e => setTimQuy(e.target.value)}
                  />
                </div>
              </div>
              {/* Một bảng gồm cả quỹ tiền mặt và ngân hàng, không chia tab (T656) */}
              {[{ tieu: 'TIỀN MẶT', ds: dsQuyTmLoc }, { tieu: 'NGÂN HÀNG', ds: dsQuyNhLoc }].filter(nhom => nhom.ds.length > 0).map(nhom => (
                <div key={nhom.tieu}>
                  <div
                    className="m-t601-nhom-chu"
                    style={{
                      margin: '0 -16px 8px',
                      padding: '4px 16px 6px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--muted)',
                      letterSpacing: '.04em',
                      borderBottom: '1px solid var(--line-2)',
                    }}
                  >
                    {nhom.tieu}
                  </div>
                  {nhom.ds.map(q => {
                    const sd = soDuQuy(q.ten)
                    const khongDu = sd < tienSheet
                    const isChon = (quyTam || quySheet) === q.ten
                    return (
                      <div
                        key={q.ten}
                        className={`m-t600-hang-quy ${isChon ? 'on' : ''}`}
                        onClick={() => setQuyTam(q.ten)}
                      >
                        <span className={`m-t601-quy-ic ${q.loai}`}>
                          {q.loai === 'tm' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#138a52" strokeWidth="1.8">
                              <rect x="2" y="6" width="20" height="13" rx="2" />
                              <circle cx="12" cy="12.5" r="2.5" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0560a6" strokeWidth="1.8">
                              <path d="M3 10l9-6 9 6M5 10v8M19 10v8M9 10v8M15 10v8M3 20h18" />
                            </svg>
                          )}
                        </span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{q.ten}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                            Số dư {money(sd)} đ
                            {khongDu && (
                              <span style={{ color: 'var(--orange-d)', marginLeft: 6 }}>
                                · không đủ trả {money(tienSheet)} đ
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="m-t600-sheet-day">
              <button
                type="button"
                className="btn pri"
                style={{ width: '100%', height: 48, borderRadius: 10, fontSize: 15, fontWeight: 600 }}
                onClick={() => {
                  if (quyTam) {
                    setQuySheet(quyTam)
                    setHtSheet(DS_QUY_MAU.some(q => q.loai === 'nh' && q.ten === quyTam) ? 'chuyenkhoan' : 'tienmat')
                  }
                  setMoBangChonQuy(false)
                }}
              >
                Chọn quỹ này
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
