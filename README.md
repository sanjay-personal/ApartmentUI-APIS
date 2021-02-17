# ApartmentUI-APIS

rename keys in mongodb

db.getCollection('COLLECTIONName').updateMany( {}, { $rename: { "CreatedBy": "Created Date","UpdatedBy": "Updated Date" } } )

db.books.aggregate([{
    $lookup: {
            from: "books_selling_data",
            localField: "isbn",
            foreignField: "isbn",
            as: "copies_sold"
        }
}])