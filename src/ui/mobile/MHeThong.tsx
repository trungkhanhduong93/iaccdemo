import { useMemo, useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import {
  cheDoHienTai,
  donViHienTai,
  dsChiNhanh,
  dsDonVi,
  loaiHinhDv,
  namTaiChinh,
  ngayDauNam,
  useSession,
  type PpGtgt,
  type PpTndn,
} from '../../app/session'
import { CHE_DO, CHE_DO_HOP_LE, type CheDo } from '../../app/che-do'
import { CHI_NHANH, KHO, NGUOI_DUNG } from '../../data/mock'
import { GOI, MODS, kieuGhiSo } from '../../app/plan'
import {
  CAU_HINH_NGUOI_DUNG,
  MAC_DINH,
  QUYEN,
  VAI_TRO,
} from '../../modules/he-thong/HeThong'
import {
  ChonKenh,
  KENH_ONLINE,
  KENH_SAN,
  NHOM_HKD,
  type LoaiHinh,
  type PpHkd,
} from '../../modules/onboarding/OnboardFabi'
import { useNhatKy } from '../generic/daXoa'
import { pad, pick, rng, fold } from '../format'
import { Select } from '../Dropdown'
import { Icon } from '../Icon'
import { ONgay } from '../ChonNgay'
import { MFormDm } from './MFormDm'
import { MTrong } from './MTrong'

// ── 1. Màn Người dùng ──
export const MNguoiDung: FC<ScreenProps> = ({ sc }) => {
  const { toast } = useSession()
  const [editUser, setEditUser] = useState<Row | null>(null)
  const [q, setQ] = useState('')

  const dsLoc = useMemo(() => {
    if (!q.trim()) return NGUOI_DUNG
    const fq = fold(q.trim())
    return NGUOI_DUNG.filter(u => fold(`${u.ten} ${u.email} ${u.vaiTro}`).includes(fq))
  }, [q])

  return (
    <div className="m-ht-khung">
      {/* Ô tìm kiếm */}
      <div className="m-ht-dau">
        <div className="m-ht-hang-tim">
          <div className="m-ht-tim">
            <Icon n="search" className="m-ht-tim-ic ic sm" />
            <input
              type="text"
              className="m-ht-tim-inp"
              placeholder="Tìm tên, email, vai trò..."
              value={q}
              onChange={e => setQ(e.target.value)}
              aria-label="Tìm kiếm người dùng"
            />
            {q ? (
              <button
                type="button"
                className="m-ht-tim-x"
                onClick={() => setQ('')}
                aria-label="Xoá tìm kiếm"
              >
                <Icon n="x" className="ic sm" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="m-ht-tom-tat">
        <span>
          Tổng <b>{dsLoc.length}</b> / {NGUOI_DUNG.length} người dùng
        </span>
      </div>

      {dsLoc.length === 0 ? (
        <MTrong kieu="tim" tieuDe="Không tìm thấy người dùng" moTa="Thử tìm theo tên, email khác" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dsLoc.map((u, idx) => {
            const tenVietTat = u.ten.split(' ').slice(-2).map((x: string) => x[0]).join('')
            return (
              <div
                key={`${u.email}_${idx}`}
                className="m-ht-the-user"
                onClick={() => setEditUser(u)}
                role="button"
                tabIndex={0}
              >
                <div className="m-ht-user-trai">
                  <div className="m-ht-user-av">{tenVietTat}</div>
                  <div className="m-ht-user-info">
                    <span className="m-ht-user-ten">{u.ten}</span>
                    <span className="m-ht-user-email">{u.email}</span>
                    <span className="m-ht-user-phu">
                      {u.vaiTro} · {u.pham}
                    </span>
                  </div>
                </div>
                <div className="m-ht-user-phai">
                  <span className={`chip ${u.tt === 'ok' ? 'ok' : 'warn'}`}>
                    {u.tt === 'ok' ? 'Đang dùng' : 'Chưa nhận lời'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Nút thêm nổi */}
      <button
        type="button"
        className="m-nut-them-fab"
        onClick={() => setEditUser({})}
        aria-label="Mời người dùng"
      >
        <Icon n="mail" className="ic sm" />
        <span>Mời người dùng</span>
      </button>

      {/* Tấm nổi từ đáy sửa/thêm người dùng */}
      {editUser && (
        <MFormDm
          sc={sc}
          cauHinh={CAU_HINH_NGUOI_DUNG}
          edit={editUser}
          all={NGUOI_DUNG}
          ten="Người dùng"
          tenNgan="Người dùng"
          onDong={() => setEditUser(null)}
          onLuu={() => {
            const isMoi = !editUser.ten
            toast(isMoi ? 'Đã gửi lời mời tới email' : 'Đã lưu người dùng')
            setEditUser(null)
          }}
        />
      )}
    </div>
  )
}

// ── 2. Màn Vai trò và phân quyền ──
export const MPhanQuyen: FC<ScreenProps> = () => {
  const { toast } = useSession()
  const [vt, setVt] = useState(VAI_TRO[2]) // Mặc định Kế toán viên

  // Trạng thái quyền: mod -> quyen -> boolean
  const [quyens, setQuyens] = useState<Record<string, Record<string, boolean>>>(() => {
    const init: Record<string, Record<string, boolean>> = {}
    for (const m of MODS) {
      init[m] = {}
      for (const q of QUYEN) {
        init[m][q] = MAC_DINH[vt]?.includes(q) ?? false
      }
    }
    return init
  })

  const doiVaiTro = (moiVt: string) => {
    setVt(moiVt)
    const init: Record<string, Record<string, boolean>> = {}
    for (const m of MODS) {
      init[m] = {}
      for (const q of QUYEN) {
        init[m][q] = MAC_DINH[moiVt]?.includes(q) ?? false
      }
    }
    setQuyens(init)
  }

  const toggleQuyen = (m: string, q: string) => {
    setQuyens(prev => ({
      ...prev,
      [m]: {
        ...prev[m],
        [q]: !prev[m]?.[q],
      },
    }))
  }

  return (
    <div className="m-ht-khung">
      {/* Danh sách vai trò trượt ngang */}
      <div className="m-pq-vt-ds">
        {VAI_TRO.map(v => (
          <button
            key={v}
            type="button"
            className={`m-pq-vt-btn ${v === vt ? 'on' : ''}`}
            onClick={() => doiVaiTro(v)}
          >
            {v}
          </button>
        ))}
      </div>

      <div style={{ margin: '10px 0 6px', fontSize: 13, color: 'var(--muted)' }}>
        Quyền của <b>{vt}</b> theo từng phân hệ:
      </div>

      {/* Danh sách quyền theo phân hệ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MODS.map(m => (
          <div key={m} className="m-pq-mod-the">
            <div className="m-pq-mod-ten">{m}</div>
            <div className="m-pq-quyen-ds">
              {QUYEN.map(q => {
                const bat = quyens[m]?.[q] ?? false
                return (
                  <label key={q} className="m-pq-quyen-dong">
                    <span className="m-pq-quyen-nhan">{q}</span>
                    <input
                      type="checkbox"
                      checked={bat}
                      onChange={() => toggleQuyen(m, q)}
                    />
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Nút lưu dính đáy */}
      <div className="m-form-chan-dinh">
        <button
          type="button"
          className="btn pri"
          style={{ width: '100%', height: 44, borderRadius: 12 }}
          onClick={() => toast(`Đã lưu quyền của ${vt}`)}
        >
          Lưu quyền {vt}
        </button>
      </div>
    </div>
  )
}

// ── 3. Màn Nhật ký thao tác ──
const CHIPS_NHAT_KY = [
  { k: '', ten: 'Tất cả' },
  { k: 'Sửa', ten: 'Sửa' },
  { k: 'Xoá', ten: 'Xoá' },
  { k: 'Ghi sổ', ten: 'Ghi sổ' },
  { k: 'Khoá sổ', ten: 'Khoá sổ' },
  { k: 'Đăng nhập', ten: 'Đăng nhập' },
  { k: 'Xuất', ten: 'Xuất' },
  { k: 'Duyệt', ten: 'Duyệt' },
]

export const MNhatKyThaoTac: FC<ScreenProps> = () => {
  const [q, setQ] = useState('')
  const [chipChon, setChipChon] = useState('')

  const r = useMemo(() => rng('nhatky_mobile'), [])
  const viecMau = useMemo(
    () => [
      'Sửa phiếu chi PC2610-0241',
      'Ghi sổ 3 chứng từ bán hàng',
      'Xoá phiếu nháp MH2610-0118',
      'Khoá sổ kỳ 8/2026',
      'Đổi tài khoản doanh thu nhóm Đồ uống',
      'Đăng nhập',
      'Xuất Excel sổ quỹ tiền mặt',
      'Duyệt cấp 1 phiếu chi PC2610-0236',
    ],
    [],
  )

  const phienNhatKy = useNhatKy()
  const rows = useMemo(() => {
    const phien = phienNhatKy.map(x => ({
      luc: x.luc,
      ai: x.ai,
      viec: x.viec.replace('chứng từ', `chứng từ ${x.so}`),
      ip: '127.0.0.1',
    }))
    const mock = Array.from({ length: 22 }, (_, i) => ({
      luc: `${pad(7 - Math.floor(i / 5))}/10/2026 ${pad(16 - (i % 9))}:${pad(Math.floor(r() * 59))}`,
      ai: pick(r, ['Trần Thu Hà', 'Lê Quốc Bảo', 'Phạm Ngọc Lan']),
      viec: pick(r, viecMau),
      ip: `113.161.${Math.floor(r() * 200)}.${Math.floor(r() * 250)}`,
    }))
    return [...phien, ...mock]
  }, [phienNhatKy, r, viecMau])

  const rowsLoc = useMemo(() => {
    return rows.filter(item => {
      if (chipChon && !item.viec.toLowerCase().includes(chipChon.toLowerCase())) {
        return false
      }
      if (q.trim()) {
        const fq = fold(q.trim())
        return fold(`${item.viec} ${item.ai} ${item.luc} ${item.ip}`).includes(fq)
      }
      return true
    })
  }, [rows, chipChon, q])

  return (
    <div className="m-ht-khung">
      {/* Ô tìm kiếm */}
      <div className="m-ht-dau">
        <div className="m-ht-hang-tim">
          <div className="m-ht-tim">
            <Icon n="search" className="m-ht-tim-ic ic sm" />
            <input
              type="text"
              className="m-ht-tim-inp"
              placeholder="Tìm theo thao tác, người làm, IP..."
              value={q}
              onChange={e => setQ(e.target.value)}
              aria-label="Tìm kiếm nhật ký"
            />
            {q ? (
              <button
                type="button"
                className="m-ht-tim-x"
                onClick={() => setQ('')}
                aria-label="Xoá tìm kiếm"
              >
                <Icon n="x" className="ic sm" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Chips lọc */}
        <div className="m-pq-vt-ds" style={{ padding: '4px 0 0' }}>
          {CHIPS_NHAT_KY.map(c => (
            <button
              key={c.k}
              type="button"
              className={`m-pq-vt-btn ${c.k === chipChon ? 'on' : ''}`}
              onClick={() => setChipChon(c.k)}
            >
              {c.ten}
            </button>
          ))}
        </div>
      </div>

      <div className="m-ht-tom-tat">
        <span>
          Tổng <b>{rowsLoc.length}</b> bản ghi nhật ký
        </span>
      </div>

      {rowsLoc.length === 0 ? (
        <MTrong kieu="tim" tieuDe="Không có nhật ký phù hợp" moTa="Thử lọc theo từ khoá khác" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rowsLoc.map((item, idx) => (
            <div key={`${item.luc}_${idx}`} className="m-nk-the">
              <div className="m-nk-trai">
                <span className="m-nk-viec">{item.viec}</span>
                <span className="m-nk-nguoi">
                  <Icon n="user" className="ic xs" /> {item.ai}
                </span>
              </div>
              <div className="m-nk-phai">
                <span className="m-nk-luc">{item.luc}</span>
                <span className="m-nk-ip">{item.ip}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── 4. Màn Thông tin đơn vị ──
const PP_GTGT: Record<PpGtgt, string> = {
  tyLe: 'Theo phương pháp trực tiếp (% doanh thu)',
  khauTru: 'Theo phương pháp khấu trừ',
}
const PP_THU_NHAP: Record<PpHkd, string> = {
  doanhThu: 'Theo doanh thu',
  loiNhuan: 'Theo lợi nhuận tính thuế',
}

export const MThongTinDonVi: FC<ScreenProps> = () => {
  const { s, set, toast } = useSession()
  const dv = donViHienTai(s)
  const tt = s.ttDv?.[s.donVi] ?? {}
  const [dauNam, setDauNam] = useState(ngayDauNam(s))
  const [nam, setNam] = useState(namTaiChinh(s))
  const doiNam = (n: number) => {
    setNam(n)
    setDauNam(d => d.replace(/\d{4}$/, String(n)))
  }

  const dsCn = dsChiNhanh(s)
  const [f, setF] = useState(() => ({
    ten: dv.ten,
    mst: dv.mst,
    diaChi: dv.diaChi,
    loai: loaiHinhDv(s, dv) as LoaiHinh,
    nhom: tt.nhom ?? 1,
    ppHkd: (tt.ppHkd ?? 'doanhThu') as PpHkd,
    ppGtgt: s.ppGtgt,
    ppTndn: s.ppTndn,
    cnChinh: tt.cnChinh || dsCn[0]?.id || '',
    kenhOnline: tt.kenhOnline ?? KENH_ONLINE,
    kenhSan: tt.kenhSan ?? KENH_SAN,
  }))

  const sua = (p: Partial<typeof f>) => setF(x => ({ ...x, ...p }))
  const dnCoDinh = s.goi === 'PL' || s.goi === 'PR'
  const ppCoDinh = NHOM_HKD[f.nhom - 1]?.pp ?? null
  const tndnCoDinh = f.loai === 'dn' && dnCoDinh
  const bat = (ds: string[], k: string) => (ds.includes(k) ? ds.filter(x => x !== k) : [...ds, k])
  const mstGoc = Boolean(dsDonVi({ dvMoi: s.dvMoi }).find(d => d.id === s.donVi)?.mst)

  const cheDoTheoLoai = (l: LoaiHinh): CheDo =>
    l === 'hkd'
      ? CHE_DO_HOP_LE[s.goi].includes('TT152')
        ? 'TT152'
        : s.cheDo
      : s.goi === 'S'
      ? 'TT58'
      : s.cheDo

  const luuDv = () => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dauNam)) {
      toast('Ngày đầu năm cần nhập dạng dd/mm/yyyy')
      return
    }
    if (!f.ten.trim()) {
      toast('Tên đơn vị không được để trống')
      return
    }
    const { ten, mst, diaChi, loai, nhom, ppHkd, cnChinh, kenhOnline, kenhSan } = f
    set({
      cheDo: cheDoTheoLoai(loai),
      ppGtgt: loai === 'hkd' ? 'tyLe' : dnCoDinh ? 'khauTru' : f.ppGtgt,
      ppTndn: tndnCoDinh ? 'thuNhap' : f.ppTndn,
      ngayDauNam: { ...s.ngayDauNam, [s.donVi]: dauNam },
      namTaiChinh: { ...s.namTaiChinh, [s.donVi]: nam },
      ttDv: {
        ...s.ttDv,
        [s.donVi]: {
          ten,
          mst,
          diaChi,
          loai,
          nhom,
          ppHkd: ppCoDinh ?? ppHkd,
          cnChinh,
          kenhOnline,
          kenhSan: kenhSan.filter(k => kenhOnline.includes(k)),
        },
      },
    })
    toast('Đã lưu thông tin đơn vị')
  }

  const { loai } = f
  const cdDn: CheDo[] = s.goi === 'S' ? ['TT58'] : CHE_DO_HOP_LE[s.goi]

  return (
    <div className="m-ht-khung">
      {/* Thẻ 1: Thông tin trên chứng từ, báo cáo */}
      <section className="m-form-the">
        <h3 className="m-form-the-tieu">Thông tin trên chứng từ, báo cáo</h3>
        <div className="m-form-luoi">
          <div className="m-form-dong">
            <label className="m-form-nhan">Tên đơn vị</label>
            <input
              className="inp"
              value={f.ten}
              onChange={e => sua({ ten: e.target.value })}
            />
          </div>
          <div className="m-form-dong">
            <label className="m-form-nhan">Mã số thuế</label>
            <input
              className="inp"
              readOnly={mstGoc}
              value={f.mst}
              placeholder="Chưa khai mã số thuế"
              onChange={e => sua({ mst: e.target.value })}
            />
          </div>
          <div className="m-form-dong">
            <label className="m-form-nhan">Số điểm bán</label>
            <input className="inp" readOnly value={dsCn.length} />
          </div>
          <div className="m-form-dong">
            <label className="m-form-nhan">Địa chỉ</label>
            <input
              className="inp"
              value={f.diaChi}
              onChange={e => sua({ diaChi: e.target.value })}
            />
          </div>
          <div className="m-form-dong">
            <label className="m-form-nhan">Người đại diện</label>
            <input className="inp" defaultValue={dv.nguoiDaiDien} />
          </div>
          <div className="m-form-dong">
            <label className="m-form-nhan">Kế toán trưởng</label>
            <input className="inp" defaultValue="Trần Thu Hà" />
          </div>
        </div>
      </section>

      {/* Thẻ 2: Thông tin kê khai */}
      <section className="m-form-the">
        <h3 className="m-form-the-tieu">Thông tin kê khai</h3>
        <div className="m-form-luoi">
          <div className="m-form-dong">
            <label className="m-form-nhan">Loại hình</label>
            <Select
              className="inp"
              value={loai}
              aria-label="Loại hình"
              onChange={e => sua({ loai: e.target.value as LoaiHinh })}
              ds={[
                { v: 'hkd', t: 'Hộ kinh doanh' },
                { v: 'dn', t: 'Doanh nghiệp' },
              ]}
            />
          </div>
          <div className="m-form-dong">
            <label className="m-form-nhan">Thông tư áp dụng</label>
            {loai === 'hkd' ? (
              <input
                className="inp"
                readOnly
                value={`${CHE_DO.TT152.soHieu} · ${CHE_DO.TT152.ten}`}
              />
            ) : s.goi === 'F' ? (
              <input className="inp" readOnly value="Quản lý lãi lỗ, không theo thông tư" />
            ) : (
              <Select
                className="inp"
                value={cdDn.includes(s.cheDo) ? s.cheDo : cdDn[0]}
                disabled={cdDn.length <= 1}
                aria-label="Thông tư áp dụng"
                onChange={e => set({ cheDo: e.target.value as CheDo })}
                ds={cdDn.map(cd => ({ v: cd, t: `${CHE_DO[cd].soHieu} · ${CHE_DO[cd].ten}` }))}
              />
            )}
          </div>

          {loai === 'hkd' && (
            <>
              <div className="m-form-dong">
                <label className="m-form-nhan">Nhóm doanh thu</label>
                <Select
                  className="inp"
                  value={String(f.nhom)}
                  aria-label="Nhóm doanh thu"
                  onChange={e => sua({ nhom: Number(e.target.value) })}
                  ds={NHOM_HKD.map(x => ({
                    v: String(x.nhom),
                    t: `Nhóm ${x.nhom} (${x.ten})`,
                  }))}
                />
              </div>
              <div className="m-form-dong">
                <label className="m-form-nhan">Phương pháp thuế GTGT</label>
                <Select
                  className="inp"
                  value="tyLe"
                  disabled
                  aria-label="Phương pháp thuế GTGT"
                  ds={[{ v: 'tyLe', t: PP_GTGT.tyLe }]}
                />
              </div>
              <div className="m-form-dong">
                <label className="m-form-nhan">Phương pháp thuế TNCN</label>
                <Select
                  className="inp"
                  value={ppCoDinh ?? f.ppHkd}
                  disabled={ppCoDinh !== null}
                  aria-label="Phương pháp thuế TNCN"
                  onChange={e => sua({ ppHkd: e.target.value as PpHkd })}
                  ds={(ppCoDinh ? [ppCoDinh] : (['doanhThu', 'loiNhuan'] as const)).map(v => ({
                    v,
                    t: PP_THU_NHAP[v],
                  }))}
                />
              </div>
              <div className="m-form-dong">
                <label className="m-form-nhan">Địa điểm kinh doanh chính</label>
                <Select
                  className="inp"
                  value={f.cnChinh}
                  aria-label="Địa điểm kinh doanh chính"
                  onChange={e => sua({ cnChinh: e.target.value })}
                  ds={dsCn.map(c => ({ v: c.id, t: c.ten }))}
                />
              </div>
              <div className="m-form-dong">
                <label className="m-form-nhan">Kênh bán online</label>
                <ChonKenh
                  ds={KENH_ONLINE}
                  chon={f.kenhOnline}
                  doi={k => sua({ kenhOnline: bat(f.kenhOnline, k) })}
                  trong="Chọn kênh bán"
                />
              </div>
              <div className="m-form-dong">
                <label className="m-form-nhan">Kênh bán qua sàn khấu trừ thuế</label>
                <ChonKenh
                  ds={KENH_SAN.filter(k => f.kenhOnline.includes(k))}
                  chon={f.kenhSan.filter(k => f.kenhOnline.includes(k))}
                  doi={k => sua({ kenhSan: bat(f.kenhSan, k) })}
                  trong="Chọn sàn"
                />
              </div>
            </>
          )}

          {loai === 'dn' && (
            <>
              <div className="m-form-dong">
                <label className="m-form-nhan">Phương pháp thuế GTGT</label>
                <Select
                  className="inp"
                  value={dnCoDinh ? 'khauTru' : f.ppGtgt}
                  disabled={dnCoDinh}
                  aria-label="Phương pháp thuế GTGT"
                  onChange={e => sua({ ppGtgt: e.target.value as PpGtgt })}
                  ds={(dnCoDinh ? (['khauTru'] as const) : (['tyLe', 'khauTru'] as const)).map(
                    v => ({ v, t: PP_GTGT[v] }),
                  )}
                />
              </div>
              <div className="m-form-dong">
                <label className="m-form-nhan">Phương pháp thuế TNDN</label>
                <Select
                  className="inp"
                  value={tndnCoDinh ? 'thuNhap' : f.ppTndn}
                  disabled={tndnCoDinh}
                  aria-label="Phương pháp thuế TNDN"
                  onChange={e => sua({ ppTndn: e.target.value as PpTndn })}
                  ds={[
                    ...(tndnCoDinh ? [] : [{ v: 'tyLe', t: PP_THU_NHAP.doanhThu }]),
                    { v: 'thuNhap', t: PP_THU_NHAP.loiNhuan },
                  ]}
                />
              </div>
            </>
          )}
        </div>
      </section>

      {/* Thẻ 3: Chế độ kế toán */}
      <section className="m-form-the">
        <h3 className="m-form-the-tieu">Chế độ kế toán</h3>
        <div className="m-form-luoi">
          <div className="m-form-dong">
            <label className="m-form-nhan">Ngày đầu năm</label>
            <ONgay
              value={dauNam}
              placeholder="dd/mm/yyyy"
              onChange={setDauNam}
              title="Chứng từ thêm mới phải có ngày từ ngày này trở đi"
            />
          </div>
          <div className="m-form-dong">
            <label className="m-form-nhan">Năm làm việc hiện tại</label>
            <Select
              className="inp"
              value={String(nam)}
              aria-label="Năm làm việc hiện tại"
              onChange={e => doiNam(Number(e.target.value))}
              ds={[-2, -1, 0, 1].map(d => String(new Date().getFullYear() + d)).map(n => ({ v: n, t: n }))}
            />
          </div>
          <div className="m-form-dong">
            <label className="m-form-nhan">Tính giá xuất kho</label>
            <Select className="inp">
              <option>Bình quân gia quyền cuối kỳ</option>
              <option>Bình quân tức thời</option>
              <option>Nhập trước xuất trước</option>
            </Select>
          </div>
        </div>
      </section>

      {/* Nút lưu dính đáy */}
      <div className="m-form-chan-dinh">
        <button
          type="button"
          className="btn pri"
          style={{ width: '100%', height: 44, borderRadius: 12 }}
          onClick={luuDv}
        >
          Lưu thông tin đơn vị
        </button>
      </div>
    </div>
  )
}

// ── 5. Màn Cấu hình kế toán ──
export const MCauHinh: FC<ScreenProps> = () => {
  const { s, set, toast } = useSession()
  const noco = kieuGhiSo(s.cheDo) === 'noco'

  return (
    <div className="m-ht-khung">
      {/* Thẻ 1: Bộ định khoản tự động */}
      <section className="m-form-the">
        <h3 className="m-form-the-tieu">Bộ định khoản tự động</h3>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink)' }}>
          {noco ? (
            <>
              <p>Thứ tự ưu tiên tài khoản: hàng hoá, rồi nhóm hàng, rồi mặc định của chế độ.</p>
              <Link className="btn sm ghost" to="/app/danh-muc/1-15" style={{ marginTop: 8 }}>
                Sửa bộ định khoản (1.15)
              </Link>
            </>
          ) : (
            <p className="muted">
              Chế độ {cheDoHienTai(s).ngan} không dùng tài khoản Nợ/Có nên không có bộ định khoản.
            </p>
          )}
        </div>
      </section>

      {/* Thẻ 2: Đánh số chứng từ */}
      <section className="m-form-the">
        <h3 className="m-form-the-tieu">Đánh số chứng từ</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { loai: 'Phiếu thu', mau: 'PT{YY}{MM}-{0000}', vd: 'PT2610-0001' },
            { loai: 'Phiếu chi', mau: 'PC{YY}{MM}-{0000}', vd: 'PC2610-0241' },
            { loai: 'Xuất bán POS', mau: 'Số HĐ FABi', vd: 'YHLTJTAKD76Z' },
            { loai: 'Mua hàng', mau: 'MH{YY}{MM}-{0000}', vd: 'MH2610-0118' },
          ].map(item => (
            <div key={item.loai} className="m-ch-mau-so">
              <span style={{ fontWeight: 500 }}>{item.loai}</span>
              <span className="code" style={{ fontSize: 12 }}>
                {item.mau}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Thẻ 3: Đồng bộ bán hàng từ FABi */}
      <section className="m-form-the">
        <h3 className="m-form-the-tieu">Đồng bộ bán hàng từ FABi</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            [
              'chiTiet',
              'Chi tiết theo hoá đơn',
              'Mỗi hoá đơn trên FABi là một chứng từ Xuất bán POS. Xem được từng đơn, giờ bán, kênh.',
            ],
            [
              'kenh',
              'Tổng hợp theo kênh',
              'Mỗi ngày, mỗi chi nhánh, mỗi kênh bán là một chứng từ. Ít chứng từ, sổ gọn.',
            ],
          ].map(([k, ten, mota]) => (
            <label
              key={k}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="dongBoFabiMobile"
                style={{ marginTop: 3 }}
                checked={(s.dongBoFabi ?? 'kenh') === k}
                onChange={() => {
                  set({ dongBoFabi: k as 'chiTiet' | 'kenh' })
                  toast(`Đồng bộ FABi: ${ten.toLowerCase()}`)
                }}
              />
              <div>
                <b style={{ fontSize: 13.5 }}>{ten}</b>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                  {mota}
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Thẻ 4: Chi nhánh và ánh xạ POS */}
      <section className="m-form-the">
        <h3 className="m-form-the-tieu">Chi nhánh và ánh xạ POS</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dsChiNhanh(s).map(c => {
            const kho = CHI_NHANH.find(x => x.id === c.id)?.kho ?? [
              `Kho ${c.ten.replace(/^Phố Mây /, '')}`,
            ]
            const khoHien = s.goi === 'F' || s.goi === 'S' ? kho[0] : `${kho.length} kho`
            return (
              <div key={c.id} className="m-ch-mau-so">
                <div>
                  <b>{c.ten}</b>
                  <div className="muted" style={{ fontSize: 11.5 }}>
                    Mã FABi: FB-{c.id.toUpperCase()}-01
                  </div>
                </div>
                <span className="chip" style={{ fontSize: 11 }}>
                  {khoHien}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Nút lưu dính đáy */}
      <div className="m-form-chan-dinh">
        <button
          type="button"
          className="btn pri"
          style={{ width: '100%', height: 44, borderRadius: 12 }}
          onClick={() => toast('Đã lưu cấu hình')}
        >
          Lưu cấu hình
        </button>
      </div>
    </div>
  )
}
