// Màn hình Gói thuê bao & Bản quyền phần mềm (T119)
// Thiết kế lại theo chuẩn SaaS chuyên nghiệp: Thẻ hiện trạng bản quyền, 4 thẻ gói dịch vụ, bảng so sánh chi tiết, FAQ
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { useSession, donViHienTai, cheDoHienTai } from '../../app/session'
import { GOIS, GOI, FEATURES, type Goi, demTheoGoi, MODS } from '../../app/plan'
import { MODULES, duongDan } from '../../app/registry'
import { cheDoCuaGoi } from '../../app/che-do'
import { PageHead, Pk } from '../../ui/Page'
import { Icon } from '../../ui/Icon'
import { GoiLogo, GoiIconSvg } from '../../ui/GoiLogo'

export function GoiThueBao({ sc }: ScreenProps) {
  const { s, set, toast } = useSession()
  const dv = donViHienTai(s)

  // Mở rộng/thu gọn phân hệ trong bảng so sánh: mặc định mở phân hệ đầu tiên
  const [mo, setMo] = useState<number | null>(0)
  // Kỳ thanh toán: năm (tiết kiệm) hoặc tháng
  const [ky, setKy] = useState<'nam' | 'thang'>('nam')
  // Tìm kiếm tính năng trong bảng ma trận
  const [tim, setTim] = useState('')
  // Lọc chỉ xem tính năng có sự khác nhau giữa các gói
  const [chiKhacNhau, setChiKhacNhau] = useState(false)
  // Modal / xác nhận chuyển gói
  const [dangChuyen, setDangChuyen] = useState<Goi | null>(null)

  // Bảng giá hiển thị theo chu kỳ
  const giaNam: Record<Goi, { gia: string; chuKy: string; ghiChu: string }> = {
    F: { gia: '0 đ', chuKy: '/ trọn đời', ghiChu: 'Miễn phí vĩnh viễn' },
    S: { gia: '199.000 đ', chuKy: '/ tháng', ghiChu: 'Thanh toán theo năm (2.388.000 đ/năm)' },
    PL: { gia: '399.000 đ', chuKy: '/ tháng', ghiChu: 'Thanh toán theo năm (4.788.000 đ/năm)' },
    PR: { gia: '699.000 đ', chuKy: '/ tháng', ghiChu: 'Thanh toán theo năm (8.388.000 đ/năm)' },
  }

  const giaThang: Record<Goi, { gia: string; chuKy: string; ghiChu: string }> = {
    F: { gia: '0 đ', chuKy: '/ trọn đời', ghiChu: 'Miễn phí vĩnh viễn' },
    S: { gia: '249.000 đ', chuKy: '/ tháng', ghiChu: 'Thanh toán linh hoạt từng tháng' },
    PL: { gia: '499.000 đ', chuKy: '/ tháng', ghiChu: 'Thanh toán linh hoạt từng tháng' },
    PR: { gia: '850.000 đ', chuKy: '/ tháng', ghiChu: 'Thanh toán linh hoạt từng tháng' },
  }

  const bangGia = ky === 'nam' ? giaNam : giaThang

  // Điểm nổi bật theo từng gói cho F&B
  const diemNoiBat: Record<Goi, { tieuDe: string; ds: string[] }> = {
    F: {
      tieuDe: 'Hộ kinh doanh & Quán ăn nhỏ',
      ds: [
        '17 sổ sách & báo cáo hộ kinh doanh theo TT152/2025',
        'Tự động nhận đơn bán hàng trực tiếp từ POS FABi',
        'Quản lý xuất bán POS và kiểm kê kho định kỳ',
        'Theo dõi quỹ tiền mặt, doanh thu và chi phí hoạt động',
        'Miễn phí 100% trọn đời cho 1 điểm bán',
      ],
    },
    S: {
      tieuDe: 'Doanh nghiệp siêu nhỏ 1 điểm bán',
      ds: [
        'Bao gồm toàn bộ tính năng của gói Free',
        'Bộ 11 sổ sách & BCTC tinh gọn theo TT58/2026',
        'Tự động tính thuế GTGT và TNDN theo 4 phương pháp',
        'Quản lý mua hàng, công nợ nhà cung cấp và nhập kho',
        'Theo dõi nghĩa vụ thuế GTGT và thuế khác đầy đủ',
      ],
    },
    PL: {
      tieuDe: 'Doanh nghiệp & Chuỗi 1–10 điểm bán',
      ds: [
        'Bao gồm toàn bộ tính năng của gói Standard',
        'Hạch toán kép Nợ/Có đầy đủ theo TT133/2016',
        'Quản lý chuỗi đa chi nhánh từ 1 đến 10 điểm bán',
        'Khấu hao TSCĐ, phân bổ CCDC và thẻ chi phí chuyên sâu',
        'Đầy đủ bộ Báo cáo tài chính, Lưu chuyển tiền tệ, CĐPS',
      ],
    },
    PR: {
      tieuDe: 'Chuỗi F&B lớn trên 10 điểm bán',
      ds: [
        'Bao gồm toàn bộ tính năng của gói Plus',
        'Không giới hạn số lượng điểm bán, kho hàng và người dùng',
        'Chế độ kế toán pháp định TT99/2025 cho DN vừa và lớn',
        'Quản lý số lô, hạn sử dụng, hạch toán đa chi nhánh',
        'Báo cáo quản trị tổng hợp chuỗi đa chiều theo thời gian thực',
      ],
    },
  }

  // Danh sách tính năng lọc theo từ khóa và điều kiện khác nhau
  const danhSachLoc = useMemo(() => {
    return MODS.map((tenMod, modIdx) => {
      let ds = FEATURES.filter(f => f.m === modIdx)
      if (tim.trim()) {
        const q = tim.toLowerCase().trim()
        ds = ds.filter(f => f.n.toLowerCase().includes(q) || f.c.toLowerCase().includes(q))
      }
      if (chiKhacNhau) {
        ds = ds.filter(f => f.g.length < GOIS.length)
      }
      return {
        tenMod,
        modIdx,
        ds,
        tong: FEATURES.filter(f => f.m === modIdx).length,
      }
    }).filter(m => m.ds.length > 0)
  }, [tim, chiKhacNhau])

  const tongTinhNangLoc = useMemo(() => {
    return danhSachLoc.reduce((acc, cur) => acc + cur.ds.length, 0)
  }, [danhSachLoc])

  const moTatCa = () => setMo(mo === -1 ? null : -1)

  // Thực hiện đổi gói
  const thucHienDoiGoi = (g: Goi) => {
    const cdMoi = cheDoCuaGoi(g)
    set({ goi: g, cheDo: cdMoi.ma })
    toast(`Đã chuyển đơn vị ${dv.viettat} sang gói ${GOI[g].ten} (${cdMoi.soHieu})`)
    setDangChuyen(null)
  }

  return (
    <div className="page gtb-page">
      <PageHead
        crumb={['Hệ thống']}
        title={sc.ten || 'Gói thuê bao & Bản quyền'}
        meta={
          <>
            <Pk g={s.goi} logo />
            <span className="chip">{cheDoHienTai(s).soHieu}</span>
            <span className="chip ok">Bản quyền chính thức</span>
          </>
        }
      >
        <button
          className="btn acc"
          onClick={() => toast('Yêu cầu gia hạn đã được gửi tới chuyên viên hỗ trợ iPOS')}
        >
          <Icon n="sparkle" className="ic sm" /> Gia hạn online
        </button>
      </PageHead>

      {/* ── 1. Thẻ Hiện Trạng Bản Quyền Đơn Vị (Hero Status Card) ── */}
      <section className="card gtb-hero">
        <div className="gtb-hero-trai">
          <div className="gtb-hero-logo-box">
            <GoiLogo g={s.goi} size={52} glow />
          </div>
          <div className="gtb-hero-info">
            <div className="gtb-hero-badge-row">
              <span className="chip ok"><span className="pulse" /> Đang hoạt động</span>
              <span className="chip">MST: {dv.mst}</span>
              <span className="chip">{dv.diem} điểm bán</span>
            </div>
            <h2 className="gtb-hero-ten">
              Gói {GOI[s.goi].ten} · <span className="gtb-hero-dv">{dv.ten}</span>
            </h2>
            <p className="gtb-hero-mota">
              Chế độ kế toán áp dụng: <b>{cheDoHienTai(s).soHieu}</b> ({cheDoHienTai(s).ten}) ·{' '}
              {GOI[s.goi].mota}
            </p>
          </div>
        </div>

        <div className="gtb-hero-phai">
          <div className="gtb-hero-stat">
            <div className="gtb-hero-stat-label">Thời hạn thuê bao</div>
            <div className="gtb-hero-stat-value">
              06/10/2027 <small className="gtb-hero-stat-con">Còn 361 ngày</small>
            </div>
            <div className="gtb-hero-bar" title="Tiến độ thời hạn bản quyền">
              <div className="gtb-hero-bar-in" style={{ width: '74%' }} />
            </div>
          </div>
          <div className="gtb-hero-actions">
            <button
              className="btn pri"
              onClick={() => toast('Đã kích hoạt gia hạn trực tuyến thêm 12 tháng')}
            >
              Gia hạn thêm 1 năm
            </button>
            <a
              className="btn"
              href="tel:19004766"
              title="Tổng đài hỗ trợ phần mềm kế toán iPOS"
            >
              <Icon n="help" className="ic sm" /> 1900 4766
            </a>
          </div>
        </div>
      </section>

      {/* ── 2. Thanh Chuyển Đổi Kỳ Thanh Toán & Giới Thiệu ── */}
      <div className="gtb-chon-ky-wrap">
        <div className="gtb-chon-ky-head">
          <h3 className="gtb-sec-title">Bảng giá và các gói phiên bản IACC Cloud</h3>
          <p className="gtb-sec-sub">
            Chọn gói bản quyền phù hợp với mô hình kinh doanh F&B từ quán đơn lẻ tới chuỗi quy mô lớn
          </p>
        </div>

        <div className="gtb-ky-switch">
          <button
            className={`gtb-ky-btn ${ky === 'nam' ? 'on' : ''}`}
            onClick={() => setKy('nam')}
          >
            Thanh toán theo năm <span className="gtb-tiet-kiem">Tiết kiệm 20%</span>
          </button>
          <button
            className={`gtb-ky-btn ${ky === 'thang' ? 'on' : ''}`}
            onClick={() => setKy('thang')}
          >
            Thanh toán theo tháng
          </button>
        </div>
      </div>

      {/* ── 3. Dải 4 Thẻ Gói Thuê Bao (Pricing Cards) ── */}
      <div className="grid g4 gtb-cards">
        {GOIS.map(g => {
          const n = demTheoGoi(g)
          const dang = g === s.goi
          const laKhuyenDung = g === 'PL'
          const thongTinGia = bangGia[g]
          const highlights = diemNoiBat[g]
          const cd = cheDoCuaGoi(g)

          return (
            <div
              key={g}
              className={`card gtb-card gtb-card-${g.toLowerCase()}${dang ? ' is-active' : ''}${laKhuyenDung && !dang ? ' is-popular' : ''}`}
            >
              {/* Badge góc trên */}
              {dang ? (
                <div className="gtb-card-ribbon active">
                  <Icon n="check" className="ic sm" /> ĐANG SỬ DỤNG
                </div>
              ) : laKhuyenDung ? (
                <div className="gtb-card-ribbon popular">
                  <Icon n="sparkle" className="ic sm" /> KHUYÊN DÙNG CHO CHUỖI
                </div>
              ) : null}

              {/* Đầu thẻ gói */}
              <div className="gtb-card-top">
                <div className="gtb-card-logo-row">
                  <GoiLogo g={g} size={42} glow={dang || laKhuyenDung} />
                  <div className="gtb-card-ten-wrap">
                    <h3 className="gtb-card-ten">{GOI[g].ten}</h3>
                    <span className="gtb-card-sub">{highlights.tieuDe}</span>
                  </div>
                </div>

                {/* Khối giá */}
                <div className="gtb-card-gia-box">
                  <div className="gtb-card-gia">
                    <span className="gtb-card-gia-so">{thongTinGia.gia}</span>
                    <span className="gtb-card-gia-ky">{thongTinGia.chuKy}</span>
                  </div>
                  <div className="gtb-card-gia-ghi">{thongTinGia.ghiChu}</div>
                </div>
              </div>

              {/* Nút thao tác CTA */}
              <div className="gtb-card-cta">
                {dang ? (
                  <button className="btn gtb-btn-curr" disabled>
                    <Icon n="check" className="ic sm" /> Gói bạn đang dùng
                  </button>
                ) : (
                  <button
                    className={`btn ${g === 'PL' || g === 'PR' ? 'acc' : 'pri'} gtb-btn-act`}
                    onClick={() => setDangChuyen(g)}
                  >
                    {GOIS.indexOf(g) > GOIS.indexOf(s.goi) ? (
                      <>Nâng cấp lên {GOI[g].ten} <Icon n="chevr" className="ic sm" /></>
                    ) : (
                      <>Chuyển về {GOI[g].ten}</>
                    )}
                  </button>
                )}
              </div>

              {/* Thông số cốt lõi */}
              <div className="gtb-card-specs">
                <div className="gtb-spec-row">
                  <span className="gtb-spec-label">Tính năng mở</span>
                  <span className="gtb-spec-val">
                    <b>{n.co}</b>/{n.tong} tính năng
                  </span>
                </div>
                <div className="gtb-mini-progress">
                  <div
                    className={`gtb-mini-progress-bar gtb-pb-${g.toLowerCase()}`}
                    style={{ width: `${Math.round((n.co / n.tong) * 100)}%` }}
                  />
                </div>

                <div className="gtb-spec-row" style={{ marginTop: 8 }}>
                  <span className="gtb-spec-label">Chế độ kế toán</span>
                  <span className="gtb-spec-val"><b>{cd.soHieu}</b></span>
                </div>

                <div className="gtb-spec-row">
                  <span className="gtb-spec-label">Quy mô điểm bán</span>
                  <span className="gtb-spec-val">
                    {g === 'F' ? '1 điểm' : g === 'S' ? '1 điểm' : g === 'PL' ? '1–10 điểm' : 'Không giới hạn'}
                  </span>
                </div>
              </div>

              {/* Danh sách tính năng nổi bật */}
              <div className="gtb-card-features">
                <div className="gtb-feat-head">Tính năng nổi bật:</div>
                <ul className="gtb-feat-list">
                  {highlights.ds.map((item, idx) => (
                    <li key={idx}>
                      <Icon n="check" className="ic sm gtb-check-ic" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 4. Bảng So Sánh Chi Tiết Tính Năng Theo Phân Hệ ── */}
      <section className="card gtb-matrix-card" style={{ marginTop: 24 }}>
        <div className="card-h gtb-matrix-h">
          <div>
            <h3>So sánh chi tiết 120 tính năng theo phân hệ</h3>
            <span className="sub">
              Dữ liệu chuẩn hóa từ Roadmap & Dự kiến tính năng IACC Cloud · Đang hiện {tongTinhNangLoc} tính năng
            </span>
          </div>

          <div className="gtb-matrix-controls">
            <div className="gtb-tim-box">
              <Icon n="search" className="ic sm" />
              <input
                type="text"
                placeholder="Tìm tính năng hoặc mã (vd: 3.1.1, kho, thuế)..."
                value={tim}
                onChange={e => setTim(e.target.value)}
              />
              {tim && (
                <button className="gtb-tim-xoa" onClick={() => setTim('')} title="Xóa tìm kiếm">
                  <Icon n="close" className="ic sm" />
                </button>
              )}
            </div>

            <label className="gtb-khac-nhau-toggle" title="Chỉ hiện tính năng các gói có sự khác nhau">
              <input
                type="checkbox"
                checked={chiKhacNhau}
                onChange={e => setChiKhacNhau(e.target.checked)}
              />
              <span>Chỉ xem tính năng khác biệt</span>
            </label>

            <button className="btn sm" onClick={moTatCa}>
              {mo === -1 ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
            </button>
          </div>
        </div>

        <div className="gtb-table-wrap">
          <table className="tbl matrix gtb-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Phân hệ & Tính năng nghiệp vụ</th>
                {GOIS.map(g => (
                  <th key={g} className={`c gtb-col-head ${g === s.goi ? 'gtb-curr-col' : ''}`}>
                    <div className="gtb-col-head-inner">
                      <GoiLogo g={g} size={24} />
                      <span className="gtb-col-ten">{GOI[g].ten}</span>
                      <div className="gtb-col-tag-wrap">
                        {g === s.goi && <span className="gtb-curr-tag">Đang dùng</span>}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {danhSachLoc.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--muted)' }}>
                    Không tìm thấy tính năng nào phù hợp với từ khóa &ldquo;{tim}&rdquo;.
                  </td>
                </tr>
              ) : (
                danhSachLoc.map(({ tenMod, modIdx, ds, tong }) => {
                  const mod = MODULES.find(x => x.mod === modIdx)
                  const dangMo = mo === -1 || mo === modIdx

                  return [
                    <tr
                      key={tenMod}
                      className="gtb-mod-row click"
                      onClick={() => setMo(dangMo && mo !== -1 ? null : modIdx)}
                    >
                      <td>
                        <span className="row">
                          <Icon n={dangMo ? 'chevd' : 'chevr'} className="ic sm gtb-mod-chev" />
                          <b className="gtb-mod-ten">{tenMod}</b>
                          <small className="gtb-mod-count">({ds.length}/{tong} tính năng)</small>
                        </span>
                      </td>
                      {GOIS.map(g => {
                        const soCo = ds.filter(f => f.g.includes(g)).length
                        return (
                          <td key={g} className={`c gtb-mod-stat ${g === s.goi ? 'gtb-curr-col' : ''}`}>
                            {soCo > 0 ? (
                              <span className="gtb-mod-pill">
                                <b>{soCo}</b>/{ds.length}
                              </span>
                            ) : (
                              <span className="x">—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>,
                    ...(dangMo
                      ? ds.map(f => {
                          const scx = mod?.screens.find(z => z.code === f.c)
                          return (
                            <tr key={f.c} className="sub gtb-sub-row">
                              <td>
                                <div className="gtb-feat-cell">
                                  <span className="gtb-feat-code">{f.c}</span>
                                  {mod && scx ? (
                                    <Link
                                      to={duongDan(mod, scx)}
                                      className="gtb-feat-link"
                                      title={`Mở màn hình ${f.n}`}
                                    >
                                      {f.n}
                                    </Link>
                                  ) : (
                                    <span className="gtb-feat-name">{f.n}</span>
                                  )}
                                  {f.grp && <span className="gtb-feat-grp">{f.grp}</span>}
                                </div>
                              </td>
                              {GOIS.map(g => {
                                const coTrong = f.g.includes(g)
                                return (
                                  <td key={g} className={`c ${g === s.goi ? 'gtb-curr-col' : ''}`}>
                                    {coTrong ? (
                                      <span className="gtb-has-feat">
                                        <Icon n="check" className="ic sm" />
                                      </span>
                                    ) : (
                                      <span className="x">—</span>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })
                      : []),
                  ]
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 5. Khối Hỏi Đáp Thường Gặp Về Bản Quyền (FAQ) ── */}
      <section className="card gtb-faq-card" style={{ marginTop: 24, padding: 22 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>
          Câu hỏi thường gặp về gói phần mềm & bản quyền IACC Cloud
        </h3>
        <div className="grid g2" style={{ gap: 16 }}>
          <div className="gtb-faq-item">
            <b>1. Dữ liệu chứng từ có bị ảnh hưởng khi chuyển đổi hoặc nâng cấp gói không?</b>
            <p>
              Toàn bộ chứng từ, danh mục và số dư được giữ nguyên vẹn.
              Khi nâng cấp gói, hệ thống tự động mở thêm sổ sách và tính năng mới.
            </p>
          </div>
          <div className="gtb-faq-item">
            <b>2. Tôi có thể đổi chế độ kế toán sau khi nâng cấp gói không?</b>
            <p>
              Có. Bạn vào mục <b>Hệ thống &gt; Cấu hình kế toán</b> để đổi sang chế độ
              phù hợp với quy mô doanh nghiệp (TT152, TT58, TT133, TT99).
            </p>
          </div>
          <div className="gtb-faq-item">
            <b>3. Gói Free có bị giới hạn thời gian hay số lượng chứng từ không?</b>
            <p>
              Gói Free mở vĩnh viễn cho hộ kinh doanh 1 điểm bán.
              Gói đáp ứng đủ 17 báo cáo theo Thông tư 152/2025/TT-BTC.
            </p>
          </div>
          <div className="gtb-faq-item">
            <b>4. Chuỗi nhiều nhà hàng cần gói chuyên biệt thì liên hệ như thế nào?</b>
            <p>
              Đội ngũ tư vấn iPOS sẵn sàng hỗ trợ khảo sát và demo giải pháp hạch toán đa chi nhánh theo số Hotline{' '}
              <b>1900 4766 (Nhánh 2)</b> hoặc liên hệ trực tiếp chuyên viên kinh doanh phụ trách khu vực của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* ── Modal Xác Nhận Chuyển Gói ── */}
      {dangChuyen && (
        <div className="gtb-overlay" onClick={() => setDangChuyen(null)}>
          <div className="card gtb-dialog" onClick={e => e.stopPropagation()}>
            <div className="gtb-dialog-header">
              <GoiLogo g={dangChuyen} size={40} glow />
              <div>
                <h3 style={{ margin: 0, fontSize: 17 }}>Xác nhận chuyển sang gói {GOI[dangChuyen].ten}</h3>
                <span className="muted" style={{ fontSize: 13 }}>
                  Áp dụng cho đơn vị {dv.ten} (MST: {dv.mst})
                </span>
              </div>
            </div>

            <div className="gtb-dialog-body" style={{ margin: '16px 0', fontSize: 13.5, lineHeight: 1.55 }}>
              <p>
                Bạn sắp chuyển sang gói <b>{GOI[dangChuyen].ten}</b>. Chế độ kế toán mặc định sẽ chuyển sang{' '}
                <b>{cheDoCuaGoi(dangChuyen).soHieu}</b> ({cheDoCuaGoi(dangChuyen).ten}).
              </p>
              <div style={{ background: 'var(--soft)', padding: 12, borderRadius: 8, marginTop: 10 }}>
                ✓ Mở khóa {demTheoGoi(dangChuyen).co} tính năng nghiệp vụ.<br />
                ✓ Dữ liệu kế toán hiện tại được lưu giữ an toàn.
              </div>
            </div>

            <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn" onClick={() => setDangChuyen(null)}>Hủy bỏ</button>
              <button className="btn acc" onClick={() => thucHienDoiGoi(dangChuyen)}>
                Xác nhận chuyển gói
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
