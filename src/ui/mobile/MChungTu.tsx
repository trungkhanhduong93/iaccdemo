import { useMemo, useState, type FC, type ReactNode } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { duongDan } from '../../app/registry'
import { chiNhanhHienTai, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { docNgay, trongKhoang } from '../ChonNgay'
import { money, rutGonSo } from '../format'
import { dsChipTT, khopChipTT } from '../LocNangCao'
import { chieuTien, dauTien, lopChieu } from './chieuTien'
import { TT_CT } from '../generic/gen'
import { ttTienTheoTra } from '../generic/daXoa'
import { TT_TIEN } from '../generic/nhom'
import { ChungTuForm } from '../generic/ChungTuForm'
import { useDongChungTu } from '../generic/VoucherScreen'
import { useDsPhieuDcn } from '../../modules/kho/BangDieuChuyen'
import { useDsPhieuSx } from '../../modules/kho/BangSanXuat'
import { MChon } from './MChon'
import { MDanhSach } from './MDanhSach'
import { MLapPhieu } from './MLapPhieu'
import { coLocKhacMacDinh, MAC_DINH_LOC_MOBILE, MLoc, tinhKhoangNgay, type GtLocMobile } from './MLoc'
import { MXemPhieu } from './MXemPhieu'

// Tách lớp ngoài để danh sách luôn gọi đủ hook, không trả sớm theo id
export const MChungTu: FC<ScreenProps> = ({ sc, mod }) => {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const sua = sp.get('sua') === '1'

  if (id === 'moi' || sua) {
    if (sp.get('full') === '1' || sp.get('form') === 'full') {
      return <ChungTuMoiForm sc={sc} mod={mod} id={id} />
    }
    return <MLapPhieu sc={sc} mod={mod} id={id} />
  }
  if (id !== undefined) {
    return <MXemPhieu sc={sc} mod={mod} id={id} />
  }
  return <DsChungTu sc={sc} mod={mod} />
}

const ChungTuMoiForm: FC<{ sc: ScreenProps['sc']; mod: ScreenProps['mod']; id?: string }> = ({ sc, mod, id }) => {
  const loc = useLocation()
  const { cfg, rows } = useDongChungTu(sc, mod)
  const row = id === 'moi' ? undefined : rows.find(r => String(r.id) === String(id))
  return <ChungTuForm key={loc.key + loc.search} sc={sc} mod={mod} cfg={cfg} row={row} rows={rows} />
}

const CAC_THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

function dinhDangThuNgay(chuoiNgay: string): string {
  const d = docNgay(chuoiNgay)
  if (isNaN(d.getTime())) return chuoiNgay
  const thu = CAC_THU[d.getDay()]
  const ngay = String(d.getDate()).padStart(2, '0')
  const thang = String(d.getMonth() + 1).padStart(2, '0')
  const nam = d.getFullYear()
  return `${thu}, ${ngay}/${thang}/${nam}`
}

const DsChungTu: FC<ScreenProps> = ({ sc, mod }) => {
  const { s } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const { cfg, rows: rowsGoc } = useDongChungTu(sc, mod)
  const rowsDcn = useDsPhieuDcn(cfg.dieuChuyen ?? 'xdc')
  const rowsSx = useDsPhieuSx(cfg.sanXuat ?? 'xsc')
  const rows = cfg.dieuChuyen ? rowsDcn : cfg.sanXuat ? rowsSx : rowsGoc

  const ghi = kieuGhiSo(s.goi) !== 'khong'
  const cnChon = chiNhanhHienTai(s)

  // Bộ lọc nâng cao
  const [locMo, setLocMo] = useState(false)
  const [locVal, setLocVal] = useState<GtLocMobile>(MAC_DINH_LOC_MOBILE)

  // Loại chứng từ (với màn nhiều loại)
  const [loaiChon, setLoaiChon] = useState<string>(() => (cfg.dieuChinh ? (cfg.loai?.[0]?.k ?? '') : ''))

  // Chip trạng thái
  // ?tt=nhap từ mục Chứng từ chưa ghi sổ ở trang chủ thì bật sẵn chip đó
  const [sp] = useSearchParams()
  const [chipTT, setChipTT] = useState(() => sp.get('tt') ?? 'all')

  // Chọn loại khi bấm thêm mới
  const [moChonLoai, setMoChonLoai] = useState(false)

  // Danh sách đối tượng, nguồn, kho cho bộ lọc
  const dsDoiTuong = useMemo(
    () => [...new Set(rows.map(r => String(r.doiTuong ?? '')).filter(Boolean))].sort(),
    [rows],
  )
  const dsNguon = useMemo(() => {
    const raw = [...new Set(rows.map(r => String(r.nguon ?? 'tay')))]
    return raw.map(k => ({ k, ten: k }))
  }, [rows])
  const dsKho = useMemo(() => {
    const raw = [...new Set(rows.flatMap(r => ((r._khoDs as string[] | undefined) ?? (r.kho ? [String(r.kho)] : []))))]
    return raw.filter(Boolean).sort()
  }, [rows])

  // Lọc sơ bộ (thời gian, chi nhánh, loại, bộ lọc nâng cao)
  const kn = tinhKhoangNgay(locVal.thoiGian, locVal.khoangNgay)
  const truocTT = useMemo(() => {
    return rows.filter(r => {
      // 1. Thời gian
      if (kn) {
        const d = docNgay(String(r.ngay).split(' ')[0])
        if (!trongKhoang(d, kn)) return false
      }
      // 2. Chi nhánh
      if (cnChon && r.cn !== cnChon.ten) return false
      // 3. Loại chứng từ (tab con)
      if (loaiChon && r.loai !== loaiChon) return false
      // 4. Đối tượng từ bộ lọc
      if (locVal.doiTuong && locVal.doiTuong.length > 0) {
        if (!locVal.doiTuong.includes(String(r.doiTuong ?? ''))) return false
      }
      // 5. Nguồn từ bộ lọc
      if (locVal.nguon && locVal.nguon.length > 0) {
        if (!locVal.nguon.includes(String(r.nguon ?? 'tay'))) return false
      }
      // 6. Kho từ bộ lọc
      if (locVal.kho && locVal.kho.length > 0) {
        const khoDs = (r._khoDs as string[] | undefined) ?? (r.kho ? [String(r.kho)] : [])
        if (!khoDs.some(k => locVal.kho.includes(k))) return false
      }
      return true
    })
  }, [rows, kn, cnChon, loaiChon, locVal])

  // Chip trạng thái tính trên truocTT
  const chipsGoc = useMemo(() => dsChipTT(truocTT, ghi), [truocTT, ghi])
  const chips = useMemo(
    () => chipsGoc.map(c => ({ k: c.k, ten: c.ten, dem: c.so })),
    [chipsGoc],
  )

  // Danh sách cuối cùng sau chip trạng thái
  const list = useMemo(() => {
    return truocTT.filter(r => khopChipTT(chipTT, r.tt, ghi))
  }, [truocTT, chipTT, ghi])

  const tongTien = useMemo(() => list.reduce((a, r) => a + (Number(r.tong) || 0), 0), [list])

  // Chiều tiền của từng chứng từ, phục vụ tính tổng thu chi và màu sắc (mục 2.1, 2.2, 2.3)
  const dsChieu = useMemo(() => list.map(r => chieuTien(mod.key, cfg, r)), [list, mod.key, cfg])
  const coVao = dsChieu.includes('vao')
  const coRa = dsChieu.includes('ra')
  const coCaHaiChieu = coVao && coRa
  const coChieu = coVao || coRa

  const { tongThu, tongChi, chenhLech } = useMemo(() => {
    let thu = 0
    let chi = 0
    list.forEach((r, idx) => {
      const tien = Number(r.tong) || 0
      if (dsChieu[idx] === 'vao') thu += tien
      else if (dsChieu[idx] === 'ra') chi += tien
    })
    return { tongThu: thu, tongChi: chi, chenhLech: thu - chi }
  }, [list, dsChieu])

  // Thêm mới
  const khongThem = cfg.khongThem && !cfg.dieuChinh
  const handleThem = khongThem
    ? undefined
    : () => {
        if (cfg.loai && cfg.loai.length > 0) {
          setMoChonLoai(true)
        } else {
          nav(`${path}/moi`)
        }
      }

  // Hàng phụ chọn loại phiếu (nếu cfg.loai)
  const hangPhu =
    cfg.loai && cfg.loai.length > 0 ? (
      <div className="m-ct-tabs-loai">
        {!cfg.dieuChinh && (
          <button
            type="button"
            className={`m-ct-tab-loai ${loaiChon === '' ? 'on' : ''}`}
            onClick={() => setLoaiChon('')}
          >
            Tất cả
          </button>
        )}
        {cfg.loai.map(l => (
          <button
            key={l.k}
            type="button"
            className={`m-ct-tab-loai ${loaiChon === l.k ? 'on' : ''}`}
            onClick={() => setLoaiChon(l.k)}
          >
            {l.ten}
          </button>
        ))}
      </div>
    ) : null

  return (
    <>
      <MDanhSach
        rows={list}
        timTheo={(r, q) => {
          const text = `${r.so} ${r.doiTuong ?? ''} ${r.dienGiai ?? ''}`.toLowerCase()
          return text.includes(q.toLowerCase())
        }}
        timPlaceholder="Số chứng từ, đối tượng, diễn giải..."
        chips={chips}
        chipChon={chipTT}
        onChipChon={setChipTT}
        onMoLoc={() => setLocMo(true)}
        coLoc={coLocKhacMacDinh(locVal)}
        onThem={handleThem}
        nhanThem={cfg.them ?? '+ Thêm mới'}
        hangPhu={hangPhu}
        tomTat={
          coCaHaiChieu ? (
            <div className="m-tong3-wrap">
              <div className="m-tong3">
                <div className="m-tong3-o">
                  <span className="m-tong3-nhan">Tổng thu</span>
                  <b className="m-tong3-so m-num m-tien-vao">+{rutGonSo(tongThu)}</b>
                </div>
                <div className="m-tong3-o">
                  <span className="m-tong3-nhan">Tổng chi</span>
                  <b className="m-tong3-so m-num m-tien-ra">−{rutGonSo(tongChi)}</b>
                </div>
                <div className="m-tong3-o">
                  <span className="m-tong3-nhan">Chênh lệch</span>
                  <b
                    className={`m-tong3-so m-num ${
                      chenhLech > 0 ? 'm-tien-vao' : chenhLech < 0 ? 'm-tien-ra' : ''
                    }`}
                  >
                    {chenhLech > 0
                      ? `+${rutGonSo(chenhLech)}`
                      : chenhLech < 0
                      ? `−${rutGonSo(chenhLech)}`
                      : rutGonSo(0)}
                  </b>
                </div>
              </div>
              <div className="m-tong3-dem">{list.length} chứng từ</div>
            </div>
          ) : (
            <span>
              <b>{list.length}</b> chứng từ · <b>{money(tongTien)} đ</b>
            </span>
          )
        }
        nhomTheo={r => String(r.ngay ?? '').split(' ')[0]}
        tieuDeNhom={(khoa, dsNhom) => {
          let tongNgayEl: ReactNode = null
          if (coChieu) {
            let tNgay = 0
            for (const item of dsNhom) {
              const c = chieuTien(mod.key, cfg, item)
              const tien = Number(item.tong) || 0
              if (c === 'vao') tNgay += tien
              else if (c === 'ra') tNgay -= tien
            }
            if (tNgay > 0) {
              tongNgayEl = <span className="m-ds-ngay-tong m-tien-vao m-num">+{money(tNgay)}</span>
            } else if (tNgay < 0) {
              tongNgayEl = <span className="m-ds-ngay-tong m-tien-ra m-num">−{money(Math.abs(tNgay))}</span>
            } else {
              tongNgayEl = <span className="m-ds-ngay-tong m-num">0</span>
            }
          }
          return (
            <>
              <span className="m-ds-ngay-chu">{dinhDangThuNgay(khoa)}</span>
              {tongNgayEl}
            </>
          )
        }}
        the={(r, i) => {
          const ttInfo = TT_CT[r.tt] ?? ['dim', r.tt]
          const nhomMb = mod.key === 'mua-hang' ? 'mua' : mod.key === 'ban-hang' ? 'ban' : null
          const ttTien = nhomMb ? ttTienTheoTra(r) : null
          const ttTienInfo = nhomMb && ttTien ? TT_TIEN[nhomMb][ttTien] : null
          const anTien = Boolean(cfg.kiemKe || cfg.dieuChuyen === 'ck' || sc.code === '5.1.10' || sc.code === '5.1.4.3')
          const chieu = chieuTien(mod.key, cfg, r)
          const dau = dauTien(chieu)
          const tienHienThi = anTien ? null : `${dau}${money(r.tong)}`
          const phu = [r.tenLoai, r.gio].filter(Boolean).join(' · ')

          return (
            <div
              key={`${String(r.id ?? r.so ?? '')}_${i}`}
              className="m-ds-ngay-dong"
              onClick={() => nav(`${path}/${r.id}`)}
              role="button"
              tabIndex={0}
            >
              <div className="m-ds-ngay-hang1">
                <span className="m-ds-ngay-dt">{r.doiTuong || r.dienGiai || '—'}</span>
                {tienHienThi !== null && (
                  <span className={`m-ds-ngay-tien m-num ${lopChieu(chieu)}`}>
                    {tienHienThi}
                  </span>
                )}
              </div>
              <div className="m-ds-ngay-hang2">
                <span className="m-ds-ngay-phu">
                  <span className="m-ds-ngay-so">{r.so}</span>
                  {phu && ` · ${phu}`}
                </span>
                <span className="m-ds-ngay-chips">
                  {ttTienInfo && <span className={`m-ct-chip ${ttTienInfo[0]}`}>{ttTienInfo[1]}</span>}
                  {ghi && ttInfo && <span className={`m-ct-chip ${ttInfo[0]}`}>{ttInfo[1]}</span>}
                </span>
              </div>
            </div>
          )
        }}
      />

      {/* Màn lọc toàn màn */}
      <MLoc
        mo={locMo}
        onDong={() => setLocMo(false)}
        giaTri={locVal}
        onApDung={setLocVal}
        dsDoiTuong={dsDoiTuong}
        nhanDoiTuong={cfg.nhan ?? 'Đối tượng'}
        dsNguon={dsNguon}
        dsKho={dsKho}
      />

      {/* Tấm trượt chọn loại phiếu khi thêm mới */}
      {cfg.loai && (
        <MChon
          mo={moChonLoai}
          onDong={() => setMoChonLoai(false)}
          tieuDe="Chọn loại phiếu"
          ds={cfg.loai.map(l => ({ k: l.k, ten: l.ten }))}
          onChon={k => nav(`${path}/moi?loai=${k}`)}
        />
      )}
    </>
  )
}
