'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, Receipt, TrendingUp, Users, IndianRupee, Settings, Shield, Activity, Plus, RefreshCw, FileSpreadsheet, Eye } from 'lucide-react';

export default function AdminFinanceDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <h1 className="text-3xl font-bold">Finance Dashboard</h1>
        <p className="text-blue-100 mt-2">Manage payroll, payslips, taxes, reimbursements, compliance, and employee sync — all in real time.</p>
      </div>

      {/* Top Filter Bar */}
      <Card className="bg-white shadow-lg mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Department:</span>
                <select className="px-3 py-1 border rounded-md text-sm">
                  <option>All Departments</option>
                  <option>IT</option>
                  <option>HR</option>
                  <option>Finance</option>
                  <option>Marketing</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Branch:</span>
                <select className="px-3 py-1 border rounded-md text-sm">
                  <option>All Branches</option>
                  <option>Bangalore</option>
                  <option>Mumbai</option>
                  <option>Delhi</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Pay Cycle:</span>
                <select className="px-3 py-1 border rounded-md text-sm">
                  <option>Monthly</option>
                  <option>Weekly</option>
                  <option>Bi-weekly</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Export XLSX
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white shadow-lg mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="flex items-center gap-2 h-auto p-4" onClick={() => router.push('/admin/finance/manual-entry')}>
              <Plus className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Manual Payroll</div>
                <div className="text-xs opacity-80">Select employee → Input details → Save</div>
              </div>
            </Button>
            <Button variant="outline" className="flex items-center gap-2 h-auto p-4" onClick={() => router.push('/admin/finance/payrolls')}>
              <RefreshCw className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Auto Generate</div>
                <div className="text-xs opacity-80">Auto-calculates payroll using attendance</div>
              </div>
            </Button>
            <Button variant="outline" className="flex items-center gap-2 h-auto p-4" onClick={() => router.push('/admin/finance/tax')}>
              <Eye className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Tax Review</div>
                <div className="text-xs opacity-80">View pending declarations</div>
              </div>
            </Button>
            <Button variant="outline" className="flex items-center gap-2 h-auto p-4" onClick={() => router.push('/admin/finance/reimbursements')}>
              <Receipt className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Reimbursements</div>
                <div className="text-xs opacity-80">View pending claims</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Structure (Modules & Pages) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/admin/finance/overview')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Overview</CardTitle>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Stats, graphs, employee count, total payroll, salary trends</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/admin/finance/payrolls')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Payroll Management</CardTitle>
            <IndianRupee className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Manual + Auto payroll generation, edit, approve</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/admin/finance/payslips')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Payslip Management</CardTitle>
            <FileText className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-orange-600">Generate, send, edit, delete, and download payslips</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/admin/finance/tax')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-700">Tax Management</CardTitle>
            <Receipt className="h-5 w-5 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-cyan-600">Review & approve tax declarations</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/admin/finance/reimbursements')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Reimbursements</CardTitle>
            <Receipt className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-600">Approve/reject reimbursement claims</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/admin/finance/compliance')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700">Compliance</CardTitle>
            <Shield className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-indigo-600">PF, TDS, ESI, PT monthly compliance reports</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/admin/finance/audit')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Audit & Logs</CardTitle>
            <Activity className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Tracks all payroll actions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/admin/finance/settings')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Settings</CardTitle>
            <Settings className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-yellow-600">Pay cycle, salary templates, notification setup</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/admin/finance/manual-entry')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Manual Entry</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-purple-600">Individual salary entry system</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
