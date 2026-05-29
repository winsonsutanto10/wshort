import QRCode from 'qrcode'

export async function generateQRPng(url: string, size: number = 300): Promise<Uint8Array> {
  const buffer = await QRCode.toBuffer(url, {
    type: 'png',
    width: size,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  })
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
}

export async function generateQRSvg(url: string, size: number = 300): Promise<string> {
  return QRCode.toString(url, {
    type: 'svg',
    width: size,
    margin: 2,
  })
}
