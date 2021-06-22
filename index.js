import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import cors from "cors";
import fast2sms from "fast-two-sms";
import cron from "node-cron";
import millify from 'millify';

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
let conn = mongoose.createConnection(`mongodb+srv://admin-manas:${process.env.MONGO_KEY}@cluster0.ycyr7.mongodb.net/ScrapeDB?retryWrites=true&w=majority`,{useNewUrlParser: true, useUnifiedTopology: true});
let conn1 = mongoose.createConnection(`mongodb+srv://admin-manas:${process.env.MONGO_KEY}@cluster0.ycyr7.mongodb.net/UserDB?retryWrites=true&w=majority`,{useNewUrlParser: true, useUnifiedTopology: true});


    const MillifyOptions = {
        precision:3,
        space:true
      };
      

    const scrapedSchema = {
        lastUpdatedAt : String,
        scrapedData : Array
    };
    const formSchema = {
        name : String,
        phone : String,
        region: String
    }

    const Scraped = conn.model("Scrape",scrapedSchema);
    const formData = conn1.model("Form",formSchema);

    const ind_url = "https://api.apify.com/v2/acts/manas-shankar~india-covid-scraper/runs/last/dataset/items?token="+process.env.APIFY_KEY;
    const world_url = "https://api.apify.com/v2/acts/manas-shankar~world-covid-scraper/runs/last/dataset/items?token="+process.env.APIFY_KEY;


        let indiaData;
        let regionData;
        let worldData;
        let bundle;

    app.use(express.static("public"));
    app.use(cors())

    


//     cron.schedule("10 3 * * *",async ()=>{
//         await axios.get(ind_url)
//     .then((data)=>{
//         indiaData = Object.assign({},data.data[0]);
    
//         delete indiaData.regionData;
//         regionData = data.data[0].regionData;
   
//     })
//     .catch(err => {console.log(err)});


//     await axios.get(world_url)
//     .then((data)=>{
//         worldData = Object.assign({},data.data[0].regionData[0]);
//     })
//     .catch(err => {console.log(err)});
//     console.log(worldData)
//     console.log(regionData)
//     console.log(indiaData)
//     bundle = [worldData,indiaData,regionData]
        
//   },{
//       scheduled: true,
//       timezone: "Asia/Kolkata"
//     });
  
    
//      cron.schedule("15 3 * * *",()=>{

//       let date = new Date(indiaData.lastUpdatedAtApify).toUTCString();
//             var dateIST = new Date(date);
//             //date shifting for IST timezone (+5 hours and 30 minutes)
//             dateIST.setHours(dateIST.getHours() + 5); 
//             dateIST.setMinutes(dateIST.getMinutes() + 30);

//             let dateFinal = dateIST.toDateString()
//             let scraped1 = new Scraped({
//                 lastUpdatedAt : dateFinal,
//                 scrapedData : bundle
//             })

//                 Scraped.create([scraped1],(err,doc)=>{
//                     if(err)
//                     {
//                         console.log(err)
//                     }
//                     else{
//                         console.log(doc);
//                     }
//                 })
// },{
//     scheduled: true,
//     timezone: "Asia/Kolkata"
//   });


    // cron.schedule("15 8 * * *",()=>{
    //         let userData;
    //         let filtered_area;
    //         let filtered_area_object;
    //         let options;
    //         let dateToday = new Date().toDateString(); 
    //         formData.find({},async (err,docs)=>{
    //             if(err)
    //             {
    //                 console.log(err)
    //             }
    //             else{
    //                 // console.log(docs)
    //                 userData = await docs;
    //             }
                
    //             userData.map(async (item,index)=>{
    //                 console.log(item.region);
    //                 await Scraped.findOne({lastUpdatedAt:dateToday},{},{},async (err1,doc1)=>{
    //                     if(err1)
    //                     {
    //                         console.log(err1)
    //                     }  
    //                     else{
                        
    //                         let scrapedData = doc1.scrapedData;
    //                         let areas = scrapedData[2];
    //                         filtered_area = areas.filter((loc)=>{
    //                             return loc.region ===item.region 
    //                         })
    //                         // console.log(filtered_area)
    //                         filtered_area_object = filtered_area[0];
    //                         options = 
    //                         {   authorization : process.env.FAST_API_KEY ,
    //                             message : `Hello ${item.name},\nyour area stats are:\nRegion: ${filtered_area_object.region}\nTotal cases: ${millify.default(filtered_area_object.totalInfected,MillifyOptions)}\nNew cases: ${millify.default(filtered_area_object.newInfected,MillifyOptions)}\nRecovered: ${millify.default(filtered_area_object.recovered,MillifyOptions)}\nNewly Recovered: ${millify.default(filtered_area_object.newRecovered,MillifyOptions)}\nDeaths: ${millify.default(filtered_area_object.deceased,MillifyOptions)}\nRecent Deaths: ${millify.default(filtered_area_object.newDeceased,MillifyOptions)}\n`,  
    //                             numbers : [item.phone]
    //                         }
    //                         await console.log("sending message to:\n",options.message)
    //                             await fast2sms.sendMessage(options).then(async (response)=>{
    //                                 await console.log(response);
    //                             })
    //                     }
    //                     })
    //             })
    //         })
    
    // },{
    //     scheduled: true,
    //     timezone: "Asia/Kolkata"
    //   });



app.get("/",(req,res)=>{   
    res.send("running");
})



app.get("/data",(req,res)=>{
   let dateToday = new Date().toDateString(); 
  Scraped.findOne({lastUpdatedAt:dateToday},{},{},(err,doc)=>{
    if(err)
    {
        console.log(err)
    }  
    else{
        let scrapedData = doc.scrapedData;
        scrapedData.push(doc.lastUpdatedAt)
        console.log(scrapedData)
        res.send(scrapedData)
    }
    })  
})



app.post('/', (req, res) => {
    let nonInsert = false;
    console.log(req.body.name);
    let name = req.body.name;
    console.log(req.body.phone);
    let phone = req.body.phone
    console.log(req.body.region);
    let area = req.body.region;
  

    formData.find({},{},{},async (err,doc)=>{
        if(err)
        {
            console.log(err)
        }
        else{
            await doc.map(async (items,index)=>{
                if(phone === items.phone)
                {
                    nonInsert = true
                    await console.log("number already present in form data")
                    res.send("phone number duplicated.Please try again");
                }
            })

            if(nonInsert===false)
                {   
                    res.send("received");
                    let user = new formData({
                        name:name,
                        phone:phone,
                        region:area
                    })
                      formData.create([user],(err2,doc2)=>{
                            if(err2)
                            {
                                console.log(err2)
                            }
                            else{
                                console.log(doc2);
                            }
                      })
                }
        }
        
    })
    
    
});



const port = process.env.PORT;
app.listen(port || 4000, () => {
    console.log(`App listening on port ${port}!`);
});


