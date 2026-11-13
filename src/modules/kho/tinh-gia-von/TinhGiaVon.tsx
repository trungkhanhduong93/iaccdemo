import { useCallback, useMemo, useState, type JSX } from 'react'
import { useLocation } from 'react-router-dom'
import type { ScreenProps } from '../../types'
import { BoLoc, useCauHinhLoc, useLocNhap, type OLocDef } from '../../../ui/LocNangCao'
import { ChonHaiCot, type MucHaiCot } from '../../../ui/ChonHaiCot'
import { ChonThang, type Thang } from '../../../ui/ChonThang'
import { thangMacDinh } from '../../../ui/ChonNgay'
import { IconFigmaSearch } from '../../../ui/IconFigma'
import { NutXuatExcel } from '../../../ui/CongCuDs'
import { xuatBangExcel, type CotXuat, type ODuLieu } from '../../../ui/xuatBangExcel'
import { fold } from '../../../ui/format'
import { HANG, KHO, NHOM, taoDsGiaVon, type DongGiaVon, type KetQuaTinh } from './du-lieu'
import { DsMaLoiGiaVon } from './DsMaLoiGiaVon'
import { TinhGiaVonModal } from './TinhGiaVonModal'
import { luuGiaVonThang } from './giaVonBq'

interface GiaTriLocGiaVon {
  thang: Thang
  tim: string
  kho: string[]
  nhom: string[]
  hang: string[]
}

function layThangMacDinh(): Thang {
  const md = thangMacDinh()
  return { t: md.tu.getMonth() + 1, n: md.tu.getFullYear() }
}

function hai(n: number): string {
  return String(n).padStart(2, '0')
}

function dinhDangNgayGio(d: Date): string {
  return `${hai(d.getDate())}/${hai(d.getMonth() + 1)}/${d.getFullYear()} ${hai(d.getHours())}:${hai(d.getMinutes())}`
}

function dinhDangNguyen(v: number): React.ReactNode {
  if (v === 0) return <span className="khong">0</span>
  return v.toLocaleString('vi-VN')
}

