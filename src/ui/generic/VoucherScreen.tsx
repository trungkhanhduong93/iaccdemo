// Màn chứng từ chung: danh sách theo bố cục AMIS với cột đứng yên, bộ lọc kỳ nhanh, khung chi tiết bên dưới, thao tác hàng loạt.
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps, VoucherCfg } from '../../modules/types'
import { duongDan, tenMan } from '../../app/registry'
import { chiNhanhHienTai, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { Icon } from '../Icon'
import { PageHead } from '../Page'
import { Dropdown, MenuHead, MenuItem } from '../Dropdown'
import { St, Table } from '../Table'
import { PhanTrang } from '../PhanTrang'
import { ChonKhoangNgay, docNgay, thangNay, trongKhoang, type KhoangNgay } from '../ChonNgay'
import { NutExcel, NutGiaoDien } from '../CongCuDs'
import { money } from '../format'
import { dangLoc, khopLoc, type GiaTriLoc, type KieuLoc } from '../LocCot'
import { NGUON, TT_CT, chungTu, dongCua, ttNghiepVu } from './gen'
import { boO, nhomCua, theoLoai, TT_HD, TT_TIEN } from './nhom'
import { BangSua } from './BangSua'
import { ChungTuForm, HachToan, LichSu, VoucherDetail } from './ChungTuForm'

function docCotAn(path: string): string[] {
  try {
    const raw = localStorage.getItem(`iacc-cot-an:${path}`)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function ghiCotAn(path: string, ds: string[]) {
  try {
    localStorage.setItem(`iacc-cot-an:${path}`, JSON.stringify(ds))
  } catch {
    // Bỏ qua lỗi nếu không ghi được localStorage
  }
}

const COT_CO_DINH = new Set(['chk', 'stt', 'ngay', 'so', 'action'])
/** Cột lọc bằng cách chọn trong danh sách giá trị */
const COT_CHON = new Set(['tenLoai', 'nguon', 'tt', 'ttTien', 'ttHd'])

// Re-export để các màn khác (như ban-hang/ChungTuBanHang.tsx) tiếp tục sử dụng
export { ChungTuForm, VoucherDetail, HachToan, LichSu }

const MAC_DINH: VoucherCfg = { prefix: 'CT', doiTuong: 'none', dienGiai: ['Chứng từ'], tien: [1_000_000, 20_000_000] }

export function VoucherScreen({ sc, mod }: ScreenProps) {
  const { id } = useParams()
  const loc = useLocation()
  const cfg = sc.voucher ?? { ...MAC_DINH, dienGiai: [tenMan(sc)] }
  const rows = useMemo(() => (cfg.loai ? gopLoai(cfg, sc.code ?? sc.slug) : chungTu(cfg, sc.code ?? sc.slug)), [sc])

  if (id !== undefined) {
    const row = id === 'moi' ? undefined : rows.find(r => r.id === id)
    return <ChungTuForm key={loc.key + loc.search} sc={sc} mod={mod} cfg={cfg} row={row} rows={rows} />
  }

  return <VoucherList sc={sc} mod={mod} cfg={cfg} rows={rows} />
}

/** Màn nhiều loại phiếu: mỗi loại lấy 9 phiếu gần nhất rồi xếp chung theo ngày */
function gopLoai(cfg: VoucherCfg, seed: string): Row[] {
  const ngay = (r: Row) => String(r.ngay).split('/').reverse().join('')
  return cfg.loai!.flatMap(v => chungTu(theoLoai(cfg, v.k), `${seed}-${v.k}`).slice(0, 9)
    .map((r): Row => ({ ...r, id: `${v.k}-${r.id}`, loai: v.k, tenLoai: v.ten })))
    .sort((a, b) => ngay(b).localeCompare(ngay(a)) || String(b.so).localeCompare(String(a.so)))
    .map((r, i) => ({ ...r, tt: i < 3 ? 'nhap' : i === 5 ? 'loi' : 'ghi' }))
}

export function VoucherList({ sc, mod, cfg, rows, extra, title }: ScreenProps & { cfg: VoucherCfg; rows: Row[]; extra?: React.ReactNode; title?: string }) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const [khoang, setKhoang] = useState<KhoangNgay>(thangNay)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string>(rows[0]?.id ?? '')
  const [panelMo, setPanelMo] = useState(true)
  const [tabPanel, setTabPanel] = useState<'ct' | 'ht' | 'khac'>('ct')

  const ghi = kieuGhiSo(s.goi) !== 'khong'
  const cnChon = chiNhanhHienTai(s)
  const nhom = nhomCua(mod.key, cfg)
  const bo = boO(nhom, cfg)
  const path = duongDan(mod, sc)

  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(20)
  const [cotAn, setCotAn] = useState<string[]>(() => docCotAn(path))

  useEffect(() => {
    setCotAn(docCotAn(path))
  }, [path])

  const toggleCot = (k: string) => {
    setCotAn(prev => {
      const moi = prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]
      ghiCotAn(path, moi)
      return moi
    })
  }

  const hienTatCaCot = () => {
    setCotAn([])
    ghiCotAn(path, [])
  }

  // Lọc từng cột trên hàng lọc dưới tiêu đề bảng: phễu điều kiện theo kiểu cột, so theo chữ hiện trong ô
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>({})
  const kieuCot = (k: string): KieuLoc =>
    k === 'ngay' ? 'ngay' : COT_CHON.has(k) ? 'chon' : k === 'tong' || k === 'thue' ? 'so' : 'chu'
  const chuCot = (k: string, r: Row): string => {
    if (k === 'nguon') return (NGUON[r.nguon] ?? NGUON.tay)[1]
    if (k === 'tt') return ghi ? (TT_CT[r.tt]?.[1] ?? 'Chưa ghi') : r.tt === 'nhap' ? 'Nháp' : 'Đã lưu'
    if ((k === 'ttTien' || k === 'ttHd') && (nhom === 'mua' || nhom === 'ban')) {
      const nv = ttNghiepVu(r)
      return (k === 'ttTien' ? TT_TIEN : TT_HD)[nhom][k === 'ttTien' ? nv.ttTien : nv.ttHd]?.[1] ?? ''
    }
    const v = r[k]
    return typeof v === 'number' ? `${money(v)} ${v}` : String(v ?? '')
  }

  // Giá trị để chọn cho các cột kiểu chọn, lấy từ chính các phiếu của màn
  const luaChon = useMemo(() => Object.fromEntries([...COT_CHON].map(k => [k, [...new Set(rows.map(r => chuCot(k, r)).filter(Boolean))]])), [rows, ghi])

  // Lọc theo kỳ
  const list = rows.filter(r => {
    if (!trongKhoang(docNgay(r.ngay), khoang)) return false
    if (cnChon && r.cn !== cnChon.ten) return false
    for (const [k, g] of Object.entries(locCot)) {
      if (dangLoc(g) && !khopLoc(kieuCot(k), g, chuCot(k, r), typeof r[k] === 'number' ? r[k] : undefined, k === 'ngay' ? docNgay(r.ngay) : undefined)) return false
    }
    return true
  })

  const tong = list.reduce((a, r) => a + r.tong, 0)

  // Phân trang
  const soTrang = Math.max(1, Math.ceil(list.length / coTrang))
  const trangHienTai = Math.min(trang, soTrang)
  const pagedRows = useMemo(() => {
    const batDau = (trangHienTai - 1) * coTrang
    return list.slice(batDau, batDau + coTrang).map((r, i) => ({ ...r, stt: batDau + i + 1 }))
  }, [list, trangHienTai, coTrang])

  // Dòng đang chọn xem chi tiết ở khung dưới
  const activeRow = list.find(r => r.id === activeId) ?? list[0]
  const activeDong = useMemo(() => {
    if (!activeRow) return []
    const seed = `${sc.code ?? sc.slug}-${activeRow.id}`
    return dongCua(cfg, seed)
  }, [activeRow, cfg, sc])

  // Chọn checkbox
  const tatCaDaChon = list.length > 0 && list.every(r => selectedIds.has(r.id))
  function toggleChonTatCa() {
    if (tatCaDaChon) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(list.map(r => r.id)))
    }
  }

  function toggleChon(id: string) {
    const moi = new Set(selectedIds)
    if (moi.has(id)) moi.delete(id)
    else moi.add(id)
    setSelectedIds(moi)
  }

  // Định nghĩa các cột (Cột Ngày, Số chứng từ đứng yên bên trái; Cột Chức năng đứng yên bên phải)
  const cols: Col[] = [
    {
      k: 'chk',
      t: '',
      w: 34,
      dinh: 'trai',
      hd: (
        <input
          type="checkbox"
          checked={tatCaDaChon}
          onChange={toggleChonTatCa}
          aria-label="Chọn tất cả"
        />
      ),
      r: r => (
        <input
          type="checkbox"
          checked={selectedIds.has(r.id)}
          onClick={e => e.stopPropagation()}
          onChange={() => toggleChon(r.id)}
          aria-label={`Chọn chứng từ ${r.so}`}
        />
      ),
    },
    { k: 'stt', t: 'STT', w: 48, c: true, dinh: 'trai' },
    { k: 'ngay', t: 'Ngày', w: 96, dinh: 'trai' },
    { k: 'so', t: 'Số chứng từ', cls: 'code', w: 140, dinh: 'trai' },
    ...(cfg.loai ? [{ k: 'tenLoai', t: 'Loại', w: 130 } as Col] : []),
    { k: 'dienGiai', t: 'Diễn giải' },
    ...(cfg.doiTuong !== 'none' ? [{ k: 'doiTuong', t: cfg.nhan ?? 'Đối tượng' } as Col] : []),
    // Đang chọn một chi nhánh trên thanh trên thì cột chi nhánh thừa
    ...(cnChon ? [] : [{ k: 'cn', t: 'Chi nhánh', cls: 'dim', w: 130 } as Col]),
    // Trạng thái thanh toán & hoá đơn cho nhóm mua / bán
    ...(nhom === 'mua' || nhom === 'ban' ? [
      {
        k: 'ttTien',
        t: nhom === 'mua' ? 'TT thanh toán' : 'TT thu tiền',
        w: 135,
        r: (r: Row) => {
          const nv = ttNghiepVu(r)
          const [cls, nhan] = TT_TIEN[nhom as 'mua' | 'ban'][nv.ttTien] ?? ['dim', '—']
          return <St k={cls}>{nhan}</St>
        },
      } as Col,
      {
        k: 'ttHd',
        t: nhom === 'mua' ? 'Nhận hoá đơn' : 'Xuất hoá đơn',
        w: 130,
        r: (r: Row) => {
          const nv = ttNghiepVu(r)
          const [cls, nhan] = TT_HD[nhom as 'mua' | 'ban'][nv.ttHd] ?? ['dim', '—']
          return <St k={cls}>{nhan}</St>
        },
      } as Col,
    ] : []),
    ...(cfg.thue !== undefined || cfg.dong === 'hang' ? [{ k: 'thue', t: 'Tiền thuế', num: true, w: 110 } as Col] : []),
    { k: 'tong', t: 'Tổng tiền', num: true, w: 120 },
    {
      k: 'nguon',
      t: 'Nguồn',
      w: 90,
      r: r => {
        const [c, t] = NGUON[r.nguon] ?? NGUON.tay
        return <span className={`src ${c}`}>{t}</span>
      },
    },
    {
      k: 'tt',
      t: 'Trạng thái',
      w: 110,
      r: r => {
        const [c, t] = TT_CT[r.tt] ?? ['warn', 'Chưa ghi']
        return <St k={c}>{ghi ? t : r.tt === 'nhap' ? 'Nháp' : 'Đã lưu'}</St>
      },
    },
    // Cột chức năng đứng yên bên phải
    {
      k: 'action',
      t: 'Chức năng',
      w: 105,
      dinh: 'phai',
      r: r => (
        <div className="row" style={{ gap: 4, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
          <button
            type="button"
            className="btn sm ghost ct-xem"
            onClick={() => nav(`${path}/${r.id}`)}
          >
            Xem
          </button>
          <Dropdown
            btnClass="icon-btn sm"
            align="end"
            width={160}
            label={<Icon n="more" className="ic sm" />}
          >
            <MenuItem icon="edit" onClick={() => nav(`${path}/${r.id}?sua=1`)}>Sửa</MenuItem>
            <MenuItem icon="copy" onClick={() => toast(`Đã nhân bản ${r.so}`)}>Nhân bản</MenuItem>
            <MenuItem icon="printer" onClick={() => toast(`In ${r.so}`)}>In</MenuItem>
            {ghi && (
              <MenuItem
                icon="check"
                onClick={() => toast(r.tt === 'ghi' ? `Đã bỏ ghi sổ ${r.so}` : `Đã ghi sổ ${r.so}`)}
              >
                {r.tt === 'ghi' ? 'Bỏ ghi sổ' : 'Ghi sổ'}
              </MenuItem>
            )}
            <MenuItem icon="trash" danger onClick={() => toast(`Xoá ${r.so}`)}>Xoá</MenuItem>
          </Dropdown>
        </div>
      ),
    },
  ]

  const cotAnSet = useMemo(() => new Set(cotAn), [cotAn])
  const colsTuyChon = useMemo(() => cols.filter(c => !COT_CO_DINH.has(c.k)), [cols])
  const colsHienThi = useMemo(() => cols.filter(c => COT_CO_DINH.has(c.k) || !cotAnSet.has(c.k)), [cols, cotAnSet])

  return (
    <div className="page page-voucher">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={title ?? tenMan(sc)} code={sc.code}>
        {cfg.nguon && cfg.nguon !== 'tay' && (
          <button
            type="button"
            className="btn"
            onClick={() => toast(`Đã tải 14 chứng từ mới từ ${NGUON[cfg.nguon!][1]}`)}
          >
            <Icon n="refresh" className="ic sm" />Tải từ {NGUON[cfg.nguon][1]}
          </button>
        )}
        {/* Kỳ số liệu đưa lên đầu trang; tìm, lọc trạng thái thay bằng hàng lọc từng cột trong bảng (T39) */}
        <ChonKhoangNgay value={khoang} onChange={k => { setKhoang(k); setTrang(1) }} />
        <NutExcel onNhap={() => toast('Nhập chứng từ từ file Excel')} onXuat={() => toast(`Đã xuất ${list.length} chứng từ ra Excel`)} />
        <NutGiaoDien cols={colsTuyChon} an={cotAnSet} doi={toggleCot} hienHet={hienTatCaCot} />
        {cfg.loai ? <NutThemLoai cfg={cfg} path={path} /> : (
          <Link className="btn pri" to={`${path}/moi`}>
            <Icon n="plus" className="ic sm" />{cfg.them ?? 'Thêm chứng từ'}
          </Link>
        )}
      </PageHead>

      {extra}

      <div className="voucher-split">
        {/* Nửa trên: 50% danh sách các phiếu */}
        <section className="card voucher-top">
          {/* Thanh thao tác hàng loạt khi tick nhiều dòng */}
          {selectedIds.size > 0 && (
            <div className="batch-bar">
              <b>Đã chọn {selectedIds.size} chứng từ</b>
              <span className="grow" />
              {ghi && (
                <>
                  <button
                    type="button"
                    className="btn sm ghost"
                    onClick={() => { toast(`Đã ghi sổ ${selectedIds.size} chứng từ`); setSelectedIds(new Set()) }}
                  >
                    <Icon n="check" className="ic sm" />Ghi sổ
                  </button>
                  <button
                    type="button"
                    className="btn sm ghost"
                    onClick={() => { toast(`Đã bỏ ghi sổ ${selectedIds.size} chứng từ`); setSelectedIds(new Set()) }}
                  >
                    Bỏ ghi sổ
                  </button>
                </>
              )}
              <button
                type="button"
                className="btn sm ghost"
                onClick={() => toast(`In ${selectedIds.size} chứng từ`)}
              >
                <Icon n="printer" className="ic sm" />In hàng loạt
              </button>
              <button
                type="button"
                className="btn sm ghost"
                onClick={() => setSelectedIds(new Set())}
              >
                Bỏ chọn
              </button>
            </div>
          )}


          {/* Bảng danh sách chứng từ */}
          {list.length ? (
            <>
              <Table
                cols={colsHienThi}
                rows={pagedRows}
                motDong
                loc={{ gt: locCot, dat: (k, g) => { setLocCot(x => ({ ...x, [k]: g })); setTrang(1) }, bo: new Set(['chk', 'stt', 'action']),
                  kieu: c => kieuCot(c.k), luaChon }}
                onRow={r => setActiveId(r.id)}
                onDbl={r => nav(`${path}/${r.id}`)}
                rowCls={r => [
                  r.id === activeId ? 'dang-chon' : '',
                  r.tt === 'nhap' ? 'chua-ghi' : '',
                  r.tt === 'loi' && ghi ? 'bad' : '',
                ].filter(Boolean).join(' ')}
                sum={{
                  ngay: `${list.length} chứng từ`,
                  tong,
                  thue: list.reduce((a, r) => a + (r.thue || 0), 0),
                }}
              />
              <PhanTrang
                tong={list.length}
                trang={trangHienTai}
                coTrang={coTrang}
                onTrang={setTrang}
                onCoTrang={ct => { setCoTrang(ct); setTrang(1) }}
              />
            </>
          ) : (
            <div className="empty" style={{ margin: 'auto' }}>
              <b>Không có chứng từ khớp bộ lọc</b>
              <button
                type="button"
                className="btn sm"
                style={{ marginTop: 10 }}
                onClick={() => { setKhoang(thangNay()); setLocCot({}); setTrang(1) }}
              >
                Xoá bộ lọc
              </button>
            </div>
          )}
        </section>

        {/* Nửa dưới: 50% chi tiết bên trong chứng từ đang chọn */}
        <section className="card ct-panel voucher-bottom">
          {activeRow ? (
            <>
              <div className="voucher-bottom-h">
                <div className="row" style={{ gap: 8, minWidth: 0, flex: '1 1 auto' }}>
                  <Icon n="doc" className="ic sm" />
                  <b style={{ whiteSpace: 'nowrap' }}>Chi tiết {activeRow.so}</b>
                  <span className="dim" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ({activeRow.ngay}) — {activeRow.dienGiai}
                  </span>
                </div>
                <div className="tabs" style={{ margin: 0, flex: 'none' }}>
                  <button
                    type="button"
                    className={tabPanel === 'ct' ? 'on' : ''}
                    onClick={() => setTabPanel('ct')}
                  >
                    Hàng tiền ({activeDong.length} dòng)
                  </button>
                  <button
                    type="button"
                    className={tabPanel === 'ht' ? 'on' : ''}
                    onClick={() => setTabPanel('ht')}
                  >
                    {ghi ? 'Hạch toán' : 'Ghi sổ'}
                  </button>
                  <button
                    type="button"
                    className={tabPanel === 'khac' ? 'on' : ''}
                    onClick={() => setTabPanel('khac')}
                  >
                    Thông tin khác
                  </button>
                </div>
                <button
                  type="button"
                  className="btn sm"
                  style={{ flex: 'none', marginLeft: 8 }}
                  onClick={() => nav(`${path}/${activeRow.id}`)}
                  title="Mở form toàn màn hình (hoặc đúp chuột vào dòng)"
                >
                  <Icon n="eye" className="ic sm" />Xem chi tiết
                </button>
              </div>

              <div className="voucher-bottom-b">
                {tabPanel === 'ct' && (
                  <BangSua
                    cfg={theoLoai(cfg, activeRow.loai)}
                    dong={activeDong}
                    cheDo="xem"
                    coKho={Boolean(bo.kho)}
                    coCk={Boolean(bo.ck)}
                    coKm={ghi}
                  />
                )}

                {tabPanel === 'ht' && (
                  <div style={{ padding: 14 }}>
                    <HachToan
                      cfg={cfg}
                      goi={s.goi}
                      tien={activeRow.tien}
                      thue={activeRow.thue || 0}
                      dt={String(activeRow.doiTuong ?? '')}
                      cn={String(activeRow.cn ?? '')}
                    />
                  </div>
                )}

                {tabPanel === 'khac' && (
                  <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, fontSize: 13, padding: 14 }}>
                    <div><b>Đối tượng:</b> {activeRow.doiTuong || '—'}</div>
                    <div><b>Chi nhánh:</b> {activeRow.cn || '—'}</div>
                    <div><b>Nguồn dữ liệu:</b> {activeRow.nguon}</div>
                    <div><b>Tổng tiền:</b> {money(activeRow.tong)} đ</div>
                    <div><b>Thuế GTGT:</b> {money(activeRow.thue || 0)} đ</div>
                    <div><b>Trạng thái:</b> {TT_CT[activeRow.tt]?.[1] ?? activeRow.tt}</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty">
              <b>Chọn một chứng từ ở bảng trên để xem chi tiết</b>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

/** Nút thêm của màn nhiều loại phiếu */
function NutThemLoai({ cfg, path }: { cfg: VoucherCfg; path: string }) {
  const ds = cfg.loai!
  return (
    <div className="split">
      <Link className="btn pri" to={`${path}/moi?loai=${ds[0].k}`}>
        <Icon n="plus" className="ic sm" />{cfg.them ?? `Thêm ${ds[0].ten.toLowerCase()}`}
      </Link>
      <Dropdown btnClass="btn pri" align="end" width={280} title="Chọn loại phiếu" label={<Icon n="chevd" className="ic sm" />}>
        <MenuHead>Chọn loại phiếu</MenuHead>
        {ds.map(v => <MenuItem key={v.k} to={`${path}/moi?loai=${v.k}`} icon={v.icon ?? 'doc'} desc={`Số ${v.prefix}…`}>{v.ten}</MenuItem>)}
      </Dropdown>
    </div>
  )
}
