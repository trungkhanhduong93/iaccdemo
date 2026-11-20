import { useState } from 'react'
import type { ScreenProps, Row, CatalogCfg } from '../../modules/types'
import { useSession } from '../../app/session'
import { ThongBao } from '../ThongBao'
import { taiMauNhapDm, docFileNhapDm, nhapCacDongDat, type KetQuaDocFile } from './mauNhapDm'

export interface HopNhapExcelProps {
  sc: ScreenProps['sc']
  cfg: CatalogCfg
  all: Row[]
  onDong: () => void
}

export function HopNhapExcel({ sc, cfg, all, onDong }: HopNhapExcelProps) {
  const { s, set, toast } = useSession()
  const catKey = sc.code ?? sc.slug ?? ''
  const tenNgan = (sc.ngan ?? 'danh mục').trim()
  const tenNganThuong = tenNgan.charAt(0).toLowerCase() + tenNgan.slice(1)

  const [tenFile, setTenFile] = useState<string>('')
  const [ketQua, setKetQua] = useState<KetQuaDocFile | null>(null)
  const [dangDoc, setDangDoc] = useState(false)

  const soDongDat = ketQua?.soDongDat ?? 0

  const handleTaiMau = async () => {
    await taiMauNhapDm(catKey, tenNgan, s, all.slice(0, 2))
  }

  const handleChonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setTenFile(file.name)
    setDangDoc(true)
    try {
      const kq = await docFileNhapDm(file, catKey, s, all)
      setKetQua(kq)
    } finally {
      setDangDoc(false)
      // Xoá input để chọn lại cùng file vẫn kích hoạt onChange
      e.target.value = ''
    }
  }

  const handleNhap = () => {
    if (!ketQua || ketQua.soDongDat <= 0) return
    nhapCacDongDat(catKey, ketQua.dongDat, s, set, cfg.phien)
    onDong()
    toast(`Đã nhập ${ketQua.soDongDat} ${tenNganThuong}`)
  }

  return (
    <ThongBao
      loai="thongTin"
      tieuDe={`Nhập ${tenNganThuong} từ Excel`}
      nut={{
        ten: `Nhập ${soDongDat} dòng`,
        onClick: handleNhap,
        tat: soDongDat <= 0,
      }}
      nutPhu="Huỷ"
      onDong={onDong}
    >
      <div className="hop-nhap-excel" data-dat={soDongDat}>
        {/* Bước 1 */}
        <div className="nhap-xl-buoc">
          <div className="nhap-xl-buoc-so">Bước 1</div>
          <div className="nhap-xl-buoc-nd">
            <div className="nhap-xl-mota">Tải file mẫu, điền dữ liệu từ dòng 2. Xoá 2 dòng ví dụ trước khi nhập.</div>
            <div>
              <button type="button" className="btn sm nhap-xl-nut-tai" onClick={handleTaiMau}>
                Tải file mẫu
              </button>
            </div>
          </div>
        </div>

        {/* Bước 2 */}
        <div className="nhap-xl-buoc">
          <div className="nhap-xl-buoc-so">Bước 2</div>
          <div className="nhap-xl-buoc-nd">
            <div className="nhap-xl-mota">Chọn file .xlsx đã điền.</div>
            <div className="nhap-xl-chon-hang">
              <label className="btn sm nhap-xl-nut-chon">
                Chọn file
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleChonFile}
                  style={{ display: 'none' }}
                />
              </label>
              {tenFile && <span className="nhap-xl-ten-file">{tenFile}</span>}
            </div>
          </div>
        </div>

        {/* Bước 3 */}
        {(dangDoc || ketQua) && (
          <div className="nhap-xl-buoc">
            <div className="nhap-xl-buoc-so">Bước 3</div>
            <div className="nhap-xl-buoc-nd">
              {dangDoc ? (
                <div className="nhap-xl-mota">Đang đọc file...</div>
              ) : ketQua?.loiChung ? (
                <div className="nhap-xl-loi-chung">{ketQua.loiChung}</div>
              ) : ketQua ? (
                <>
                  <div className="nhap-xl-ket-qua-dong">
                    Đạt {ketQua.soDongDat} dòng, lỗi {ketQua.soDongLoi} dòng
                  </div>
                  {ketQua.loi.length > 0 && (
                    <div className="nhap-xl-bang-cuon">
                      <table className="nhap-xl-bang">
                        <thead>
                          <tr>
                            <th style={{ width: 60 }}>Dòng</th>
                            <th style={{ width: 140 }}>Cột</th>
                            <th>Lý do</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ketQua.loi.map((l, i) => (
                            <tr key={i}>
                              <td className="nhap-xl-o-so">{l.dong}</td>
                              <td className="nhap-xl-o-cot">{l.cot}</td>
                              <td className="nhap-xl-o-ly-do">{l.lyDo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </ThongBao>
  )
}
