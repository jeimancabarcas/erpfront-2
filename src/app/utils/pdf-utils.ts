export function downloadBase64Pdf(base64: string, fileName?: string): void {
  try {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    if (fileName) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(blobUrl, '_blank');
    }

    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  } catch (e) {
    console.error('Error decoding PDF:', e);
    alert('Error al procesar el PDF.');
  }
}
