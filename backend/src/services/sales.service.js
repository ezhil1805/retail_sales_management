const fs = require('fs');
const path = require('path');
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');

const filePath = path.join(__dirname, '../../data/sales.json');

const matches = (value, search) => {
    if (!search) return true;
    if (!value) return false;
    return value.toString().toLowerCase().includes(search.toLowerCase());
};

exports.filterSales = (query) => {
    const {
        search,
        region,
        gender,
        minAge,
        maxAge,
        productCategory,
        paymentMethod,
        dateFrom,
        dateTo,
        sort,
        page = 1,
        limit = 10
    } = query;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);

    let total = 0;
    const paginatedData = [];

    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filePath)
            .pipe(parser())
            .pipe(streamArray());

        stream.on('data', ({ value }) => {
            // Apply filters on the fly
            let keep = true;

            if (search && !(matches(value["Customer Name"], search) || matches(value["Phone Number"], search))) keep = false;
            if (region && !region.split(',').includes(value.Region)) keep = false;
            if (gender && !gender.split(',').includes(value.Gender)) keep = false;
            if (minAge && value.Age < parseInt(minAge)) keep = false;
            if (maxAge && value.Age > parseInt(maxAge)) keep = false;
            if (productCategory && !productCategory.split(',').includes(value["Product Category"])) keep = false;
            if (paymentMethod && !paymentMethod.split(',').includes(value["Payment Method"])) keep = false;
            if (dateFrom && new Date(value.Date) < new Date(dateFrom)) keep = false;
            if (dateTo && new Date(value.Date) > new Date(dateTo)) keep = false;

            if (keep) {
                total++;
                // Only collect items for the current page
                if (total > startIndex && total <= endIndex) {
                    paginatedData.push(value);
                }
            }
        });

        stream.on('end', () => {
            // Sorting (after collecting page items)
            if (sort) {
                paginatedData.sort((a, b) => {
                    switch (sort) {
                        case 'date_newest': return new Date(b.Date) - new Date(a.Date);
                        case 'date_oldest': return new Date(a.Date) - new Date(b.Date);
                        case 'name_asc': return a["Customer Name"].localeCompare(b["Customer Name"]);
                        case 'name_desc': return b["Customer Name"].localeCompare(a["Customer Name"]);
                        case 'amount_high': return b["Final Amount"] - a["Final Amount"];
                        case 'amount_low': return a["Final Amount"] - b["Final Amount"];
                        default: return 0;
                    }
                });
            }

            resolve({
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit),
                data: paginatedData
            });
        });

        stream.on('error', (err) => reject(err));
    });
};
