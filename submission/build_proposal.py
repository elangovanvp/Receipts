#!/usr/bin/env python3
"""
Build the Receipts NotebookLM proposal PDF from sections.json using reportlab.
Pure-Python (no system deps). Produces a polished, multi-page document with a
title page, a real (page-numbered) table of contents, and styled sections.
"""
import json
import os
import re
import sys

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak,
    ListFlowable, ListItem, HRFlowable, NextPageTemplate,
)
from reportlab.platypus.flowables import Flowable
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "sections.json")
OUT = os.path.join(HERE, "Receipts_Proposal.pdf")

# ── Brand palette ("The Dossier") ───────────────────────────────────────────
CLAY = HexColor("#A8472A")
CLAY_BRIGHT = HexColor("#C25A38")
INK = HexColor("#1F1B16")
INK_SOFT = HexColor("#5A5046")
PAPER = HexColor("#FBF7EF")
HAIRLINE = HexColor("#D8CDBA")

# ── Font registration (try warm Windows serif/sans; fall back to built-ins) ──
SERIF = "Times-Roman"
SERIF_BOLD = "Times-Bold"
SANS = "Helvetica"
SANS_BOLD = "Helvetica-Bold"
MONO = "Courier"


def _try_font(name, path):
    try:
        if os.path.exists(path):
            pdfmetrics.registerFont(TTFont(name, path))
            return True
    except Exception:
        pass
    return False


WF = r"C:\Windows\Fonts"
if _try_font("Georgia", os.path.join(WF, "georgia.ttf")) and \
   _try_font("Georgia-Bold", os.path.join(WF, "georgiab.ttf")):
    SERIF, SERIF_BOLD = "Georgia", "Georgia-Bold"
if _try_font("Calibri", os.path.join(WF, "calibri.ttf")) and \
   _try_font("Calibri-Bold", os.path.join(WF, "calibrib.ttf")):
    SANS, SANS_BOLD = "Calibri", "Calibri-Bold"

# ── Styles ───────────────────────────────────────────────────────────────────
ss = getSampleStyleSheet()

body = ParagraphStyle(
    "Body", parent=ss["BodyText"], fontName=SANS, fontSize=9.7, leading=13.3,
    textColor=INK, spaceAfter=5, alignment=TA_LEFT,
)
h1 = ParagraphStyle(
    "H1", fontName=SERIF_BOLD, fontSize=16.5, leading=20, textColor=CLAY,
    spaceBefore=15, spaceAfter=3, keepWithNext=True,
)
h1_sub = ParagraphStyle(
    "H1Sub", fontName=SANS, fontSize=10.5, leading=14, textColor=INK_SOFT,
    spaceBefore=0, spaceAfter=8, italic=True, keepWithNext=True,
)
h2 = ParagraphStyle(
    "H2", fontName=SANS_BOLD, fontSize=11.5, leading=15, textColor=INK,
    spaceBefore=9, spaceAfter=3, keepWithNext=True,
)
h3 = ParagraphStyle(
    "H3", fontName=SANS_BOLD, fontSize=10.5, leading=13.5, textColor=CLAY,
    spaceBefore=7, spaceAfter=2, keepWithNext=True,
)
bullet = ParagraphStyle(
    "Bullet", parent=body, leftIndent=14, spaceAfter=3, bulletIndent=2,
)
eyebrow = ParagraphStyle(
    "Eyebrow", fontName=MONO, fontSize=8.5, leading=12, textColor=CLAY,
    spaceAfter=3, tracking=1,
)
toc_h = ParagraphStyle(
    "TocH", fontName=SERIF_BOLD, fontSize=18, leading=22, textColor=CLAY,
    spaceAfter=14,
)

# Title-page styles
t_brand = ParagraphStyle("TBrand", fontName=MONO, fontSize=11, textColor=CLAY,
                         alignment=TA_CENTER, spaceAfter=8)
t_title = ParagraphStyle("TTitle", fontName=SERIF_BOLD, fontSize=40, leading=44,
                         textColor=INK, alignment=TA_CENTER, spaceAfter=6)
t_tag = ParagraphStyle("TTag", fontName=SERIF, fontSize=16, leading=21,
                       textColor=CLAY, alignment=TA_CENTER, spaceAfter=18)
