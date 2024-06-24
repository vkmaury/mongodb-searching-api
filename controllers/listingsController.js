const Listing1 = require('../models/Listing1');

exports.getListings = async (req, res) => {
    const { start_date, end_date, property_type, accommodates, name, page = 1, per_page = 50 } = req.query;

    if (!start_date || !end_date) {
        return res.status(400).json({ message: "Start date and end date are required" });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate) || isNaN(endDate)) {
        return res.status(400).json({ message: "Invalid date format" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
        return res.status(400).json({ message: "Start date cannot be in the past" });
    }

    const numberOfNights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    try {
        const conditions = [
            { minimum_nights: { $exists: true, $lte: numberOfNights } },
            { maximum_nights: { $exists: true, $gte: numberOfNights } }
        ];

        if (property_type) {
            conditions.push({ property_type });
        }

        if (accommodates) {
            conditions.push({ accommodates: { $lte: parseInt(accommodates) } });
        }

        if (name) {
            conditions.push({ name: new RegExp(name, 'i') }); // Case-insensitive regex search
        }

        const matchStage = { $and: conditions };

        const totalCount = await Listing1.countDocuments(matchStage);

        // Calculate the maximum number of pages
        const totalPages = Math.ceil(totalCount / per_page);

        // Ensure the page number does not exceed the total number of pages
        const validPage = Math.min(page, totalPages);

        if (page > totalPages) {
            return res.status(400).json({ message: `Page number exceeds total pages. Total pages: ${totalPages}` });
        }

        const pipeline = [
            { $match: matchStage },
            { $project: { name: 1, property_type: 1, bed_type: 1, room_type: 1, accommodates: 1, _id: 0 } },
            { $sort: { property_type: 1 } },
            { $skip: (validPage - 1) * per_page },
            { $limit: parseInt(per_page) }
        ];

        const listings = await Listing1.aggregate(pipeline);

        res.json({ totalCount, totalPages, page: parseInt(validPage), per_page: parseInt(per_page), listings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
