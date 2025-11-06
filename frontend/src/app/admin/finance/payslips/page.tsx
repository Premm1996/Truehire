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
import { Download, Mail, FileText, Eye, RefreshCw, Search, Filter, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface PayslipRecord {
  id: number;
  user_id: number;
  employee_name: string;
  payroll_month: string;
  net_salary: number;
  generated_at: string;
  sent_at?: string;
  downloaded_at?: string;
  email_sent: boolean;
  sms_sent: boolean;
  status: 'generated' | 'sent' | 'downloaded';
}

export default function AdminPayslipsManagement() {
  const router = useRouter();
  const getToken = () => localStorage.getItem('token');

  const [payslips, setPayslips] = useState<PayslipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipRecord | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/finance/payslips', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setPayslips(data);
        } else {
          toast.error('Invalid payslips data format');
        }
      } else {
        const errorData = await response.json();
        toast.error(`Payslips fetch failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('Failed to fetch payslips data');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayslips = payslips.filter(payslip => {
    const matchesSearch = payslip.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payslip.user_id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || payslip.status === statusFilter;
    const matchesMonth = monthFilter === 'all' || payslip.payroll_month === monthFilter;
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const handleGeneratePayslip = async (payrollId: number) => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      const response = await fetch(`/api/admin/finance/payslips/generate/${payrollId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Payslip generated successfully');
        fetchPayslips();
      } else {
        toast.error('Failed to generate payslip');
      }
    } catch (error) {
      toast.error('Error generating payslip');
    }
  };

  const handleSendPayslip = async (payslipId: number) => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      const response = await fetch(`/api/admin/finance/payslips/send/${payslipId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Payslip sent successfully');
        fetchPayslips();
      } else {
        toast.error('Failed to send payslip');
      }
    } catch (error) {
      toast.error('Error sending payslip');
    }
  };

  const handleDownloadPayslip = async (payslipId: number) => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      const response = await fetch(`/api/admin/finance/payslips/download/${payslipId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payslip_${payslipId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Payslip downloaded successfully');
      } else {
        toast.error('Failed to download payslip');
      }
    } catch (error) {
      toast.error('Error downloading payslip');
    }
  };

  const handlePreviewPayslip = (payslip: PayslipRecord) => {
    setSelectedPayslip(payslip);
    setShowPreview(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading payslips...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Payslips Management</h1>
            <p className="text-orange-100 mt-2">Generate, send, and download payslips</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchPayslips} className="flex items-center gap-2 bg-white text-orange-600 hover:bg-gray-100">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => router.push('/admin/finance/payrolls')} variant="outline" className="flex items-center gap-2 border-white text-white hover:bg-white hover:text-orange-600">
              <FileText className="h-4 w-4" />
              View Payrolls
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by employee name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="downloaded">Downloaded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value="2024-01">January 2024</SelectItem>
                <SelectItem value="2024-02">February 2024</SelectItem>
                <SelectItem value="2024-03">March 2024</SelectItem>
                <SelectItem value="2024-04">April 2024</SelectItem>
                <SelectItem value="2024-05">May 2024</SelectItem>
                <SelectItem value="2024-06">June 2024</SelectItem>
                <SelectItem value="2024-07">July 2024</SelectItem>
                <SelectItem value="2024-08">August 2024</SelectItem>
                <SelectItem value="2024-09">September 2024</SelectItem>
                <SelectItem value="2024-10">October 2024</SelectItem>
                <SelectItem value="2024-11">November 2024</SelectItem>
                <SelectItem value="2024-12">December 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payslips Table */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Payslips ({filteredPayslips.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayslips.map((payslip) => (
                <TableRow key={payslip.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payslip.employee_name || `Employee ${payslip.user_id}`}</div>
                      <div className="text-sm text-gray-500">ID: {payslip.user_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{payslip.payroll_month}</TableCell>
                  <TableCell>₹{(payslip.net_salary || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      payslip.status === 'generated' ? 'secondary' :
                      payslip.status === 'sent' ? 'default' : 'outline'
                    }>
                      {payslip.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{payslip.generated_at ? new Date(payslip.generated_at).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    {payslip.sent_at ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {new Date(payslip.sent_at).toLocaleDateString()}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                        Not sent
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handlePreviewPayslip(payslip)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadPayslip(payslip.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      {!payslip.email_sent && (
                        <Button size="sm" variant="outline" onClick={() => handleSendPayslip(payslip.id)}>
                          <Send className="h-4 w-4" />
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

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payslip Preview</DialogTitle>
          </DialogHeader>
          {selectedPayslip && (
            <div className="p-6 bg-white">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Payslip</h2>
                <p className="text-gray-600">Month: {selectedPayslip.payroll_month}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold">Employee Details</h3>
                  <p>Name: {selectedPayslip.employee_name}</p>
                  <p>ID: {selectedPayslip.user_id}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Salary Details</h3>
                  <p>Net Salary: ₹{selectedPayslip.net_salary.toLocaleString()}</p>
                  <p>Generated: {new Date(selectedPayslip.generated_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">This is a preview. Download for full PDF.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-900">{payslips.length}</div>
            <p className="text-sm text-blue-600">Total Payslips</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-900">
              {payslips.filter(p => p.status === 'generated').length}
            </div>
            <p className="text-sm text-green-600">Generated</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-900">
              {payslips.filter(p => p.email_sent).length}
            </div>
            <p className="text-sm text-orange-600">Sent via Email</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-900">
              {payslips.filter(p => p.downloaded_at).length}
            </div>
            <p className="text-sm text-purple-600">Downloaded</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
