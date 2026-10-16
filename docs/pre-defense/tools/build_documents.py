"""Reproduce the eleven MedPredict Word submissions from their Markdown sources.

Run with the Python runtime returned by load_workspace_dependencies. The matching
bundled Node runtime supplies marked and sharp; no project dependencies are used.
--check and --self-test do not create or edit Word documents.
"""

from __future__ import annotations

import argparse
import html
import io
import json
import math
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from urllib.parse import unquote, urlsplit
import zipfile

from docx import Document
from docx.enum.section import WD_ORIENT, WD_SECTION_START
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.opc.constants import RELATIONSHIP_TYPE
from docx.shared import Cm, Pt, RGBColor
from PIL import Image


ROOT = Path(__file__).resolve().parents[3]
OUTPUT = ROOT / "docs/pre-defense"
RUNTIME = Path(sys.executable).resolve().parents[2]
NODE = RUNTIME / "node/bin/node"
NODE_PACKAGES = RUNTIME / "node/node_modules"
MARKED = NODE_PACKAGES / "marked/lib/marked.esm.js"
SHARP = NODE_PACKAGES / "sharp/dist/index.cjs"
IDENTIFIER = "medpredict-predefense-builder-v1"
SOURCES = {
    "MedPredict_Project_Proposal": "proposal",
    "MedPredict_User_Research": "research",
    "MedPredict_Literature_Review": "literature-review",
    "MedPredict_Existing_Systems_Comparison": "comparisons",
    "MedPredict_Technology_Comparison": "comparisons",
    "MedPredict_Requirements_Specification": "requirements",
    "MedPredict_Architecture": "architecture",
    "MedPredict_UX_Prototype": "ux",
    "MedPredict_Testing_Evaluation_Plan": "testing",
    "MedPredict_Project_Management": "project-management",
    "MedPredict_Supervisor_Feedback_Template": "supervisor-feedback",
}


def source_paths():
    return [ROOT / "docs" / folder / f"{stem}.md" for stem, folder in SOURCES.items()]


def parse_markdown(text):
    program = (
        "import fs from 'node:fs';"
        f"import {{lexer}} from {json.dumps(MARKED.as_uri())};"
        "process.stdout.write(JSON.stringify(lexer(fs.readFileSync(0,'utf8'))));"
    )
    result = subprocess.run(
        [str(NODE), "--input-type=module", "-e", program],
        input=text, text=True, capture_output=True, check=True,
    )
    return json.loads(result.stdout)


def plain(tokens):
    return "".join(
        plain(token["tokens"]) if "tokens" in token
        else html.unescape(token.get("text", ""))
        for token in tokens
    )


def walk(tokens):
    for token in tokens:
        yield token
        yield from walk(token.get("tokens", []))
        for item in token.get("items", []):
            yield from walk(item.get("tokens", []))
        if token["type"] == "table":
            for cell in token["header"] + [cell for row in token["rows"] for cell in row]:
                yield from walk(cell["tokens"])


def image_path(source, href):
    if urlsplit(href).scheme:
        raise ValueError(f"Remote images are not downloaded: {href}")
    path = (source.parent / unquote(href)).resolve()
    if not path.is_relative_to(ROOT) or not path.is_file():
        raise ValueError(f"Missing or non-repository image: {path}")
    if path.suffix.lower() == ".svg" and path.with_suffix(".png").is_file():
        return path.with_suffix(".png")
    return path


def image_bytes(path):
    if path.suffix.lower() != ".svg":
        return path.read_bytes()
    program = (
        f"const sharp=require({json.dumps(str(SHARP))});"
        "sharp(process.argv[1],{density:180}).png().toBuffer()"
        ".then(b=>process.stdout.write(b)).catch(e=>{console.error(e);process.exit(1)});"
    )
    return subprocess.run(
        [str(NODE), "-e", program, str(path)], capture_output=True, check=True,
    ).stdout


