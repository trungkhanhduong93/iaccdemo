// Trang chủ gói Free trên điện thoại (T324)
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { donViHienTai, dsCuaHang, useSession } from '../../app/session'
import { CUA_HANG, KHOA_SO_DEN, KY_MO, ROLE } from '../../data/mock'
import { Icon, ONen } from '../Icon'
import { fold, moneyD, pct, short } from '../format'
import { type KyBaoCao, tinhToanTongQuan } from '../../modules/home/chiSo'
import { tonQuyTheoSo } from '../../modules/home/LichSuQuy'
import { moTaCach, nvlKy } from '../../modules/home/chi-phi-nvl'
import { useMoTuTrangChu } from '../../app/tuTrangChu'
import { Select } from '../Dropdown'
import { datLocDaXem } from '../bao-cao/tuyChinhBC'
import { MKhoFree } from './MKhoFree'
import { HopLaiLo13, HopThuChi13, laiLo13Thang, thuChi13Thang } from '../../modules/home/BaBaiToanFree'
import { ModalQuy } from '../../modules/home/quyThuChi'
import { useThaoTacNhanh, TOI_DA_THAO_TAC, type ThaoTacMuc } from '../../app/thaoTacNhanh'
import { MTimKiem } from './MTimKiem'
import { MChon } from './MChon'
import { MODULES, tenPhanHe } from '../../app/registry'
import { anNgoaiGoi, minGoi } from '../../app/plan'
import { Pk } from '../Page'
import { DS_QUY_TIEN_112 } from '../../modules/danh-muc/data'
import { layLaiLoCuaHang } from '../../modules/home/soLieuBieuDoFree'

/** 5 quỹ mẫu chỉ có số dư, đồng bộ với BaBaiToanFree (T303) */
const QUY_MAU_THEM = [
  { quy: 'Quỹ tiền mặt Hai Bà Trưng', tienMat: true, cuoi: 8_400_000 },
  { quy: 'Quỹ tiền mặt Phú Nhuận', tienMat: true, cuoi: 16_250_000 },
  { quy: 'Quỹ tiền mặt Thủ Đức', tienMat: true, cuoi: 12_700_000 },
  { quy: 'MB Bank, chi nhánh Phú Nhuận', tienMat: false, cuoi: 41_300_000 },
  { quy: 'VPBank, chi nhánh Thủ Đức', tienMat: false, cuoi: 33_600_000 },
].map(q => ({ ...q, mo: q.cuoi, thu: 0, chi: 0 }))

/** Tên hiển thị của quỹ theo Danh mục Quỹ tiền 1.12 (T309) */
function tenQuyDanhMuc(quy: string, tienMat: boolean) {
  if (tienMat) return quy
  const nh = quy.split(/[ ,]/)[0]
  return DS_QUY_TIEN_112.find(x => x.loai === 'Ngân hàng' && x.ten.split(/[ ,]/)[0] === nh)?.ten ?? quy.replace(/(\s+[\d.\- ]+)+$/, '')
}

/** Màu lát biểu đồ tròn tồn quỹ (T291) */
const MAU_QUY = [
  'var(--blue, #0560a6)',
  'var(--teal, #0f766e)',
  'var(--amber, #b45309)',
  'var(--indigo, #4338ca)',
  'var(--green, #138a52)',
  'var(--orange-d, #d0650a)',
  '#7c3aed',
  '#0891b2',
]

const QUY_HIEN = 4
const QUY_KHAC = 'tat-ca'

