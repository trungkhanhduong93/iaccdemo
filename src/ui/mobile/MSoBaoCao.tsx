import React, { useMemo, useRef, useState, type FC } from 'react'
import { useLocation } from 'react-router-dom'
import type { Col, ReportCfg, Row, ScreenProps } from '../../modules/types'
import { KY_CHON, renderReport, gopSo, RptTable } from '../generic/ReportScreen'
import { datKyNhap, useTrangThaiLoc, xemBaoCao } from '../bao-cao/tuyChinhBC'
import { chiNhanhHienTai, dsChiNhanh, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { CHI_NHANH } from '../../data/mock'
import { soQuyCn } from '../../modules/tien/SoQuy'
import { dsTkTheoCheDo } from '../../modules/tong-hop/so-cai'
import { tenQuyTm } from '../../modules/bao-cao/danh-sach'
import { fold } from '../format'
import { Icon } from '../Icon'
import { MChon } from './MChon'

export const MSoBaoCao: FC<ScreenProps> = ({ sc }) => {
  const { s, set } = useSession()
  const path = useLocation().pathname
  const isSoQuy = sc.code === '2.2.1' || sc.slug === '2-2-1'
  const cfg: ReportCfg = sc.report ?? (isSoQuy ? { kieu: 'so', theoCn: true } : { kieu: 'tonghop', doiTuong: 'tk' })

  // Trạng thái lọc dùng chung với bản máy tính
  const { loc, daXem } = useTrangThaiLoc(path)
  const kyDaXem = daXem?.ky || '9'
  const thang = Number(kyDaXem)
  const cn = cfg.theoCn ? chiNhanhHienTai(s) : undefined
  const chonQuy = loc.locQuy?.[0]

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

  // Tính số liệu sổ quỹ nếu là màn 2.2.1
  const dsCnSoQuy = useMemo(() => {
    return CHI_NHANH.filter(c => (!cn || c.id === cn.id) && (!chonQuy || tenQuyTm(c.ngan) === chonQuy))
  }, [cn, chonQuy])

  const soQuyData = useMemo(() => {
    if (!isSoQuy) return null
    const g = dsCnSoQuy.length === 1
      ? soQuyCn(dsCnSoQuy[0].id, thang)
      : gopSo(dsCnSoQuy.map(c => ({ cn: c.ngan, ...soQuyCn(c.id, thang) })))
    return {
      ...g,
      rows: g.rows.map(x => ({
        ...x,
        locQuy: chonQuy,
        ...(x.tk ? { tk: dsTkTheoCheDo(String(x.tk), s.cheDo) } : {}),
      })),
    }
  }, [isSoQuy, dsCnSoQuy, chonQuy, thang, s.cheDo])

  const noco = kieuGhiSo(s.cheDo) === 'noco'

  // Tạo phần thân báo cáo: sổ quỹ dựng trực tiếp từ dữ liệu, các màn khác từ renderReport
  const body = useMemo(() => {
    if (isSoQuy && soQuyData) {
      const cols: Col[] = [
        { k: 'ngay', t: 'Ngày chứng từ', w: 100 },
        { k: 'thu', t: 'Số phiếu thu', cls: 'code' },
        { k: 'chi', t: 'Số phiếu chi', cls: 'code' },
        ...(dsCnSoQuy.length > 1 ? [{ k: 'cn', t: 'Chi nhánh' } as Col] : []),
        { k: 'dg', t: 'Diễn giải' },
        ...(noco ? [{ k: 'tk', t: 'TK đối ứng', c: true } as Col] : []),
        { k: 'no', t: 'Thu', num: true },
        { k: 'co', t: 'Chi', num: true },
        { k: 'du', t: 'Tồn', num: true },
      ]
      const rows: Row[] = [
        { dg: 'Số tồn đầu kỳ', du: soQuyData.mo, _b: 1 },
        ...soQuyData.rows,
        { dg: 'Cộng phát sinh trong kỳ', no: soQuyData.tn, co: soQuyData.tc, _t: 1 },
        { dg: 'Số tồn cuối kỳ', du: soQuyData.cuoi, _t: 1 },
      ]
      return <RptTable cols={cols} rows={rows} />
    }
    return renderReport(cfg, sc.code ?? sc.slug, thang, s.cheDo, cn?.id, loc, s)
  }, [isSoQuy, soQuyData, dsCnSoQuy.length, noco, cfg, sc.code, sc.slug, thang, s, cn?.id, loc])

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
