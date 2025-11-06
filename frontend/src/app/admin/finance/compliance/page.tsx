'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Shield, FileText, Download, RefreshCw, Search, Filter, AlertTriangle, CheckCircle, Calendar, TrendingUp } from 'lucide-react';

interface ComplianceReport {
  id: number;
  report_type: 'PF' | 'TDS' | 'ESI' | 'Professional Tax';
  period: string;
  status: 'generated' | 'submitted' | 'approved' | 'rejected';
  generated_at: string;
  submitted_at?: string;
  approved_at?: string;
  total_employees: number;
  total_amount: number;
  file_url?: string;
  remarks?: string;
}

interface ComplianceStats {
  pf_pending: number;
  tds_pending: number;
  esi_pending: number;
  professional_tax_pending: number;
  total_reports: number;
  overdue_reports: number;
}

export default function AdminComplianceManagement() {
  const router = useRouter();
  const getToken = () => localStorage.getItem('token');

  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [stats, setStats] = useState<ComplianceStats>({
    pf_pending: 0,
    tds_pending: 0,
    esi_pending: 0,
    professional_tax_pending: 0,
    total_reports: 0,
    overdue_reports: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const [reportsResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/finance/compliance/reports', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/admin/finance/compliance/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        if (Array.isArray(reportsData)) {
          setReports(reportsData);
        }
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (!reportsResponse.ok && !statsResponse.ok) {
        toast.error('Failed to fetch compliance data');
      }
    } catch (error) {
      toast.error('Error fetching compliance data');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.report_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.period.toLowerCase().includes(searchTerm);
    const matchesType = typeFilter === 'all' || report.report_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleGenerateReport = async (reportType: string, period: string) => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      const response = await fetch('/api/admin/finance/compliance/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ report_type: reportType, period })
      });

      if (response.ok) {
        toast.success(`${reportType} report generated successfully`);
        fetchComplianceData();
      } else {
        toast.error(`Failed to generate ${reportType} report`);
      }
    } catch (error) {
      toast.error(`Error generating ${reportType} report`);
    }
  };

  const handleDownloadReport = async (reportId: number) => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      const response = await fetch(`/api/admin/finance/compliance/download/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance_report_${reportId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Report downloaded successfully');
      } else {
        toast.error('Failed to download report');
      }
    } catch (error) {
      toast.error('Error downloading report');
    }
  };

  const handleSubmitReport = async (reportId: number) => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      const response = await fetch(`/api/admin/finance/compliance/submit/${reportId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Report submitted successfully');
        fetchComplianceData();
      } else {
        toast.error('Failed to submit report');
      }
    } catch (error) {
      toast.error('Error submitting report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'secondary';
      case 'submitted': return 'default';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading compliance data...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Compliance</h1>
            <p className="text-indigo-100 mt-2">PF, TDS, ESI, and professional tax reports</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchComplianceData} className="flex items-center gap-2 bg-white text-indigo-600 hover:bg-gray-100">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">PF Pending</CardTitle>
            <Shield className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{stats.pf_pending}</div>
            <p className="text-xs text-red-600 mt-1">Reports due</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">TDS Pending</CardTitle>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats.tds_pending}</div>
            <p className="text-xs text-blue-600 mt-1">Reports due</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">ESI Pending</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{stats.esi_pending}</div>
            <p className="text-xs text-green-600 mt-1">Reports due</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Overdue</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{stats.overdue_reports}</div>
            <p className="text-xs text-orange-600 mt-1">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Generate New Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => handleGenerateReport('PF', new Date().toISOString().slice(0, 7))}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Shield className="h-4 w-4" />
              Generate PF Report
            </Button>
            <Button
              onClick={() => handleGenerateReport('TDS', new Date().toISOString().slice(0, 7))}
              className="flex items-center gap-2"
              variant="outline"
            >
              <FileText className="h-4 w-4" />
              Generate TDS Report
            </Button>
            <Button
              onClick={() => handleGenerateReport('ESI', new Date().toISOString().slice(0, 7))}
              className="flex items-center gap-2"
              variant="outline"
            >
              <TrendingUp className="h-4 w-4" />
              Generate ESI Report
            </Button>
            <Button
              onClick={() => handleGenerateReport('Professional Tax', new Date().toISOString().slice(0, 7))}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Calendar className="h-4 w-4" />
              Generate Professional Tax
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by report type or period..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PF">PF</SelectItem>
                <SelectItem value="TDS">TDS</SelectItem>
                <SelectItem value="ESI">ESI</SelectItem>
                <SelectItem value="Professional Tax">Professional Tax</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Compliance Reports ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Badge variant="outline">{report.report_type}</Badge>
                  </TableCell>
                  <TableCell>{report.period}</TableCell>
                  <TableCell>{report.total_employees}</TableCell>
                  <TableCell>₹{report.total_amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(report.generated_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setSelectedReport(report)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadReport(report.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      {report.status === 'generated' && (
                        <Button size="sm" variant="outline" onClick={() => handleSubmitReport(report.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compliance Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Report Information</h3>
                  <p>Type: {selectedReport.report_type}</p>
                  <p>Period: {selectedReport.period}</p>
                  <p>Status: <Badge variant={getStatusColor(selectedReport.status)}>{selectedReport.status}</Badge></p>
                </div>
                <div>
                  <h3 className="font-semibold">Statistics</h3>
                  <p>Total Employees: {selectedReport.total_employees}</p>
                  <p>Total Amount: ₹{selectedReport.total_amount.toLocaleString()}</p>
                  <p>Generated: {new Date(selectedReport.generated_at).toLocaleDateString()}</p>
                </div>
              </div>
              {selectedReport.submitted_at && (
                <div>
                  <h3 className="font-semibold">Submission Details</h3>
                  <p>Submitted: {new Date(selectedReport.submitted_at).toLocaleDateString()}</p>
                  {selectedReport.approved_at && (
                    <p>Approved: {new Date(selectedReport.approved_at).toLocaleDateString()}</p>
                  )}
                </div>
              )}
              {selectedReport.remarks && (
                <div>
                  <h3 className="font-semibold">Remarks</h3>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedReport.remarks}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
