const mongoose = require('mongoose');
const faker = require('faker');       // module to generate fake information
const fs = require('fs');             // to export/write randomly generated data as json file
const path = require('path');

const dbName = '7-xillow'       // database name
const collectionName ='summary' // table name

mongoose.connect(`mongodb://localhost:27017/${dbName}`, {useNewUrlParser: true, useUnifiedTopology: true});

// define Schema for table
const propertySchema = new mongoose.Schema({
    id: Number,           // id number
    price: Number,        // price
    bd: Number,           // #bedroom
    ba: Number,           // #bathroom
    sqft: Number,         // size of house in sqft
    address: String,      // address
    status: String,       // (one of 'for sale', 'for rent', 'sold')
    tour_button: Boolean, // tells page to render tour button or not
    zestimate : Number,   // price
    estPayment: Number    // price
  }
);

const House = mongoose.model(collectionName, propertySchema);

House.deleteMany({}) // delete all previous collections
  .catch((err)=> {console.log('Error in Delete All Documenets')})


console.log('START: generating and inserting 100 sample datas of house to database (MongoDB)');

var temp = Array(100).fill(0);

var promiseAll = Promise.all( // use promise 
  temp.map((ele,i) => {
    var randomVal = Math.random();
    
    let property = new House({ // generate random information for each document (property)
      id: i+1,
      price: faker.fake("{{commerce.price}}"),
      bd: Math.ceil(Math.random()*6),
      ba: Math.ceil(Math.random()*7)/2,
      sqft: faker.fake("{{random.number}}"),
      address: faker.fake("{{address.streetAddress}} {{address.secondaryAddress}}, {{address.city}}, {{address.stateAbbr}} {{address.zipCode}}"),
      status: (randomVal < 2/3) ? 'for sale' :
              (randomVal < 5/6) ? 'for rent' : 'sold',
      tour_button: faker.fake("{{random.boolean}}"),
      zestimate : faker.fake("{{commerce.price}}"),   
      estPayment: faker.fake("{{commerce.price}}")    
    });  
    
    var promise = property.save(); // save each proerty in collection

    return promise; // return promise generated by save method in line 53
  })
);

promiseAll.then(() => { // check if every property document is saved in collection 'summaries'
  House.find({}, {_id: 0, __v:0}).sort({id: 1}) // retrieve all data from table
    .then((data) => {
      console.log('END: generating and inserting datas to database');
      console.log('START: writing JSON file for sample data');

      data = JSON.stringify(data);
      fs.writeFile(path.join(__dirname, './sampe_data.json'), data, (err) => { // write data into json file
        if(err) {console.log(err);}
        else {
          console.log('END: writing JSON file for sample data'); 
          mongoose.connection.close();
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
})

