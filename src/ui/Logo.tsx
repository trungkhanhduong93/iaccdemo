// Logo IACC Cloud, xuất từ D:\icon present\logo (2).png bằng tools/xuat_logo.py
import logo from '../assets/iacc-logo.webp'

export function Logo({ size = 40 }: { size?: number }) {
  return <img className="logo" src={logo} width={size} height={size} alt="IACC Cloud" />
}
