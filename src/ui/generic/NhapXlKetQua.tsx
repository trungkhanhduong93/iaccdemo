import type { CotMau } from './mauNhapDm'
import type { DongKiem, KetQuaNhap } from './nhapDmKieu'

// (T892, gói 5) Định dạng ngày giờ dạng dd/mm/yyyy hh:mm cho dải thông báo kết quả
function formatLuc(luc: Date | string): string {
  const d = luc instanceof Date ? luc : new Date(luc)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  const ngay = pad(d.getDate())
  const thang = pad(d.getMonth() + 1)
  const nam = d.getFullYear()
  const gio = pad(d.getHours())
  const phut = pad(d.getMinutes())
  return `${ngay}/${thang}/${nam} ${gio}:${phut}`
}

// (T892, gói 5) Tiêu đề cột trên bảng kết quả theo mẫu
function layTieuDeCot(c: CotMau): string {
  if (c.k === 'ma') return 'Mã'
  if (c.k === 'nhom') return 'Nhóm'
  if (c.k === 'loai') return 'Loại'
  if (c.k === 'dvt') return 'ĐVT'
  return c.nhanGoc || c.nhan.replace(/\s*\*$/, '')
}

// (T892, gói 5) Chiều rộng cột trên bảng kết quả
function layRongCot(c: CotMau, idx: number, tong: number): number | undefined {
  if (c.k === 'ten' || (idx === 1 && tong > 2 && c.k !== 'ma')) return undefined
  if (c.k === 'ma') return 120
  if (c.k === 'nhom' || c.k.includes('nhom')) return 170
  if (c.k === 'loai' || c.k.includes('loai')) return 140
  if (c.k === 'dvt') return 90
  if (c.so || c.kieu === 'tien' || c.kieu === 'so') return 120
  return 140
}

// (T892, gói 5) Lấy giá trị chuỗi hiển thị từng ô
function layGiaTriO(r: DongKiem, c: CotMau): string {
  const v = r.gt?.[c.k]
  if (v !== undefined && v !== null && v !== '') {
    if (typeof v === 'boolean') return v ? 'Có' : 'Không'
    return String(v)
  }
  const cVal = r.chu?.[c.k]
  if (cVal !== undefined && cVal !== null) return String(cVal)
  return ''
}

export interface NhapXlDangNhapProps {
  tenDm: string
  xong: number
  tong: number
  dangGhi?: DongKiem
  cot: CotMau[]
}

/** Màn Đang nhập, phần bên phải cột bước (T892, gói 5) */
export function NhapXlDangNhap({ tenDm, xong, tong, dangGhi }: NhapXlDangNhapProps) {
  const phanTram = tong > 0 ? Math.round((xong / tong) * 100) : 0

  let dongText = ''
  if (dangGhi) {
    const ma = dangGhi.gt?.ma ?? dangGhi.chu?.ma ?? ''
    const ten = dangGhi.gt?.ten ?? dangGhi.chu?.ten ?? ''
    if (ma && ten) {
      dongText = `Đang ghi dòng ${dangGhi.dong}: ${ma} · ${ten}`
    } else if (ma || ten) {
      dongText = `Đang ghi dòng ${dangGhi.dong}: ${ma || ten}`
    } else {
      dongText = `Đang ghi dòng ${dangGhi.dong}`
    }
  }

  return (
    <div className="nxq-dang-nhap">
      <div className="nxq-dn-hop">
        <div>
          <div className="nxq-dn-tieude">Đang nhập vào danh mục {tenDm}</div>
          <div className="nxq-dn-phu">Giữ hộp này mở tới khi xong. Dòng nào đã ghi thì không bị mất nếu mạng chập chờn.</div>
        </div>
        <div>
          <div className="nxq-dn-thanh-so">
            <span className="nxq-dn-dem">{xong} / {tong} dòng</span>
            <span className="nxq-dn-phantram">{phanTram}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Số dòng đã nhập"
            aria-valuenow={phanTram}
            aria-valuemin={0}
            aria-valuemax={100}
            className="nxq-dn-thanh-day"
          >
            <div className="nxq-dn-thanh-chay" style={{ width: `${phanTram}%` }} />
          </div>
        </div>
        <div className="nxq-dn-dang-ghi" style={{ minHeight: '18px' }}>
          {dongText}
        </div>
      </div>
    </div>
  )
}

