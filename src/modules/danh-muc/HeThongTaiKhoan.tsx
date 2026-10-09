// Màn danh mục Hệ thống tài khoản (1.1): bảng cây chuyên nghiệp theo chế độ kế toán (TT133, TT99) và panel thêm / sửa (T76)
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Col, Row, ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { CHE_DO } from '../../app/che-do'
import { Icon } from '../../ui/Icon'
import { PageHead } from '../../ui/Page'
import { Table } from '../../ui/Table'
import { fold } from '../../ui/format'
import { ThanhLoc } from '../../ui/ThanhLoc'
import { heThongTk, type TaiKhoanDef, type TinhChatTk } from './he-thong-tk'
import { TEN_ANH } from './he-thong-tk-en'

/** Các ô đánh dấu theo dõi chi tiết suy theo số tài khoản */
export function dsTheoDoiChiTiet(so: string): string[] {
  const ds: string[] = []
  if (so === '111' || so === '1111') ds.push('Quỹ')
  if (so.startsWith('131') || so.startsWith('331')) ds.push('Đối tượng', 'Theo dõi thanh toán')
  if (so.startsWith('152') || so.startsWith('153') || so.startsWith('155') || so.startsWith('156')) ds.push('Vật tư, hàng hoá', 'Số lượng')
  if (so === '1121' || so === '1122' || so.startsWith('112')) ds.push('Tài khoản ngân hàng')
  if (so === '1112' || so === '1122') ds.push('Ngoại tệ')
  if (so.startsWith('133') || so.startsWith('3331')) ds.push('Thuế GTGT')
  if (so.startsWith('154') || so.startsWith('631')) ds.push('Công việc', 'Thành phẩm')
  if (so.startsWith('641') || so.startsWith('642')) ds.push('Khoản mục chi phí')
  return ds
}

interface FormState {
  so: string
  ten: string
  cha: string
  cap: number
  tinhChat: TinhChatTk
  loai: string
  dienGiai: string
  dangDung: boolean
  coNgoaiTe: boolean
  loaiTien: string
  tyGiaXuat: string
  doiTuong: boolean
  vatTu: boolean
  soLuong: boolean
  khoanMuc: boolean
  congViec: boolean
  thanhPham: boolean
  thueVat: boolean
  thanhToan: boolean
  ngoaiBang: boolean
  nganHang: boolean
  tenNganHang: string
  chiNhanh: string
  soTkNganHang: string
  tenAnh: string
  tenNhat: string
  tenHan: string
}

function taoMacDinh(tk?: TaiKhoanDef | null): FormState {
  if (!tk) {
    return {
      so: '',
      ten: '',
      cha: '',
      cap: 1,
      tinhChat: 'Dư Nợ',
      loai: 'Tài sản ngắn hạn',
      dienGiai: '',
      dangDung: true,
      coNgoaiTe: false,
      loaiTien: 'USD',
      tyGiaXuat: 'Bình quân gia quyền',
      doiTuong: false,
      vatTu: false,
      soLuong: false,
      khoanMuc: false,
      congViec: false,
      thanhPham: false,
      thueVat: false,
      thanhToan: false,
      ngoaiBang: false,
      nganHang: false,
      tenNganHang: '',
      chiNhanh: '',
      soTkNganHang: '',
      tenAnh: '',
      tenNhat: '',
      tenHan: '',
    }
  }

  const s = tk.so
  const isDoiTuong = s.startsWith('131') || s.startsWith('331')
  const isThanhToan = isDoiTuong
  const isVatTu = s.startsWith('152') || s.startsWith('153') || s.startsWith('155') || s.startsWith('156')
  const isSoLuong = isVatTu
  const isNganHang = s === '1121' || s === '1122' || s.startsWith('112')
  const isNgoaiTe = s === '1112' || s === '1122'
  const isThueVat = s.startsWith('133') || s.startsWith('3331')
  const isCongViec = s.startsWith('154') || s.startsWith('631')
  const isThanhPham = isCongViec
  const isKhoanMuc = s.startsWith('641') || s.startsWith('642')

  return {
    so: tk.so,
    ten: tk.ten,
    cha: tk.cha || '',
    cap: tk.cap,
    tinhChat: tk.tinhChat,
    loai: tk.loai,
    dienGiai: '',
    dangDung: true,
    coNgoaiTe: isNgoaiTe,
    loaiTien: isNgoaiTe ? 'USD' : 'VND',
    tyGiaXuat: 'Bình quân gia quyền',
    doiTuong: isDoiTuong,
    vatTu: isVatTu,
    soLuong: isSoLuong,
    khoanMuc: isKhoanMuc,
    congViec: isCongViec,
    thanhPham: isThanhPham,
    thueVat: isThueVat,
    thanhToan: isThanhToan,
    ngoaiBang: s.startsWith('00'),
    nganHang: isNganHang,
    tenNganHang: isNganHang ? 'Vietcombank' : '',
    chiNhanh: isNganHang ? 'Sở giao dịch' : '',
    soTkNganHang: isNganHang ? '0011001234567' : '',
    tenAnh: TEN_ANH[tk.so] || '',
    tenNhat: '',
    tenHan: '',
  }
}

