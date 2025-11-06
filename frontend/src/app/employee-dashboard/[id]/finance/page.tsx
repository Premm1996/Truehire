'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Download, Upload, Plus, Eye, RefreshCw, Bell, AlertCircle, CheckCircle, FileText, Calendar, TrendingUp } from 'lucide-react';

interface SalaryStructure {
  id: number;
  user_id: number;
  basic: number;
  hra: number;
  conveyance: number;
  medical: number;
  lta: number;
  special_allowance: number;
  other_allowances: number;
  total_earnings: number;
  provident_fund: number;
  professional_tax: number;
  income_tax: number;
  other_deductions: number;
  total_deductions: number;
  net_salary: number;
  effective_from: string;
}

interface PayrollRecord {
  id: number;
  user_id: number;
  payroll_month: string;
  basic_salary: number;
  total_earnings: number;
  total_deductions: number;
  net_salary: number;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_date?: string;
  lop_days: number;
  overtime_hours: number;
  payslip_generated: boolean;
  auto_generated: boolean;
}

interface TaxDeclaration {
  id: number;
  user_id: number;
  financial_year: string;
  total_income: number;
  taxable_income: number;
  tax_payable: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submitted_at?: string;
  documents?: string[];
}

interface Reimbursement {
  id: number;
  user_id: number;
  category: string;
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  submitted_date: string;
  payment_date?: string;
  rejection_reason?: string;
}

interface PayslipRecord {
  id: number;
  payroll_id: number;
  payroll_month: string;
  file_url: string;
  generated_at: string;
  downloaded_at?: string;
}

