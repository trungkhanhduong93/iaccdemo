// Form chứng từ toàn màn hình theo bố cục AMIS
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps, VoucherCfg } from '../../modules/types'
import { duongDan, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { GOI, kieuGhiSo, coTrongGoi, type Goi } from '../../app/plan'
import { CHI_NHANH, KHACH, KHO, NCC, NHAN_VIEN, TK_NGAN_HANG } from '../../data/mock'
import { Icon } from '../Icon'
import { Card, Note } from '../Page'
import { FormToanMan, useDong } from '../FormToanMan'
import { Dropdown, MenuHead, MenuItem, Select } from '../Dropdown'
import { St, Table } from '../Table'
import { fold, money, moneyD } from '../format'
import { NGUON, TT_CT, dongCua, ttNghiepVu, type Dong } from './gen'
import { boO, nhomCua, theoLoai } from './nhom'
import { BangSua } from './BangSua'

export interface ChungTuFormProps extends ScreenProps {
  cfg: VoucherCfg
  row?: Row
  rows?: Row[]
  children?: React.ReactNode
}

export function ChungTuForm({ sc, mod, cfg: cfgMan, row, rows, children }: ChungTuFormProps) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const loc = useLocation()
  const [sp, setSp] = useSearchParams()

  const moi = !row
  const [dangSua, setDangSua] = useState(moi || sp.get('sua') === '1')
  const [tab, setTab] = useState('ct')
  const [hienTk, setHienTk] = useState(false)
  const [modalPhim, setModalPhim] = useState(false)

  const loai = cfgMan.loai?.find(x => x.k === (row?.loai ?? sp.get('loai'))) ?? cfgMan.loai?.[0]
  const cfg = theoLoai(cfgMan, loai?.k)
  const nhom = nhomCua(mod.key, cfg, loai?.k)
  const bo = boO(nhom, cfg)
  const nv = useMemo(() => (row ? ttNghiepVu(row) : null), [row])

  const path = duongDan(mod, sc)
  const dongForm = useDong(path)
  const kieu = kieuGhiSo(s.goi)
  const coTkGoi = s.goi === 'M' || s.goi === 'A'

  // Trạng thái thanh toán cho mua/bán
  const [hinhThucTt, setHinhThucTt] = useState<'congno' | 'tienmat' | 'chuyenkhoan'>(
    nv?.ttTien === 'da' ? 'tienmat' : 'congno'
  )
  const [nhanKemHd, setNhanKemHd] = useState(nv?.ttHd === 'da' || row?.nguon === 'HĐ')
  const [tknhChi, setTknhChi] = useState(TK_NGAN_HANG[0].so)

  // Dữ liệu dòng
  const idSeed = row ? `${sc.code ?? sc.slug}-${row.id}` : 'moi'
  const dongGoc = useMemo(() => (
    moi ? dongCua(cfg, `mau-${loai?.k ?? ''}`).slice(0, 1) : dongCua(cfg, idSeed)
  ), [idSeed, loai?.k, moi])

  const [dsDong, setDsDong] = useState<Dong[]>(dongGoc)
  useEffect(() => {
    setDsDong(dongGoc)
  }, [dongGoc])

  // Cập nhật TK nợ/có trên dòng theo hình thức thanh toán
  const tkDoiUng = hinhThucTt === 'tienmat' ? '1111' : hinhThucTt === 'chuyenkhoan' ? '1121' : (nhom === 'mua' ? '331' : '131')
  const nhanTkDong: [string, string] = nhom === 'mua'
    ? [bo.tk[0], hinhThucTt === 'congno' ? 'TK công nợ (331)' : hinhThucTt === 'tienmat' ? 'TK tiền mặt (1111)' : 'TK tiền gửi (1121)']
    : [hinhThucTt === 'congno' ? 'TK công nợ (131)' : hinhThucTt === 'tienmat' ? 'TK tiền mặt (1111)' : 'TK tiền gửi (1121)', bo.tk[1]]

  // Thông tin chung
  const [ngayCt, setNgayCt] = useState(row?.ngay ? String(row.ngay) : '07/10/2026')
  const [soCt, setSoCt] = useState(row?.so ? String(row.so) : `${cfg.prefix}2610-0261`)
  const [chiNhanh, setChiNhanh] = useState(row?.cn ? String(row.cn) : CHI_NHANH[0].ten)
  const [doiTuong, setDoiTuong] = useState(row?.doiTuong ? String(row.doiTuong) : (cfg.doiTuong === 'ncc' ? NCC[0].ten : cfg.doiTuong === 'kh' ? KHACH[0].ten : ''))
  const [dienGiai, setDienGiai] = useState(row?.dienGiai ? String(row.dienGiai) : cfg.dienGiai[0])
  const [nguoiGiao, setNguoiGiao] = useState(nv?.nguoi ?? NHAN_VIEN[0].ten)
  const [diaChi, setDiaChi] = useState(nv?.dc ?? '45 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM')
  const [mst, setMst] = useState(nv?.mst ?? '0319880101')
  const [soHd, setSoHd] = useState(nv?.soHd ?? '0012345')
  const [ngayHd, setNgayHd] = useState(nv?.ngayHd ?? '07/10/2026')
  const [kyHieuHd, setKyHieuHd] = useState(nv?.kyHieuHd ?? '1C26TMM')
  const [hanTt, setHanTt] = useState(nv?.hanTt ?? '06/11/2026')

  // Tính tổng
  const tongTien = dsDong.reduce((a, d) => a + (d.tien || 0), 0)
  const tongCk = dsDong.reduce((a, d) => a + (d.ck || 0), 0)
  const tongThue = dsDong.reduce((a, d) => a + (d.thue || 0), 0)
  const tongThanhToan = tongTien - tongCk + tongThue

  // Điều hướng Trước / Sau
  const curIdx = rows && row ? rows.findIndex(r => r.id === row.id) : -1
  const coTruoc = curIdx > 0
  const coSau = curIdx >= 0 && rows ? curIdx < rows.length - 1 : false

  function veTruoc() {
    if (coTruoc && rows) nav(`${path}/${rows[curIdx - 1].id}`, { replace: true, state: { chuyenPhieu: true } })
  }
  function veSau() {
    if (coSau && rows) nav(`${path}/${rows[curIdx + 1].id}`, { replace: true, state: { chuyenPhieu: true } })
  }

  // Lưu chứng từ
  function luu(moMoi = false) {
    toast(moi ? `Đã lưu ${soCt}` : `Đã lưu thay đổi ${soCt}`)
    if (moMoi) {
      nav(`${path}/moi${loai ? `?loai=${loai.k}` : ''}`, { replace: true })
    } else {
      setDangSua(false)
      if (moi) dongForm()
    }
  }

  // Phím tắt
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (e.shiftKey) luu(true)
        else luu(false)
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        setDangSua(true)
      } else if (e.key === 'Escape' && !modalPhim) {
        // FormToanMan tự xử lý Esc đóng form
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modalPhim, soCt, moi])

  const tabs: [string, string][] = [
    ['ct', bo.tabDau ?? 'Chi tiết'],
    ...(bo.hd ? [['hd', 'Hoá đơn'] as [string, string]] : []),
    ['ht', kieu === 'noco' ? 'Hạch toán' : 'Ghi sổ'],
    ['dk', 'Đính kèm'],
    ['ls', 'Lịch sử'],
  ]

  const ten = loai?.ten ?? tenMan(sc)
  const tieuDe = moi
    ? (loai ? `${loai.ten} mới` : cfg.them ?? 'Thêm chứng từ')
    : `${ten} ${soCt}`

  return (
    <FormToanMan
      icon={mod.icon}
      tinh={Boolean((loc.state as { chuyenPhieu?: boolean } | null)?.chuyenPhieu)}
      onClose={dongForm}
      tong={tongThanhToan}
      title={tieuDe}
      trai={
        !moi && (
          <button
            type="button"
            className="icon-btn"
            title="Xem lịch sử thao tác"
            onClick={() => setTab('ls')}
          >
            <Icon n="history" />
          </button>
        )
      }
      phai={
        <button
          type="button"
          className="icon-btn"
          title="Phím tắt: Ctrl+S lưu, Ctrl+Shift+S lưu và thêm, Ctrl+E sửa, Esc đóng"
          onClick={() => setModalPhim(m => !m)}
        >
          <Icon n="keyboard" />
        </button>
      }
      meta={
        row ? (
          <>
            {(() => {
              const [c, tx] = TT_CT[row.tt] ?? ['warn', 'Chưa ghi sổ']
              return <St k={c}>{tx}</St>
            })()}
            <span className={`src ${NGUON[row.nguon]?.[0] ?? 'tay'}`}>
              {NGUON[row.nguon]?.[1] ?? 'Thủ công'}
            </span>
            <span className="chip">{tenMan(sc)}</span>
            {dangSua && <span className="chip warn">Đang chỉnh sửa</span>}
          </>
        ) : (
          <>
            <span className="chip info">Chưa lưu</span>
            <span className="chip">Số {soCt}</span>
            <span className="chip">{tenMan(sc)}</span>
          </>
        )
      }
      loai={
        moi && cfgMan.loai && (
          <label className="fsf-loai">
            Loại phiếu
            <Select
              value={loai!.k}
              onChange={e => setSp({ loai: e.target.value }, { replace: true })}
            >
              {cfgMan.loai.map(x => (
                <option key={x.k} value={x.k}>{x.ten}</option>
              ))}
            </Select>
          </label>
        )
      }
      foot={
        dangSua ? (
          <>
            <button
              type="button"
              className="btn"
              onClick={() => (moi ? dongForm() : setDangSua(false))}
            >
              Huỷ
            </button>
            <span className="grow" />
            {coTkGoi && (
              <button
                type="button"
                className={`btn sm ${hienTk ? 'pri' : 'ghost'}`}
                onClick={() => setHienTk(!hienTk)}
              >
                <Icon n="book" className="ic sm" />
                {hienTk ? 'Ẩn cột tài khoản' : 'Hiện cột tài khoản'}
              </button>
            )}
            <button type="button" className="btn" onClick={() => luu(false)}>
              Lưu (Ctrl+S)
            </button>
            <button type="button" className="btn pri" onClick={() => luu(true)}>
              Lưu và thêm (Ctrl+Shift+S)
            </button>
          </>
        ) : (
          <>
            <div className="btn-group">
              <button
                type="button"
                className="btn sm"
                disabled={!coTruoc}
                onClick={veTruoc}
                title="Chứng từ trước"
              >
                <Icon n="chevl" className="ic sm" />Trước
              </button>
              <button
                type="button"
                className="btn sm"
                disabled={!coSau}
                onClick={veSau}
                title="Chứng từ sau"
              >
                Sau<Icon n="chevr" className="ic sm" />
              </button>
            </div>
            {coTkGoi && (
              <button
                type="button"
                className={`btn sm ${hienTk ? 'pri' : 'ghost'}`}
                onClick={() => setHienTk(!hienTk)}
              >
                <Icon n="book" className="ic sm" />
                {hienTk ? 'Ẩn cột TK' : 'Cột tài khoản'}
              </button>
            )}
            <span className="grow" />
            <button type="button" className="btn sm">
              <Icon n="printer" className="ic sm" />In
            </button>
            <Dropdown
              btnClass="btn sm"
              align="end"
              width={180}
              label={<><Icon n="more" className="ic sm" />Tiện ích</>}
            >
              <MenuItem icon="copy" onClick={() => toast('Đã nhân bản chứng từ')}>
                Nhân bản
              </MenuItem>
              <MenuItem icon="doc" onClick={() => toast('Đã xuất mẫu Excel')}>
                Xuất Excel
              </MenuItem>
              <MenuItem icon="trash" onClick={() => toast('Chứng từ chưa thể xoá')}>
                Huỷ chứng từ
              </MenuItem>
            </Dropdown>
            {kieu !== 'khong' && row && (
              <button
                type="button"
                className="btn sm"
                onClick={() => toast(row.tt === 'ghi' ? 'Đã bỏ ghi sổ' : 'Đã ghi sổ')}
              >
                {row.tt === 'ghi' ? 'Bỏ ghi sổ' : 'Ghi sổ'}
              </button>
            )}
            <button
              type="button"
              className="btn sm pri"
              onClick={() => setDangSua(true)}
            >
              <Icon n="edit" className="ic sm" />Sửa (Ctrl+E)
            </button>
            <button type="button" className="btn sm" onClick={dongForm}>
              Đóng (Esc)
            </button>
          </>
        )
      }
    >
      {/* Modal hướng dẫn phím tắt */}
      {modalPhim && (
        <div
          className="pop-backdrop"
          onClick={() => setModalPhim(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 100,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <div
            className="card"
            style={{ width: 360, padding: 18 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
              <b>Phím tắt thao tác</b>
              <button
                type="button"
                className="icon-btn sm"
                onClick={() => setModalPhim(false)}
              >
                <Icon n="x" />
              </button>
            </div>
            <div className="stack" style={{ gap: 8, fontSize: 13 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span>Lưu chứng từ:</span>
                <kbd style={{ padding: '2px 6px', background: 'var(--tint)', borderRadius: 4 }}>Ctrl + S</kbd>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span>Lưu và thêm mới:</span>
                <kbd style={{ padding: '2px 6px', background: 'var(--tint)', borderRadius: 4 }}>Ctrl + Shift + S</kbd>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span>Chuyển sang sửa:</span>
                <kbd style={{ padding: '2px 6px', background: 'var(--tint)', borderRadius: 4 }}>Ctrl + E</kbd>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span>Đóng form:</span>
                <kbd style={{ padding: '2px 6px', background: 'var(--tint)', borderRadius: 4 }}>Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phần trên: Thông tin chung kiểu AMIS */}
      <div className="stack" style={{ gap: 14 }}>
        {/* Hàng chọn hình thức thanh toán & hoá đơn cho nhóm mua/bán */}
        {bo.tt && (
          <section className="card" style={{ padding: '10px 16px' }}>
            <div className="row" style={{ gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Thanh toán:</span>
                <label className="row" style={{ gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="radio"
                    name="hinhThucTt"
                    disabled={!dangSua}
                    checked={hinhThucTt === 'congno'}
                    onChange={() => setHinhThucTt('congno')}
                  />
                  Chưa thanh toán
                </label>
                <label className="row" style={{ gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="radio"
                    name="hinhThucTt"
                    disabled={!dangSua}
                    checked={hinhThucTt === 'tienmat'}
                    onChange={() => setHinhThucTt('tienmat')}
                  />
                  Tiền mặt ngay
                </label>
                <label className="row" style={{ gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="radio"
                    name="hinhThucTt"
                    disabled={!dangSua}
                    checked={hinhThucTt === 'chuyenkhoan'}
                    onChange={() => setHinhThucTt('chuyenkhoan')}
                  />
                  Chuyển khoản ngay
                </label>
              </div>

              {hinhThucTt === 'chuyenkhoan' && (
                <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Tài khoản ngân hàng:</span>
                  <Select
                    className="inp sm"
                    disabled={!dangSua}
                    value={tknhChi}
                    onChange={e => setTknhChi(e.target.value)}
                  >
                    {TK_NGAN_HANG.map(tk => (
                      <option key={tk.so} value={tk.so}>{tk.so} - {tk.nh}</option>
                    ))}
                  </Select>
                </div>
              )}

              <span className="grow" />

              <label className="row" style={{ gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  disabled={!dangSua}
                  checked={nhanKemHd}
                  onChange={e => setNhanKemHd(e.target.checked)}
                />
                {nhom === 'mua' ? 'Nhận kèm hoá đơn' : 'Lập kèm hoá đơn'}
              </label>
            </div>
          </section>
        )}

        {/* Khối thông tin chung 3 cột: Đối tượng / Thông tin phụ / Chứng từ */}
        <section className="card" style={{ padding: '14px 16px' }}>
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1.2fr) 280px',
              gap: 16,
              alignItems: 'start',
            }}
          >
            {/* Cột 1: Đối tượng */}
            <div className="stack" style={{ gap: 10 }}>
              <div className="f">
                <label>{cfg.nhan ?? 'Đối tượng'} <em>*</em></label>
                {dangSua ? (
                  <input
                    className="inp"
                    value={doiTuong}
                    onChange={e => setDoiTuong(e.target.value)}
                    placeholder="Mã hoặc tên đối tượng"
                  />
                ) : (
                  <input className="inp" readOnly value={doiTuong} />
                )}
              </div>
              <div className="f">
                <label>{nhom === 'mua' ? 'Người giao hàng' : nhom === 'ban' ? 'Người mua hàng' : 'Người giao / nhận'}</label>
                {dangSua ? (
                  <input
                    className="inp"
                    value={nguoiGiao}
                    onChange={e => setNguoiGiao(e.target.value)}
                  />
                ) : (
                  <input className="inp" readOnly value={nguoiGiao} />
                )}
              </div>
              <div className="f">
                <label>Địa chỉ</label>
                {dangSua ? (
                  <input
                    className="inp"
                    value={diaChi}
                    onChange={e => setDiaChi(e.target.value)}
                  />
                ) : (
                  <input className="inp" readOnly value={diaChi} />
                )}
              </div>
            </div>

            {/* Cột 2: Diễn giải & điều khoản */}
            <div className="stack" style={{ gap: 10 }}>
              <div className="f">
                <label>Diễn giải</label>
                {dangSua ? (
                  <input
                    className="inp"
                    value={dienGiai}
                    onChange={e => setDienGiai(e.target.value)}
                  />
                ) : (
                  <input className="inp" readOnly value={dienGiai} />
                )}
              </div>
              <div className="f">
                <label>Nhân viên thực hiện</label>
                <Select className="inp" disabled={!dangSua}>
                  {NHAN_VIEN.map(n => (
                    <option key={n.ma} value={n.ten}>{n.ten} ({n.bp})</option>
                  ))}
                </Select>
              </div>
              <div className="row" style={{ gap: 10 }}>
                <div className="f" style={{ flex: 1 }}>
                  <label>Mã số thuế</label>
                  {dangSua ? (
                    <input
                      className="inp"
                      value={mst}
                      onChange={e => setMst(e.target.value)}
                    />
                  ) : (
                    <input className="inp" readOnly value={mst} />
                  )}
                </div>
                {bo.tt && hinhThucTt === 'congno' && (
                  <div className="f" style={{ flex: 1 }}>
                    <label>Hạn thanh toán</label>
                    {dangSua ? (
                      <input
                        className="inp"
                        value={hanTt}
                        onChange={e => setHanTt(e.target.value)}
                      />
                    ) : (
                      <input className="inp" readOnly value={hanTt} />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Cột 3: Ngày hạch toán, số chứng từ, chi nhánh */}
            <div className="stack" style={{ gap: 10 }}>
              <div className="f">
                <label>Ngày chứng từ <em>*</em></label>
                {dangSua ? (
                  <input
                    className="inp"
                    value={ngayCt}
                    onChange={e => setNgayCt(e.target.value)}
                  />
                ) : (
                  <input className="inp" readOnly value={ngayCt} />
                )}
              </div>
              <div className="f">
                <label>{bo.so ?? 'Số chứng từ'}</label>
                <input className="inp code" readOnly value={soCt} />
              </div>
              <div className="f">
                <label>Chi nhánh lập</label>
                {dangSua ? (
                  <Select
                    className="inp"
                    value={chiNhanh}
                    onChange={e => setChiNhanh(e.target.value)}
                  >
                    {CHI_NHANH.map(c => (
                      <option key={c.id} value={c.ten}>{c.ten}</option>
                    ))}
                  </Select>
                ) : (
                  <input className="inp" readOnly value={chiNhanh} />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Khối Tabs chi tiết */}
        <section className="card">
          <div className="tabs">
            {tabs.map(([k, l]) => (
              <button
                key={k}
                type="button"
                className={tab === k ? 'on' : ''}
                onClick={() => setTab(k)}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Tab 1: Chi tiết / Hàng tiền */}
          {tab === 'ct' && (
            <BangSua
              cfg={cfg}
              dong={dsDong}
              onChange={setDsDong}
              cheDo={dangSua ? 'sua' : 'xem'}
              coTk={hienTk}
              nhanTk={nhanTkDong}
              coKho={Boolean(bo.kho)}
              coCk={Boolean(bo.ck)}
              coLo={nhom === 'mua'}
            />
          )}

          {/* Tab 2: Hoá đơn */}
          {tab === 'hd' && (
            <div style={{ padding: 16 }}>
              <div className="form-grid" style={{ maxWidth: 720 }}>
                <div className="f">
                  <label>Mẫu số hoá đơn</label>
                  <input className="inp" defaultValue="1" disabled={!dangSua} />
                </div>
                <div className="f">
                  <label>Ký hiệu hoá đơn</label>
                  <input className="inp code" value={kyHieuHd} onChange={e => setKyHieuHd(e.target.value)} disabled={!dangSua} />
                </div>
                <div className="f">
                  <label>Số hoá đơn</label>
                  <input className="inp code" value={soHd} onChange={e => setSoHd(e.target.value)} disabled={!dangSua} />
                </div>
                <div className="f">
                  <label>Ngày hoá đơn</label>
                  <input className="inp" value={ngayHd} onChange={e => setNgayHd(e.target.value)} disabled={!dangSua} />
                </div>
                <div className="f c2">
                  <label>Nhà phát hành / Cơ quan thuế</label>
                  <input className="inp" defaultValue="iPOS Invoice điện tử có mã của cơ quan thuế" readOnly />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Hạch toán */}
          {tab === 'ht' && (
            <div style={{ padding: 14 }}>
              <HachToan
                cfg={cfg}
                goi={s.goi}
                tien={tongTien - tongCk}
                thue={tongThue}
                dt={doiTuong}
                cn={chiNhanh}
                tkDoiUng={tkDoiUng}
              />
            </div>
          )}

          {/* Tab 4: Đính kèm */}
          {tab === 'dk' && (
            <div className="empty" style={{ padding: 32 }}>
              <div style={{ marginBottom: 8, opacity: 0.5 }}><Icon n="upload" className="ic lg" /></div>
              <b>Chưa có tệp đính kèm</b>
              Kéo thả hoá đơn điện tử, phiếu giao nhận vào đây (PDF, XML, JPG)
            </div>
          )}

          {/* Tab 5: Lịch sử thao tác */}
          {tab === 'ls' && <LichSu goi={s.goi} moi={moi} />}

          {/* Khối tổng cộng góc dưới phải */}
          <div className="tot" style={{ borderTop: '1px solid var(--line)', marginTop: 12 }}>
            <span>Tiền hàng</span>
            <b>{moneyD(tongTien)}</b>
            {bo.ck && tongCk > 0 && (
              <>
                <span>Chiết khấu</span>
                <b style={{ color: 'var(--red)' }}>-{moneyD(tongCk)}</b>
              </>
            )}
            {tongThue > 0 && (
              <>
                <span>Tiền thuế GTGT</span>
                <b>{moneyD(tongThue)}</b>
              </>
            )}
            {bo.tongNhap && (
              <>
                <span>Giá trị nhập kho</span>
                <b>{moneyD(tongTien - tongCk)}</b>
              </>
            )}
            <span>Tổng thanh toán</span>
            <b className="big" style={{ color: 'var(--blue)' }}>{moneyD(tongThanhToan)}</b>
          </div>
        </section>

        {children}
      </div>
    </FormToanMan>
  )
}

/** Hạch toán theo gói: Free không hạch toán, Starter ghi sổ TT58, Medium/Advance Nợ/Có */
export function HachToan({
  cfg,
  goi,
  tien,
  thue,
  dt,
  cn,
  tkDoiUng,
}: {
  cfg: VoucherCfg
  goi: Goi
  tien: number
  thue: number
  dt: string
  cn: string
  tkDoiUng?: string
}) {
  const kieu = kieuGhiSo(goi)
  if (kieu === 'khong') {
    return (
      <Note kind="gray" icon="info">
        Gói Free chưa áp chế độ kế toán nên phiếu không sinh bút toán. Số tiền vẫn vào sổ quỹ và sổ công nợ.{' '}
        <Link to="/app/he-thong/goi-thue-bao">So sánh gói</Link>
      </Note>
    )
  }

  if (kieu === 'so') {
    return (
      <div className="stack" style={{ gap: 10 }}>
        <Note icon="book">Gói Starter theo {GOI.S.cheDo}: không dùng tài khoản Nợ/Có. Phiếu ghi thẳng vào sổ.</Note>
        <Table
          cols={[{ k: 'so', t: 'Ghi vào sổ' }, { k: 'cot', t: 'Cột' }, { k: 'tien', t: 'Số tiền', num: true }]}
          rows={[
            { so: cfg.soTT58 ?? 'Sổ chi phí sản xuất, kinh doanh', cot: 'Phát sinh', tien },
            ...(thue ? [{ so: 'Sổ theo dõi thuế', cot: 'Thuế GTGT', tien: thue }] : []),
            { so: 'Sổ tiền', cot: 'Thu, chi', tien: tien + thue },
          ]}
        />
      </div>
    )
  }

  const mau = cfg.noCo ?? [['642', '111', 'Chi phí']]
  const rows = mau.map(([no, co, dg]) => {
    const l = fold(dg)
    const v = l.includes('thue')
      ? thue
      : l.includes('gia von')
      ? Math.round(tien * 0.35)
      : l.includes('thanh toan')
      ? tien + thue
      : tien

    // Nếu có tkDoiUng thì thay thế TK công nợ
    let noFinal = no
    let coFinal = co
    if (tkDoiUng) {
      if (co === '331' || co === '111' || co === '112') coFinal = tkDoiUng
      if (no === '131' || no === '111' || no === '112') noFinal = tkDoiUng
    }

    return { no: noFinal, co: coFinal, dg, tien: v, dt, cn }
  }).filter(r => r.tien > 0)

  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="row" style={{ fontSize: 12.5 }}>
        <Icon n="book" className="ic sm" />Định khoản theo bộ mặc định ngành F&B, chế độ {GOI[goi].cheDo}. Sửa được trước khi ghi sổ.
      </div>
      <Table
        cols={[
          { k: 'dg', t: 'Diễn giải' },
          { k: 'no', t: 'TK Nợ', cls: 'code', w: 80 },
          { k: 'co', t: 'TK Có', cls: 'code', w: 80 },
          { k: 'tien', t: 'Số tiền', num: true },
          { k: 'dt', t: 'Đối tượng', cls: 'dim' },
          { k: 'cn', t: 'Chi nhánh', cls: 'dim' },
        ]}
        rows={rows}
        sum={{ dg: 'Cộng', tien: rows.reduce((a, r) => a + r.tien, 0) }}
      />
    </div>
  )
}

export function LichSu({ goi, moi }: { goi: Goi; moi: boolean }) {
  if (moi) return <div className="empty"><b>Chứng từ chưa lưu</b></div>
  if (!coTrongGoi('X2', goi)) {
    return (
      <div style={{ padding: 14 }}>
        <Note kind="gray" icon="lock">
          Nhật ký thao tác có từ gói Starter. <Link to="/app/he-thong/goi-thue-bao">So sánh gói</Link>
        </Note>
      </div>
    )
  }
  return (
    <Table
      cols={[{ k: 'luc', t: 'Thời điểm', w: 140 }, { k: 'ai', t: 'Người làm' }, { k: 'viec', t: 'Thao tác' }]}
      rows={[
        { luc: '07/10/2026 10:05', ai: 'Lê Quốc Bảo', viec: 'Ghi sổ' },
        { luc: '07/10/2026 09:58', ai: 'Lê Quốc Bảo', viec: 'Sửa diễn giải' },
        { luc: '06/10/2026 23:30', ai: 'Đồng bộ tự động', viec: 'Tạo chứng từ từ dữ liệu đồng bộ' },
      ]}
    />
  )
}

// Giữ tương thích với VoucherDetail
export const VoucherDetail = ChungTuForm
