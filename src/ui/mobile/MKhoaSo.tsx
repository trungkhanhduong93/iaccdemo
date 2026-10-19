import { useEffect, useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { donViHienTai, useSession } from '../../app/session'
import { anNgoaiGoi, coTrongGoi } from '../../app/plan'
import {
  CUA_HANG,
  KY_KHOA_SO,
  KY_MO,
  LICH_SU_KHOA_SO,
  khoaSoCuaHang,
  khoaSoDenCua,
} from '../../data/mock'
import { mocKhoaSo, nhanKy } from '../../modules/tong-hop/KhoaSoFree'
import { Icon } from '../Icon'
import { moneyD } from '../format'
import { MChon, type MChonMuc } from './MChon'
import { soLieuKiemKe } from '../../modules/home/khoFree'
import { tonQuyTheoSo } from '../../modules/home/LichSuQuy'
import { useChoGhiTang } from '../../modules/ccdc/GhiTangHangLoat'
import { tinhToanTongQuan } from '../../modules/home/chiSo'

export const MKhoaSo: FC<ScreenProps> = () => {
  const { s, set, toast } = useSession()
  const dv = donViHienTai(s)
  const laFree = s.goi === 'F'

  // Lắng nghe sự kiện khoá sổ để vẽ lại ngay
  const [, veLai] = useState(0)
  useEffect(() => {
    const on = () => veLai(x => x + 1)
    window.addEventListener('iacc-khoa-so', on)
    return () => window.removeEventListener('iacc-khoa-so', on)
  }, [])

  // ── 1. Logic cho gói Free (đồng bộ với KhoaSoFree.tsx) ──
  const [moKhoaFree, setMoKhoaFree] = useState(false)
  const [lyDoFree, setLyDoFree] = useState('')

  // Khoá theo cửa hàng đang chọn (T19): tất cả thì mỗi cửa hàng khoá tiếp tháng kế của nó
  const { cns, ds, cungMoc, daKhoa, canKhoa, khoaTiep, cnKiem, pham } = mocKhoaSo(s.cuaHang)
  const khoaDuocFree = khoaTiep.length > 0
  const nhanFree = nhanKy(canKhoa)
  const nutMo = cungMoc ? `Mở khoá ${nhanKy(daKhoa)}` : 'Mở khoá tháng gần nhất'
  const nutKhoa = cungMoc ? `Khoá sổ ${nhanFree}` : `Khoá tháng kế (${khoaTiep.length})`
  const kk = soLieuKiemKe(canKhoa.thang, new Set(cnKiem.map(c => c.ten)))
  const tonQuy = tonQuyTheoSo(canKhoa.thang, cnKiem.map(c => c.id)).reduce((a, r) => a + r.cuoi, 0)
  const cho = useChoGhiTang(canKhoa.nam * 100 + canKhoa.thang)
  const pbThang = tinhToanTongQuan(
    canKhoa.thang === KY_MO.thang ? 'thang-nay' : 'thang-truoc',
    cnKiem.map(c => c.id),
    s.cheDo,
    canKhoa.thang
  ).cpPhanBo
  const phieuCho: number = 3

  const buocFree: { xong: boolean; ten: string; phu: string; to: string }[] = [
    {
      xong: kk.chuaKiem.length === 0,
      ten: 'Kiểm kê cuối tháng',
      phu: kk.chuaKiem.length
        ? `Chưa kiểm kê: ${kk.chuaKiem.join(', ')}`
        : cnKiem.length > 1
          ? `Đủ ${cnKiem.length} cửa hàng, lệch ${kk.thieu + kk.thua} mặt hàng`
          : `${cnKiem[0]?.ten} đã kiểm kê, lệch ${kk.thieu + kk.thua} mặt hàng`,
      to: '/app/kho/5-1-10',
    },
    {
      xong: true,
      ten: 'Phân bổ chi phí trong tháng',
      phu: `Đã phân bổ ${moneyD(pbThang)}`,
      to: '/app/ccdc/8-1-1',
    },
    {
      xong: cho.so === 0,
      ten: 'Chi phí chờ phân bổ chưa ghi tăng thẻ',
      phu: cho.so ? `Còn ${cho.so} khoản · ${moneyD(cho.tong)}` : 'Không còn khoản nào',
      to: '/app/ccdc/8-1-1',
    },
    {
      xong: true,
      ten: 'Đối chiếu tồn quỹ cuối tháng',
      phu: `Tồn quỹ ${moneyD(tonQuy)}`,
      to: `/app/trang-chu/lich-su-quy?quy=tat-ca&thang=${canKhoa.thang}`,
    },
    {
      xong: phieuCho === 0,
      ten: 'Phiếu thu, chi FABi chờ xử lý',
      phu: phieuCho ? `Còn ${phieuCho} phiếu chờ gán phương thức thanh toán` : 'Không còn phiếu chờ gán phương thức thanh toán',
      to: '/app/danh-muc/1-12?tich=1',
    },
  ]
  const soXongFree = buocFree.filter(b => b.xong).length

  const khoaFree = () => {
    khoaSoCuaHang(khoaTiep, false, 'Khoá sổ', s.ten)
    toast(`Đã khoá sổ ${cungMoc ? `tháng ${nhanFree}, ${pham}` : `tháng kế tiếp của ${khoaTiep.length} cửa hàng`}. Phiếu trong tháng chỉ xem, không sửa, không xoá được`)
  }

  const xacNhanMoFree = () => {
    if (!lyDoFree.trim()) {
      toast('Nhập lý do mở khoá')
      return
    }
    khoaSoCuaHang(cns.map(c => c.id), true, `Mở khoá, lý do: ${lyDoFree.trim()}`, s.ten)
    toast(cungMoc ? `Đã mở khoá tháng ${nhanKy(daKhoa)}, ${pham}` : `Đã mở khoá tháng gần nhất của ${cns.length} cửa hàng`)
    setMoKhoaFree(false)
    setLyDoFree('')
  }

  // ── 2. Logic cho gói khác (Standard, Plus, Pro theo CuoiKy.tsx) ──
  const [khoaPro, setKhoaPro] = useState(false)
  const [moChonKy, setMoChonKy] = useState(false)
  const [kyChonPro, setKyChonPro] = useState(`Tháng ${KY_KHOA_SO.thang}/${KY_KHOA_SO.nam}`)

  const coKiem = coTrongGoi('10.1.4', s.goi)
  const coKc = coTrongGoi('10.1.5', s.goi)

  const buocPro: [string, string, string, boolean][] = [
    ['done', 'Đồng bộ đủ dữ liệu bán hàng tháng 9', '30/30 ngày từ FABi', true],
    ['done', 'Đối soát doanh thu với sổ', 'Khớp 100%', true],
    ['now', 'Tính giá vốn cuối kỳ', 'Chưa chạy bản chính thức', true],
    ['', 'Phân bổ CCDC, chi phí trả trước', '6 khoản phân bổ', true],
    ['', 'Kiểm tra cuối kỳ', coKiem ? '1 lỗi, 1 cảnh báo' : 'Có từ gói Plus', coKiem],
    ['', 'Kết chuyển lãi lỗ', coKc ? 'Kết chuyển 632, 642, 511 sang 911' : 'Có từ gói Plus', coKc],
  ]

  const dsBuocPro = anNgoaiGoi(s.goi) ? buocPro.filter(b => b[3]) : buocPro

  const dsKyPro: MChonMuc[] = [
    { k: 'Tháng 9/2026', ten: 'Tháng 9/2026', moTa: 'Khoá sổ đến 30/09/2026' },
    { k: 'Tháng 10/2026', ten: 'Tháng 10/2026', moTa: 'Khoá sổ đến 31/10/2026' },
    { k: 'Tháng 11/2026', ten: 'Tháng 11/2026', moTa: 'Khoá sổ đến 30/11/2026' },
    { k: 'Tháng 12/2026', ten: 'Tháng 12/2026', moTa: 'Khoá sổ đến 31/12/2026' },
  ]

  const onBatKhoaPro = () => {
    if (khoaPro) {
      setKhoaPro(false)
      toast('Đã mở khoá kỳ 9/2026')
    } else {
      setKhoaPro(true)
      toast('Đã khoá sổ kỳ 9/2026')
    }
  }

  const lichSuPro = [
    ...(khoaPro ? [{ ky: '9/2026', viec: 'Khoá sổ', ai: s.ten, luc: '07/10/2026' }] : []),
    { ky: '8/2026', viec: 'Khoá sổ', ai: 'Trần Thu Hà', luc: '05/09/2026' },
    { ky: '7/2026', viec: 'Mở khoá, lý do: bổ sung hoá đơn điện', ai: 'Trần Thu Hà', luc: '12/08/2026' },
    { ky: '7/2026', viec: 'Khoá sổ', ai: 'Trần Thu Hà', luc: '06/08/2026' },
  ]

  return (
    <div className="m-tacvu">
      {/* 1. Thẻ thông tin kỳ & trạng thái */}
      <div className="m-tacvu-the">
        <div className="m-tacvu-the-tieu">Kỳ khoá sổ & Trạng thái</div>
        <div className="m-tacvu-cd-ds">
          <div className="m-tacvu-cd-dong">
            <span className="m-tacvu-cd-nhan">Đơn vị</span>
            <div className="m-tacvu-cd-tri">
              <span>{dv.ten}</span>
            </div>
          </div>
          <div className="m-tacvu-cd-dong">
            <span className="m-tacvu-cd-nhan">Cửa hàng</span>
            <div className="m-tacvu-cd-tri">
              <span>{pham}</span>
            </div>
          </div>

          {laFree ? (
            <>
              <div className="m-tacvu-cd-dong">
                <span className="m-tacvu-cd-nhan">Đã khoá đến hết</span>
                <div className="m-tacvu-cd-tri">
                  <span>{cungMoc ? `Tháng ${nhanKy(daKhoa)}` : 'Khác nhau từng cửa hàng'}</span>
                </div>
              </div>
              <div className="m-tacvu-cd-dong">
                <span className="m-tacvu-cd-nhan">Kỳ tiếp theo</span>
                <span className={`m-tacvu-badge ${khoaDuocFree ? 'ok' : 'warn'}`}>
                  {khoaDuocFree ? `Tháng ${nhanFree} (sẵn sàng)` : `Tháng ${nhanFree} (đang mở)`}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="m-tacvu-cd-dong" onClick={() => setMoChonKy(true)}>
                <span className="m-tacvu-cd-nhan">Kỳ khoá sổ</span>
                <div className="m-tacvu-cd-tri">
                  <span>{kyChonPro}</span>
                  <Icon n="chevr" className="ic sm" />
                </div>
              </div>
              <div className="m-tacvu-cd-dong">
                <span className="m-tacvu-cd-nhan">Trạng thái</span>
                <span className={`m-tacvu-badge ${khoaPro ? 'err' : 'ok'}`}>
                  {khoaPro ? 'Đã khoá' : 'Đang mở'}
                </span>
              </div>
            </>
          )}
        </div>

        <div className={`m-tacvu-ks-note ${laFree ? 'ok' : khoaPro ? 'ok' : 'warn'}`}>
          {laFree
            ? `${cungMoc ? `${pham} đã khoá sổ đến hết tháng ${nhanKy(daKhoa)}` : `${pham} khoá sổ đến tháng khác nhau, xem từng cửa hàng dưới`}. Phiếu trong các tháng đã khoá chỉ xem, không sửa, không xoá; ô Tháng ghi nhận chi phí không chọn được các tháng này.`
            : khoaPro
              ? 'Kỳ 9/2026 đã khoá lúc 07/10/2026. Chứng từ trong kỳ không sửa được. Sai sót phát hiện sau thì lập bút toán điều chỉnh ở kỳ đang mở.'
              : 'Khoá sổ khi chưa làm đủ các bước thì báo cáo tài chính kỳ 9 có thể sai. Vẫn khoá được, hệ thống ghi lại người khoá và thời điểm.'}
        </div>
      </div>

      {/* Mốc khoá từng cửa hàng (T19): bấm để chọn cửa hàng đó, khoá, mở khoá riêng */}
      {laFree && CUA_HANG.length > 1 && (
        <div className="m-tacvu-the">
          <div className="m-tacvu-the-tieu">Khoá sổ từng cửa hàng</div>
          <div className="m-tacvu-cd-ds">
            <div className="m-tacvu-cd-dong" onClick={() => set({ cuaHang: 'all' })}>
              <span className="m-tacvu-cd-nhan">{cns.length > 1 ? <b>Tất cả cửa hàng</b> : 'Tất cả cửa hàng'}</span>
              <div className="m-tacvu-cd-tri"><span>Khoá cùng lúc</span><Icon n="chevr" className="ic sm" /></div>
            </div>
            {CUA_HANG.map(c => {
              const den = khoaSoDenCua(c.id)
              const chon = ds.length === 1 && ds[0].c.id === c.id
              return (
                <div key={c.id} className="m-tacvu-cd-dong" onClick={() => set({ cuaHang: c.id })}>
                  <span className="m-tacvu-cd-nhan">{chon ? <b>{c.ngan}</b> : c.ngan}</span>
                  <div className="m-tacvu-cd-tri"><span>Khoá đến {nhanKy(den)}</span><Icon n="chevr" className="ic sm" /></div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 2. Khung nhập lý do mở khoá (gói Free) */}
      {laFree && moKhoaFree && (
        <div className="m-tacvu-the" style={{ borderColor: 'var(--blue, #0560a6)' }}>
          <div className="m-tacvu-the-tieu">{nutMo}, {pham}</div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
            Mở khoá sẽ cho phép sửa, xoá chứng từ {cungMoc ? `tháng ${nhanKy(daKhoa)}` : 'tháng khoá gần nhất của từng cửa hàng'}. Bắt buộc nhập lý do mở khoá.
          </p>
          <textarea
            className="inp ks-ly-do"
            rows={3}
            autoFocus
            placeholder="Lý do mở khoá, ví dụ: bổ sung hoá đơn tiền điện tháng 8"
            value={lyDoFree}
            onChange={e => setLyDoFree(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', borderRadius: 8, padding: 8, border: '1px solid var(--border)', fontSize: 13 }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="button"
              className="btn sm"
              onClick={() => {
                setMoKhoaFree(false)
                setLyDoFree('')
              }}
            >
              Huỷ
            </button>
            <button
              type="button"
              className="btn pri sm"
              onClick={xacNhanMoFree}
            >
              Xác nhận mở khoá
            </button>
          </div>
        </div>
      )}

      {/* 3. Thẻ các bước kiểm tra */}
      <div className="m-tacvu-the">
        <div className="m-tacvu-the-tieu">
          {laFree
            ? khoaDuocFree
              ? `Kiểm tra trước khi khoá sổ tháng ${nhanFree} (${soXongFree}/${buocFree.length})`
              : `Tháng ${nhanFree} đang mở`
            : `Các bước khoá sổ ${kyChonPro}`}
        </div>

        {laFree ? (
          khoaDuocFree ? (
            <div className="m-tacvu-bc-ds">
              {buocFree.map(b => (
                <div key={b.ten} className={`m-tacvu-bc-dong${!b.xong ? ' mo' : ''}`}>
                  <span className={`m-tacvu-bc-ic ${b.xong ? 'ok' : 'now'}`}>
                    {b.xong ? <Icon n="check" className="ic sm" /> : null}
                  </span>
                  <div className="m-tacvu-bc-info">
                    <span className="m-tacvu-bc-ten">{b.ten}</span>
                    <span className="m-tacvu-bc-sub">{b.phu}</span>
                  </div>
                  {b.to && (
                    <Link
                      to={b.to}
                      className="btn sm ghost"
                      style={{ flexShrink: 0, padding: '2px 8px', fontSize: 12 }}
                    >
                      Xem
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
              Tháng {nhanFree} chưa hết nên chưa khoá được. Hết tháng, làm đủ các bước rồi khoá để chốt số liệu.
            </p>
          )
        ) : (
          <div className="m-tacvu-bc-ds">
            {dsBuocPro.map(([st, b, sub, ok]) => (
              <div key={b} className={`m-tacvu-bc-dong${!ok ? ' mo' : ''}`}>
                <span className={`m-tacvu-bc-ic ${khoaPro || st === 'done' ? 'ok' : st === 'now' ? 'now' : ''}`}>
                  {(khoaPro || st === 'done') ? <Icon n="check" className="ic sm" /> : null}
                </span>
                <div className="m-tacvu-bc-info">
                  <span className="m-tacvu-bc-ten">{b}</span>
                  <span className="m-tacvu-bc-sub">{sub}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {laFree && khoaDuocFree && soXongFree < buocFree.length && (
          <div className="m-tacvu-ks-note warn" style={{ marginTop: 6 }}>
            Còn bước chưa xong, khoá lúc này thì số liệu tháng {nhanFree} có thể chưa đủ. Vẫn khoá được, hệ thống ghi lại người khoá và thời điểm.
          </div>
        )}
      </div>

      {/* 4. Thẻ lịch sử khoá sổ */}
      <div className="m-tacvu-the">
        <div className="m-tacvu-the-tieu">Lịch sử khoá sổ</div>
        <div className="m-tacvu-nk-ds">
          {(laFree ? LICH_SU_KHOA_SO : lichSuPro).map((ls, idx) => (
            <div key={idx} className="m-tacvu-nk-dong">
              <div className="m-tacvu-nk-trai">
                <span className="m-tacvu-nk-nd">{ls.viec} kỳ {ls.ky}</span>
                <span className="m-tacvu-nk-luc">{'ch' in ls && ls.ch ? `${ls.ch} · ` : ''}{ls.ai} · {ls.luc}</span>
              </div>
              <span className={`m-tacvu-badge ${ls.viec === 'Khoá sổ' ? 'err' : 'ok'}`}>
                {ls.viec.startsWith('Khoá') ? 'Khoá sổ' : 'Mở khoá'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Nút thao tác dưới chân */}
      <div className="m-tacvu-day" style={{ gap: 10 }}>
        {laFree ? (
          <>
            <button
              type="button"
              className="btn"
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
              onClick={() => setMoKhoaFree(v => !v)}
            >
              <Icon n="lock" className="ic sm" />
              <span>{nutMo}</span>
            </button>
            {khoaDuocFree && (
              <button
                type="button"
                className="btn acc"
                style={{
                  flex: 1,
                  minHeight: 44,
                  borderRadius: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
                onClick={khoaFree}
              >
                <Icon n="lock" className="ic sm" />
                <span>{nutKhoa}</span>
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            className={`m-tacvu-btn-thuc-hien btn ${khoaPro ? '' : 'acc'}`}
            onClick={onBatKhoaPro}
          >
            <Icon n="lock" className="ic sm" />
            <span>{khoaPro ? 'Mở khoá kỳ' : `Khoá sổ ${kyChonPro}`}</span>
          </button>
        )}
      </div>

      {/* Popup chọn kỳ (gói khác) */}
      {!laFree && (
        <MChon
          mo={moChonKy}
          onDong={() => setMoChonKy(false)}
          tieuDe="Chọn kỳ khoá sổ"
          ds={dsKyPro}
          chon={kyChonPro}
          onChon={k => setKyChonPro(k)}
        />
      )}
    </div>
  )
}
