/**
 * Split the uploaded "Backend-Interview-Kit-ALL" Google Doc into tabs.
 *
 * Every topic file in the doc starts with a Heading 1 like "05 — JavaScript".
 * This script moves each of those sections into its own tab, grouped under
 * six section tabs, and keeps all formatting. The intro (contents + README)
 * stays in the first tab, renamed "Start here".
 *
 * One-time setup (in the Google Doc):
 *   1. Extensions → Apps Script.
 *   2. Delete the sample code and paste this whole file.
 *   3. Left sidebar: Services (+) → "Google Docs API" → Add (keep the name "Docs").
 *   4. Choose splitIntoTabs in the toolbar and click Run. Approve the permissions.
 *
 * If it stops with "Exceeded maximum execution time", just click Run again:
 * it continues where it stopped.
 */

const USE_GROUPS = true; // false = one flat list of tabs

const GROUPS = [
  { title: '1. Your resume', files: ['01'] },
  { title: '2. Node and frameworks', files: ['02', '03', '04', '17'] },
  { title: '3. APIs and data', files: ['05', '06', '07', '08', '09'] },
  { title: '4. Security, testing and observability', files: ['10', '15', '16'] },
  { title: '5. Async, real-time and infrastructure', files: ['11', '12', '14'] },
  { title: '6. Design and coding rounds', files: ['13', '18'] },
  { title: '7. Quick reference', files: ['19'] },
];

const TAB_NAMES = {
  '01': '01 Backend Resume Deep-Dive', '02': '02 Node.js', '03': '03 Express', '04': '04 NestJS',
  '05': '05 REST API Design', '06': '06 GraphQL', '07': '07 PostgreSQL', '08': '08 MongoDB',
  '09': '09 Redis and Caching', '10': '10 Auth and Security', '11': '11 Queues and Async',
  '12': '12 Real-Time', '13': '13 Backend System Design', '14': '14 Docker, AWS and CI-CD',
  '15': '15 Observability and Performance', '16': '16 Backend Testing', '17': '17 Python and FastAPI',
  '18': '18 Backend Coding Round', '19': '19 Quick Memory Sheet',
};

const FILE_HEADING = /^(\d{2}) — /;

function splitIntoTabs() {
  const docId = DocumentApp.getActiveDocument().getId();

  renameTab_(docId, firstTabId_(docId), 'Start here');

  if (USE_GROUPS) {
    GROUPS.forEach((g) => {
      if (!findTab_(docId, g.title)) {
        const id = addTab_(docId, g.title, null);
        const doc = DocumentApp.openById(docId);
        const body = doc.getTab(id).asDocumentTab().getBody();
        body.getParagraphs()[0].setText(g.title).setHeading(DocumentApp.ParagraphHeading.HEADING1);
        body.appendParagraph('Open the tabs nested under this one.');
        doc.saveAndClose();
      }
    });
  }

  // Move one section per loop, re-reading the doc each time so a rerun resumes cleanly.
  while (true) {
    const doc = DocumentApp.openById(docId);
    const source = doc.getTabs()[0].asDocumentTab().getBody();
    const range = nextSection_(source);
    if (!range) break;

    const num = range.num;
    const name = TAB_NAMES[num] || range.heading;
    const group = USE_GROUPS ? GROUPS.find((g) => g.files.includes(num)) : null;
    doc.saveAndClose();

    // A tab left half-filled by a timed-out run is rebuilt from scratch.
    const stale = findTab_(docId, name);
    if (stale) deleteTab_(docId, stale.getId());

    const parentId = group ? findTab_(docId, group.title).getId() : null;
    const tabId = addTab_(docId, name, parentId);

    const doc2 = DocumentApp.openById(docId);
    const src = doc2.getTabs()[0].asDocumentTab().getBody();
    const dest = doc2.getTab(tabId).asDocumentTab().getBody();
    for (let i = range.start; i < range.end; i++) copyElement_(dest, src.getChild(i));
    // The new tab starts with one empty paragraph; drop it now that content exists.
    const first = dest.getChild(0);
    if (dest.getNumChildren() > 1 && first.getType() === DocumentApp.ElementType.PARAGRAPH &&
        first.asParagraph().getText() === '') {
      first.removeFromParent();
    }
    for (let i = range.end - 1; i >= range.start; i--) removeElement_(src, i);
    doc2.saveAndClose();
    Logger.log('Moved ' + name);
  }
  Logger.log('Done.');
}

/** Finds the next "NN — Title" Heading 1 section in the source tab. */
function nextSection_(body) {
  const n = body.getNumChildren();
  let start = -1, num = null, heading = null;
  for (let i = 0; i < n; i++) {
    const el = body.getChild(i);
    if (el.getType() !== DocumentApp.ElementType.PARAGRAPH) continue;
    const p = el.asParagraph();
    if (p.getHeading() !== DocumentApp.ParagraphHeading.HEADING1) continue;
    const m = p.getText().match(FILE_HEADING);
    if (!m) continue;
    if (start === -1) { start = i; num = m[1]; heading = p.getText(); continue; }
    return { start, end: i, num, heading };
  }
  return start === -1 ? null : { start, end: n, num, heading };
}

function copyElement_(dest, el) {
  const T = DocumentApp.ElementType;
  switch (el.getType()) {
    case T.PARAGRAPH:
      if (isPageBreakOnly_(el.asParagraph())) return;
      dest.appendParagraph(el.copy().asParagraph());
      break;
    case T.LIST_ITEM:
      dest.appendListItem(el.copy().asListItem());
      break;
    case T.TABLE:
      dest.appendTable(el.copy().asTable());
      break;
    default:
      break; // tables of contents etc. are not carried over
  }
}

function isPageBreakOnly_(p) {
  if (p.getText().trim() !== '') return false;
  for (let i = 0; i < p.getNumChildren(); i++) {
    if (p.getChild(i).getType() === DocumentApp.ElementType.PAGE_BREAK) return true;
  }
  return false;
}

function removeElement_(body, i) {
  const el = body.getChild(i);
  try {
    el.removeFromParent();
  } catch (e) {
    // The last paragraph of a tab can't be removed; empty it instead.
    if (el.getType() === DocumentApp.ElementType.PARAGRAPH) el.asParagraph().clear();
  }
}

function addTab_(docId, title, parentTabId) {
  const props = { title };
  if (parentTabId) props.parentTabId = parentTabId;
  const res = Docs.Documents.batchUpdate({ requests: [{ addDocumentTab: { tabProperties: props } }] }, docId);
  return res.replies[0].addDocumentTab.tabProperties.tabId;
}

function deleteTab_(docId, tabId) {
  Docs.Documents.batchUpdate({ requests: [{ deleteTab: { tabId } }] }, docId);
}

function renameTab_(docId, tabId, title) {
  Docs.Documents.batchUpdate({
    requests: [{ updateDocumentTabProperties: { tabProperties: { tabId, title }, fields: 'title' } }],
  }, docId);
}

function firstTabId_(docId) {
  return DocumentApp.openById(docId).getTabs()[0].getId();
}

/** Searches all tabs, including nested ones, for a title. */
function findTab_(docId, title) {
  const walk = (tabs) => {
    for (const t of tabs) {
      if (t.getTitle() === title) return t;
      const hit = walk(t.getChildTabs());
      if (hit) return hit;
    }
    return null;
  };
  return walk(DocumentApp.openById(docId).getTabs());
}
