import React, { useMemo, useRef, useState, type FC } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { Col, ReportCfg, Row, ScreenProps } from '../../modules/types'
import { KY_CHON, renderReport, gopSo, RptTable } from '../generic/ReportScreen'
import { datKyNhap, useTrangThaiLoc, xemBaoCao } from '../bao-cao/tuyChinhBC'
import { chiNhanhHienTai, dsChiNhanh, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { CHI_NHANH } from '../../data/mock'
import { soQuyCn } from '../../modules/tien/SoQuy'
import { dsTkTheoCheDo } from '../../modules/tong-hop/so-cai'
import { tenQuyTm } from '../../modules/bao-cao/danh-sach'
import { fold, money, rutGonSo } from '../format'
import { Icon } from '../Icon'
import { MChon } from './MChon'
import { duongPhieu } from '../generic/SoChungTu'

/** Dò đường dẫn mở chứng từ gốc nếu có (T201, T223) */
function layDuongDan(so: unknown): string | undefined {
  if (!so || typeof so !== 'string') return undefined
  let to = duongPhieu(so)
  if (!to) {
    const m = /^([A-Z]+)(\d{2})-(\d+)$/.exec(so)
    if (m) {
      to = duongPhieu(`${m[1]}26${m[2]}-${m[3].padStart(4, '0')}`)
    }
  }
  return to
}

export const MSoBaoCao: FC<ScreenProps> = ({ sc }) => {
  const { s, set } = useSession()
  const path = useLocation().pathname

  // Sổ xem dạng dòng: Sổ quỹ 2.2.1, Sổ ngân hàng 2.2.3, Sổ công nợ 2.2.5.
  // 3.2.9, 4.2.3 là bảng tổng hợp theo đối tượng, không có dòng theo ngày nên giữ kiểu bảng
  const isSoQuy = sc.code === '2.2.1' || sc.slug === '2-2-1'
  const isSoTienGui = sc.code === '2.2.3' || sc.slug === '2-2-3'
  const isSoCongNo = sc.code === '2.2.5' || sc.slug === '2-2-5'
  const isSoApDung = isSoQuy || isSoTienGui || isSoCongNo

  const [kieuXem, setKieuXem] = useState<'dong' | 'bang'>(() => (isSoApDung ? 'dong' : 'bang'))

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

  // Lấy danh sách hàng gốc từ body
  const { rawRows } = useMemo(() => {
    if (!React.isValidElement(body)) return { rawRows: [] as Row[] }
    const p = body.props as { rows?: Row[] }
    return {
      rawRows: Array.isArray(p?.rows) ? p.rows : [],
    }
  }, [body])

  // Lọc dòng nếu có từ khóa tìm kiếm (chỉ làm trên tầng view, không đổi logic bản máy tính)
  const rowsLoc = useMemo(() => {
    const tuKhoa = q.trim()
    if (!tuKhoa) return rawRows
    const qFold = fold(tuKhoa)
    return rawRows.filter(r => {
      if (r._t) return true // Giữ dòng tổng cộng
      const text = Object.values(r)
        .map(v => (v && typeof v === 'object' ? '' : String(v ?? '')))
        .join(' ')
      return fold(text).includes(qFold)
    })
  }, [rawRows, q])

  const noiDungBang = useMemo(() => {
    if (!React.isValidElement(body)) return body
    return React.cloneElement(body as React.ReactElement<{ rows?: Row[] }>, { rows: rowsLoc })
  }, [body, rowsLoc])

  // Số liệu thẻ tổng 3 ô: lấy đúng từ dòng đầu kỳ, cộng phát sinh, cuối kỳ của bảng
  const { soDau, tongThu, tongChi, soCuoi } = useMemo(() => {
    const rDau = rawRows.find(r => r._b === 1 || String(r.dg || r.dienGiai || '').toLowerCase().includes('đầu kỳ'))
    const rCong = rawRows.find(
      r =>
        r._t === 1 &&
        (String(r.dg || r.dienGiai || '').toLowerCase().includes('cộng') ||
          String(r.dg || r.dienGiai || '').toLowerCase().includes('phát sinh'))
    )
    const rCuoi = rawRows.find(r => r._t === 1 && String(r.dg || r.dienGiai || '').toLowerCase().includes('cuối kỳ'))
    const rTong = rawRows.find(r => r._t === 1)

    const sd = Number(rDau?.du ?? rDau?.dau ?? rDau?.ptCon ?? rTong?.dau ?? 0)
    const st = Number(rCong?.no ?? rCong?.ps ?? rCong?.ptPhai ?? rTong?.ps ?? 0)
    const sc = Number(rCong?.co ?? rCong?.chi ?? rCong?.tt ?? rCong?.tra ?? rTong?.tra ?? rTong?.tt ?? 0)
    const scuoi = Number(rCuoi?.du ?? rCuoi?.cuoi ?? rTong?.cuoi ?? 0)

    return { soDau: sd, tongThu: st, tongChi: sc, soCuoi: scuoi }
  }, [rawRows])

  // Nhóm theo ngày cho dạng dòng: gom các dòng phát sinh trong kỳ
  const dsNhomNgay = useMemo(() => {
    const tuKhoa = q.trim()
    const qFold = tuKhoa ? fold(tuKhoa) : ''

    const phatSinh = rawRows.filter(r => {
      if (r._b || r._t) return false
      if (!qFold) return true
      const text = Object.values(r)
        .map(v => (v && typeof v === 'object' ? '' : String(v ?? '')))
        .join(' ')
      return fold(text).includes(qFold)
    })

    const map = new Map<string, { ngay: string; tonCuoiNgay: number; ds: Row[] }>()
    for (const r of phatSinh) {
      const ngay = String(r.ngay ?? '') || 'Chưa rõ ngày'
      const ton = Number(r.du ?? r.cuoi ?? r.no ?? 0)
      const nhom = map.get(ngay)
      if (nhom) {
        nhom.ds.push(r)
        nhom.tonCuoiNgay = ton
      } else {
        map.set(ngay, { ngay, tonCuoiNgay: ton, ds: [r] })
      }
    }
    return Array.from(map.values())
  }, [rawRows, q])

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

  const nhanDau = isSoCongNo ? 'Tồn đầu' : 'Tồn đầu'
  const nhanGiua = isSoCongNo ? 'Phát sinh Nợ / Có' : 'Thu / Chi'
  const nhanCuoi = isSoCongNo ? 'Dư cuối' : 'Tồn cuối'
  const xemTatCaCn = !cn || s.chiNhanh === 'all' || s.chiNhanh === ''

  return (
    <div className="m-so-bc">
      {/* Hàng chip lọc theo ảnh 12: chip kỳ, chip chi nhánh, chip chuyển kiểu xem */}
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

        {isSoApDung && (
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

      {/* Nội dung báo cáo: Dạng dòng hoặc Bảng cuộn ngang */}
      {kieuXem === 'dong' && isSoApDung ? (
        <div className="m-so-dong">
          {/* Thẻ tổng ở đầu: 3 ô */}
          <div className="m-so-dong-tong">
            <div className="m-so-dong-tong-o">
              <span className="m-so-dong-tong-nhan">{nhanDau}</span>
              <b className="m-so-dong-tong-so m-so-dong-num">{rutGonSo(soDau)}</b>
            </div>
            <div className="m-so-dong-tong-o">
              <span className="m-so-dong-tong-nhan">{nhanGiua}</span>
              <b className="m-so-dong-tong-so m-so-dong-num">
                <span className="m-so-dong-duong">+{rutGonSo(tongThu)}</span>{' '}
                <span className="m-so-dong-am">−{rutGonSo(tongChi)}</span>
              </b>
            </div>
            <div className="m-so-dong-tong-o">
              <span className="m-so-dong-tong-nhan">{nhanCuoi}</span>
              <b className="m-so-dong-tong-so m-so-dong-num">{rutGonSo(soCuoi)}</b>
            </div>
          </div>

          {/* Danh sách nhóm theo ngày */}
          {dsNhomNgay.length === 0 ? (
            <div className="m-so-dong-trong">
              {q.trim() ? 'Không tìm thấy dòng phát sinh phù hợp' : 'Không có phát sinh trong kỳ'}
            </div>
          ) : (
            dsNhomNgay.map(nhom => (
              <div key={nhom.ngay}>
                <div className="m-so-dong-ngay">
                  <span className="m-so-dong-ngay-chu">{nhom.ngay}</span>
                  <span className="m-so-dong-ngay-ton m-so-dong-num">
                    {isSoCongNo ? 'Dư ' : 'Tồn '}{money(nhom.tonCuoiNgay)}
                  </span>
                </div>
                <div className="m-so-dong-the">
                  {nhom.ds.map((r, i) => {
                    const dg = String(r.dg || r.dienGiai || r.ten || 'Chứng từ')
                    const soCt = String(r.thu || r.chi || r.so || r.soCt || r.soHieu || '')
                    const tenCn = r.cn ? String(r.cn) : ''
                    const tkStr = r.tk ? (String(r.tk).startsWith('TK') ? String(r.tk) : `TK ${r.tk}`) : ''
                    const phu = [
                      soCt,
                      xemTatCaCn && tenCn ? tenCn : null,
                      tkStr || null,
                    ].filter(Boolean).join(' · ')

                    const tienThu = Number(r.no ?? (r.thu ? r.no : r.ps) ?? 0)
                    const tienChi = Number(r.co ?? (r.chi ? r.co : r.tra || r.tt) ?? 0)
                    const to = layDuongDan(soCt)

                    const noiDungItem = (
                      <>
                        <div className="m-so-dong-trai">
                          <div className="m-so-dong-dg">{dg}</div>
                          {phu && <div className="m-so-dong-phu">{phu}</div>}
                        </div>
                        {tienThu > 0 && (
                          <span className="m-so-dong-tien m-so-dong-duong m-so-dong-num">
                            +{money(tienThu)}
                          </span>
                        )}
                        {tienChi > 0 && (
                          <span className="m-so-dong-tien m-so-dong-am m-so-dong-num">
                            −{money(tienChi)}
                          </span>
                        )}
                      </>
                    )

                    return to ? (
                      <Link
                        key={i}
                        to={to}
                        className="m-so-dong-item m-so-dong-item-bam"
                        title="Mở chứng từ gốc"
                      >
                        {noiDungItem}
                      </Link>
                    ) : (
                      <div key={i} className="m-so-dong-item">
                        {noiDungItem}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Khung bảng cuộn ngang, trang không cuộn ngang */
        <div ref={bangWrapRef} className="m-sbc-bang-wrap">
          {noiDungBang}
        </div>
      )}

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
