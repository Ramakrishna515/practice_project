const LeaveType = require('../models/LeaveType');
const LeaveBalance = require('../models/LeaveBalance');
const LeaveApplication = require('../models/LeaveApplication');
const Employee = require('../models/Employee');

// LEAVE TYPE CONTROLLERS

exports.getAllLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find({ isActive: true }).sort({ leaveTypeName: 1 });
    res.json({ leaveTypes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createLeaveType = async (req, res) => {
  try {
    const leaveType = new LeaveType(req.body);
    await leaveType.save();

    res.status(201).json({
      message: 'Leave type created successfully',
      leaveType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!leaveType) {
      return res.status(404).json({ message: 'Leave type not found' });
    }

    res.json({
      message: 'Leave type updated successfully',
      leaveType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!leaveType) {
      return res.status(404).json({ message: 'Leave type not found' });
    }

    res.json({ message: 'Leave type deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LEAVE APPLICATION CONTROLLERS

exports.getAllLeaves = async (req, res) => {
  try {
    const { employee, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (employee) query.employee = employee;
    if (status) query.status = status;

    const leaves = await LeaveApplication.find(query)
      .populate('employee', 'personalInfo employeeId employmentInfo')
      .populate('leaveType', 'leaveTypeName leaveCode')
      .populate('approver', 'personalInfo employeeId')
      .populate('reportingManager', 'personalInfo employeeId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appliedDate: -1 });

    const count = await LeaveApplication.countDocuments(query);

    res.json({
      leaves,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLeaveById = async (req, res) => {
  try {
    const leave = await LeaveApplication.findById(req.params.id)
      .populate('employee')
      .populate('leaveType')
      .populate('approver')
      .populate('reportingManager');

    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    res.json({ leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.applyLeave = async (req, res) => {
  try {
    const {
      employee: assignedEmployee,
      leaveType,
      startDate,
      endDate,
      reason
    } = req.body;

    // Determine the employee: Admin/HR/Manager can assign leave on behalf of a
    // specific employee; otherwise use the employee attached to the account.
    let employee;
    if (assignedEmployee) {
      if (!['Admin', 'HR', 'Manager'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized to assign leave to another employee' });
      }
      employee = assignedEmployee;
    } else {
      employee = req.user.employee?._id || req.user._id;
    }

    // Fetch the employee record to validate reporting manager exists
    const employeeDoc = await Employee.findById(employee);
    if (!employeeDoc) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const reportingManager = employeeDoc.employmentInfo?.reportingManager;
    if (!reportingManager) {
      return res.status(400).json({
        message: 'A reporting manager must be assigned to this employee before applying for leave. Please contact your administrator.'
      });
    }

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Get leave type details
    const leaveTypeDoc = await LeaveType.findById(leaveType);
    if (!leaveTypeDoc) {
      return res.status(404).json({ message: 'Leave type not found' });
    }

    // Check or create leave balance for current year
    const currentYear = new Date().getFullYear();
    let balance = await LeaveBalance.findOne({
      employee,
      year: currentYear,
      leaveType
    });

    // Auto-create balance if doesn't exist
    if (!balance) {
      balance = new LeaveBalance({
        employee,
        leaveType,
        year: currentYear,
        totalDays: leaveTypeDoc.maxDaysPerYear,
        usedDays: 0,
        remainingDays: leaveTypeDoc.maxDaysPerYear
      });
      await balance.save();
    }

    // Check if sufficient balance
    if (balance.remainingDays < numberOfDays) {
      return res.status(400).json({
        message: `Insufficient leave balance. Available: ${balance.remainingDays} days, Requested: ${numberOfDays} days`
      });
    }

    const leaveApplication = new LeaveApplication({
      employee,
      leaveType,
      startDate,
      endDate,
      numberOfDays,
      reason,
      status: 'Pending',
      reportingManager,
      appliedDate: new Date()
    });

    await leaveApplication.save();

    // Update balance (reduce remaining days)
    balance.usedDays += numberOfDays;
    balance.remainingDays -= numberOfDays;
    await balance.save();

    res.status(201).json({
      message: 'Leave application submitted successfully',
      leaveApplication
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLeave = async (req, res) => {
  try {
    const leave = await LeaveApplication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    res.json({
      message: 'Leave application updated successfully',
      leave
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelLeave = async (req, res) => {
  try {
    const leave = await LeaveApplication.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'Can only cancel pending leave applications' });
    }

    leave.status = 'Cancelled';
    await leave.save();

    res.json({
      message: 'Leave application cancelled successfully',
      leave
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const leave = await LeaveApplication.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'Leave is not in pending status' });
    }

    // Only the reporting manager of this leave can approve it
    const managerId = req.user.employee?._id;
    if (!managerId || String(leave.reportingManager) !== String(managerId)) {
      return res.status(403).json({ message: 'Only the reporting manager can approve this leave request' });
    }

    leave.status = 'Approved';
    leave.approver = req.user.employee;
    leave.approvedDate = new Date();
    await leave.save();

    // Update leave balance
    const currentYear = new Date().getFullYear();
    await LeaveBalance.findOneAndUpdate(
      {
        employee: leave.employee,
        year: currentYear,
        leaveType: leave.leaveType
      },
      {
        $inc: {
          usedDays: leave.numberOfDays,
          remainingDays: -leave.numberOfDays
        }
      }
    );

    res.json({
      message: 'Leave approved successfully',
      leave
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const leave = await LeaveApplication.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'Leave is not in pending status' });
    }

    // Only the reporting manager of this leave can reject it
    const managerId = req.user.employee?._id;
    if (!managerId || String(leave.reportingManager) !== String(managerId)) {
      return res.status(403).json({ message: 'Only the reporting manager can reject this leave request' });
    }

    leave.status = 'Rejected';
    leave.approver = req.user.employee;
    leave.approvedDate = new Date();
    leave.rejectionReason = rejectionReason;
    await leave.save();

    res.json({
      message: 'Leave rejected successfully',
      leave
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LEAVE BALANCE CONTROLLERS

exports.getLeaveBalance = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const balances = await LeaveBalance.find({
      employee: req.params.empId,
      year
    }).populate('leaveType', 'leaveTypeName leaveCode isPaid');

    res.json({ balances });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLeaveBalance = async (req, res) => {
  try {
    const balance = await LeaveBalance.findOneAndUpdate(
      { employee: req.params.empId, leaveType: req.body.leaveType, year: req.body.year },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      message: 'Leave balance updated successfully',
      balance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user's leave balance
exports.getMyLeaveBalance = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const employee = req.user.employee?._id || req.user._id;

    const balances = await LeaveBalance.find({
      employee,
      year
    }).populate('leaveType', 'leaveTypeName leaveCode maxDaysPerYear isPaid');

    res.json({ balances });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user's leaves (all leaves for Admin/HR/Manager)
exports.getMyLeaves = async (req, res) => {
  try {
    const isPrivileged = ['Admin', 'HR', 'Manager'].includes(req.user.role);
    const query = isPrivileged
      ? {}
      : { employee: req.user.employee?._id || req.user._id };

    const leaves = await LeaveApplication.find(query)
      .populate('employee', 'personalInfo employeeId employmentInfo')
      .populate('leaveType', 'leaveTypeName leaveCode')
      .populate('approver', 'personalInfo employeeId')
      .populate('reportingManager', 'personalInfo employeeId')
      .sort({ appliedDate: -1 });

    res.json({ leaves });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending leaves for approval (Admin/HR see all, Managers see their team's)
exports.getPendingLeaves = async (req, res) => {
  try {
    const isPrivileged = ['Admin', 'HR'].includes(req.user.role);
    const query = { status: 'Pending' };

    if (!isPrivileged) {
      const managerId = req.user.employee?._id;
      if (!managerId) {
        return res.json({ leaves: [] });
      }
      query.reportingManager = managerId;
    }

    const leaves = await LeaveApplication.find(query)
      .populate('employee', 'personalInfo employeeId')
      .populate('leaveType', 'leaveTypeName leaveCode')
      .populate('reportingManager', 'personalInfo employeeId')
      .sort({ appliedDate: -1 });

    res.json({ leaves });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
