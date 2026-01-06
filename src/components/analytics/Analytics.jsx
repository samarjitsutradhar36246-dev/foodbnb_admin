import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Users } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../Firebase";

// --- Sub-component for Number Animation ---
const AnimatedNumber = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);
  const numericValue = Number(value.replace(/[^0-9.-]+/g, ""));
  const suffix = value.replace(/[0-9.,-]+/g, "");
  const isPrefix = value.startsWith(suffix);

  useEffect(() => {
    let start = 0;
    const end = numericValue;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [numericValue, duration]);

  const formatted = count.toLocaleString(undefined, {
    maximumFractionDigits: numericValue % 1 === 0 ? 0 : 2,
  });

  return isPrefix ? `${suffix}${formatted}` : `${formatted}${suffix}`;
};

const Analytics = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [repeatCustomers, setRepeatCustomers] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [cancelledOrders, setCancelledOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [revenueData, setRevenueData] = useState([
    { month: "Dec", revenue: "₹0", orders: "0 orders", percentage: 0 },
    { month: "Jan", revenue: "₹0", orders: "0 orders", percentage: 0 },
    { month: "Feb", revenue: "₹0", orders: "0 orders", percentage: 0 },
    { month: "Mar", revenue: "₹0", orders: "0 orders", percentage: 0 },
    { month: "Apr", revenue: "₹0", orders: "0 orders", percentage: 0 },
    { month: "May", revenue: "₹0", orders: "0 orders", percentage: 0 },
  ]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchOrdersData = async () => {
    try {
      const ordersCollection = collection(db, "orders");
      const allOrdersSnapshot = await getDocs(ordersCollection);

      const monthData = {
        Dec: { delivered: 0, cancelled: 0, count: 0 },
        Jan: { delivered: 0, cancelled: 0, count: 0 },
        Feb: { delivered: 0, cancelled: 0, count: 0 },
        Mar: { delivered: 0, cancelled: 0, count: 0 },
        Apr: { delivered: 0, cancelled: 0, count: 0 },
        May: { delivered: 0, cancelled: 0, count: 0 },
      };

      let cancelledCount = 0;
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      allOrdersSnapshot.forEach((doc) => {
        const orderData = doc.data();
        const orderStatus = orderData.order_status;

        if (orderStatus === "cancelled") {
          cancelledCount++;
        }

        if (orderStatus !== "delivered" && orderStatus !== "cancelled") {
          return;
        }

        let totalPrice = 0;

        if (orderData.items && Array.isArray(orderData.items)) {
          orderData.items.forEach((item) => {
            const itemPrice = parseFloat(item.price) || 0;
            const itemQnt = parseFloat(item.qnt) || 1;
            totalPrice += itemPrice * itemQnt;
          });
        } else {
          Object.keys(orderData).forEach((key) => {
            if (!isNaN(key)) {
              const item = orderData[key];
              if (item && typeof item === "object") {
                const itemPrice = parseFloat(item.price) || 0;
                const itemQnt = parseFloat(item.qnt) || 1;
                totalPrice += itemPrice * itemQnt;
              }
            }
          });
        }

        const time = orderData.time;
        let month = "";
        let orderDate = null;
        if (time) {
          orderDate =
            time.toDate instanceof Function ? time.toDate() : new Date(time);
          const monthIndex = orderDate.getMonth();
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          month = monthNames[monthIndex];
        }

        if (monthData[month] !== undefined) {
          if (orderStatus === "delivered") {
            monthData[month].delivered += totalPrice;
            monthData[month].count += 1;
          } else if (orderStatus === "cancelled") {
            monthData[month].cancelled += totalPrice;
          }
        }
      });

      setCancelledOrders(cancelledCount);

      const deliveredOrdersCount = Object.values(monthData).reduce(
        (sum, month) => sum + month.count,
        0
      );

      if (deliveredOrdersCount > 0) {
        const totalDeliveredRevenue = Object.values(monthData).reduce(
          (sum, month) => sum + month.delivered,
          0
        );
        const avgValue = totalDeliveredRevenue / deliveredOrdersCount;
        setAvgOrderValue(avgValue);
      }

      const maxTotal = Math.max(
        ...Object.values(monthData).map((m) => m.delivered + m.cancelled)
      );

      const updatedRevenueData = [
        {
          month: "Dec",
          revenue: `₹${Math.round(monthData.Dec.delivered).toLocaleString()}`,
          totalRevenue: monthData.Dec.delivered + monthData.Dec.cancelled,
          delivered: monthData.Dec.delivered,
          cancelled: monthData.Dec.cancelled,
          orders: `${monthData.Dec.count} orders`,
          percentage:
            maxTotal > 0 ? (monthData.Dec.delivered / maxTotal) * 100 : 0,
        },
        {
          month: "Jan",
          revenue: `₹${Math.round(monthData.Jan.delivered).toLocaleString()}`,
          totalRevenue: monthData.Jan.delivered + monthData.Jan.cancelled,
          delivered: monthData.Jan.delivered,
          cancelled: monthData.Jan.cancelled,
          orders: `${monthData.Jan.count} orders`,
          percentage:
            maxTotal > 0 ? (monthData.Jan.delivered / maxTotal) * 100 : 0,
        },
        {
          month: "Feb",
          revenue: `₹${Math.round(monthData.Feb.delivered).toLocaleString()}`,
          totalRevenue: monthData.Feb.delivered + monthData.Feb.cancelled,
          delivered: monthData.Feb.delivered,
          cancelled: monthData.Feb.cancelled,
          orders: `${monthData.Feb.count} orders`,
          percentage:
            maxTotal > 0 ? (monthData.Feb.delivered / maxTotal) * 100 : 0,
        },
        {
          month: "Mar",
          revenue: `₹${Math.round(monthData.Mar.delivered).toLocaleString()}`,
          totalRevenue: monthData.Mar.delivered + monthData.Mar.cancelled,
          delivered: monthData.Mar.delivered,
          cancelled: monthData.Mar.cancelled,
          orders: `${monthData.Mar.count} orders`,
          percentage:
            maxTotal > 0 ? (monthData.Mar.delivered / maxTotal) * 100 : 0,
        },
        {
          month: "Apr",
          revenue: `₹${Math.round(monthData.Apr.delivered).toLocaleString()}`,
          totalRevenue: monthData.Apr.delivered + monthData.Apr.cancelled,
          delivered: monthData.Apr.delivered,
          cancelled: monthData.Apr.cancelled,
          orders: `${monthData.Apr.count} orders`,
          percentage:
            maxTotal > 0 ? (monthData.Apr.delivered / maxTotal) * 100 : 0,
        },
        {
          month: "May",
          revenue: `₹${Math.round(monthData.May.delivered).toLocaleString()}`,
          totalRevenue: monthData.May.delivered + monthData.May.cancelled,
          delivered: monthData.May.delivered,
          cancelled: monthData.May.cancelled,
          orders: `${monthData.May.count} orders`,
          percentage:
            maxTotal > 0 ? (monthData.May.delivered / maxTotal) * 100 : 0,
        },
      ];

      setRevenueData(updatedRevenueData);
      const totalDeliveredRevenue = Object.values(monthData).reduce(
        (sum, month) => sum + month.delivered,
        0
      );

      setTotalRevenue(Math.round(totalDeliveredRevenue));
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchTotalUsers = async () => {
    try {
      const usersCollection = collection(db, "Users");
      const userSnapshot = await getDocs(usersCollection);

      let newCustomerCount = 0;
      let repeatCount = 0;

      userSnapshot.forEach((doc) => {
        const userData = doc.data();
        const totalOrders = userData.total_orders || 0;

        if (totalOrders === 0 || totalOrders === 1) {
          newCustomerCount++;
        }

        if (totalOrders > 10) {
          repeatCount++;
        }
      });

      const totalCust = newCustomerCount + repeatCount;

      setTotalUsers(newCustomerCount);
      setRepeatCustomers(repeatCount);
      setTotalCustomers(totalCust);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsLoaded(true);
    fetchTotalUsers();
    fetchOrdersData();
  }, []);

  const retentionPercentage =
    totalCustomers > 0
      ? ((repeatCustomers / totalCustomers) * 100).toFixed(1)
      : "0";

  const statsCards = [
    {
      label: "New Customers",
      value: loading ? "0" : totalUsers.toString(),
      change: "12.5% vs last month",
      isPositive: true,
    },
    {
      label: "Repeat Customers",
      value: loading ? "0" : repeatCustomers.toString(),
      change: "8.3% vs last month",
      isPositive: true,
    },
    {
      label: "Customer Retention",
      value: `${retentionPercentage}%`,
      change: "4.2% vs last month",
      isPositive: true,
    },
    {
      label: "Avg. Order Value",
      value: loading ? "₹0" : `₹${avgOrderValue.toFixed(2)}`,
      change: "2.1% vs last month",
      isPositive: false,
    },
  ];

  const orderFrequency = [
    { label: "Weekly", percentage: 65, color: "bg-purple-500" },
    { label: "Monthly", percentage: 25, color: "bg-purple-500" },
    { label: "Occasional", percentage: 10, color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6 lg:p-8 shadow-sm">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track your business performance and insights
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-xl">
              <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                <AnimatedNumber value={stat.value} />
              </p>
              <div className="flex items-center gap-1">
                {stat.isPositive ? (
                  <TrendingUp size={16} className="text-green-600" />
                ) : (
                  <TrendingDown size={16} className="text-red-600" />
                )}
                <p
                  className={`text-sm ${
                    stat.isPositive ? "text-green-600" : "text-red-600"
                  }`}>
                  {stat.change}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Revenue Trend</h2>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-lg font-bold">₹</span>
              </div>
            </div>

            <div className="space-y-6">
              {revenueData.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {item.month}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-gray-900">
                        {item.revenue}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({item.orders})
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: isLoaded ? `${item.percentage}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Total Revenue (Last 6 Months)
                </span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{totalRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Insights */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Customer Insights
              </h2>
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Users size={18} className="text-purple-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-purple-700 font-medium mb-2">
                Total Customers
              </p>
              <p className="text-4xl font-bold text-purple-900 mb-2">
                <AnimatedNumber
                  value={loading ? "0" : totalCustomers.toString()}
                />
              </p>
              <p className="text-sm text-purple-600">
                +{loading ? "0" : totalUsers.toString()} new this month
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-sm text-blue-700 font-medium mb-2">
                  First Time
                </p>
                <p className="text-3xl font-bold text-blue-900 mb-1">
                  <AnimatedNumber
                    value={loading ? "0" : totalUsers.toString()}
                  />
                </p>
                <p className="text-sm text-blue-600">
                  {loading || totalCustomers === 0
                    ? "0"
                    : ((totalUsers / totalCustomers) * 100).toFixed(1)}
                  %
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <p className="text-sm text-green-700 font-medium mb-2">
                  Returning
                </p>
                <p className="text-3xl font-bold text-green-900 mb-1">
                  <AnimatedNumber
                    value={loading ? "0" : cancelledOrders.toString()}
                  />
                </p>
                <p className="text-sm text-green-600">Cancelled Orders</p>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Order Frequency
              </h3>
              <div className="space-y-4">
                {orderFrequency.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {item.label}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${item.color} h-full rounded-full transition-all duration-1000 ease-out`}
                        style={{
                          width: isLoaded ? `${item.percentage}%` : "0%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
