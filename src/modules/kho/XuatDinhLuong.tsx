// Xuất kho định lượng (T849): mỗi phiếu Xuất bán POS sinh một phiếu xuất kho định lượng,
// T907: lưới phẳng, món không xuất được ghi lý do. T932: tiêu đề như phiếu mua, 3 tab Xuất kho, Lỗi, Lịch sử.
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { duongDan, tenMan } from '../../app/registry'
import { cuaHangHienTai, useSession } from '../../app/session'
import { Icon } from '../../ui/Icon'
import { Table, useDoRongCot } from '../../ui/Table'
import { PhanTrang } from '../../ui/PhanTrang'
import { ChonKhoangNgay, docNgay, thangMacDinh, trongKhoang, type KhoangNgay } from '../../ui/ChonNgay'
import { FormToanMan, useDong } from '../../ui/FormToanMan'
import { fold, money, moneyD, soLuong } from '../../ui/format'
import { BoLoc, useCauHinhLoc, useLocNhap, type OLocDef } from '../../ui/LocNangCao'
import { dangLoc, dsGiaTri, khopLoc, type GiaTriLoc, type KieuLoc } from '../../ui/LocCot'
import { IconFigmaSearch } from '../../ui/IconFigma'
import { NutExcel } from '../../ui/CongCuDs'
import { Select } from '../../ui/Dropdown'
import { monThieuXdl, useDsPhieuXdl, type LyDoXdl, type PhieuXdl } from './xuat-dinh-luong'
import { HopMonThieu, HopTaoXdl, type ViecTaoXdl } from './HopXuatDinhLuong'
import { CUA_HANG } from '../../data/mock'
import { LichSu } from '../../ui/generic/ChungTuForm'

// Món đồ uống do quầy bar pha, gói Pro xuất NVL từ kho bar (T915)
const DO_UONG = /cà phê|cafe|trà|sinh tố|nước|bia|soda|sữa|latte|cacao|matcha|đá xay|cocktail|rượu/i

export function XuatDinhLuong({ sc, mod }: ScreenProps) {
  const { id } = useParams()
  const rows = useDsPhieuXdl()

  if (id !== undefined) {
    const row = rows.find(r => r.id === id)
    return <ChiTietXuatDinhLuong sc={sc} mod={mod} row={row} />
  }

  return <DanhSachXuatDinhLuong sc={sc} mod={mod} rows={rows} />
}

