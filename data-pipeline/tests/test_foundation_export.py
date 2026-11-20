import csv
import importlib.util
import tempfile
import unittest
import zipfile
from pathlib import Path
from xml.etree import ElementTree


class FoundationExportTest(unittest.TestCase):
    def test_csv_and_xlsx_have_the_same_values(self):
        script = Path(__file__).resolve().parents[1] / 'scripts/export-foundation.py'
        spec = importlib.util.spec_from_file_location('foundation_export', script)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with tempfile.TemporaryDirectory() as folder:
            out = Path(folder)
            self.assertEqual(module.export('sample', ['ID', 'Value'], [('p1', 2.5), ('p2', None)], out), 2)
            with (out / 'sample.csv').open(encoding='utf-8-sig', newline='') as handle:
                self.assertEqual(list(csv.reader(handle)), [['ID', 'Value'], ['p1', '2.5'], ['p2', '']])
            with zipfile.ZipFile(out / 'sample.xlsx') as book:
                root = ElementTree.fromstring(book.read('xl/worksheets/sheet1.xml'))
                rows = root.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row')
                self.assertEqual(len(rows), 3)
                self.assertIn(b'p1', book.read('xl/worksheets/sheet1.xml'))


if __name__ == '__main__':
    unittest.main()
