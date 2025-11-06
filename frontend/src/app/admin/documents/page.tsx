'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Download,
  Upload,
  Eye,
  Trash2,
  Search,
  Filter,
  Plus,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  ChevronRight,
  X,
} from 'lucide-react';

interface Employee {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  onboardingStatus: string;
  onboardingStep: number;
  createdAt: string;
  photo?: string;
  onboardingData: any;
}

interface EmployeeDetails {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  onboarding_status: string;
  onboarding_step: number;
  createdAt: string;
  photo?: string;
  onboardingData: any;
  documents: Array<{
    id: number;
    type: string;
    name: string;
    path: string;
    url: string;
    uploadedAt: string;
    status: string;
    approvedAt?: string;
    remarks?: string;
  }>;
}

export default function AdminDocuments() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin');
    if (!token || isAdmin !== 'true') {
      router.push('/signin');
      return;
    }
    fetchEmployees();
  }, [router]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees);
      } else {
        console.error('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeDetails = async (employeeId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/documents/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const employeeDetails = await response.json();
        setSelectedEmployee(employeeDetails);
        setShowDetails(true);
      } else {
        console.error('Failed to fetch employee details');
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        // Refresh employee details
        if (selectedEmployee) {
          fetchEmployeeDetails(selectedEmployee.id);
        }
      } else {
        alert('Failed to delete document');
      }
    } catch (error) {
      alert('Error deleting document');
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || employee.onboardingStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETE':
        return 'bg-green-600';
      case 'IN_PROGRESS':
        return 'bg-yellow-600';
      case 'NOT_STARTED':
        return 'bg-gray-600';
      default:
        return 'bg-slate-600';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'jpg':
      case 'png':
        return '🖼️';
      default:
        return '📄';
    }
  };

  const renderOnboardingData = (data: any) => {
    if (!data || Object.keys(data).length === 0) return null;

    return (
      <div className="space-y-4">
        {Object.entries(data).map(([step, stepData]: [string, any]) => (
          <div key={step} className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2 capitalize">{step.replace('step', 'Step ')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(stepData).map(([key, value]: [string, any]) => (
                <div key={key} className="text-sm">
                  <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                  <span className="text-white">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-white text-2xl font-bold">Employee Document Management</h1>
        <button
          onClick={() => router.push('/admin/documents/upload')}
          className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded"
        >
          <Plus className="w-5 h-5" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="flex space-x-4 mb-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded bg-slate-800 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 text-white border border-slate-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <option value="all">All Status</option>
          <option value="COMPLETE">Complete</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="NOT_STARTED">Not Started</option>
        </select>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-400">
              No employees found.
            </div>
          )}
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 cursor-pointer hover:bg-slate-700/50 transition-colors"
              onClick={() => fetchEmployeeDetails(employee.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{employee.fullName}</h3>
                    <p className="text-slate-400 text-sm truncate">{employee.email}</p>
                    <p className="text-slate-400 text-sm">{employee.phone}</p>
                    <p className="text-slate-500 text-xs">{employee.position}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(employee.onboardingStatus)}`}>
                  {employee.onboardingStatus.replace('_', ' ')}
                </span>
                <span className="text-slate-500 text-xs">
                  Step {employee.onboardingStep}/5
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Details Modal */}
      {showDetails && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-2xl font-bold">{selectedEmployee.fullName}</h2>
                    <p className="text-slate-400">{selectedEmployee.position}</p>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-medium mt-2 ${getStatusColor(selectedEmployee.onboarding_status)}`}>
                      {selectedEmployee.onboarding_status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Employee Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span className="text-white">{selectedEmployee.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <span className="text-white">{selectedEmployee.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-slate-400" />
                    <span className="text-white">{selectedEmployee.position}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span className="text-white">{new Date(selectedEmployee.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-sm">
                    <span className="text-slate-400">Onboarding Progress: </span>
                    <span className="text-white">Step {selectedEmployee.onboarding_step}/5</span>
                  </div>
                  {selectedEmployee.photo && (
                    <div>
                      <span className="text-slate-400 text-sm">Profile Photo:</span>
                      <img src={selectedEmployee.photo} alt="Profile" className="w-20 h-20 rounded-lg mt-2 object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Onboarding Data */}
              {selectedEmployee.onboardingData && Object.keys(selectedEmployee.onboardingData).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-white text-xl font-bold mb-4">Onboarding Information</h3>
                  {renderOnboardingData(selectedEmployee.onboardingData)}
                </div>
              )}

              {/* Documents */}
              <div>
                <h3 className="text-white text-xl font-bold mb-4">Uploaded Documents</h3>
                {selectedEmployee.documents.length === 0 ? (
                  <p className="text-slate-400">No documents uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEmployee.documents.map((doc) => (
                      <div key={doc.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{getFileIcon(doc.type)}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate">{doc.name}</h4>
                            <p className="text-slate-400 text-sm capitalize">{doc.type}</p>
                            <p className="text-slate-500 text-xs">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                            <p className="text-slate-500 text-xs">Status: {doc.status}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => window.open(doc.url, '_blank')}
                            className="flex-1 flex items-center justify-center space-x-1 bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => window.open(doc.url, '_blank')}
                            className="flex-1 flex items-center justify-center space-x-1 bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded text-sm"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-2 bg-red-700 hover:bg-red-600 text-white rounded"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
