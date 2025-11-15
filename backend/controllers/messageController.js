import Message from '../models/messageModel.js';

export const createMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ success: false, message: 'Missing fields' });
    const m = new Message({ name, email, phone, subject, message });
    await m.save();
    res.json({ success: true, data: m });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const listMessages = async (req, res) => {
  try {
    const msgs = await Message.find().sort({ createdAt: -1 });
    res.json({ success: true, data: msgs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const msg = await Message.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!msg) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: msg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