export default function EmployeeFinanceHub() {
  const params = useParams();
  const employeeId = params?.id as string;

  if (!employeeId) {
    return <div className="flex justify-center items-center h-64">Invalid employee ID</div>;
  }

  const [salaryStructure, setSalaryStructure] = useState<SalaryStructure | null>(null);
  const [payrollHistory, setPayrollHistory] = useState<PayrollRecord[]>([]);
  const [taxDeclarations, setTaxDeclarations] = useState<TaxDeclaration[]>([]);
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [payslips, setPayslips] = useState<PayslipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('salary');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`
    };

    try {
      const [salaryRes, payrollRes, taxRes, reimbursementRes, payslipRes] = await Promise.all([
        fetch('/api/finance/salary-structure', { headers }),
        fetch('/api/finance/payroll-history', { headers }),
        fetch('/api/finance/tax-declarations', { headers }),
        fetch('/api/finance/reimbursements', { headers }),
        fetch('/api/finance/payslips', { headers })
      ]);

      const salaryData = salaryRes.ok ? await salaryRes.json() : null;
      const payrollData = payrollRes.ok ? await payrollRes.json() : [];
      const taxData = taxRes.ok ? await taxRes.json() : [];
      const reimbursementData = reimbursementRes.ok ? await reimbursementRes.json() : [];
      const payslipData = payslipRes.ok ? await payslipRes.json() : [];

      setSalaryStructure(salaryData);
      setPayrollHistory(payrollData);
      setTaxDeclarations(taxData);
      setReimbursements(reimbursementData);
      setPayslips(payslipData);
      setLastUpdate(new Date());

      // Show update notification if not first load
      if (lastUpdate.getTime() !== new Date().getTime()) {
        toast.success('Data updated', { duration: 2000 });
      }
    } catch (error) {
      toast.error('Failed to fetch finance data');
    } finally {
      setLoading(false);
    }
  }, [lastUpdate]);

  useEffect(() => {
    fetchData();
    // Set up live sync polling every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [employeeId, fetchData]);

  const handleSubmitReimbursement = async (formData: FormData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      const data = {
        category: formData.get('category'),
        amount: parseFloat(formData.get('amount') as string),
        description: formData.get('description'),
        documents: [] // Handle file uploads separately
      };

      const response = await fetch('/api/finance/reimbursements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Reimbursement submitted successfully');
        fetchData();
      } else {
        toast.error('Failed to submit reimbursement');
      }
    } catch (error) {
      toast.error('Error submitting reimbursement');
    }
  };

  const handleSubmitTaxDeclaration = async (formData: FormData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      const files = formData.getAll('documents') as File[];
      const documents: string[] = [];

      // Upload files first if any
      if (files.length > 0) {
        for (const file of files) {
          const fileFormData = new FormData();
          fileFormData.append('file', file);
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fileFormData
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            documents.push(uploadData.url);
          }
        }
      }

      const data = {
        financial_year: formData.get('financial_year'),
        total_income: parseFloat(formData.get('total_income') as string),
        taxable_income: parseFloat(formData.get('taxable_income') as string),
        tax_payable: parseFloat(formData.get('tax_payable') as string),
        documents
      };

      const response = await fetch('/api/finance/tax-declarations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Tax declaration submitted successfully');
        fetchData();
      } else {
        toast.error('Failed to submit tax declaration');
      }
    } catch (error) {
      toast.error('Error submitting tax declaration');
    }
  };

  const handleDownloadPayslip = async (payslip: PayslipRecord) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/finance/payslips/${payslip.id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payslip-${payslip.payroll_month}.pdf`;
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

  const handleViewPayroll = (payroll: PayrollRecord) => {
    setSelectedPayroll(payroll);
    setViewModalOpen(true);
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Finance Hub</h1>
      </div>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="salary">Salary Structure</TabsTrigger>
          <TabsTrigger value="payroll">Payroll History</TabsTrigger>
          <TabsTrigger value="payslips">Payslips</TabsTrigger>
          <TabsTrigger value="tax">Tax Declarations</TabsTrigger>
          <TabsTrigger value="reimbursements">Reimbursements</TabsTrigger>
        </TabsList>

        <TabsContent value="salary" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Salary Structure</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Manual Badge
              </Badge>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          {salaryStructure ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Earnings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span className="font-semibold">₹{(salaryStructure.basic || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HRA</span>
                    <span className="font-semibold">₹{(salaryStructure.hra || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conveyance</span>
                    <span className="font-semibold">₹{(salaryStructure.conveyance || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical Allowance</span>
                    <span className="font-semibold">₹{(salaryStructure.medical || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LTA</span>
                    <span className="font-semibold">₹{(salaryStructure.lta || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Special Allowance</span>
                    <span className="font-semibold">₹{(salaryStructure.special_allowance || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Allowances</span>
                    <span className="font-semibold">₹{(salaryStructure.other_allowances || 0).toLocaleString()}</span>
                  </div>
                  <hr className="border-green-300" />
                  <div className="flex justify-between font-bold text-green-800">
                    <span>Total Earnings</span>
                    <span>₹{(salaryStructure.total_earnings || 0).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-800">Deductions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Provident Fund</span>
                    <span className="font-semibold">₹{(salaryStructure.provident_fund || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional Tax</span>
                    <span className="font-semibold">₹{(salaryStructure.professional_tax || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Income Tax</span>
                    <span className="font-semibold">₹{(salaryStructure.income_tax || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Deductions</span>
                    <span className="font-semibold">₹{(salaryStructure.other_deductions || 0).toLocaleString()}</span>
                  </div>
                  <hr className="border-red-300" />
                  <div className="flex justify-between font-bold text-red-800">
                    <span>Total Deductions</span>
                    <span>₹{(salaryStructure.total_deductions || 0).toLocaleString()}</span>
                  </div>
                  <hr className="border-red-300" />
                  <div className="flex justify-between font-bold text-lg text-blue-800">
                    <span>Net Salary</span>
                    <span>₹{(salaryStructure.net_salary || 0).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Salary structure not available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Payroll History</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Source: Auto/Manual
              </Badge>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
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
              {(payrollHistory || []).map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.payroll_month}</TableCell>
                  <TableCell>
                    <Badge variant={record.auto_generated ? 'secondary' : 'default'}>
                      {record.auto_generated ? 'Auto' : 'Manual'}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{(record.basic_salary || 0).toLocaleString()}</TableCell>
                  <TableCell>₹{(record.total_earnings || 0).toLocaleString()}</TableCell>
                  <TableCell>₹{(record.total_deductions || 0).toLocaleString()}</TableCell>
                  <TableCell>₹{(record.net_salary || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={record.payment_status === 'paid' ? 'default' : record.payment_status === 'pending' ? 'secondary' : 'destructive'}>
                      {record.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.lop_days}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {record.payslip_generated && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleViewPayroll(record)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="payslips" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Payslips</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {payslips.length} Available
              </Badge>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payroll Month</TableHead>
                <TableHead>Generated At</TableHead>
                <TableHead>Downloaded At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(payslips || []).map((payslip) => (
                <TableRow key={payslip.id}>
                  <TableCell>{payslip.payroll_month}</TableCell>
                  <TableCell>{new Date(payslip.generated_at).toLocaleDateString()}</TableCell>
                  <TableCell>{payslip.downloaded_at ? new Date(payslip.downloaded_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {payslips.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payslips available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Tax Declarations</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Declaration
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Submit Tax Declaration</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  handleSubmitTaxDeclaration(formData);
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="financial_year">Financial Year</Label>
                    <Select name="financial_year" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023-24">2023-24</SelectItem>
                        <SelectItem value="2024-25">2024-25</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="total_income">Total Income</Label>
                    <Input name="total_income" type="number" required />
                  </div>
                  <div>
                    <Label htmlFor="taxable_income">Taxable Income</Label>
                    <Input name="taxable_income" type="number" required />
                  </div>
                  <div>
                    <Label htmlFor="tax_payable">Tax Payable</Label>
                    <Input name="tax_payable" type="number" required />
                  </div>
                  <div>
                    <Label htmlFor="documents">Documents</Label>
                    <Input name="documents" type="file" multiple />
                  </div>
                  <Button type="submit" className="w-full">Submit</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Financial Year</TableHead>
                <TableHead>Total Income</TableHead>
                <TableHead>Taxable Income</TableHead>
                <TableHead>Tax Payable</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(taxDeclarations || []).map((declaration) => (
                <TableRow key={declaration.id}>
                  <TableCell>{declaration.financial_year}</TableCell>
                  <TableCell>₹{(declaration.total_income || 0).toLocaleString()}</TableCell>
                  <TableCell>₹{(declaration.taxable_income || 0).toLocaleString()}</TableCell>
                  <TableCell>₹{(declaration.tax_payable || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      declaration.status === 'approved' ? 'default' :
                      declaration.status === 'submitted' ? 'secondary' :
                      declaration.status === 'rejected' ? 'destructive' : 'outline'
                    }>
                      {declaration.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{declaration.submitted_at ? new Date(declaration.submitted_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="reimbursements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Reimbursements</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Reimbursement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Submit Reimbursement</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  handleSubmitReimbursement(formData);
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="conveyance">Conveyance</SelectItem>
                        <SelectItem value="telephone">Telephone</SelectItem>
                        <SelectItem value="laptop">Laptop</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input name="amount" type="number" step="0.01" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea name="description" required />
                  </div>
                  <div>
                    <Label htmlFor="documents">Documents</Label>
                    <Input name="documents" type="file" multiple />
                  </div>
                  <Button type="submit" className="w-full">Submit</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(reimbursements || []).map((reimbursement) => (
                <TableRow key={reimbursement.id}>
                  <TableCell>{reimbursement.category}</TableCell>
                  <TableCell>₹{(reimbursement.amount || 0).toLocaleString()}</TableCell>
                  <TableCell>{reimbursement.description}</TableCell>
                  <TableCell>
                    <Badge variant={
                      reimbursement.status === 'paid' ? 'default' :
                      reimbursement.status === 'approved' ? 'secondary' :
                      reimbursement.status === 'rejected' ? 'destructive' : 'outline'
                    }>
                      {reimbursement.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(reimbursement.submitted_date).toLocaleDateString()}</TableCell>
                  <TableCell>{reimbursement.payment_date ? new Date(reimbursement.payment_date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {/* View Payroll Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payroll Details - {selectedPayroll?.payroll_month}</DialogTitle>
          </DialogHeader>
          {selectedPayroll && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Payroll Month</Label>
                  <p className="text-sm text-gray-600">{selectedPayroll.payroll_month}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Source</Label>
                  <Badge variant={selectedPayroll.auto_generated ? 'secondary' : 'default'}>
                    {selectedPayroll.auto_generated ? 'Auto' : 'Manual'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Payment Status</Label>
                  <Badge variant={selectedPayroll.payment_status === 'paid' ? 'default' : selectedPayroll.payment_status === 'pending' ? 'secondary' : 'destructive'}>
                    {selectedPayroll.payment_status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Payment Date</Label>
                  <p className="text-sm text-gray-600">{selectedPayroll.payment_date ? new Date(selectedPayroll.payment_date).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">LOP Days</Label>
                  <p className="text-sm text-gray-600">{selectedPayroll.lop_days}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Overtime Hours</Label>
                  <p className="text-sm text-gray-600">{selectedPayroll.overtime_hours}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800 text-lg">Earnings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Basic Salary</span>
                      <span className="font-semibold">₹{(selectedPayroll.basic_salary || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Earnings</span>
                      <span className="font-semibold">₹{(selectedPayroll.total_earnings || 0).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-800 text-lg">Deductions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Deductions</span>
                      <span className="font-semibold">₹{(selectedPayroll.total_deductions || 0).toLocaleString()}</span>
                    </div>
                    <hr className="border-red-300" />
                    <div className="flex justify-between font-bold text-lg text-blue-800">
                      <span>Net Salary</span>
                      <span>₹{(selectedPayroll.net_salary || 0).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
