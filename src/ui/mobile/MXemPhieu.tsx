import { useMemo, useState, type FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { duongDan, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { money } from '../format'
import { NGUON, TT_CT, dongCua, type Dong } from '../generic/gen'
import { boO, nhomCua, theoLoai } from '../generic/nhom'
import { useDongChungTu } from '../generic/VoucherScreen'
import { useDsPhieuDcn } from '../../modules/kho/BangDieuChuyen'
import { useDsPhieuSx } from '../../modules/kho/BangSanXuat'
import { SX, TT_SX } from '../../modules/kho/san-xuat'
import { DCN } from '../../modules/kho/dieu-chuyen'
import { MAN_DC } from '../../modules/kho/dieu-chinh'
import { daKhoaSo } from '../../data/mock'
import { ctTtCon, dsDcCon, dsTtCon, suaPhieu, ttThamChieu, xoaPhieu } from '../generic/daXoa'
import { HachToan, LichSu } from '../generic/ChungTuForm'
import { HopXacNhan } from '../LocNangCao'
import { HopInChungTu, type PhieuIn } from '../bao-cao/InChungTu'
import { Icon } from '../Icon'
import { MChon } from './MChon'
import { MTrong } from './MTrong'

export interface MXemPhieuProps extends ScreenProps {
  id?: string
}

export const MXemPhieu: FC<MXemPhieuProps> = ({ sc, mod, id }) => {
  const nav = useNavigate()
  const path = duongDan(mod, sc)

  const cfgMan = sc.voucher ?? { prefix: 'CT', doiTuong: 'none', dienGiai: [tenMan(sc)], tien: [0, 0] }
  const { rows: rowsGoc } = useDongChungTu(sc, mod)
  const rowsDcn = useDsPhieuDcn(cfgMan.dieuChuyen ?? 'xdc')
  const rowsSx = useDsPhieuSx(cfgMan.sanXuat ?? 'xsc')
  const rows = cfgMan.dieuChuyen ? rowsDcn : cfgMan.sanXuat ? rowsSx : rowsGoc

  const row = useMemo(() => rows.find(r => String(r.id) === String(id)), [rows, id])

  // Trường hợp không tìm thấy phiếu
  if (!row) {
    return (
      <div className="m-xp-trong">
        <MTrong tieuDe="Không tìm thấy chứng từ" moTa="Chứng từ không tồn tại hoặc đã bị xoá" />
        <div className="m-xp-trong-nut">
          <button type="button" className="btn pri" onClick={() => nav(path)}>
            Về danh sách
          </button>
        </div>
      </div>
    )
  }
  // Tách lớp trong để phiếu bị xoá giữa chừng không làm đổi số hook
  return <ThanPhieu key={String(row.id)} sc={sc} mod={mod} row={row} />
}

const ThanPhieu: FC<ScreenProps & { row: Row }> = ({ sc, mod, row }) => {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const cfgMan = sc.voucher ?? { prefix: 'CT', doiTuong: 'none', dienGiai: [tenMan(sc)], tien: [0, 0] }

  const [timKiem, setTimKiem] = useState('')
  const [moHt, setMoHt] = useState(false)
  const [moLs, setMoLs] = useState(false)
  const [moMenu, setMoMenu] = useState(false)
  const [hoiXoa, setHoiXoa] = useState(false)
  const [phieuIn, setPhieuIn] = useState<PhieuIn[] | null>(null)

  const loai = cfgMan.loai?.find(x => x.k === row.loai) ?? cfgMan.loai?.[0]
  const cfg = theoLoai(cfgMan, loai?.k)
  const nhom = nhomCua(mod.key, cfg, loai?.k)
  const bo = boO(nhom, cfg)

  const laKk = Boolean(cfg.kiemKe)
  const laDc = Boolean(cfg.dieuChinh)
  const sx = cfg.sanXuat
  const laSx = Boolean(sx)
  const sxNhap = sx ? SX[sx].nhap : false
  const dcn = cfg.dieuChuyen
  const laDcn = Boolean(dcn)
  const coTcNhap = sxNhap || dcn === 'ndc'
  const manDoi = sx ? SX[SX[sx].doi!].man : dcn === 'ndc' ? DCN.xdc.man : ''
  const coTtXn = laSx || dcn === 'xdc' || dcn === 'ndc'
  const laTien = mod.key === 'tien'
  const kieu = kieuGhiSo(s.cheDo)
  const ghi = kieuGhiSo(s.goi) !== 'khong'

  // Dòng chi tiết
  const idSeed = `${sc.code ?? sc.slug}-${row.id}`
  const dsDong: Dong[] = useMemo(() => {
    return (row._dong as Dong[] | undefined) ?? dongCua(cfg, idSeed)
  }, [row, cfg, idSeed])

  // Lọc dòng nếu có tìm kiếm
  const dsDongLoc = useMemo(() => {
    if (!timKiem.trim()) return dsDong
    const q = timKiem.trim().toLowerCase()
    return dsDong.filter(d => {
      const txt = `${d.ma ?? ''} ${d.ten ?? ''} ${d.ly ?? ''} ${d.ghiChu ?? ''}`.toLowerCase()
      return txt.includes(q)
    })
  }, [dsDong, timKiem])

  // Tính tổng
  const tongTien = dsDong.reduce((a, d) => a + (Number(d.tien) || 0), 0)
  const tongCk = dsDong.reduce((a, d) => a + (Number(d.ck) || 0), 0)
  const tongThue = dsDong.reduce((a, d) => a + (Number(d.thue) || 0), 0)
  const tongThanhToan = laKk ? 0 : tongTien - tongCk + tongThue

  // Tên loại phiếu
  const tenLoai = loai?.ten ?? (row.tenLoai ? String(row.tenLoai) : tenMan(sc))
  const soCt = String(row.so)

  // Chip trạng thái
  const ttCtInfo = TT_CT[row.tt] ?? ['dim', row.tt]
  const ttSxInfo = coTtXn && row.ttSx ? TT_SX[String(row.ttSx)] : null

  // Kho
  const kho = String(
    row._kho ??
      row.kho ??
      (row._khoDs as string[] | undefined)?.[0] ??
      dsDong.find(d => d.kho)?.kho ??
      '',
  )

  // Tham chiếu
  const ctTtCu = ctTtCon(row)
  const dsTt = dsTtCon(row)
  const dsDc = dsDcCon(row)

  // Nút hành động chính màu cam (var(--orange))
  // Theo bản máy tính: ở chế độ xem, nếu có ghi sổ thì là nút Ghi sổ / Bỏ ghi sổ
  // nếu gói Free (không ghi sổ) thì là nút Sửa
  // phiếu điều chỉnh chỉ xem (không sửa, không ghi sổ)
  const coNutGhiSo = kieu !== 'khong' && !laDc
  const nutChinh = coNutGhiSo
    ? {
        nhan: row.tt === 'ghi' ? 'Bỏ ghi sổ' : 'Ghi sổ',
        action: () => toast(row.tt === 'ghi' ? 'Đã bỏ ghi sổ' : 'Đã ghi sổ'),
      }
    : !laDc
    ? {
        nhan: 'Sửa',
        action: () => nav(`${path}/${row.id}?sua=1`),
      }
    : null

  // Menu ba chấm
  const dsMenu = [
    ...(!laDc ? [{ k: 'sua', ten: 'Sửa chứng từ' }] : []),
    { k: 'in', ten: 'In chứng từ' },
    ...(!laDc ? [{ k: 'copy', ten: 'Sao chép chứng từ' }] : []),
    ...(!laDc ? [{ k: 'xoa', ten: 'Xoá chứng từ' }] : []),
  ]

  const handleMenuChon = (k: string) => {
    if (k === 'sua') {
      nav(`${path}/${row.id}?sua=1`)
    } else if (k === 'in') {
      setPhieuIn([
        {
          sc,
          cfg,
          loai,
          row: {
            ...row,
            id: row.id,
            so: soCt,
            ngay: row.ngay,
            cn: row.cn,
            doiTuong: row.doiTuong,
            dienGiai: row.dienGiai,
            loai: loai?.k,
            tien: tongTien,
            thue: tongThue,
            tong: tongThanhToan,
          },
        },
      ])
    } else if (k === 'copy') {
      toast('Đã sao chép chứng từ')
      nav(`${path}/moi${row.loai ? `?loai=${row.loai}` : ''}`, { state: { saoChep: row } })
    } else if (k === 'xoa') {
      if (daKhoaSo(String(row.ngay))) {
        toast(`${row.so} thuộc kỳ đã khoá sổ, không xoá được`)
      } else if (kieu !== 'khong' && row.tt !== 'nhap') {
        toast(`${row.so} đã ghi sổ, bỏ ghi sổ rồi mới xoá`)
      } else if (ttThamChieu(row)) {
        toast(`${row.so} có phiếu ${ttThamChieu(row)!.so} tham chiếu, xoá ${ttThamChieu(row)!.so} trước`)
      } else if (((laSx && !sxNhap) || dcn === 'xdc') && row._phieuNhap) {
        toast(`${row.so} đã có phiếu nhập ${(row._phieuNhap as { so: string }).so}, xoá phiếu nhập trước`)
      } else {
        setHoiXoa(true)
      }
    }
  }

  const thucHienXoa = () => {
    setHoiXoa(false)
    xoaPhieu(`${mod.key}/${sc.slug}`, [{ id: String(row.id), so: soCt }], s.ten)
    if (coTcNhap && row._thamChieuId) {
      suaPhieu(manDoi, String(row._thamChieuId), { ttSx: 'cho', _phieuNhap: undefined })
    }
    if (laKk) {
      xoaPhieu(
        MAN_DC,
        dsDcCon(row).map(c => ({ id: c.id, so: c.so })),
        s.ten,
      )
    }
    toast(`Đã xoá ${soCt}`)
    nav(path)
  }

  // Khối Hạch toán có hiển thị không
  const coHachToan = kieu !== 'khong' && !laTien && !laKk && dcn !== 'ck'

  return (
    <div className="m-xp">
      {/* 1. Thanh trên của màn chi tiết (dưới thanh trên chung của MobileShell) */}
      <div className="m-xp-dau">
        <div className="m-xp-dau-trai">
          <span className="m-xp-loai">{tenLoai}</span>
          <h2 className="m-xp-so">{soCt}</h2>
        </div>
        <div className="m-xp-dau-phai">
          {ghi && ttCtInfo && <span className={`m-ct-chip ${ttCtInfo[0]}`}>{ttCtInfo[1]}</span>}
          {ttSxInfo && <span className={`m-ct-chip ${ttSxInfo[0]}`}>{ttSxInfo[1]}</span>}
        </div>
      </div>

      {/* 2. Thẻ đầu phiếu: ngày giờ, đối tượng, chi nhánh, kho, diễn giải, nguồn, tham chiếu */}
      <div className="m-the-trang m-xp-the-dau">
        <div className="m-xp-dong-tt">
          <span className="m-xp-nhan">Thời gian:</span>
          <span className="m-xp-tri">{[row.ngay, row.gio].filter(Boolean).join(' ')}</span>
        </div>
        {row.doiTuong && (
          <div className="m-xp-dong-tt">
            <span className="m-xp-nhan">{laTien ? 'Đối tượng' : cfg.nhan ?? 'Đối tượng'}:</span>
            <span className="m-xp-tri dam">{String(row.doiTuong)}</span>
          </div>
        )}
        {row.cn && (
          <div className="m-xp-dong-tt">
            <span className="m-xp-nhan">Chi nhánh:</span>
            <span className="m-xp-tri">{String(row.cn)}</span>
          </div>
        )}
        {dcn === 'xdc' ? (
          <>
            {kho && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Kho xuất:</span>
                <span className="m-xp-tri dam">{kho}</span>
              </div>
            )}
            {row._cnNhan && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Chi nhánh nhận:</span>
                <span className="m-xp-tri">{String(row._cnNhan)}</span>
              </div>
            )}
            {row._khoNhan && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Kho nhận:</span>
                <span className="m-xp-tri">{String(row._khoNhan)}</span>
              </div>
            )}
          </>
        ) : dcn === 'ndc' ? (
          <>
            {row._cnXuat && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Chi nhánh xuất:</span>
                <span className="m-xp-tri">{String(row._cnXuat)}</span>
              </div>
            )}
            {row._khoXuat && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Kho xuất:</span>
                <span className="m-xp-tri">{String(row._khoXuat)}</span>
              </div>
            )}
            {kho && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Kho nhận:</span>
                <span className="m-xp-tri dam">{kho}</span>
              </div>
            )}
          </>
        ) : dcn === 'ck' ? (
          <>
            {kho && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Kho xuất:</span>
                <span className="m-xp-tri dam">{kho}</span>
              </div>
            )}
            {row._khoNhan && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Kho nhận:</span>
                <span className="m-xp-tri dam">{String(row._khoNhan)}</span>
              </div>
            )}
          </>
        ) : (
          kho && (
            <div className="m-xp-dong-tt">
              <span className="m-xp-nhan">{laKk ? 'Kho kiểm kê' : 'Kho'}:</span>
              <span className="m-xp-tri dam">{kho}</span>
            </div>
          )
        )}
        {(row.dienGiai || row._ghiChu) && (
          <div className="m-xp-dong-tt">
            <span className="m-xp-nhan">Diễn giải:</span>
            <span className="m-xp-tri">{String(row.dienGiai || row._ghiChu)}</span>
          </div>
        )}
        <div className="m-xp-dong-tt">
          <span className="m-xp-nhan">Nguồn:</span>
          <span className="m-xp-tri">
            <span className={`src ${NGUON[row.nguon]?.[0] ?? 'tay'}`}>
              {NGUON[row.nguon]?.[1] ?? 'Thủ công'}
            </span>
          </span>
        </div>

        {/* Dòng tham chiếu */}
        {coTcNhap && row._thamChieu && (
          <div className="m-xp-dong-tt m-xp-tc">
            <span className="m-xp-nhan">Tham chiếu:</span>
            <span className="m-xp-tri">
              <Link className="m-xp-link-tc" to={String(row._thamChieuDi || `/app/${manDoi}/${row._thamChieuId}`)}>
                {String(row._thamChieu)}
              </Link>
            </span>
          </div>
        )}
        {coTtXn && !sxNhap && dcn !== 'ndc' && row._phieuNhap && (
          <div className="m-xp-dong-tt m-xp-tc">
            <span className="m-xp-nhan">Phiếu nhập:</span>
            <span className="m-xp-tri">
              <Link
                className="m-xp-link-tc"
                to={`/app/${dcn === 'xdc' ? DCN.ndc.man : SX[SX[sx!].doi!].man}/${(row._phieuNhap as { id: string }).id}`}
              >
                {(row._phieuNhap as { so: string }).so}
              </Link>
            </span>
          </div>
        )}
        {laKk && dsDc.length > 0 && (
          <div className="m-xp-dong-tt m-xp-tc">
            <span className="m-xp-nhan">Xử lý chênh lệch:</span>
            <span className="m-xp-tri m-xp-links">
              {dsDc.map(c => (
                <Link key={c.id} className="m-xp-link-tc" to={`/app/${MAN_DC}/${c.id}`}>
                  {c.so}
                </Link>
              ))}
            </span>
          </div>
        )}
        {laDc && row._thamChieu && (
          <div className="m-xp-dong-tt m-xp-tc">
            <span className="m-xp-nhan">Theo phiếu kiểm kê:</span>
            <span className="m-xp-tri">
              <Link className="m-xp-link-tc" to={`/app/kho/5-1-10/${String(row._kkId)}`}>
                {String(row._thamChieu)}
              </Link>
            </span>
          </div>
        )}
        {ctTtCu && (
          <div className="m-xp-dong-tt m-xp-tc">
            <span className="m-xp-nhan">Chứng từ thanh toán:</span>
            <span className="m-xp-tri">
              <Link className="m-xp-link-tc" to={`/app/tien/2-1-1/${ctTtCu.id}`}>
                {ctTtCu.so}
              </Link>
            </span>
          </div>
        )}
        {dsTt.length > 0 && (
          <div className="m-xp-dong-tt m-xp-tc">
            <span className="m-xp-nhan">Phiếu thanh toán:</span>
            <span className="m-xp-tri m-xp-links">
              {dsTt.map(c => (
                <Link key={c.id} className="m-xp-link-tc" to={`/app/tien/2-1-1/${c.id}`}>
                  {c.so}
                </Link>
              ))}
            </span>
          </div>
        )}
        {row._thamChieuDi && !coTcNhap && (
          <div className="m-xp-dong-tt m-xp-tc">
            <span className="m-xp-nhan">Phiếu gốc:</span>
            <span className="m-xp-tri">
              <Link className="m-xp-link-tc" to={String(row._thamChieuDi)}>
                {String(row._thamChieu || 'Xem phiếu gốc')}
              </Link>
            </span>
          </div>
        )}
      </div>

      {/* 3. Danh sách dòng hàng / dòng thu chi / dòng kiểm kê */}
      <div className="m-xp-khoi-dong">
        <div className="m-xp-tieu-khoi">
          {laTien ? 'CHI TIẾT THU CHI' : laKk ? 'DANH SÁCH KIỂM KÊ' : 'DANH SÁCH HÀNG HOÁ'} ({dsDong.length})
        </div>

        {dsDong.length > 3 && (
          <div className="m-xp-tim-wrap">
            <Icon n="search" className="ic sm m-xp-tim-ic" />
            <input
              type="text"
              className="m-xp-tim-inp"
              placeholder="Nhập tên, mã hàng hoá..."
              value={timKiem}
              onChange={e => setTimKiem(e.target.value)}
            />
            {timKiem && (
              <button type="button" className="m-xp-tim-x" onClick={() => setTimKiem('')}>
                <Icon n="x" className="ic sm" />
              </button>
            )}
          </div>
        )}

        <div className="m-xp-ds-the">
          {dsDongLoc.map((d, i) => {
            if (laKk) {
              const chenh = (d.tonTt ?? 0) - (d.tonHt ?? 0)
              return (
                <div key={i} className="m-the-trang m-xp-the-dong">
                  <div className="m-xp-dong-tieu">
                    {i + 1}. {d.ten || 'Mặt hàng'}
                  </div>
                  {d.ma && <div className="m-xp-dong-ma">Mã: {d.ma}</div>}
                  <div className="m-xp-dong-chi-tiet">
                    <div className="m-xp-dong-tt">
                      <span className="m-xp-nhan">Tồn hệ thống:</span>
                      <span className="m-xp-tri">{money(d.tonHt ?? 0)} {d.dvt ?? ''}</span>
                    </div>
                    <div className="m-xp-dong-tt">
                      <span className="m-xp-nhan">Tồn thực tế:</span>
                      <span className="m-xp-tri dam">{money(d.tonTt ?? 0)} {d.dvt ?? ''}</span>
                    </div>
                    <div className="m-xp-dong-tt">
                      <span className="m-xp-nhan">Chênh lệch:</span>
                      <span className={`m-xp-tri dam ${chenh < 0 ? 'do' : chenh > 0 ? 'xanh' : ''}`}>
                        {chenh > 0 ? `+${money(chenh)}` : money(chenh)} {d.dvt ?? ''}
                        {chenh < 0 && <span className="m-ct-chip err">Thiếu</span>}
                        {chenh > 0 && <span className="m-ct-chip ok">Thừa</span>}
                      </span>
                    </div>
                    {d.ghiChu && (
                      <div className="m-xp-dong-tt">
                        <span className="m-xp-nhan">Ghi chú:</span>
                        <span className="m-xp-tri">{d.ghiChu}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            if (laTien) {
              return (
                <div key={i} className="m-the-trang m-xp-the-dong">
                  <div className="m-xp-dong-tieu">
                    {i + 1}. {d.ly || d.ten || row.dienGiai || 'Nội dung'}
                  </div>
                  <div className="m-xp-dong-chi-tiet">
                    <div className="m-xp-dong-tt">
                      <span className="m-xp-nhan">Số tiền:</span>
                      <span className="m-xp-tri dam cam">{money(d.tien || 0)} đ</span>
                    </div>
                    {d.dt && d.dt !== row.doiTuong && (
                      <div className="m-xp-dong-tt">
                        <span className="m-xp-nhan">Đối tượng:</span>
                        <span className="m-xp-tri">{d.dt}</span>
                      </div>
                    )}
                    {d.ghiChu && (
                      <div className="m-xp-dong-tt">
                        <span className="m-xp-nhan">Ghi chú:</span>
                        <span className="m-xp-tri">{d.ghiChu}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            return (
              <div key={i} className="m-the-trang m-xp-the-dong">
                <div className="m-xp-dong-tieu">
                  {i + 1}. {d.ten || 'Mặt hàng'}
                </div>
                {d.ma && <div className="m-xp-dong-ma">Mã: {d.ma}</div>}
                <div className="m-xp-dong-chi-tiet">
                  <div className="m-xp-dong-tt">
                    <span className="m-xp-nhan">Số lượng:</span>
                    <span className="m-xp-tri dam">
                      {d.sl ?? 0} {d.dvt ?? ''}
                    </span>
                  </div>
                  {d.gia !== undefined && (
                    <div className="m-xp-dong-tt">
                      <span className="m-xp-nhan">Đơn giá:</span>
                      <span className="m-xp-tri">{money(d.gia)} đ</span>
                    </div>
                  )}
                  {Boolean(d.ck || bo.ck) && (
                    <div className="m-xp-dong-tt">
                      <span className="m-xp-nhan">Giảm giá:</span>
                      <span className="m-xp-tri">{money(d.ck || 0)} đ</span>
                    </div>
                  )}
                  {Boolean(d.thue || d.ts || tongThue > 0) && (
                    <div className="m-xp-dong-tt">
                      <span className="m-xp-nhan">VAT{d.ts ? ` (${d.ts}%)` : ''}:</span>
                      <span className="m-xp-tri">{money(d.thue || 0)} đ</span>
                    </div>
                  )}
                  <div className="m-xp-dong-tt">
                    <span className="m-xp-nhan">Thành tiền:</span>
                    <span className="m-xp-tri dam cam">{money(d.tien || 0)} đ</span>
                  </div>
                  {d.ghiChu && (
                    <div className="m-xp-dong-tt">
                      <span className="m-xp-nhan">Ghi chú:</span>
                      <span className="m-xp-tri">{d.ghiChu}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. Khối tổng kết: khớp số với DaiTong */}
      {!laKk && (
        <div className="m-the-trang m-xp-the-tong">
          <div className="m-xp-dong-tt">
            <span className="m-xp-nhan">Thành tiền mặt hàng:</span>
            <span className="m-xp-tri">{money(tongTien)} đ</span>
          </div>
          {Boolean(bo.ck || tongCk) && (
            <div className="m-xp-dong-tt">
              <span className="m-xp-nhan">Tổng tiền giảm giá:</span>
              <span className="m-xp-tri">{tongCk ? `-${money(tongCk)}` : '0'} đ</span>
            </div>
          )}
          {Boolean(tongThue > 0) && (
            <div className="m-xp-dong-tt">
              <span className="m-xp-nhan">Tổng tiền thuế:</span>
              <span className="m-xp-tri">{money(tongThue)} đ</span>
            </div>
          )}
          <div className="m-xp-dong-tt m-xp-dong-tong-cong">
            <span className="m-xp-nhan dam">Tổng thanh toán:</span>
            <span className="m-xp-tri dam cam lon">{money(tongThanhToan)} đ</span>
          </div>
        </div>
      )}

      {/* 5. Khối Hạch toán thu gọn, bấm để mở */}
      {coHachToan && (
        <div className="m-the-trang m-xp-accordion">
          <button
            type="button"
            className="m-xp-acc-head"
            onClick={() => setMoHt(!moHt)}
            aria-expanded={moHt}
          >
            <div className="m-xp-acc-tieu">
              <Icon n="book" className="ic sm" />
              <span>{kieu === 'noco' ? 'Hạch toán' : 'Ghi sổ'}</span>
            </div>
            <Icon n={moHt ? 'chevu' : 'chevd'} className="ic sm" />
          </button>
          {moHt && (
            <div className="m-xp-acc-nd">
              <HachToan
                cfg={cfg}
                tien={tongTien - tongCk}
                thue={tongThue}
                dt={String(row.doiTuong ?? '')}
                cn={String(row.cn ?? '')}
              />
            </div>
          )}
        </div>
      )}

      {/* 6. Khối Lịch sử */}
      <div className="m-the-trang m-xp-accordion">
        <button
          type="button"
          className="m-xp-acc-head"
          onClick={() => setMoLs(!moLs)}
          aria-expanded={moLs}
        >
          <div className="m-xp-acc-tieu">
            <Icon n="history" className="ic sm" />
            <span>Lịch sử thao tác</span>
          </div>
          <Icon n={moLs ? 'chevu' : 'chevd'} className="ic sm" />
        </button>
        {moLs && (
          <div className="m-xp-acc-nd">
            <LichSu goi={s.goi} moi={false} man={`${mod.key}/${sc.slug}`} id={String(row.id)} />
          </div>
        )}
      </div>

      {/* 7. Thanh thao tác dính đáy (nằm trên thanh dưới nổi, không bị che) */}
      <div className="m-xp-day">
        <div className="m-xp-day-trai">
          <span className="m-xp-day-nhan">Tổng:</span>
          <span className="m-xp-day-tong">{money(tongThanhToan)} đ</span>
        </div>
        <div className="m-xp-day-phai">
          {nutChinh && (
            <button type="button" className="m-xp-nut-cam" onClick={nutChinh.action}>
              {nutChinh.nhan}
            </button>
          )}
          <button
            type="button"
            className="m-xp-nut-menu"
            onClick={() => setMoMenu(true)}
            aria-label="Thao tác khác"
          >
            <Icon n="more" className="ic" />
          </button>
        </div>
      </div>

      {/* Tấm trượt menu ba chấm MChon */}
      <MChon
        mo={moMenu}
        onDong={() => setMoMenu(false)}
        tieuDe="Thao tác chứng từ"
        ds={dsMenu}
        onChon={handleMenuChon}
      />

      {/* Hộp xác nhận xoá */}
      {hoiXoa && (
        <HopXacNhan
          tieuDe={`Xoá ${soCt}?`}
          nut="Xoá phiếu"
          onDong={() => setHoiXoa(false)}
          onDongY={thucHienXoa}
        >
          Phiếu đã xoá không lấy lại được.
          {laKk && dsDc.length > 0 && <> Phiếu điều chỉnh {dsDc.map(c => c.so).join(', ')} cũng bị xoá theo.</>}
        </HopXacNhan>
      )}

      {/* Hộp in chứng từ */}
      {phieuIn && <HopInChungTu ds={phieuIn} onDong={() => setPhieuIn(null)} />}
    </div>
  )
}
