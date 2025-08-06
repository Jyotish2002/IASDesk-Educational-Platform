const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    trim: true,
    maxLength: 1000
  },
  image: {
    type: String, // URL/path to uploaded image
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'mixed'],
    default: function() {
      if (this.image && this.message) return 'mixed';
      if (this.image) return 'image';
      return 'text';
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });
messageSchema.index({ receiverId: 1, isRead: 1 });

// Virtual for formatted timestamp
messageSchema.virtual('formattedTime').get(function() {
  return this.timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Method to mark message as read
messageSchema.methods.markAsRead = async function() {
  this.isRead = true;
  return await this.save();
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = async function(userId1, userId2, limit = 50) {
  return await this.find({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 }
    ]
  })
  .populate('senderId', 'name email role')
  .populate('receiverId', 'name email role')
  .sort({ timestamp: -1 })
  .limit(limit);
};

// Static method to get unread message count for a user
messageSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    receiverId: userId,
    isRead: false
  });
};

// Static method to get chat previews for a user
messageSchema.statics.getChatPreviews = async function(userId) {
  const pipeline = [
    // Match messages where user is sender or receiver
    {
      $match: {
        $or: [
          { senderId: new mongoose.Types.ObjectId(userId) },
          { receiverId: new mongoose.Types.ObjectId(userId) }
        ]
      }
    },
    // Sort by timestamp to get latest messages first
    {
      $sort: { timestamp: -1 }
    },
    // Group by conversation (combination of sender and receiver)
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$senderId', new mongoose.Types.ObjectId(userId)] },
            '$receiverId',
            '$senderId'
          ]
        },
        lastMessage: { $first: '$message' },
        lastMessageTime: { $first: '$timestamp' },
        hasImage: { $first: { $ne: ['$image', null] } },
        messages: { $push: '$$ROOT' }
      }
    },
    // Calculate unread count
    {
      $addFields: {
        unreadCount: {
          $size: {
            $filter: {
              input: '$messages',
              cond: {
                $and: [
                  { $eq: ['$$this.receiverId', new mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$$this.isRead', false] }
                ]
              }
            }
          }
        }
      }
    },
    // Lookup user details
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'otherUser'
      }
    },
    {
      $unwind: '$otherUser'
    },
    // Project final structure
    {
      $project: {
        _id: 1,
        studentId: '$_id',
        studentName: '$otherUser.name',
        lastMessage: 1,
        lastMessageTime: 1,
        unreadCount: 1,
        hasImage: 1,
        isOnline: '$otherUser.isOnline'
      }
    },
    // Sort by last message time
    {
      $sort: { lastMessageTime: -1 }
    }
  ];

  return await this.aggregate(pipeline);
};

module.exports = mongoose.model('Message', messageSchema);
