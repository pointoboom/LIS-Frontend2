import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileImage, FileDown } from 'lucide-react';
import { useRef } from 'react';

// Import the bundled sample report
// Note: tsconfig enables resolveJsonModule to allow this import
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import sampleReport from '../../../sample.json';

type SampleReport = {
  _id?: { $oid?: string };
  received_at?: { $date?: { $numberLong?: string } };
  msh?: {
    sending_app?: string;
    sending_fac?: string;
    receiving_app?: string;
    receiving_fac?: string;
    timestamp?: string;
  };
  pid?: {
    patient_id?: string;
    alt_patient_id?: string;
    alias_patient?: string;
    name?: string | null;
    dob?: string;
    sex?: string;
  };
  orders?: Array<{
    obr?: {
      placer_order?: string;
      filler_order?: string;
      service?: { id?: string; text?: string };
      observation_datetime?: string;
    };
    observations?: Array<{
      set_id?: string;
      value_type?: string;
      id?: { id?: string; text?: string };
      value?: string | number | null;
      units?: { id?: string } | string | null;
      ref_range?: string | null;
      abnormal_flags?: string | null;
      status?: string | null;
    }>;
  }>;
};

function formatDate(input?: string | number): string {
  if (!input) return '';
  try {
    // Support epoch ms (string or number) and HL7-like YYYYMMDD[HHmmss]
    if (typeof input === 'number' || /^\d{12,}$/.test(String(input))) {
      const d = new Date(Number(input));
      if (!isNaN(d.getTime())) return d.toLocaleString();
    }
    const s = String(input);
    if (/^\d{8,14}$/.test(s)) {
      const year = Number(s.slice(0, 4));
      const month = Number(s.slice(4, 6)) - 1;
      const day = Number(s.slice(6, 8));
      const hh = Number(s.slice(8, 10) || '0');
      const mm = Number(s.slice(10, 12) || '0');
      const ss = Number(s.slice(12, 14) || '0');
      const d = new Date(year, month, day, hh, mm, ss);
      return d.toLocaleString();
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleString();
  } catch {
    return String(input);
  }
}

function flagBadgeClass(flag?: string | null): string {
  switch ((flag || '').toUpperCase()) {
    case 'H':
    case 'HH':
      return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    case 'L':
    case 'LL':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
    case 'A':
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
    case 'N':
    default:
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
  }
}

export default function Reports() {
  const [, setLocation] = useLocation();
  const reportRef = useRef<HTMLDivElement>(null);

  // Read ID from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const reportId = urlParams.get('id') || '';

  const data: SampleReport = (sampleReport || {}) as SampleReport;
  const orders = data.orders || [];

  // Pick target order: match by filler_order, placer_order, or service id; fallback to first
  const matchedOrder = orders.find((o) => {
    const f = o.obr?.filler_order || '';
    const p = o.obr?.placer_order || '';
    const s = o.obr?.service?.id || '';
    return [f, p, s].some((x) => x && x.toString() === reportId);
  }) || orders[0];

  const observations = matchedOrder?.observations || [];

  const handleExport = async (format: string) => {
    const idTag = matchedOrder?.obr?.filler_order || matchedOrder?.obr?.placer_order || data._id?.$oid || 'report';
    if (format === 'PDF') {
      const node = reportRef.current;
      if (!node) return toast.error('Nothing to export');

      // Open a print window with the report content and trigger Save as PDF
      const printWin = window.open('', '_blank', 'noopener,noreferrer,width=1024,height=768');
      if (!printWin) return toast.error('Popup blocked. Please allow popups.');

      const title = `Report_${idTag}`;
      const stylesheets: string[] = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map((l) => (l as HTMLLinkElement).outerHTML);
      const styleTags: string[] = Array.from(document.querySelectorAll('style'))
        .map((s) => (s as HTMLStyleElement).outerHTML);

      const inlinePrintCss = `
        <style>
          @page { size: A4; margin: 16mm; }
          html, body { background: #fff; }
          .print-container { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: #0f172a; }
          .print-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
          .print-meta { font-size: 12px; color: #334155; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #e2e8f0; padding: 6px 8px; font-size: 12px; }
          th { background: #f1f5f9; text-transform: uppercase; letter-spacing: .03em; font-weight: 600; }
          img { max-width: 100%; height: auto; }
        </style>
      `;

      printWin.document.write(`<!doctype html><html><head><meta charset="utf-8" />
        <title>${title}</title>
        ${stylesheets.join('\n')}
        ${styleTags.join('\n')}
        ${inlinePrintCss}
      </head><body>
        <div class="print-container">
          <div class="print-title">Laboratory Report</div>
          <div class="print-meta">Exported from LIS Dashboard • ID: ${overallId}</div>
          ${node.innerHTML}
        </div>
        <script>
          window.addEventListener('load', () => {
            setTimeout(() => { window.print(); }, 100);
          });
          window.addEventListener('afterprint', () => { setTimeout(() => window.close(), 50); });
        <\/script>
      </body></html>`);
      printWin.document.close();
      return;
    }
    toast.success(`Exporting ${idTag} as ${format}...`);
  };

  function parseEdToImageSrc(v?: unknown): string | undefined {
    if (!v || typeof v !== 'string') return undefined;
    const parts = v.split('^');
    // Common HL7 ED patterns: 'Base64^<data>' or 'JPEG^Base64^<data>' or 'image/jpeg^Base64^<data>'
    const idxBase64 = parts.findIndex((p) => /base64/i.test(p));
    if (idxBase64 === -1) return undefined;
    const base64 = parts.slice(idxBase64 + 1).join('^').trim();
    if (!base64) return undefined;
    // Try to guess mime from preceding token
    const hint = (parts[idxBase64 - 1] || '').toLowerCase();
    let mime = 'image/jpeg';
    if (hint.includes('png')) mime = 'image/png';
    if (hint.includes('gif')) mime = 'image/gif';
    if (hint.includes('svg')) mime = 'image/svg+xml';
    if (hint.includes('/')) mime = hint; // if already like image/jpeg
    // Fallback heuristic: '/9j/' prefix is typical for JPEG
    if (base64.startsWith('iVBOR')) mime = 'image/png';
    if (base64.startsWith('/9j/')) mime = 'image/jpeg';
    return `data:${mime};base64,${base64}`;
  }

  const overallId = data._id?.$oid || 'N/A';
  const receivedTs = Number(data.received_at?.$date?.$numberLong || '') || undefined;
  const mshTs = data.msh?.timestamp;
  const pid = data.pid || {};
  const obr = matchedOrder?.obr || {};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setLocation('/dashboard')} className="gap-2">
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <div>
                  <CardTitle>Report</CardTitle>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800">_id: {overallId}</Badge>
                    {obr.filler_order ? (
                      <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-800">
                        OBR Filler: {obr.filler_order}
                      </Badge>
                    ) : null}
                    {obr.service?.id ? (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-800">
                        Service: {obr.service.id}
                      </Badge>
                    ) : null}
                    {pid.alias_patient ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                        Patient: {pid.alias_patient}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => handleExport('PNG')} className="gap-2">
                  <FileImage className="size-4" /> PNG
                </Button>
                <Button onClick={() => handleExport('PDF')} className="gap-2">
                  <FileDown className="size-4" /> PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Separator className="my-4" />

            <div ref={reportRef}>
            {/* MSH + Received */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card className="border-indigo-200 bg-indigo-50 dark:bg-indigo-950/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-indigo-800 dark:text-indigo-200">MSH</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                  <p><strong>Sending App:</strong> {data.msh?.sending_app || '-'}</p>
                  <p><strong>Sending Fac:</strong> {data.msh?.sending_fac || '-'}</p>
                  <p><strong>Receiving App:</strong> {data.msh?.receiving_app || '-'}</p>
                  <p><strong>Receiving Fac:</strong> {data.msh?.receiving_fac || '-'}</p>
                  <p><strong>Message Time:</strong> {formatDate(mshTs)}</p>
                  <p><strong>Received At:</strong> {formatDate(receivedTs)}</p>
                </CardContent>
              </Card>
              <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-emerald-800 dark:text-emerald-200">PID</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                  <p><strong>Alias:</strong> {pid.alias_patient || '-'}</p>
                  <p><strong>Patient ID:</strong> {pid.patient_id || '-'}</p>
                  <p><strong>Alt Patient ID:</strong> {pid.alt_patient_id || '-'}</p>
                  <p><strong>DOB:</strong> {formatDate(pid.dob)}</p>
                  <p><strong>Sex:</strong> {pid.sex || '-'}</p>
                </CardContent>
              </Card>
            </div>

            {/* OBR */}
            <Card className="mb-4 border-purple-200 bg-purple-50 dark:bg-purple-950/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-purple-800 dark:text-purple-200">OBR</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                <p><strong>Service:</strong> {obr.service?.text || obr.service?.id || '-'}</p>
                <p><strong>Filler Order:</strong> {obr.filler_order || '-'}</p>
                <p><strong>Placer Order:</strong> {obr.placer_order || '-'}</p>
                <p><strong>Observation Time:</strong> {formatDate(obr.observation_datetime)}</p>
              </CardContent>
            </Card>

            {/* OBX Results */}
            <Card className="border-purple-300 bg-purple-100 dark:bg-purple-950/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-purple-900 dark:text-purple-100">OBX Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Text</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Flag</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {observations.map((o, idx) => {
                        const units = typeof o.units === 'string' ? o.units : (o.units?.id || '');
                        const code = o.id?.id || '';
                        const text = o.id?.text || '';
                        const ref = o.ref_range || '';
                        const flag = o.abnormal_flags || 'N';
                        const imgSrc = o.value_type === 'ED' ? parseEdToImageSrc(o.value) : undefined;
                        return (
                          <TableRow key={`${code}-${idx}`}>
                            <TableCell className="font-medium">{code}</TableCell>
                            <TableCell>{text}</TableCell>
                            <TableCell>
                              {imgSrc ? (
                                <div className="py-2">
                                  <img src={imgSrc} alt={code || 'observation-image'} className="max-h-40 rounded border" />
                                </div>
                              ) : (
                                <span>{o.value ?? '-'}</span>
                              )}
                            </TableCell>
                            <TableCell>{units}</TableCell>
                            <TableCell>{ref}</TableCell>
                            <TableCell>
                              <Badge className={flagBadgeClass(flag)}>{flag || 'N'}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
