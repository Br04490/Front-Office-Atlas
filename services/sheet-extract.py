"""Local document text extraction for Automated Sheets. Input is a temporary file path."""
import json
import sys
from pathlib import Path


def extract(file_path, extension):
    if extension in ('.txt', '.csv', '.md'):
        return file_path.read_text(encoding='utf-8-sig', errors='replace'), 'text'
    if extension == '.docx':
        from docx import Document
        doc = Document(file_path)
        parts = [p.text for p in doc.paragraphs if p.text.strip()]
        for table in doc.tables:
            parts.extend(' | '.join(c.text for c in row.cells) for row in table.rows)
        return '\n'.join(parts), 'Word document'
    if extension == '.xlsx':
        from openpyxl import load_workbook
        book = load_workbook(file_path, read_only=True, data_only=True)
        parts = []
        for sheet in book:
            parts.append(f'[{sheet.title}]')
            for row in sheet.iter_rows(max_row=min(sheet.max_row, 10000), values_only=True):
                if any(value is not None for value in row):
                    parts.append(' | '.join('' if value is None else str(value) for value in row))
        return '\n'.join(parts), 'Excel workbook'
    if extension == '.pptx':
        from pptx import Presentation
        slides = Presentation(file_path).slides
        return '\n\n'.join('\n'.join(shape.text for shape in slide.shapes if shape.has_text_frame) for slide in slides), 'PowerPoint deck'
    if extension == '.pdf':
        from pypdf import PdfReader
        reader = PdfReader(str(file_path))
        if len(reader.pages) > 100:
            raise ValueError('PDF exceeds the 100-page local extraction limit')
        text = '\n\n'.join(page.extract_text() or '' for page in reader.pages)
        if text.strip():
            return text, 'PDF text'
        return ocr_pdf(file_path), 'scanned PDF OCR'
    if extension in ('.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tif', '.tiff'):
        return ocr_image(file_path), 'image OCR'
    raise ValueError('Unsupported file type. Use PDF, DOCX, TXT, CSV, or an image.')


def ocr_image(file_path):
    try:
        from rapidocr_onnxruntime import RapidOCR
    except ImportError as exc:
        raise ValueError('Image OCR is not installed on this local preview.') from exc
    engine = RapidOCR()
    result, _ = engine(str(file_path))
    return '\n'.join(item[1] for item in (result or []))


def ocr_pdf(file_path):
    try:
        import pymupdf
    except ImportError as exc:
        raise ValueError('This scanned PDF has no text layer. PDF page OCR is not installed on this local preview.') from exc
    lines = []
    with pymupdf.open(file_path) as doc:
        for page in doc:
            if page.number >= 30:
                raise ValueError('Scanned PDF exceeds the 30-page OCR limit')
            from PIL import Image
            import numpy as np
            from rapidocr_onnxruntime import RapidOCR
            pix = page.get_pixmap(matrix=pymupdf.Matrix(2, 2))
            image = np.asarray(Image.frombytes('RGB', [pix.width, pix.height], pix.samples))
            result, _ = RapidOCR()(image)
            lines.append('\n'.join(item[1] for item in (result or [])))
    return '\n\n'.join(lines)


if __name__ == '__main__':
    try:
        path = Path(sys.argv[1])
        text, method = extract(path, path.suffix.lower())
        if not text.strip():
            raise ValueError('No readable text was found. Try a clearer image or a text-based file.')
        print(json.dumps({'text': text[:500000], 'method': method}))
    except Exception as error:
        print(json.dumps({'error': str(error)}))
        sys.exit(1)
