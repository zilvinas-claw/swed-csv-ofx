import { detectFormat } from './parsers/detect';
import { parseStmt as parseSwedbankStmt } from './parsers/swedbank';
import { parseStmt as parseRevolutStmt } from './parsers/revolut';
import { parseStmt as parseN26Stmt } from './parsers/n26';
import { parseStmt as parseCitadeleStmt } from './parsers/citadele';
import { stmtToOfx } from './ofx';
import type { BankFormat, Statement } from './parsers/types';
import './style.css';

const formatLabels: Record<BankFormat, string> = {
  swedbank: 'Swedbank LT',
  revolut: 'Revolut',
  n26: 'N26',
  citadele: 'Citadele',
};

function parseByFormat(format: BankFormat, csv: string): Statement {
  switch (format) {
    case 'swedbank':
      return parseSwedbankStmt(csv);
    case 'revolut':
      return parseRevolutStmt(csv);
    case 'n26':
      return parseN26Stmt(csv);
    case 'citadele':
      return parseCitadeleStmt(csv);
  }
}

function handleFile(content: string) {
  const resultDiv = document.getElementById('result')!;
  const formatBadge = document.getElementById('detected-format')!;
  const trxCount = document.getElementById('trx-count')!;
  const downloadLink = document.getElementById('download-link') as HTMLAnchorElement;
  const previewBody = document.getElementById('preview-body')!;

  // Remove any previous error
  document.querySelector('.error')?.remove();

  const format = detectFormat(content);
  if (!format) {
    resultDiv.classList.add('hidden');
    const err = document.createElement('div');
    err.className = 'error';
    err.textContent = 'Could not detect bank format. Supported: Swedbank LT, Revolut, N26, Citadele.';
    document.querySelector('.container')!.appendChild(err);
    return;
  }

  try {
    const stmt = parseByFormat(format, content);
    const ofxStr = stmtToOfx(stmt);

    formatBadge.textContent = formatLabels[format];
    trxCount.textContent = `${stmt.trx.length} transactions`;

    // Build preview table
    previewBody.innerHTML = '';
    for (const trn of stmt.trx) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${trn.date}</td>
        <td>${escapeHtml(trn.payee)}</td>
        <td>${escapeHtml(trn.memo)}</td>
        <td>${trn.amount}</td>
        <td>${trn.type}</td>
      `;
      previewBody.appendChild(tr);
    }

    // Create download link
    const blob = new Blob([ofxStr], { type: 'application/x-ofx' });
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `statement-${format}.ofx`;

    resultDiv.classList.remove('hidden');
  } catch (e) {
    resultDiv.classList.add('hidden');
    const err = document.createElement('div');
    err.className = 'error';
    err.textContent = `Error parsing file: ${e instanceof Error ? e.message : String(e)}`;
    document.querySelector('.container')!.appendChild(err);
  }
}

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

// Wire up file input
const fileInput = document.getElementById('file-input') as HTMLInputElement;
fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => handleFile(reader.result as string);
  reader.readAsText(file);
});

// Drag and drop
const uploadArea = document.getElementById('upload-area')!;
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});
uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  const file = e.dataTransfer?.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => handleFile(reader.result as string);
  reader.readAsText(file);
});
