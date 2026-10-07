// Màn chứng từ chung: danh sách theo bố cục AMIS với cột đứng yên, bộ lọc kỳ nhanh, khung chi tiết bên dưới, thao tác hàng loạt.
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps, VoucherCfg } from '../../modules/types'
import { duongDan, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { CHI_NHANH } from '../../data/mock'
import { Icon } from '../Icon'
import { Card, PageHead } from '../Page'
import { Dropdown, MenuHead, MenuItem, Select } from '../Dropdown'
import { St, Table } from '../Table'
import { fold, money } from '../format'
import { NGUON, TT_CT, chungTu, dongCua, ttNghiepVu } from './gen'
import { boO, nhomCua, theoLoai, TT_HD, TT_TIEN } from './nhom'
import { BangSua } from './BangSua'
import { ChungTuForm, HachToan, LichSu, VoucherDetail } from './ChungTuForm'

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
  const [ky, setKy] = useState('all')
  const [tt, setTt] = useState('all')
  const [q, setQ] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string>(rows[0]?.id ?? '')
  const [panelMo, setPanelMo] = useState(true)
  const [tabPanel, setTabPanel] = useState<'ct' | 'ht' | 'khac'>('ct')

  const ghi = kieuGhiSo(s.goi) !== 'khong'
  const nhom = nhomCua(mod.key, cfg)
  const bo = boO(nhom, cfg)

  // Lọc theo kỳ
  const list = rows.filter(r => {
    if (ky === '10' && r.thang !== 10) return false
    if (ky === '9' && r.thang !== 9) return false
    if (ky === 'q4' && (r.thang < 10 || r.thang > 12)) return false
    if (tt !== 'all' && r.tt !== tt) return false
    if (q && !fold(`${r.so} ${r.doiTuong} ${r.dienGiai}`).includes(fold(q))) return false
    return true
  })

  const tong = list.reduce((a, r) => a + r.tong, 0)
  const path = duongDan(mod, sc)

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
    { k: 'ngay', t: 'Ngày', w: 96, dinh: 'trai' },
    { k: 'so', t: 'Số chứng từ', cls: 'code', w: 140, dinh: 'trai' },
    ...(cfg.loai ? [{ k: 'tenLoai', t: 'Loại', w: 130 } as Col] : []),
    { k: 'dienGiai', t: 'Diễn giải' },
    ...(cfg.doiTuong !== 'none' ? [{ k: 'doiTuong', t: cfg.nhan ?? 'Đối tượng' } as Col] : []),
    { k: 'cn', t: 'Chi nhánh', cls: 'dim', w: 130 },
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

  return (
    <div className="page">
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
        <button type="button" className="btn"><Icon n="upload" className="ic sm" />Nhập Excel</button>
        <button type="button" className="btn"><Icon n="download" className="ic sm" />Xuất Excel</button>
        {cfg.loai ? <NutThemLoai cfg={cfg} path={path} /> : (
          <Link className="btn pri" to={`${path}/moi`}>
            <Icon n="plus" className="ic sm" />{cfg.them ?? 'Thêm chứng từ'}
          </Link>
        )}
      </PageHead>

      {extra}

      <section className="card">
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

        {/* Thanh bộ lọc */}
        <div className="filters">
          <label className="fld">
            <Icon n="calendar" className="ic sm" />Kỳ
            <Select value={ky} onChange={e => setKy(e.target.value)}>
              <option value="all">Tất cả các kỳ</option>
              <option value="10">Tháng này (10/2026)</option>
              <option value="9">Tháng trước (09/2026)</option>
              <option value="q4">Quý này (Quý 4/2026)</option>
              <option value="nam">Năm nay (2026)</option>
            </Select>
          </label>
          <label className="fld">
            Chi nhánh
            <Select>
              <option>Tất cả</option>
              {CHI_NHANH.map(c => <option key={c.id}>{c.ten}</option>)}
            </Select>
          </label>
          <label className="fld">
            Trạng thái
            <Select value={tt} onChange={e => setTt(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="nhap">{ghi ? 'Chưa ghi sổ' : 'Nháp'}</option>
              <option value="ghi">{ghi ? 'Đã ghi sổ' : 'Đã lưu'}</option>
              {ghi && <option value="loi">Lỗi hạch toán</option>}
            </Select>
          </label>
          <label className="fld">
            <Icon n="search" className="ic sm" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Số chứng từ, đối tượng, diễn giải"
            />
          </label>
          <span className="grow" />
          <button type="button" className="btn sm">
            <Icon n="printer" className="ic sm" />In
          </button>
        </div>

        {/* Bảng danh sách chứng từ */}
        {list.length ? (
          <Table
            cols={cols}
            rows={list}
            onRow={r => setActiveId(r.id)}
            onDbl={r => nav(`${path}/${r.id}`)}
            rowCls={r => [
              r.id === activeId ? 'sel' : '',
              r.tt === 'nhap' ? 'chua-ghi' : '',
              r.tt === 'loi' && ghi ? 'bad' : '',
            ].filter(Boolean).join(' ')}
            sum={{
              ngay: `${list.length} chứng từ`,
              tong,
              thue: list.reduce((a, r) => a + (r.thue || 0), 0),
            }}
          />
        ) : (
          <div className="empty">
            <b>Không có chứng từ khớp bộ lọc</b>
            <button
              type="button"
              className="btn sm"
              style={{ marginTop: 10 }}
              onClick={() => { setKy('all'); setTt('all'); setQ('') }}
            >
              Xoá bộ lọc
            </button>
          </div>
        )}
      </section>

      {/* Khung chi tiết bên dưới (thu gọn được, bấm Xem để mở form) */}
      {activeRow && (
        <section className="ct-panel">
          <div className="ct-panel-h" onClick={() => setPanelMo(!panelMo)}>
            <Icon n={panelMo ? 'chevd' : 'chevr'} className="ic sm" />
            <b>Chi tiết chứng từ {activeRow.so}</b>
            <span className="dim">({activeRow.ngay}) — {activeRow.dienGiai}</span>
            <span className="grow" />
            <button
              type="button"
              className="btn sm"
              onClick={e => { e.stopPropagation(); nav(`${path}/${activeRow.id}`) }}
            >
              Mở form toàn màn hình
            </button>
          </div>

          {panelMo && (
            <div className="ct-panel-b">
              <div className="tabs" style={{ marginBottom: 12 }}>
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

              {tabPanel === 'ct' && (
                <BangSua
                  cfg={cfg}
                  dong={activeDong}
                  cheDo="xem"
                  coKho={Boolean(bo.kho)}
                  coCk={Boolean(bo.ck)}
                />
              )}

              {tabPanel === 'ht' && (
                <HachToan
                  cfg={cfg}
                  goi={s.goi}
                  tien={activeRow.tien}
                  thue={activeRow.thue || 0}
                  dt={String(activeRow.doiTuong ?? '')}
                  cn={String(activeRow.cn ?? '')}
                />
              )}

              {tabPanel === 'khac' && (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, fontSize: 13 }}>
                  <div><b>Đối tượng:</b> {activeRow.doiTuong || '—'}</div>
                  <div><b>Chi nhánh:</b> {activeRow.cn || '—'}</div>
                  <div><b>Nguồn dữ liệu:</b> {activeRow.nguon}</div>
                  <div><b>Tổng tiền:</b> {money(activeRow.tong)} đ</div>
                  <div><b>Thuế GTGT:</b> {money(activeRow.thue || 0)} đ</div>
                  <div><b>Trạng thái:</b> {TT_CT[activeRow.tt]?.[1] ?? activeRow.tt}</div>
                </div>
              )}
            </div>
          )}
        </section>
      )}
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