def set_font(run, size=None, bold=None):
    run.font.name = "Times New Roman"
    fonts = run._element.get_or_add_rPr().get_or_add_rFonts()
    for script in ("ascii", "hAnsi", "eastAsia", "cs"):
        fonts.set(qn(f"w:{script}"), "Times New Roman")
    run.font.color.rgb = RGBColor(0, 0, 0)
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold


def element(tag, **attributes):
    node = OxmlElement(f"w:{tag}")
    for key, value in attributes.items():
        node.set(qn(f"w:{key}"), str(value))
    return node


def widths(header, rows, available):
    weights = []
    for index, cell in enumerate(header):
        values = [plain(cell["tokens"])] + [plain(row[index]["tokens"]) for row in rows]
        average = sum(len(value) for value in values) / len(values)
        weights.append(math.sqrt(max(18, average)))
    minimum = 1.8
    remainder = available - minimum * len(header)
    return [minimum + remainder * weight / sum(weights) for weight in weights]


class Builder:
    def __init__(self, source, tokens):
        self.source = source
        self.tokens = tokens
        self.doc = Document()
        self.landscape = False
        self.bookmarks = {}
        self.bookmark_count = 0
        self.images = {}
        self.doc.core_properties.title = plain(tokens[0].get("tokens", []))
        self.doc.core_properties.author = "MedPredict"
        self.doc.core_properties.subject = "Первая предварительная защита 24.10.2026"
        self.doc.core_properties.identifier = IDENTIFIER
        self.doc.core_properties.comments = f"Source: docs/{source.parent.name}/{source.name}"
        for name, size in (("Normal", 12), ("Title", 18), ("Heading 1", 14),
                           ("Heading 2", 12.5), ("Heading 3", 12), ("Caption", 10.5)):
            style = self.doc.styles[name]
            style.font.name = "Times New Roman"
            style.font.size = Pt(size)
            style.font.color.rgb = RGBColor(0, 0, 0)
            style.paragraph_format.space_after = Pt(6)
            style.paragraph_format.line_spacing = 1.12
            if name not in ("Normal", "Caption"):
                style.paragraph_format.keep_with_next = True
            if name.startswith("Heading"):
                style.font.bold = True
                style.paragraph_format.space_before = Pt(10)
        for border in self.doc.styles.element.xpath('.//w:pBdr'):
            border.getparent().remove(border)
        if source.stem in ('MedPredict_Project_Management', 'MedPredict_Existing_Systems_Comparison'):
            self.doc.styles['Normal'].paragraph_format.space_after = Pt(4.5)
        self.configure_section(self.doc.sections[0], False)
        footer = self.doc.sections[0].footer.paragraphs[0]
        footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
        number = element("fldSimple", instr="PAGE")
        number.append(element("r"))
        number[0].append(element("t"))
        number[0][0].text = "1"
        footer._p.append(number)
        for token in tokens:
            if token["type"] == "heading" and token["depth"] > 1:
                self.bookmark_count += 1
                token["bookmark"] = f"section_{self.bookmark_count:03d}"
                self.bookmarks[self.slug(plain(token["tokens"]))] = token["bookmark"]

    @staticmethod
    def slug(text):
        return re.sub(r"[^\w\- ]", "", text.lower()).replace(" ", "-")

    @staticmethod
    def configure_section(section, landscape):
        section.orientation = WD_ORIENT.LANDSCAPE if landscape else WD_ORIENT.PORTRAIT
        section.page_width, section.page_height = (Cm(29.7), Cm(21)) if landscape else (Cm(21), Cm(29.7))
        section.top_margin = section.bottom_margin = Cm(1.8)
        section.left_margin = section.right_margin = Cm(2)
        section.footer_distance = Cm(0.8)
        section.header_distance = Cm(0.8)

    def orient(self, landscape):
        if landscape != self.landscape:
            self.configure_section(self.doc.add_section(WD_SECTION_START.NEW_PAGE), landscape)
            separator = self.doc.paragraphs[-1]
            separator.paragraph_format.space_before = Pt(0)
            separator.paragraph_format.space_after = Pt(0)
            separator.paragraph_format.line_spacing = Pt(1)
            separator.paragraph_format.keep_with_next = False
            set_font(separator.add_run(), 1)
            self.landscape = landscape

    def needs_landscape(self, tokens):
        for token in tokens:
            if token["type"] == "table" and len(token["header"]) >= 5:
                return True
            for child in walk([token]):
                if child["type"] == "image":
                    data = self.load_image(child["href"])
                    with Image.open(io.BytesIO(data)) as img:
                        if self.source.parent.name == 'architecture' and img.width / img.height >= 1.3:
                            return True
        return False

    def load_image(self, href):
        if href not in self.images:
            self.images[href] = image_bytes(image_path(self.source, href))
        return self.images[href]

    def link_target(self, href):
        if href.startswith("#"):
            return None, self.bookmarks.get(unquote(href[1:]))
        if urlsplit(href).scheme:
            return href, None
        file_part, _, fragment = href.partition("#")
        resolved = (self.source.parent / unquote(file_part)).resolve()
        if resolved.stem in SOURCES and resolved.suffix == ".md":
            return f"{resolved.stem}.docx", None
        return os.path.relpath(resolved, OUTPUT).replace(os.sep, "/") + (f"#{fragment}" if fragment else ""), None

    def inline(self, paragraph, tokens, *, bold=False, italic=False, size=None, parent=None):
        container = parent if parent is not None else paragraph._p
        for token in tokens:
            kind = token["type"]
            if kind in ("strong", "em", "del"):
                self.inline(paragraph, token["tokens"], bold=bold or kind == "strong",
                            italic=italic or kind == "em", size=size, parent=container)
            elif kind == "link":
                target, anchor = self.link_target(token["href"])
                hyperlink = element("hyperlink")
                if anchor:
                    hyperlink.set(qn("w:anchor"), anchor)
                elif target:
                    relationship = self.doc.part.relate_to(target, RELATIONSHIP_TYPE.HYPERLINK, is_external=True)
                    hyperlink.set(qn("r:id"), relationship)
                container.append(hyperlink)
                self.inline(paragraph, token["tokens"], bold=bold, italic=italic, size=size, parent=hyperlink)
                for child in hyperlink:
                    properties = child.get_or_add_rPr()
                    color = properties.find(qn("w:color"))
                    if color is not None:
                        color.set(qn("w:val"), "225588")
                    else:
                        properties.append(element("color", val="225588"))
                    properties.append(element("u", val="single"))
            elif kind == "image":
                self.picture(paragraph, token)
            elif kind == "text" and token.get("tokens"):
                self.inline(paragraph, token["tokens"], bold=bold, italic=italic, size=size, parent=container)
            elif kind in ("text", "escape", "codespan", "br", "html"):
                run = paragraph.add_run()
                set_font(run, size=size, bold=bold)
                run.italic = italic
                if kind == "br" or (kind == "html" and re.fullmatch(r"<br\s*/?>", token["text"], re.I)):
                    run.add_break()
                elif kind == "html":
                    raise ValueError(f"Unsupported inline HTML in {self.source}: {token['text']}")
                else:
                    run.text = html.unescape(token.get("text", "")).replace("\n", " ")
                container.append(run._r)
            else:
                raise ValueError(f"Unsupported inline token {kind} in {self.source}")

    def picture(self, paragraph, token):
        data = self.load_image(token["href"])
        with Image.open(io.BytesIO(data)) as img:
            ratio = img.width / img.height
        available_width = 25.7 if self.landscape else 17
        available_height = 14.5 if self.landscape else 20
        width = min(available_width, available_height * ratio)
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        paragraph.paragraph_format.keep_with_next = True
        picture = paragraph.add_run().add_picture(io.BytesIO(data), width=Cm(width))
        picture._inline.docPr.set("descr", token.get("text", ""))
        picture._inline.docPr.set("title", token.get("text", ""))

    def paragraph(self, token, prefix="", depth=0):
        text = plain(token.get("tokens", []))
        is_caption = bool(re.match(r"^(Рисунок|Таблица)\s+\S", text))
        paragraph = self.doc.add_paragraph(style="Caption" if is_caption else "Normal")
        if text.startswith('Таблица '):
            paragraph.paragraph_format.keep_with_next = True
        if re.match(r'^\[L\d{2}\]', text):
            paragraph.paragraph_format.keep_together = True
        if prefix:
            paragraph.paragraph_format.left_indent = Cm(0.55 + depth * 0.5)
            paragraph.paragraph_format.first_line_indent = Cm(-0.55)
            set_font(paragraph.add_run(prefix))
        self.inline(paragraph, token.get("tokens", []))
        return paragraph

    def table(self, token):
        count = len(token["header"])
        if count >= 5:
            self.orient(True)
        table = self.doc.add_table(rows=1, cols=count)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        sizes = widths(token["header"], token["rows"], 25.7 if self.landscape else 17)
        properties = table._tbl.tblPr
        borders = element("tblBorders")
        for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
            borders.append(element(edge, val="single", sz="4", color="D9D9D9"))
        properties.append(borders)
        margins = element("tblCellMar")
        for edge in ("top", "bottom"):
            margins.append(element(edge, w="90", type="dxa"))
        for edge in ("left", "right"):
            margins.append(element(edge, w="110", type="dxa"))
        properties.append(margins)
        for column, size in zip(table.columns, sizes):
            column.width = Cm(size)
        all_rows = [token["header"]] + token["rows"]
        for number, cells in enumerate(all_rows):
            row = table.rows[0] if number == 0 else table.add_row()
            row._tr.get_or_add_trPr().append(element("cantSplit"))
            if number == 0:
                row._tr.get_or_add_trPr().append(element("tblHeader"))
            for index, value in enumerate(cells):
                cell = row.cells[index]
                cell.width = Cm(sizes[index])
                cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
                if number == 0:
                    cell._tc.get_or_add_tcPr().append(element("shd", fill="DCEAF7"))
                paragraph = cell.paragraphs[0]
                paragraph.paragraph_format.line_spacing = 1.05
                paragraph.paragraph_format.space_after = Pt(2)
                paragraph.paragraph_format.keep_with_next = False
                if token["align"][index] == "center" or (number > 0 and len(plain(value["tokens"])) <= 12):
                    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                self.inline(paragraph, value["tokens"], bold=number == 0, size=10.5)

    def render_blocks(self, tokens, depth=0):
        for index, token in enumerate(tokens):
            kind = token["type"]
            if kind == "heading":
                if token["depth"] == 2:
                    end = next((j for j in range(index + 1, len(tokens))
                                if tokens[j]["type"] == "heading" and tokens[j]["depth"] == 2), len(tokens))
                    self.orient(self.needs_landscape(tokens[index:end]))
                style = "Title" if token["depth"] == 1 else f"Heading {min(3, token['depth'] - 1)}"
                paragraph = self.doc.add_paragraph(style=style)
                self.inline(paragraph, token["tokens"], bold=token["depth"] > 1)
                if "bookmark" in token:
                    identifier = int(token["bookmark"].split("_")[-1])
                    paragraph._p.insert(0, element("bookmarkStart", id=identifier, name=token["bookmark"]))
                    paragraph._p.append(element("bookmarkEnd", id=identifier))
            elif kind in ("paragraph", "text"):
                self.paragraph(token)
            elif kind == "table":
                self.table(token)
            elif kind == "list":
                for number, item in enumerate(token["items"], int(token.get("start") or 1)):
                    first = True
                    for child in item["tokens"]:
                        if child["type"] in ("text", "paragraph"):
                            prefix = f"{number}. " if token["ordered"] else "• "
                            if item.get("task"):
                                prefix = "☑ " if item.get("checked") else "☐ "
                            self.paragraph(child, prefix=prefix if first else "", depth=depth)
                            first = False
                        else:
                            self.render_blocks([child], depth + 1)
            elif kind == "blockquote":
                self.render_blocks(token["tokens"], depth)
            elif kind == "code":
                paragraph = self.doc.add_paragraph()
                paragraph.paragraph_format.line_spacing = 1
                run = paragraph.add_run(token["text"])
                set_font(run, 10.5)
            elif kind in ("space", "hr"):
                continue
            else:
                raise ValueError(f"Unsupported block token {kind} in {self.source}")

    def build(self):
        first_heading = next((i for i, token in enumerate(self.tokens)
                              if token["type"] == "heading" and token["depth"] == 2), len(self.tokens))
        self.render_blocks(self.tokens[:first_heading])
        headings = [token for token in self.tokens if token["type"] == "heading" and token["depth"] == 2]
        if len(headings) >= 6:
            self.doc.add_paragraph("Содержание", style="Heading 1")
            for token in headings:
                self.inline(self.doc.add_paragraph(), [{"type": "link", "href": "#" + self.slug(plain(token["tokens"])),
                                                       "tokens": token["tokens"]}], size=10.5)
        self.render_blocks(self.tokens[first_heading:])
        return self.doc