t_sub = ParagraphStyle("TSub", fontName=SANS, fontSize=12, leading=18,
                       textColor=INK_SOFT, alignment=TA_CENTER, spaceAfter=6)
t_meta = ParagraphStyle("TMeta", fontName=MONO, fontSize=9, leading=14,
                        textColor=INK_SOFT, alignment=TA_CENTER)


# ── Inline markdown → reportlab mini-markup ──────────────────────────────────
def inline(text):
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<!\*)\*([^*]+?)\*(?!\*)", r"<i>\1</i>", text)
    text = re.sub(r"`([^`]+?)`", r'<font face="%s">\1</font>' % MONO, text)
    # markdown links [t](u) -> just the text (NotebookLM reads text; keep clean)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1 (\2)", text)
    return text


def md_to_flowables(md):
    """Convert section body Markdown into a list of flowables."""
    out = []
    lines = md.split("\n")
    i = 0
    pending_list = []
    list_kind = None  # 'b' or 'n'

    def flush_list():
        nonlocal pending_list, list_kind
        if not pending_list:
            return
        items = [ListItem(Paragraph(inline(x), bullet), leftIndent=10)
                 for x in pending_list]
        out.append(ListFlowable(
            items,
            bulletType="bullet" if list_kind == "b" else "1",
            bulletColor=CLAY, bulletFontSize=8,
            leftIndent=12, spaceBefore=2, spaceAfter=6,
        ))
        pending_list = []
        list_kind = None

    while i < len(lines):
        ln = lines[i].rstrip()
        s = ln.strip()
        if not s:
            flush_list()
            i += 1
            continue
        m_b = re.match(r"^[-*]\s+(.*)$", s)
        m_n = re.match(r"^\d+[.)]\s+(.*)$", s)
        if m_b:
            if list_kind == "n":
                flush_list()
            list_kind = "b"
            pending_list.append(m_b.group(1))
            i += 1
            continue
        if m_n:
            if list_kind == "b":
                flush_list()
            list_kind = "n"
            pending_list.append(m_n.group(1))
            i += 1
            continue
        flush_list()
        if s.startswith("#### "):
            out.append(Paragraph(inline(s[5:]), h3))
        elif s.startswith("### "):
            out.append(Paragraph(inline(s[4:]), h3))
        elif s.startswith("## "):
            out.append(Paragraph(inline(s[3:]), h2))
        elif s.startswith("# "):
            out.append(Paragraph(inline(s[2:]), h2))
        elif s == "---":
            out.append(Spacer(1, 4))
            out.append(HRFlowable(width="100%", thickness=0.6, color=HAIRLINE,
                                  spaceBefore=2, spaceAfter=6))
        else:
            out.append(Paragraph(inline(s), body))
        i += 1
    flush_list()
    return out


# ── Document with TOC, header/footer, page numbers ──────────────────────────
class ProposalDoc(BaseDocTemplate):
    def __init__(self, filename, **kw):
        super().__init__(filename, **kw)
        self.title_str = ""
        frame = Frame(self.leftMargin, self.bottomMargin,
                      self.width, self.height, id="main")
        self.addPageTemplates([
            PageTemplate(id="title", frames=[frame], onPage=self._bg),
            PageTemplate(id="content", frames=[frame],
                         onPage=self._decorate_bg),
        ])

    def _bg(self, canvas, doc):
        canvas.saveState()
        canvas.setFillColor(PAPER)
        canvas.rect(0, 0, doc.pagesize[0], doc.pagesize[1], fill=1, stroke=0)
        canvas.restoreState()

    def _decorate_bg(self, canvas, doc):
        canvas.saveState()
        canvas.setFillColor(PAPER)
        canvas.rect(0, 0, doc.pagesize[0], doc.pagesize[1], fill=1, stroke=0)
        # header rule + running title
        canvas.setStrokeColor(HAIRLINE)
        canvas.setLineWidth(0.6)
        canvas.line(doc.leftMargin, doc.pagesize[1] - 0.7 * inch,
                    doc.pagesize[0] - doc.rightMargin, doc.pagesize[1] - 0.7 * inch)
        canvas.setFont(MONO, 7.5)
        canvas.setFillColor(CLAY)
        canvas.drawString(doc.leftMargin, doc.pagesize[1] - 0.62 * inch,
                          "RECEIPTS  ·  NO SOURCE, NO CLAIM")
        canvas.setFillColor(INK_SOFT)
        canvas.drawRightString(doc.pagesize[0] - doc.rightMargin,
                               doc.pagesize[1] - 0.62 * inch,
                               "Product Proposal")
        # footer page number
        canvas.setStrokeColor(HAIRLINE)
        canvas.line(doc.leftMargin, 0.62 * inch,
                    doc.pagesize[0] - doc.rightMargin, 0.62 * inch)
        canvas.setFont(MONO, 8)
        canvas.setFillColor(INK_SOFT)
        canvas.drawCentredString(doc.pagesize[0] / 2.0, 0.45 * inch,
                                 str(canvas.getPageNumber()))
        canvas.restoreState()

    def afterFlowable(self, flowable):
        # register TOC entries from H1 headings
        if hasattr(flowable, "_toc_level"):
            self.notify("TOCEntry", (flowable._toc_level, flowable.getPlainText(),
                                     self.page, flowable._toc_key))


