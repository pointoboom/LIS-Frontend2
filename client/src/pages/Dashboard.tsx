import DashboardLayout from '@/components/DashboardLayout';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, FileText, AppWindow } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const latestItems = [
    { id: 1, label: 'Latest', time: '10 mins ago' },
    { id: 2, label: 'Latest', time: '15 mins ago' },
    { id: 3, label: 'Latest', time: '20 mins ago' },
    { id: 4, label: 'Latest', time: '25 mins ago' },
    { id: 5, label: 'Latest', time: '28 mins ago' },
    { id: 6, label: 'Latest', time: '29 mins ago' },
  ];

  type ApiReport = {
    _id?: { $oid?: string };
    received_at?: { $date?: { $numberLong?: string } };
    pid?: { alias_patient?: string };
    orders?: Array<{
      obr?: {
        placer_order?: string;
        filler_order?: string;
        service?: { id?: string; text?: string };
        observation_datetime?: string;
      };
      observations?: Array<{
        value?: string | number | null;
      }>;
    }>;
  };

  type Row = {
    id: string; // used to navigate
    report_id: string;
    patient_id: string;
    alias_patient: string;
    filler_order: string;
    service_id: string;
    service_text: string;
    received_at: string; // display: DD MMMM YYYY
    received_ts: number | null; // ms for sort/filter
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ApiReport[]>([]);

  function normalizeApiResponse(payload: any): ApiReport[] {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload as ApiReport[];
    const candidates = [payload.items, payload.data, payload.reports, payload.results, payload.content].filter(Boolean);
    for (const c of candidates) if (Array.isArray(c)) return c as ApiReport[];
    if (payload.orders || payload.pid || payload._id) return [payload as ApiReport];
    return [];
  }

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use relative path so Vite dev proxy and Express prod proxy handle CORS
      const url = 'https://lisapi.entrywisesolutions.com/api/v1/lab-reports';
      const res = await axios.get(url, { timeout: 15000 });
      const data = normalizeApiResponse(res.data);
      if (!Array.isArray(data)) {
        console.warn('Unexpected API shape:', res.data);
      }
      setReports(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load lab reports');
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await fetchReports();
      if (!mounted) return;
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function toMs(v: any): number | null {
    if (v == null) return null;
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      // Custom format: YYYY-MM-DD HH:mm:ss.SSS +HH:MM:SS (e.g., 2025-11-03 15:38:23.244 +00:00:00)
      const m = v.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))? ([+-]\d{2}):(\d{2}):(\d{2})$/);
      if (m) {
        const [_, y, mo, da, hh, mi, ss, msStr, offH, offM, offS] = m;
        const ms = Number(msStr || '0');
        const sign = offH.startsWith('-') ? -1 : 1;
        const offHours = Math.abs(Number(offH));
        const offsetMs = sign * ((offHours * 60 + Number(offM)) * 60 + Number(offS)) * 1000;
        const t = Date.UTC(Number(y), Number(mo) - 1, Number(da), Number(hh), Number(mi), Number(ss), ms);
        return t - offsetMs;
      }
      if (/^\d+$/.test(v)) {
        const ms = Number(v);
        return isNaN(ms) ? null : ms;
      }
      // HL7 like YYYYMMDD[HHmmss]
      if (/^\d{8,14}$/.test(v)) {
        const year = Number(v.slice(0, 4));
        const month = Number(v.slice(4, 6)) - 1;
        const day = Number(v.slice(6, 8));
        const hh = Number(v.slice(8, 10) || '0');
        const mm = Number(v.slice(10, 12) || '0');
        const ss = Number(v.slice(12, 14) || '0');
        return Date.UTC(year, month, day, hh, mm, ss);
      }
      const t = Date.parse(v);
      return isNaN(t) ? null : t;
    }
    return null;
  }

  function formatDisplayDate(ms: number | null): string {
    if (ms == null) return '-';
    const d = new Date(ms);
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = months[d.getUTCMonth()];
    const yyyy = d.getUTCFullYear();
    return `${dd} ${month} ${yyyy}`;
  }

  

  const lisResults: Row[] = useMemo(() => {
    const rows: Row[] = [];
    for (const raw of reports as any[]) {
      const r: any = raw || {};
      const oid = r?._id?.$oid || r?._id || r?.id || '';
      const alias_patient = r?.pid?.alias_patient || r?.patient || r?.patient_name || '-';
      const patient_id = r?.pid?.patient_id || r?.patient_id || '';

      const pushFromOrder = (o: any) => {
        if (!o) return;
        const obr = o.obr || r.obr || {};
        const service = obr.service || o.service || r.service || {};
        const filler = obr.filler_order || o.filler_order || r.filler_order || '';
        const placer = obr.placer_order || o.placer_order || r.placer_order || '';
        const idForNav = String(filler || placer || oid || '-');

        // Received at prioritizes root received_at field; format per required style
        const receivedAtRaw = r?.received_at?.$date?.$numberLong ?? r?.received_at ?? obr.observation_datetime ?? '-';
        const received_ts = toMs(receivedAtRaw);
        const received_at = formatDisplayDate(received_ts);

        rows.push({
          id: idForNav,
          report_id: String(oid || '-'),
          patient_id: String(patient_id || ''),
          alias_patient: String(alias_patient || '-'),
          filler_order: String(filler || placer || '-'),
          service_id: String(service.id || r.test || '-'),
          service_text: String(service.text || r.test_name || '-'),
          received_at,
          received_ts,
        });
      };

      let hadOrder = false;
      const orders = Array.isArray(r.orders) ? r.orders : (r.orders ? [r.orders] : []);
      if (orders.length) {
        for (const o of orders) pushFromOrder(o), hadOrder = true;
      }
      if (!hadOrder) {
        // Try root-level structure as a single order
        pushFromOrder({});
      }
    }
    return rows;
  }, [reports]);

  const stats = useMemo(() => {
    const total = lisResults.length;
    const uniqueHN = new Set(lisResults.map(r => r.patient_id || '-')).size;
    const uniqueServices = new Set(lisResults.map(r => r.service_id || '-')).size;
    const times = lisResults.map(r => r.received_ts).filter(Boolean) as number[];
    const minTs = times.length ? Math.min(...times) : null;
    const maxTs = times.length ? Math.max(...times) : null;
    return {
      total,
      uniqueHN,
      uniqueServices,
      from: formatDisplayDate(minTs),
      to: formatDisplayDate(maxTs),
    };
  }, [lisResults]);

  const serviceBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of lisResults) {
      const key = r.service_text || r.service_id || '-';
      map.set(key, (map.get(key) || 0) + 1);
    }
    const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, 6).map(([name, value]) => ({ name, value }));
    const others = entries.slice(6).reduce((sum, [, v]) => sum + v, 0);
    if (others > 0) top.push({ name: 'Others', value: others });
    return top;
  }, [lisResults]);

  const reportsByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of lisResults) {
      const ts = r.received_ts;
      if (ts == null) continue;
      const d = new Date(ts);
      const key = `${String(d.getUTCFullYear())}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
      map.set(key, (map.get(key) || 0) + 1);
    }
    const entries = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    // show last 14 days
    const last14 = entries.slice(-14).map(([date, count]) => {
      const [y, m, d] = date.split('-').map(Number);
      const label = new Date(Date.UTC(y, (m || 1) - 1, d || 1)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      return { date: label, count };
    });
    return last14;
  }, [lisResults]);

  // Filters
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo,   setOpenTo]   = useState(false);
  const [preset, setPreset] = useState<'1d' | '3d' | '7d' | '1m' | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof Row | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // parseDateLike not needed anymore; using received_ts directly

  const filteredRows = useMemo(() => {
    const start = fromDate ? new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0).getTime() : null;
    const end = toDate ? new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59).getTime() : null;
    let out = lisResults;
    if (start || end) {
      out = out.filter(r => {
        const t = r.received_ts;
        if (t == null) return false;
        if (start && t < start) return false;
        if (end && t > end) return false;
        return true;
      });
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(r =>
        r.report_id.toLowerCase().includes(q) ||
        r.patient_id.toLowerCase().includes(q) ||
        r.alias_patient.toLowerCase().includes(q) ||
        r.filler_order.toLowerCase().includes(q) ||
        r.service_id.toLowerCase().includes(q) ||
        r.service_text.toLowerCase().includes(q) ||
        r.received_at.toLowerCase().includes(q)
      );
    }
    return out;
  }, [lisResults, fromDate, toDate, search]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    const rows = [...filteredRows];
    rows.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const k = sortKey as keyof Row;
      if (k === 'received_at') {
        const av = a.received_ts ?? 0;
        const bv = b.received_ts ?? 0;
        return (av - bv) * dir;
      }
      const av = String(a[k] ?? '').toLowerCase();
      const bv = String(b[k] ?? '').toLowerCase();
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return rows;
  }, [filteredRows, sortKey, sortDir]);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const pagedRows = useMemo(() => {
    const from = (page - 1) * pageSize;
    return sortedRows.slice(from, from + pageSize);
  }, [sortedRows, page]);

  // Reset page when filters or data change
  useEffect(() => {
    setPage(1);
  }, [fromDate, toDate, reports.length, search, sortKey, sortDir]);

  function toggleSort(k: keyof Row) {
    if (sortKey !== k) {
      setSortKey(k);
      setSortDir('asc');
    } else {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    }
  }

  function SortIcon({ k }: { k: keyof Row }) {
    if (sortKey !== k) return <ArrowUpDown className="ml-1 inline size-3.5 text-muted-foreground" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="ml-1 inline size-3.5" />
    ) : (
      <ArrowDown className="ml-1 inline size-3.5" />
    );
  }

  function formatThai(d?: Date) {
    if (!d) return '';
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function applyPreset(p: '1d' | '3d' | '7d' | '1m') {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let start = new Date(end);
    if (p === '1m') {
      start = new Date(end.getFullYear(), end.getMonth() - 1, end.getDate());
    } else {
      const days = p === '1d' ? 1 : p === '3d' ? 3 : 7;
      start = new Date(end);
      start.setDate(end.getDate() - (days - 1));
    }
    setFromDate(start);
    setToDate(end);
    setPreset(p);
  }

  function buildVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
    const result: (number | 'ellipsis')[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) result.push(i);
      return result;
    }
    result.push(1);
    if (current > 4) result.push('ellipsis');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) result.push(i);
    if (current < total - 3) result.push('ellipsis');
    result.push(total);
    return result;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* <Card className="border-none shadow-md bg-gradient-to-tr from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
              <Clock className="text-blue-500" />
              Scan Results
            </CardTitle>
            <CardDescription>Last updated: &lt; 30 mins</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-sm font-medium dark:bg-emerald-900/30 dark:text-emerald-300">
              Active
            </div>
          </CardContent>
        </Card> */}

        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            onClick={() => setLocation('/dashboard/reports')}
            className="cursor-pointer hover:shadow-lg transition-shadow border-0 bg-white dark:bg-card"
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 grid place-items-center text-white">
                  <FileText />
                </div>
                <div>
                  <div className="text-lg font-semibold">Reports</div>
                  <div className="text-muted-foreground">View all reports</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setLocation('/dashboard/category')}
            className="cursor-pointer hover:shadow-lg transition-shadow border-0 bg-white dark:bg-card"
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 grid place-items-center text-white">
                  <AppWindow />
                </div>
                <div>
                  <div className="text-lg font-semibold">Category</div>
                  <div className="text-muted-foreground">Browse categories</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Latest Results</CardTitle>
            <CardDescription>Quick access to recent scans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {latestItems.map(item => (
                <Button
                  key={item.id}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-900 border-indigo-200 hover:from-indigo-100 hover:to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 dark:text-indigo-100 dark:border-indigo-800"
                  onClick={() => setLocation(`/dashboard/reports?id=${item.id}`)}
                >
                  <span className="text-sm font-semibold">{item.label}</span>
                  <span className="text-[10px] opacity-70 mt-1">{item.time}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card> */}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Total Reports</CardTitle></CardHeader>
            <CardContent className="pt-0 text-3xl font-semibold">{stats.total}</CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Unique HN</CardTitle></CardHeader>
            <CardContent className="pt-0 text-3xl font-semibold">{stats.uniqueHN}</CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Unique Services</CardTitle></CardHeader>
            <CardContent className="pt-0 text-3xl font-semibold">{stats.uniqueServices}</CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Date Range</CardTitle></CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">{stats.from} – {stats.to}</CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Service Breakdown</CardTitle>
              <CardDescription>Top services by count</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={serviceBreakdown} dataKey="value" nameKey="name" outerRadius={90}>
                    {serviceBreakdown.map((_, idx) => (
                      <Cell key={`c-${idx}`} fill={["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7", "#94a3b8"][idx % 7]} />
                    ))}
                  </Pie>
                  <RTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Reports by Day</CardTitle>
              <CardDescription>Last 14 days</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <RTooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* LIS Data Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>LIS Results</CardTitle>
                <CardDescription>Recent laboratory results from LIS</CardDescription>
              </div>
            
            </div>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner className="size-4" /> Loading lab reports...
              </div>
            )}
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertTitle>Failed to load</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {!loading && !error && lisResults.length === 0 && (
              <div className="text-sm text-muted-foreground mb-3">No data from API.</div>
            )}
            <Table>
              <TableHeader className="bg-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/30">
                <TableRow className="after:block after:h-px after:bg-border">
                  {/* First column: HN (patient_id) */}
                  <TableHead>
                    <button
                      className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider ${sortKey==='patient_id' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      onClick={() => toggleSort('patient_id')}
                    >
                      HN <SortIcon k="patient_id" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider ${sortKey==='report_id' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      onClick={() => toggleSort('report_id')}
                    >
                      Report ID <SortIcon k="report_id" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider ${sortKey==='alias_patient' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      onClick={() => toggleSort('alias_patient')}
                    >
                      Alias Patient <SortIcon k="alias_patient" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider ${sortKey==='filler_order' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      onClick={() => toggleSort('filler_order')}
                    >
                      Filler Order <SortIcon k="filler_order" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider ${sortKey==='service_id' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      onClick={() => toggleSort('service_id')}
                    >
                      Service ID <SortIcon k="service_id" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider ${sortKey==='service_text' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      onClick={() => toggleSort('service_text')}
                    >
                      Service Text <SortIcon k="service_text" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider ${sortKey==='received_at' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      onClick={() => toggleSort('received_at')}
                    >
                      Received At <SortIcon k="received_at" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-wider text-muted-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.map((row) => (
                  <TableRow key={row.filler_order || row.report_id}>
                    <TableCell className="font-medium">{row.patient_id}</TableCell>
                    <TableCell>{row.report_id}</TableCell>
                    <TableCell>{row.alias_patient}</TableCell>
                    <TableCell>{row.filler_order}</TableCell>
                    <TableCell>{row.service_id}</TableCell>
                    <TableCell>{row.service_text}</TableCell>
                    <TableCell>{row.received_at}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="bg-[#2b7fff80] hover:bg-[#2b7fff] text-white border-0"
                        onClick={() => setLocation(`/dashboard/reports?id=${encodeURIComponent(row.id || row.filler_order || row.report_id)}`)}
                      >
                        Open Result
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && !error && pagedRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                      No results found. Try presets, clear filters, or check API.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }}
                  />
                </PaginationItem>
                {buildVisiblePages(page, totalPages).map((p, idx) => (
                  p === 'ellipsis' ? (
                    <PaginationItem key={`e-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === page}
                        onClick={(e) => { e.preventDefault(); setPage(p as number); }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
