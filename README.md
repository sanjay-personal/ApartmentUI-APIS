# ApartmentUI-APIS

rename keys in mongodb

db.getCollection('COLLECTIONName').updateMany( {}, { $rename: { "CreatedBy": "Created Date","UpdatedBy": "Updated Date" } } )