/** Biểu đồ tròn tồn quỹ trên điện thoại, đồng bộ với web Free (T291, T303, T324) */
function VongQuy({
  ds: dsGoc,
  tong,
  onChon,
}: {
  ds: { quy: string; tienMat: boolean; cuoi: number }[]
  tong: number
  onChon: (quy: string) => void
}) {
  const [tro, setTro] = useState<string | null>(null)
  const [moDs, setMoDs] = useState(false)

  useEffect(() => {
    if (!moDs) return
    const dong = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoDs(false)
    }
    document.addEventListener('keydown', dong)
    return () => document.removeEventListener('keydown', dong)
  }, [moDs])

  const chon = (quy: string) => {
    if (quy === QUY_KHAC) setMoDs(true)
    else onChon(quy)
  }

  const coMau = dsGoc.map((r, i) => ({
    ...r,
    mau: MAU_QUY[i % MAU_QUY.length],
    ten: tenQuyDanhMuc(r.quy, r.tienMat),
  }))

  const ds =
    coMau.length <= QUY_HIEN + 1
      ? coMau
      : (() => {
          const xep = [...coMau].sort((a, b) => b.cuoi - a.cuoi)
          const con = xep.slice(QUY_HIEN)
          const giu = new Set(xep.slice(0, QUY_HIEN).map(r => r.quy))
          return [
            ...coMau.filter(r => giu.has(r.quy)),
            {
              quy: QUY_KHAC,
              tienMat: false,
              cuoi: con.reduce((a, r) => a + r.cuoi, 0),
              mau: 'var(--faint, #9ca3af)',
              ten: `${con.length} quỹ khác`,
            },
          ]
        })()

  const co = 220
  const rr = 88
  const day = 36
  const C = 2 * Math.PI * rr
  const duong = ds.map(r => Math.max(0, r.cuoi))
  const tongDuong = duong.reduce((a, v) => a + v, 0) || 1
  let off = 0
  const dangTro = ds.find(r => r.quy === tro)

  return (
    <div className="bbt-vq m-tcf-vq">
      <svg
        className="bbt-vq-vong"
        viewBox={`0 0 ${co} ${co}`}
        width={co}
        height={co}
        role="img"
        aria-label="Biểu đồ tròn tồn quỹ theo quỹ"
      >
        <circle
          cx={co / 2}
          cy={co / 2}
          r={rr}
          fill="none"
          stroke="var(--line-2, #eee)"
          strokeWidth={day}
        />
        {ds.map(r => {
          const len = (Math.max(0, r.cuoi) / tongDuong) * C
          const el = (
            <circle
              key={r.quy}
              cx={co / 2}
              cy={co / 2}
              r={rr}
              fill="none"
              stroke={r.mau}
              strokeWidth={day}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-off}
              transform={`rotate(-90 ${co / 2} ${co / 2})`}
              className={`bbt-vq-lat${tro && tro !== r.quy ? ' mo' : ''}`}
              onClick={() => chon(r.quy)}
              onMouseEnter={() => setTro(r.quy)}
              onMouseLeave={() => setTro(null)}
            >
              <title>{`${r.ten}: ${moneyD(r.cuoi)}`}</title>
            </circle>
          )
          off += len
          return el
        })}
        <text x={co / 2} y={co / 2 - 8} textAnchor="middle" className="bbt-vq-nhan">
          {dangTro ? pct(tong ? dangTro.cuoi / tong : 0) : 'Tổng tồn quỹ'}
        </text>
        <text x={co / 2} y={co / 2 + 18} textAnchor="middle" className="bbt-vq-so">
          {short(dangTro ? dangTro.cuoi : tong)}
        </text>
      </svg>

      <ul className="bbt-vq-ct m-tcf-vq-ct">
        {ds.map(r => (
          <li key={r.quy}>
            <button
              type="button"
              className={tro === r.quy ? 'on' : ''}
              title={r.quy === QUY_KHAC ? 'Xem danh sách tất cả quỹ' : `Xem biểu đồ thu chi ${r.quy}`}
              onClick={() => chon(r.quy)}
              onMouseEnter={() => setTro(r.quy)}
              onMouseLeave={() => setTro(null)}
            >
              <i style={{ background: r.mau }} />
              <span className="bbt-vq-ten">
                <span title={r.quy === QUY_KHAC ? undefined : r.quy}>{r.ten}</span>
                <b>
                  {moneyD(r.cuoi)}
                  <small>{pct(tong ? r.cuoi / tong : 0)}</small>
                </b>
              </span>
              <Icon n="chevr" className="ic sm muted bbt-vq-mui" />
            </button>
          </li>
        ))}
      </ul>

      {moDs && (
        <>
          <div className="bbt-vq-ds-nen" onClick={() => setMoDs(false)} />
          <div className="bbt-vq-ds m-tcf-vq-ds" role="dialog" aria-label="Tất cả quỹ">
            <div className="bbt-vq-ds-dau">
              <b>Tất cả quỹ ({coMau.length})</b>
              <button
                type="button"
                className="pheu-dong"
                title="Đóng"
                aria-label="Đóng"
                onClick={() => setMoDs(false)}
              >
                <Icon n="x" className="ic sm" />
              </button>
            </div>
            <ul className="bbt-vq-ct">
              {[...coMau]
                .sort((x, y) => y.cuoi - x.cuoi)
                .map(r => (
                  <li key={r.quy}>
                    <button
                      type="button"
                      title={`Xem biểu đồ thu chi ${r.quy}`}
                      onClick={() => {
                        setMoDs(false)
                        onChon(r.quy)
                      }}
                    >
                      <i style={{ background: r.mau }} />
                      <span className="bbt-vq-ten">
                        <span title={r.quy}>{r.ten}</span>
                        <b>
                          {moneyD(r.cuoi)}
                          <small>{pct(tong ? r.cuoi / tong : 0)}</small>
                        </b>
                      </span>
                      <Icon n="chevr" className="ic sm muted bbt-vq-mui" />
                    </button>
                  </li>
                ))}
            </ul>
            <button
              type="button"
              className="nut bbt-e-nut"
              onClick={() => {
                setMoDs(false)
                onChon(QUY_KHAC)
              }}
            >
              Biểu đồ thu chi tất cả quỹ ›
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function MTrangChuFree(_props?: Partial<ScreenProps>) {
  const { s, set, toast } = useSession()
  const dv = donViHienTai(s)
  const moTuTrangChu = useMoTuTrangChu()

  // Cửa hàng
  const dsCnRaw = dsCuaHang(s)
  const dsCn = dsCnRaw.length ? dsCnRaw : CUA_HANG
  const cn = dsCn.find(c => c.id === s.cuaHang)
  const tenNgan = (id: string) => CUA_HANG.find(x => x.id === id)?.ngan
  const nhanCn = cn ? (tenNgan(cn.id) ?? cn.ten) : 'Tất cả'

  const selCns = useMemo(() => {
    if (!s.cuaHang || s.cuaHang === 'all') {
      return dsCn.map(c => c.id)
    }
    return [s.cuaHang]
  }, [s.cuaHang, dsCn])

  const dsChonCn = useMemo(() => {
    return [
      { k: 'all', ten: 'Tất cả cửa hàng', moTa: 'Chỉ xem gộp, chưa lập chứng từ' },
      ...dsCn.map(c => ({ k: c.id, ten: c.ten, moTa: tenNgan(c.id) })),
    ]
  }, [dsCn])

  // Chọn tháng, năm
  const [searchParams, setSearchParams] = useSearchParams()
  const thangUrl = Number(searchParams.get('thang'))
  const [thangF, setThangFState] = useState(thangUrl >= 7 && thangUrl <= 10 ? thangUrl : 10)
  const namUrl = Number(searchParams.get('nam'))
  const [namF, setNamFState] = useState(namUrl === 2026 ? namUrl : 2026)

  const setThangF = (t: number) => {
    setThangFState(t)
    setSearchParams(
      prev => {
        const n = new URLSearchParams(prev)
        n.set('thang', String(t))
        return n
      },
      { replace: true }
    )
  }

  const setNamF = (n: number) => {
    setNamFState(n)
    setSearchParams(
      prev => {
        const p = new URLSearchParams(prev)
        p.set('nam', String(n))
        return p
      },
      { replace: true }
    )
  }

  useEffect(() => {
    const t = Number(searchParams.get('thang'))
    if (t >= 7 && t <= 10 && t !== thangF) setThangFState(t)
    const n = Number(searchParams.get('nam'))
    if (n === 2026 && n !== namF) setNamFState(n)
  }, [searchParams, thangF, namF])

  // Modals
  const [moTimKiem, setMoTimKiem] = useState(false)
  const [moChonCn, setMoChonCn] = useState(false)
  const [moBieuDo, setMoBieuDo] = useState(false)
  const [moThuChi13, setMoThuChi13] = useState(false)
  const [modalQuy, setModalQuy] = useState<string | null>(null)

  // 1. Thao tác nhanh
  const {
    ds: thaoTacNhanhDs,
    tatCa: thaoTacTatCa,
    ids: thaoTacIds,
    luu: luuThaoTac,
    macDinhIds: thaoTacMacDinhIds,
  } = useThaoTacNhanh(s)
  const [moTuyChinhThaoTac, setMoTuyChinhThaoTac] = useState(false)
  const [chonThaoTacIds, setChonThaoTacIds] = useState<string[]>([])
  const [timThaoTac, setTimThaoTac] = useState('')

  useEffect(() => {
    if (!moTuyChinhThaoTac) return
    setChonThaoTacIds([...thaoTacIds])
    setTimThaoTac('')
  }, [moTuyChinhThaoTac, thaoTacIds])

  const mapThaoTac = useMemo(
    () => new Map(thaoTacTatCa.map(m => [m.id, m])),
    [thaoTacTatCa]
  )
  const chonThaoTacItems = useMemo(
    () =>
      chonThaoTacIds
        .map(id => mapThaoTac.get(id))
        .filter((x): x is ThaoTacMuc => x !== undefined && (!anNgoaiGoi(s.goi) || !x.khoa)),
    [chonThaoTacIds, mapThaoTac, s.goi]
  )

  const handleLenThaoTac = (idx: number) => {
    if (idx <= 0) return
    setChonThaoTacIds(prev => {
      const next = [...prev]
      const tam = next[idx - 1]
      next[idx - 1] = next[idx]
      next[idx] = tam
      return next
    })
  }

  const handleXuongThaoTac = (idx: number) => {
    if (idx >= chonThaoTacIds.length - 1) return
    setChonThaoTacIds(prev => {
      const next = [...prev]
      const tam = next[idx + 1]
      next[idx + 1] = next[idx]
      next[idx] = tam
      return next
    })
  }

  const handleBoChonThaoTac = (id: string) => {
    setChonThaoTacIds(prev => prev.filter(x => x !== id))
  }

  const handleToggleThaoTac = (id: string) => {
    setChonThaoTacIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id)
      }
      if (prev.length >= TOI_DA_THAO_TAC) {
        toast('Tối đa 8 thao tác')
        return prev
      }
      return [...prev, id]
    })
  }

  const handleKhoiPhucThaoTac = () => {
    setChonThaoTacIds([...thaoTacMacDinhIds])
    toast('Đã khôi phục thao tác mặc định')
  }

  const handleLuuThaoTac = () => {
    luuThaoTac(chonThaoTacIds)
    toast('Đã lưu thao tác nhanh')
    setMoTuyChinhThaoTac(false)
  }

  const wordsThaoTac = useMemo(() => fold(timThaoTac).split(/\s+/).filter(Boolean), [timThaoTac])
  const mucThaoTac = useMemo(() => {
    if (wordsThaoTac.length) {
      const cum = wordsThaoTac.join(' ')
      const hang = (x: ThaoTacMuc) => {
        const tf = fold(x.ten)
        return tf.startsWith(cum) ? 0 : tf.includes(' ' + cum) ? 1 : 2
      }
      const kq = thaoTacTatCa
        .filter(x => {
          if (anNgoaiGoi(s.goi) && x.khoa) return false
          const tf = fold(x.ten) + ' ' + fold(x.tenMod ?? '')
          return wordsThaoTac.every(w => tf.includes(w))
        })
        .map(x => [hang(x), x] as const)
        .sort((a, b) => a[0] - b[0])
        .map(([, x]) => x)
      return [{ ten: 'Kết quả', ds: kq }]
    }

    const theoMod = new Map<string, ThaoTacMuc[]>()
    for (const item of thaoTacTatCa) {
      if (anNgoaiGoi(s.goi) && item.khoa) continue
      const k = item.modKey
      const list = theoMod.get(k) ?? []
      list.push(item)
      theoMod.set(k, list)
    }

    const res: { ten: string; ds: ThaoTacMuc[] }[] = []
    for (const m of MODULES) {
      const ds = theoMod.get(m.key)
      if (ds && ds.length > 0) {
        res.push({
          ten: tenPhanHe(m, s.goi).ten,
          ds,
        })
      }
    }
    return res
  }, [thaoTacTatCa, wordsThaoTac, s.goi])

  // 2. Số liệu tính toán
  const kyXem: KyBaoCao = thangF === 10 ? 'thang-nay' : 'thang-truoc'
  const d = useMemo(() => tinhToanTongQuan(kyXem, selCns, s.cheDo, thangF), [kyXem, selCns, s.cheDo, thangF])

  // Lãi lỗ
  const nvl = useMemo(() => nvlKy(s, selCns, thangF), [s, selCns, thangF])
  const cpThang = d.cpHoatDong - d.cpPhanBo
  const loiNhuan = d.dtThuan - nvl.tien - cpThang - d.cpPhanBo
  const bien = d.dtThuan > 0 ? loiNhuan / d.dtThuan : 0
  const chiLon = useMemo(() => [...d.coCauCp].sort((a, b) => b.v - a.v)[0], [d.coCauCp])
  const laiLo13 = useMemo(() => laiLo13Thang(s, selCns), [s, selCns])
  const laiLoCn = useMemo(() => layLaiLoCuaHang(thangF, selCns, s), [thangF, selCns, s])

  // Quỹ tiền
  const quy = useMemo(() => [...tonQuyTheoSo(thangF, selCns), ...QUY_MAU_THEM], [thangF, selCns])
  const tongQuy = useMemo(() => {
    return {
      cuoi: quy.reduce((a, r) => a + r.cuoi, 0),
      thu: quy.reduce((a, r) => a + r.thu, 0),
      chi: quy.reduce((a, r) => a + r.chi, 0),
    }
  }, [quy])
  const thuChi13 = useMemo(() => thuChi13Thang(selCns), [selCns])

  return (
    <div className="m-trang-chu m-tcf-trang" onClickCapture={moTuTrangChu}>
      {/* 1. Phần đầu: tên đơn vị, nhãn gói, chọn cửa hàng */}
      <section className="m-tc-dau">
        <div className="m-tc-dau-trai">
          <div className="m-tc-logo-hop">
            <span className="m-tc-goi-badge">FREE</span>
            <div className="m-tc-logo-av">{dv.viettat}</div>
          </div>
          <div className="m-tc-don-vi">
            <h2 className="m-tc-dv-ten">{dv.ten}</h2>
            <div className="m-tc-dv-vai-tro">{ROLE[s.role]}</div>
          </div>
        </div>
        <div className="m-tc-dau-phai">
          <div className="m-tc-cum-phai">
            <button
              type="button"
              className="m-tc-nut-tron"
              onClick={() => setMoTimKiem(true)}
              title="Tìm kiếm"
              aria-label="Tìm kiếm màn hình"
            >
              <Icon n="search" className="ic sm" />
            </button>
            <button
              type="button"
              className="m-tc-nut-tron"
              title="Thông báo"
            >
              <Icon n="bell" className="ic sm" />
            </button>
          </div>
        </div>
      </section>

      {/* Hàng chọn cửa hàng */}
      <div className="m-tcf-hang-cn">
        <button
          type="button"
          className="m-tc-chip-cn m-tc-chip-kho"
          onClick={() => setMoChonCn(true)}
          title="Chọn cửa hàng hiển thị"
        >
          <span className="m-tc-chip-cn-nhan m-tc-chip-kho-nhan">CN: {nhanCn}</span>
          <Icon n="chevd" className="ic sm" />
        </button>
      </div>

      <div className="m-tcf-than">
        {/* 2. Thanh thao tác nhanh đang có, giữ trên cùng */}
        {thaoTacNhanhDs.length > 0 && (
          <div className="m-tc-the-ivt">
            <div className="m-tc-the-head">
              <div className="m-tc-the-tieu-hop">
                <h3 className="m-tc-the-tieu">Thao tác nhanh</h3>
                <span className="m-tc-the-info" title="Các thao tác nhanh thường dùng">
                  <Icon n="info" className="ic sm" />
                </span>
              </div>
              <button
                type="button"
                className="m-tc-the-link"
                onClick={() => setMoTuyChinhThaoTac(true)}
              >
                Tuỳ chỉnh
              </button>
            </div>
            <div className="m-tc-nhanh-5">
              {thaoTacNhanhDs.map(item => (
                <Link
                  key={item.id}
                  to={item.to}
                  className="m-tc-nhanh-o5"
                >
                  <div className="m-tc-nhanh-ic-tron">
                    <ONen n={item.icon} kieu="nhat" co="sm" />
                  </div>
                  <span className="m-tc-nhanh-ten5">{item.ten}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Nhắc khoá sổ tháng chưa khoá (T341) */}
        {(KHOA_SO_DEN.nam < KY_MO.nam ||
          (KHOA_SO_DEN.nam === KY_MO.nam && KHOA_SO_DEN.thang < KY_MO.thang - 1)) && (
          <div className="m-tcf-nhac-khoa-wrap">
            <Link
              to="/app/he-thong/khoa-so"
              className="bbt-nhac-khoa m-tcf-nhac-khoa"
              title="Khoá sổ để chốt số liệu, phiếu trong tháng không bị sửa nhầm"
            >
              <Icon n="lock" className="ic sm" />
              <span>
                Tháng{' '}
                {KHOA_SO_DEN.thang === 12 ? 1 : KHOA_SO_DEN.thang + 1}/
                {KHOA_SO_DEN.thang === 12 ? KHOA_SO_DEN.nam + 1 : KHOA_SO_DEN.nam} chưa khoá sổ
              </span>
              <b>Khoá sổ ›</b>
            </Link>
          </div>
        )}

        {/* 3. Chọn tháng như web (tháng 7 đến 10) */}
        <div className="m-tcf-chon-thang">
          <Select
            className="sel-mini m-tcf-sel-nam"
            value={String(namF)}
            aria-label="Năm"
            onChange={e => setNamF(Number(e.target.value))}
          >
            <option value="2026">Năm 2026</option>
          </Select>
          <Select
            className="sel-mini m-tcf-sel-thang"
            value={String(thangF)}
            aria-label="Tháng"
            onChange={e => setThangF(Number(e.target.value))}
          >
            {[10, 9, 8, 7].map(t => (
              <option key={t} value={t}>
                Tháng {t}
              </option>
            ))}
          </Select>
        </div>

        {/* 4. Khối Kết quả kinh doanh */}
        <div className="m-tc-the-ivt m-free-the">
          <div className="m-tc-the-head">
            <div className="m-tc-the-tieu-hop">
              <h2 className="m-tc-the-tieu">
                <Icon n="chart" className="ic sm" /> Kết quả kinh doanh
              </h2>
            </div>
            <div className="m-tcf-links">
              <Link
                to="/app/bao-cao/10-2-3"
                className="m-tcf-link"
                onClick={() => datLocDaXem('/app/bao-cao/10-2-3', {}, String(thangF))}
              >
                Xem kết quả kinh doanh ›
              </Link>
            </div>
          </div>
          <div className="bbt-e-mota">Doanh thu trừ các khoản chi phí trong tháng</div>
          <div className="m-free-hoi">
            Lợi nhuận {thangF === 10 ? 'tháng này' : `tháng ${thangF}`}
          </div>
          <div
            className={`m-tc-so-lon m-free-tra ${loiNhuan >= 0 ? 'lai' : 'lo'}`}
            style={{ color: loiNhuan >= 0 ? 'var(--green, #138a52)' : 'var(--red, #c2362b)' }}
          >
            {loiNhuan < 0 ? `Lỗ ${moneyD(Math.abs(loiNhuan))}` : moneyD(loiNhuan)}
          </div>
          <div className="m-free-phu">
            Biên lợi nhuận {pct(bien)} <span className="bbt-e-giai">· {bien < 0 ? 'lỗ' : 'lãi'} {Math.abs(bien * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} đ trên mỗi 100 đ doanh thu</span>
          </div>

          <div className="m-tcf-kqkd-bang">
            <div className="m-tcf-kqkd-dong m-tcf-kqkd-dt">
              <div className="m-tcf-kqkd-l">
                <b>Doanh thu</b>
                <span>Tiền bán hàng trong tháng</span>
              </div>
              <div className="m-tcf-kqkd-r">
                <b>{moneyD(d.dtThuan)}</b>
              </div>
            </div>

            <Link
              to={`/app/trang-chu/chi-phi-nvl?thang=${thangF}`}
              className="m-tcf-kqkd-dong m-tcf-kqkd-link"
              title="Xem giá vốn nguyên vật liệu"
            >
              <div className="m-tcf-kqkd-l">
                <b>Giá vốn nguyên vật liệu</b>
                <span>{moTaCach(nvl.ds)}</span>
              </div>
              <div className="m-tcf-kqkd-r">
                <b>{moneyD(nvl.tien)}</b>
                <span>{pct(d.dtThuan > 0 ? nvl.tien / d.dtThuan : 0)}</span>
                <Icon n="chevr" className="ic sm m-tcf-kqkd-mui" />
              </div>
            </Link>

            <Link
              to={`/app/trang-chu/chi-phi-thang?thang=${thangF}`}
              className="m-tcf-kqkd-dong m-tcf-kqkd-link"
              title="Xem chi phí hoạt động"
            >
              <div className="m-tcf-kqkd-l">
                <b>Chi phí hoạt động</b>
                <span>
                  {chiLon
                    ? `Lương, mặt bằng, điện nước… Lớn nhất: ${chiLon.l} ${short(chiLon.v)}`
                    : 'Lương, mặt bằng, điện nước, chi khác'}
                </span>
              </div>
              <div className="m-tcf-kqkd-r">
                <b>{moneyD(cpThang)}</b>
                <span>{pct(d.dtThuan > 0 ? cpThang / d.dtThuan : 0)}</span>
                <Icon n="chevr" className="ic sm m-tcf-kqkd-mui" />
              </div>
            </Link>

            <Link
              to="/app/ccdc/8-1-1"
              className="m-tcf-kqkd-dong m-tcf-kqkd-link"
              title="Xem chi phí phân bổ, khấu hao"
            >
              <div className="m-tcf-kqkd-l">
                <b>Chi phí phân bổ, khấu hao</b>
                <span>Công cụ, tài sản mua một lần, ghi nhận dần theo tháng</span>
              </div>
              <div className="m-tcf-kqkd-r">
                <b>{moneyD(d.cpPhanBo)}</b>
                <span>{pct(d.dtThuan > 0 ? d.cpPhanBo / d.dtThuan : 0)}</span>
                <Icon n="chevr" className="ic sm m-tcf-kqkd-mui" />
              </div>
            </Link>

            <div className={`m-tcf-kqkd-dong m-tcf-kqkd-ln ${loiNhuan >= 0 ? 'lai' : 'lo'}`}>
              <div className="m-tcf-kqkd-l">
                <b>Lợi nhuận</b>
              </div>
              <div className="m-tcf-kqkd-r">
                <b>
                  {loiNhuan < 0 ? `Lỗ ${moneyD(Math.abs(loiNhuan))}` : moneyD(loiNhuan)}
                </b>
                <span>{pct(bien)}</span>
              </div>
            </div>
          </div>

          <div className="bbt-chan" style={{ marginTop: 10 }}>
            <button type="button" className="bbt-nut" onClick={() => setMoBieuDo(true)}>
              Xem biểu đồ lãi lỗ 13 tháng
              <Icon n="chevr" className="ic sm" />
            </button>
          </div>
        </div>

        {/* 5. Khối Quỹ tiền */}
        <div className="m-tc-the-ivt m-free-the">
          <div className="m-tc-the-head">
            <div className="m-tc-the-tieu-hop">
              <h2 className="m-tc-the-tieu">
                <Icon n="wallet" className="ic sm" /> Quỹ tiền
              </h2>
            </div>
            <div className="m-tcf-links">
              <Link
                to="/app/bao-cao/2-2-1"
                className="m-tcf-link"
                title="Xem Sổ quỹ tiền mặt"
                onClick={() => datLocDaXem('/app/bao-cao/2-2-1', {}, String(thangF))}
              >
                Sổ quỹ tiền mặt ›
              </Link>
              <Link
                to="/app/bao-cao/2-2-3"
                className="m-tcf-link"
                title="Xem Sổ tiền gửi ngân hàng"
                onClick={() => datLocDaXem('/app/bao-cao/2-2-3', {}, String(thangF))}
              >
                Sổ ngân hàng ›
              </Link>
            </div>
          </div>
          <div className="bbt-e-mota">Tiền mặt tại cửa hàng và tiền gửi ngân hàng</div>
          <div className="m-free-hoi">
            {thangF === 10 ? 'Tồn quỹ hiện tại' : `Tồn quỹ cuối tháng ${thangF}/2026`}
          </div>
          <button
            type="button"
            className="m-tc-so-lon m-free-tra m-btn-so-lon m-free-ton-quy-lon"
            style={{ color: 'var(--blue, #0560a6)' }}
            onClick={() => setModalQuy('tat-ca')}
            title="Xem biểu đồ thu chi tất cả quỹ"
          >
            {moneyD(tongQuy.cuoi)} ›
          </button>
          <div className="m-free-phu">
            {thangF === 10 ? 'Tháng này thu' : `Tháng ${thangF} thu`} <span style={{ color: 'var(--green, #138a52)' }}>{short(tongQuy.thu)}</span> · chi{' '}
            <span style={{ color: 'var(--red, #c2362b)' }}>{short(tongQuy.chi)}</span>
          </div>

          {quy.length > 0 ? (
            <>
              <VongQuy ds={quy} tong={tongQuy.cuoi} onChon={setModalQuy} />
              <div className="bbt-quy-tao m-tcf-quy-tao">
                <Link
                  to="/app/danh-muc/1-12?moi=1&goiY=thuchi"
                  className="btn sm m-tcf-btn-tao-quy"
                  title="Tạo quỹ tiền mặt hoặc tài khoản ngân hàng"
                >
                  <Icon n="plus" className="ic sm" />Tạo quỹ
                </Link>
              </div>
            </>
          ) : (
            <div className="bbt-quy-trong">
              <Icon n="wallet" className="ic" />
              <b>Chưa có quỹ tiền nào</b>
              <span>
                Tạo quỹ tiền mặt hoặc tài khoản ngân hàng để lập phiếu thu, phiếu chi và theo dõi tồn
                quỹ.
              </span>
              <Link to="/app/danh-muc/1-12?moi=1&goiY=thuchi" className="btn pri">
                <Icon n="plus" className="ic sm" />Tạo quỹ
              </Link>
            </div>
          )}

          <div className="bbt-chan" style={{ marginTop: 10 }}>
            <button type="button" className="bbt-nut" onClick={() => setMoThuChi13(true)}>
              Xem dòng tiền 13 tháng
              <Icon n="chevr" className="ic sm" />
            </button>
          </div>
        </div>

        {/* 6. Khối Mua hàng & công nợ NCC, Hao hụt kiểm kê */}
        <MKhoFree selCns={selCns} thang={thangF} />
      </div>

      {/* Popups & Modals */}
      {moBieuDo && (
        <HopLaiLo13
          ds={laiLo13}
          onDong={() => setMoBieuDo(false)}
          thangXem={thangF}
          selCns={selCns}
          laiLoCn={laiLoCn}
        />
      )}

      {moThuChi13 && (
        <HopThuChi13
          ds={thuChi13}
          onDong={() => setMoThuChi13(false)}
        />
      )}

      {modalQuy && (
        <ModalQuy
          quyKey={modalQuy}
          thang={thangF}
          isMobile={true}
          selCns={selCns}
          onDong={() => setModalQuy(null)}
        />
      )}

      <MChon
        mo={moChonCn}
        tieuDe="Chọn cửa hàng làm việc"
        ds={dsChonCn}
        chon={s.cuaHang || 'all'}
        onChon={k => {
          set({ cuaHang: k === 'all' ? undefined : k })
          setMoChonCn(false)
        }}
        onDong={() => setMoChonCn(false)}
      />

      <MTimKiem mo={moTimKiem} onDong={() => setMoTimKiem(false)} />

      {/* Tấm trượt tuỳ chỉnh thao tác nhanh (T266, T280, T342) */}
      {moTuyChinhThaoTac && (
        <div className="m-tam-overlay" onClick={() => setMoTuyChinhThaoTac(false)}>
          <div className="m-tam-hop m-tam-hop-apdung" style={{ height: '94vh', maxHeight: '94vh' }} onClick={e => e.stopPropagation()}>
            <div className="m-tam-dau m-tam-dau-apdung">
              <h2 className="m-tam-tieu">Tuỳ chỉnh thao tác nhanh</h2>
              <button
                type="button"
                className="m-tam-dong-btn"
                onClick={() => setMoTuyChinhThaoTac(false)}
                aria-label="Đóng"
              >
                <Icon n="x" className="ic sm" />
              </button>
            </div>

            <div className="m-tam-tim-wrap">
              <Icon n="search" className="m-tam-tim-ic ic sm" />
              <input
                className="m-tam-tim-inp"
                placeholder="Tìm thao tác hoặc màn hình..."
                value={timThaoTac}
                onChange={e => setTimThaoTac(e.target.value)}
              />
              {timThaoTac && (
                <button
                  type="button"
                  className="m-tam-tim-x"
                  onClick={() => setTimThaoTac('')}
                  aria-label="Xoá tìm kiếm"
                >
                  <Icon n="x" className="ic sm" />
                </button>
              )}
            </div>

            {/* Hàng đã chọn */}
            <div className="ttn-m-da-chon-khung" style={{ padding: '10px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                <span>Đã chọn ({chonThaoTacIds.length}/{TOI_DA_THAO_TAC})</span>
                {chonThaoTacIds.length >= TOI_DA_THAO_TAC && (
                  <span style={{ color: 'var(--orange-d)', fontSize: 11.5 }}>Tối đa {TOI_DA_THAO_TAC} thao tác</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                {chonThaoTacItems.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      background: '#fff',
                      borderRadius: 8,
                      border: '1px solid var(--line-2)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <ONen n={item.icon} kieu="nhat" co="sm" />
                      <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.ten}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 'none' }}>
                      <button
                        type="button"
                        className="ttn-btn-mui-ten"
                        title="Lên trên"
                        disabled={idx === 0}
                        onClick={() => handleLenThaoTac(idx)}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="ttn-btn-mui-ten"
                        title="Xuống dưới"
                        disabled={idx === chonThaoTacItems.length - 1}
                        onClick={() => handleXuongThaoTac(idx)}
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        className="ttn-btn-mui-ten"
                        style={{ color: 'var(--red)' }}
                        title={`Bỏ ${item.ten}`}
                        onClick={() => handleBoChonThaoTac(item.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danh sách ứng viên gom phân hệ */}
            <div className="m-tam-ds" style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
              {mucThaoTac.length === 0 && (
                <div className="m-tam-trong" style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
                  Không tìm thấy thao tác nào
                </div>
              )}
              {mucThaoTac.map(g => (
                <div key={g.ten} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '10px 0 4px' }}>
                    {g.ten}
                  </div>
                  {g.ds.map(x => {
                    const isChon = chonThaoTacIds.includes(x.id)
                    const atLimit = chonThaoTacIds.length >= TOI_DA_THAO_TAC && !isChon
                    return (
                      <div
                        key={x.id}
                        className="m-tam-dong"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          padding: '8px 0',
                          borderBottom: '1px solid var(--line-2)',
                          opacity: atLimit ? 0.5 : 1,
                        }}
                      >
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            flex: 1,
                            minWidth: 0,
                            cursor: x.khoa ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChon}
                            disabled={x.khoa || atLimit}
                            onChange={() => !x.khoa && handleToggleThaoTac(x.id)}
                            style={{ width: 18, height: 18, accentColor: 'var(--blue)' }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <ONen n={x.icon} kieu="nhat" co="sm" />
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{x.ten}</span>
                              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{x.tenMod}</span>
                            </div>
                            {x.khoa && x.ma && <Pk g={minGoi(x.ma)} o />}
                          </div>
                        </label>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="m-tam-day ttn-m-day">
              <button
                type="button"
                className="btn sm ghost ttn-m-btn-khoiphuc"
                onClick={handleKhoiPhucThaoTac}
              >
                Khôi phục
              </button>
              <div className="ttn-m-day-phai">
                <button
                  type="button"
                  className="m-tam-btn-huy"
                  onClick={() => setMoTuyChinhThaoTac(false)}
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  className="m-tam-btn-apdung"
                  onClick={handleLuuThaoTac}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
