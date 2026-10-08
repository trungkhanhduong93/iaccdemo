// Thành phần chọn khoảng ngày theo iFaster (Lượt 1/2)
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HOM_NAY } from '../data/mock'
import { Popover } from './Dropdown'
import { Icon } from './Icon'
import { dmy } from './format'

export { dmy }

export type KhoangNgay = { tu: Date; den: Date }

/** Đọc chuỗi 'dd/mm/yyyy' hoặc 'dd-mm-yyyy' thành Date */
export function docNgay(s: string): Date {
  const parts = s.split(/[\/\-]/).map(Number)
  if (parts.length === 3 && !parts.some(isNaN)) {
    return new Date(parts[2], parts[1] - 1, parts[0], 0, 0, 0, 0)
  }
  return new Date(s)
}

/** So sánh ngày nằm trong khoảng (tính theo ngày, gồm 2 đầu mốc) */
export function trongKhoang(d: Date, k: KhoangNgay): boolean {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const tu = new Date(k.tu.getFullYear(), k.tu.getMonth(), k.tu.getDate()).getTime()
  const den = new Date(k.den.getFullYear(), k.den.getMonth(), k.den.getDate()).getTime()
  return t >= tu && t <= den
}

/** Tạo khoảng ngày trọn một tháng (1..12) của năm */
export function khoangThang(thang: number, nam: number): KhoangNgay {
  const tu = new Date(nam, thang - 1, 1, 0, 0, 0, 0)
  const den = new Date(nam, thang, 0, 0, 0, 0, 0)
  return { tu, den }
}

/** Tháng chứa HOM_NAY trong mock.ts (01/10/2026 .. 31/10/2026) */
export function thangNay(): KhoangNgay {
  return khoangThang(HOM_NAY.getMonth() + 1, HOM_NAY.getFullYear())
}

