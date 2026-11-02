import type { FC } from 'react'
import { kieuGhiSo, type Goi } from '../../app/plan'
import { useNhatKy } from '../generic/daXoa'
import { money } from '../format'

export interface MLichSuProps {
  goi: Goi
  man: string
  id: string
  /** Thao tác mẫu riêng của màn (vd thẻ chi phí phân bổ, T590); không truyền thì dùng mẫu phiếu thu chi */
  mau?: DongLichSu[]
}

export type LoaiThaoTac = 'tao' | 'ghi_so' | 'xoa' | 'sua'

export interface TruongDoi {
  ten: string
  cu?: string
  moi?: string
  xoa?: boolean
}

export interface DongLichSu {
  luc: string
  ai: string
  tenViec: string
  loai: LoaiThaoTac
  noiDung?: string
  ghiChu?: string
  lyDo?: string
  tongCu?: number
  tongMoi?: number
  doi?: TruongDoi[]
}

function phanLoai(viec: string): LoaiThaoTac {
  if (/Thêm|Tạo|Lập mới/i.test(viec)) return 'tao'
  if (/Ghi sổ|Lưu chứng từ/i.test(viec)) return 'ghi_so'
  if (/Xoá|Xóa/i.test(viec)) return 'xoa'
  return 'sua'
}

function tachDoi(viec: string): { tenViec: string; doi?: TruongDoi[]; tongCu?: number; tongMoi?: number } {
  // Sửa thẻ chi phí (T590): "Sửa thẻ: Trường: cũ → mới; Trường khác: cũ → mới"
  if (viec.startsWith('Sửa thẻ: ')) {
    const doi = viec.slice('Sửa thẻ: '.length).split('; ').filter(Boolean).map(muc => {
      const i = muc.indexOf(': ')
      if (i < 0) return { ten: muc }
      const [cu, moi] = muc.slice(i + 2).split(' → ')
      return { ten: muc.slice(0, i), cu, moi }
    })
    return { tenViec: 'Sửa thẻ', doi }
  }
  if (!viec.startsWith('Sửa chứng từ: ')) {
    return { tenViec: viec }
  }
  const phanSau = viec.slice('Sửa chứng từ: '.length).trim()
  const danhSach = phanSau ? phanSau.split(', ') : []
  let tongCu: number | undefined
  let tongMoi: number | undefined
  const doi: TruongDoi[] = []

  for (const muc of danhSach) {
    if (muc.includes(' → ')) {
      const [trai, moi] = muc.split(' → ')
      const cachCuoi = trai.lastIndexOf(' ')
      if (cachCuoi > 0) {
        const ten = trai.slice(0, cachCuoi).trim()
        const cu = trai.slice(cachCuoi + 1).trim()
        if (ten === 'Tổng tiền') {
          const soCu = parseInt(cu.replace(/\D/g, ''), 10)
          const soMoi = parseInt(moi.replace(/\D/g, ''), 10)
          if (!isNaN(soCu) && !isNaN(soMoi)) {
            tongCu = soCu
            tongMoi = soMoi
            continue
          }
        }
        doi.push({ ten, cu, moi: moi.trim() })
        continue
      }
      doi.push({ ten: trai.trim(), moi: moi.trim() })
      continue
    }
    doi.push({ ten: muc.trim() })
  }
  return { tenViec: 'Sửa chứng từ', doi: doi.length ? doi : undefined, tongCu, tongMoi }
}

