'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Users, IndianRupee, FileText, Receipt, TrendingUp, RefreshCw, BarChart3, PieChart, Calendar, ArrowLeft, FileSpreadsheet, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AnalyticsData {
  totalEmployees: number;
  activePayrolls: number;
  totalPayouts: number;
  pendingReimbursements: number;
  salaryDistribution: { range: string; count: number }[];
  payrollStatus: { status: string; count: number }[];
  monthlyTrends: { month: string; amount: number; employees: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminFinanceOverview() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalEmployees: 0,
    activePayrolls: 0,
    totalPayouts: 0,
    pendingReimbursements: 0,
    salaryDistribution: [],
    payrollStatus: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/finance/analytics?range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        toast.error('Failed to fetch analytics data');
      }
    } catch (error) {
      toast.error('Error fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchAnalytics();
  };

  const handleExport = async (format: 'pdf' | 'xlsx' | 'csv') => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      const response = await fetch(`/api/admin/finance/analytics/export?format=${format}&range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance_analytics_${timeRange}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Analytics exported as ${format.toUpperCase()}`);
      } else {
        toast.error('Failed to export analytics');
      }
    } catch (error) {
      toast.error('Error exporting analytics');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading analytics...</div>;
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Finance Overview</h1>
            <p className="text-blue-100 mt-2">Analytics dashboard with salary trends and key metrics</p>
          </div>
          <div className="flex gap-4 items-center">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 bg-white text-blue-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
                <SelectItem value="2years">Last 2 Years</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={refreshData} className="flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <div className="flex gap-2">
              <Button onClick={() => handleExport('pdf')} variant="outline" size="sm" className="bg-white text-blue-600 hover:bg-gray-100">
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <Button onClick={() => handleExport('xlsx')} variant="outline" size="sm" className="bg-white text-blue-600 hover:bg-gray-100">
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                XLSX
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Employees</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{analytics.totalEmployees}</div>
            <p className="text-xs text-blue-600 mt-1">Active workforce</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Active Payrolls</CardTitle>
            <IndianRupee className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{analytics.activePayrolls}</div>
            <p className="text-xs text-green-600 mt-1">Current month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Payouts</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">₹{(analytics.totalPayouts || 0).toLocaleString()}</div>
            <p className="text-xs text-purple-600 mt-1">In selected period</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Pending Reimbursements</CardTitle>
            <Receipt className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{analytics.pendingReimbursements}</div>
            <p className="text-xs text-orange-600 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Distribution Bar Chart */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Salary Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.salaryDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payroll Status Pie Chart */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Payroll Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={analytics.payrollStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.payrollStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends Line Chart */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Payroll Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analytics.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="amount" fill="#8884d8" name="Total Amount (₹)" />
              <Line yAxisId="right" type="monotone" dataKey="employees" stroke="#82ca9d" strokeWidth={2} name="Employee Count" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button className="flex items-center gap-2" onClick={() => router.push('/admin/finance/payrolls')}>
              <RefreshCw className="h-4 w-4" />
              Generate Payroll
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => handleExport('xlsx')}>
              <FileText className="h-4 w-4" />
              Export Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => router.push('/admin/finance/reimbursements')}>
              <Receipt className="h-4 w-4" />
              View Reimbursements
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => router.push('/admin/finance/tax')}>
              <FileText className="h-4 w-4" />
              Tax Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
