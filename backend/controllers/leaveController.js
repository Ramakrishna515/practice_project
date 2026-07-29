const LeaveType = require('../models/LeaveType');
const LeaveBalance = require('../models/LeaveBalance');
const LeaveApplication = require('../models/LeaveApplication');

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
      .populate('approver');

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
      employee,
      leaveType,
      startDate,
      endDate,
      numberOfDays,
      isHalfDay,
      halfDayPeriod,
      reason
    } = req.body;

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const balance = await LeaveBalance.findOne({
      employee,
      year: currentYear,
      leaveType
    });

    if (!balance || balance.remainingDays < numberOfDays) {
      return res.status(400).json({ message: 'Insufficient leave balance' });
    }

    const leaveApplication = new LeaveApplication({
      employee,
      leaveType,
      startDate,
      endDate,
      numberOfDays,
      isHalfDay,
      halfDayPeriod,
      reason,
      status: 'Pending'
    });

    await leaveApplication.save();

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