export function useDongLichSu(goi: Goi, man: string, id: string, mau?: DongLichSu[]): DongLichSu[] {
  const phien = useNhatKy(man, id)

  const dsMau: DongLichSu[] = mau ? mau : (id.startsWith('moi-') || phien.some(x => /^(Thêm mới|Lập mới) chứng từ/.test(x.viec)))
    ? []
    : [
        {
          luc: '07/10/2026 10:05',
          ai: 'Lê Quốc Bảo',
          tenViec: kieuGhiSo(goi) === 'khong' ? 'Lưu chứng từ' : 'Ghi sổ',
          loai: 'ghi_so',
          noiDung: kieuGhiSo(goi) === 'khong'
            ? 'Lưu phiếu mua hàng MH2610-0022 của Công ty Điện lực Sài Gòn, hoá đơn 0027159 ký hiệu 1C26TMM. Nhập Kho bếp Nguyễn Trãi 12 dòng hàng, tổng tiền 4.778.550 đ. Phiếu chưa thanh toán, ghi công nợ phải trả nhà cung cấp 4.778.550 đ.'
            : 'Ghi sổ phiếu mua hàng MH2610-0022 của Công ty Điện lực Sài Gòn, hoá đơn 0027159 ký hiệu 1C26TMM. Nhập Kho bếp Nguyễn Trãi 12 dòng hàng, tổng tiền 4.778.550 đ. Phiếu chưa thanh toán, ghi công nợ phải trả nhà cung cấp 4.778.550 đ, vào sổ quỹ và sổ cái.',
        },
        {
          luc: '07/10/2026 09:58',
          ai: 'Lê Quốc Bảo',
          tenViec: 'Sửa chứng từ',
          loai: 'sua',
          noiDung: 'Sửa 3 chỗ trên phiếu MH2610-0022: diễn giải, số lượng 1 dòng hàng và xoá 1 dòng hàng. Tổng tiền tăng 30.000 đ.',
          doi: [
            {
              ten: 'Diễn giải',
              cu: 'Chi mua rau',
              moi: 'Chi mua rau củ bếp Q1',
            },
            {
              ten: 'Dòng 3: Rau cải ngọt, số lượng',
              cu: '10 kg × 20.000 = 200.000 đ',
              moi: '14 kg × 20.000 = 280.000 đ',
            },
            {
              ten: 'Dòng 7: Hành tây',
              cu: '2 kg × 25.000 = 50.000 đ',
              moi: 'Đã xoá dòng',
              xoa: true,
            },
          ],
          tongCu: 4748550,
          tongMoi: 4778550,
          lyDo: 'Nhà cung cấp giao thêm 4 kg rau cải ngọt, hết hành tây nên không giao. Cập nhật theo hoá đơn 0027159.',
        },
        {
          luc: '06/10/2026 23:30',
          ai: 'Đồng bộ tự động',
          tenViec: 'Tạo chứng từ',
          loai: 'tao',
          noiDung: 'Tạo từ dữ liệu đồng bộ FABi, phiếu nhập hàng của cửa hàng Phố Mây Nguyễn Trãi ngày 06/10/2026. Nhà cung cấp Công ty Điện lực Sài Gòn, 13 dòng hàng, tổng tiền 4.748.550 đ.',
        },
      ]

  const dsPhien: DongLichSu[] = phien.map(item => {
    const { tenViec, doi, tongCu, tongMoi } = tachDoi(item.viec)
    return {
      luc: item.luc,
      ai: item.ai,
      tenViec,
      loai: phanLoai(item.viec),
      noiDung: item.viec,
      doi,
      tongCu,
      tongMoi,
    }
  })

  return [...dsPhien, ...dsMau]
}

export function nhomTheoNgay(items: DongLichSu[]): { ngay: string; nhan: string; items: DongLichSu[] }[] {
  const nhomNgay: { ngay: string; nhan: string; items: DongLichSu[] }[] = []
  for (const item of items) {
    const [ngayPart] = item.luc.split(' ')
    let g = nhomNgay.find(x => x.ngay === ngayPart)
    if (!g) {
      g = { ngay: ngayPart, nhan: ngayPart, items: [] }
      nhomNgay.push(g)
    }
    g.items.push(item)
  }
  return nhomNgay
}

export function IconLoai({ loai, className }: { loai: LoaiThaoTac | 'dong_bo'; className?: string }) {
  if (loai === 'tao' || loai === 'dong_bo') {
    return (
      <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
        <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
        <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M3 21v-5h5" />
      </svg>
    )
  }
  if (loai === 'sua') {
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
      </svg>
    )
  }
  if (loai === 'ghi_so') {
    return (
      <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
        <path d="M5 12l5 5L20 7" />
      </svg>
    )
  }
  if (loai === 'xoa') {
    return (
      <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
      </svg>
    )
  }
  return null
}

