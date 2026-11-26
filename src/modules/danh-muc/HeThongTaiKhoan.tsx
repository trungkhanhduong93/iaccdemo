// Màn danh mục Hệ thống tài khoản (1.1): bảng cây chuyên nghiệp theo chế độ kế toán (TT133, TT99) và panel thêm / sửa (T76)
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Col, Row, ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { CHE_DO } from '../../app/che-do'
import { Icon } from '../../ui/Icon'
import { Select } from '../../ui/Dropdown'
import { Note, PageHead } from '../../ui/Page'
import { Table } from '../../ui/Table'
import { fold } from '../../ui/format'
import { ThanhLoc, LocO } from '../../ui/ThanhLoc'
import { NutTuyChinhCot, useCotDs } from '../../ui/LocNangCao'
import { NutExcel } from '../../ui/CongCuDs'
import { heThongTk, type TaiKhoanDef, type TinhChatTk } from './he-thong-tk'

/** Cột luôn hiện, không ẩn được ở Tuỳ chỉnh cột (T148) */
const COT_CO_DINH = new Set(['so', 'ten'])
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

/** Loại tài khoản theo chữ số đầu của số tài khoản (T154); form lưu chữ số */
const LOAI_TK: { v: string; t: string }[] = [
  ['1', 'Tài sản ngắn hạn'], ['2', 'Tài sản dài hạn'], ['3', 'Nợ phải trả'], ['4', 'Vốn chủ sở hữu'], ['5', 'Doanh thu'],
  ['6', 'Chi phí sản xuất kinh doanh'], ['7', 'Thu nhập khác'], ['8', 'Chi phí khác'], ['9', 'Xác định kết quả kinh doanh'], ['0', 'Tài khoản ngoài bảng'],
].map(([v, t]) => ({ v, t }))
const loaiTheoSo = (so: string) => (/^\d/.test(so) ? so[0] : '')

/** Dòng đang hiện: thêm cờ Tổng hợp (khai báo) và Đang dùng. Tổng hợp phải khớp việc có tài khoản con, lệch thì báo sai tính chất */
type TkHien = TaiKhoanDef & { tongHop: boolean; dangDung: boolean }
const saiTinhChat = (t: TkHien) => t.tongHop !== t.laCha
const LY_DO_SAI = (t: TkHien) => (t.laCha ? 'Có tài khoản con nhưng đang là Chi tiết' : 'Là Tổng hợp nhưng chưa có tài khoản con')

interface FormState {
  so: string
  ten: string
  cha: string
  laCha: boolean
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
  cuaHang: string
  soTkNganHang: string
  tenAnh: string
  tenNhat: string
  tenHan: string
}