def main():
    with open(DATA, "r", encoding="utf-8") as f:
        data = json.load(f)
    meta = data["meta"]
    sections = data["sections"]

    doc = ProposalDoc(
        OUT, pagesize=LETTER,
        leftMargin=0.85 * inch, rightMargin=0.85 * inch,
        topMargin=0.9 * inch, bottomMargin=0.8 * inch,
        title=meta["title"], author="Receipts",
    )

    story = []

    # ── TITLE PAGE ──
    story.append(Spacer(1, 1.6 * inch))
    story.append(Paragraph(meta.get("eyebrow", "PRODUCT PROPOSAL"), t_brand))
    story.append(HRFlowable(width=70, thickness=2, color=CLAY_BRIGHT,
                            spaceBefore=2, spaceAfter=16, hAlign="CENTER"))
    story.append(Paragraph(meta["title"], t_title))
    story.append(Paragraph(meta["tagline"], t_tag))
    story.append(Paragraph(meta["subtitle"], t_sub))
    story.append(Spacer(1, 0.5 * inch))
    for line in meta.get("meta_lines", []):
        story.append(Paragraph(line, t_meta))
    story.append(NextPageTemplate("content"))
    story.append(PageBreak())

    # ── TABLE OF CONTENTS ──
    story.append(Paragraph("Contents", toc_h))
    toc = TableOfContents()
    toc.levelStyles = [ParagraphStyle(
        "TOCL0", fontName=SANS, fontSize=11, leading=20, textColor=INK,
        leftIndent=0, firstLineIndent=0,
    )]
    story.append(toc)
    story.append(PageBreak())

    # ── SECTIONS ──
    for idx, sec in enumerate(sections, start=1):
        key = "sec-%d" % idx
        head = Paragraph("%d.  %s" % (idx, _esc(sec["heading"])), h1)
        head._toc_level = 0
        head._toc_key = key
        head._bookmark = key
        story.append(_Anchor(key))
        story.append(head)
        if sec.get("subtitle"):
            story.append(Paragraph(inline(sec["subtitle"]), h1_sub))
        story.append(HRFlowable(width="100%", thickness=1, color=CLAY_BRIGHT,
                                spaceBefore=2, spaceAfter=10))
        story.extend(md_to_flowables(sec["body_markdown"]))
        # Sections flow continuously (no forced page break) to keep the
        # document in the 20-25 page range; H1.spaceBefore + the clay rule
        # provide visual separation, and keepWithNext prevents orphan headings.

    doc.multiBuild(story)
    print("WROTE", OUT, "pages via multiBuild")


def _esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


class _Anchor(Flowable):
    """Zero-height flowable that drops a PDF bookmark for TOC linking."""
    def __init__(self, name):
        super().__init__()
        self.name = name

    def wrap(self, *a):
        return (0, 0)

    def draw(self):
        self.canv.bookmarkPage(self.name)


if __name__ == "__main__":
    main()
