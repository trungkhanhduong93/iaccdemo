import { useMemo, useState, type FC, type ReactNode } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { duongDan } from '../../app/registry'
import { cuaHangHienTai, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { docNgay, trongKhoang } from '../ChonNgay'
import { money, rutGonSo } from '../format'
import { dsChipTT, khopChipTT } from '../LocNangCao'
import { chieuTien, dauTien, lopChieu } from './chieuTien'
import { TT_CT, dongCua } from '../generic/gen'
import { ttTienTheoTra } from '../generic/daXoa'
import { TT_TIEN, theoLoai } from '../generic/nhom'
import { ChungTuForm } from '../generic/ChungTuForm'
import { useDongChungTu } from '../generic/VoucherScreen'
import { useDsPhieuDcn } from '../../modules/kho/BangDieuChuyen'
import { useDsPhieuSx } from '../../modules/kho/BangSanXuat'
import { MChon } from './MChon'
import { MDanhSach } from './MDanhSach'
import { MLapPhieu } from './MLapPhieu'
import { coLocKhacMacDinh, MAC_DINH_LOC_MOBILE, MLoc, tinhKhoangNgay, type GtLocMobile } from './MLoc'
import { MXemPhieu } from './MXemPhieu'
import { MBaoCaoTheoDoi } from './MBaoCaoTheoDoi'

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
  const cnChon = cuaHangHienTai(s)

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

  // Lọc sơ bộ (thời gian, cửa hàng, loại, bộ lọc nâng cao)
  const kn = tinhKhoangNgay(locVal.thoiGian, locVal.khoangNgay)
  const truocTT = useMemo(() => {
    return rows.filter(r => {
      // 1. Thời gian
      if (kn) {
        const d = docNgay(String(r.ngay).split(' ')[0])
        if (!trongKhoang(d, kn)) return false
      }
      // 2. Cửa hàng
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

  const [moTheoDoi, setMoTheoDoi] = useState(false)

  // Hàng tabs ngang: các loại phiếu / màn chứng từ trong phân hệ + tab Báo cáo theo dõi
  const hangTabs = useMemo(() => {
    if (mod.key === 'kho') {
      const isNk = sc.code === '5.1.1' || sc.slug === '5-1-1'
      const isXk = sc.code === '5.1.2-4' || sc.slug === '5-1-2-4'
      const isXh = sc.code === '5.1.2-3' || sc.slug === '5-1-2-3'
      return (
        <div className="m-ds-hang-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={isNk}
            className={`m-tab-chu${isNk ? ' on' : ''}`}
            onClick={() => nav('/app/kho/5-1-1')}
          >
            Nhập khác
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isXk}
            className={`m-tab-chu${isXk ? ' on' : ''}`}
            onClick={() => nav('/app/kho/5-1-2-4')}
          >
            Xuất khác
          </button>
          {isXh && (
            <button
              type="button"
              role="tab"
              aria-selected={true}
              className="m-tab-chu on"
            >
              Xuất huỷ
            </button>
          )}
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="m-tab-chu"
            onClick={() => setMoTheoDoi(true)}
          >
            Báo cáo theo dõi
          </button>
        </div>
      )
    }

    if (mod.key === 'ccdc') {
      const is812 = sc.code === '8.1.2' || sc.slug === '8-1-2'
      const is813 = sc.code === '8.1.3' || sc.slug === '8-1-3'
      return (
        <div className="m-ds-hang-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="m-tab-chu"
            onClick={() => nav('/app/ccdc/8-1-1')}
          >
            Thẻ chi phí
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={is812}
            className={`m-tab-chu${is812 ? ' on' : ''}`}
            onClick={() => nav('/app/ccdc/8-1-2')}
          >
            Tăng, giảm CCDC
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={is813}
            className={`m-tab-chu${is813 ? ' on' : ''}`}
            onClick={() => nav('/app/ccdc/8-1-3')}
          >
            Kiểm kê CCDC
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="m-tab-chu"
            onClick={() => setMoTheoDoi(true)}
          >
            Báo cáo theo dõi
          </button>
        </div>
      )
    }

    if (mod.key === 'mua-hang') {
      const is411 = sc.code === '4.1.1' || sc.slug === '4-1-1'
      const is412 = sc.code === '4.1.2' || sc.slug === '4-1-2'
      const is414 = sc.code === '4.1.4' || sc.slug === '4-1-4'
      const is415 = sc.code === '4.1.5' || sc.slug === '4-1-5'
      return (
        <div className="m-ds-hang-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={is411}
            className={`m-tab-chu${is411 ? ' on' : ''}`}
            onClick={() => nav('/app/mua-hang/4-1-1')}
          >
            Chứng từ mua hàng
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={is412}
            className={`m-tab-chu${is412 ? ' on' : ''}`}
            onClick={() => nav('/app/mua-hang/4-1-2')}
          >
            Hoá đơn mua hàng
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={is414}
            className={`m-tab-chu${is414 ? ' on' : ''}`}
            onClick={() => nav('/app/mua-hang/4-1-4')}
          >
            Trả lại hàng mua
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={is415}
            className={`m-tab-chu${is415 ? ' on' : ''}`}
            onClick={() => nav('/app/mua-hang/4-1-5')}
          >
            Chi phí mua hàng
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="m-tab-chu"
            onClick={() => setMoTheoDoi(true)}
          >
            Báo cáo theo dõi
          </button>
        </div>
      )
    }

    if (cfg.loai && cfg.loai.length > 0) {
      return (
        <div className="m-ds-hang-tabs" role="tablist">
          {!cfg.dieuChinh && (
            <button
              type="button"
              role="tab"
              aria-selected={loaiChon === ''}
              className={`m-tab-chu${loaiChon === '' ? ' on' : ''}`}
              onClick={() => setLoaiChon('')}
            >
              Tất cả
            </button>
          )}
          {cfg.loai.map(l => (
            <button
              key={l.k}
              type="button"
              role="tab"
              aria-selected={loaiChon === l.k}
              className={`m-tab-chu${loaiChon === l.k ? ' on' : ''}`}
              onClick={() => setLoaiChon(l.k)}
            >
              {l.ten}
            </button>
          ))}
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="m-tab-chu"
            onClick={() => setMoTheoDoi(true)}
          >
            Báo cáo theo dõi
          </button>
        </div>
      )
    }

    // Các phân hệ khác có 1 màn chính: hiện tab chính và tab Báo cáo theo dõi
    return (
      <div className="m-ds-hang-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={true}
          className="m-tab-chu on"
        >
          {sc.ngan ?? sc.ten}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={false}
          className="m-tab-chu"
          onClick={() => setMoTheoDoi(true)}
        >
          Báo cáo theo dõi
        </button>
      </div>
    )
  }, [mod.key, sc, cfg.loai, cfg.dieuChinh, loaiChon, nav])

  const pad = (n: number) => String(n).padStart(2, '0')
  const khoangNgayHienThi = kn
    ? `${pad(kn.tu.getDate())}/${pad(kn.tu.getMonth() + 1)}/${kn.tu.getFullYear()} - ${pad(kn.den.getDate())}/${pad(kn.den.getMonth() + 1)}/${kn.den.getFullYear()}`
    : '16/09/2026 - 15/11/2026'

  return (
    <>
      <MDanhSach
        rows={list}
        timTheo={(r, q) => {
          const text = `${r.so} ${r.doiTuong ?? ''} ${r.dienGiai ?? ''} ${r.cn ?? ''}`.toLowerCase()
          return text.includes(q.toLowerCase())
        }}
        timPlaceholder="Số chứng từ, đối tượng, diễn giải..."
        chips={chips}
        chipChon={chipTT}
        onChipChon={setChipTT}
        onMoLoc={() => setLocMo(true)}
        coLoc={coLocKhacMacDinh(locVal)}
        khoangNgayHienThi={khoangNgayHienThi}
        onThem={handleThem}
        nhanThem={cfg.them ?? '+ Thêm mới'}
        hangTabs={hangTabs}
        tomTat={
          coCaHaiChieu ? (
            <span>
              {list.length} chứng từ · Thu {rutGonSo(tongThu)} / Chi {rutGonSo(tongChi)}
            </span>
          ) : (
            <span>
              {list.length} chứng từ · {money(tongTien)} đ
            </span>
          )
        }
        the={(r, i) => {
          const ttInfo = TT_CT[r.tt] ?? ['dim', r.tt]
          const anTien = Boolean(cfg.kiemKe || cfg.dieuChuyen === 'ck' || sc.code === '5.1.10' || sc.code === '5.1.4.3')
          const tienHienThi = anTien ? null : `${money(Math.abs(r.tong ?? 0))} đ`

          const cfgLoai = theoLoai(cfg, r.loai)
          const laHang = cfgLoai.dong === 'hang' || cfgLoai.dong === 'nvl'
          let soDongHang = 0
          if (laHang) {
            if (Array.isArray(r._dong)) {
              soDongHang = r._dong.length
            } else {
              const idSeed = `${sc.code ?? sc.slug}-${r.id}`
              soDongHang = dongCua(cfgLoai, idSeed).length
            }
          }

          const doiTuongOrCn = r.doiTuong || r.cn || r.dienGiai || '—'
          const ngayHienThi = String(r.ngay ?? '').split(' ')[0]
          const thongTinHang = soDongHang > 0 ? `${ngayHienThi} · ${soDongHang} hàng hoá` : ngayHienThi
          const ttNhan = (r.tt === 1 || r.tt === 'ok' || r.tt === '1' || r.tt === 2) ? 'Hoàn thành' : (r.tt === 0 ? 'Chưa ghi sổ' : (ttInfo[1] || 'Hoàn thành'))
          const ttCls = (r.tt === 1 || r.tt === 'ok' || r.tt === '1' || r.tt === 2) ? 'ok' : (r.tt === 0 ? 'cho' : 'ok')

          return (
            <div
              key={`${String(r.id ?? r.so ?? '')}_${i}`}
              className="m-the-ct"
              onClick={() => nav(`${path}/${r.id}`)}
              role="button"
              tabIndex={0}
            >
              <div className="m-the-ct-hang1">
                <span className="m-the-ct-so">{r.so}</span>
                <span className={`m-the-ct-tag ${ttCls}`}>{ttNhan}</span>
              </div>
              <div className="m-the-ct-hang2">
                <span className="m-the-ct-dt">{doiTuongOrCn}</span>
              </div>
              <div className="m-the-ct-vach" />
              <div className="m-the-ct-hang3">
                <span className="m-the-ct-ngay-hang">{thongTinHang}</span>
                {tienHienThi !== null && (
                  <span className="m-the-ct-tien">{tienHienThi}</span>
                )}
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

      {/* Tấm Báo cáo theo dõi & Danh mục */}
      <MBaoCaoTheoDoi
        mo={moTheoDoi}
        onDong={() => setMoTheoDoi(false)}
        modKey={mod.key}
      />
    </>
  )
}
