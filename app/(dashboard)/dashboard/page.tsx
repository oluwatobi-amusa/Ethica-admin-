'use client';

import React from 'react';
import { UserMinus, TrendingUp, Package } from 'lucide-react';
import { HiUsers } from 'react-icons/hi2';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChevronDown, TrendingDown } from 'lucide-react';

interface LocationData {
  name: string;
  users: number;
  color: string;
}

interface InflowOutflowData {
  month: string;
  inflow: number;
  outflow: number;
}

interface TotalUsersData {
  month: string;
  percentage: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const Overview: React.FC = () => {
  const metricsData = [
    {
      title: 'Completed KYC',
      value: 200,
      description: 'All users with completed KYC',
      percentageChange: 8.2,
      icon: HiUsers,
      variant: 'blue' as const
    },
    {
      title: 'Uncompleted KYC',
      value: 200,
      description: 'All users with uncompleted KYC',
      percentageChange: 8.2,
      icon: HiUsers,
      variant: 'red' as const
    },
    {
      title: 'Total User Pending',
      value: 200,
      description: 'All users pending verification',
      percentageChange: 8.2,
      icon: HiUsers,
      variant: 'orange' as const
    },
    {
      title: 'Inactive account',
      value: 200,
      percentageChange: -8.2,
      icon: UserMinus,
      variant: 'lightorange' as const
    },
    {
      title: 'Total Investment',
      value: '₦200,000,000',
      percentageChange: 8.2,
      icon: TrendingUp,
      variant: 'lightgreen' as const
    },
    {
      title: 'Total Products',
      value: 200,
      percentageChange: 8.2,
      icon: Package,
      variant: 'lightblue' as const
    }
  ];

  const locationData: LocationData[] = [
    { name: 'Lagos State', users: 12423, color: '#FFD93D' },
    { name: 'Kwara State', users: 9423, color: '#FF8C42' },
    { name: 'Ogun State', users: 6423, color: '#1E293B' },
    { name: 'Osun State', users: 3423, color: '#6366F1' }
  ];

  const inflowOutflowData: InflowOutflowData[] = [
    { month: 'April', inflow: 5000000, outflow: 2000000 },

    { month: 'May', inflow: 15000000, outflow: 8000000 },

    { month: 'June', inflow: 18000000, outflow: 10000000 }
  ];

  const totalUsersData: TotalUsersData[] = [
    { month: 'Jan', percentage: 8 },
    { month: 'Feb', percentage: 12 },
    { month: 'Mar', percentage: 25 },
    { month: 'Apr', percentage: 50 },
    { month: 'May', percentage: 35 },
    { month: 'Jun', percentage: 45 },
    { month: 'Jul', percentage: 55 },
    { month: 'Aug', percentage: 60 }
  ];

  const categoryData: CategoryData[] = [
    { name: 'Verified', value: 120, color: '#10B981' },
    { name: 'Not Verified', value: 80, color: '#F59E0B' }
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl  p-4 border-[#E2E4E9] border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-gray-900">Users by Distribution</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <span>By Location</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="w-64 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="users"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {locationData.map((location, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: location.color }}
                ></div>
                <div>
                  <div className="text-sm text-gray-600">{location.name}</div>
                  <div className="font-medium text-gray-900">{location.users.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl  p-4 border-[#E2E4E9] border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-gray-900">Total Inflow & Outflow</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <span>Months</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">06.05.2025</div>
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600">Inflow</span>
                </div>
                <span className="font-medium">₦ 4,500,000</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-gray-600">Outflow</span>
                </div>
                <span className="font-medium">₦ 1,400,000</span>
              </div>
            </div>
          </div>

          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={inflowOutflowData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis hide />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="outflow"
                  stackId="2"
                  stroke="#F97316"
                  fill="#F97316"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-medium">₦20,000,000</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <TrendingDown className="w-4 h-4" />
                <span>-1.5%</span>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Inflow</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span>Outflow</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl  p-4 border-[#E2E4E9] border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-gray-900">Total Users</h2>
            <div className="flex items-center gap-4">
              <button className="text-sm text-blue-600 hover:underline">See All User</button>
              <div className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <span>Month</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={totalUsersData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                  tickFormatter={(value) => `${value}%`}
                />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>+ 80% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl  p-4 border-[#E2E4E9] border">
          <h2 className="text-xl font-medium text-gray-900 mb-6">User by Categories</h2>

          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-3xl font-medium text-gray-900">200</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm text-gray-700">
                    {category.value} {category.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
