const SalaryStructure = require('../models/SalaryStructure');
const Payslip = require('../models/Payslip');
const Attendance = require('../models/Attendance');

// SALARY STRUCTURE CONTROLLERS

exports.getAllSalaryStructures = async (req, res) => {
  try {
    const { employee, page = 1, limit = 10 } = req.query;
    const query = {};

    if (employee) query.employee = employee;

    const salaryStructures = await SalaryStructure.find(query)
      .populate('employee', 'personalInfo employeeId employmentInfo')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ effectiveFrom: -1 });

    const count = await SalaryStructure.countDocuments(query);

    res.json({
      salaryStructures,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSalaryStructureById = async (req, res) => {
  try {
    const salaryStructure = await SalaryStructure.findById(req.params.id)
      .populate('employee');

    if (!salaryStructure) {
      return res.status(404).json({ message: 'Salary structure not found' });
    }

    res.json({ salaryStructure });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSalaryStructure = async (req, res) => {
  try {
    // Deactivate previous salary structures
    await SalaryStructure.updateMany(
      { employee: req.body.employee, isActive: true },
      { isActive: false }
    );

    const salaryStructure = new SalaryStructure(req.body);
    await salaryStructure.save();

    res.status(201).json({
      message: 'Salary structure created successfully',
      salaryStructure
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSalaryStructure = async (req, res) => {
  try {
    const salaryStructure = await SalaryStructure.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!salaryStructure) {
      return res.status(404).json({ message: 'Salary structure not found' });
    }

    res.json({
      message: 'Salary structure updated successfully',
      salaryStructure
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSalaryStructure = async (req, res) => {
  try {
    const salaryStructure = await SalaryStructure.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!salaryStructure) {
      return res.status(404).json({ message: 'Salary structure not found' });
    }

    res.json({ message: 'Salary structure deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PAYSLIP CONTROLLERS

exports.getAllPayslips = async (req, res) => {
  try {
    const { employee, month, year, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (employee) query.employee = employee;
    if (month) query.month = month;
    if (year) query.year = year;
    if (status) query.status = status;

    const payslips = await Payslip.find(query)
      .populate('employee', 'personalInfo employeeId employmentInfo')
      .populate('salaryStructure')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ year: -1, month: -1 });

    const count = await Payslip.countDocuments(query);

    res.json({
      payslips,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPayslipById = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id)
      .populate('employee')
      .populate('salaryStructure');

    if (!payslip) {
      return res.status(404).json({ message: 'Payslip not found' });
    }

    res.json({ payslip });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generatePayslips = async (req, res) => {
  try {
    const { month, year } = req.body;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const workingDays = endDate.getDate();

    // Get all active salary structures
    const salaryStructures = await SalaryStructure.find({ isActive: true })
      .populate('employee');

    const payslips = [];

    for (const structure of salaryStructures) {
      // Check if payslip already exists
      const existingPayslip = await Payslip.findOne({
        employee: structure.employee._id,
        month,
        year
      });

      if (existingPayslip) continue;

      // Get attendance data
      const attendanceRecords = await Attendance.find({
        employee: structure.employee._id,
        date: { $gte: startDate, $lte: endDate }
      });

      const presentDays = attendanceRecords.filter(a => a.status === 'Present').length;
      const absentDays = attendanceRecords.filter(a => a.status === 'Absent').length;
      const leaveDays = attendanceRecords.filter(a => a.status === 'Leave').length;
      const overtimeHours = attendanceRecords.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

      // Calculate pro-rated salary
      const salaryPerDay = structure.grossSalary / workingDays;
      const earnedSalary = salaryPerDay * presentDays;
      const overtimeRate = structure.grossSalary / (workingDays * 8);
      const overtimeAmount = overtimeHours * overtimeRate;

      const grossEarnings = earnedSalary + overtimeAmount;
      const deductionsPerDay = structure.totalDeductions / workingDays;
      const totalDeductions = deductionsPerDay * presentDays;
      const netPay = grossEarnings - totalDeductions;

      const payslip = new Payslip({
        employee: structure.employee._id,
        month,
        year,
        payPeriodStart: startDate,
        payPeriodEnd: endDate,
        salaryStructure: structure._id,
        workingDays,
        presentDays,
        absentDays,
        leaveDays,
        overtimeHours,
        overtimeAmount,
        grossEarnings,
        totalDeductions,
        netPay,
        status: 'Draft',
        generatedBy: req.user._id
      });

      await payslip.save();
      payslips.push(payslip);
    }

    res.status(201).json({
      message: `${payslips.length} payslips generated successfully`,
      payslips
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePayslip = async (req, res) => {
  try {
    const payslip = await Payslip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!payslip) {
      return res.status(404).json({ message: 'Payslip not found' });
    }

    res.json({
      message: 'Payslip updated successfully',
      payslip
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeePayslips = async (req, res) => {
  try {
    const payslips = await Payslip.find({ employee: req.params.empId })
      .populate('salaryStructure')
      .sort({ year: -1, month: -1 });

    res.json({ payslips });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.processPayslips = async (req, res) => {
  try {
    const { month, year } = req.body;

    const result = await Payslip.updateMany(
      { month, year, status: 'Draft' },
      { status: 'Processed' }
    );

    res.json({
      message: `${result.modifiedCount} payslips processed successfully`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