function DanhSachXuatDinhLuong({ sc, mod, rows }: ScreenProps & { rows: PhieuXdl[] }) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const cnChon = cuaHangHienTai(s)

  // Hàng lọc giống Xuất huỷ (T886): kỳ, ô tìm, phễu (cửa hàng), lọc cột; giá trị nháp, bấm Lọc mới áp
  const loc0 = useLocNhap(() => ({ thoiGian: thangMacDinh() as KhoangNgay, tim: '', cn: '' }))
  const { nhap, dat, ap } = loc0
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>({})
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(50)
  const [hop, setHop] = useState<'' | 'thieu' | 'tao'>('')   // popup món thiếu, hộp thoại Tạo xuất kho định lượng (T935)
  // Việc tạo đang chạy: pt là phần trăm; chạy xong ghi thay đổi, giữ khung ở lại với thông báo hoàn thành cho tới khi bấm Đóng
  const [viec, setViec] = useState<(ViecTaoXdl & { pt: number; xong: boolean; ketQua: string }) | null>(null)
  useEffect(() => {
    if (!viec || viec.xong) return
    if (viec.pt >= 100) {
      const kq = viec.chay()   // ghi thay đổi đúng một lần, ngoài hàm cập nhật state
      setViec(v => v && { ...v, xong: true, ketQua: kq })
      return
    }
    const buoc = 100 / Math.max(10, Math.min(30, viec.mon.length * 2))
    const t = setTimeout(() => setViec(v => v && { ...v, pt: Math.min(100, Math.round(v.pt + buoc)) }), 300)
    return () => clearTimeout(t)
  }, [viec])
  const doRong = useDoRongCot('xuat-dinh-luong')   // kéo giãn cột như danh sách Xuất bán POS (T907)

  const rowsCh = useMemo(() => (cnChon ? rows.filter(r => r.cn === cnChon.ten) : rows), [rows, cnChon])
  const dsThieu = useMemo(() => monThieuXdl(rowsCh), [rowsCh])   // món thiếu hiện từ đầu; tạo lại toàn bộ chỉ làm số này giảm hoặc giữ nguyên
  const dsCn = useMemo(() => [...new Set(rows.map(r => r.cn))].sort(), [rows])
  const kieuCot = (k: string): KieuLoc => (k === 'ngay' ? 'ngay' : k === 'tong' ? 'so' : 'chon')
  const giaTri = (r: PhieuXdl, k: string): unknown => (k === 'thamChieu' ? r.posSo : (r as unknown as Row)[k])

  const rowsLoc = useMemo(() => {
    return rows.filter(r => {
      if (!trongKhoang(docNgay(r.ngay), ap.thoiGian)) return false
      if (cnChon && r.cn !== cnChon.ten) return false
      if (ap.cn && r.cn !== ap.cn) return false
      if (ap.tim.trim()) {
        const kw = fold(ap.tim.trim())
        const text = fold(`${r.so} ${r.maHd} ${r.kenh} ${r.posSo} ${r.ghiChu} ${r.cn} ${r.nguon} ${r.dong.map(m => m.ten).join(' ')}`)
        if (!text.includes(kw)) return false
      }
      for (const [k, g] of Object.entries(locCot)) {
        const v = giaTri(r, k)
        if (dangLoc(g) && !khopLoc(kieuCot(k), g, typeof v === 'number' ? `${money(v)} ${v}` : String(v ?? ''), typeof v === 'number' ? v : undefined,
          k === 'ngay' ? docNgay(r.ngay) : undefined)) return false
      }
      return true
    })
  }, [rows, ap, cnChon, locCot])   // eslint-disable-line react-hooks/exhaustive-deps
  const layLuaChon = (k: string) => dsGiaTri(rows, r => String(giaTri(r, k) ?? ''))

  const apLoc = () => { loc0.loc(); setTrang(1) }
  const oLoc: OLocDef[] = [
    { k: 'thoiGian', ten: 'Thời gian', coGiaTri: true, o: <ChonKhoangNgay value={nhap.thoiGian} onChange={k => dat('thoiGian', k)} /> },
    { k: 'tim', ten: 'Tìm kiếm', coGiaTri: Boolean(nhap.tim.trim()), o: <input className="ds-o-inp" value={nhap.tim} placeholder="Số phiếu, mã đơn POS, tham chiếu, món" aria-label="Tìm kiếm"
      onChange={e => dat('tim', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') apLoc() }} /> },
    ...(!cnChon && dsCn.length > 1 ? [{ k: 'cn', ten: 'Cửa hàng', coGiaTri: Boolean(nhap.cn), o: (
      <Select className="ds-o-sel" value={nhap.cn} aria-label="Cửa hàng" onChange={e => dat('cn', e.target.value)}>
        <option value="">Tất cả</option>
        {dsCn.map(c => <option key={c} value={c}>{c}</option>)}
      </Select>
    ) }] : []),
  ]
  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(path, oLoc.map(o => o.k), ['thoiGian', 'tim'])

  const batDau = (trang - 1) * coTrang
  const rowsTrang = rowsLoc.slice(batDau, batDau + coTrang)

  const cols: Col[] = [
    { k: 'stt', t: '#', w: 45, cls: 'dim' },
    { k: 'ngay', t: 'Ngày', w: 110 },
    {
      k: 'so',
      t: 'Số chứng từ',
      cls: 'code',
      w: 125,
      r: (r: Row) => (
        <button
          type="button"
          className="ds-link-so"
          title="Mở chi tiết phiếu xuất kho định lượng"
          onClick={e => {
            e.stopPropagation()
            nav(`${path}/${r.id}`)
          }}
        >
          {r.so}
        </button>
      ),
    },
    // Mã hoá đơn FABi: # và 5 ký tự cuối, rê chuột xem đủ (QD114)
    { k: 'cn', t: 'Cửa hàng', w: 140 },
    { k: 'kenh', t: 'Kênh bán', w: 100 },
    { k: 'maHd', t: 'Mã đơn POS', cls: 'code', w: 100, r: r => <span title={String(r.maHd)}>#{String(r.maHd).slice(-5)}</span> },
    {
      k: 'thamChieu',
      t: 'Tham chiếu',
      cls: 'code',
      w: 120,
      r: (r: Row) => (
        <Link
          to={`/app/ban-hang/3-1-1/${r.posId}`}
          className="ds-link-so"
          title="Mở chứng từ Xuất bán POS"
          onClick={e => e.stopPropagation()}
        >
          {r.posSo}
        </Link>
      ),
    },
    { k: 'ghiChu', t: 'Ghi chú', w: 200, wCung: true, cls: 'xdl-cat', r: r => <span title={String(r.ghiChu)}>{String(r.ghiChu)}</span> },
    { k: 'ngayTao', t: 'Ngày tạo', w: 130 },
    { k: 'nguoiTao', t: 'Người tạo', w: 95 },
    {
      k: 'nguon',
      t: 'Nguồn',
      w: 75,
      r: (r: Row) => <span className="chip info">{String(r.nguon ?? 'Xuất bán POS')}</span>,
    },
    { k: 'tong', t: 'Tổng tiền', num: true, w: 115, dinh: 'phai' },
  ]

  const rowsBang: Row[] = rowsTrang.map((r, i) => ({
    ...r,
    stt: batDau + i + 1,
    thamChieu: r.posSo,
  }))

  const tongTien = rowsLoc.reduce((a, r) => a + r.tong, 0)

  return (
    <div className="page page-voucher page-dm xdl-page">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <div className="dm-khung">
        <section className="card dm-bang">
          <div className="ds-toolbar-figma">
            <BoLoc
              ds={oLoc}
              cauHinh={cauHinhLoc}
              datCauHinh={datCauHinhLoc}
              dangLoc={loc0.dangLoc}
              khacNhap={loc0.khacNhap}
              onLoc={apLoc}
              onXoaHet={loc0.xoaNhap}
              chiNutPheu
              ngoaiRieng={{
                tim: (
                  <div key="tim" className="ds-tim-figma">
                    <IconFigmaSearch size={16} />
                    <input
                      value={nhap.tim}
                      placeholder="Số phiếu, mã đơn POS, tham chiếu, món"
                      title="Tìm theo số phiếu, mã đơn POS, tham chiếu, món"
                      aria-label="Tìm kiếm"
                      onChange={e => dat('tim', e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') apLoc()
                      }}
                    />
                  </div>
                ),
              }}
            />
            <div className="ds-toolbar-phai">
              <NutExcel onXuat={() => toast(`Đã xuất ${rowsLoc.length} phiếu ra Excel`)} />
              <button type="button" className="btn pri" disabled={Boolean(viec && !viec.xong)} onClick={() => setHop('tao')}>Tạo xuất kho định lượng</button>
            </div>
          </div>
          {viec && (
            <div className={`xdl-tien-trinh${viec.xong ? ' xong' : ''}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={viec.pt}>
              <div className="xdl-tt-chu">
                <b>{viec.xong ? 'Hoàn thành tạo xuất kho định lượng.' : `${viec.ten}…`}</b>
                <span>{viec.pt >= 100 ? viec.mon.length : Math.floor(viec.pt / 100 * viec.mon.length)}/{viec.mon.length} món · {viec.pt}%</span>
                {viec.xong && <button type="button" className="btn sm" onClick={() => setViec(null)}>Đóng</button>}
              </div>
              <div className="xdl-tt-thanh"><i style={{ width: `${viec.pt}%` }} /></div>
              {!viec.xong && <div className="xdl-tt-mon">Đang xử lý món {viec.mon[Math.min(viec.mon.length - 1, Math.floor(viec.pt / 100 * viec.mon.length))] ?? ''}</div>}
              <div className="xdl-tt-dk">{viec.dieuKien.map(([k, v]) => <span key={k}>{k}: <b>{v}</b></span>)}</div>
            </div>
          )}
          {dsThieu.length > 0 && (
            <button type="button" className="xdl-canh-bao xdl-canh-bao-nut" aria-haspopup="dialog" onClick={() => setHop('thieu')}>
              <Icon n="alert" className="ic sm" />
              <span>Có <b>{dsThieu.length}</b> món chưa tạo xuất kho định lượng.</span>
              <Icon n="chevr" className="ic sm" />
            </button>
          )}
          <Table
            cols={cols}
            rows={rowsBang}
            onRow={r => nav(`${path}/${r.id}`)}
            doRong={doRong}
            loc={{ gt: locCot, dat: (k, g) => { setLocCot(x => ({ ...x, [k]: g })); setTrang(1) }, bo: new Set(['stt']), kieu: c => kieuCot(c.k), layLuaChon }}
            sum={{ ngay: 'Tổng cộng', tong: tongTien }}
          />
          <PhanTrang trang={trang} tong={rowsLoc.length} coTrang={coTrang} onTrang={setTrang} onCoTrang={ct => { setCoTrang(ct); setTrang(1) }} />
        </section>
      </div>
      {hop === 'thieu' && <HopMonThieu ds={dsThieu} goi={s.goi} onDong={() => setHop('')} />}
      {hop === 'tao' && <HopTaoXdl rows={rowsCh} dsCn={dsCn} cnCoDinh={cnChon?.ten} khoangMd={ap.thoiGian} onDong={() => setHop('')} onTao={v => setViec({ ...v, pt: 0, xong: false, ketQua: '' })} />}
    </div>
  )
}

/** Tên ngắn của lý do cho dải cảnh báo, nút ở cột Xử lý (T907) */
const LY_DO: Record<LyDoXdl['loai'], { ngan: string; nut: string }> = {
  1: { ngan: 'Chưa có công thức', nut: 'Tạo công thức' },
  2: { ngan: 'Chưa khớp mã hàng', nut: 'Khớp mã hàng' },
  3: { ngan: 'Thiếu ĐVT', nut: 'Thêm ĐVT' },
  4: { ngan: 'Công thức ngừng áp dụng', nut: 'Mở công thức' },
  5: { ngan: 'Thiếu giá vốn', nut: 'Tính giá vốn' },
}

function ChiTietXuatDinhLuong({ sc, mod, row }: ScreenProps & { row?: PhieuXdl }) {
  const { s } = useSession()
  const nav = useNavigate()
  const dongForm = useDong(duongDan(mod, sc))
  const [tab, setTab] = useState<'xk' | 'loi' | 'ht' | 'ls'>('xk')
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>({})
  const doRong = useDoRongCot('xuat-dinh-luong-ct')   // kéo giãn cột (T913)
  const doRongLoi = useDoRongCot('xuat-dinh-luong-loi')

  // Tab Xuất kho: mỗi dòng một NVL của một món, phần Món bán lặp lại để lọc từng cột đúng
  // Kho xuất (T915): Standard, Plus một kho chính theo cửa hàng; Pro tách kho bar cho đồ uống, kho bếp cho món còn lại
  const ch = CUA_HANG.find(c => c.ten === row?.cn)
  const khoCua = (tenMon: string) => {
    if (s.goi !== 'PR') return `Kho ${ch?.ngan ?? row?.cn ?? ''}`
    const bar = DO_UONG.test(tenMon) ? ch?.kho.find(k => k.startsWith('Kho bar')) : undefined
    return bar ?? ch?.kho[0] ?? ''
  }
  const dongLuoi = useMemo<Row[]>(() => (row?.dong ?? []).flatMap((m, i) => {
    if (!m.nvl.length) return []   // món lỗi sang tab Lỗi
    const mon = { _mon: i, maCt: m.maCt ?? '', _ctId: m.ctId, tenMon: m.ten, maMon: m.maFabi ? `FABi: ${m.maFabi}` : m.ma, slMon: m.sl }
    const khoXuat = khoCua(m.ten)
    return m.nvl.map((n, j) => ({ ...mon, id: `${i}-${j}`, tenNvl: n.ten, maNvl: n.ma, dvtNvl: n.dvt, slNvl: n.sl, giaNvl: n.gia, tienNvl: n.tien, khoXuat, _lyDo: n.lyDo }))
  }), [row, s.goi])   // eslint-disable-line react-hooks/exhaustive-deps

  if (!row) {
    return (
      <FormToanMan icon={mod.icon} iconNet xem onClose={dongForm} title="Xuất kho định lượng" foot={<button type="button" className="btn" onClick={dongForm}>Đóng</button>}>
        <div className="p-4 dim">Không tìm thấy phiếu xuất kho định lượng.</div>
      </FormToanMan>
    )
  }

  const isPro = s.goi === 'PR'
  const ghiChu = `${row.ghiChu} đơn ${row.maHd}`   // ghép mã hoá đơn POS vào ghi chú
  const congThuc = s.goi === 'PL' ? '/app/danh-muc/cong-thuc-che-bien' : '/app/kho/9-1-3'   // gói Plus xem công thức ở Danh mục (T719)
  const diSua: Record<LyDoXdl['loai'], string> = { 1: congThuc, 2: '/app/danh-muc/1-2', 3: '/app/danh-muc/1-4', 4: congThuc, 5: '/app/kho/5-1-7' }

  const kieuCot = (k: string): KieuLoc => (/^(sl|gia|tien)/.test(k) ? 'so' : 'chon')
  const rowsLoc = dongLuoi.filter(r => Object.entries(locCot).every(([k, g]) => {
    const v = r[k]
    return !dangLoc(g) || khopLoc(kieuCot(k), g, typeof v === 'number' ? `${money(v)} ${v}` : String(v ?? ''), typeof v === 'number' ? v : undefined)
  }))
  const rowsBang = rowsLoc.map((r, i) => ({ ...r, stt: i + 1 }))

  // Tổng: tiền vốn cộng mọi dòng NVL; số lượng món bán cộng mỗi món một lần vì phần Món bán lặp theo dòng NVL
  const daDem = new Set<unknown>()
  const tong = { slMon: 0, tienNvl: 0 }
  for (const r of rowsLoc) {
    if (!daDem.has(r._mon)) { daDem.add(r._mon); tong.slMon += Number(r.slMon) }
    tong.tienNvl += Number(r.tienNvl ?? 0)
  }

  // Tab Lỗi: món chưa tạo được xuất kho định lượng (lý do 1 đến 4)
  const dsLoi = row.dong.filter(m => m.lyDo)
  const rowsLoi: Row[] = dsLoi.map((m, i) => ({ id: String(i), stt: i + 1, tenMon: m.ten, maMon: m.maFabi ? `FABi: ${m.maFabi}` : m.ma, slMon: m.sl, lyDo: m.lyDo!.text, _lyDo: m.lyDo }))
  const tongLoi = dsLoi.reduce((a, m) => a + m.sl, 0)

  const tenMa = (ten: unknown, ma: unknown) => ma ? <>{String(ten ?? '')} <span className="xdl-ma">- {String(ma)}</span></> : <>{String(ten ?? '')}</>   // dòng tổng chỉ có nhãn, không có mã
  const cols: Col[] = [
    { k: 'stt', t: '#', w: 45, cls: 'dim' },
    { k: 'khoXuat', t: 'Kho xuất', w: 140 },
    { k: 'tenNvl', t: 'Nguyên vật liệu', w: 200, r: r => tenMa(r.tenNvl, r.maNvl) },
    { k: 'dvtNvl', t: 'ĐVT', c: true, w: 60 },
    { k: 'slNvl', t: 'Số lượng', num: true, w: 85, r: r => soLuong(Number(r.slNvl)) },
    { k: 'giaNvl', t: 'Giá vốn', num: true, w: 95, r: r => r._lyDo ? <span className="xdl-nhac" title={(r._lyDo as LyDoXdl).text}>{money(Number(r.giaNvl))}</span> : money(Number(r.giaNvl)) },
    { k: 'tienNvl', t: 'Tiền vốn', num: true, w: 105, r: r => money(Number(r.tienNvl)) },
    { k: 'tenMon', t: 'Món bán', w: 200, gop: true, r: r => tenMa(r.tenMon, r.maMon) },
    { k: 'slMon', t: 'Số lượng', num: true, w: 85, gop: true, r: r => soLuong(Number(r.slMon)) },
    {
      k: 'maCt', t: 'Mã công thức', w: 110, cls: 'code', gop: true,
      // Bấm mã mở công thức chế biến đó (T908)
      r: r => r._ctId ? <button type="button" className="ds-link-so" title="Mở công thức chế biến" onClick={e => { e.stopPropagation(); nav(`${congThuc}/${String(r._ctId)}`) }}>{String(r.maCt)}</button> : <span className="dim">—</span>,
    },
  ]
  const colsLoi: Col[] = [
    { k: 'stt', t: '#', w: 45, cls: 'dim' },
    { k: 'tenMon', t: 'Món bán', w: 260, r: r => tenMa(r.tenMon, r.maMon) },
    { k: 'slMon', t: 'Số lượng', num: true, w: 90, r: r => soLuong(Number(r.slMon)) },
    { k: 'lyDo', t: 'Lý do', w: 360, wCung: true, cls: 'xdl-cat', r: r => <span className="xdl-loi" title={String(r.lyDo)}>{String(r.lyDo)}</span> },
    {
      k: 'xuLy', t: 'Xử lý', w: 130,
      r: r => {
        const ld = r._lyDo as LyDoXdl
        return <button type="button" className="ds-link-so" onClick={e => { e.stopPropagation(); nav(diSua[ld.loai]) }}>{LY_DO[ld.loai].nut}</button>
      },
    },
  ]

  const tabs: [typeof tab, ReactNode][] = [
    ['xk', 'Xuất kho'],
    ['loi', <>Lỗi{dsLoi.length > 0 && <span className="n err">{dsLoi.length}</span>}</>],
    ...(isPro ? [['ht', 'Hạch toán'] as [typeof tab, ReactNode]] : []),
    ['ls', 'Lịch sử'],
  ]

  return (
    <FormToanMan
      icon={mod.icon}
      iconNet
      xem
      onClose={dongForm}
      title="Xuất kho định lượng"
      giua={<span className="fsf-tt xem">Chi tiết phiếu <b>{row.so}</b></span>}
      trai={
        <button type="button" className="icon-btn" title="Xem lịch sử thao tác" onClick={() => setTab('ls')}>
          <Icon n="history" />
        </button>
      }
      meta={
        <>
          <span className="src">{row.nguon}</span>
          <span className="chip info" title="Cửa hàng lập chứng từ, không sửa được"><Icon n="cuahang" className="ic sm" />{row.cn}</span>
        </>
      }
      footClass="fsf-f-xem"
      foot={
        <>
          <div className="xp-footer-trai">
            <button type="button" className="xp-btn-in" onClick={() => window.print()}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12H2.66667C2.31304 12 1.97391 11.8595 1.72386 11.6095C1.47381 11.3594 1.33333 11.0203 1.33333 10.6667V7.33333C1.33333 6.97971 1.47381 6.64057 1.72386 6.39052C1.97391 6.14048 2.31304 6 2.66667 6H13.3333C13.687 6 14.0261 6.14048 14.2761 6.39052C14.5262 6.64057 14.6667 6.97971 14.6667 7.33333V10.6667C14.6667 11.0203 14.5262 11.3594 14.2761 11.6095C13.687 12 13.3333 12 13.3333 12H12" />
                <path d="M4 6V2C4 1.82319 4.07024 1.65362 4.19526 1.5286C4.32029 1.40357 4.48986 1.33333 4.66667 1.33333H11.3333C11.5101 1.33333 11.6797 1.40357 11.8047 1.5286C11.9298 1.65362 12 1.82319 12 2V6" />
                <path d="M4.66667 9.33333H11.3333C11.7015 9.33333 12 9.63181 12 10V14C12 14.3682 11.7015 14.6667 11.3333 14.6667H4.66667C4.29848 14.6667 4 14.3682 4 14V10C4 9.63181 4.29848 9.33333 4.66667 9.33333Z" />
              </svg>
              <span>In phiếu</span>
            </button>
          </div>
          <div className="fsf-tong">
            <small>Tổng tiền vốn:</small><b>{moneyD(row.tong)}</b>
          </div>
        </>
      }
    >
      <div className="stack" style={{ gap: 14 }}>
        <p className="pos-nhac" style={{ margin: 0 }}>
          <Icon n="info" className="ic sm" />
          Phiếu sinh tự động từ chứng từ Xuất bán POS. Chỉ xem, không sửa hay xoá.
        </p>

        {/* Thông tin chung dạng chữ, không ô nhập: số chứng từ đã có ở tiêu đề; dòng Tham chiếu như phiếu mua (T585, T932) */}
        <section className="card ct-ttc xdl-tt">
          <div className="xp637-cap xdl-tt-dong">
            <div className="xp637-o"><span className="xp637-nhan">Mã hoá đơn POS</span><div className="xp637-tri"><span className="xp637-code">{row.maHd}</span></div></div>
            <div className="xp637-o xdl-tt-be"><span className="xp637-nhan">Kênh bán</span><div className="xp637-tri"><span>{row.kenh}</span></div></div>
            <div className="xp637-o xdl-tt-gc"><span className="xp637-nhan">Ghi chú</span><div className="xp637-tri"><span title={ghiChu}>{ghiChu}</span></div></div>
            <div className="xp637-o xdl-tt-be"><span className="xp637-nhan">Ngày xuất</span><div className="xp637-tri"><span>{row.ngay}</span></div></div>
          </div>
          <div className="ct-tham-chieu">
            <span className="dim">Tham chiếu</span>
            <span className="ct-tham-chieu-ds">
              <Link to={`/app/ban-hang/3-1-1/${row.posId}`} className="ds-link-so" title="Mở chứng từ Xuất bán POS">{row.posSo}</Link>
            </span>
          </div>
        </section>

        <section className="card xdl-luoi" style={{ padding: 0, overflow: 'auto' }}>
          <div className="tabs">
            {tabs.map(([k, l]) => (
              <button key={k} type="button" className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>

          {tab === 'xk' && (
            <Table
              cols={cols}
              rows={rowsBang}
              rowCls={r => (r._lyDo ? 'xdl-dong-loi' : '')}
              gopO={r => (r._mon === undefined ? undefined : String(r._mon))}   // các dòng NVL của cùng một món gộp ô Món bán, Số lượng, Mã công thức
              doRong={doRong}
              loc={{ gt: locCot, dat: (k, g) => setLocCot(x => ({ ...x, [k]: g })), bo: new Set(['stt']), kieu: c => kieuCot(c.k), layLuaChon: k => dsGiaTri(dongLuoi, r => String(r[k] ?? '')) }}
              sum={{ khoXuat: 'Tổng cộng', ...tong }}
            />
          )}

          {tab === 'loi' && (
            dsLoi.length === 0
              ? <div className="empty"><b>Không có món lỗi</b>Tất cả món bán đã tạo được xuất kho định lượng.</div>
              : <Table cols={colsLoi} rows={rowsLoi} doRong={doRongLoi} sum={{ tenMon: 'Tổng cộng', slMon: tongLoi }} />
          )}

          {tab === 'ht' && isPro && (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 45 }}>#</th>
                  <th>Diễn giải</th>
                  <th style={{ width: 120 }}>TK Nợ</th>
                  <th style={{ width: 120 }}>TK Có</th>
                  <th style={{ width: 140, textAlign: 'right' }}>Số tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="dim">1</td>
                  <td>Giá vốn xuất bán theo định lượng</td>
                  <td className="code">632</td>
                  <td className="code">152</td>
                  <td style={{ textAlign: 'right' }}><b>{money(row.tong)}</b></td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}><b>Tổng cộng</b></td>
                  <td style={{ textAlign: 'right' }}><b>{money(row.tong)}</b></td>
                </tr>
              </tfoot>
            </table>
          )}

          {tab === 'ls' && <LichSu goi={s.goi} moi={false} man={`${mod.key}/${sc.slug}`} id={row.id} />}
        </section>
      </div>
    </FormToanMan>
  )
}
