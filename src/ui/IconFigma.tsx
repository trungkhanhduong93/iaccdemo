// viet-nhu-nguoi: bo-qua
// Biểu tượng SVG từ thiết kế Figma T496
import type { SVGProps } from 'react'

export function IconFigmaFunnel(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6.66667 13.3333C6.66661 13.4572 6.70107 13.5787 6.76619 13.6841C6.83131 13.7895 6.92451 13.8746 7.03533 13.93L8.36867 14.5967C8.47033 14.6475 8.58329 14.6714 8.69683 14.6663C8.81036 14.6612 8.9207 14.6271 9.01735 14.5673C9.11401 14.5075 9.19378 14.424 9.24908 14.3247C9.30438 14.2254 9.33339 14.1137 9.33333 14V9.33333C9.33348 9.00292 9.45631 8.68433 9.678 8.43933L14.4933 3.11333C14.5796 3.01771 14.6364 2.89912 14.6567 2.77192C14.6771 2.64472 14.6601 2.51435 14.6079 2.39658C14.5557 2.27881 14.4706 2.17868 14.3627 2.1083C14.2548 2.03792 14.1288 2.0003 14 2H2C1.87107 2.00005 1.74492 2.03748 1.63683 2.10776C1.52874 2.17804 1.44335 2.27815 1.391 2.39598C1.33865 2.5138 1.32159 2.64427 1.34188 2.77159C1.36218 2.89892 1.41895 3.01762 1.50533 3.11333L6.322 8.43933C6.54369 8.68433 6.66652 9.00292 6.66667 9.33333V13.3333Z" />
    </svg>
  )
}

export function IconFigmaSearch({ size = 16, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  if (size === 14) {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M11.0833 6.41667C11.0833 8.994 8.994 11.0833 6.41667 11.0833C3.83934 11.0833 1.75 8.994 1.75 6.41667C1.75 3.83934 3.83934 1.75 6.41667 1.75C8.994 1.75 11.0833 3.83934 11.0833 6.41667Z" />
        <path d="M12.25 12.25L9.74167 9.74167" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z" />
      <path d="M14 14L11.1333 11.1333" />
    </svg>
  )
}

export function IconFigmaCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2.91667 2.33333H11.0833C11.7277 2.33333 12.25 2.85567 12.25 3.5V11.6667C12.25 12.311 11.7277 12.8333 11.0833 12.8333H2.91667C2.27233 12.8333 1.75 12.311 1.75 11.6667V3.5C1.75 2.85567 2.27233 2.33333 2.91667 2.33333Z" />
      <path d="M9.33333 1.16667V3.5M4.66667 1.16667V3.5M1.75 5.83333H12.25" />
    </svg>
  )
}

export function IconFigmaXChip(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 3L6 6M6 6L3 9M6 6L3 3M6 6L9 9" />
    </svg>
  )
}

export function IconFigmaSheet(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 1.33333H4C3.64638 1.33333 3.30724 1.47381 3.05719 1.72386C2.80714 1.97391 2.66667 2.31304 2.66667 2.66667V13.3333C2.66667 13.687 2.80714 14.0261 3.05719 14.2761C3.30724 14.5262 3.64638 14.6667 4 14.6667H12C12.3536 14.6667 12.6928 14.5262 12.9428 14.2761C13.1929 14.0261 13.3333 13.687 13.3333 13.3333V4.66667L10 1.33333Z" />
      <path d="M9.33333 1.33333V4C9.33333 4.35362 9.47381 4.69276 9.72386 4.94281C9.97391 5.19286 10.313 5.33333 10.6667 5.33333H13.3333" />
      <path d="M5.33333 8.66667H6.66667M9.33333 8.66667H10.6667M5.33333 11.3333H6.66667M9.33333 11.3333H10.6667" />
    </svg>
  )
}

export function IconFigmaSliders(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13.3333 4.66667H7.33333M9.33333 11.3333H3.33333" />
      <path d="M13.3333 11.3333C13.3333 12.4379 12.4379 13.3333 11.3333 13.3333C10.2288 13.3333 9.33333 12.4379 9.33333 11.3333C9.33333 10.2288 10.2288 9.33333 11.3333 9.33333C12.4379 9.33333 13.3333 10.2288 13.3333 11.3333Z" />
      <path d="M6.66667 4.66667C6.66667 5.77124 5.77124 6.66667 4.66667 6.66667C3.5621 6.66667 2.66667 5.77124 2.66667 4.66667C2.66667 3.5621 3.5621 2.66667 4.66667 2.66667C5.77124 2.66667 6.66667 3.5621 6.66667 4.66667Z" />
    </svg>
  )
}

