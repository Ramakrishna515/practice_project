const Attendance = require('../models/Attendance');
const Shift = require('../models/Shift');

// ATTENDANCE CONTROLLERS

exports.getAllAttendance = async (req, res) => {
  try {
    const { employee, date, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (employee) query.employee = employee;
    if (date) query.date = new Date(date);
    if (status) query.status = status;

    const attendanceRecords = await Attendance.find(query)
      .populate('employee', 'personalInfo employeeId employmentInfo')
      .populate('shift')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const count = await Attendance.countDocuments(query);

    res.json({
      attendanceRecords,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('employee')
      .populate('shift');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const { employeeId, location } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: today
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const attendance = new Attendance({
      employee: employeeId,
      date: today,
      checkIn: new Date(),
      status: 'Present',
      checkInLocation: location
    });

    await attendance.save();

    res.status(201).json({
      message: 'Checked in successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { employeeId, location } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: today
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out' });
    }

    const checkOutTime = new Date();
    const workHours = (checkOutTime - attendance.checkIn) / (1000 * 60 * 60);

    attendance.checkOut = checkOutTime;
    attendance.workHours = workHours;
    attendance.checkOutLocation = location;

    if (workHours > 9) {
      attendance.overtimeHours = workHours - 9;
    }

    await attendance.save();

    res.json({
      message: 'Checked out successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({
      message: 'Attendance record updated successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { employee: req.params.empId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('shift')
      .sort({ date: -1 });

    const stats = {
      totalDays: attendanceRecords.length,
      present: attendanceRecords.filter(a => a.status === 'Present').length,
      absent: attendanceRecords.filter(a => a.status === 'Absent').length,
      halfDay: attendanceRecords.filter(a => a.status === 'Half Day').length,
      leave: attendanceRecords.filter(a => a.status === 'Leave').length,
      totalWorkHours: attendanceRecords.reduce((sum, a) => sum + (a.workHours || 0), 0),
      totalOvertimeHours: attendanceRecords.reduce((sum, a) => sum + (a.overtimeHours || 0), 0)
    };

    res.json({ attendanceRecords, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('employee', 'personalInfo employeeId employmentInfo.department');

    res.json({ attendanceRecords });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SHIFT CONTROLLERS

exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({ isActive: true }).sort({ shiftName: 1 });
    res.json({ shifts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createShift = async (req, res) => {
  try {
    const shift = new Shift(req.body);
    await shift.save();

    res.status(201).json({
      message: 'Shift created successfully',
      shift
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json({
      message: 'Shift updated successfully',
      shift
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
