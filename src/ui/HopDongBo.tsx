import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChonKhoangNgay, type KhoangNgay } from './ChonNgay'
import { Popover } from './Dropdown'
import { Icon } from './Icon'
import { HopKetQuaDongBo, type KetQuaHop } from './HopKetQuaDongBo'
import { ThongBao } from './ThongBao'
import { useGiuManDongBo } from './giuManDongBo'
import { HOM_NAY } from '../data/mock'

export interface MucDongBo {
  ma: string
  ten: string
  phu?: string
}

export interface KetQuaDongBo {
  tu: Date
  den: Date
  chon: string[]
  mon: string[]
  lamLai: boolean
  tichPhu?: boolean
  loaiThu?: boolean
  loaiChi?: boolean
}

export interface HopDongBoProps {
  tieuDe: string
  phu: string
  nhanDs: string
  ds: MucDongBo[]
  coMon?: boolean
  dsMon?: string[]
  coLoaiPhieu?: boolean   // Thu chi: thêm mục chọn Loại phiếu (T697)
  nhanLoaiThu?: string    // T699: nhãn tuỳ chọn theo tab tiền mặt hay ngân hàng
  nhanLoaiChi?: string
  nhanLamLai: string
  nutChinh: string
  nutDangChay?: string
  chonSan?: string[]        // mã chọn sẵn khi mở hộp, vd cửa hàng đang làm việc (T117)
  lamLaiMacDinh?: boolean   // ô tích ở chân hộp tích sẵn hay không (T117)
  ghiChuLamLai?: string     // dòng giải thích dưới ô tích (T117)
  tichPhu?: { nhan: string; ghiChu?: string; macDinh?: boolean }   // ô tích thứ hai ở chân hộp (T137)
  onDong: () => void
  onDongBo: (ketQua: KetQuaDongBo) => void
  taoKetQua: (kq: KetQuaDongBo) => KetQuaHop
  donVi: string
}

