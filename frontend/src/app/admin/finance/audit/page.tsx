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
import { Activity, Search, Filter, Download, RefreshCw, Eye, Calendar, User, FileText } from 'lucide-react';

interface AuditLog {
  id: number;
  user_id: number;
  employee_name: string;
  action: string;
  module: 'payroll' | 'payslip' | 'tax' | 'reimbursement' | 'compliance' | 'settings';
  details: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  status: 'success' | 'failed' | 'warning';
}

export default function AdminAuditLogs() {
  const router = useRouter();
  const getToken = () => localStorage.getItem('token');

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/finance/audit/logs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setAuditLogs(data);
        } else {
          toast.error('Invalid audit logs data format');
        }
      } else {
        const errorData = await response.json();
        toast.error(`Audit logs fetch failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('Failed to fetch audit logs data');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesDate = !dateFilter || log.timestamp.startsWith(dateFilter);
    return matchesSearch && matchesModule && matchesStatus && matchesDate;
  });

  const handleExportLogs = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      const response = await fetch('/api/admin/finance/audit/export', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Audit logs exported successfully');
      } else {
        toast.error('Failed to export audit logs');
      }
    } catch (error) {
      toast.error('Error exporting audit logs');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'failed': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'payroll': return 'bg-blue-100 text-blue-800';
      case 'payslip': return 'bg-green-100 text-green-800';
      case 'tax': return 'bg-purple-100 text-purple-800';
      case 'reimbursement': return 'bg-orange-100 text-orange-800';
      case 'compliance': return 'bg-red-100 text-red-800';
      case 'settings': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading audit logs...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-600 to-slate-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Audit & Logs</h1>
            <p className="text-gray-100 mt-2">Record of all finance actions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportLogs} className="flex items-center gap-2 bg-white text-gray-600 hover:bg-gray-100">
              <Download className="h-4 w-4" />
              Export Logs
            </Button>
            <Button onClick={fetchAuditLogs} variant="outline" className="flex items-center gap-2 border-white text-white hover:bg-white hover:text-gray-600">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-900">{auditLogs.length}</div>
            <p className="text-sm text-blue-600">Total Actions</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-900">
              {auditLogs.filter(log => log.status === 'success').length}
            </div>
            <p className="text-sm text-green-600">Successful Actions</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-900">
              {auditLogs.filter(log => log.status === 'failed').length}
            </div>
            <p className="text-sm text-red-600">Failed Actions</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-900">
              {auditLogs.filter(log => log.status === 'warning').length}
            </div>
            <p className="text-sm text-yellow-600">Warnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by employee, action, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="payroll">Payroll</SelectItem>
                <SelectItem value="payslip">Payslip</SelectItem>
                <SelectItem value="tax">Tax</SelectItem>
                <SelectItem value="reimbursement">Reimbursement</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Audit Logs ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                      <div className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.employee_name || `User ${log.user_id}`}</div>
                      <div className="text-sm text-gray-500">ID: {log.user_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getModuleColor(log.module)}>
                      {log.module}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={log.action}>
                    {log.action}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={log.details}>
                    {log.details}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setSelectedLog(log)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      User Information
                    </h3>
                    <div className="mt-2 space-y-1">
                      <p><span className="font-medium">Name:</span> {selectedLog.employee_name}</p>
                      <p><span className="font-medium">User ID:</span> {selectedLog.user_id}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Action Details
                    </h3>
                    <div className="mt-2 space-y-1">
                      <p><span className="font-medium">Module:</span> <Badge className={getModuleColor(selectedLog.module)}>{selectedLog.module}</Badge></p>
                      <p><span className="font-medium">Action:</span> {selectedLog.action}</p>
                      <p><span className="font-medium">Status:</span> <Badge variant={getStatusColor(selectedLog.status)}>{selectedLog.status}</Badge></p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Timestamp
                    </h3>
                    <div className="mt-2 space-y-1">
                      <p><span className="font-medium">Date:</span> {new Date(selectedLog.timestamp).toLocaleDateString()}</p>
                      <p><span className="font-medium">Time:</span> {new Date(selectedLog.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Technical Details
                    </h3>
                    <div className="mt-2 space-y-1">
                      <p><span className="font-medium">IP Address:</span> {selectedLog.ip_address}</p>
                      <p><span className="font-medium">User Agent:</span> <span className="text-sm break-all">{selectedLog.user_agent}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold">Action Details</h3>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedLog.details}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
