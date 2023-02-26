const express=require("express");
const https=require("https");

const bodyParser=require("body-parser");

const mongoose=require("mongoose");

const app=express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Deepak:Deepak123@cluster0.lpe9kln.mongodb.net/todolistDB",{useNewUrlParser:true});
mongoose.set('strictQuery', true);

const itemsSchema= {
  name:String
};
const Item=mongoose.model("Item",itemsSchema);
const item1= new Item({
  name:"Welcome my todolist"
});
const item2= new Item({
  name:"Click on button to add next Item"
});
const item3= new Item({
  name:"click here to delete the item"
});

const defaultItems=[item1,item2,item3];
const listSchema ={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);



app.get("/",function(req,res){


  Item.find({},function(err,foundItems)
{
  if(foundItems.length===0){
    Item.insertMany(defaultItems,function(err)
    {
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully Added");
      }

    });
    res.redirect("/");

  }
  else{
      res.render("list",{kindofDay:"Today",NEWitems:foundItems});

  }

});

});

app.get("/:customListName",function(req,res)
{
  const customListName=req.params.customListName;
  List.findOne({name:customListName},function(err,foundList)
{
  if(!err)
  {
    if(!foundList)
    { // create List
      const list=new List({
        name:customListName,
        items:defaultItems

      });
      list.save();
      res.redirect("/" + customListName);


    }
    else{

      res.render("list",{kindofDay:foundList.name,NEWitems:foundList.items});
    }
  }


});

});




app.post("/",function(req,res)
{
  const itemName = req.body.newItem;
  const listName=req.body.list
  const item=new Item({
    name:itemName
  });
  if(listName==='Today')
  {
    item.save();
    res.redirect("/");

  }

else{
  List.findOne({name:listName},function(err,foundList)
{
  foundList.items.push(item);
  foundList.save();
  res.redirect("/" + listName);
})
}


});
app.post("/delete",function(req,res)
{
  const checkedItemId = req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkedItemId,function(err)
  {
    if(err)
    {
      console.log(err);
    }
    else
    {
      console.log("Successfully deleted");
        res.redirect("/");
    }

  });
  }
  else{
    List.finOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList)
  {
    if(!err)
    {
      res.redirect("/" + listName);
    }
  });
  }

});



app.listen(3000,function()
{
  console.log("started at 3000 port");
})
