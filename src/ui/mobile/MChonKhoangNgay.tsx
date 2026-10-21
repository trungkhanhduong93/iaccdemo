// Điện thoại: chọn khoảng ngày trong hộp lịch giữa màn, có kỳ chọn nhanh, cột số tuần, chọn hai mốc trên lịch (T571)
import { useState, type FC, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { HOM_NAY } from '../../data/mock'
import { dmy, khoangThang, type KhoangNgay } from '../ChonNgay'
import { Icon } from '../Icon'

const THU = ['TH 2', 'TH 3', 'TH 4', 'TH 5', 'TH 6', 'TH 7', 'CN']

const ngay0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const cong = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
/** Thứ Hai của tuần chứa ngày d */
const dauTuan = (d: Date) => cong(ngay0(d), -((d.getDay() + 6) % 7))
/** Số tuần ISO 8601: tuần chứa thứ Năm thuộc năm nào thì tính cho năm đó */
function soTuan(d: Date) {
  const thu5 = cong(dauTuan(d), 3)
  const dau = new Date(thu5.getFullYear(), 0, 1)
  return Math.floor((thu5.getTime() - dau.getTime()) / 864e5 / 7) + 1
}

const KY_NHANH: { ten: string; kn: () => KhoangNgay }[] = [
  { ten: 'Tháng trước', kn: () => khoangThang(HOM_NAY.getMonth(), HOM_NAY.getFullYear()) },
  { ten: 'Tháng này', kn: () => khoangThang(HOM_NAY.getMonth() + 1, HOM_NAY.getFullYear()) },
  { ten: 'Tuần trước', kn: () => { const t = cong(dauTuan(HOM_NAY), -7); return { tu: t, den: cong(t, 6) } } },
  { ten: 'Tuần này', kn: () => { const t = dauTuan(HOM_NAY); return { tu: t, den: cong(t, 6) } } },
]

/** Nút ghi khoảng ngày; bấm mở hộp lịch. Bấm ngày thứ nhất là mốc đầu, ngày thứ hai là mốc cuối.
 *  nut: thay nút mặc định, vd dòng Thời gian trong tấm Bộ lọc */
export const MChonKhoangNgay: FC<{ value: KhoangNgay; onChange: (k: KhoangNgay) => void; nut?: (mo: () => void) => ReactNode }> = ({ value, onChange, nut }) => {
  const [mo, setMo] = useState(false)
  const [tu, setTu] = useState<Date>(value.tu)
  const [den, setDen] = useState<Date | null>(value.den)
  const [xem, setXem] = useState(() => new Date(value.tu.getFullYear(), value.tu.getMonth(), 1))

  const moHop = () => {
    setTu(ngay0(value.tu)); setDen(ngay0(value.den))
    setXem(new Date(value.tu.getFullYear(), value.tu.getMonth(), 1))
    setMo(true)
  }
  const chonNgay = (d: Date) => {
    if (den || d < tu) { setTu(d); setDen(null) }   // đã đủ hai mốc, hoặc bấm ngày trước mốc đầu: chọn lại từ đầu
    else setDen(d)
  }
  const chonKy = (kn: KhoangNgay) => {
    setTu(kn.tu); setDen(kn.den)
    setXem(new Date(kn.tu.getFullYear(), kn.tu.getMonth(), 1))
  }
  const apDung = () => { onChange({ tu, den: den ?? tu }); setMo(false) }

  // Lưới các tuần của tháng đang xem, mỗi tuần 7 ô, ô ngoài tháng để trống
  const tuan: { so: number; ngay: (Date | null)[] }[] = []
  const cuoiThang = new Date(xem.getFullYear(), xem.getMonth() + 1, 0)
  for (let t = dauTuan(xem); t <= cuoiThang; t = cong(t, 7)) {
    tuan.push({ so: soTuan(t), ngay: Array.from({ length: 7 }, (_, i) => { const d = cong(t, i); return d.getMonth() === xem.getMonth() ? d : null }) })
  }
  const cuoi = den ?? tu
  const kyDangChon = KY_NHANH.find(k => { const kn = k.kn(); return den && +kn.tu === +tu && +kn.den === +den })?.ten

  return (
    <>
      {nut ? nut(moHop) : (
        <button type="button" className="m-pos-chip m-kn-nut" onClick={moHop}>
          <Icon n="calendar" className="ic sm" />
          <span>{dmy(value.tu)} - {dmy(value.den)}</span>
        </button>
      )}

      {/* portal ra body: nằm trong hàng chip cuộn ngang thì iOS cắt lớp fixed theo hàng, chỉ thấy dải nền tối */}
      {mo && createPortal(
        <div className="m-kn-nen" onClick={() => setMo(false)}>
          <div className="m-kn-hop" role="dialog" aria-label="Chọn khoảng ngày" onClick={e => e.stopPropagation()}>
            <div className="m-kn-ky">
              {KY_NHANH.map(k => (
                <button key={k.ten} type="button" className={kyDangChon === k.ten ? 'on' : ''} onClick={() => chonKy(k.kn())}>{k.ten}</button>
              ))}
            </div>

            <div className="m-kn-thang">
              <b>Tháng {xem.getMonth() + 1} {xem.getFullYear()}</b>
              <button type="button" aria-label="Tháng trước" onClick={() => setXem(new Date(xem.getFullYear(), xem.getMonth() - 1, 1))}>
                <Icon n="chevl" className="ic sm" />
              </button>
              <button type="button" aria-label="Tháng sau" onClick={() => setXem(new Date(xem.getFullYear(), xem.getMonth() + 1, 1))}>
                <Icon n="chevr" className="ic sm" />
              </button>
            </div>

            <div className="m-kn-luoi">
              <span className="m-kn-so-tuan m-kn-dau-tuan" />
              {THU.map(t => <span key={t} className="m-kn-thu">{t}</span>)}
              {tuan.map(w => [
                <span key={`t${w.so}`} className="m-kn-so-tuan">{w.so}</span>,
                ...w.ngay.map((d, i) => {
                  if (!d) return <span key={`${w.so}-${i}`} />
                  const dau = +d === +tu, chot = +d === +cuoi
                  const giua = d > tu && d < cuoi
                  return (
                    <button key={`${w.so}-${i}`} type="button"
                      className={['m-kn-ngay', giua ? 'giua' : '', dau ? 'dau' : '', chot ? 'cuoi' : ''].filter(Boolean).join(' ')}
                      onClick={() => chonNgay(d)}>
                      <span>{d.getDate()}</span>
                    </button>
                  )
                }),
              ])}
            </div>

            <div className="m-kn-chan">
              {/* Cùng năm thì ngày đầu bỏ năm cho vừa chân hộp */}
              <span className="m-kn-tom">{den && den.getFullYear() === tu.getFullYear() ? dmy(tu).slice(0, 5) : dmy(tu)} - {den ? dmy(den) : '...'}</span>
              <button type="button" onClick={() => setMo(false)}>Huỷ</button>
              <button type="button" className="chinh" onClick={apDung}>Áp dụng</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
