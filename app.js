//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://efecollins-admin:admin-efecollins-4311404114@cluster0.unuhgl6.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
  name: String
}

const Items = mongoose.model('Item', itemsSchema);

const item1 = new Items({
  name: "Welcome to your todolist!"
})

const item2 = new Items({
  name: "Hit the + button to add a new item."
})

const item3 = new Items({
  name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Items.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Items.insertMany(defaultItems, err => console.log(err));
      res.redirect('/');
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const itemN = new Items({
    name: itemName
  })

  if (listName === "Today") {
    itemN.save()
    res.redirect('/');
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(itemN);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Items.findByIdAndRemove(checkedItemId, err => console.log(err))
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList) => {
      if (!err) {
        res.redirect("/" + listName)
      }
    })
  }
})

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, (err, foundList) => {
    if (!err) {
      if(foundList){
        // Show an existing list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      } else {
        // Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName)
      }
    } else {
      console.log(err);
    }
  })
})

app.listen(process.env.PORT || 3000, function () {
  console.log("Server has started successfully");
});