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
import { Receipt, CheckCircle, XCircle, Eye, RefreshCw, Search, Filter, Upload, Download, AlertTriangle, FileText } from 'lucide-react';

interface ReimbursementClaim {
  id: number;
  user_id: number;
  employee_name: string;
  claim_type: 'Medical' | 'Travel' | 'Food' | 'Internet' | 'Other';
  amount: number;
  description: string;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  submitted_at: string;
  reviewed_at?: string;
  approved_amount?: number;
  reviewer_notes?: string;
  payment_date?: string;
}

export default function AdminReimbursementsManagement() {
  const router = useRouter();
  const getToken = () => localStorage.getItem('token');

  const [reimbursements, setReimbursements] = useState<ReimbursementClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState<ReimbursementClaim | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [approvedAmount, setApprovedAmount] = useState(0);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    fetchReimbursements();
  }, []);

  const fetchReimbursements = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/finance/reimbursements', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setReimbursements(data);
        } else {
          toast.error('Invalid reimbursements data format');
        }
      } else {
        const errorData = await response.json();
        toast.error(`Reimbursements fetch failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('Failed to fetch reimbursements data');
    } finally {
      setLoading(false);
    }
  };

  const filteredReimbursements = reimbursements.filter(claim => {
    const matchesSearch = claim.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.user_id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    const matchesType = typeFilter === 'all' || claim.claim_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleReviewClaim = (claim: ReimbursementClaim, action: 'approve' | 'reject') => {
    setSelectedClaim(claim);
    setReviewAction(action);
    setReviewNotes('');
    setApprovedAmount(claim.amount);
    setShowReviewDialog(true);
  };

  const submitReview = async () => {
    if (!selectedClaim) return;

    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      const response = await fetch(`/api/admin/finance/reimbursements/${selectedClaim.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: reviewAction,
          approved_amount: reviewAction === 'approve' ? approvedAmount : 0,
          notes: reviewNotes
        })
      });

      if (response.ok) {
        toast.success(`Reimbursement claim ${reviewAction}d successfully`);
        fetchReimbursements();
        setShowReviewDialog(false);
        setSelectedClaim(null);
      } else {
        toast.error(`Failed to ${reviewAction} reimbursement claim`);
      }
    } catch (error) {
      toast.error(`Error ${reviewAction}ing reimbursement claim`);
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
      const response = await fetch('/api/admin/finance/reimbursements/export', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reimbursements_report.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Reimbursements report exported successfully');
      } else {
        toast.error('Failed to export reimbursements report');
      }
    } catch (error) {
      toast.error('Error exporting reimbursements report');
    }
  };

  const handleMarkAsPaid = async (claimId: number) => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      const response = await fetch(`/api/admin/finance/reimbursements/${claimId}/mark-paid`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Reimbursement marked as paid');
        fetchReimbursements();
      } else {
        toast.error('Failed to mark as paid');
      }
    } catch (error) {
      toast.error('Error marking reimbursement as paid');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading reimbursements...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reimbursements</h1>
            <p className="text-red-100 mt-2">Approve/reject reimbursement claims</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleBulkExport} className="flex items-center gap-2 bg-white text-red-600 hover:bg-gray-100">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button onClick={fetchReimbursements} variant="outline" className="flex items-center gap-2 border-white text-white hover:bg-white hover:text-red-600">
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
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Medical">Medical</SelectItem>
                <SelectItem value="Travel">Travel</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Internet">Internet</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reimbursements Table */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Reimbursement Claims ({filteredReimbursements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Approved Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReimbursements.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{claim.employee_name || `Employee ${claim.user_id}`}</div>
                      <div className="text-sm text-gray-500">ID: {claim.user_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{claim.claim_type}</Badge>
                  </TableCell>
                  <TableCell>₹{claim.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    {claim.approved_amount ? `₹${claim.approved_amount.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      claim.status === 'approved' ? 'default' :
                      claim.status === 'rejected' ? 'destructive' :
                      claim.status === 'paid' ? 'secondary' : 'outline'
                    }>
                      {claim.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(claim.submitted_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{claim.documents.length} files</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setSelectedClaim(claim)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {claim.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleReviewClaim(claim, 'approve')}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReviewClaim(claim, 'reject')}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {claim.status === 'approved' && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(claim.id)}>
                          <Receipt className="h-4 w-4" />
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

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Reimbursement Claim
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {reviewAction === 'approve' && (
              <div>
                <label className="block text-sm font-medium mb-2">Approved Amount</label>
                <Input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(Number(e.target.value))}
                  placeholder="Enter approved amount"
                />
              </div>
            )}
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

      {/* Claim Details Dialog */}
      <Dialog open={!!selectedClaim && !showReviewDialog} onOpenChange={() => setSelectedClaim(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reimbursement Claim Details</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Employee Information</h3>
                  <p>Name: {selectedClaim.employee_name}</p>
                  <p>ID: {selectedClaim.user_id}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Claim Details</h3>
                  <p>Type: {selectedClaim.claim_type}</p>
                  <p>Amount: ₹{selectedClaim.amount.toLocaleString()}</p>
                  {selectedClaim.approved_amount && (
                    <p>Approved Amount: ₹{selectedClaim.approved_amount.toLocaleString()}</p>
                  )}
                  <p>Status: <Badge variant={
                    selectedClaim.status === 'approved' ? 'default' :
                    selectedClaim.status === 'rejected' ? 'destructive' :
                    selectedClaim.status === 'paid' ? 'secondary' : 'outline'
                  }>{selectedClaim.status}</Badge></p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Description</h3>
                <p className="text-sm bg-gray-50 p-2 rounded">{selectedClaim.description}</p>
              </div>
              <div>
                <h3 className="font-semibold">Documents</h3>
                <div className="space-y-2">
                  {selectedClaim.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{doc.split('/').pop()}</span>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadDocument(doc, doc.split('/').pop() || 'document')}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              {selectedClaim.reviewer_notes && (
                <div>
                  <h3 className="font-semibold">Review Notes</h3>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedClaim.reviewer_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-900">{reimbursements.length}</div>
            <p className="text-sm text-blue-600">Total Claims</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-900">
              {reimbursements.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-sm text-yellow-600">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-900">
              {reimbursements.filter(r => r.status === 'approved').length}
            </div>
            <p className="text-sm text-green-600">Approved</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-900">
              {reimbursements.filter(r => r.status === 'rejected').length}
            </div>
            <p className="text-sm text-red-600">Rejected</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-900">
              {reimbursements.filter(r => r.status === 'paid').length}
            </div>
            <p className="text-sm text-purple-600">Paid</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
