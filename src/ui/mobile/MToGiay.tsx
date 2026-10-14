import React, { useLayoutEffect, useMemo, useRef, useState, type FC } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../../modules/types'
import { useSession } from '../../app/session'
import { KHO, kqkd } from '../../data/mock'
import { HANG_XNT, theKho, xnt } from '../../modules/kho/data'
import { Icon } from '../Icon'
import { layKhuonDong, MBaoCaoDong, type LoaiKhuonDong } from './MBaoCaoDong'

const RONG_MAY_TINH = 900

export const MToGiay: FC<ScreenProps> = ({ sc, mod }) => {
  const Comp = sc.comp
  const { s } = useSession()
  const [params] = useSearchParams()

  const [phongTo, setPhongTo] = useState(false)
  const [xemMauIn, setXemMauIn] = useState(false)

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
  }, [phongTo, sc.slug, xemMauIn])

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

  // Màn hình 5.2.1, 5.2.3, 10.2.3: mặc định dạng dòng, có nút "Xem mẫu in"
  if (isApDungDong && khuon) {
    return (
      <div className="m-to-giay-wrap">
        <div className="m-bcd-to-dau">
          <button
            type="button"
            className="m-bcd-nut-mau-in"
            onClick={() => setXemMauIn(p => !p)}
          >
            <Icon n={xemMauIn ? 'list' : 'printer'} className="ic sm" />
            <span>{xemMauIn ? 'Xem dạng dòng' : 'Xem mẫu in'}</span>
          </button>
        </div>

        {xemMauIn ? (
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