export const MLichSu: FC<MLichSuProps> = ({ goi, man, id, mau }) => {
  const tatCa = useDongLichSu(goi, man, id, mau)

  if (tatCa.length === 0) {
    return (
      <div className="m-ls-khung">
        <div className="m-ls-the m-ls-trong">
          Chưa có thao tác nào.
        </div>
      </div>
    )
  }

  const soThaoTac = tatCa.length
  const soNguoi = new Set(tatCa.map(x => x.ai)).size
  const suaMoiNhat = tatCa.find(x => x.loai === 'sua')
  const thoiGianSua = suaMoiNhat
    ? suaMoiNhat.luc.replace(/\/(\d{4})\s/, ' ')
    : null

  const nhomNgay = nhomTheoNgay(tatCa)

  return (
    <div className="m-ls-khung">
      {/* Tóm tắt */}
      <div className="m-ls-tom-tat">
        <span className="m-ls-tom-tat-chu">
          {soThaoTac} thao tác, {soNguoi} người{thoiGianSua ? ` · sửa gần nhất ${thoiGianSua}` : ''}
        </span>
      </div>

      {/* Dòng thời gian theo ngày */}
      {nhomNgay.map(g => (
        <div key={g.ngay} className="m-ls-nhom-ngay">
          <h3 className="m-ls-nhan-ngay">{g.ngay}</h3>
          <div className="m-ls-ds-the">
            {g.items.map((item, idx) => {
              const [, gioPart = ''] = item.luc.split(' ')
              const noiDung = item.noiDung ?? item.ghiChu ?? ''
              const chenh = item.tongCu !== undefined && item.tongMoi !== undefined ? item.tongMoi - item.tongCu : 0
              const nhanLyDo = item.loai === 'xoa' ? 'Lý do xoá' : item.loai === 'sua' ? 'Lý do sửa' : 'Lý do huỷ'

              return (
                <article key={`${item.luc}-${item.ai}-${idx}`} className="m-ls-the">
                  <div className="m-ls-dau">
                    <span className={`m-ls-vong-tron ${item.loai}`}>
                      <IconLoai loai={item.loai} />
                    </span>
                    <b className="m-ls-ten-viec">{item.tenViec}</b>
                    <span className="m-ls-gio">{gioPart}</span>
                  </div>

                  <div className="m-ls-thong-tin">
                    <span className="m-ls-nhan">Người làm</span>
                    <span>{item.ai}</span>
                    <span className="m-ls-nhan">Thời điểm</span>
                    <span className="m-ls-thoi-diem">{item.luc}</span>
                  </div>

                  <div className="m-ls-noi-dung-khoi">
                    <span className="m-ls-nhan">Nội dung</span>
                    <span className="m-ls-noi-dung">{noiDung}</span>
                  </div>

                  {/* Mỗi chỗ sửa một khối Trước/Sau */}
                  {item.doi && item.doi.map((d, dIdx) => (
                    <div key={dIdx} className="m-ls-doi-khoi">
                      <span className="m-ls-doi-ten">{d.ten}</span>
                      {d.cu !== undefined && (
                        <div className="m-ls-dai-truoc">
                          <span className="m-ls-dai-nhan">Trước</span>
                          <s className="m-ls-dai-cu">{d.cu}</s>
                        </div>
                      )}
                      <div className="m-ls-dai-sau">
                        <span className="m-ls-dai-nhan">Sau</span>
                        {d.xoa ? (
                          <span><span className="m-ls-nhan-xoa">Đã xoá dòng</span></span>
                        ) : (
                          <b className="m-ls-dai-moi">{d.moi ?? 'Đã cập nhật'}</b>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Đổi tổng tiền */}
                  {item.tongCu !== undefined && item.tongMoi !== undefined && (
                    <div className="m-ls-tong-khoi">
                      <span className="m-ls-tong-nhan">Tổng tiền</span>
                      <span className="m-ls-tong-so">
                        <s className="m-ls-tong-cu">{money(item.tongCu)} đ</s>
                        <b className="m-ls-tong-moi">
                          {money(item.tongMoi)} đ{' '}
                          {chenh !== 0 && (
                            <span className={chenh > 0 ? 'm-ls-chenh-duong' : 'm-ls-chenh-am'}>
                              {chenh > 0 ? `+${money(chenh)} đ` : `−${money(Math.abs(chenh))} đ`}
                            </span>
                          )}
                        </b>
                      </span>
                    </div>
                  )}

                  {/* Khối Lý do */}
                  {item.lyDo && (
                    <div className="m-ls-ly-do">
                      <span className="m-ls-ly-do-nhan">{nhanLyDo}</span>
                      <span className="m-ls-ly-do-chu">{item.lyDo}</span>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
