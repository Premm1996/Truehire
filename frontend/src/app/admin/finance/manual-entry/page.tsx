'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calculator, Save, Eye, RefreshCw, AlertCircle, CheckCircle, Users, ArrowLeft } from 'lucide-react';

interface Employee {
  id: number;
  fullName: string;
  email: string;
  department: string;
  designation: string;
}

interface SalaryComponents {
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
}

export default function AdminManualPayrollEntry() {
  const router = useRouter();
  const getToken = () => localStorage.getItem('token');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [salaryData, setSalaryData] = useState<SalaryComponents>({
    basic: 0,
    hra: 0,
    conveyance: 0,
    medical: 0,
    lta: 0,
    special_allowance: 0,
    other_allowances: 0,
    total_earnings: 0,
    provident_fund: 0,
    professional_tax: 0,
    income_tax: 0,
    other_deductions: 0,
    total_deductions: 0,
    net_salary: 0
  });

  const [payrollMonth, setPayrollMonth] = useState(new Date().toISOString().slice(0, 7));
  const [lopDays, setLopDays] = useState(0);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [salaryData.basic, salaryData.hra, salaryData.conveyance, salaryData.medical, salaryData.lta, salaryData.special_allowance, salaryData.other_allowances, salaryData.provident_fund, salaryData.professional_tax, salaryData.income_tax, salaryData.other_deductions]);

  const fetchEmployees = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/employees', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      } else {
        toast.error('Failed to fetch employees');
      }
    } catch (error) {
      toast.error('Error fetching employees');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const earnings = salaryData.basic + salaryData.hra + salaryData.conveyance +
                    salaryData.medical + salaryData.lta + salaryData.special_allowance +
                    salaryData.other_allowances;

    const deductions = salaryData.provident_fund + salaryData.professional_tax +
                      salaryData.income_tax + salaryData.other_deductions;

    const net = earnings - deductions;

    setSalaryData(prev => ({
      ...prev,
      total_earnings: earnings,
      total_deductions: deductions,
      net_salary: net
    }));
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp.id.toString() === employeeId);
    setSelectedEmployee(employee || null);

    if (employee) {
      // Load existing salary structure if available
      loadEmployeeSalary(employee.id);
    }
  };

  const loadEmployeeSalary = async (employeeId: number) => {
    try {
      const token = getToken();
      const response = await fetch(`/api/admin/finance/salary-structure/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSalaryData(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      // Employee might not have salary structure yet, that's okay
    }
  };

  const handleSave = async () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        user_id: selectedEmployee.id,
        payroll_month: payrollMonth,
        ...salaryData,
        lop_days: lopDays,
        overtime_hours: overtimeHours,
        notes,
        auto_generated: false
      };

      const response = await fetch('/api/admin/finance/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Payroll entry saved successfully');
        // Reset form or navigate
        setSelectedEmployee(null);
        setSalaryData({
          basic: 0, hra: 0, conveyance: 0, medical: 0, lta: 0, special_allowance: 0, other_allowances: 0,
          total_earnings: 0, provident_fund: 0, professional_tax: 0, income_tax: 0, other_deductions: 0,
          total_deductions: 0, net_salary: 0
        });
        setLopDays(0);
        setOvertimeHours(0);
        setNotes('');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to save: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('Error saving payroll entry');
    } finally {
      setSaving(false);
    }
  };

  const updateSalaryField = (field: keyof SalaryComponents, value: number) => {
    setSalaryData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading employees...</div>;
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Manual Payroll Entry</h1>
            <p className="text-purple-100 mt-2">Individual salary entry system</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setPreviewMode(!previewMode)} variant="outline" className="flex items-center gap-2 border-white text-white hover:bg-white hover:text-purple-600">
              <Eye className="h-4 w-4" />
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </Button>
            <Button onClick={() => router.push('/admin/finance/payrolls')} variant="outline" className="flex items-center gap-2 border-white text-white hover:bg-white hover:text-purple-600">
              <Users className="h-4 w-4" />
              View All Payrolls
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Selection */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Employee Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="employee">Select Employee</Label>
              <Select onValueChange={handleEmployeeSelect} disabled={previewMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.fullName} - {employee.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEmployee && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold">{selectedEmployee.fullName}</h3>
                <p className="text-sm text-gray-600">{selectedEmployee.designation}</p>
                <p className="text-sm text-gray-600">{selectedEmployee.department}</p>
                <p className="text-sm text-gray-600">{selectedEmployee.email}</p>
              </div>
            )}

            <div>
              <Label htmlFor="month">Payroll Month</Label>
              <Input
                id="month"
                type="month"
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(e.target.value)}
                disabled={previewMode}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lop">LOP Days</Label>
                <Input
                  id="lop"
                  type="number"
                  value={lopDays}
                  onChange={(e) => setLopDays(Number(e.target.value))}
                  disabled={previewMode}
                />
              </div>
              <div>
                <Label htmlFor="overtime">Overtime Hours</Label>
                <Input
                  id="overtime"
                  type="number"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(Number(e.target.value))}
                  disabled={previewMode}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                disabled={previewMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Salary Components */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Salary Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="basic">Basic Salary</Label>
                <Input
                  id="basic"
                  type="number"
                  value={salaryData.basic}
                  onChange={(e) => updateSalaryField('basic', Number(e.target.value))}
                  disabled={previewMode}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hra">HRA</Label>
                  <Input
                    id="hra"
                    type="number"
                    value={salaryData.hra}
                    onChange={(e) => updateSalaryField('hra', Number(e.target.value))}
                    disabled={previewMode}
                  />
                </div>
                <div>
                  <Label htmlFor="conveyance">Conveyance</Label>
                  <Input
                    id="conveyance"
                    type="number"
                    value={salaryData.conveyance}
                    onChange={(e) => updateSalaryField('conveyance', Number(e.target.value))}
                    disabled={previewMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="medical">Medical</Label>
                  <Input
                    id="medical"
                    type="number"
                    value={salaryData.medical}
                    onChange={(e) => updateSalaryField('medical', Number(e.target.value))}
                    disabled={previewMode}
                  />
                </div>
                <div>
                  <Label htmlFor="lta">LTA</Label>
                  <Input
                    id="lta"
                    type="number"
                    value={salaryData.lta}
                    onChange={(e) => updateSalaryField('lta', Number(e.target.value))}
                    disabled={previewMode}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="special_allowance">Special Allowance</Label>
                <Input
                  id="special_allowance"
                  type="number"
                  value={salaryData.special_allowance}
                  onChange={(e) => updateSalaryField('special_allowance', Number(e.target.value))}
                  disabled={previewMode}
                />
              </div>

              <div>
                <Label htmlFor="other_allowances">Other Allowances</Label>
                <Input
                  id="other_allowances"
                  type="number"
                  value={salaryData.other_allowances}
                  onChange={(e) => updateSalaryField('other_allowances', Number(e.target.value))}
                  disabled={previewMode}
                />
              </div>

              <hr />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provident_fund">Provident Fund</Label>
                  <Input
                    id="provident_fund"
                    type="number"
                    value={salaryData.provident_fund}
                    onChange={(e) => updateSalaryField('provident_fund', Number(e.target.value))}
                    disabled={previewMode}
                  />
                </div>
                <div>
                  <Label htmlFor="professional_tax">Professional Tax</Label>
                  <Input
                    id="professional_tax"
                    type="number"
                    value={salaryData.professional_tax}
                    onChange={(e) => updateSalaryField('professional_tax', Number(e.target.value))}
                    disabled={previewMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="income_tax">Income Tax</Label>
                  <Input
                    id="income_tax"
                    type="number"
                    value={salaryData.income_tax}
                    onChange={(e) => updateSalaryField('income_tax', Number(e.target.value))}
                    disabled={previewMode}
                  />
                </div>
                <div>
                  <Label htmlFor="other_deductions">Other Deductions</Label>
                  <Input
                    id="other_deductions"
                    type="number"
                    value={salaryData.other_deductions}
                    onChange={(e) => updateSalaryField('other_deductions', Number(e.target.value))}
                    disabled={previewMode}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview/Summary */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Salary Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Earnings:</span>
                <span className="font-semibold text-green-600">₹{salaryData.total_earnings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Deductions:</span>
                <span className="font-semibold text-red-600">₹{salaryData.total_deductions.toLocaleString()}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Net Salary:</span>
                <span className={`font-bold ${salaryData.net_salary >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{salaryData.net_salary.toLocaleString()}
                </span>
              </div>
            </div>

            {salaryData.net_salary < 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-red-700">Negative net salary detected. Please review deductions.</span>
              </div>
            )}

            <div className="space-y-2">
              <Badge variant="outline" className="w-full justify-center">
                Manual Entry
              </Badge>
              {lopDays > 0 && (
                <Badge variant="destructive" className="w-full justify-center">
                  LOP: {lopDays} days
                </Badge>
              )}
              {overtimeHours > 0 && (
                <Badge variant="secondary" className="w-full justify-center">
                  Overtime: {overtimeHours} hours
                </Badge>
              )}
            </div>

            <div className="pt-4 space-y-2">
              {!previewMode ? (
                <Button onClick={handleSave} disabled={saving || !selectedEmployee} className="w-full">
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Payroll Entry
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-green-700">Preview mode - Switch to edit mode to make changes</span>
                </div>
              )}

              <Button variant="outline" onClick={() => router.push('/admin/finance/payrolls')} className="w-full">
                View All Payrolls
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
