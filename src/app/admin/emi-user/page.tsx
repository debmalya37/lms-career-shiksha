'use client';

import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Trash2, 
  Calendar, 
  DollarSign, 
  User, 
  BookOpen, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Download
} from 'lucide-react';

interface EMIUser {
  _id: string;
  name: string;
  email: string;
  phoneNo?: string;
  purchaseHistory: {
    course: {
      _id: string;
      title: string;
    };
    amount: number;
    transactionId: string;
    purchasedAt: Date;
    isEMI: boolean;
    totalEMIMonths: number;
    monthsLeft: number;
    emiAmount: number;
    nextEMIDueDate: Date;
  }[];
}

export default function EMIAdminDashboard() {
  const [users, setUsers] = useState<EMIUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<EMIUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, overdue, upcoming
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockUsers: EMIUser[] = [
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phoneNo: '+1234567890',
          purchaseHistory: [
            {
              course: { _id: 'c1', title: 'Advanced React Development' },
              amount: 299,
              transactionId: 'TXN001',
              purchasedAt: new Date('2024-01-15'),
              isEMI: true,
              totalEMIMonths: 6,
              monthsLeft: 3,
              emiAmount: 49.83,
              nextEMIDueDate: new Date('2024-09-15')
            }
          ]
        },
        {
          _id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phoneNo: '+1987654321',
          purchaseHistory: [
            {
              course: { _id: 'c2', title: 'Full Stack JavaScript' },
              amount: 499,
              transactionId: 'TXN002',
              purchasedAt: new Date('2024-02-20'),
              isEMI: true,
              totalEMIMonths: 12,
              monthsLeft: 8,
              emiAmount: 41.58,
              nextEMIDueDate: new Date('2024-08-10')
            }
          ]
        },
        {
          _id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          phoneNo: '+1122334455',
          purchaseHistory: [
            {
              course: { _id: 'c3', title: 'Python for Data Science' },
              amount: 399,
              transactionId: 'TXN003',
              purchasedAt: new Date('2024-03-10'),
              isEMI: true,
              totalEMIMonths: 9,
              monthsLeft: 1,
              emiAmount: 44.33,
              nextEMIDueDate: new Date('2024-08-05')
            }
          ]
        }
      ];
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => {
        const emiCourses = user.purchaseHistory.filter(p => p.isEMI);
        return emiCourses.some(course => {
          const daysUntilDue = Math.ceil((new Date(course.nextEMIDueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          if (filterStatus === 'overdue') return daysUntilDue < 0;
          if (filterStatus === 'upcoming') return daysUntilDue >= 0 && daysUntilDue <= 7;
          return true;
        });
      });
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterStatus]);

  const handleCallUser = (phoneNo: string, userName: string) => {
    if (phoneNo) {
      window.open(`tel:${phoneNo}`, '_self');
    } else {
      alert(`No phone number available for ${userName}`);
    }
  };

  const handleRemoveCourse = async (userId: string, courseId: string, courseName: string) => {
    if (confirm(`Are you sure you want to remove "${courseName}" from this user's courses?`)) {
      try {
        // API call to remove course
        // await fetch(`/api/admin/users/${userId}/remove-course/${courseId}`, { method: 'DELETE' });
        
        // Update local state
        setUsers(prev => prev.map(user => {
          if (user._id === userId) {
            return {
              ...user,
              purchaseHistory: user.purchaseHistory.filter(p => p.course._id !== courseId)
            };
          }
          return user;
        }));
        
        alert('Course removed successfully!');
      } catch (error) {
        alert('Failed to remove course. Please try again.');
      }
    }
  };

  const getStatusBadge = (course: any) => {
    const daysUntilDue = Math.ceil((new Date(course.nextEMIDueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilDue < 0) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <AlertTriangle className="w-3 h-3 mr-1" />
        {Math.abs(daysUntilDue)} days overdue
      </span>;
    } else if (daysUntilDue <= 7) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Due in {daysUntilDue} days
      </span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        On track
      </span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">EMI Management Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Monitor and manage student EMI payments
                </p>
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total EMI Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overdue Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.purchaseHistory.some(p => p.isEMI && new Date(p.nextEMIDueDate) < new Date())).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total EMI Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${users.reduce((acc, user) => 
                    acc + user.purchaseHistory
                      .filter(p => p.isEMI)
                      .reduce((sum, p) => sum + (p.emiAmount * p.monthsLeft), 0), 0
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">EMI Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.reduce((acc, user) => acc + user.purchaseHistory.filter(p => p.isEMI).length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                title='Filter by status'
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="overdue">Overdue</option>
                  <option value="upcoming">Due Soon</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-6">
          {filteredUsers.map((user) => (
            <div key={user._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {user.phoneNo && (
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {user.phoneNo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* EMI Courses */}
                <div className="space-y-4">
                  {user.purchaseHistory
                    .filter(purchase => purchase.isEMI)
                    .map((purchase, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                              <h4 className="font-medium text-gray-900">{purchase.course.title}</h4>
                              {getStatusBadge(purchase)}
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Total Amount:</span>
                                <p className="font-medium">${purchase.amount}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">EMI Amount:</span>
                                <p className="font-medium">${purchase.emiAmount}/month</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Months Left:</span>
                                <p className="font-medium">{purchase.monthsLeft} of {purchase.totalEMIMonths}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Next Due:</span>
                                <p className="font-medium">
                                  {new Date(purchase.nextEMIDueDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCallUser(user.phoneNo || '', user.name)}
                              className="inline-flex items-center px-3 py-2 border border-green-300 text-sm font-medium rounded-lg text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Call
                            </button>
                            
                            <button
                              onClick={() => handleRemoveCourse(user._id, purchase.course._id, purchase.course.title)}
                              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No EMI users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter criteria.' : 'No users have EMI courses yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}