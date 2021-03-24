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

input as multiple  values for particular column query

input1 = ["ALL_COLLECTION_CUSTOMER_PARTIAL_COLLECT_INV","ACTIONABLE_RETURNS","ACTIONABLE_RTNS_FROM_CSTMR_VIEW_RTN_ITEMS"]
input2 = [2,9,4,3]

db.getCollection('APP_CONFIG_PAGES').find({
    "code": {$in:["ALL_COLLECTION_CUSTOMER_PARTIAL_COLLECT_INV","ACTIONABLE_RETURNS","ACTIONABLE_RTNS_FROM_CSTMR_VIEW_RTN_ITEMS"]},
            "version":{$in:[2,9,4,3]}
    })
