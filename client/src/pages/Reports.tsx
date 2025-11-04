import { Card, Button, Space, Divider, Tag, Image } from 'antd';
import { FilePdfOutlined, FileImageOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

function flagColor(flag?: string | null): string {
  switch ((flag || '').toUpperCase()) {
    case 'H':
      return 'red';
    case 'L':
      return 'volcano';
    case 'A':
    case 'HH':
    case 'LL':
      return 'orange';
    case 'N':
    default:
      return 'green';
  }
}

export default function Reports() {
  const [, setLocation] = useLocation();

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

  const handleExport = (format: string) => {
    const idTag = matchedOrder?.obr?.filler_order || matchedOrder?.obr?.placer_order || data._id?.$oid || 'report';
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => setLocation('/dashboard')}
                type="text"
              >
                Back
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Report</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Tag color="blue">_id: {overallId}</Tag>
                  {obr.filler_order ? <Tag color="geekblue">OBR Filler: {obr.filler_order}</Tag> : null}
                  {obr.service?.id ? <Tag color="purple">Service: {obr.service.id}</Tag> : null}
                  {pid.alias_patient ? <Tag color="green">Patient: {pid.alias_patient}</Tag> : null}
                </div>
              </div>
            </div>
            <Space size="middle">
              <Button
                icon={<FileImageOutlined />}
                onClick={() => handleExport('PNG')}
                size="large"
              >
                PNG
              </Button>
              <Button
                icon={<FilePdfOutlined />}
                type="primary"
                onClick={() => handleExport('PDF')}
                size="large"
              >
                PDF
              </Button>
            </Space>
          </div>

          <Divider />

          {/* MSH + Received */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-indigo-800">MSH</h3>
              <div className="text-gray-700 mt-2 space-y-1">
                <p><strong>Sending App:</strong> {data.msh?.sending_app || '-'}</p>
                <p><strong>Sending Fac:</strong> {data.msh?.sending_fac || '-'}</p>
                <p><strong>Receiving App:</strong> {data.msh?.receiving_app || '-'}</p>
                <p><strong>Receiving Fac:</strong> {data.msh?.receiving_fac || '-'}</p>
                <p><strong>Message Time:</strong> {formatDate(mshTs)}</p>
                <p><strong>Received At:</strong> {formatDate(receivedTs)}</p>
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-emerald-800">PID</h3>
              <div className="text-gray-700 mt-2 space-y-1">
                <p><strong>Alias:</strong> {pid.alias_patient || '-'}</p>
                <p><strong>Patient ID:</strong> {pid.patient_id || '-'}</p>
                <p><strong>Alt Patient ID:</strong> {pid.alt_patient_id || '-'}</p>
                <p><strong>DOB:</strong> {formatDate(pid.dob)}</p>
                <p><strong>Sex:</strong> {pid.sex || '-'}</p>
              </div>
            </div>
          </div>

          {/* OBR */}
          <div className="mb-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-800">OBR</h3>
              <div className="text-gray-700 mt-2 space-y-1">
                <p><strong>Service:</strong> {obr.service?.text || obr.service?.id || '-'}</p>
                <p><strong>Filler Order:</strong> {obr.filler_order || '-'}</p>
                <p><strong>Placer Order:</strong> {obr.placer_order || '-'}</p>
                <p><strong>Observation Time:</strong> {formatDate(obr.observation_datetime)}</p>
              </div>
            </div>
          </div>

          {/* OBX Results */}
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
            <h3 className="text-xl font-bold text-purple-900 mb-4">OBX Results</h3>
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
                              <Image src={imgSrc} alt={code || 'observation-image'} style={{ maxHeight: 160 }} />
                            </div>
                          ) : (
                            <span>{o.value ?? '-'}</span>
                          )}
                        </TableCell>
                        <TableCell>{units}</TableCell>
                        <TableCell>{ref}</TableCell>
                        <TableCell>
                          <Tag color={flagColor(flag)}>{flag || 'N'}</Tag>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
