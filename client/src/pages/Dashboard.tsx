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
    sampleId: string;
    patient: string;
    test: string;
    status: 'Completed' | 'Pending';
    collected: string;
    result: string;
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ApiReport[]>([]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use relative path so Vite dev proxy and Express prod proxy handle CORS
      const url = '/api/v1/lab-reports';
      const res = await axios.get(url, { timeout: 15000 });
      const data = Array.isArray(res.data) ? res.data : (res.data?.items || []);
      setReports(data as ApiReport[]);
    } catch (e: any) {
      setError(e?.message || 'Failed to load lab reports');
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

  const lisResults: Row[] = useMemo(() => {
    const rows: Row[] = [];
    for (const r of reports) {
      const oid = r._id?.$oid || '';
      const patient = r.pid?.alias_patient || '-';
      const orders = r.orders || [];
      for (const o of orders) {
        const filler = o.obr?.filler_order || '';
        const placer = o.obr?.placer_order || '';
        const sampleId = filler || placer || oid || '-';
        const idForNav = filler || placer || oid || sampleId;
        const test = o.obr?.service?.text || o.obr?.service?.id || '-';
        const collected = o.obr?.observation_datetime || '-';
        const status: Row['status'] = (o.observations && o.observations.length > 0) ? 'Completed' : 'Pending';
        const result = (o.observations && o.observations[0]?.value != null)
          ? String(o.observations[0].value)
          : '-';
        rows.push({ id: idForNav, sampleId, patient, test, status, collected, result });
      }
    }
    return rows;
  }, [reports]);

  // Filters
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  function parseDateLike(d: string): number | null {
    if (!d) return null;
    // If HL7 like YYYYMMDD[HHmmss]
    if (/^\d{8,14}$/.test(d)) {
      const year = Number(d.slice(0, 4));
      const month = Number(d.slice(4, 6)) - 1;
      const day = Number(d.slice(6, 8));
      const hh = Number(d.slice(8, 10) || '0');
      const mm = Number(d.slice(10, 12) || '0');
      const ss = Number(d.slice(12, 14) || '0');
      return new Date(year, month, day, hh, mm, ss).getTime();
    }
    const t = Date.parse(d);
    return isNaN(t) ? null : t;
  }

  const filteredRows = useMemo(() => {
    const start = fromDate ? new Date(fromDate + 'T00:00:00').getTime() : null;
    const end = toDate ? new Date(toDate + 'T23:59:59').getTime() : null;
    if (!start && !end) return lisResults;
    return lisResults.filter(r => {
      const t = parseDateLike(r.collected);
      if (t == null) return false;
      if (start && t < start) return false;
      if (end && t > end) return false;
      return true;
    });
  }, [lisResults, fromDate, toDate]);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pagedRows = useMemo(() => {
    const from = (page - 1) * pageSize;
    return filteredRows.slice(from, from + pageSize);
  }, [filteredRows, page]);

  // Reset page when filters or data change
  useEffect(() => {
    setPage(1);
  }, [fromDate, toDate, reports.length]);

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
        <Card className="border-none shadow-md bg-gradient-to-tr from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
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
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>

        <Card className="shadow-sm">
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
        </Card>

        {/* LIS Data Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>LIS Results</CardTitle>
                <CardDescription>Recent laboratory results from LIS</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-9 rounded-md border px-2 text-sm bg-background"
                  aria-label="From date"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-9 rounded-md border px-2 text-sm bg-background"
                  aria-label="To date"
                />
                <Button variant="ghost" size="sm" onClick={() => { setFromDate(''); setToDate(''); }}>Clear</Button>
                <Button size="sm" onClick={fetchReports} disabled={loading}>
                  {loading ? <span className="opacity-70">Refreshing...</span> : 'Refresh'}
                </Button>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sample ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Collected</TableHead>
                  <TableHead className="text-right">Result</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.map((row) => (
                  <TableRow key={row.sampleId}>
                    <TableCell className="font-medium">{row.sampleId}</TableCell>
                    <TableCell>{row.patient}</TableCell>
                    <TableCell>{row.test}</TableCell>
                    <TableCell>
                      {row.status === 'Completed' && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                          Completed
                        </Badge>
                      )}
                      {row.status === 'Pending' && (
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-200 dark:border-slate-700">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{row.collected}</TableCell>
                    <TableCell className="text-right">{row.result}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                        onClick={() => setLocation(`/dashboard/reports?id=${encodeURIComponent(row.id || row.sampleId)}`)}
                      >
                        Open Result
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
