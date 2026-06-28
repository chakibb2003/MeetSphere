const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');

// Generate a random meeting code
function generateMeetingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const getChunk = (len) => Array.from({length: len}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${getChunk(3)}-${getChunk(3)}-${getChunk(3)}`;
}

// Create a meeting
router.post('/create', async (req, res) => {
  try {
    const { hostSessionId } = req.body;
    let meetingCode;
    let isUnique = false;

    // Ensure unique code
    while (!isUnique) {
      meetingCode = generateMeetingCode();
      const existing = await Meeting.findOne({ meetingCode });
      if (!existing) isUnique = true;
    }

    const meeting = new Meeting({
      meetingCode,
      hostSessionId
    });

    await meeting.save();
    
    res.status(201).json({ meetingCode });
  } catch (err) {
    console.error("Create meeting error:", err);
    res.status(500).json({ error: 'Failed to create meeting', details: err.message });
  }
});

// Join a meeting
router.post('/join', async (req, res) => {
  try {
    const { meetingCode } = req.body;
    const meeting = await Meeting.findOne({ meetingCode, isActive: true });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found or has ended' });
    }
    
    res.status(200).json({ success: true, meeting });
  } catch (err) {
    res.status(500).json({ error: 'Failed to join meeting' });
  }
});

// Get meeting details
router.get('/:meetingCode', async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ meetingCode: req.params.meetingCode });
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.status(200).json(meeting);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meeting details' });
  }
});

module.exports = router;
