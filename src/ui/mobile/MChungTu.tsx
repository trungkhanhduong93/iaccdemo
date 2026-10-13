import { useMemo, useState, type FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { duongDan } from '../../app/registry'
import { chiNhanhHienTai, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { docNgay, trongKhoang } from '../ChonNgay'
import { money } from '../format'
import { dsChipTT, khopChipTT } from '../LocNangCao'
import { TT_CT } from '../generic/gen'
import { useDongChungTu } from '../generic/VoucherScreen'
import { MChiMayTinh } from './MChiMayTinh'
import { MChon } from './MChon'
import { MDanhSach } from './MDanhSach'
import { coLocKhacMacDinh, MAC_DINH_LOC_MOBILE, MLoc, tinhKhoangNgay, type GtLocMobile } from './MLoc'

export const MChungTu: FC<ScreenProps> = ({ sc, mod }) => {
  const { id } = useParams()
  if (id !== undefined) {
    return <MChiMayTinh />
  }

  const { s } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const { cfg, rows } = useDongChungTu(sc, mod)

  const ghi = kieuGhiSo(s.goi) !== 'khong'
  const cnChon = chiNhanhHienTai(s)

  // Bộ lọc nâng cao
  const [locMo, setLocMo] = useState(false)
  const [locVal, setLocVal] = useState<GtLocMobile>(MAC_DINH_LOC_MOBILE)

  // Loại chứng từ (với màn nhiều loại)
  const [loaiChon, setLoaiChon] = useState<string>(() => (cfg.dieuChinh ? (cfg.loai?.[0]?.k ?? '') : ''))

  // Chip trạng thái
  const [chipTT, setChipTT] = useState('all')

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
  const kn = tinhKhoangNgay(locVal.thoiGian)
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
      if (locVal.doiTuong && r.doiTuong !== locVal.doiTuong) return false
      // 5. Nguồn từ bộ lọc
      if (locVal.nguon && String(r.nguon ?? 'tay') !== locVal.nguon) return false
      // 6. Kho từ bộ lọc
      if (locVal.kho) {
        const khoDs = (r._khoDs as string[] | undefined) ?? (r.kho ? [String(r.kho)] : [])
        if (!khoDs.includes(locVal.kho)) return false
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

  // Thêm mới
  const handleThem = cfg.khongThem
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
          <span>
            <b>{list.length}</b> chứng từ · <b>{money(tongTien)} đ</b>
          </span>
        }
        the={(r, i) => {
          const ttInfo = TT_CT[r.tt] ?? ['dim', r.tt]
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
                <span className="m-the-ct-tien">{money(r.tong)} đ</span>
              </div>
              <div className="m-the-ct-hang2">
                <span className="m-the-ct-dt">{r.doiTuong || r.dienGiai || '—'}</span>
                {ghi && ttInfo && (
                  <span className={`m-ct-chip ${ttInfo[0]}`}>{ttInfo[1]}</span>
                )}
              </div>
              <div className="m-the-ct-hang3">
                {[r.ngay, r.gio, r.tenLoai].filter(Boolean).join(' · ')}
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