def safe_destination(path):
    if not path.exists():
        return
    with zipfile.ZipFile(path) as package:
        from lxml import etree
        properties = etree.fromstring(package.read("docProps/core.xml"))
    identifier = properties.find("{http://purl.org/dc/elements/1.1/}identifier")
    if identifier is None or identifier.text != IDENTIFIER:
        raise FileExistsError(f"Refusing to overwrite a document not generated by this builder: {path}")


def self_test():
    tokens = parse_markdown("# Қазақша Русский\n\n## 1 Проверка\n\n**Текст** [ссылка](https://example.org)\n\n| A | B |\n|---|---|\n| x | y |\n")
    assert tokens[0]["type"] == "heading" and plain(tokens[0]["tokens"]) == "Қазақша Русский"
    table = next(token for token in tokens if token["type"] == "table")
    assert len(table["rows"]) == 1 and len(table["header"]) == 2
    sizes = widths(table["header"], table["rows"], 17)
    assert abs(sum(sizes) - 17) < 1e-8 and min(sizes) >= 1.8
    assert len(SOURCES) == 11 and len(set(SOURCES)) == 11
    document = Builder(ROOT / 'docs/proposal/sample.md', tokens).build()
    assert len(document.tables) == 1
    assert document.element.xpath('//w:bookmarkStart')[0].get(qn('w:name')) == 'section_001'
    assert document.element.xpath('//w:hyperlink//w:t')[0].text == 'ссылка'
    assert not document.styles.element.xpath('.//w:pBdr')
    print("Self-test passed: Unicode, parsing, widths, bookmarks, hyperlinks, in-memory Word build, eleven-source map.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Validate sources and images without writing DOCX")
    parser.add_argument("--self-test", action="store_true", help="Run pure parser/layout assertions without DOCX")
    arguments = parser.parse_args()
    if arguments.self_test:
        self_test()
        return
    parsed = []
    for source in source_paths():
        tokens = parse_markdown(source.read_text(encoding="utf-8"))
        for token in walk(tokens):
            if token["type"] == "image":
                image_path(source, token["href"])
        parsed.append((source, tokens))
    if arguments.check:
        print(f"Checked {len(parsed)} Markdown sources and their local image references; no DOCX written.")
        return
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for source, tokens in parsed:
        safe_destination(OUTPUT / f"{source.stem}.docx")
    for source, tokens in parsed:
        destination = OUTPUT / f"{source.stem}.docx"
        document = Builder(source, tokens).build()
        handle, temporary = tempfile.mkstemp(prefix=f".{source.stem}-", suffix=".docx", dir=OUTPUT)
        os.close(handle)
        try:
            document.save(temporary)
            os.replace(temporary, destination)
        finally:
            Path(temporary).unlink(missing_ok=True)
        print(destination.relative_to(ROOT))


if __name__ == "__main__":
    main()
