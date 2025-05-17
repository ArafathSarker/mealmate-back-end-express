const mongoose = require('mongoose');

const groupListSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    item1: {
        type: Object,
    },
    item2: {
        type: Object,
    },
    item3: {
        type: Object,
    },
    item4: {
        type: Object,
    },
    item5: {
        type: Object,
    },
    item6: {
        type: Object,
    },
    item7: {
        type: Object,
    },
    item8: {
        type: Object,
    },
    item9: {
        type: Object,
    },
    item10: {
        type: Object,
    },
    totalPrice: {
        type: Number,
        default: 0
    },
    CreatedOn: {
        type: Date,
        default: new Date()
    }
});

// Pre-save middleware to check for duplicates
groupListSchema.pre('save', async function (next) {
    const existingDocument = await mongoose.model('groupList').findOne({
        group: this.group,
        item1: this.item1,
        item2: this.item2,
        item3: this.item3,
        item4: this.item4,
        item5: this.item5,
        item6: this.item6,
        item7: this.item7,
        item8: this.item8,
        item9: this.item9,
        item10: this.item10
    });

    if (existingDocument) {
        const error = new Error('A similar document already exists in the database.');
        return next(error); 
    }

    // Calculate totalPrice before saving
    this.totalPrice =
        (this.item1?.price || 0) +
        (this.item2?.price || 0) +
        (this.item3?.price || 0) +
        (this.item4?.price || 0) +
        (this.item5?.price || 0) +
        (this.item6?.price || 0) +
        (this.item7?.price || 0) +
        (this.item8?.price || 0) +
        (this.item9?.price || 0) +
        (this.item10?.price || 0);

    next(); 
});

module.exports = mongoose.model('groupList', groupListSchema);