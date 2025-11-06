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
import { Download, Upload, Eye, Edit, Plus, RefreshCw, Search, Filter, IndianRupee, ArrowLeft, FileSpreadsheet, Users, Building, Calendar } from 'lucide-react';

interface PayrollRecord {
  id: number;
  user_id: number;
  employee_name: string;
  department: string;
  branch: string;
  payroll_month: string;
  basic_salary: number;
  total_earnings: number;
  total_deductions: number;
  net_salary: number;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_date?: string;
  lop_days: number;
  overtime_hours: number;
  auto_generated: boolean;
  payslip_generated: boolean;
  email_sent: boolean;
  sms_sent: boolean;
}

export default function AdminPayrollManagement() {
  const router = useRouter();
  const getToken = () => localStorage.getItem('token');

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/finance/payroll-history', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setPayrollRecords(data);
        } else {
          toast.error('Invalid payroll data format');
        }
      } else {
        const errorData = await response.json();
        toast.error(`Payroll fetch failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('Failed to fetch payroll data');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayrolls = payrollRecords.filter(record => {
    const matchesSearch = record.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.user_id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || record.payment_status === statusFilter;
    const matchesMonth = monthFilter === 'all' || record.payroll_month === monthFilter;
    const matchesDepartment = departmentFilter === 'all' || record.department === departmentFilter;
    const matchesBranch = branchFilter === 'all' || record.branch === branchFilter;
    return matchesSearch && matchesStatus && matchesMonth && matchesDepartment && matchesBranch;
  });

  const handleGeneratePayroll = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      const response = await fetch('/api/admin/finance/payroll-history/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ month: new Date().toISOString().slice(0, 7) })
      });

      if (response.ok) {
        toast.success('Payroll generated successfully');
        fetchPayrolls();
      } else {
        toast.error('Failed to generate payroll');
      }
    } catch (error) {
      toast.error('Error generating payroll');
    }
  };

  const handleEditPayroll = (id: number) => {
    // Navigate to edit page or open modal
    toast.info('Edit functionality coming soon');
  };

  const handleViewPayroll = (id: number) => {
    // Navigate to detailed view
    toast.info('View functionality coming soon');
  };

  const handleDownloadPayslip = (id: number) => {
    // Download payslip
    toast.info('Download functionality coming soon');
  };

  const handleBulkExport = async (format: 'xlsx' | 'csv') => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      const response = await fetch(`/api/admin/finance/payrolls/export?format=${format}&status=${statusFilter}&month=${monthFilter}&department=${departmentFilter}&branch=${branchFilter}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payrolls_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Payrolls exported as ${format.toUpperCase()}`);
      } else {
        toast.error('Failed to export payrolls');
      }
    } catch (error) {
      toast.error('Error exporting payrolls');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading payroll data...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 space-y-6">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          onClick={() => router.push('/admin/finance')}
          variant="outline"
          className="flex items-center gap-2 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Finance Dashboard
        </Button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Payroll Management</h1>
            <p className="text-green-100 mt-2">Create, edit, and view payrolls</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGeneratePayroll} className="flex items-center gap-2 bg-white text-green-600 hover:bg-gray-100">
              <RefreshCw className="h-4 w-4" />
              Generate Auto Payroll
            </Button>
            <Button onClick={() => router.push('/admin/finance/manual-entry')} className="flex items-center gap-2 bg-white text-green-600 hover:bg-gray-100">
              <Plus className="h-4 w-4" />
              Manual Entry
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 border-white text-white hover:bg-white hover:text-green-600">
                  <FileSpreadsheet className="h-4 w-4" />
                  Export
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Payroll Data</DialogTitle>
                </DialogHeader>
                <div className="flex gap-4">
                  <Button onClick={() => handleBulkExport('xlsx')} className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Export as Excel
                  </Button>
                  <Button onClick={() => handleBulkExport('csv')} variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export as CSV
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
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
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
              </SelectContent>
            </Select>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="Head Office">Head Office</SelectItem>
                <SelectItem value="Branch 1">Branch 1</SelectItem>
                <SelectItem value="Branch 2">Branch 2</SelectItem>
                <SelectItem value="Branch 3">Branch 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Payroll Records ({filteredPayrolls.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Total Earnings</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>LOP Days</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayrolls.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.employee_name || `Employee ${record.user_id}`}</div>
                      <div className="text-sm text-gray-500">ID: {record.user_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{record.payroll_month}</TableCell>
                  <TableCell>
                    <Badge variant={record.auto_generated ? 'secondary' : 'default'}>
                      {record.auto_generated ? 'Auto' : 'Manual'}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{(record.basic_salary || 0).toLocaleString()}</TableCell>
                  <TableCell>₹{(record.total_earnings || 0).toLocaleString()}</TableCell>
                  <TableCell>₹{(record.total_deductions || 0).toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">₹{(record.net_salary || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      record.payment_status === 'paid' ? 'default' :
                      record.payment_status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {record.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.lop_days}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleViewPayroll(record.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditPayroll(record.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {record.payslip_generated && (
                        <Button size="sm" variant="outline" onClick={() => handleDownloadPayslip(record.id)}>
                          <Download className="h-4 w-4" />
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-900">{payrollRecords.length}</div>
            <p className="text-sm text-blue-600">Total Payrolls</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-900">
              {payrollRecords.filter(p => p.payment_status === 'paid').length}
            </div>
            <p className="text-sm text-green-600">Paid Payrolls</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-900">
              {payrollRecords.filter(p => p.payment_status === 'pending').length}
            </div>
            <p className="text-sm text-orange-600">Pending Payrolls</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-900">
              ₹{payrollRecords.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + (p.net_salary || 0), 0).toLocaleString()}
            </div>
            <p className="text-sm text-purple-600">Total Paid Amount</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