function cungNgay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function layMoc(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

const THU = ['Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'CN']

type CheDo = 'ngay' | 'thang' | 'quy'

export function ChonKhoangNgay({ value, onChange }: { value: KhoangNgay; onChange: (k: KhoangNgay) => void }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  const [draftTu, setDraftTu] = useState<Date>(value.tu)
  const [draftDen, setDraftDen] = useState<Date | null>(value.den)
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [dangChonNgay, setDangChonNgay] = useState(false)

  const [cheDo, setCheDo] = useState<CheDo>('ngay')
  const [dangChonThang, setDangChonThang] = useState(false)
  const [dangChonQuy, setDangChonQuy] = useState(false)

  const [thangTrai, setThangTrai] = useState<{ thang: number; nam: number }>(() => ({
    thang: value.tu.getMonth() + 1,
    nam: value.tu.getFullYear(),
  }))

  // Khi mở khung: đồng bộ lại nháp từ value hiện tại
  useEffect(() => {
    if (open) {
      setDraftTu(value.tu)
      setDraftDen(value.den)
      setHoverDate(null)
      setDangChonNgay(false)
      setDangChonThang(false)
      setDangChonQuy(false)
      setThangTrai({ thang: value.tu.getMonth() + 1, nam: value.tu.getFullYear() })
    }
  }, [open, value])

  const handleDong = useCallback(() => {
    setOpen(false)
    setDraftTu(value.tu)
    setDraftDen(value.den)
    setHoverDate(null)
    setDangChonNgay(false)
    setDangChonThang(false)
    setDangChonQuy(false)
  }, [value])

  const handleXacNhan = () => {
    const tu = draftTu
    const den = draftDen ?? draftTu
    const k = tu.getTime() <= den.getTime() ? { tu, den } : { tu: den, den: tu }
    onChange(k)
    setOpen(false)
  }

  // Điều hướng tháng trên lịch
  const doiThang = (deltaThang: number) => {
    setThangTrai(prev => {
      let m = prev.thang + deltaThang
      let y = prev.nam
      while (m > 12) { m -= 12; y += 1 }
      while (m < 1) { m += 12; y -= 1 }
      return { thang: m, nam: y }
    })
  }

  // Tháng bên phải luôn là tháng trái + 1
  const thangPhai = useMemo(() => {
    const m = thangTrai.thang === 12 ? 1 : thangTrai.thang + 1
    const y = thangTrai.thang === 12 ? thangTrai.nam + 1 : thangTrai.nam
    return { thang: m, nam: y }
  }, [thangTrai])

  // Lưới 42 ngày cho một tháng (tuần bắt đầu từ thứ Hai)
  const taoLich = (thang: number, nam: number) => {
    const firstDay = new Date(nam, thang - 1, 1)
    const dayOfWeek = (firstDay.getDay() + 6) % 7
    const startDate = new Date(nam, thang - 1, 1 - dayOfWeek)
    const ds: { d: Date; ngoai: boolean }[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i)
      ds.push({ d, ngoai: d.getMonth() !== thang - 1 })
    }
    return ds
  }

  const lichTrai = useMemo(() => taoLich(thangTrai.thang, thangTrai.nam), [thangTrai])
  const lichPhai = useMemo(() => taoLich(thangPhai.thang, thangPhai.nam), [thangPhai])

  // Khoảng đang hiển thị trên giao diện (tính cả rê chuột)
  const hienTai = useMemo(() => {
    let tu = draftTu
    let den = draftDen
    if (den === null) {
      den = hoverDate ?? draftTu
    }
    const tTu = layMoc(tu)
    const tDen = layMoc(den)
    return {
      min: Math.min(tTu, tDen),
      max: Math.max(tTu, tDen),
    }
  }, [draftTu, draftDen, hoverDate])

  // Click chọn ngày
  const chonNgay = (d: Date) => {
    if (dangChonNgay) {
      let tu = draftTu
      let den = d
      if (den.getTime() < tu.getTime()) {
        const tmp = tu
        tu = den
        den = tmp
      }
      setDraftTu(tu)
      setDraftDen(den)
      setDangChonNgay(false)
      setHoverDate(null)
    } else {
      setDraftTu(d)
      setDraftDen(null)
      setDangChonNgay(true)
      setHoverDate(null)
    }
  }

  // Click chọn tháng
  const chonThang = (thang: number, nam: number) => {
    const tuThang = new Date(nam, thang - 1, 1)
    const denThang = new Date(nam, thang, 0)
    if (dangChonThang) {
      const tuGoc = draftTu
      if (denThang.getTime() < tuGoc.getTime()) {
        setDraftTu(tuThang)
        setDraftDen(new Date(tuGoc.getFullYear(), tuGoc.getMonth() + 1, 0))
      } else {
        setDraftTu(tuGoc)
        setDraftDen(denThang)
      }
      setDangChonThang(false)
    } else {
      setDraftTu(tuThang)
      setDraftDen(denThang)
      setDangChonThang(true)
    }
  }

  // Click chọn quý
  const chonQuy = (quy: number, nam: number) => {
    const tuQuy = new Date(nam, (quy - 1) * 3, 1)
    const denQuy = new Date(nam, quy * 3, 0)
    if (dangChonQuy) {
      const tuGoc = draftTu
      if (denQuy.getTime() < tuGoc.getTime()) {
        setDraftTu(tuQuy)
        setDraftDen(new Date(tuGoc.getFullYear(), (Math.floor(tuGoc.getMonth() / 3) + 1) * 3, 0))
      } else {
        setDraftTu(tuGoc)
        setDraftDen(denQuy)
      }
      setDangChonQuy(false)
    } else {
      setDraftTu(tuQuy)
      setDraftDen(denQuy)
      setDangChonQuy(true)
    }
  }

  // Chọn nhanh
  const chonNhanh = (loai: 'hom-nay' | 'hom-qua' | 'tuan-nay' | 'tuan-truoc' | 'thang-nay' | 'thang-truoc') => {
    let k: KhoangNgay
    const homNay = new Date(HOM_NAY.getFullYear(), HOM_NAY.getMonth(), HOM_NAY.getDate())
    if (loai === 'hom-nay') {
      k = { tu: homNay, den: homNay }
    } else if (loai === 'hom-qua') {
      const d = new Date(homNay.getFullYear(), homNay.getMonth(), homNay.getDate() - 1)
      k = { tu: d, den: d }
    } else if (loai === 'tuan-nay') {
      const day = homNay.getDay()
      const diff = (day === 0 ? -6 : 1) - day
      const tu = new Date(homNay.getFullYear(), homNay.getMonth(), homNay.getDate() + diff)
      const den = new Date(tu.getFullYear(), tu.getMonth(), tu.getDate() + 6)
      k = { tu, den }
    } else if (loai === 'tuan-truoc') {
      const day = homNay.getDay()
      const diff = (day === 0 ? -6 : 1) - day
      const tu = new Date(homNay.getFullYear(), homNay.getMonth(), homNay.getDate() + diff - 7)
      const den = new Date(tu.getFullYear(), tu.getMonth(), tu.getDate() + 6)
      k = { tu, den }
    } else if (loai === 'thang-nay') {
      k = thangNay()
    } else {
      const m = HOM_NAY.getMonth()
      const y = HOM_NAY.getFullYear()
      k = m === 0 ? khoangThang(12, y - 1) : khoangThang(m, y)
    }
    setDraftTu(k.tu)
    setDraftDen(k.den)
    setDangChonNgay(false)
    setDangChonThang(false)
    setDangChonQuy(false)
    setHoverDate(null)
    setThangTrai({ thang: k.tu.getMonth() + 1, nam: k.tu.getFullYear() })
  }

  // Vẽ 1 ô ngày
  const renderO = ({ d, ngoai }: { d: Date; ngoai: boolean }) => {
    const t = layMoc(d)
    const laDau = t === hienTai.min
    const laCuoi = t === hienTai.max
    const laGiua = t > hienTai.min && t < hienTai.max
    const laHn = cungNgay(d, HOM_NAY)

    const cls = [
      'kn-o',
      ngoai ? 'ngoai' : '',
      laDau ? 'dau' : '',
      laCuoi ? 'cuoi' : '',
      laGiua ? 'giua' : '',
      laHn ? 'hom-nay' : '',
    ].filter(Boolean).join(' ')

    return (
      <button
        key={d.toISOString()}
        type="button"
        className={cls}
        onClick={() => chonNgay(d)}
        onMouseEnter={() => dangChonNgay && setHoverDate(d)}
      >
        <span>{d.getDate()}</span>
      </button>
    )
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`kn-nut${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className="kn-nut-txt">{dmy(value.tu)} <span className="kn-nut-arr">→</span> {dmy(value.den)}</span>
        <Icon n="calendar" className="ic sm kn-nut-ic" />
      </button>

      <Popover
        anchor={btnRef}
        open={open}
        onClose={handleDong}
        align="start"
        width={600}
        role="dialog"
        className="kn-pop"
      >
        <div className="kn-pop-in">
          {/* Lịch / Lưới chọn */}
          {cheDo === 'ngay' && (
            <div className="kn-lich">
              {/* Cột tháng trái */}
              <div className="kn-cot">
                <div className="kn-dau">
                  <div className="kn-dau-nhom">
                    <button type="button" className="kn-nav-btn" onClick={() => doiThang(-12)} title="Lùi 1 năm">«</button>
                    <button type="button" className="kn-nav-btn" onClick={() => doiThang(-1)} title="Lùi 1 tháng">
                      <Icon n="chevl" className="ic sm" />
                    </button>
                  </div>
                  <span className="kn-dau-ten">Tháng {thangTrai.thang}/{thangTrai.nam}</span>
                  <div className="kn-dau-nhom">
                    <button type="button" className="kn-nav-btn" onClick={() => doiThang(1)} title="Tiến 1 tháng">
                      <Icon n="chevr" className="ic sm" />
                    </button>
                    <button type="button" className="kn-nav-btn" onClick={() => doiThang(12)} title="Tiến 1 năm">»</button>
                  </div>
                </div>
                <div className="kn-hang-thu">
                  {THU.map(t => <span key={t} className="kn-thu">{t}</span>)}
                </div>
                <div className="kn-luoi-ngay">
                  {lichTrai.map(renderO)}
                </div>
              </div>

              {/* Đường kẻ giữa 2 tháng */}
              <div className="kn-ngan-doc" />

              {/* Cột tháng phải */}
              <div className="kn-cot">
                <div className="kn-dau">
                  <div className="kn-dau-nhom">
                    <button type="button" className="kn-nav-btn" onClick={() => doiThang(-12)} title="Lùi 1 năm">«</button>
                    <button type="button" className="kn-nav-btn" onClick={() => doiThang(-1)} title="Lùi 1 tháng">
                      <Icon n="chevl" className="ic sm" />
                    </button>
                  </div>
                  <span className="kn-dau-ten">Tháng {thangPhai.thang}/{thangPhai.nam}</span>
                  <div className="kn-dau-nhom">
                    <button type="button" className="kn-nav-btn" onClick={() => doiThang(1)} title="Tiến 1 tháng">
                      <Icon n="chevr" className="ic sm" />
                    </button>
                    <button type="button" className="kn-nav-btn" onClick={() => doiThang(12)} title="Tiến 1 năm">»</button>
                  </div>
                </div>
                <div className="kn-hang-thu">
                  {THU.map(t => <span key={t} className="kn-thu">{t}</span>)}
                </div>
                <div className="kn-luoi-ngay">
                  {lichPhai.map(renderO)}
                </div>
              </div>
            </div>
          )}

          {cheDo === 'thang' && (
            <div className="kn-lich">
              {/* 12 tháng năm X */}
              <div className="kn-cot">
                <div className="kn-dau">
                  <div className="kn-dau-nhom">
                    <button type="button" className="kn-nav-btn" onClick={() => doiThang(-12)} title="Lùi 1 năm">«</button>
                  </div>
                  <span className="kn-dau-ten">Năm {thangTrai.nam}</span>
                  <div className="kn-dau-nhom">
                    <button type="button" className="kn-nav-btn" onClick={() => doiThang(12)} title="Tiến 1 năm">»</button>
                  </div>
                </div>
                <div className="kn-luoi-thang">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                    const k = khoangThang(m, thangTrai.nam)
                    const chon = trongKhoang(k.tu, { tu: draftTu, den: draftDen ?? draftTu }) &&
                                 trongKhoang(k.den, { tu: draftTu, den: draftDen ?? draftTu })
                    return (
                      <button
                        key={m}
                        type="button"
                        className={`kn-thang-btn${chon ? ' on' : ''}`}
                        onClick={() => chonThang(m, thangTrai.nam)}
                      >
                        Thg {m}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="kn-ngan-doc" />

              {/* 12 tháng năm X+1 */}
              <div className="kn-cot">
                <div className="kn-dau">
                  <div className="kn-dau-nhom">
                    <button type="button" className="kn-nav-btn" onClick={() => doiThang(-12)} title="Lùi 1 năm">«</button>
                  </div>
                  <span className="kn-dau-ten">Năm {thangTrai.nam + 1}</span>
                  <div className="kn-dau-nhom">
                    <button type="button" className="kn-nav-btn" onClick={() => doiThang(12)} title="Tiến 1 năm">»</button>
                  </div>
                </div>
                <div className="kn-luoi-thang">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                    const k = khoangThang(m, thangTrai.nam + 1)
                    const chon = trongKhoang(k.tu, { tu: draftTu, den: draftDen ?? draftTu }) &&
                                 trongKhoang(k.den, { tu: draftTu, den: draftDen ?? draftTu })
                    return (
                      <button
                        key={m}
                        type="button"
                        className={`kn-thang-btn${chon ? ' on' : ''}`}
                        onClick={() => chonThang(m, thangTrai.nam + 1)}
                      >
                        Thg {m}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {cheDo === 'quy' && (
            <div className="kn-lich">
              {/* 4 quý năm X */}
              <div className="kn-cot">
                <div className="kn-dau">
                  <div className="kn-dau-nhom">
                    <button type="button" className="kn-nav-btn" onClick={() => doiThang(-12)} title="Lùi 1 năm">«</button>
                  </div>
                  <span className="kn-dau-ten">Năm {thangTrai.nam}</span>
                  <div className="kn-dau-nhom">
                    <button type="button" className="kn-nav-btn" onClick={() => doiThang(12)} title="Tiến 1 năm">»</button>
                  </div>
                </div>
                <div className="kn-luoi-quy">
                  {[1, 2, 3, 4].map(q => {
                    const tuQuy = new Date(thangTrai.nam, (q - 1) * 3, 1)
                    const denQuy = new Date(thangTrai.nam, q * 3, 0)
                    const chon = trongKhoang(tuQuy, { tu: draftTu, den: draftDen ?? draftTu }) &&
                                 trongKhoang(denQuy, { tu: draftTu, den: draftDen ?? draftTu })
                    return (
                      <button
                        key={q}
                        type="button"
                        className={`kn-quy-btn${chon ? ' on' : ''}`}
                        onClick={() => chonQuy(q, thangTrai.nam)}
                      >
                        Quý {q}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="kn-ngan-doc" />

              {/* 4 quý năm X+1 */}
              <div className="kn-cot">
                <div className="kn-dau">
                  <div className="kn-dau-nhom">
                    <button type="button" className="kn-nav-btn" onClick={() => doiThang(-12)} title="Lùi 1 năm">«</button>
                  </div>
                  <span className="kn-dau-ten">Năm {thangTrai.nam + 1}</span>
                  <div className="kn-dau-nhom">
                    <button type="button" className="kn-nav-btn" onClick={() => doiThang(12)} title="Tiến 1 năm">»</button>
                  </div>
                </div>
                <div className="kn-luoi-quy">
                  {[1, 2, 3, 4].map(q => {
                    const tuQuy = new Date(thangTrai.nam + 1, (q - 1) * 3, 1)
                    const denQuy = new Date(thangTrai.nam + 1, q * 3, 0)
                    const chon = trongKhoang(tuQuy, { tu: draftTu, den: draftDen ?? draftTu }) &&
                                 trongKhoang(denQuy, { tu: draftTu, den: draftDen ?? draftTu })
                    return (
                      <button
                        key={q}
                        type="button"
                        className={`kn-quy-btn${chon ? ' on' : ''}`}
                        onClick={() => chonQuy(q, thangTrai.nam + 1)}
                      >
                        Quý {q}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Hàng chọn chế độ */}
          <div className="kn-che-do">
            <button
              type="button"
              className={`kn-che-do-btn${cheDo === 'ngay' ? ' on' : ''}`}
              onClick={() => setCheDo('ngay')}
            >
              Chọn ngày
            </button>
            <button
              type="button"
              className={`kn-che-do-btn${cheDo === 'thang' ? ' on' : ''}`}
              onClick={() => setCheDo('thang')}
            >
              Chọn tháng
            </button>
            <button
              type="button"
              className={`kn-che-do-btn${cheDo === 'quy' ? ' on' : ''}`}
              onClick={() => setCheDo('quy')}
            >
              Chọn quý
            </button>
          </div>

          {/* Hàng chọn nhanh và nút Xác nhận */}
          <div className="kn-nhanh">
            <div className="kn-nhanh-ds">
              <button type="button" className="kn-nhanh-btn" onClick={() => chonNhanh('hom-nay')}>Hôm nay</button>
              <button type="button" className="kn-nhanh-btn" onClick={() => chonNhanh('hom-qua')}>Hôm qua</button>
              <button type="button" className="kn-nhanh-btn" onClick={() => chonNhanh('tuan-nay')}>Tuần này</button>
              <button type="button" className="kn-nhanh-btn" onClick={() => chonNhanh('tuan-truoc')}>Tuần trước</button>
              <button type="button" className="kn-nhanh-btn" onClick={() => chonNhanh('thang-nay')}>Tháng này</button>
              <button type="button" className="kn-nhanh-btn" onClick={() => chonNhanh('thang-truoc')}>Tháng trước</button>
            </div>
            <button type="button" className="btn pri sm kn-xac-nhan" onClick={handleXacNhan}>
              Xác nhận
            </button>
          </div>
        </div>
      </Popover>
    </>
  )
}
