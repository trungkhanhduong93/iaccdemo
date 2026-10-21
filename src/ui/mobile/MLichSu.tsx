import type { FC } from 'react'
import { kieuGhiSo, type Goi } from '../../app/plan'
import { useNhatKy } from '../generic/daXoa'

export interface MLichSuProps {
  goi: Goi
  man: string
  id: string
}

type LoaiThaoTac = 'tao' | 'ghi_so' | 'xoa' | 'sua'

interface TruongDoi {
  ten: string
  cu?: string
  moi?: string
}

interface DongLichSu {
  luc: string
  ai: string
  tenViec: string
  loai: LoaiThaoTac
  ghiChu?: string
  doi?: TruongDoi[]
}

function phanLoai(viec: string): LoaiThaoTac {
  if (/Thêm|Tạo|Lập mới/i.test(viec)) return 'tao'
  if (/Ghi sổ|Lưu chứng từ/i.test(viec)) return 'ghi_so'
  if (/Xoá|Xóa/i.test(viec)) return 'xoa'
  return 'sua'
}

function tachDoi(viec: string): { tenViec: string; doi?: TruongDoi[] } {
  if (!viec.startsWith('Sửa chứng từ: ')) {
    return { tenViec: viec }
  }
  const phanSau = viec.slice('Sửa chứng từ: '.length).trim()
  const danhSach = phanSau ? phanSau.split(', ') : []
  const doi: TruongDoi[] = danhSach.map(muc => {
    if (muc.includes(' → ')) {
      const [trai, moi] = muc.split(' → ')
      const cachCuoi = trai.lastIndexOf(' ')
      if (cachCuoi > 0) {
        return {
          ten: trai.slice(0, cachCuoi).trim(),
          cu: trai.slice(cachCuoi + 1).trim(),
          moi: moi.trim(),
        }
      }
      return { ten: trai.trim(), moi: moi.trim() }
    }
    return { ten: muc.trim() }
  })
  return { tenViec: 'Sửa chứng từ', doi }
}

const THU_LABELS = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY']

function dinhDangNgay(ngayStr: string): string {
  const [d, m, y] = ngayStr.split('/').map(Number)
  if (!d || !m || !y) return ngayStr
  const dt = new Date(y, m - 1, d)
  const thu = THU_LABELS[dt.getDay()] ?? ''
  return `${thu}, ${ngayStr}`
}

export const MLichSu: FC<MLichSuProps> = ({ goi, man, id }) => {
  const phien = useNhatKy(man, id)

  const dsMau: DongLichSu[] = id.startsWith('moi-')
    ? []
    : [
        {
          luc: '07/10/2026 10:05',
          ai: 'Lê Quốc Bảo',
          tenViec: kieuGhiSo(goi) === 'khong' ? 'Lưu chứng từ' : 'Ghi sổ',
          loai: 'ghi_so',
          ghiChu: kieuGhiSo(goi) === 'khong' ? 'Vào sổ quỹ.' : 'Vào sổ quỹ và sổ cái.',
        },
        {
          luc: '07/10/2026 09:58',
          ai: 'Lê Quốc Bảo',
          tenViec: 'Sửa chứng từ',
          loai: 'sua',
          doi: [
            {
              ten: 'Diễn giải',
              cu: 'Chi mua rau',
              moi: 'Chi mua rau củ bếp Q1',
            },
          ],
        },
        {
          luc: '06/10/2026 23:30',
          ai: 'Đồng bộ tự động',
          tenViec: 'Tạo chứng từ',
          loai: 'tao',
          ghiChu: 'Lấy từ dữ liệu đồng bộ FABi.',
        },
      ]

  const dsPhien: DongLichSu[] = phien.map(item => {
    const { tenViec, doi } = tachDoi(item.viec)
    return {
      luc: item.luc,
      ai: item.ai,
      tenViec,
      loai: phanLoai(item.viec),
      doi,
    }
  })

  const tatCa: DongLichSu[] = [...dsPhien, ...dsMau]

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

  // Nhóm theo ngày (dd/mm/yyyy)
  const nhomNgay: { ngay: string; nhan: string; items: DongLichSu[] }[] = []
  for (const item of tatCa) {
    const [ngayPart] = item.luc.split(' ')
    let g = nhomNgay.find(x => x.ngay === ngayPart)
    if (!g) {
      g = { ngay: ngayPart, nhan: dinhDangNgay(ngayPart), items: [] }
      nhomNgay.push(g)
    }
    g.items.push(item)
  }

  return (
    <div className="m-ls-khung">
      {/* Thẻ tóm tắt */}
      <div className="m-ls-tom-tat">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--blue, #0560a6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="m-ls-tom-tat-chu">
          {soThaoTac} thao tác, {soNguoi} người
          {thoiGianSua ? `. Sửa gần nhất ${thoiGianSua}` : ''}
        </span>
      </div>

      {/* Dòng thời gian theo ngày */}
      {nhomNgay.map(g => (
        <div key={g.ngay} className="m-ls-nhom-ngay">
          <div className="m-ls-nhan-ngay">{g.nhan}</div>
          <div className="m-ls-ds-hang">
            {g.items.map((item, idx) => {
              const laHangCuoi = idx === g.items.length - 1
              const [, gioPart] = item.luc.split(' ')
              return (
                <div key={`${item.luc}-${item.ai}-${idx}`} className="m-ls-hang">
                  <div className="m-ls-cot-trai">
                    <div className={`m-ls-vong-tron ${item.loai}`}>
                      {item.loai === 'tao' && (
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                          <path d="M16 16h5v5" />
                        </svg>
                      )}
                      {item.loai === 'sua' && (
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      )}
                      {item.loai === 'ghi_so' && (
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {item.loai === 'xoa' && (
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
                        </svg>
                      )}
                    </div>
                    {!laHangCuoi && <div className="m-ls-vach" />}
                  </div>

                  <div className="m-ls-the">
                    <div className="m-ls-hang-dau">
                      <span className="m-ls-ten-viec">{item.tenViec}</span>
                      <span className="m-ls-gio">{gioPart}</span>
                    </div>
                    <div className="m-ls-nguoi">{item.ai}</div>
                    {item.ghiChu && <div className="m-ls-ghi-chu">{item.ghiChu}</div>}
                    {item.doi && item.doi.length > 0 && (
                      <div className="m-ls-ds-doi">
                        {item.doi.map((d, dIdx) => (
                          <div key={dIdx} className="m-ls-hop-doi">
                            <span className="m-ls-ten-truong">{d.ten}</span>
                            {d.cu !== undefined && d.moi !== undefined ? (
                              <div className="m-ls-gia-tri">
                                <span className="m-ls-cu">{d.cu}</span>
                                <span className="m-ls-moi">{d.moi}</span>
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