export interface NhapXlKetQuaProps {
  kq: KetQuaNhap
  tenDm: string
  tenFile: string
  cot: CotMau[]
  onTaiLoi: () => void
  onNhapKhac: () => void
  onMoDs: () => void
}

/** Bước 3 Kết quả, phần bên phải cột bước (T892, gói 5) */
export function NhapXlKetQua({
  kq,
  tenDm,
  tenFile,
  cot,
  onTaiLoi,
  onNhapKhac,
  onMoDs,
}: NhapXlKetQuaProps) {
  const soDaNhap = kq.moi.length + kq.sua.length
  const cotHien = cot.slice(0, 6)
  const tatCaDong = [...kq.moi, ...kq.sua].sort((a, b) => a.dong - b.dong)
  const tenDmThuong = tenDm.charAt(0).toLowerCase() + tenDm.slice(1)

  return (
    <div className="nxq-ket-qua">
      {/* Dải thông báo xanh lá */}
      <div className="nxq-kq-banner">
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flex: 'none' }}
        >
          <path d="M5 12l5 5 9-10" />
        </svg>
        <span className="nxq-kq-banner-chu">
          Đã nhập {soDaNhap} dòng vào danh mục {tenDm} từ file {tenFile}.
        </span>
        <span className="nxq-kq-luc">{formatLuc(kq.luc)}</span>
      </div>

      {/* 3 ô đếm: Thêm mới, Cập nhật, Bỏ qua vì lỗi */}
      <div className="nxq-kq-thong-ke">
        <div className="nxq-kq-o-dem">
          <div className="nxq-kq-nhan">Thêm mới</div>
          <div className="nxq-kq-so-moi">
            {kq.moi.length} <span className="nxq-kq-donvi">dòng</span>
          </div>
        </div>
        <div className="nxq-kq-o-dem">
          <div className="nxq-kq-nhan">Cập nhật</div>
          <div className="nxq-kq-so-sua">
            {kq.sua.length} <span className="nxq-kq-donvi">dòng</span>
          </div>
        </div>
        <div className="nxq-kq-o-dem nxq-kq-o-loi">
          <div style={{ flex: 1 }}>
            <div className="nxq-kq-nhan">Bỏ qua vì lỗi</div>
            <div className="nxq-kq-so-loi">
              {kq.boQua.length} <span className="nxq-kq-donvi">dòng</span>
            </div>
          </div>
          {kq.boQua.length > 0 && (
            <button type="button" className="nxq-btn-tai-loi" onClick={onTaiLoi}>
              <svg
                aria-hidden="true"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14" />
              </svg>
              Tải file lỗi
            </button>
          )}
        </div>
      </div>

      {/* Tiêu đề danh sách và liên kết thao tác */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="nxq-kq-tieu-de-hang">
          <div className="nxq-kq-tieu-de-ds">{tenDm} vừa nhập</div>
          <button type="button" className="nxq-link" onClick={onNhapKhac}>
            Nhập file khác
          </button>
          <span className="nxq-kq-phan-cach" />
          <button type="button" className="nxq-link" onClick={onMoDs}>
            Mở danh sách {tenDmThuong}
          </button>
        </div>

        {/* Bảng danh sách vừa nhập */}
        <div className="nxq-kq-bang-hop">
          <table>
            <colgroup>
              <col style={{ width: 110 }} />
              {cotHien.map((c, i) => {
                const w = layRongCot(c, i, cotHien.length)
                return <col key={c.k} style={w ? { width: w } : undefined} />
              })}
            </colgroup>
            <thead>
              <tr>
                <th>Xử lý</th>
                {cotHien.map(c => (
                  <th key={c.k}>{layTieuDeCot(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tatCaDong.map((r, idx) => {
                const laMoi = r.xuLy === 'moi'
                const ttMau = laMoi ? '#138a52' : '#0560a6'
                const ttText = laMoi ? 'Thêm mới' : 'Cập nhật'
                return (
                  <tr key={r.dong ?? idx}>
                    <td>
                      <span className="nxq-kq-tag-xu-ly" style={{ color: ttMau }}>
                        <span className="nxq-kq-cham-xu-ly" style={{ background: ttMau }} />
                        {ttText}
                      </span>
                    </td>
                    {cotHien.map(c => {
                      const val = layGiaTriO(r, c)
                      return (
                        <td key={c.k} title={val || undefined}>
                          {val}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
