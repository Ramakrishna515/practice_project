const Onboarding = require('../models/Onboarding');

exports.getAllOnboarding = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.onboardingStatus = status;

    const onboardingRecords = await Onboarding.find(query)
      .populate('employee', 'personalInfo employeeId contactInfo')
      .populate('tasks.assignedTo', 'personalInfo employeeId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Onboarding.countDocuments(query);

    res.json({
      onboardingRecords,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOnboardingById = async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id)
      .populate('employee')
      .populate('tasks.assignedTo', 'personalInfo employeeId');

    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding record not found' });
    }

    res.json({ onboarding });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createOnboarding = async (req, res) => {
  try {
    const onboarding = new Onboarding({
      ...req.body,
      createdBy: req.user._id
    });

    await onboarding.save();

    res.status(201).json({
      message: 'Onboarding record created successfully',
      onboarding
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOnboarding = async (req, res) => {
  try {
    const onboarding = await Onboarding.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding record not found' });
    }

    res.json({
      message: 'Onboarding record updated successfully',
      onboarding
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteOnboarding = async (req, res) => {
  try {
    const onboarding = await Onboarding.findByIdAndDelete(req.params.id);

    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding record not found' });
    }

    res.json({ message: 'Onboarding record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, remarks } = req.body;

    const onboarding = await Onboarding.findOneAndUpdate(
      { '_id': req.params.id, 'tasks._id': taskId },
      {
        $set: {
          'tasks.$.status': status,
          'tasks.$.remarks': remarks,
          'tasks.$.completedDate': status === 'Completed' ? new Date() : null
        }
      },
      { new: true }
    );

    if (!onboarding) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      message: 'Task status updated successfully',
      onboarding
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDocumentStatus = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { isSubmitted, documentUrl } = req.body;

    const onboarding = await Onboarding.findOneAndUpdate(
      { '_id': req.params.id, 'documents._id': documentId },
      {
        $set: {
          'documents.$.isSubmitted': isSubmitted,
          'documents.$.documentUrl': documentUrl,
          'documents.$.submittedDate': isSubmitted ? new Date() : null
        }
      },
      { new: true }
    );

    if (!onboarding) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({
      message: 'Document status updated successfully',
      onboarding
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
