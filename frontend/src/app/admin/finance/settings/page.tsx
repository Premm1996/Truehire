'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Settings, Save, RefreshCw, Mail, Bell, FileText, Calendar, IndianRupee, Shield } from 'lucide-react';

interface FinanceSettings {
  payCycle: {
    type: 'monthly' | 'weekly' | 'bi-weekly';
    startDay: number;
    endDay: number;
  };
  notifications: {
    emailPayrollGenerated: boolean;
    emailPayslipSent: boolean;
    emailReimbursementApproved: boolean;
    smsPayrollGenerated: boolean;
    smsPayslipSent: boolean;
  };
  templates: {
    payslipTemplate: string;
    emailTemplate: string;
    smsTemplate: string;
  };
  compliance: {
    autoGeneratePF: boolean;
    autoGenerateTDS: boolean;
    autoGenerateESI: boolean;
    autoSubmitReports: boolean;
  };
  salary: {
    defaultLOP: number;
    overtimeRate: number;
    maxLOPPerMonth: number;
  };
}

export default function AdminFinanceSettings() {
  const router = useRouter();
  const getToken = () => localStorage.getItem('token');

  const [settings, setSettings] = useState<FinanceSettings>({
    payCycle: {
      type: 'monthly',
      startDay: 1,
      endDay: 31
    },
    notifications: {
      emailPayrollGenerated: true,
      emailPayslipSent: true,
      emailReimbursementApproved: true,
      smsPayrollGenerated: false,
      smsPayslipSent: false
    },
    templates: {
      payslipTemplate: '',
      emailTemplate: '',
      smsTemplate: ''
    },
    compliance: {
      autoGeneratePF: true,
      autoGenerateTDS: true,
      autoGenerateESI: true,
      autoSubmitReports: false
    },
    salary: {
      defaultLOP: 0,
      overtimeRate: 1.5,
      maxLOPPerMonth: 30
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/finance/settings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data }));
      } else {
        // Settings might not exist yet, use defaults
        console.log('Using default settings');
      }
    } catch (error) {
      console.log('Using default settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in again');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/admin/finance/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof FinanceSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateNestedSetting = (section: keyof FinanceSettings, subsection: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [field]: value
        }
      }
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading settings...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Finance Settings</h1>
            <p className="text-yellow-100 mt-2">Pay cycle, notifications, templates</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchSettings} variant="outline" className="flex items-center gap-2 border-white text-white hover:bg-white hover:text-yellow-600">
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleSaveSettings} className="flex items-center gap-2 bg-white text-yellow-600 hover:bg-gray-100" disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="paycycle" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="paycycle" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Pay Cycle
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            Salary Rules
          </TabsTrigger>
        </TabsList>

        {/* Pay Cycle Settings */}
        <TabsContent value="paycycle">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Pay Cycle Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="payCycleType">Pay Cycle Type</Label>
                  <Select
                    value={settings.payCycle.type}
                    onValueChange={(value) => updateSetting('payCycle', 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startDay">Pay Period Start Day</Label>
                  <Input
                    id="startDay"
                    type="number"
                    min="1"
                    max="31"
                    value={settings.payCycle.startDay}
                    onChange={(e) => updateSetting('payCycle', 'startDay', Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="endDay">Pay Period End Day</Label>
                  <Input
                    id="endDay"
                    type="number"
                    min="1"
                    max="31"
                    value={settings.payCycle.endDay}
                    onChange={(e) => updateSetting('payCycle', 'endDay', Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailPayroll">Payroll Generated</Label>
                    <Switch
                      id="emailPayroll"
                      checked={settings.notifications.emailPayrollGenerated}
                      onCheckedChange={(checked) => updateSetting('notifications', 'emailPayrollGenerated', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailPayslip">Payslip Sent</Label>
                    <Switch
                      id="emailPayslip"
                      checked={settings.notifications.emailPayslipSent}
                      onCheckedChange={(checked) => updateSetting('notifications', 'emailPayslipSent', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailReimbursement">Reimbursement Approved</Label>
                    <Switch
                      id="emailReimbursement"
                      checked={settings.notifications.emailReimbursementApproved}
                      onCheckedChange={(checked) => updateSetting('notifications', 'emailReimbursementApproved', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">SMS Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="smsPayroll">Payroll Generated</Label>
                    <Switch
                      id="smsPayroll"
                      checked={settings.notifications.smsPayrollGenerated}
                      onCheckedChange={(checked) => updateSetting('notifications', 'smsPayrollGenerated', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="smsPayslip">Payslip Sent</Label>
                    <Switch
                      id="smsPayslip"
                      checked={settings.notifications.smsPayslipSent}
                      onCheckedChange={(checked) => updateSetting('notifications', 'smsPayslipSent', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Settings */}
        <TabsContent value="templates">
          <div className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Payslip Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.templates.payslipTemplate}
                  onChange={(e) => updateSetting('templates', 'payslipTemplate', e.target.value)}
                  placeholder="Enter payslip template HTML..."
                  rows={10}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Use placeholders like &lbrace;&lbrace;employee_name&rbrace;&rbrace;, &lbrace;&lbrace;net_salary&rbrace;&rbrace;, &lbrace;&lbrace;payroll_month&rbrace;&rbrace;, etc.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.templates.emailTemplate}
                  onChange={(e) => updateSetting('templates', 'emailTemplate', e.target.value)}
                  placeholder="Enter email template..."
                  rows={8}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Use placeholders like &lbrace;&lbrace;employee_name&rbrace;&rbrace;, &lbrace;&lbrace;subject&rbrace;&rbrace;, &lbrace;&lbrace;message&rbrace;&rbrace;, etc.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  SMS Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.templates.smsTemplate}
                  onChange={(e) => updateSetting('templates', 'smsTemplate', e.target.value)}
                  placeholder="Enter SMS template..."
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Keep it concise. Use placeholders like &lbrace;&lbrace;employee_name&rbrace;&rbrace;, &lbrace;&lbrace;amount&rbrace;&rbrace;, etc.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Settings */}
        <TabsContent value="compliance">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Automation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Auto-Generate Reports</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoPF">Provident Fund (PF) Reports</Label>
                    <Switch
                      id="autoPF"
                      checked={settings.compliance.autoGeneratePF}
                      onCheckedChange={(checked) => updateSetting('compliance', 'autoGeneratePF', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoTDS">Tax Deducted at Source (TDS) Reports</Label>
                    <Switch
                      id="autoTDS"
                      checked={settings.compliance.autoGenerateTDS}
                      onCheckedChange={(checked) => updateSetting('compliance', 'autoGenerateTDS', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoESI">Employee State Insurance (ESI) Reports</Label>
                    <Switch
                      id="autoESI"
                      checked={settings.compliance.autoGenerateESI}
                      onCheckedChange={(checked) => updateSetting('compliance', 'autoGenerateESI', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Submission Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoSubmit">Auto-submit generated reports</Label>
                    <Switch
                      id="autoSubmit"
                      checked={settings.compliance.autoSubmitReports}
                      onCheckedChange={(checked) => updateSetting('compliance', 'autoSubmitReports', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salary Rules Settings */}
        <TabsContent value="salary">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Salary Calculation Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="defaultLOP">Default LOP Rate (%)</Label>
                  <Input
                    id="defaultLOP"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.salary.defaultLOP}
                    onChange={(e) => updateSetting('salary', 'defaultLOP', Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="overtimeRate">Overtime Rate (multiplier)</Label>
                  <Input
                    id="overtimeRate"
                    type="number"
                    min="1"
                    step="0.1"
                    value={settings.salary.overtimeRate}
                    onChange={(e) => updateSetting('salary', 'overtimeRate', Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="maxLOP">Max LOP Days per Month</Label>
                  <Input
                    id="maxLOP"
                    type="number"
                    min="0"
                    max="31"
                    value={settings.salary.maxLOPPerMonth}
                    onChange={(e) => updateSetting('salary', 'maxLOPPerMonth', Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
