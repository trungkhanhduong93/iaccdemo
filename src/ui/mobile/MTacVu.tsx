import { useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { coTrongGoi } from '../../app/plan'
import { KY_KHOA_SO } from '../../data/mock'
import { Icon } from '../Icon'
import { MChon, type MChonMuc } from './MChon'
import { KIEM } from '../../modules/tong-hop/CuoiKy'

export const MTacVu: FC<ScreenProps> = ({ sc, mod }) => {
  const isKiemTra = sc.code === '10.1.4' || sc.slug === '10-1-4'
  const isKhoaSo = sc.code === '10.1.6' || sc.slug === '10-1-6'

  if (isKiemTra) {
    return <MTacVuKiemTra sc={sc} mod={mod} />
  }
  if (isKhoaSo) {
    return <MTacVuKhoaSo sc={sc} mod={mod} />
  }
  return <MTacVuChung sc={sc} mod={mod} />
}

/** Màn 10.1.4: Kiểm tra cuối kỳ */
function MTacVuKiemTra({ sc }: ScreenProps) {
  const { toast } = useSession()
  const [dangChay, setDangChay] = useState(false)

  const onThucHien = () => {
    setDangChay(true)
    setTimeout(() => {
      setDangChay(false)
      toast('Đã kiểm tra lại 7 mục')
    }, 600)
  }

  const soDat = KIEM.filter(k => k[0] === 'ok').length
  const soCanhBao = KIEM.filter(k => k[0] === 'warn').length
  const soLoi = KIEM.filter(k => k[0] === 'err').length

  return (
    <div className="m-tacvu">
      <div className="m-tacvu-the">
        <div className="m-tacvu-the-tieu">Kết quả kiểm tra</div>
        <div className="m-tacvu-mota">
          Lúc 07/10/2026 09:30 · Kỳ {KY_KHOA_SO.thang}/{KY_KHOA_SO.nam}
        </div>
        <div className="m-tacvu-pills">
          <span className="m-tacvu-pill ok">{soDat} đạt</span>
          <span className="m-tacvu-pill warn">{soCanhBao} cảnh báo</span>
          <span className="m-tacvu-pill err">{soLoi} lỗi</span>
        </div>
      </div>

      <div className="m-tacvu-kt-ds">
        {KIEM.map(([k, b, sub, to]) => (
          <div key={b} className="m-tacvu-kt-dong">
            <div className="m-tacvu-kt-trai">
              <span className={`m-tacvu-kt-cham ${k}`} />
              <div className="m-tacvu-kt-info">
                <span className="m-tacvu-kt-ten">{b}</span>
                <span className="m-tacvu-kt-sub">{sub}</span>
              </div>
            </div>
            <div className="m-tacvu-kt-phai">
              <span className={`m-tacvu-badge ${k}`}>
                {k === 'ok' ? 'Đạt' : k === 'warn' ? 'Cảnh báo' : 'Cần xử lý'}
              </span>
              <Link to={to} className="m-tacvu-kt-link" title={`Xem ${b}`}>
                <span>Xem</span>
                <Icon n="chevr" className="ic sm" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="m-tacvu-day">
        <button
          type="button"
          className="m-tacvu-btn-thuc-hien btn acc"
          disabled={dangChay}
          onClick={onThucHien}
        >
          <Icon n={dangChay ? 'refresh' : 'refresh'} className="ic sm" />
          <span>{dangChay ? 'Đang kiểm tra…' : 'Thực hiện kiểm tra lại'}</span>
        </button>
      </div>
    </div>
  )
}

/** Màn 10.1.6: Khoá sổ kỳ kế toán */
function MTacVuKhoaSo({ sc }: ScreenProps) {
  const { s, toast } = useSession()
  const [khoa, setKhoa] = useState(false)
  const [moChon, setMoChon] = useState(false)
  const [kyChon, setKyChon] = useState(`Tháng ${KY_KHOA_SO.thang}/${KY_KHOA_SO.nam}`)

  const coKiem = coTrongGoi('10.1.4', s.goi)
  const coKc = coTrongGoi('10.1.5', s.goi)

  const buoc: [string, string, string, boolean][] = [
    ['done', 'Đồng bộ đủ dữ liệu bán hàng tháng 9', '30/30 ngày từ FABi', true],
    ['done', 'Đối soát doanh thu với sổ', 'Khớp 100%', true],
    ['now', 'Tính giá vốn cuối kỳ', 'Chưa chạy bản chính thức', true],
    ['', 'Phân bổ CCDC, chi phí trả trước', '6 khoản phân bổ', true],
    ['', 'Kiểm tra cuối kỳ', coKiem ? '1 lỗi, 1 cảnh báo' : 'Có từ gói Plus', coKiem],
    ['', 'Kết chuyển lãi lỗ', coKc ? 'Kết chuyển 632, 642, 511 sang 911' : 'Có từ gói Plus', coKc],
  ]

  const dsKy: MChonMuc[] = [
    { k: 'Tháng 9/2026', ten: 'Tháng 9/2026', moTa: 'Khoá sổ đến 30/09/2026' },
    { k: 'Tháng 10/2026', ten: 'Tháng 10/2026', moTa: 'Khoá sổ đến 31/10/2026' },
    { k: 'Tháng 11/2026', ten: 'Tháng 11/2026', moTa: 'Khoá sổ đến 30/11/2026' },
    { k: 'Tháng 12/2026', ten: 'Tháng 12/2026', moTa: 'Khoá sổ đến 31/12/2026' },
  ]

  const onBatKhoa = () => {
    if (khoa) {
      setKhoa(false)
      toast('Đã mở khoá kỳ 9/2026')
    } else {
      setKhoa(true)
      toast('Đã khoá sổ kỳ 9/2026')
    }
  }

  const lichSu = [
    ...(khoa ? [{ ky: '9/2026', viec: 'Khoá sổ', ai: s.ten, luc: '07/10/2026' }] : []),
    { ky: '8/2026', viec: 'Khoá sổ', ai: 'Trần Thu Hà', luc: '05/09/2026' },
    { ky: '7/2026', viec: 'Mở khoá, lý do: bổ sung hoá đơn điện', ai: 'Trần Thu Hà', luc: '12/08/2026' },
    { ky: '7/2026', viec: 'Khoá sổ', ai: 'Trần Thu Hà', luc: '06/08/2026' },
  ]

  return (
    <div className="m-tacvu">
      <div className="m-tacvu-the">
        <div className="m-tacvu-the-tieu">Kỳ khoá sổ & Trạng thái</div>
        <div className="m-tacvu-cd-ds">
          <div className="m-tacvu-cd-dong" onClick={() => setMoChon(true)}>
            <span className="m-tacvu-cd-nhan">Chọn kỳ khoá</span>
            <div className="m-tacvu-cd-tri">
              <span>{kyChon}</span>
              <Icon n="chevr" className="ic sm" />
            </div>
          </div>
          <div className="m-tacvu-cd-dong">
            <span className="m-tacvu-cd-nhan">Trạng thái</span>
            <span className={`m-tacvu-badge ${khoa ? 'err' : 'ok'}`}>
              {khoa ? 'Đã khoá' : 'Đang mở'}
            </span>
          </div>
        </div>
        <div className={`m-tacvu-ks-note ${khoa ? 'ok' : 'warn'}`}>
          {khoa
            ? 'Kỳ 9/2026 đã khoá lúc 07/10/2026. Chứng từ trong kỳ không sửa được. Sai sót phát hiện sau thì lập bút toán điều chỉnh ở kỳ đang mở.'
            : 'Khoá sổ khi chưa làm đủ các bước thì báo cáo tài chính kỳ 9 có thể sai. Vẫn khoá được, hệ thống ghi lại người khoá và thời điểm.'}
        </div>
      </div>

      <div className="m-tacvu-the">
        <div className="m-tacvu-the-tieu">Các bước khoá sổ {kyChon}</div>
        <div className="m-tacvu-bc-ds">
          {buoc.map(([st, b, sub, ok]) => (
            <div key={b} className={`m-tacvu-bc-dong${!ok ? ' mo' : ''}`}>
              <span className={`m-tacvu-bc-ic ${khoa || st === 'done' ? 'ok' : st === 'now' ? 'now' : ''}`}>
                {(khoa || st === 'done') ? <Icon n="check" className="ic sm" /> : null}
              </span>
              <div className="m-tacvu-bc-info">
                <span className="m-tacvu-bc-ten">{b}</span>
                <span className="m-tacvu-bc-sub">{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="m-tacvu-the">
        <div className="m-tacvu-the-tieu">Lịch sử khoá sổ</div>
        <div className="m-tacvu-nk-ds">
          {lichSu.map((ls, idx) => (
            <div key={idx} className="m-tacvu-nk-dong">
              <div className="m-tacvu-nk-trai">
                <span className="m-tacvu-nk-nd">{ls.viec} kỳ {ls.ky}</span>
                <span className="m-tacvu-nk-luc">{ls.ai} · {ls.luc}</span>
              </div>
              <span className={`m-tacvu-badge ${ls.viec === 'Khoá sổ' ? 'err' : 'ok'}`}>
                {ls.viec}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="m-tacvu-day">
        <button
          type="button"
          className={`m-tacvu-btn-thuc-hien btn ${khoa ? '' : 'acc'}`}
          onClick={onBatKhoa}
        >
          <Icon n="lock" className="ic sm" />
          <span>{khoa ? 'Mở khoá kỳ' : `Khoá sổ ${kyChon}`}</span>
        </button>
      </div>

      <MChon
        mo={moChon}
        onDong={() => setMoChon(false)}
        tieuDe="Chọn kỳ khoá sổ"
        ds={dsKy}
        chon={kyChon}
        onChon={k => setKyChon(k)}
      />
    </div>
  )
}

/** Màn tác vụ chung: kind === 'tool' */
function MTacVuChung({ sc }: ScreenProps) {
  const { toast } = useSession()
  const ten = tenMan(sc)
  const cfg = sc.tool ?? { mota: `${ten} cho kỳ kế toán đang chọn.`, nut: 'Thực hiện' }
  const [chay, setChay] = useState(false)

  const [caiDat, setCaiDat] = useState<[string, string][]>(
    () => cfg.caiDat ?? [['Kỳ áp dụng', 'Tháng 9/2026'], ['Chi nhánh', 'Tất cả chi nhánh']]
  )

  const [nhatKy, setNhatKy] = useState<[string, string, string][]>(
    () =>
      cfg.nhatKy ?? [
        ['30/09/2026 17:42', `${ten}, kỳ 9/2026`, 'Xong'],
        ['31/08/2026 18:05', `${ten}, kỳ 8/2026`, 'Xong'],
      ]
  )

  const [moChonKy, setMoChonKy] = useState(false)
  const [idxKy, setIdxKy] = useState<number | null>(null)

  const dsKyMacDinh: MChonMuc[] = [
    { k: 'Tháng 9/2026', ten: 'Tháng 9/2026' },
    { k: 'Tháng 8/2026', ten: 'Tháng 8/2026' },
    { k: 'Tháng 7/2026', ten: 'Tháng 7/2026' },
    { k: 'Quý 3/2026', ten: 'Quý 3/2026' },
    { k: 'Năm 2026', ten: 'Năm 2026' },
  ]

  const laTruongKy = (nhan: string) =>
    /kỳ|tháng|quý|năm|tuần/i.test(nhan)

  const onMoChon = (i: number) => {
    setIdxKy(i)
    setMoChonKy(true)
  }

  const onChonKy = (val: string) => {
    if (idxKy !== null) {
      setCaiDat(prev => {
        const copy: [string, string][] = [...prev]
        copy[idxKy] = [copy[idxKy][0], val]
        return copy
      })
    }
  }

  const onDoiGiaTri = (i: number, val: string) => {
    setCaiDat(prev => {
      const copy: [string, string][] = [...prev]
      copy[i] = [copy[i][0], val]
      return copy
    })
  }

  const onThucHien = () => {
    setChay(true)
    setTimeout(() => {
      setChay(false)
      toast(`${cfg.nut}: xong`)
      setNhatKy(prev => [
        ['Vừa xong', `${ten}, ${caiDat[0]?.[1] ?? 'kỳ 9/2026'}`, 'Xong'],
        ...prev,
      ])
    }, 1000)
  }

  return (
    <div className="m-tacvu">
      <div className="m-tacvu-the">
        <div className="m-tacvu-the-tieu">Mô tả tác vụ</div>
        <div className="m-tacvu-lenh">
          <b>{cfg.nut}</b>
        </div>
        <p className="m-tacvu-mota">{cfg.mota}</p>
      </div>

      <div className="m-tacvu-the">
        <div className="m-tacvu-the-tieu">Cài đặt tham số</div>
        <div className="m-tacvu-cd-ds">
          {caiDat.map(([l, v], i) => (
            laTruongKy(l) ? (
              <div key={l} className="m-tacvu-cd-dong" onClick={() => onMoChon(i)}>
                <span className="m-tacvu-cd-nhan">{l}</span>
                <div className="m-tacvu-cd-tri">
                  <span>{v}</span>
                  <Icon n="chevr" className="ic sm" />
                </div>
              </div>
            ) : (
              <div key={l} className="m-tacvu-cd-dong">
                <span className="m-tacvu-cd-nhan">{l}</span>
                <input
                  type="text"
                  className="m-tacvu-inp"
                  value={v}
                  onChange={e => onDoiGiaTri(i, e.target.value)}
                />
              </div>
            )
          ))}
          <button
            type="button"
            className="m-tacvu-btn-luu btn sm"
            onClick={() => toast('Đã lưu cài đặt')}
          >
            Lưu cài đặt
          </button>
        </div>
      </div>

      <div className="m-tacvu-the">
        <div className="m-tacvu-the-tieu">Lần chạy gần đây</div>
        <div className="m-tacvu-nk-ds">
          {nhatKy.map(([luc, nd, kq], i) => (
            <div key={i} className="m-tacvu-nk-dong">
              <div className="m-tacvu-nk-trai">
                <span className="m-tacvu-nk-nd">{nd}</span>
                <span className="m-tacvu-nk-luc">{luc}</span>
              </div>
              <span className={`m-tacvu-badge ${kq === 'Xong' ? 'ok' : kq.startsWith('Lỗi') ? 'err' : 'warn'}`}>
                {kq}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="m-tacvu-day">
        <button
          type="button"
          className="m-tacvu-btn-thuc-hien btn acc"
          disabled={chay}
          onClick={onThucHien}
        >
          <Icon n={chay ? 'refresh' : 'play'} className="ic sm" />
          <span>{chay ? 'Đang thực hiện…' : 'Thực hiện'}</span>
        </button>
      </div>

      <MChon
        mo={moChonKy}
        onDong={() => setMoChonKy(false)}
        tieuDe="Chọn kỳ áp dụng"
        ds={dsKyMacDinh}
        chon={idxKy !== null ? caiDat[idxKy]?.[1] : undefined}
        onChon={onChonKy}
      />
    </div>
  )
}