function dinhDangSo2(v: number): React.ReactNode {
  if (v === 0) return <span className="khong">0</span>
  return v.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const SO_DONG = 50

export function TinhGiaVon(_props: ScreenProps): JSX.Element {
  const path = useLocation().pathname
  const thangMd = useMemo(() => layThangMacDinh(), [])

  const loc0 = useLocNhap<GiaTriLocGiaVon>(() => ({
    thang: thangMd,
    tim: '',
    kho: [],
    nhom: [],
    hang: [],
  }))

  const { ap, nhap, dat } = loc0
  const [trang, setTrang] = useState(1)
  const [moModal, setMoModal] = useState(false)
  const [moLoi, setMoLoi] = useState(false)

  // Lưu lịch sử các dòng tính thành công trong modal: key "thang/nam|ma|kho" -> { luc, key }
  const [capNhatMoi, setCapNhatMoi] = useState<Map<string, { luc: Date; key: number }>>(new Map())

  const dsKho = useMemo<MucHaiCot[]>(() => KHO.map(k => ({ v: k.ten, t: k.ten, ma: k.ma })), [])
  const dsNhom = useMemo<MucHaiCot[]>(() => NHOM.map(n => ({ v: n.ten, t: n.ten, ma: n.ma })), [])

  const onNhomChange = useCallback((moiNhom: string[]) => {
    dat('nhom', moiNhom)
    if (moiNhom.length > 0) {
      const dsHangHopLe = HANG.filter(h => moiNhom.includes(h.nhom)).map(h => h.ten)
      dat('hang', nhap.hang.filter(ten => dsHangHopLe.includes(ten)))
    }
  }, [dat, nhap.hang])

  const dsHangLoc = useMemo<MucHaiCot[]>(() => {
    const hangNhom = nhap.nhom.length > 0 ? HANG.filter(h => nhap.nhom.includes(h.nhom)) : HANG
    return hangNhom.map(h => ({ v: h.ten, t: h.ten, ma: h.ma }))
  }, [nhap.nhom])

  const apLoc = useCallback(() => {
    loc0.loc()
    setTrang(1)
  }, [loc0])

  const oLoc: OLocDef[] = [
    {
      k: 'thoiGian',
      ten: 'Thời gian',
      coGiaTri: nhap.thang.t !== thangMd.t || nhap.thang.n !== thangMd.n,
      o: (
        <ChonThang
          value={nhap.thang}
          onChange={t => dat('thang', t)}
          btnClass="ds-o-sel"
        />
      ),
    },
    {
      k: 'tim',
      ten: 'Tìm kiếm',
      coGiaTri: Boolean(nhap.tim.trim()),
      o: (
        <input
          className="ds-o-inp"
          value={nhap.tim}
          placeholder="Mã, tên hàng hoá"
          title="Mã, tên hàng hoá"
          aria-label="Tìm hàng hoá"
          onChange={e => dat('tim', e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') apLoc()
          }}
        />
      ),
    },
    {
      k: 'kho',
      ten: 'Kho hàng',
      coGiaTri: nhap.kho.length > 0,
      o: (
        <ChonHaiCot
          chip
          ds={dsKho}
          value={nhap.kho}
          onChange={v => dat('kho', v)}
          nhan="Kho hàng"
          goiY="Chọn kho hàng"
          btnClass="ds-o-sel"
        />
      ),
    },
    {
      k: 'nhom',
      ten: 'Nhóm hàng hoá',
      coGiaTri: nhap.nhom.length > 0,
      o: (
        <ChonHaiCot
          chip
          ds={dsNhom}
          value={nhap.nhom}
          onChange={onNhomChange}
          nhan="Nhóm hàng hoá"
          goiY="Chọn nhóm hàng hoá"
          btnClass="ds-o-sel"
        />
      ),
    },
    {
      k: 'hang',
      ten: 'Hàng hoá',
      coGiaTri: nhap.hang.length > 0,
      o: (
        <ChonHaiCot
          chip
          ds={dsHangLoc}
          value={nhap.hang}
          onChange={v => dat('hang', v)}
          nhan="Hàng hoá"
          goiY="Chọn hàng hoá"
          btnClass="ds-o-sel"
        />
      ),
    },
  ]

  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(path, oLoc.map(o => o.k), ['thoiGian', 'tim'])

  // Dữ liệu gốc theo tháng đang áp dụng
  const dsGoc = useMemo(() => taoDsGiaVon(ap.thang), [ap.thang])

  // Ghép thời gian cập nhật mới và cờ nháy hiệu ứng
  const dsSauCapNhat = useMemo(() => {
    const khoaTh = `${ap.thang.t}/${ap.thang.n}`
    return dsGoc.map(x => {
      const m = capNhatMoi.get(`${khoaTh}|${x.hang.ma}|${x.kho.ten}`)
      if (m) {
        return { ...x, capNhat: m.luc, moi: true, moiKey: m.key }
      }
      return { ...x, moi: false, moiKey: 0 }
    })
  }, [dsGoc, ap.thang.t, ap.thang.n, capNhatMoi])

  // Lọc theo điều kiện đã áp dụng
  const dsLoc = useMemo(() => {
    const q = fold(ap.tim.trim())
    const co = (ds: string[], v: string) => !ds.length || ds.includes(v)
    return dsSauCapNhat.filter(x => {
      if (!co(ap.kho, x.kho.ten)) return false
      if (!co(ap.nhom, x.hang.nhom)) return false
      if (!co(ap.hang, x.hang.ten)) return false
      if (q) {
        const khopMa = fold(x.hang.ma).includes(q)
        const khopTen = fold(x.hang.ten).includes(q)
        if (!khopMa && !khopTen) return false
      }
      return true
    })
  }, [dsSauCapNhat, ap])

  const dsLoi = useMemo(() => dsLoc.filter(x => Boolean(x.loi)), [dsLoc])
  const moiNhat = useMemo(() => dsLoc.reduce((m, x) => (x.capNhat > m ? x.capNhat : m), new Date(0)), [dsLoc])

  const tongGtDau = useMemo(() => dsLoc.reduce((s, x) => s + x.gtDau, 0), [dsLoc])
  const tongGtNhap = useMemo(() => dsLoc.reduce((s, x) => s + x.gtNhap, 0), [dsLoc])

  const soTrang = Math.max(1, Math.ceil(dsLoc.length / SO_DONG))
  const trangHienTai = Math.min(trang, soTrang)
  const dau = (trangHienTai - 1) * SO_DONG
  const dsTrang = dsLoc.slice(dau, dau + SO_DONG)

  const onXongTinhGia = useCallback((kq: KetQuaTinh) => {
    luuGiaVonThang(kq.dieuKien.thang.t, kq.dieuKien.thang.n)   // phiếu bán trong tháng áp đơn giá vốn bình quân
    setCapNhatMoi(prev => {
      const next = new Map(prev)
      const khoaTh = `${kq.dieuKien.thang.t}/${kq.dieuKien.thang.n}`
      const nowKey = Date.now()
      for (const tc of kq.thanhCong) {
        next.set(`${khoaTh}|${tc.ma}|${tc.kho}`, { luc: kq.luc, key: nowKey })
      }
      return next
    })
  }, [])

  const onXuatExcel = () => {
    const tieuDe = `Tính giá vốn xuất kho tháng ${ap.thang.t}/${ap.thang.n}`
    const phu = `Tháng ${ap.thang.t}/${ap.thang.n}, ${dsLoc.length.toLocaleString('vi-VN')} dòng.`
    const cot: CotXuat[] = [
      { t: 'STT', rong: 8 },
      { t: 'Kho hàng', rong: 28 },
      { t: 'Mã kho', rong: 12 },
      { t: 'Hàng hoá', rong: 32 },
      { t: 'Mã hàng', rong: 14 },
      { t: 'Đơn vị tính', rong: 12 },
      { t: 'Số lượng đầu kỳ (I)', so: true, rong: 18 },
      { t: 'Đơn giá đầu kỳ', so: true, rong: 16 },
      { t: 'Giá trị đầu kỳ (II)', so: true, rong: 18 },
      { t: 'Số lượng nhập (III)', so: true, rong: 18 },
      { t: 'Giá trị nhập (IV)', so: true, rong: 18 },
      { t: 'Giá vốn', so: true, rong: 16 },
      { t: 'Cập nhật lúc', rong: 20 },
    ]
    const dong: ODuLieu[][] = dsLoc.map((x, i) => [
      i + 1,
      x.kho.ten,
      x.kho.ma,
      x.hang.ten,
      x.hang.ma,
      x.hang.dvt,
      x.slDau,
      x.dgDau,
      x.gtDau,
      x.slNhap,
      x.gtNhap,
      x.loi ? 'Lỗi' : Math.round(x.giaVon * 100) / 100,
      dinhDangNgayGio(x.capNhat),
    ])
    const tong: ODuLieu[] = [
      `Cộng ${dsLoc.length.toLocaleString('vi-VN')} dòng`,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      tongGtDau,
      '',
      tongGtNhap,
      '',
      '',
    ]
    xuatBangExcel(tieuDe, phu, cot, dong, tong)
  }

  return (
    <div className="page page-voucher page-gia-von">
      <div className="gia-von-dau">
        <h1>Tính giá vốn xuất kho</h1>
        <p>Bình quân gia quyền cuối kỳ. Giá vốn = (giá trị đầu kỳ + giá trị nhập) ÷ (số lượng đầu kỳ + số lượng nhập).</p>
      </div>

      <div className="the-ds">
        <div className="ds-toolbar-figma">
          <BoLoc
            ds={oLoc}
            cauHinh={cauHinhLoc}
            datCauHinh={datCauHinhLoc}
            dangLoc={loc0.dangLoc}
            khacNhap={loc0.khacNhap}
            onLoc={apLoc}
            onXoaHet={loc0.xoaNhap}
            chiNutPheu
            ngoaiRieng={{
              tim: (
                <div key="tim" className="ds-tim-figma">
                  <IconFigmaSearch size={16} />
                  <input
                    value={nhap.tim}
                    placeholder="Mã, tên hàng hoá"
                    title="Mã, tên hàng hoá"
                    aria-label="Tìm hàng hoá"
                    onChange={e => dat('tim', e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') apLoc()
                    }}
                  />
                </div>
              ),
            }}
          />

          <div className="ds-toolbar-phai">
            <button
              type="button"
              className="btn pri"
              onClick={() => setMoModal(true)}
            >
              Chạy tính giá
            </button>
          </div>
        </div>

        <div className="ds-hang-trang-thai">
          <div className="trang-thai">
            <span>
              Tháng <b>{ap.thang.t}/{ap.thang.n}</b>
            </span>
            {dsLoc.length > 0 && (
              <span>
                {' · '}Lần tính gần nhất <b>{dinhDangNgayGio(moiNhat)}</b>
              </span>
            )}
            {dsLoi.length > 0 && (
              <>
                <span>
                  {' · '}<span className="chip-loi">{dsLoi.length.toLocaleString('vi-VN')} mã lỗi</span> chưa có giá vốn
                </span>
                {' · '}
                <button
                  type="button"
                  className="lk"
                  onClick={() => setMoLoi(true)}
                >
                  Xem mã lỗi
                </button>
              </>
            )}
          </div>
          <div className="ds-toolbar-phai ds-cong-cu-h2">
            <NutXuatExcel onXuat={onXuatExcel} />
          </div>
        </div>

        <div className="cuon-ds">
          <table className="ds-gv">
            <colgroup>
              <col style={{ width: 48 }} />
              <col style={{ width: 180 }} />
              <col style={{ width: 240 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 96 }} />
              <col style={{ width: 112 }} />
              <col style={{ width: 128 }} />
              <col style={{ width: 96 }} />
              <col style={{ width: 128 }} />
              <col style={{ width: 124 }} />
              <col style={{ width: 136 }} />
            </colgroup>
            <thead>
              <tr>
                <th rowSpan={2} className="giua">#</th>
                <th rowSpan={2}>Kho hàng</th>
                <th rowSpan={2}>Hàng hoá</th>
                <th rowSpan={2} className="giua">Đơn vị tính</th>
                <th colSpan={3} className="nhom">Đầu kỳ</th>
                <th colSpan={2} className="nhom">Nhập trong kỳ</th>
                <th rowSpan={2} className="so gv">
                  Giá vốn<small>(II + IV) ÷ (I + III)</small>
                </th>
                <th rowSpan={2}>Cập nhật lúc</th>
              </tr>
              <tr>
                <th className="so">Số lượng<small>I</small></th>
                <th className="so">Đơn giá</th>
                <th className="so">Giá trị<small>II</small></th>
                <th className="so">Số lượng<small>III</small></th>
                <th className="so">Giá trị<small>IV</small></th>
              </tr>
            </thead>
            <tbody>
              {dsTrang.length > 0 ? (
                dsTrang.map((x: DongGiaVon & { moi?: boolean; moiKey?: number }, i) => {
                  const stt = dau + i + 1
                  return (
                    <tr
                      key={`${x.hang.ma}-${x.kho.ma}-${x.moiKey ?? 0}`}
                      className={x.moi ? 'moi' : undefined}
                    >
                      <td className="stt-ds">{stt}</td>
                      <td>
                        <span className="cat2" title={x.kho.ten}>
                          {x.kho.ten}
                        </span>
                        <span className="phu-chu">{x.kho.ma}</span>
                      </td>
                      <td>
                        <span className="cat2" title={x.hang.ten}>
                          {x.hang.ten}
                        </span>
                        <span className="phu-chu">{x.hang.ma}</span>
                      </td>
                      <td className="giua">{x.hang.dvt}</td>
                      <td className="so">{dinhDangSo2(x.slDau)}</td>
                      <td className="so">{dinhDangSo2(x.dgDau)}</td>
                      <td className="so">{dinhDangNguyen(x.gtDau)}</td>
                      <td className="so">{dinhDangSo2(x.slNhap)}</td>
                      <td className="so">{dinhDangNguyen(x.gtNhap)}</td>
                      <td className="so gv">
                        {x.loi ? (
                          <span className="chip-loi" title={x.loi}>
                            Lỗi
                          </span>
                        ) : (
                          dinhDangSo2(Math.round(x.giaVon * 100) / 100)
                        )}
                      </td>
                      <td className="tg">
                        {hai(x.capNhat.getDate())}/{hai(x.capNhat.getMonth() + 1)}/{x.capNhat.getFullYear()}{' '}
                        <span>
                          {hai(x.capNhat.getHours())}:{hai(x.capNhat.getMinutes())}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan={11}
                    className="trong"
                    style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--muted)' }}
                  >
                    Không có dòng nào khớp điều kiện lọc.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>Cộng {dsLoc.length.toLocaleString('vi-VN')} dòng</td>
                <td></td>
                <td></td>
                <td className="so">
                  {tongGtDau === 0 ? <span className="khong">0</span> : tongGtDau.toLocaleString('vi-VN')}
                </td>
                <td></td>
                <td className="so">
                  {tongGtNhap === 0 ? <span className="khong">0</span> : tongGtNhap.toLocaleString('vi-VN')}
                </td>
                <td className="gv"></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="phan-trang">
          <span>
            Tổng <b>{dsLoc.length.toLocaleString('vi-VN')}</b> dòng, 50 dòng/trang
          </span>
          <div className="trang">
            <button
              type="button"
              aria-label="Trang trước"
              disabled={trangHienTai <= 1}
              onClick={() => setTrang(t => Math.max(1, t - 1))}
            >
              &lsaquo;
            </button>
            {Array.from({ length: soTrang }, (_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  type="button"
                  aria-current={p === trangHienTai ? 'page' : undefined}
                  onClick={() => setTrang(p)}
                >
                  {p}
                </button>
              )
            })}
            <button
              type="button"
              aria-label="Trang sau"
              disabled={trangHienTai >= soTrang}
              onClick={() => setTrang(t => Math.min(soTrang, t + 1))}
            >
              &rsaquo;
            </button>
          </div>
        </div>
      </div>

      {moModal && (
        <TinhGiaVonModal
          thangDau={ap.thang}
          onDong={() => setMoModal(false)}
          onXong={onXongTinhGia}
        />
      )}

      {moLoi && (
        <DsMaLoiGiaVon
          thang={ap.thang}
          ds={dsLoi.map(x => ({
            ma: x.hang.ma,
            hang: x.hang.ten,
            kho: x.kho.ten,
            loi: x.loi,
          }))}
          tong={dsLoc.length}
          onDong={() => setMoLoi(false)}
        />
      )}
    </div>
  )
}
