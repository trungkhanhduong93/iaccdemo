import React, { useEffect, useLayoutEffect, useMemo, useRef, useState, type FC } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../../modules/types'
import { useSession } from '../../app/session'
import { KHO, kqkd } from '../../data/mock'
import { HANG_XNT, theKho, xnt } from '../../modules/kho/data'
import { Icon } from '../Icon'
import { RptTable } from '../generic/ReportScreen'
import { layKhuonDong, MBaoCaoDong, type LoaiKhuonDong } from './MBaoCaoDong'
import { cotMobile, useBangMauA } from './bangMauA'
import { tinhPhanTrang, ThanhPhanTrangM } from './phanTrangM'

const RONG_MAY_TINH = 900

const COLS_523: Col[] = [
  { k: 'ma', t: 'Mã', cls: 'code' },
  { k: 'ten', t: 'Tên nguyên vật liệu, hàng hoá' },
  { k: 'dvt', t: 'ĐVT', c: true },
  { k: 'sl0', t: 'SL', num: true, nhom: 'Đầu kỳ' },
  { k: 'gt0', t: 'Giá trị', num: true, nhom: 'Đầu kỳ' },
  { k: 'sln', t: 'SL', num: true, nhom: 'Nhập trong kỳ' },
  { k: 'gtn', t: 'Giá trị', num: true, nhom: 'Nhập trong kỳ' },
  { k: 'slx', t: 'SL', num: true, nhom: 'Xuất trong kỳ' },
  { k: 'gtx', t: 'Giá trị', num: true, nhom: 'Xuất trong kỳ' },
  { k: 'sl1', t: 'SL', num: true, nhom: 'Cuối kỳ' },
  { k: 'gt1', t: 'Giá trị', num: true, nhom: 'Cuối kỳ' },
]

const COLS_1023: Col[] = [
  { k: 'ct', t: 'Chỉ tiêu' },
  { k: 'v', t: 'Số tiền', num: true },
]

