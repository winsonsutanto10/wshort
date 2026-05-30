import QRCode from 'qrcode'

export async function generateQRPng(url: string, size: number = 300): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: 'png',
    width: size,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  })
}

export async function generateQRSvg(url: string, size: number = 300): Promise<string> {
  return QRCode.toString(url, {
    type: 'svg',
    width: size,
    margin: 2,
  })
}