export function HeThongTaiKhoan({ sc, mod }: ScreenProps) {
  const { s, toast } = useSession()
  const cdDef = CHE_DO[s.cheDo]
  const all = useMemo(() => heThongTk(s.cheDo), [s.cheDo])
  const bySo = useMemo(() => new Map(all.map(t => [t.so, t])), [all])

  const [q, setQ] = useState('')
  const [moRong, setMoRong] = useState<Set<string>>(() => new Set())
  const [panelOpen, setPanelOpen] = useState(false)
  const [dangSua, setDangSua] = useState<TaiKhoanDef | null>(null)
  const [form, setForm] = useState<FormState>(() => taoMacDinh(null))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [moKhoi, setMoKhoi] = useState({
    thongTin: true,
    theoDoi: true,
    ngoaiTe: false,
    nganHang: false,
    ngonNgu: false,
  })

  // Mặc định mở hết cấp 1
  useEffect(() => {
    const s1 = new Set<string>()
    for (const tk of all) {
      if (tk.cap === 1 && tk.laCha) s1.add(tk.so)
    }
    setMoRong(s1)
  }, [all])

  const moRongHet = () => {
    setMoRong(new Set(all.filter(t => t.laCha).map(t => t.so)))
  }

  const thuGonHet = () => {
    setMoRong(new Set())
  }

  const toggleMoRong = (so: string) => {
    setMoRong(prev => {
      const next = new Set(prev)
      if (next.has(so)) next.delete(so)
      else next.add(so)
      return next
    })
  }

  // Lọc theo tìm kiếm và mở rộng cha khi con khớp
  const { rows, khopCount } = useMemo(() => {
    const tuKhoa = q.trim()
    if (!tuKhoa) {
      const ds = all.filter(tk => {
        let cha = tk.cha
        while (cha) {
          if (!moRong.has(cha)) return false
          cha = bySo.get(cha)?.cha
        }
        return true
      })
      return { rows: ds, khopCount: all.length }
    }

    const fq = fold(tuKhoa)
    const khop = new Set<string>()
    for (const tk of all) {
      const en = TEN_ANH[tk.so] || ''
      if (fold(`${tk.so} ${tk.ten} ${en}`).includes(fq)) {
        khop.add(tk.so)
      }
    }

    const hien = new Set<string>()
    for (const so of khop) {
      hien.add(so)
      let cha = bySo.get(so)?.cha
      while (cha) {
        hien.add(cha)
        cha = bySo.get(cha)?.cha
      }
    }

    const ds = all.filter(tk => hien.has(tk.so))
    return { rows: ds, khopCount: khop.size }
  }, [all, q, moRong, bySo])

  const moThem = () => {
    setDangSua(null)
    setForm(taoMacDinh(null))
    setErrors({})
    setMoKhoi({ thongTin: true, theoDoi: true, ngoaiTe: false, nganHang: false, ngonNgu: false })
    setPanelOpen(true)
  }

  const moSua = (tk: TaiKhoanDef) => {
    setDangSua(tk)
    setForm(taoMacDinh(tk))
    setErrors({})
    setMoKhoi({ thongTin: true, theoDoi: true, ngoaiTe: false, nganHang: false, ngonNgu: false })
    setPanelOpen(true)
  }

  const dongPanel = useCallback(() => {
    setPanelOpen(false)
  }, [])

  // Đóng panel bằng phím Esc
  useEffect(() => {
    if (!panelOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dongPanel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelOpen, dongPanel])

  const handleChaChange = (chaSo: string) => {
    const chaTk = bySo.get(chaSo)
    const capMoi = chaTk ? chaTk.cap + 1 : 1
    setForm(f => {
      const soHienTai = f.so
      let soMoi = soHienTai
      if (chaSo && !soHienTai.startsWith(chaSo)) {
        soMoi = chaSo
      }
      return {
        ...f,
        cha: chaSo,
        cap: capMoi,
        so: soMoi,
        tinhChat: chaTk ? chaTk.tinhChat : f.tinhChat,
        loai: chaTk ? chaTk.loai : f.loai,
      }
    })
    setErrors(e => ({ ...e, so: '' }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.so.trim()) {
      errs.so = 'Vui lòng nhập số tài khoản'
    } else if (form.cha && !form.so.startsWith(form.cha)) {
      errs.so = `Số tài khoản phải bắt đầu bằng ${form.cha}`
    }
    if (!form.ten.trim()) {
      errs.ten = 'Vui lòng nhập tên tài khoản'
    }
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      setMoKhoi(k => ({ ...k, thongTin: true }))
      return false
    }
    return true
  }

  const handleLuu = (themTiep: boolean) => {
    if (!validate()) return
    toast(`Đã lưu tài khoản ${form.so}`)
    if (themTiep) {
      setDangSua(null)
      setForm(taoMacDinh(null))
      setErrors({})
    } else {
      dongPanel()
    }
  }

  const cols: Col[] = [
    {
      k: 'so',
      t: 'Số tài khoản',
      w: 190,
      cls: 'code',
      r: (r: Row) => {
        const isExp = q.trim() ? true : moRong.has(r.so)
        return (
          <div style={{ paddingLeft: (r.cap - 1) * 20, display: 'inline-flex', alignItems: 'center' }}>
            {r.laCha ? (
              <button
                type="button"
                className="tk-nut-cay"
                title={isExp ? 'Thu gọn' : 'Mở rộng'}
                onClick={e => {
                  e.stopPropagation()
                  toggleMoRong(r.so)
                }}
              >
                {isExp ? '⊟' : '⊞'}
              </button>
            ) : (
              <span className="tk-spacer" />
            )}
            <span className={r.laCha ? 'tk-so-cha' : 'code'}>{r.so}</span>
          </div>
        )
      },
    },
    {
      k: 'ten',
      t: 'Tên tài khoản',
      r: (r: Row) => (
        <span style={{ fontWeight: r.laCha ? 700 : 400, color: r.laCha ? 'var(--ink)' : 'inherit' }}>
          {r.ten}
        </span>
      ),
    },
    {
      k: 'tinhChat',
      t: 'Tính chất',
      w: 130,
    },
    {
      k: 'tenAnh',
      t: 'Tên tiếng Anh',
      w: 220,
      r: (r: Row) => <span className="muted">{TEN_ANH[r.so] ?? ''}</span>,
    },
    {
      k: 'chiTiet',
      t: 'Theo dõi chi tiết',
      w: 230,
      r: (r: Row) => {
        const ct = dsTheoDoiChiTiet(r.so)
        return <span className="muted pn-chu-nho">{ct.join(', ')}</span>
      },
    },
    {
      k: 'trangThai',
      t: 'Trạng thái',
      w: 120,
      c: true,
      r: () => <span className="chip ok">Đang dùng</span>,
    },
  ]

  const ten = tenMan(sc)

  return (
    <div className="page">
      <PageHead
        title={ten}
        meta={
          <>
            <span className="chip info">{cdDef.ngan}</span>
            {cdDef.choDuyet && <span className="chip warn">Chờ kế toán trưởng duyệt</span>}
          </>
        }
      />

      <section className="card tk-tbl-wrap">
        <ThanhLoc
          tim={{
            value: q,
            onChange: setQ,
            placeholder: 'Tìm số, tên TK',
          }}
          phai={
            <div className="row" style={{ gap: 8 }}>
              <button type="button" className="btn sm" onClick={moRongHet}>Mở rộng hết</button>
              <button type="button" className="btn sm" onClick={thuGonHet}>Thu gọn hết</button>
              <button type="button" className="btn" onClick={() => toast(`Đã xuất ${all.length} tài khoản ra Excel`)}>
                <Icon n="download" className="ic sm" />Xuất
              </button>
              <button type="button" className="btn pri" onClick={moThem}>
                <Icon n="plus" className="ic sm" />Thêm tài khoản
              </button>
            </div>
          }
        />

        {rows.length > 0 ? (
          <Table
            cols={cols}
            rows={rows}
            motDong
            onRow={r => moSua(r as unknown as TaiKhoanDef)}
            rowCls={r => r.laCha ? 'tk-row-cha click' : 'click'}
          />
        ) : (
          <div className="empty">
            <b>Không tìm thấy tài khoản phù hợp</b>
            <button type="button" className="btn sm" style={{ marginTop: 10 }} onClick={() => setQ('')}>Xoá tìm kiếm</button>
          </div>
        )}

        <div className="tbl-foot">
          <span>{q.trim() ? `Tổng: ${khopCount} tài khoản` : `Tổng: ${all.length} tài khoản`}</span>
        </div>
      </section>

      {panelOpen && (
        <>
          <div className="overlay" style={{ padding: 0 }} onClick={dongPanel} />
          <aside className="pn-hop">
            <div className="pn-dau">
              <div>
                <h3>{dangSua ? `Sửa tài khoản: ${dangSua.so}` : 'Thêm tài khoản'}</h3>
                <small className="muted">{ten}</small>
              </div>
              <button type="button" className="icon-btn" onClick={dongPanel} aria-label="Đóng"><Icon n="x" /></button>
            </div>

            <div className="pn-than">
              {/* Khối 1: Thông tin chung */}
              <div className={`pn-khoi${moKhoi.thongTin ? ' mo' : ''}`}>
                <div
                  className="pn-khoi-dau"
                  onClick={() => setMoKhoi(k => ({ ...k, thongTin: !k.thongTin }))}
                >
                  <span>Thông tin chung</span>
                  <Icon n={moKhoi.thongTin ? 'chevd' : 'chevr'} className="ic sm" />
                </div>
                {moKhoi.thongTin && (
                  <div className="pn-khoi-than">
                    <div className="pn-luoi">
                      <div className="f">
                        <label>Số tài khoản <em>*</em></label>
                        <input
                          className="inp"
                          value={form.so}
                          onChange={e => {
                            setForm(f => ({ ...f, so: e.target.value }))
                            setErrors(err => ({ ...err, so: '' }))
                          }}
                        />
                        {errors.so && <span className="muted pn-loi">{errors.so}</span>}
                      </div>
                      <div className="f pn-hang-dai">
                        <label>Tên tài khoản <em>*</em></label>
                        <input
                          className="inp"
                          value={form.ten}
                          onChange={e => {
                            setForm(f => ({ ...f, ten: e.target.value }))
                            setErrors(err => ({ ...err, ten: '' }))
                          }}
                        />
                        {errors.ten && <span className="muted pn-loi">{errors.ten}</span>}
                      </div>
                      <div className="f">
                        <label>Tài khoản tổng hợp</label>
                        <select
                          className="inp"
                          value={form.cha}
                          onChange={e => handleChaChange(e.target.value)}
                        >
                          <option value="">(Không có - Cấp 1)</option>
                          {all.map(t => (
                            <option key={t.so} value={t.so}>{t.so} - {t.ten}</option>
                          ))}
                        </select>
                      </div>
                      <div className="f">
                        <label>Cấp</label>
                        <input className="inp" value={form.cap} readOnly />
                      </div>
                      <div className="f">
                        <label>Tính chất <em>*</em></label>
                        <select
                          className="inp"
                          value={form.tinhChat}
                          onChange={e => setForm(f => ({ ...f, tinhChat: e.target.value as TinhChatTk }))}
                        >
                          <option value="Dư Nợ">Dư Nợ</option>
                          <option value="Dư Có">Dư Có</option>
                          <option value="Lưỡng tính">Lưỡng tính</option>
                          <option value="Không số dư">Không số dư</option>
                        </select>
                      </div>
                      <div className="f">
                        <label>Loại tài khoản</label>
                        <input
                          className="inp"
                          value={form.loai}
                          onChange={e => setForm(f => ({ ...f, loai: e.target.value }))}
                        />
                      </div>
                      <div className="f pn-hang-dai">
                        <label>Diễn giải</label>
                        <textarea
                          className="inp"
                          rows={2}
                          value={form.dienGiai}
                          onChange={e => setForm(f => ({ ...f, dienGiai: e.target.value }))}
                        />
                      </div>
                      <div className="f pn-hang-dai">
                        <label className="row pn-tich">
                          <input
                            type="checkbox"
                            checked={form.dangDung}
                            onChange={e => setForm(f => ({ ...f, dangDung: e.target.checked }))}
                          />
                          Đang sử dụng
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Khối 2: Ngoại tệ */}
              <div className={`pn-khoi${moKhoi.ngoaiTe ? ' mo' : ''}`}>
                <div
                  className="pn-khoi-dau"
                  onClick={() => setMoKhoi(k => ({ ...k, ngoaiTe: !k.ngoaiTe }))}
                >
                  <span>Ngoại tệ</span>
                  <Icon n={moKhoi.ngoaiTe ? 'chevd' : 'chevr'} className="ic sm" />
                </div>
                {moKhoi.ngoaiTe && (
                  <div className="pn-khoi-than">
                    <div className="pn-luoi">
                      <div className="f pn-hang-dai">
                        <label className="row pn-tich">
                          <input
                            type="checkbox"
                            checked={form.coNgoaiTe}
                            onChange={e => setForm(f => ({ ...f, coNgoaiTe: e.target.checked }))}
                          />
                          Có hạch toán ngoại tệ
                        </label>
                      </div>
                      <div className="f">
                        <label>Loại tiền</label>
                        <select
                          className="inp"
                          disabled={!form.coNgoaiTe}
                          value={form.loaiTien}
                          onChange={e => setForm(f => ({ ...f, loaiTien: e.target.value }))}
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="VND">VND</option>
                        </select>
                      </div>
                      <div className="f">
                        <label>Cách tính tỷ giá xuất</label>
                        <select
                          className="inp"
                          disabled={!form.coNgoaiTe}
                          value={form.tyGiaXuat}
                          onChange={e => setForm(f => ({ ...f, tyGiaXuat: e.target.value }))}
                        >
                          <option value="Bình quân gia quyền">Bình quân gia quyền</option>
                          <option value="Đích danh">Đích danh</option>
                          <option value="Nhập trước xuất trước">Nhập trước xuất trước</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Khối 3: Theo dõi chi tiết theo */}
              <div className={`pn-khoi${moKhoi.theoDoi ? ' mo' : ''}`}>
                <div
                  className="pn-khoi-dau"
                  onClick={() => setMoKhoi(k => ({ ...k, theoDoi: !k.theoDoi }))}
                >
                  <span>Theo dõi chi tiết theo</span>
                  <Icon n={moKhoi.theoDoi ? 'chevd' : 'chevr'} className="ic sm" />
                </div>
                {moKhoi.theoDoi && (
                  <div className="pn-khoi-than">
                    <div className="pn-luoi">
                      <label className="row pn-tich">
                        <input
                          type="checkbox"
                          checked={form.doiTuong}
                          onChange={e => setForm(f => ({ ...f, doiTuong: e.target.checked }))}
                        />
                        Đối tượng
                      </label>
                      <label className="row pn-tich">
                        <input
                          type="checkbox"
                          checked={form.vatTu}
                          onChange={e => setForm(f => ({ ...f, vatTu: e.target.checked }))}
                        />
                        Vật tư, hàng hoá
                      </label>
                      <label className="row pn-tich">
                        <input
                          type="checkbox"
                          checked={form.soLuong}
                          onChange={e => setForm(f => ({ ...f, soLuong: e.target.checked }))}
                        />
                        Theo dõi số lượng
                      </label>
                      <label className="row pn-tich">
                        <input
                          type="checkbox"
                          checked={form.khoanMuc}
                          onChange={e => setForm(f => ({ ...f, khoanMuc: e.target.checked }))}
                        />
                        Khoản mục chi phí
                      </label>
                      <label className="row pn-tich">
                        <input
                          type="checkbox"
                          checked={form.congViec}
                          onChange={e => setForm(f => ({ ...f, congViec: e.target.checked }))}
                        />
                        Công việc, công trình
                      </label>
                      <label className="row pn-tich">
                        <input
                          type="checkbox"
                          checked={form.thanhPham}
                          onChange={e => setForm(f => ({ ...f, thanhPham: e.target.checked }))}
                        />
                        Thành phẩm
                      </label>
                      <label className="row pn-tich">
                        <input
                          type="checkbox"
                          checked={form.thueVat}
                          onChange={e => setForm(f => ({ ...f, thueVat: e.target.checked }))}
                        />
                        Thuế GTGT
                      </label>
                      <label className="row pn-tich">
                        <input
                          type="checkbox"
                          checked={form.thanhToan}
                          onChange={e => setForm(f => ({ ...f, thanhToan: e.target.checked }))}
                        />
                        Theo dõi thanh toán
                      </label>
                      <label className="row pn-tich">
                        <input
                          type="checkbox"
                          checked={form.ngoaiBang}
                          onChange={e => setForm(f => ({ ...f, ngoaiBang: e.target.checked }))}
                        />
                        Tài khoản ngoại bảng
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Khối 4: Tài khoản ngân hàng */}
              <div className={`pn-khoi${moKhoi.nganHang ? ' mo' : ''}`}>
                <div
                  className="pn-khoi-dau"
                  onClick={() => setMoKhoi(k => ({ ...k, nganHang: !k.nganHang }))}
                >
                  <span>Tài khoản ngân hàng</span>
                  <Icon n={moKhoi.nganHang ? 'chevd' : 'chevr'} className="ic sm" />
                </div>
                {moKhoi.nganHang && (
                  <div className="pn-khoi-than">
                    <div className="pn-luoi">
                      <div className="f pn-hang-dai">
                        <label className="row pn-tich">
                          <input
                            type="checkbox"
                            checked={form.nganHang}
                            onChange={e => setForm(f => ({ ...f, nganHang: e.target.checked }))}
                          />
                          Theo dõi theo tài khoản ngân hàng
                        </label>
                      </div>
                      {form.nganHang && (
                        <>
                          <div className="f">
                            <label>Ngân hàng</label>
                            <input
                              className="inp"
                              value={form.tenNganHang}
                              onChange={e => setForm(f => ({ ...f, tenNganHang: e.target.value }))}
                            />
                          </div>
                          <div className="f">
                            <label>Chi nhánh</label>
                            <input
                              className="inp"
                              value={form.chiNhanh}
                              onChange={e => setForm(f => ({ ...f, chiNhanh: e.target.value }))}
                            />
                          </div>
                          <div className="f pn-hang-dai">
                            <label>Số tài khoản ngân hàng</label>
                            <input
                              className="inp"
                              value={form.soTkNganHang}
                              onChange={e => setForm(f => ({ ...f, soTkNganHang: e.target.value }))}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Khối 5: Tên theo ngôn ngữ */}
              <div className={`pn-khoi${moKhoi.ngonNgu ? ' mo' : ''}`}>
                <div
                  className="pn-khoi-dau"
                  onClick={() => setMoKhoi(k => ({ ...k, ngonNgu: !k.ngonNgu }))}
                >
                  <span>Tên theo ngôn ngữ</span>
                  <Icon n={moKhoi.ngonNgu ? 'chevd' : 'chevr'} className="ic sm" />
                </div>
                {moKhoi.ngonNgu && (
                  <div className="pn-khoi-than">
                    <div className="pn-luoi">
                      <div className="f pn-hang-dai">
                        <label>Tên tiếng Anh</label>
                        <input
                          className="inp"
                          value={form.tenAnh}
                          onChange={e => setForm(f => ({ ...f, tenAnh: e.target.value }))}
                        />
                      </div>
                      <div className="f pn-hang-dai">
                        <label>Tên tiếng Nhật</label>
                        <input
                          className="inp"
                          value={form.tenNhat}
                          onChange={e => setForm(f => ({ ...f, tenNhat: e.target.value }))}
                        />
                      </div>
                      <div className="f pn-hang-dai">
                        <label>Tên tiếng Hàn</label>
                        <input
                          className="inp"
                          value={form.tenHan}
                          onChange={e => setForm(f => ({ ...f, tenHan: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pn-chan">
              <button type="button" className="btn" onClick={dongPanel}>Huỷ</button>
              <button type="button" className="btn" onClick={() => handleLuu(true)}>Lưu và thêm</button>
              <button type="button" className="btn pri" onClick={() => handleLuu(false)}>Lưu</button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