export function IconFigmaLayers(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8.55333 1.45333C8.37962 1.3741 8.19093 1.3331 8 1.3331C7.80907 1.3331 7.62037 1.3741 7.44667 1.45333L1.73333 4.05333C1.61503 4.1055 1.51445 4.19093 1.44384 4.29924C1.37323 4.40754 1.33564 4.53404 1.33564 4.66333C1.33564 4.79262 1.37323 4.91912 1.44384 5.02743C1.51445 5.13573 1.61503 5.22117 1.73333 5.27333L7.45333 7.88C7.62704 7.95923 7.81574 8.00024 8.00667 8.00024C8.19759 8.00024 8.38629 7.95923 8.56 7.88L14.28 5.28C14.3983 5.22784 14.4989 5.1424 14.5695 5.0341C14.6401 4.92579 14.6777 4.79929 14.6777 4.67C14.6777 4.54071 14.6401 4.41421 14.5695 4.3059C14.4989 4.1976 14.3983 4.11216 14.28 4.06L8.55333 1.45333Z" />
      <path d="M14.6667 11.7667L8.55333 14.54C8.37962 14.6192 8.19093 14.6602 8 14.6602C7.80907 14.6602 7.62038 14.6192 7.44667 14.54L1.33333 11.7667" />
      <path d="M14.6667 8.43333L8.55333 11.2067C8.37962 11.2859 8.19093 11.3269 8 11.3269C7.80907 11.3269 7.62038 11.2859 7.44667 11.2067L1.33333 8.43333" />
    </svg>
  )
}

export function IconFigmaPlus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3.33333 8H8M8 8H12.6667M8 8V3.33333M8 8V12.6667" />
    </svg>
  )
}

export function IconFigmaMinus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3.33333 8H12.6667" />
    </svg>
  )
}

export function IconFigmaChevD(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3.5 5.25L7 8.75L10.5 5.25" />
    </svg>
  )
}

export function IconFigmaAlert(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.4867 12L9.15333 2.66667C9.03704 2.46147 8.8684 2.29079 8.66462 2.17205C8.46083 2.0533 8.22919 1.99074 7.99333 1.99074C7.75747 1.99074 7.52584 2.0533 7.32205 2.17205C7.11826 2.29079 6.94962 2.46147 6.83333 2.66667L1.5 12C1.38245 12.2036 1.32082 12.4346 1.32134 12.6697C1.32186 12.9047 1.38452 13.1355 1.50296 13.3385C1.62141 13.5416 1.79143 13.7097 1.9958 13.8259C2.20016 13.942 2.4316 14.0021 2.66667 14H13.3333C13.5673 13.9998 13.797 13.938 13.9995 13.8209C14.202 13.7037 14.3701 13.5354 14.487 13.3327C14.6039 13.1301 14.6654 12.9003 14.6653 12.6663C14.6652 12.4324 14.6036 12.2026 14.4867 12Z" />
      <path d="M8 6V8.66667M8 11.3333H8.00667" />
    </svg>
  )
}

export function IconFigmaPrinter(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12H2.66667C2.31304 12 1.97391 11.8595 1.72386 11.6095C1.47381 11.3594 1.33333 11.0203 1.33333 10.6667V7.33333C1.33333 6.97971 1.47381 6.64057 1.72386 6.39052C1.97391 6.14048 2.31304 6 2.66667 6H13.3333C13.687 6 14.0261 6.14048 14.2761 6.39052C14.5262 6.64057 14.6667 6.97971 14.6667 7.33333V10.6667C14.6667 11.0203 14.5262 11.3594 14.2761 11.6095C14.0261 11.8595 13.687 12 13.3333 12H12" />
      <path d="M4 6V2C4 1.82319 4.07024 1.65362 4.19526 1.5286C4.32029 1.40357 4.48986 1.33333 4.66667 1.33333H11.3333C11.5101 1.33333 11.6797 1.40357 11.8047 1.5286C11.9298 1.65362 12 1.82319 12 2V6" />
      <path d="M4.66667 9.33333H11.3333C11.7015 9.33333 12 9.63181 12 10V14C12 14.3682 11.7015 14.6667 11.3333 14.6667H4.66667C4.29848 14.6667 4 14.3682 4 14V10C4 9.63181 4.29848 9.33333 4.66667 9.33333Z" />
    </svg>
  )
}

export function IconFigmaDownload(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" />
      <path d="M4.66667 6.66667L8 10L11.3333 6.66667" />
      <path d="M8 10V2" />
    </svg>
  )
}

export function IconFigmaTrash(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 4H3.33333M3.33333 4H5.33333M3.33333 4V13.3333C3.33333 13.687 3.47381 14.0261 3.72386 14.2761C3.97391 14.5262 4.31304 14.6667 4.66667 14.6667H11.3333C11.687 14.6667 12.0261 14.5262 12.2761 14.2761C12.5262 14.0261 12.6667 13.687 12.6667 13.3333V4M5.33333 4H10.6667M5.33333 4V2.66667C5.33333 2.31304 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31304 1.33333 6.66667 1.33333H9.33333C9.68696 1.33333 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31304 10.6667 2.66667V4M10.6667 4H12.6667M12.6667 4H14" />
    </svg>
  )
}

export function IconFigmaCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 3L4.5 8.5L2 6" />
    </svg>
  )
}

export function IconFigmaX(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 4L8 8M8 8L4 12M8 8L4 4M8 8L12 12" />
    </svg>
  )
}
