import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { createPortal } from 'react-dom'
import { ChonHaiCot } from '../../../ui/ChonHaiCot'
import { ChonThang } from '../../../ui/ChonThang'
import { DsMaLoiGiaVon } from './DsMaLoiGiaVon'
import {
  HANG,
  KHO,
  NHOM,
  lapViecTinh,
  type DieuKienTinh,
  type DongLoi,
  type HangHoa,
  type KetQuaTinh,
  type Kho,
  type Thang,
} from './du-lieu'

function dongHo(ms: number): string {
  const g = Math.round(ms / 1000)
  return `${String(Math.floor(g / 60)).padStart(2, '0')}:${String(g % 60).padStart(2, '0')}`
}

export function TinhGiaVonModal(props: {
  thangDau: Thang
  onDong: () => void
  onXong: (kq: KetQuaTinh) => void
}): JSX.Element {
  const { thangDau, onDong, onXong } = props

  const [thang, setThang] = useState<Thang | null>(thangDau)
  const [chonKho, setChonKho] = useState<string[]>([])
  const [chonNhom, setChonNhom] = useState<string[]>([])
  const [chonHang, setChonHang] = useState<string[]>([])
  const [loiThang, setLoiThang] = useState(false)

  const [trangThai, setTrangThai] = useState<'chon' | 'chay' | 'dung' | 'xong' | 'huy'>('chon')
  const [viec, setViec] = useState<{ hang: HangHoa; kho: Kho; loi: string }[]>([])
  const [daTinh, setDaTinh] = useState(0)
  const [daChayMs, setDaChayMs] = useState(0)
  const [tgKetThuc, setTgKetThuc] = useState(0)
  const [ketQua, setKetQua] = useState<KetQuaTinh | null>(null)
  const [moLoi, setMoLoi] = useState(false)

  const henRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const henDungRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dangChay = trangThai === 'chay' || trangThai === 'dung'

  const doiDieuKien = useCallback(() => {
    setTrangThai(prev => (prev === 'xong' || prev === 'huy' ? 'chon' : prev))
  }, [])

  const onNhomChange = useCallback((moiNhom: string[]) => {
    setChonNhom(moiNhom)
    doiDieuKien()
    const dsTenHopLe = moiNhom.length > 0 ? HANG.filter(h => moiNhom.includes(h.nhom)).map(h => h.ten) : HANG.map(h => h.ten)
    setChonHang(prev => prev.filter(ten => dsTenHopLe.includes(ten)))
  }, [doiDieuKien])

  const dsKho = useMemo(() => KHO.map(k => ({ v: k.ten, t: k.ten, ma: k.ma })), [])
  const dsNhom = useMemo(() => NHOM.map(n => ({ v: n.ten, t: n.ten, ma: n.ma })), [])
  const dsHang = useMemo(() => {
    const hangLoc = chonNhom.length > 0 ? HANG.filter(h => chonNhom.includes(h.nhom)) : HANG
    return hangLoc.map(h => ({ v: h.ten, t: h.ten, ma: h.ma }))
  }, [chonNhom])

  // Dọn hẹn khi unmount
  useEffect(() => {
    return () => {
      if (henRef.current) clearInterval(henRef.current)
      if (henDungRef.current) clearTimeout(henDungRef.current)
    }
  }, [])

  // Đóng modal bằng phím Escape khi không chạy
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !dangChay && !moLoi) {
        e.stopPropagation()
        onDong()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dangChay, moLoi, onDong])

  const onChay = () => {
    if (!thang) {
      setLoiThang(true)
      return
    }
    setLoiThang(false)
    if (henRef.current) clearInterval(henRef.current)
    if (henDungRef.current) clearTimeout(henDungRef.current)

    const dk: DieuKienTinh = {
      thang,
      kho: chonKho,
      nhom: chonNhom,
      hang: chonHang,
    }
    const danhSachViec = lapViecTinh(dk)
    setViec(danhSachViec)
    setDaTinh(0)

    const batDau = Date.now()
    setDaChayMs(0)
    setTrangThai('chay')

    const tong = danhSachViec.length
    if (tong === 0) {
      const ketQuaMoi: KetQuaTinh = {
        dieuKien: dk,
        tong: 0,
        loi: [],
        thanhCong: [],
        luc: new Date(),
      }
      setTgKetThuc(0)
      setKetQua(ketQuaMoi)
      setTrangThai('xong')
      onXong(ketQuaMoi)
      return
    }

    const nhip = Math.max(60, Math.floor(9000 / tong))
    let count = 0

    henRef.current = setInterval(() => {
      count++
      setDaTinh(count)
      const daChay = Date.now() - batDau
      setDaChayMs(daChay)

      if (count >= tong) {
        if (henRef.current) {
          clearInterval(henRef.current)
          henRef.current = null
        }
        const tgXong = Date.now() - batDau
        setTgKetThuc(tgXong)

        const soLoi = danhSachViec.filter(x => Boolean(x.loi))
        const soTc = danhSachViec.filter(x => !x.loi)
        const dsLoi: DongLoi[] = soLoi.map(x => ({
          ma: x.hang.ma,
          hang: x.hang.ten,
          kho: x.kho.ten,
          loi: x.loi,
        }))
        const dsTc = soTc.map(x => ({
          ma: x.hang.ma,
          kho: x.kho.ten,
        }))
        const ketQuaMoi: KetQuaTinh = {
          dieuKien: dk,
          tong,
          loi: dsLoi,
          thanhCong: dsTc,
          luc: new Date(),
        }
        setKetQua(ketQuaMoi)
        setTrangThai('xong')
        onXong(ketQuaMoi)
      }
    }, nhip)
  }

  const onHuy = () => {
    if (henRef.current) {
      clearInterval(henRef.current)
      henRef.current = null
    }
    setTrangThai('dung')
    henDungRef.current = setTimeout(() => {
      setTrangThai('huy')
      henDungRef.current = null
    }, 800)
  }

  const tongViec = viec.length
  const pt = tongViec ? Math.floor((daTinh / tongViec) * 100) : 0
  const dang = viec[Math.min(daTinh, Math.max(0, tongViec - 1))]
  const conMs = daTinh > 0 ? (daChayMs / daTinh) * (tongViec - daTinh) : 0

  const soLoi = ketQua ? ketQua.loi.length : 0
  const soTc = ketQua ? ketQua.thanhCong.length : 0

  return (
    <>
      {createPortal(
        <div
          className="tgv-phu modal-tinh-gia"
          onClick={e => {
            if (e.target === e.currentTarget && !dangChay) onDong()
          }}
        >
          <section className="tgv-hop" role="dialog" aria-modal="true" aria-labelledby="tinh-gia-ten">
            <header className="hop-dau">
              <div>
                <h2 id="tinh-gia-ten">Tính giá vốn xuất kho</h2>
                <p>Bình quân gia quyền cuối kỳ, tính riêng từng mặt hàng ở từng kho.</p>
              </div>
              <button
                className="nut-x"
                type="button"
                aria-label="Đóng"
                disabled={dangChay}
                onClick={onDong}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
                </svg>
              </button>
            </header>

            <div className="hop-than">
              <div className="bang">
                {/* Dòng 1: Kho hàng */}
                <div className="dk">
                  <div className="dk-nhan">
                    <span>Kho hàng</span>
                    <span className="i" title="Vui lòng để trống nếu muốn tính cho tất cả các kho">i</span>
                  </div>
                  <div className="dk-o">
                    <ChonHaiCot
                      chip
                      nhan="Kho hàng"
                      goiY="Vui lòng để trống nếu muốn tính cho tất cả các kho"
                      ds={dsKho}
                      value={chonKho}
                      onChange={v => {
                        setChonKho(v)
                        doiDieuKien()
                      }}
                      disabled={dangChay}
                    />
                  </div>
                </div>

                {/* Dòng 2: Thời gian */}
                <div className="dk">
                  <div className="dk-nhan">
                    <span>Thời gian</span>
                    <span className="bb">(*)</span>
                  </div>
                  <div className="dk-o">
                    <ChonThang
                      value={thang}
                      onChange={t => {
                        setThang(t)
                        setLoiThang(false)
                        doiDieuKien()
                      }}
                      disabled={dangChay}
                      loi={loiThang}
                    />
                    {loiThang && <p className="loi-chu" id="loi-thang">Chọn tháng cần tính giá.</p>}
                  </div>
                </div>

                {/* Dòng 3: Nhóm hàng hoá */}
                <div className="dk">
                  <div className="dk-nhan">
                    <span>Nhóm hàng hoá</span>
                    <span className="i" title="Vui lòng để trống nếu muốn tính cho tất cả nhóm hàng hoá">i</span>
                  </div>
                  <div className="dk-o">
                    <ChonHaiCot
                      chip
                      nhan="Nhóm hàng hoá"
                      goiY="Vui lòng để trống nếu muốn tính cho tất cả nhóm hàng hoá"
                      ds={dsNhom}
                      value={chonNhom}
                      onChange={onNhomChange}
                      disabled={dangChay}
                    />
                  </div>
                </div>

                {/* Dòng 4: Hàng hoá */}
                <div className="dk">
                  <div className="dk-nhan">
                    <span>Hàng hoá</span>
                    <span className="i" title="Vui lòng để trống nếu muốn tính cho tất cả hàng hoá">i</span>
                  </div>
                  <div className="dk-o">
                    <ChonHaiCot
                      chip
                      nhan="Hàng hoá"
                      goiY="Vui lòng để trống nếu muốn tính cho tất cả hàng hoá"
                      ds={dsHang}
                      value={chonHang}
                      onChange={v => {
                        setChonHang(v)
                        doiDieuKien()
                      }}
                      disabled={dangChay}
                    />
                  </div>
                </div>
              </div>

              {/* Tiến trình */}
              {dangChay && (
                <div className="tien-do" id="tien-do">
                  <div className="td-tren">
                    <b id="td-nhan">{trangThai === 'dung' ? 'Đang dừng tính giá vốn' : 'Đang tính giá vốn'}</b>
                    <span className="td-pt">{pt}%</span>
                  </div>
                  <div
                    className="thanh"
                    role="progressbar"
                    aria-label="Tiến trình tính giá vốn"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={pt}
                  >
                    <i style={{ width: `${pt}%` }} />
                  </div>
                  <div className="td-dang">{dang ? `${dang.hang.ten} · ${dang.kho.ten}` : ''}</div>
                  <div className="td-duoi">
                    <span>
                      Đã tính {daTinh.toLocaleString('vi-VN')}/{tongViec.toLocaleString('vi-VN')} mặt hàng theo kho
                    </span>
                    <span>
                      Đã chạy {dongHo(daChayMs)}, còn khoảng {dongHo(conMs)}
                    </span>
                  </div>
                </div>
              )}

              {/* Kết quả */}
              {trangThai === 'huy' && (
                <div className="kq huy" role="status">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="10" cy="10" r="8" />
                    <path d="M10 6v4.6M10 13.6v.1" />
                  </svg>
                  <div>
                    <b>Đã huỷ ở {daTinh.toLocaleString('vi-VN')}/{tongViec.toLocaleString('vi-VN')} mặt hàng theo kho</b>
                    <p>
                      Đơn giá xuất kho tháng {thang ? `${thang.t}/${thang.n}` : ''} giữ nguyên như trước lần chạy này. Chưa có phiếu nào bị đổi.
                    </p>
                  </div>
                </div>
              )}

              {trangThai === 'xong' && ketQua && (
                soLoi > 0 ? (
                  <div className="kq canh-bao" role="status">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 2.5l8 14H2z" />
                      <path d="M10 8v3.8M10 14.4v.1" />
                    </svg>
                    <div>
                      <b>
                        Đã tính xong tháng {thang ? `${thang.t}/${thang.n}` : ''}, còn {soLoi.toLocaleString('vi-VN')} mã lỗi
                      </b>
                      <p>
                        Mất {dongHo(tgKetThuc)}. Mã thành công đã cập nhật đơn giá vào {(soTc * 18).toLocaleString('vi-VN')} phiếu xuất và bút toán giá vốn. Mã lỗi giữ đơn giá cũ.
                      </p>
                      <div className="dem-kq">
                        <span className="tc">
                          <i />
                          Thành công <strong>{soTc.toLocaleString('vi-VN')}</strong>
                        </span>
                        <span className="ll">
                          <i />
                          Lỗi <strong>{soLoi.toLocaleString('vi-VN')}</strong>
                        </span>
                        <button
                          type="button"
                          className="nut-xem-loi"
                          onClick={() => setMoLoi(true)}
                        >
                          Xem mã lỗi
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="kq xong" role="status">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="10" cy="10" r="8" />
                      <path d="M6.5 10.2l2.4 2.4 4.6-5" />
                    </svg>
                    <div>
                      <b>Đã tính xong tháng {thang ? `${thang.t}/${thang.n}` : ''}</b>
                      <p>
                        Mất {dongHo(tgKetThuc)}. Đơn giá đã cập nhật vào {(soTc * 18).toLocaleString('vi-VN')} phiếu xuất và bút toán giá vốn.
                      </p>
                      <div className="dem-kq">
                        <span className="tc">
                          <i />
                          Thành công <strong>{soTc.toLocaleString('vi-VN')}</strong>
                        </span>
                        <span className="ll">
                          <i />
                          Lỗi <strong>{soLoi.toLocaleString('vi-VN')}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            <footer className="hop-chan">
              {trangThai === 'chon' && (
                <>
                  <button className="nut" type="button" onClick={onDong}>
                    Đóng
                  </button>
                  <button className="nut chinh-nut" type="button" onClick={onChay}>
                    Chạy tính giá
                  </button>
                </>
              )}
              {trangThai === 'chay' && (
                <button className="nut do" type="button" onClick={onHuy}>
                  Huỷ
                </button>
              )}
              {trangThai === 'dung' && (
                <button className="nut do" type="button" disabled>
                  Đang dừng...
                </button>
              )}
              {trangThai === 'xong' && (
                <>
                  <button className="nut" type="button" onClick={onChay}>
                    Chạy lại
                  </button>
                  <button className="nut chinh-nut" type="button" onClick={onDong}>
                    Đóng
                  </button>
                </>
              )}
              {trangThai === 'huy' && (
                <>
                  <button className="nut" type="button" onClick={onDong}>
                    Đóng
                  </button>
                  <button className="nut chinh-nut" type="button" onClick={onChay}>
                    Chạy lại
                  </button>
                </>
              )}
            </footer>
          </section>
        </div>,
        document.body,
      )}

      {moLoi && thang && ketQua && (
        <DsMaLoiGiaVon
          thang={thang}
          ds={ketQua.loi}
          tong={ketQua.tong}
          onDong={() => setMoLoi(false)}
        />
      )}
    </>
  )
}
