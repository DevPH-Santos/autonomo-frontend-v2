import * as XLSX from 'xlsx'

export interface ExportOptions {
  nomeArquivo: string
  nomePlanilha?: string
  orientation?: 'portrait' | 'landscape'
}

class ExportacaoService {
  private obterNomeArquivo(
    nomeBase: string,
    extensao: string
  ): string {
    const data = new Date()
      .toISOString()
      .split('T')[0]

    return `${nomeBase}-${data}.${extensao}`
  }

  private configurarLargurasColunasXLSX(
    colunas: number
  ): Array<{ wch: number }> {
    const larguras = [
      { wch: 12 },
      { wch: 8 },
      { wch: 20 },
      { wch: 15 },
      { wch: 35 },
      { wch: 10 },
      { wch: 15 },
      { wch: 18 },
    ]
    return larguras.slice(0, colunas)
  }

  exportarXLSX(
    dados: Array<Record<string, any>>,
    options: ExportOptions
  ): void {
    if (dados.length === 0) {
      throw new Error('Não há dados para exportar.')
    }

    const worksheet = XLSX.utils.json_to_sheet(dados)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      options.nomePlanilha || 'Dados'
    )

    const numColunas = Object.keys(dados[0]).length
    worksheet['!cols'] =
      this.configurarLargurasColunasXLSX(numColunas)

    XLSX.writeFile(
      workbook,
      this.obterNomeArquivo(
        options.nomeArquivo,
        'xlsx'
      )
    )
  }

  exportarXLS(
    dados: Array<Record<string, any>>,
    options: ExportOptions
  ): void {
    if (dados.length === 0) {
      throw new Error('Não há dados para exportar.')
    }

    const worksheet = XLSX.utils.json_to_sheet(dados)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      options.nomePlanilha || 'Dados'
    )

    const numColunas = Object.keys(dados[0]).length
    worksheet['!cols'] =
      this.configurarLargurasColunasXLSX(numColunas)

    XLSX.writeFile(workbook, this.obterNomeArquivo(options.nomeArquivo, 'xls'), {
      bookType: 'biff8',
    })
  }

  exportarCSV(
    dados: Array<Record<string, any>>,
    options: ExportOptions
  ): void {
    if (dados.length === 0) {
      throw new Error('Não há dados para exportar.')
    }

    const worksheet = XLSX.utils.json_to_sheet(dados)
    const csv = XLSX.utils.sheet_to_csv(worksheet)

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = this.obterNomeArquivo(
      options.nomeArquivo,
      'csv'
    )

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  async exportarPDF(
    dados: Array<Record<string, any>>,
    options: ExportOptions
  ): Promise<void> {
    if (dados.length === 0) {
      throw new Error('Não há dados para exportar.')
    }

    const { jsPDF } = await import('jspdf')
    const { autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({
      orientation: options.orientation || 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    doc.setFontSize(16)
    doc.text(`Relatório de ${options.nomePlanilha || 'Dados'}`, 14, 15)

    doc.setFontSize(9)
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')} `, 14, 21)

    autoTable(doc, {
      head: [Object.keys(dados[0])],
      body: dados.map((item) => Object.values(item)),
      startY: 27,
      margin: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    })

    doc.save(this.obterNomeArquivo(options.nomeArquivo, 'pdf'))
  }

  async exportarPNG(
    table: HTMLTableElement,
    options: ExportOptions
  ): Promise<void> {
    if (!table) {
      throw new Error('Tabela não encontrada para exportação.')
    }

    const tableClone = table.cloneNode(true) as HTMLElement
    tableClone.querySelectorAll('[class]').forEach((el) => {
      el.removeAttribute('class')
    })

    tableClone.style.borderCollapse = 'collapse'
    tableClone.style.width = '100%'
    tableClone.style.fontFamily = 'Arial, sans-serif'
    tableClone.style.fontSize = '12px'

    tableClone.querySelectorAll('th').forEach((th) => {
      const thElement = th as HTMLElement
      thElement.style.backgroundColor = '#3b82f6'
      thElement.style.color = '#ffffff'
      thElement.style.padding = '12px'
      thElement.style.textAlign = 'left'
      thElement.style.border = '1px solid #e2e8f0'
      thElement.style.fontWeight = 'bold'
    })

    tableClone.querySelectorAll('td').forEach((td) => {
      const tdElement = td as HTMLElement
      tdElement.style.padding = '12px'
      tdElement.style.border = '1px solid #e2e8f0'
    })

    tableClone.querySelectorAll('tr:nth-child(even)').forEach((tr) => {
      const trElement = tr as HTMLElement
      trElement.style.backgroundColor = '#f8fafc'
    })

    const tempContainer = document.createElement('div')
    tempContainer.style.position = 'absolute'
    tempContainer.style.left = '-9999px'
    tempContainer.style.top = '-9999px'
    tempContainer.style.backgroundColor = '#ffffff'
    tempContainer.style.padding = '20px'
    tempContainer.appendChild(tableClone)
    document.body.appendChild(tempContainer)

    const html2canvas = (await import('html2canvas')).default

    const canvas = await html2canvas(tempContainer, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      allowTaint: true,
    })

    document.body.removeChild(tempContainer)

    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = this.obterNomeArquivo(
      options.nomeArquivo,
      'png'
    )
    link.click()
  }
}

export const exportacao = new ExportacaoService()
