var express = require("express");
var app = express()
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var methodOverride = require("method-override");
var User = require("./models/user")

// mongoose.connect("mongodb://localhost/maze",{useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect("mongodb+srv://sarfaraaz:sarfu@cluster0-ucije.mongodb.net/<dbname>?retryWrites=true&w=majority",{useNewUrlParser: true, useUnifiedTopology: true});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"))



app.use(require("express-session")({
	secret: "i am the legend",
	resave: false,
	saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




var playerSchema = new mongoose.Schema({
	name: String,
	age : String,
	gender : String,
	author : {
		id:{
			type:mongoose.Schema.Types.ObjectId,
			ref:"User"

		},
		username: String
	}
})
var Player = mongoose.model("Player", playerSchema);

// Player.create({
// 	name: "rafiya",
// 	age: "12",
// 	gender: "male"
// }, function(err,players){
// 	if(err){
// 		console.log(err);
// 	}else{
// 		console.log(players);
// 	}
// })

// User.create({
// 	username: "steeee",
// 	password: "123"
// },function(err,users){
// 	if(err){
// 		console.log(err);
// 	}else{
// 		console.log(users);
// 		Player.findOne({name: "rafiya"},function(err,players){
// 			if(err){
// 				console.log(err);
// 			}else{
// 				players.author.id = users.id;
// 				players.author.username = users.username;
// 				players.save();
// 				console.log("results++++++::" + players);
// 			}
// 		})
// 	}
// })

app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	next();
})


////////////////////////////////////////////////////////////////////////////
app.get("/",function(req,res){
	res.redirect("/login");
})
app.get("/home",isLoggedIn,function(req,res){
	Player.find({},function(err,players){
		if(err){
			console.log(err);
		}else{
			res.render("home",{player:players});
		}
	})
	
})

app.get("/home/game",isLoggedIn,function(req,res){
	res.render("game");
})
/////////////////////////////////////////////////////////////////////////////////////////////////
// player info
app.get("/home/form",isLoggedIn,function(req,res){
	res.render("form");
})


app.post("/home",isLoggedIn,function(req,res){
	var name = req.body.name;
	var age = req.body.age;
	var gender = req.body.gender;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newplayer = {
		name: name,
		age: age,
		gender: gender,
		author: author
	}
	Player.create(newplayer, function(err,players){
		if(err){
			res.redirect("/home/form")
		}else{
			console.log(players);
			res.redirect("/home")
		}
	})
})
app.get("/home/admin",function(req,res){
	Player.find({},function(err,data){
		if(err){
			console.log("error");
		}else{
			res.render("playerdetail",{player:data});
		}
	})
})

app.get("/home/:id",CheckOwner,function(req,res){
	Player.findById(req.params.id,function(err,players){
		if(err){
			res.redirect("back");
		}else{
			res.render("show",{player:players});
		}
	})
})

app.get("/home/:id/edit",CheckOwner,function(req,res){
	Player.findById(req.params.id,function(err,players){
		if(err){
			res.redirect("back");
		}else{
			res.render("edit",{player:players});
		}
	})
})

app.put("/home/:id",CheckOwner,function(req,res){
	Player.findByIdAndUpdate(req.params.id, req.body.player, function(err,data){
		if(err){
			res.redirect("back");
		}else{
			res.redirect("/home/" + req.params.id);
		}
	})
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// authentication
app.get("/register",function(req,res){
	res.render("register");
})

app.post("/register",function(req,res){
	// eval(require('locus'))
	var newUser = new User({username: req.body.username, email: req.body.email})
	if(req.body.secretcode === "secretcode"){
		newUser.isAdmin = true;
		// res.redirect("/home/admin");
	}
	User.register(newUser , req.body.password, function(err,user){
		if(err){
			console.log("error");
			return res.render("register");
		}else{
		passport.authenticate("local")(req,res, function(){
			
			res.redirect("/home/form");
	})
		}
})
})

app.get("/login",function(req,res){

	res.render("login");
})

app.post("/login",passport.authenticate("local",{
	successRedirect: "/home",
	failureRedirect: "/login"
	
}),function(req,res){	
});
   
   


app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
})

function isLoggedIn(req,res, next){
	if(req.isAuthenticated()){
			// console.log(req.user);
		return next();
	}
	res.redirect("/login");
}
function CheckOwner(req,res,next){
	if(req.isAuthenticated()){
		Player.findById(req.params.id,function(err,player){
			if(err){
				console.log(err);
			}else{
				if(player.author.id.equals(req.user._id)){
					next();
			   }
			else
			{
			res.redirect("back");	
			}
			}
		})
	}else{
		res.redirect("back");
	}
}


app.listen(process.env.PORT || 3000, process.env.IP,function(){
	console.log("server starts");
})