function fNgay(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function HopDongBo({
  tieuDe,
  phu,
  nhanDs,
  ds,
  coMon = false,
  dsMon = [],
  coLoaiPhieu = false,
  nhanLoaiThu,
  nhanLoaiChi,
  nhanLamLai,
  nutChinh,
  nutDangChay,
  chonSan = [],
  lamLaiMacDinh = false,
  ghiChuLamLai,
  tichPhu,
  onDong,
  onDongBo,
  taoKetQua,
  donVi,
}: HopDongBoProps) {
  const [khoangNgay, setKhoangNgay] = useState<KhoangNgay>(() => ({
    tu: new Date(2026, 9, 1),
    den: HOM_NAY,
  }))
  const [tim, setTim] = useState('')
  const [chon, setChon] = useState<string[]>(chonSan)
  const [mon, setMon] = useState<string[]>([])
  const [moMon, setMoMon] = useState(false)
  const [timMon, setTimMon] = useState('')
  const [lamLai, setLamLai] = useState(lamLaiMacDinh)
  const [tichPhuVal, setTichPhuVal] = useState(tichPhu?.macDinh ?? false)
  const [trangThai, setTrangThai] = useState<'san' | 'chay' | 'huy'>('san')
  const [pt, setPt] = useState(0)
  const [soMucChay, setSoMucChay] = useState(0)
  const [hoiHuy, setHoiHuy] = useState(false)
  const [ketQua, setKetQua] = useState<KetQuaHop | null>(null)
  const [loaiThu, setLoaiThu] = useState(true)
  const [loaiChi, setLoaiChi] = useState(true)

  const dangChay = trangThai === 'chay'

  const timRef = useRef<HTMLInputElement>(null)
  const monAnchorRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)
  const onDongBoRef = useRef(onDongBo)
  onDongBoRef.current = onDongBo
  const taoKetQuaRef = useRef(taoKetQua)
  taoKetQuaRef.current = taoKetQua
  const handleDongBoRef = useRef<() => void>(() => {})

  const dungTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    timRef.current?.focus()
    const t = setTimeout(() => {
      timRef.current?.focus()
    }, 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => dungTimer, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !dangChay && !hoiHuy && !ketQua) {
        onDong()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDong, dangChay, hoiHuy, ketQua])

  const dongAnToan = () => {
    if (dangChay) return
    onDong()
  }

  const tenNhanDs = useMemo(() => {
    const s = nhanDs.toLowerCase().trim()
    if (s.includes('kho')) return 'kho'
    if (s.includes('cửa hàng')) return 'cửa hàng'
    if (s.includes('đơn vị')) return 'đơn vị nhận hoá đơn'
    return s.replace(' đồng bộ', '')
  }, [nhanDs])

  const dsHienThi = useMemo(() => {
    const q = tim.trim().toLowerCase()
    if (!q) return ds
    return ds.filter(
      x =>
        x.ten.toLowerCase().includes(q) ||
        x.ma.toLowerCase().includes(q) ||
        (x.phu && x.phu.toLowerCase().includes(q)),
    )
  }, [ds, tim])

  const chonTatCa = () => {
    const set = new Set([...chon, ...dsHienThi.map(x => x.ma)])
    setChon(Array.from(set))
  }

  const boChon = () => {
    if (!tim.trim()) {
      setChon([])
    } else {
      const maAn = new Set(dsHienThi.map(x => x.ma))
      setChon(prev => prev.filter(m => !maAn.has(m)))
    }
  }

  const dsMonLoc = useMemo(() => {
    const q = timMon.trim().toLowerCase()
    if (!q) return dsMon
    return dsMon.filter(m => m.toLowerCase().includes(q))
  }, [dsMon, timMon])

  const handleDongBo = () => {
    if (chon.length === 0 || dangChay || (coLoaiPhieu && !loaiThu && !loaiChi)) return
    dungTimer()
    setHoiHuy(false)
    setKetQua(null)
    setPt(0)
    setSoMucChay(chon.length)
    setTrangThai('chay')

    const kq: KetQuaDongBo = {
      tu: khoangNgay.tu,
      den: khoangNgay.den,
      chon: [...chon],
      mon: [...mon],
      lamLai,
      tichPhu: Boolean(tichPhuVal),
      loaiThu,
      loaiChi,
    }

    let buoc = 0
    timerRef.current = window.setInterval(() => {
      buoc += 1
      const next = Math.min(100, buoc * 5)
      setPt(next)
      if (next >= 100) {
        dungTimer()
        setHoiHuy(false)
        setTrangThai('san')
        onDongBoRef.current(kq)
        const hopKq = taoKetQuaRef.current(kq)
        setKetQua(
          hopKq.loai === 'loi' && !hopKq.nutChinh
            ? {
                ...hopKq,
                nutChinh: {
                  ten: 'Thử lại',
                  onClick: () => {
                    setKetQua(null)
                    handleDongBoRef.current()
                  },
                },
              }
            : hopKq,
        )
      }
    }, 200)
  }
  handleDongBoRef.current = handleDongBo

  const hopGiuMan = useGiuManDongBo(dangChay, () => {
    dungTimer()
    setHoiHuy(false)
    setTrangThai('huy')
  })

  const tong = 120 * soMucChay
  const da = Math.round((tong * pt) / 100)
  const mucDangChay = soMucChay > 0 ? Math.min(soMucChay, Math.max(1, Math.ceil((pt / 100) * soMucChay))) : 0

  const chuDangChay = nutDangChay ?? (nutChinh.toLowerCase().startsWith('tải') ? 'Đang tải…' : 'Đang đồng bộ…')

  return (
    <>
      {createPortal(
        <div
          className="overlay hdb-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={tieuDe}
          onMouseDown={e => {
            if (e.target === e.currentTarget) dongAnToan()
          }}
        >
          <div className="hdb-hop">
            <header className="hdb-dau">
              <div className="hdb-ic-wrap">
                <Icon n="refresh" className="ic sm" />
              </div>
              <div className="hdb-dau-chu">
                <div className="hdb-tieu-de">{tieuDe}</div>
                <div className="hdb-phu">{phu}</div>
              </div>
              <button
                type="button"
                className={`icon-btn hdb-dong${dangChay ? ' mo' : ''}`}
                title={dangChay ? 'Đang đồng bộ, bấm Huỷ tiến trình nếu muốn dừng' : 'Đóng (Esc)'}
                data-hd="hdbDong"
                disabled={dangChay}
                onClick={dongAnToan}
              >
                <Icon n="x" />
              </button>
            </header>

        <div className="hdb-than">
          <div className="hdb-muc hdb-ngay" data-hd="hdbNgay">
            <div className="hdb-nhan">Khoảng thời gian</div>
            <ChonKhoangNgay value={khoangNgay} onChange={setKhoangNgay} />
          </div>

          {coLoaiPhieu && (
            <div className="hdb-muc" data-hd="hdbLoai">
              <div className="hdb-nhan">Loại phiếu</div>
              <div className="hdb-chon-loai">
                <label className={`hdb-the-loai${loaiThu ? ' on' : ''}`}>
                  <input
                    type="checkbox"
                    checked={loaiThu}
                    disabled={dangChay}
                    onChange={e => setLoaiThu(e.target.checked)}
                  />
                  <div className="hdb-the-loai-tt">
                    <b>{nhanLoaiThu ?? 'Phiếu thu'}</b>
                    {!nhanLoaiThu && <small>Thu tiền mặt, thu ngân hàng</small>}
                  </div>
                </label>
                <label className={`hdb-the-loai${loaiChi ? ' on' : ''}`}>
                  <input
                    type="checkbox"
                    checked={loaiChi}
                    disabled={dangChay}
                    onChange={e => setLoaiChi(e.target.checked)}
                  />
                  <div className="hdb-the-loai-tt">
                    <b>{nhanLoaiChi ?? 'Phiếu chi'}</b>
                    {!nhanLoaiChi && <small>Chi tiền mặt, chi ngân hàng</small>}
                  </div>
                </label>
              </div>
            </div>
          )}

          <div className="hdb-muc" data-hd="hdbDs">
            <div className="hdb-ds-khoi">
              <div className="hdb-ds-dau">
                <div className="hdb-nhan">{nhanDs}</div>
                <button
                  type="button"
                  className="hdb-nut-chu"
                  disabled={dangChay || chon.length === 0}
                  onClick={boChon}
                >
                  Xoá lựa chọn
                </button>
              </div>

              <div className="hdb-tim-o">
                <Icon n="search" className="ic sm hdb-tim-ic" />
                <input
                  ref={timRef}
                  type="text"
                  className="hdb-tim-inp"
                  placeholder={`Tìm theo tên hoặc mã ${tenNhanDs}…`}
                  value={tim}
                  disabled={dangChay}
                  onChange={e => setTim(e.target.value)}
                />
              </div>

              <div className="hdb-thong-ke">
                <span className="hdb-so-luong">Tổng đã chọn {chon.length}</span>
                <button
                  type="button"
                  className="hdb-nut-chu"
                  disabled={dangChay}
                  onClick={chonTatCa}
                >
                  Chọn tất cả
                </button>
              </div>

              <div className="hdb-ds-cuon">
                {dsHienThi.map(item => {
                  const daChon = chon.includes(item.ma)
                  return (
                    <label
                      key={item.ma}
                      className={`hdb-the${daChon ? ' on' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={daChon}
                        disabled={dangChay}
                        onChange={() => {
                          setChon(prev =>
                            daChon
                              ? prev.filter(x => x !== item.ma)
                              : [...prev, item.ma],
                          )
                        }}
                      />
                      <div className="hdb-the-tt">
                        <div className="hdb-the-ten">{item.ten}</div>
                        <div className="hdb-the-ma">
                          {item.ma}
                          {item.phu ? ` · ${item.phu}` : ''}
                        </div>
                      </div>
                    </label>
                  )
                })}
                {dsHienThi.length === 0 && (
                  <div className="hdb-trong">
                    Không tìm thấy kết quả phù hợp
                  </div>
                )}
              </div>
            </div>
          </div>

          {coMon && (
            <div className="hdb-muc" data-hd="hdbMon">


              <div className="hdb-nhan">Món bán</div>
              <div
                ref={monAnchorRef}
                className={`hdb-mon-box${moMon ? ' open' : ''}`}
                onClick={() => {
                  if (!dangChay) setMoMon(o => !o)
                }}
              >
                <div className="hdb-mon-txt">
                  {mon.length === 0 ? (
                    <span className="hdb-mon-placeholder">Chọn món bán</span>
                  ) : (
                    mon.map(m => (
                      <span key={m} className="hdb-mon-tag">
                        {m}
                        <button
                          type="button"
                          className="hdb-mon-tag-x"
                          disabled={dangChay}
                          onClick={e => {
                            e.stopPropagation()
                            setMon(prev => prev.filter(x => x !== m))
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <Icon n="chevd" className="ic sm hdb-chevd" />
              </div>

              <Popover
                anchor={monAnchorRef}
                open={moMon}
                onClose={() => setMoMon(false)}
                width={520}
                className="hdb-mon-pop"
              >
                <div className="hdb-mon-tim">
                  <Icon n="search" className="ic sm" />
                  <input
                    type="text"
                    placeholder="Tìm món bán…"
                    value={timMon}
                    onChange={e => setTimMon(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="hdb-mon-tac-vu">
                  <span className="muted">
                    {mon.length === 0
                      ? 'Tất cả món (để trống)'
                      : `${mon.length} món đã chọn`}
                  </span>
                  <div className="hdb-tac-vu">
                    <button
                      type="button"
                      className="hdb-nut-chu"
                      onClick={() => setMon([...dsMon])}
                    >
                      Chọn tất cả
                    </button>
                    <span className="hdb-ngan">·</span>
                    <button
                      type="button"
                      className="hdb-nut-chu"
                      onClick={() => setMon([])}
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>
                <div className="hdb-mon-ds">
                  {dsMonLoc.map(m => {
                    const daChon = mon.includes(m)
                    return (
                      <label
                        key={m}
                        className={`hdb-mon-item${daChon ? ' on' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={daChon}
                          onChange={() => {
                            setMon(prev =>
                              daChon
                                ? prev.filter(x => x !== m)
                                : [...prev, m],
                            )
                          }}
                        />
                        <span>{m}</span>
                      </label>
                    )
                  })}
                  {dsMonLoc.length === 0 && (
                    <div className="hdb-trong">Không tìm thấy món</div>
                  )}
                </div>
                <div className="hdb-mon-pop-foot">
                  <button
                    type="button"
                    className="btn sm pri"
                    onClick={() => setMoMon(false)}
                  >
                    Xong
                  </button>
                </div>
              </Popover>
            </div>
          )}

          <div className="hdb-luu-y">
            Lưu ý: Hệ thống sẽ đồng bộ dữ liệu cho {chon.length} {tenNhanDs} đã chọn từ {fNgay(khoangNgay.tu)} 00:00 đến {fNgay(khoangNgay.den)} 23:59
          </div>
        </div>

        <footer className={`hdb-chan${trangThai !== 'san' ? ' hdb-chan-cot' : ''}`}>
          {trangThai !== 'san' && (
            <div className="hdb-td" aria-live="polite">
              <div className="hdb-td-thanh">
                <div
                  className={`hdb-td-muc${trangThai === 'huy' ? ' huy' : ''}`}
                  style={{ width: `${pt}%` }}
                />
              </div>
              <div className="hdb-td-dong">
                <span className="hdb-td-chu">
                  {trangThai === 'huy'
                    ? `Đã huỷ ở ${pt}% · ${da} ${donVi} đã về giữ nguyên`
                    : `${da} / ${tong} ${donVi} · ${tenNhanDs} ${mucDangChay}/${soMucChay}`}
                </span>
                <span className={`hdb-td-pt${trangThai === 'huy' ? ' huy' : ''}`}>{pt}%</span>
              </div>
            </div>
          )}
          <div className="hdb-chan-hang">
            {dangChay ? (
              <span className="hdb-chan-chay">Đang đồng bộ. Giữ nguyên màn hình này tới khi xong.</span>
            ) : tichPhu ? (
              <div className="hdb-chan-trai-ds">
                <label className="hdb-chan-trai" data-hd="hdbLamLai">
                  <input
                    type="checkbox"
                    checked={lamLai}
                    disabled={dangChay}
                    onChange={e => setLamLai(e.target.checked)}
                  />
                  <span>{nhanLamLai}{ghiChuLamLai && <small className="hdb-chu-nho">{ghiChuLamLai}</small>}</span>
                </label>
                <label className="hdb-chan-trai">
                  <input
                    type="checkbox"
                    checked={tichPhuVal}
                    disabled={dangChay}
                    onChange={e => setTichPhuVal(e.target.checked)}
                  />
                  <span>{tichPhu.nhan}{tichPhu.ghiChu && <small className="hdb-chu-nho">{tichPhu.ghiChu}</small>}</span>
                </label>
              </div>
            ) : (
              <label className="hdb-chan-trai" data-hd="hdbLamLai">
                <input
                  type="checkbox"
                  checked={lamLai}
                  disabled={dangChay}
                  onChange={e => setLamLai(e.target.checked)}
                />
                <span>{nhanLamLai}{ghiChuLamLai && <small className="hdb-chu-nho">{ghiChuLamLai}</small>}</span>
              </label>
            )}
            <div className="hdb-chan-phai">
              {dangChay ? (
                <button
                  type="button"
                  className="btn hdb-nut-dung"
                  onClick={() => setHoiHuy(true)}
                >
                  Huỷ tiến trình
                </button>
              ) : (
                <button
                  type="button"
                  className="btn hdb-nut-huy"
                  onClick={dongAnToan}
                >
                  Huỷ bỏ
                </button>
              )}
              <button
                type="button"
                className="btn pri hdb-nut-chinh"
                disabled={chon.length === 0 || dangChay || (coLoaiPhieu && !loaiThu && !loaiChi)}
                data-hd="hdbNut"
                onClick={handleDongBo}
              >
                {dangChay && <Icon n="refresh" className="ic sm hdb-spin" />}
                {dangChay ? chuDangChay : trangThai === 'huy' ? 'Đồng bộ lại' : nutChinh}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  )}
      {hopGiuMan}
      {hoiHuy && (
        <ThongBao
          loai="hoi"
          tieuDe="Huỷ tiến trình đồng bộ?"
          moTa="Dữ liệu đã về giữ nguyên."
          nut={{
            ten: 'Huỷ tiến trình',
            onClick: () => {
              dungTimer()
              setHoiHuy(false)
              setTrangThai('huy')
            },
          }}
          nutPhu={{
            ten: 'Tiếp tục đồng bộ',
            onClick: () => setHoiHuy(false),
          }}
          onDong={() => setHoiHuy(false)}
        />
      )}
      {ketQua && <HopKetQuaDongBo kq={ketQua} onDong={() => setKetQua(null)} />}
    </>
  )
}
