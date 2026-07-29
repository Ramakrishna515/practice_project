const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const LeaveApplication = require('../models/LeaveApplication');
const Payslip = require('../models/Payslip');
const Department = require('../models/Department');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ isActive: true });
    const activeEmployees = await Employee.countDocuments({
      isActive: true,
      'employmentInfo.employmentStatus': 'Active'
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendance = await Attendance.countDocuments({
      date: today,
      status: 'Present'
    });

    const pendingLeaves = await LeaveApplication.countDocuments({
      status: 'Pending'
    });

    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const pendingPayslips = await Payslip.countDocuments({
      month: currentMonth,
      year: currentYear,
      status: { $in: ['Draft', 'Processed'] }
    });

    res.json({
      stats: {
        totalEmployees,
        activeEmployees,
        todayAttendance,
        pendingLeaves,
        pendingPayslips
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendanceStats = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const dailyStats = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
          },
          leave: {
            $sum: { $cond: [{ $eq: ['$status', 'Leave'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      attendanceStats,
      dailyStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLeaveSummary = async (req, res) => {
  try {
    const leaveStats = await LeaveApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const leaveByType = await LeaveApplication.aggregate([
      {
        $lookup: {
          from: 'leavetypes',
          localField: 'leaveType',
          foreignField: '_id',
          as: 'leaveTypeInfo'
        }
      },
      { $unwind: '$leaveTypeInfo' },
      {
        $group: {
          _id: '$leaveTypeInfo.leaveTypeName',
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' }
        }
      }
    ]);

    res.json({
      leaveStats,
      leaveByType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeesByDepartment = async (req, res) => {
  try {
    const employeesByDept = await Employee.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'departments',
          localField: 'employmentInfo.department',
          foreignField: '_id',
          as: 'deptInfo'
        }
      },
      { $unwind: { path: '$deptInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$deptInfo.departmentName',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({ employeesByDept });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPayrollSummary = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const payrollStats = await Payslip.aggregate([
      {
        $match: {
          month: currentMonth,
          year: currentYear
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalGross: { $sum: '$grossEarnings' },
          totalDeductions: { $sum: '$totalDeductions' },
          totalNet: { $sum: '$netPay' }
        }
      }
    ]);

    res.json({ payrollStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentActivities = async (req, res) => {
  try {
    const recentEmployees = await Employee.find({ isActive: true })
      .select('personalInfo employeeId employmentInfo createdAt')
      .populate('employmentInfo.department', 'departmentName')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentLeaves = await LeaveApplication.find()
      .populate('employee', 'personalInfo employeeId')
      .populate('leaveType', 'leaveTypeName')
      .sort({ appliedDate: -1 })
      .limit(5);

    res.json({
      recentEmployees,
      recentLeaves
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
