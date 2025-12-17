from pypdf import PdfReader
import io

def extract_text_from_pdf(file_stream):
    try:
        reader = PdfReader(file_stream)
        full_text = ""

        for page in reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"

            if not full_text.strip():
                raise ValueError("No text found in the PDF")

            return full_text

    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        raise e