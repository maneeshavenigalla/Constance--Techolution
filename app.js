// This loads the environment variables from the .env file
require("dotenv-extended").load();

const builder = require("botbuilder");
const restify = require("restify");
const Store = require("./store");
const spellService = require("./spell-service");

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`${server.name} listening to ${server.url}`);
});
// Create connector and listen for messages
const connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post("/api/messages", connector.listen());

// Default store: volatile in-memory store - Only for prototyping!
var inMemoryStorage = new builder.MemoryBotStorage();
var bot = new builder.UniversalBot(connector, function(session) {
  session.send(
    "Sorry, I did not understand '%s'. Type 'help' if you need assistance.",
    session.message.text
  );
}).set("storage", inMemoryStorage); // Register in memory storage

// You can provide your own model by specifing the 'LUIS_MODEL_URL' environment variable
// This Url can be obtained by uploading or creating your model from the LUIS portal: https://www.luis.ai/
const recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

// On Bot open

bot.on("conversationUpdate", message => {
  if (message.membersAdded) {
    message.membersAdded.forEach(function(identity) {
      if (identity.id === message.address.bot.id) {
        const welcomeCard = new builder.Message()
          .address(message.address)
          .addAttachment({
            contentType: "application/vnd.microsoft.card.adaptive",
            content: {
              type: "AdaptiveCard",
              speak:
                "<s>Your  meeting about \"Adaptive Card design session\"<break strength='weak'/> is starting at 12:30pm</s><s>Do you want to snooze <break strength='weak'/> or do you want to send a late notification to the attendees?</s>",
              body: [
                {
                  type: "Image",
                  size: "large",
                  url:
                    "https://www.constancehospitality.com/images/logo_254.png"
                },
                {
                  type: "TextBlock",
                  text: "Welcome to Constance Bot! Your friendly Bot!"
                }
              ]
            }
          });

        bot.send(welcomeCard);
      }
    });
  }
});

// Greetings

bot
  .dialog("Greetings", session => {
    var msg = new builder.Message(session)
      .text("How can I assist you today?")
      .suggestedActions(
        builder.SuggestedActions.create(session, [
          builder.CardAction.imBack(session, "Hotel Booking", "Hotel Booking"),
          builder.CardAction.imBack(session, "Services", "Services"),
          builder.CardAction.imBack(session, "Leisure", "Leisure")
        ])
      );
    session.send(msg);
  })
  .triggerAction({
    matches: "Greetings"
  });

//Purpose of the trip

bot
  .dialog("Purpose", (session, args, next) => {
    var purpose = new builder.Message(session)
      .text("What is the purpose of your visit?")
      .suggestedActions(
        builder.SuggestedActions.create(session, [
          builder.CardAction.imBack(session, "Business", "Business"),
          builder.CardAction.imBack(session, "Personal", "Personal")
        ])
      );
    session.send(purpose);
  })
  .triggerAction({
    matches: "Purpose"
  });

//Search location

bot
  .dialog("Locations", [
    (session, args, next) => {
      session.send("Thank you for choosing us!");
      next();
    },
    (session, args, next) => {
      const location = new builder.Message(session)
        .text("What is your preferred location?")
        .suggestedActions(
          builder.SuggestedActions.create(session, [
            builder.CardAction.imBack(session, "Mauritius", "Mauritius"),
            builder.CardAction.imBack(session, "Seychelles", "Seychelles"),
            builder.CardAction.imBack(session, "Madagascar", "Madagascar"),
            builder.CardAction.imBack(session, "Maldives", "Maldives"),
            builder.CardAction.imBack(session, "Zanzibar", "Zanzibar")
          ])
        );
      session.send(location);
    }
  ])
  .triggerAction({
    matches: "Locations"
  });

//Search hotels