export const MToGiay: FC<ScreenProps> = ({ sc, mod }) => {
  const Comp = sc.comp
  const { s } = useSession()
  const [params] = useSearchParams()

  const [phongTo, setPhongTo] = useState(false)
  const [kieuXem, setKieuXem] = useState<'dong' | 'bang' | 'in'>('dong')
  const [trangBang, setTrangBang] = useState(1)
  const bangWrapRef = useRef<HTMLDivElement>(null)

  // Về trang 1 khi đổi tham số hoặc kiểu xem (T273)
  useEffect(() => {
    setTrangBang(1)
  }, [params, sc.slug, kieuXem])

  const khungRef = useRef<HTMLDivElement>(null)
  const noiDungRef = useRef<HTMLDivElement>(null)
  const [heSo, setHeSo] = useState(1)
  const [rongThuc, setRongThuc] = useState(RONG_MAY_TINH)
  const [chieuCaoScale, setChieuCaoScale] = useState<number | undefined>(undefined)

  const code = (sc.code || '').replace(/-/g, '.')
  const slug = (sc.slug || '').replace(/-/g, '.')
  const is521 = code === '5.2.1' || slug === '5.2.1'
  const is523 = code === '5.2.3' || slug === '5.2.3'
  const is1023 = code === '10.2.3' || slug === '10.2.3'
  // 10.2.3 ở gói PR đang khoá chờ mẫu TT99, giữ nguyên; chỉ áp dụng dạng dòng ở gói F (T241)
  const isDong1023 = is1023 && s.goi === 'F'
  const isApDungDong = is521 || is523 || isDong1023

  const khuon: LoaiKhuonDong | undefined = useMemo(() => {
    if (is521) return 'chi-tiet-ngay'
    if (is523) return 'tong-hop-doi-tuong'
    if (isDong1023) return 'chi-tieu-phan-cap'
    return layKhuonDong(sc)
  }, [is521, is523, isDong1023, sc])

  // Dữ liệu dạng dòng cho 3 màn đặc biệt
  const { rowsDong, colsDong } = useMemo(() => {
    if (!isApDungDong) return { rowsDong: [] as Row[], colsDong: [] as Col[] }

    const kyStr = params.get('ky') || '9'
    const kyNum = Number(kyStr) || 9
    const khoStr = params.get('kho') || KHO[1]

    if (is521) {
      const maStr = params.get('ma') || HANG_XNT[0].ma
      const the = theKho(kyNum, khoStr, maStr)
      return { rowsDong: the.rows, colsDong: the.cols }
    }

    if (is523) {
      const rawXnt = xnt(kyNum, khoStr)
      const sumGt0 = rawXnt.reduce((a, x) => a + (Number(x.gt0) || 0), 0)
      const sumGtn = rawXnt.reduce((a, x) => a + (Number(x.gtn) || 0), 0)
      const sumGtx = rawXnt.reduce((a, x) => a + (Number(x.gtx) || 0), 0)
      const sumGt1 = rawXnt.reduce((a, x) => a + (Number(x.gt1) || 0), 0)
      const rows: Row[] = [
        ...rawXnt,
        { ten: 'Tổng cộng', gt0: sumGt0, gtn: sumGtn, gtx: sumGtx, gt1: sumGt1, _t: 1 },
      ]
      return { rowsDong: rows, colsDong: [] }
    }

    if (isDong1023) {
      const q = kqkd(kyNum, 2026)
      const pb = q.cp.ccdc + q.cp.khauHao
      const cpThang = q.cpQlkd + q.cpTc - q.dtTc - pb
      const rows: Row[] = [
        { ct: 'Doanh thu bán hàng', v: q.dtThuan, _b: 1, _drill: '/app/ban-hang/3-2-5' },
        { ct: 'Chi phí NVL', v: q.gv, _drill: '/app/kho/5-2-3' },
        { ct: 'Lãi gộp', v: q.lnGop, _b: 1 },
        { ct: 'Chi phí trong tháng', v: cpThang },
        { ct: 'Chi phí phân bổ hàng tháng', v: pb },
        { ct: 'Lợi nhuận trước thuế', v: q.lnGop - cpThang - pb, _t: 1 },
      ]
      return { rowsDong: rows, colsDong: [] }
    }

    return { rowsDong: [], colsDong: [] }
  }, [isApDungDong, is521, is523, isDong1023, params])

  useLayoutEffect(() => {
    if (phongTo) {
      setHeSo(1)
      setChieuCaoScale(undefined)
      return
    }

    const tinhToan = () => {
      if (!khungRef.current || !noiDungRef.current) return
      const rongKhung = khungRef.current.clientWidth
      if (rongKhung > 0) {
        let w = RONG_MAY_TINH
        const tables = noiDungRef.current.querySelectorAll('table')
        tables.forEach(t => {
          const offPhai = (t as HTMLElement).offsetLeft + (t as HTMLElement).offsetWidth
          if (offPhai > w) w = offPhai
          if (t.scrollWidth > w) w = t.scrollWidth
        })
        const scale = Math.max(0.1, (rongKhung - 4) / w)
        setRongThuc(w)
        setHeSo(scale)
        const cao = noiDungRef.current.offsetHeight || noiDungRef.current.scrollHeight
        setChieuCaoScale(Math.ceil(cao * scale))
      } else {
        setHeSo(1)
        setChieuCaoScale(undefined)
      }
    }

    tinhToan()
    const timer = setTimeout(tinhToan, 150)
    window.addEventListener('resize', tinhToan)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', tinhToan)
    }
  }, [phongTo, sc.slug, kieuXem])

  const colsBang = useMemo(() => {
    const raw: Col[] = is523 ? COLS_523 : isDong1023 ? COLS_1023 : (colsDong.length ? colsDong : COLS_523)
    return cotMobile(raw)
  }, [is523, isDong1023, colsDong])

  // Phân trang 100 dòng cho bảng (T273)
  const pt = useMemo(() => {
    return tinhPhanTrang(rowsDong, trangBang, 100)
  }, [rowsDong, trangBang])

  const doiTrangBang = (trangMoi: number) => {
    setTrangBang(trangMoi)
    if (bangWrapRef.current) {
      bangWrapRef.current.scrollTop = 0
    }
  }

  const coCuonNgang = useBangMauA(bangWrapRef, [kieuXem, pt.rowsHienThi])

  if (!Comp) return null

  const onChamGiay = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.target as HTMLElement
    // Bỏ qua tương tác với các công cụ chọn kỳ, bộ lọc, form điều khiển
    if (
      el.closest(
        'button, input, select, textarea, a, .pop, .dropdown, .thanh-loc, .bc-thanh-cong-cu, .kn-pop, .bc-loc-pop'
      )
    ) {
      return
    }
    setPhongTo(p => !p)
  }

  // Màn hình 5.2.1, 5.2.3, 10.2.3: mặc định dạng dòng, có chip Bảng và nút "Xem mẫu in"
  if (isApDungDong && khuon) {
    return (
      <div className="m-to-giay-wrap">
        <div className="m-sbc-loc-hang">
          <div className="m-so-dong-kieu-wrap">
            <button
              type="button"
              className={`m-so-dong-chip ${kieuXem === 'dong' ? 'm-so-dong-chip-on' : ''}`}
              onClick={() => setKieuXem('dong')}
            >
              Dạng dòng
            </button>
            <button
              type="button"
              className={`m-so-dong-chip ${kieuXem === 'bang' ? 'm-so-dong-chip-on' : ''}`}
              onClick={() => setKieuXem('bang')}
            >
              Bảng
            </button>
          </div>
          <button
            type="button"
            className="m-bcd-nut-mau-in"
            onClick={() => setKieuXem(k => (k === 'in' ? 'dong' : 'in'))}
            style={{ marginLeft: 'auto' }}
          >
            <Icon n={kieuXem === 'in' ? 'list' : 'printer'} className="ic sm" />
            <span>{kieuXem === 'in' ? 'Xem dạng dòng' : 'Xem mẫu in'}</span>
          </button>
        </div>

        {kieuXem === 'in' ? (
          <div
            ref={khungRef}
            className={`m-to-giay ${phongTo ? 'phong-to' : 'thu-nho'}`}
            onClick={onChamGiay}
            style={!phongTo && chieuCaoScale ? { height: chieuCaoScale } : undefined}
          >
            <div
              ref={noiDungRef}
              className="m-to-giay-noi-dung"
              style={
                !phongTo
                  ? {
                      width: rongThuc,
                      minWidth: rongThuc,
                      transform: `scale(${heSo})`,
                      transformOrigin: 'top left',
                    }
                  : {
                      width: rongThuc,
                      minWidth: rongThuc,
                    }
              }
            >
              <Comp sc={sc} mod={mod} />
            </div>
          </div>
        ) : kieuXem === 'bang' ? (
          <div className="m-sbc-the-bang">
            <div ref={bangWrapRef} className={`m-sbc-bang-wrap ${coCuonNgang || pt.canPhanTrang ? 'co-goi' : ''}`}>
              <RptTable cols={colsBang} rows={pt.rowsHienThi} />
            </div>
            {coCuonNgang && (
              <div className="m-sbc-goi">
                <span>Vuốt ngang xem thêm cột</span>
              </div>
            )}
            {pt.canPhanTrang && (
              <ThanhPhanTrangM
                trang={pt.trangHt}
                soTrang={pt.soTrang}
                batDau={pt.batDau}
                ketThuc={pt.ketThuc}
                tongDong={pt.tongDong}
                onDoiTrang={doiTrangBang}
              />
            )}
          </div>
        ) : (
          <div className="m-so-dong" style={{ padding: '0 0 40px 0' }}>
            <MBaoCaoDong
              maBc={sc.code ?? sc.slug}
              khuon={khuon}
              cols={colsDong}
              rows={rowsDong}
            />
          </div>
        )}
      </div>
    )
  }

  // Màn MToGiay khác giữ nguyên
  return (
    <div
      ref={khungRef}
      className={`m-to-giay ${phongTo ? 'phong-to' : 'thu-nho'}`}
      onClick={onChamGiay}
      style={!phongTo && chieuCaoScale ? { height: chieuCaoScale } : undefined}
    >
      <div
        ref={noiDungRef}
        className="m-to-giay-noi-dung"
        style={
          !phongTo
            ? {
                width: rongThuc,
                minWidth: rongThuc,
                transform: `scale(${heSo})`,
                transformOrigin: 'top left',
              }
            : {
                width: rongThuc,
                minWidth: rongThuc,
              }
        }
      >
        <Comp sc={sc} mod={mod} />
      </div>
    </div>
  )
}