function taoMacDinh(tk?: TkHien | null): FormState {
  if (!tk) {
    return {
      so: '',
      ten: '',
      cha: '',
      laCha: false,
      cap: 1,
      tinhChat: 'Dư Nợ',
      loai: '',
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
      cuaHang: '',
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
    laCha: tk.tongHop,
    cap: tk.cap,
    tinhChat: tk.tinhChat,
    loai: loaiTheoSo(tk.so),
    dienGiai: '',
    dangDung: tk.dangDung,
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
    cuaHang: isNganHang ? 'Sở giao dịch' : '',
    soTkNganHang: isNganHang ? '0011001234567' : '',
    tenAnh: TEN_ANH[tk.so] || '',
    tenNhat: '',
    tenHan: '',
  }
}

export function HeThongTaiKhoan({ sc, mod }: ScreenProps) {
  const { s, toast } = useSession()
  const cdDef = CHE_DO[s.cheDo]
  const base = useMemo(() => heThongTk(s.cheDo), [s.cheDo])
  // Tài khoản thêm trong phiên và chỉnh sửa (Tổng hợp, Đang dùng, tên, kiểu số dư); đổi chế độ thì làm lại
  const [them, setThem] = useState<TaiKhoanDef[]>([])
  const [chinh, setChinh] = useState<Record<string, Partial<Pick<TkHien, 'tongHop' | 'dangDung' | 'ten' | 'tinhChat' | 'loai' | 'cha' | 'cap'>>>>({})
  useEffect(() => { setThem([]); setChinh({}) }, [s.cheDo])
  const all: TkHien[] = useMemo(() => {
    const ds0 = them.length ? [...base, ...them].sort((a, b) => a.so.localeCompare(b.so)) : base
    // Chỉnh loại, tài khoản mẹ xong mới tính tài khoản nào có con
    const ds = ds0.map(t => ({ ...t, ...chinh[t.so] }))
    const coCha = new Set(ds.map(t => t.cha))
    return ds.map(t => {
      const laCha = coCha.has(t.so)
      return { ...t, laCha, tongHop: chinh[t.so]?.tongHop ?? laCha, dangDung: chinh[t.so]?.dangDung ?? true }
    })
  }, [base, them, chinh])
  const bySo = useMemo(() => new Map(all.map(t => [t.so, t])), [all])
  const sai = useMemo(() => all.filter(saiTinhChat), [all])
  const [loc, setLoc] = useState({ loai: '', tongHop: '', tinhChat: '', trangThai: '' })
  const [chiSai, setChiSai] = useState(false)
  const locRong = !loc.loai && !loc.tongHop && !loc.tinhChat && !loc.trangThai

  const [q, setQ] = useState('')
  const [moRong, setMoRong] = useState<Set<string>>(() => new Set())
  const [panelOpen, setPanelOpen] = useState(false)
  const [dangSua, setDangSua] = useState<TkHien | null>(null)
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

  // Lọc theo tìm kiếm, ô Bộ lọc, dải cảnh báo; có điều kiện thì hiện kèm các tài khoản cha
  const { rows, khopCount } = useMemo(() => {
    const tuKhoa = q.trim()
    if (!tuKhoa && locRong && !chiSai) {
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
      if (tuKhoa && !fold(`${tk.so} ${tk.ten} ${en}`).includes(fq)) continue
      if (loc.loai && loaiTheoSo(tk.so) !== loc.loai) continue
      if (loc.tongHop && (loc.tongHop === '1') !== tk.tongHop) continue
      if (loc.tinhChat && tk.tinhChat !== loc.tinhChat) continue
      if (loc.trangThai && (loc.trangThai === '1') !== tk.dangDung) continue
      if (chiSai && !saiTinhChat(tk)) continue
      khop.add(tk.so)
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
  }, [all, q, loc, locRong, chiSai, moRong, bySo])

  const moThem = () => {
    setDangSua(null)
    setForm(taoMacDinh(null))
    setErrors({})
    setMoKhoi({ thongTin: true, theoDoi: true, ngoaiTe: false, nganHang: false, ngonNgu: false })
    setPanelOpen(true)
  }

  const moSua = useCallback((tk: TkHien) => {
    setDangSua(tk)
    setForm(taoMacDinh(tk))
    setErrors({})
    setMoKhoi({ thongTin: true, theoDoi: true, ngoaiTe: false, nganHang: false, ngonNgu: false })
    setPanelOpen(true)
  }, [])
  // Thân panel nhiều trường vẽ sau khi panel trượt xong: lúc trượt không bị khựng (đo hở 160ms giữa hai khung, T81)
  const [thanMo, setThanMo] = useState(false)
  useEffect(() => { if (!panelOpen) setThanMo(false) }, [panelOpen])
  // Tài khoản mẹ: chỉ các tài khoản tổng hợp cùng loại; không chọn thì là tài khoản cấp 1
  const dsCha = useMemo(() => [
    { v: '', t: '(Không có, tài khoản cấp 1)' },
    ...all.filter(t => (t.tongHop || t.so === form.cha) && t.so !== dangSua?.so && (!form.loai || loaiTheoSo(t.so) === form.loai)).map(t => ({ v: t.so, t: `${t.so} - ${t.ten}` })),
  ], [all, form.loai, dangSua])

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
    setForm(f => {
      const capMoi = chaTk ? chaTk.cap + 1 : 1
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
        loai: chaTk ? loaiTheoSo(chaTk.so) : f.loai,
      }
    })
    setErrors(e => ({ ...e, so: '', cha: '' }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.so.trim()) {
      errs.so = 'Vui lòng nhập số tài khoản'
    } else if (form.cha && !form.so.startsWith(form.cha)) {
      errs.so = `Số tài khoản phải bắt đầu bằng ${form.cha}`
    }
    if (!errs.so && !dangSua && bySo.has(form.so.trim())) {
      errs.so = 'Số tài khoản đã có trong danh mục'
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
    const so = form.so.trim()
    const coCon = dangSua ? all.some(t => t.cha === dangSua.so) : false
    if (dangSua) {
      setChinh(c => ({ ...c, [so]: { ...c[so], ten: form.ten.trim(), tinhChat: form.tinhChat, tongHop: form.laCha, dangDung: form.dangDung, loai: LOAI_TK.find(l => l.v === form.loai)?.t ?? dangSua.loai, cha: form.cha || undefined, cap: form.cap } }))
    } else {
      setThem(d => [...d, { so, ten: form.ten.trim(), cap: form.cap, cha: form.cha || undefined, laCha: false, tinhChat: form.tinhChat, loai: LOAI_TK.find(l => l.v === form.loai)?.t ?? '' }])
      setChinh(c => ({ ...c, [so]: { tongHop: form.laCha, dangDung: form.dangDung } }))
    }
    // Có tài khoản con thì phải là Tổng hợp; chưa có thì Tổng hợp là sai tính chất
    const lech = form.laCha !== coCon
    toast(`Đã lưu tài khoản ${so}${lech ? ', có cảnh báo tính chất tổng hợp' : ''}`)
    if (lech) setChiSai(false)
    if (themTiep) {
      setDangSua(null)
      setForm(taoMacDinh(null))
      setErrors({})
    } else {
      dongPanel()
    }
  }

  const doiTongHop = useCallback((so: string, v: boolean) => {
    setChinh(c => ({ ...c, [so]: { ...c[so], tongHop: v } }))
  }, [])
  const doiDangDung = useCallback((so: string, v: boolean) => {
    setChinh(c => ({ ...c, [so]: { ...c[so], dangDung: v } }))
  }, [])

  const dangCoCon = Boolean(dangSua && all.some(t => t.cha === dangSua.so))

  const cols: Col[] = useMemo(() => [
    {
      k: 'so',
      t: 'Số tài khoản',
      w: 190,
      cls: 'code',
      r: (r: Row) => {
        const isExp = q.trim() ? true : moRong.has(r.so)
        const coCon = all.some(t => t.cha === r.so)
        return (
          <div style={{ paddingLeft: (r.cap - 1) * 20, display: 'inline-flex', alignItems: 'center' }}>
            {coCon ? (
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
      k: 'loai',
      t: 'Loại tài khoản',
      w: 190,
    },
    {
      k: 'tongHop',
      t: 'Tổng hợp',
      w: 130,
      r: (r: Row) => {
        const tk = r as unknown as TkHien
        const lech = saiTinhChat(tk)
        return (
          <span className="tk-cong-tac" title={lech ? LY_DO_SAI(tk) : 'Bật là tài khoản tổng hợp, tắt là tài khoản chi tiết'}>
            <button type="button" role="switch" aria-checked={tk.tongHop} aria-label={`Tổng hợp ${tk.so}`}
              className={`ds-ct${tk.tongHop ? ' on' : ''}`}
              onClick={e => { e.stopPropagation(); doiTongHop(tk.so, !tk.tongHop) }}><i /></button>
            {lech && <Icon n="alert" className="ic sm tk-sai" />}
          </span>
        )
      },
    },
    {
      k: 'tinhChat',
      t: 'Kiểu số dư',
      w: 130,
    },
    {
      k: 'trangThai',
      t: 'Trạng thái',
      w: 160,
      r: (r: Row) => {
        const tk = r as unknown as TkHien
        return (
          <span className="tk-cong-tac">
            <button type="button" role="switch" aria-checked={tk.dangDung} aria-label={`Đang sử dụng ${tk.so}`}
              className={`ds-ct${tk.dangDung ? ' on' : ''}`}
              onClick={e => { e.stopPropagation(); doiDangDung(tk.so, !tk.dangDung) }}><i /></button>
            <span className="muted">{tk.dangDung ? 'Đang dùng' : 'Ngừng dùng'}</span>
          </span>
        )
      },
    },
  ], [q, moRong, all, doiTongHop, doiDangDung])

  const cot = useCotDs('/danh-muc/1-1', cols, COT_CO_DINH)

  // Bảng ghi nhớ: mở panel hay gõ trong panel không vẽ lại cây tài khoản (T81)
  const bang = useMemo(() => (
    <Table cols={cot.colsHien} doRong={cot.doRong} rows={rows as unknown as Row[]} motDong onDbl={r => moSua(r as unknown as TkHien)}
      rowCls={r => `${r.laCha ? 'tk-row-cha ' : ''}${saiTinhChat(r as unknown as TkHien) ? 'tk-row-sai ' : ''}click`} />
  ), [cot.colsHien, cot.doRong, rows, moSua])

  const ten = tenMan(sc)

  return (
    <div className="page page-voucher page-dm">
      <PageHead
        title={ten}
        meta={
          <>
            <span className="chip info">{cdDef.ngan}</span>
            {cdDef.choDuyet && <span className="chip warn">Chờ kế toán trưởng duyệt</span>}
          </>
        }
      />

      <section className="card dm-bang tk-tbl-wrap">
        <ThanhLoc
          tim={{
            value: q,
            onChange: setQ,
            placeholder: 'Tìm số, tên TK',
          }}
          dangLoc={!locRong}
          onLamMoi={() => setLoc({ loai: '', tongHop: '', tinhChat: '', trangThai: '' })}
          boLoc={<>
            <LocO nhan="Loại tài khoản">
              <Select className="inp" value={loc.loai} aria-label="Loại tài khoản"
                ds={[{ v: '', t: 'Tất cả' }, ...LOAI_TK.filter(l => l.v !== '0')]}
                onChange={e => setLoc(l => ({ ...l, loai: e.target.value }))} />
            </LocO>
            <LocO nhan="Tổng hợp">
              <Select className="inp" value={loc.tongHop} aria-label="Tổng hợp"
                ds={[{ v: '', t: 'Tất cả' }, { v: '1', t: 'Tổng hợp' }, { v: '0', t: 'Chi tiết' }]}
                onChange={e => setLoc(l => ({ ...l, tongHop: e.target.value }))} />
            </LocO>
            <LocO nhan="Kiểu số dư">
              <Select className="inp" value={loc.tinhChat} aria-label="Kiểu số dư"
                ds={[{ v: '', t: 'Tất cả' }, { v: 'Dư Nợ', t: 'Dư Nợ' }, { v: 'Dư Có', t: 'Dư Có' }, { v: 'Lưỡng tính', t: 'Lưỡng tính' }]}
                onChange={e => setLoc(l => ({ ...l, tinhChat: e.target.value }))} />
            </LocO>
            <LocO nhan="Trạng thái">
              <Select className="inp" value={loc.trangThai} aria-label="Trạng thái"
                ds={[{ v: '', t: 'Tất cả' }, { v: '1', t: 'Đang sử dụng' }, { v: '0', t: 'Ngừng sử dụng' }]}
                onChange={e => setLoc(l => ({ ...l, trangThai: e.target.value }))} />
            </LocO>
          </>}
          phai={
            <div className="row" style={{ gap: 8 }}>
              <button type="button" className="btn sm" onClick={moRongHet}>Mở rộng hết</button>
              <button type="button" className="btn sm" onClick={thuGonHet}>Thu gọn hết</button>
              <NutTuyChinhCot cols={cot.colsDu} an={cot.an} coDinh={COT_CO_DINH} macDinh={cot.macDinh} dongBang={cot.dongBang}
                onLuu={cot.luu} onDoRongTuDong={cot.datDoRongTuDong} />
              <NutExcel
                onNhap={() => toast('Nhập tài khoản từ Excel')}
                onXuat={() => toast(`Đã xuất ${all.length} tài khoản ra Excel`)}
              />
              <button type="button" className="btn pri" onClick={moThem}>
                <Icon n="plus" className="ic sm" />Thêm tài khoản
              </button>
            </div>
          }
        />

        {sai.length > 0 && (
          <Note kind="warn" icon="alert">
            Có <b>{sai.length}</b> tài khoản sai tính chất tổng hợp ({sai.slice(0, 6).map(t => t.so).join(', ')}{sai.length > 6 ? '…' : ''}). Tài khoản có tài khoản con phải là Tổng hợp, tài khoản không có con phải là Chi tiết.
            <button type="button" className="btn sm" style={{ marginLeft: 10 }} onClick={() => setChiSai(v => !v)}>
              {chiSai ? 'Xem tất cả' : 'Chỉ xem các tài khoản này'}
            </button>
          </Note>
        )}

        {rows.length > 0 ? bang : (
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
          <aside className="pn-hop" onAnimationEnd={e => { if (e.target === e.currentTarget) setThanMo(true) }}>
            <div className="pn-dau">
              <div>
                <h3>{dangSua ? `Sửa tài khoản: ${dangSua.so}` : 'Thêm tài khoản'}</h3>
                <small className="muted">{ten}</small>
              </div>
              <button type="button" className="icon-btn" onClick={dongPanel} aria-label="Đóng"><Icon n="x" /></button>
            </div>

            <div className="pn-than">
              {thanMo && <>
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
                    {/* Mỗi trường một hàng: số, tên, loại, tài khoản mẹ, kiểu số dư, Tổng hợp, Đang sử dụng, diễn giải */}
                    <div className="pn-luoi pn-luoi-2" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
                      <div className="f" style={{ gridColumn: 'span 2' }}>
                        <label>Số tài khoản <em>*</em></label>
                        <input
                          className="inp"
                          value={form.so}
                          disabled={Boolean(dangSua)}
                          onChange={e => {
                            const so = e.target.value
                            setForm(f => ({ ...f, so, loai: loaiTheoSo(so) || f.loai }))
                            setErrors(err => ({ ...err, so: '' }))
                          }}
                        />
                        {errors.so && <span className="muted pn-loi">{errors.so}</span>}
                      </div>
                      <div className="f" style={{ gridColumn: 'span 4' }}>
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
                      <div className="f" style={{ gridColumn: 'span 2' }}>
                        <label>Loại tài khoản</label>
                        <Select className="inp" value={form.loai} aria-label="Loại tài khoản"
                          ds={[{ v: '', t: '(Chọn loại tài khoản)' }, ...LOAI_TK]}
                          onChange={e => setForm(f => ({ ...f, loai: e.target.value, cha: '', cap: 1 }))} />
                      </div>
                      <div className="f" style={{ gridColumn: 'span 2' }}>
                        <label>Kiểu số dư <em>*</em></label>
                        <Select
                          className="inp"
                          value={form.tinhChat}
                          onChange={e => setForm(f => ({ ...f, tinhChat: e.target.value as TinhChatTk }))}
                        >
                          <option value="Dư Nợ">Dư Nợ</option>
                          <option value="Dư Có">Dư Có</option>
                          <option value="Lưỡng tính">Lưỡng tính</option>
                        </Select>
                      </div>
                      <div className="f" style={{ gridColumn: 'span 2' }}>
                        <label>Tài khoản mẹ</label>
                        <Select className="inp" value={form.cha} ds={dsCha} aria-label="Tài khoản mẹ"
                          onChange={e => handleChaChange(e.target.value)} />
                        {errors.cha && <span className="muted pn-loi">{errors.cha}</span>}
                      </div>
                      <div className="f pn-hang-dai">
                        <label className="row pn-tich">
                          <input
                            type="checkbox"
                            className="bat-tat"
                            checked={form.laCha}
                            onChange={e => setForm(f => ({ ...f, laCha: e.target.checked }))}
                          />
                          <span>Tổng hợp</span>
                        </label>
                        {form.laCha !== dangCoCon && (!dangSua ? form.laCha : true) && (
                          <Note kind="warn" icon="alert">
                            {dangCoCon
                              ? `Tài khoản đang có tài khoản con nên phải là Tổng hợp.`
                              : 'Tài khoản này chưa có tài khoản con. Tích Tổng hợp thì bị tính là sai tính chất cho đến khi có tài khoản con.'}
                          </Note>
                        )}
                      </div>
                      <div className="f pn-hang-dai">
                        <label className="row pn-tich">
                          <input
                            type="checkbox"
                            className="bat-tat"
                            checked={form.dangDung}
                            onChange={e => setForm(f => ({ ...f, dangDung: e.target.checked }))}
                          />
                          <span>Đang sử dụng</span>
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
                            className="bat-tat"
                            checked={form.coNgoaiTe}
                            onChange={e => setForm(f => ({ ...f, coNgoaiTe: e.target.checked }))}
                          />
                          Có hạch toán ngoại tệ
                        </label>
                      </div>
                      <div className="f">
                        <label>Loại tiền</label>
                        <Select
                          className="inp"
                          disabled={!form.coNgoaiTe}
                          value={form.loaiTien}
                          onChange={e => setForm(f => ({ ...f, loaiTien: e.target.value }))}
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="VND">VND</option>
                        </Select>
                      </div>
                      <div className="f">
                        <label>Cách tính tỷ giá xuất</label>
                        <Select
                          className="inp"
                          disabled={!form.coNgoaiTe}
                          value={form.tyGiaXuat}
                          onChange={e => setForm(f => ({ ...f, tyGiaXuat: e.target.value }))}
                        >
                          <option value="Bình quân gia quyền">Bình quân gia quyền</option>
                          <option value="Đích danh">Đích danh</option>
                          <option value="Nhập trước xuất trước">Nhập trước xuất trước</option>
                        </Select>
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
                          className="bat-tat"
                          checked={form.doiTuong}
                          onChange={e => setForm(f => ({ ...f, doiTuong: e.target.checked }))}
                        />
                        Đối tượng
                      </label>
                      <label className="row pn-tich">
                        <input
                          type="checkbox"
                          className="bat-tat"
                          checked={form.vatTu}
                          onChange={e => setForm(f => ({ ...f, vatTu: e.target.checked }))}
                        />
                        Vật tư, hàng hoá
                      </label>
                      <label className="row pn-tich">
                        <input
                          type="checkbox"
                          className="bat-tat"
                          checked={form.khoanMuc}
                          onChange={e => setForm(f => ({ ...f, khoanMuc: e.target.checked }))}
                        />
                        Khoản mục chi phí
                      </label>
                      <label className="row pn-tich">
                        <input
                          type="checkbox"
                          className="bat-tat"
                          checked={form.congViec}
                          onChange={e => setForm(f => ({ ...f, congViec: e.target.checked }))}
                        />
                        Công việc, công trình
                      </label>
                      <label className="row pn-tich">
                        <input
                          type="checkbox"
                          className="bat-tat"
                          checked={form.thanhPham}
                          onChange={e => setForm(f => ({ ...f, thanhPham: e.target.checked }))}
                        />
                        Thành phẩm
                      </label>
                      <label className="row pn-tich">
                        <input
                          type="checkbox"
                          className="bat-tat"
                          checked={form.thueVat}
                          onChange={e => setForm(f => ({ ...f, thueVat: e.target.checked }))}
                        />
                        Thuế GTGT
                      </label>
                      <label className="row pn-tich">
                        <input
                          type="checkbox"
                          className="bat-tat"
                          checked={form.ngoaiBang}
                          onChange={e => setForm(f => ({ ...f, ngoaiBang: e.target.checked }))}
                        />
                        Tài khoản ngoài bảng
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Khối 4: Tên theo ngôn ngữ */}
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
              </>}
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
