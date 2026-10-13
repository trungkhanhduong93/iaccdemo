import React, { useLayoutEffect, useMemo, useRef, useState, type FC } from 'react'
import { useLocation } from 'react-router-dom'
import type { Col, ReportCfg, Row, ScreenProps } from '../../modules/types'
import { KY_CHON, renderReport } from '../generic/ReportScreen'
import { datKyNhap, useTrangThaiLoc, xemBaoCao } from '../bao-cao/tuyChinhBC'
import { chiNhanhHienTai, dsChiNhanh, useSession } from '../../app/session'
import { CHI_NHANH } from '../../data/mock'
import { fold } from '../format'
import { Icon } from '../Icon'
import { MChon } from './MChon'

export const MSoBaoCao: FC<ScreenProps> = ({ sc }) => {
  const { s, set } = useSession()
  const path = useLocation().pathname
  const cfg: ReportCfg = sc.report ?? { kieu: 'tonghop', doiTuong: 'tk' }

  // Trạng thái lọc dùng chung với bản máy tính
  const { loc, daXem } = useTrangThaiLoc(path)
  const kyDaXem = daXem?.ky || '9'
  const thang = Number(kyDaXem)
  const cn = cfg.theoCn ? chiNhanhHienTai(s) : undefined

  const [moChonKy, setMoChonKy] = useState(false)
  const [moChonCn, setMoChonCn] = useState(false)
  const [q, setQ] = useState('')

  const bangWrapRef = useRef<HTMLDivElement>(null)

  // Nhãn hiển thị kỳ
  const tenKy = useMemo(() => {
    const item = KY_CHON.find(x => x[0] === kyDaXem)
    if (item) return item[1].replace(' (đến 07/10)', '')
    return `Tháng ${kyDaXem}/2026`
  }, [kyDaXem])

  // Nhãn hiển thị chi nhánh
  const tenCn = cn ? (cn.ngan ?? cn.ten) : 'Tất cả'

  // Tạo phần thân báo cáo từ renderReport của bản máy tính, KHÔNG bọc ReportPaper
  const body = useMemo(() => {
    return renderReport(cfg, sc.code ?? sc.slug, thang, s.cheDo, cn?.id, loc, s)
  }, [cfg, sc.code, sc.slug, thang, s, cn?.id, loc])

  // Lọc dòng nếu có từ khóa tìm kiếm (chỉ làm trên tầng view, không đổi logic bản máy tính)
  const noiDungBang = useMemo(() => {
    const tuKhoa = q.trim()
    if (!tuKhoa || !React.isValidElement(body)) return body
    const bodyProps = body.props as { rows?: Row[]; cols?: Col[] }
    if (!bodyProps || !Array.isArray(bodyProps.rows)) return body

    const qFold = fold(tuKhoa)
    const rowsLoc = bodyProps.rows.filter(r => {
      if (r._t) return true // Giữ dòng tổng cộng
      const text = Object.values(r)
        .map(v => (v && typeof v === 'object' ? '' : String(v ?? '')))
        .join(' ')
      return fold(text).includes(qFold)
    })
    return React.cloneElement(body as React.ReactElement<{ rows?: Row[] }>, { rows: rowsLoc })
  }, [body, q])

  // Đo chiều rộng cột đầu tiên để ghim cột thứ hai ngay sau cột thứ nhất
  useLayoutEffect(() => {
    if (!bangWrapRef.current) return
    const th1 = bangWrapRef.current.querySelector('table.rpt thead th:first-child') as HTMLElement | null
    if (th1) {
      const w = th1.offsetWidth
      bangWrapRef.current.style.setProperty('--m-cot1-w', `${w}px`)
    }
  }, [noiDungBang])

  const dsChonKy = useMemo(() => {
    return KY_CHON.map(([k, ten]) => ({ k, ten }))
  }, [])

  const dsChonCn = useMemo(() => {
    const ds = dsChiNhanh(s)
    const list = ds.length ? ds : CHI_NHANH
    return [
      { k: 'all', ten: 'Tất cả chi nhánh' },
      ...list.map(c => ({ k: c.id, ten: c.ten })),
    ]
  }, [s])

  return (
    <div className="m-so-bc">
      {/* Hàng chip lọc theo ảnh 12: chip kỳ, chip chi nhánh */}
      <div className="m-sbc-loc-hang">
        <button
          type="button"
          className="m-sbc-chip"
          onClick={() => setMoChonKy(true)}
          title="Chọn kỳ báo cáo"
        >
          <span className="m-sbc-chip-nhan">Thời gian: {tenKy}</span>
          <Icon n="chevd" className="ic sm" />
        </button>

        {cfg.theoCn && (
          <button
            type="button"
            className="m-sbc-chip"
            onClick={() => setMoChonCn(true)}
            title="Chọn chi nhánh"
          >
            <span className="m-sbc-chip-nhan">Kho/CN: {tenCn}</span>
            <Icon n="chevd" className="ic sm" />
          </button>
        )}
      </div>

      {/* Ô tìm kiếm dòng: "Nhập mã, tên" */}
      <div className="m-sbc-tim-hang">
        <div className="m-ds-tim">
          <Icon n="search" className="m-ds-tim-ic ic sm" />
          <input
            type="text"
            className="m-ds-tim-inp"
            placeholder="Nhập mã, tên"
            value={q}
            onChange={e => setQ(e.target.value)}
            aria-label="Tìm kiếm trong bảng"
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

      {/* Khung bảng cuộn ngang, trang không cuộn ngang */}
      <div ref={bangWrapRef} className="m-sbc-bang-wrap">
        {noiDungBang}
      </div>

      {/* Sheet chọn kỳ */}
      <MChon
        mo={moChonKy}
        onDong={() => setMoChonKy(false)}
        tieuDe="Chọn kỳ báo cáo"
        ds={dsChonKy}
        chon={kyDaXem}
        onChon={k => {
          datKyNhap(path, k)
          xemBaoCao(path)
        }}
      />

      {/* Sheet chọn chi nhánh */}
      {cfg.theoCn && (
        <MChon
          mo={moChonCn}
          onDong={() => setMoChonCn(false)}
          tieuDe="Chọn chi nhánh"
          ds={dsChonCn}
          chon={s.chiNhanh || 'all'}
          onChon={k => set({ chiNhanh: k })}
        />
      )}
    </div>
  )
}
