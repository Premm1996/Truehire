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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { FileText, CheckCircle, XCircle, Eye, RefreshCw, Search, Filter, Upload, Download, AlertTriangle } from 'lucide-react';

interface TaxDeclaration {
  id: number;
  user_id: number;
  employee_name: string;
  tax_year: string;
  declaration_type: '80C' | '80D' | 'HRA' | 'LTA' | 'Other';
  amount: number;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewer_notes?: string;
}

export default function AdminTaxManagement() {
  const router = useRouter();
  const getToken = () => localStorage.getItem('token');

  const [taxDeclarations, setTaxDeclarations] = useState<TaxDeclaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [selectedDeclaration, setSelectedDeclaration] = useState<TaxDeclaration | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    fetchTaxDeclarations();
  }, []);

  const fetchTaxDeclarations = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/finance/tax-declarations', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setTaxDeclarations(data);
        } else {
          toast.error('Invalid tax declarations data format');
        }
      } else {
        const errorData = await response.json();
        toast.error(`Tax declarations fetch failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('Failed to fetch tax declarations data');
    } finally {
      setLoading(false);
    }
  };

  const filteredDeclarations = taxDeclarations.filter(declaration => {
    const matchesSearch = declaration.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         declaration.user_id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || declaration.status === statusFilter;
    const matchesYear = yearFilter === 'all' || declaration.tax_year === yearFilter;
    return matchesSearch && matchesStatus && matchesYear;
  });

  const handleReviewDeclaration = (declaration: TaxDeclaration, action: 'approve' | 'reject') => {
    setSelectedDeclaration(declaration);
    setReviewAction(action);
    setReviewNotes('');
    setShowReviewDialog(true);
  };

  const submitReview = async () => {
    if (!selectedDeclaration) return;

    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      const response = await fetch(`/api/admin/finance/tax-declarations/${selectedDeclaration.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: reviewAction,
          notes: reviewNotes
        })
      });

      if (response.ok) {
        toast.success(`Tax declaration ${reviewAction}d successfully`);
        fetchTaxDeclarations();
        setShowReviewDialog(false);
        setSelectedDeclaration(null);
      } else {
        toast.error(`Failed to ${reviewAction} tax declaration`);
      }
    } catch (error) {
      toast.error(`Error ${reviewAction}ing tax declaration`);
    }
  };

  const handleDownloadDocument = async (documentUrl: string, fileName: string) => {
    try {
      const response = await fetch(documentUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handleBulkExport = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      const response = await fetch('/api/admin/finance/tax-declarations/export', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tax_declarations_report.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Tax declarations report exported successfully');
      } else {
        toast.error('Failed to export tax declarations report');
      }
    } catch (error) {
      toast.error('Error exporting tax declarations report');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading tax declarations...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tax Management</h1>
            <p className="text-cyan-100 mt-2">Manage and verify employee tax declarations</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleBulkExport} className="flex items-center gap-2 bg-white text-cyan-600 hover:bg-gray-100">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button onClick={fetchTaxDeclarations} variant="outline" className="flex items-center gap-2 border-white text-white hover:bg-white hover:text-cyan-600">
              <RefreshCw className="h-4 w-4" />
              Refresh
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tax Declarations Table */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Tax Declarations ({filteredDeclarations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Tax Year</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeclarations.map((declaration) => (
                <TableRow key={declaration.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{declaration.employee_name || `Employee ${declaration.user_id}`}</div>
                      <div className="text-sm text-gray-500">ID: {declaration.user_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{declaration.tax_year}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{declaration.declaration_type}</Badge>
                  </TableCell>
                  <TableCell>₹{declaration.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      declaration.status === 'approved' ? 'default' :
                      declaration.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {declaration.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(declaration.submitted_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{declaration.documents.length} files</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setSelectedDeclaration(declaration)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {declaration.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleReviewDeclaration(declaration, 'approve')}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReviewDeclaration(declaration, 'reject')}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Tax Declaration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Review Notes</label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes for the employee..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button onClick={submitReview}>
                {reviewAction === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Declaration Details Dialog */}
      <Dialog open={!!selectedDeclaration && !showReviewDialog} onOpenChange={() => setSelectedDeclaration(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tax Declaration Details</DialogTitle>
          </DialogHeader>
          {selectedDeclaration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Employee Information</h3>
                  <p>Name: {selectedDeclaration.employee_name}</p>
                  <p>ID: {selectedDeclaration.user_id}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Declaration Details</h3>
                  <p>Year: {selectedDeclaration.tax_year}</p>
                  <p>Type: {selectedDeclaration.declaration_type}</p>
                  <p>Amount: ₹{selectedDeclaration.amount.toLocaleString()}</p>
                  <p>Status: <Badge variant={
                    selectedDeclaration.status === 'approved' ? 'default' :
                    selectedDeclaration.status === 'rejected' ? 'destructive' : 'secondary'
                  }>{selectedDeclaration.status}</Badge></p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Documents</h3>
                <div className="space-y-2">
                  {selectedDeclaration.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{doc.split('/').pop()}</span>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadDocument(doc, doc.split('/').pop() || 'document')}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              {selectedDeclaration.reviewer_notes && (
                <div>
                  <h3 className="font-semibold">Review Notes</h3>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedDeclaration.reviewer_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-900">{taxDeclarations.length}</div>
            <p className="text-sm text-blue-600">Total Declarations</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-900">
              {taxDeclarations.filter(d => d.status === 'pending').length}
            </div>
            <p className="text-sm text-yellow-600">Pending Review</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-900">
              {taxDeclarations.filter(d => d.status === 'approved').length}
            </div>
            <p className="text-sm text-green-600">Approved</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-900">
              {taxDeclarations.filter(d => d.status === 'rejected').length}
            </div>
            <p className="text-sm text-red-600">Rejected</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