bot
  .dialog("SearchHotels", [
    (session, args, next) => {
      const message = `Looking for hotels in ${session.message.text}`;
      const preferredLocation = session.message.text;
      session.send(message, preferredLocation);
      // Async search
      Store.searchHotels(preferredLocation).then(hotels => {
        // args
        session.send(`I found ${hotels.length} hotels:`);
        let message = new builder.Message()
          .attachmentLayout(builder.AttachmentLayout.carousel)
          .attachments(hotels.map(hotelAsAttachment));
        session.send(message);
        // End
        session.endDialog();
      });
    }
  ])
  .triggerAction({
    matches: "SearchHotels"
  });

// bot
//   .dialog("SearchHotels", [
//     (session, args, next) => {
//       session.send("Thank you for choosing us!");
// try extracting entities
// const cityEntity = builder.EntityRecognizer.findEntity(
//   args.intent.entities,
//   "builtin.geography.city"
// );

// console.log("city entity", cityEntity);
// const airportEntity = builder.EntityRecognizer.findEntity(
//   args.intent.entities,
//   "AirportCode"
// );
// console.log("airport entity", airportEntity);
// if (cityEntity) {
//   // city entity detected, continue to next step
//   session.dialogData.searchType = "city";
//   next({ response: cityEntity.entity });
// } else if (airportEntity) {
//   // airport entity detected, continue to next step
//   session.dialogData.searchType = "airport";
//   next({ response: airportEntity.entity });
// }
//  else {
// no entities detected, ask user for a destination
// builder.Prompts.text(session, "Please select your preferred location!");
//
//   // }
// },
//   (session, results) => {
// const destination = results.response;
// let message = "Looking for hotels";
// if (session.message.text === "airport") {
//   message += " near %s airport...";
// } else {
//   message += " in %s...";
// }
// session.send(message, destination);
// // Async search
// Store.searchHotels(destination).then(hotels => {
//   // args
//   session.send(`I found ${hotels.length} hotels:`);
//   let message = new builder.Message()
//     .attachmentLayout(builder.AttachmentLayout.carousel)
//     .attachments(hotels.map(hotelAsAttachment));
//   session.send(message);
//   // End
//   session.endDialog();
// });
//   }
// ])
// .triggerAction({
//   matches: "SearchHotels",
//   onInterrupted: session => {
//     session.send("Please provide a destination");
//   }
// });

bot
  .dialog("ShowHotelsReviews", (session, args) => {
    // retrieve hotel name from matched entities
    const hotelEntity = builder.EntityRecognizer.findEntity(
      args.intent.entities,
      "Hotel"
    );
    if (hotelEntity) {
      session.send(`Looking for reviews of '${hotelEntity.entity}'...`);
      Store.searchHotelReviews(hotelEntity.entity).then(reviews => {
        let message = new builder.Message()
          .attachmentLayout(builder.AttachmentLayout.carousel)
          .attachments(reviews.map(reviewAsAttachment));
        session.endDialog(message);
      });
    }
  })
  .triggerAction({
    matches: "ShowHotelsReviews"
  });

// Spell Check
if (process.env.IS_SPELL_CORRECTION_ENABLED === "true") {
  bot.use({
    botbuilder: (session, next) => {
      spellService
        .getCorrectedText(session.message.text)
        .then(text => {
          session.message.text = text;
          next();
        })
        .catch(error => {
          console.error(error);
          next();
        });
    }
  });
}

// Helpers
const hotelAsAttachment = hotel => {
  console.log(hotel.name, hotel.hotelName, "blha");
  return new builder.HeroCard()
    .title(hotel.hotelName)
    .subtitle(`\n${hotel.Rating}\n${hotel.description}`)
    .images([new builder.CardImage().url(hotel.image)])
    .buttons([
      new builder.CardAction()
        .title("Book now")
        .type("openUrl")
        .value("https://www.bing.com/search?q=hotels+in+")
    ]);
};

const reviewAsAttachment = review => {
  return new builder.ThumbnailCard()
    .title(review.title)
    .text(review.text)
    .images([new builder.CardImage().url(review.image)]);
};
