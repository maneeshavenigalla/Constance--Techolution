// This loads the environment variables from the .env file
require("dotenv-extended").load();

const builder = require("botbuilder");
const restify = require("restify");
const Store = require("./store");
const spellService = require("./spell-service");
var nodemailer = require("nodemailer");
var sgTransport = require("nodemailer-sendgrid-transport");
const fs = require("fs");
const handlebars = require("handlebars");
const path = require("path");
const config = require("./config");

var options = {
  auth: {
    api_user: config.username,
    api_key: config.password
  }
};

const userData = {};

var client = nodemailer.createTransport(sgTransport(options));

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
                  size: "small",
                  url:
                    "https://www.constancehospitality.com/images/logo_254.png"
                },
                {
                  type: "TextBlock",
                  text: `Welcome to Constance Bot! Your friendly Bot! Type "hi" to start a conversation`
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
      .text("Hello there! How can I assist you today?")
      .suggestedActions(
        builder.SuggestedActions.create(session, [
          builder.CardAction.imBack(session, "Hotel Booking", "Hotel Booking"),
          builder.CardAction.imBack(session, "Services", "Services")
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
      .text(" Please select the purpose of your visit :")
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
        .text(
          "What is your preferred location? Please select from the choices below:"
        )
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
        session.send(`I found ${hotels.length} hotel(s):`);
        let message = new builder.Message()
          .attachmentLayout(builder.AttachmentLayout.carousel)
          .attachments(
            hotels.map(hotel => {
              return new builder.HeroCard(session)
                .title(hotel.hotelName)
                .text(hotel.Location)
                .subtitle(
                  `Hotel Rating - ${hotel.Rating}\n Description - ${
                    hotel.description
                  }`
                )
                .images([builder.CardImage.create(session, hotel.image)])
                .buttons([
                  builder.CardAction.imBack(
                    session,
                    hotel.hotelName,
                    "View Hotel"
                  )
                ]);
            })
          );
        userData.location = session.message.text;

        session.send(message);
        // End
        session.endDialog();
      });
    }
  ])
  .triggerAction({
    matches: "SearchHotels"
  });

//Hotel Query

bot
  .dialog("HotelQuery", [
    (session, args, next) => {
      const roomPrompt = `We are fetching available rooms for you in ${
        session.message.text
      }`;
      session.send(roomPrompt, session.message.text);
      // Async search
      Store.searchRooms(session.message.text).then(rooms => {
        session.send(`I found ${rooms[0].typeOfRooms.length} room/s:`);
        let message = new builder.Message()
          .attachmentLayout(builder.AttachmentLayout.carousel)
          .attachments(
            rooms[0].typeOfRooms.map(room => {
              return new builder.HeroCard(session)
                .title(room.roomType)
                .subtitle(
                  `\nPrice - ${room.Price}\n Number of guests:${
                    room.NoOfGuests
                  }`
                )
                .images([builder.CardImage.create(session, room.roomImage)])
                .buttons([
                  builder.CardAction.imBack(session, room.roomType, "Book now")
                ]);
            })
          );

        userData.hotelName = session.message.text;

        session.send(message);
      });
    }
  ])
  .triggerAction({
    matches: "HotelQuery"
  });

//Ask number of rooms
bot
  .dialog("NumberOfDays", [
    (session, args, next) => {
      session.send("Can you enter the duration of your stay?");
    }
  ])
  .triggerAction({
    matches: "NumberOfDays"
  });

//Booking Date

bot
  .dialog("BookingDate", [
    (session, args, next) => {
      console.log(args);
      session.send("Please enter your date of arrival");
      userData.roomType = session.message.text;
    }
  ])
  .triggerAction({
    matches: "BookingDate"
  });

//ConfirmBooking

bot
  .dialog("ConfirmBooking", [
    (session, args, next) => {
      const ConfirmDialog = new builder.Message(session)
        .text(`Do you want me to confirm booking on: ${session.message.text}?`)
        .suggestedActions(
          builder.SuggestedActions.create(session, [
            builder.CardAction.imBack(session, "Yes", "Yes"),
            builder.CardAction.imBack(session, "No", "No")
          ])
        );
      userData.arrivalDate = session.message.text;

      session.send(ConfirmDialog);
    }
  ])
  .triggerAction({
    matches: "ConfirmBooking"
  });

//Booking Details

bot
  .dialog("BookingDetails", [
    (session, args, next) => {
      if (session.message.text === "No") {
        session.send(
          "We`ll miss you! Please consider us for your future bookings"
        );
      } else {
        session.send(
          "Please enter your email below to continue with the reservation:"
        );
      }
    }
  ])
  .triggerAction({
    matches: "BookingDetails"
  });

//Confirm Mailer

bot
  .dialog("Mailer", [
    (session, args, next) => {
      let templateString1 = fs.readFileSync(
        path.join(__dirname, "mailer", "index.handlebars"),
        "utf8"
      );
      let fn1 = handlebars.compile(templateString1);

      let templateData1 = userData;

      var emailDetails = {
        from: "booking@techolution.com",
        to: session.message.text,
        subject: "Hotel Booking",
        text: "Constance Hospitality",
        html: fn1(templateData1)
      };

      async function sendMailer() {
        await client.sendMail(emailDetails, function(err, info) {
          if (err) {
            console.log(err);
          } else {
            console.log(info.response);
          }
        });
      }
      sendMailer();

      const transportation = new builder.Message(session)
        .text(
          "We have mailed your booking details. Please check your mail for further assistance.\nDo you want me to help you with the transportation?"
        )
        .suggestedActions(
          builder.SuggestedActions.create(session, [
            builder.CardAction.imBack(
              session,
              "Yes, that would be lovely",
              "Yes, that would be lovely"
            ),
            builder.CardAction.imBack(session, "No, thank you", "No, thank you")
          ])
        );
      session.send(transportation);
    }
  ])
  .triggerAction({
    matches: "Mailer"
  });

//FlightDetails

bot
  .dialog("FlightDetails", [
    (session, args, next) => {
      if (session.message.text === "No, thank you") {
        const servicesOpted = new builder.Message(session)
          .text("Do you want to look at the services provided?")
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.imBack(session, "Services", "Services"),
              builder.CardAction.imBack(
                session,
                "Not interested",
                "Not interested"
              )
            ])
          );
        session.send(servicesOpted);
      } else {
        session.send(
          "Kindly send your flight details to support@constance.com"
        );
        const servicesOpted = new builder.Message(session)
          .text("Do you want to look at the services provided?")
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.imBack(session, "Services", "Services"),
              builder.CardAction.imBack(
                session,
                "Not interested",
                "Not interested"
              )
            ])
          );
        session.send(servicesOpted);
      }
    }
  ])
  .triggerAction({
    matches: "FlightDetails"
  });

//AdditionalQueries

bot
  .dialog("AdditionalQueries", [
    (session, args, next) => {
      const typesOfServices = new builder.Message(session)
        .text("Welcome to our services! What type of service do you need?")
        .suggestedActions(
          builder.SuggestedActions.create(session, [
            builder.CardAction.imBack(session, "Restaurants", "Restaurants"),
            builder.CardAction.imBack(session, "Golf", "Golf"),
            builder.CardAction.imBack(session, "Wine", "Wine")
          ])
        );
      session.send(typesOfServices);
    }
  ])
  .triggerAction({
    matches: "AdditionalQueries"
  });

//Restaurants
bot
  .dialog("Restaurants", [
    (session, args, next) => {
      // Async search
      Store.searchRestaurants().then(restaurant => {
        // args
        session.send(`I found ${restaurant.length} restaurant/s:`);
        let message = new builder.Message()
          .attachmentLayout(builder.AttachmentLayout.carousel)
          .attachments(
            restaurant.map(rest => {
              return new builder.HeroCard(session)
                .title(`${rest.name}-${rest.timings}`)
                .text(rest.cuisine)
                .subtitle(`${rest.specials}\n${rest.rating}`)
                .images([builder.CardImage.create(session, rest.image)])
                .buttons([
                  builder.CardAction.imBack(session, rest.name, "View Menu")
                ]);
            })
          );

        session.send(message);
        // End
        session.endDialog();
      });
    }
  ])
  .triggerAction({
    matches: "Restaurants"
  });

//PromptMenu
bot
  .dialog("NameOfRestaurant", [
    (session, args, next) => {
      const preferredRestaurant = session.message.text;
      // Async search
      Store.promptMenu(preferredRestaurant).then(restaurant => {
        // args
        let menuCard = new builder.Message()
          .attachmentLayout(builder.AttachmentLayout.carousel)
          .attachments(
            restaurant.map(menu => {
              console.log(menu);
              return new builder.HeroCard(session)
                .title(menu.RestaurantName)
                .images([builder.CardImage.create(session, menu.resMenu)])
                .buttons([
                  builder.CardAction.imBack(
                    session,
                    "Send menu in mail",
                    "Send menu in mail"
                  ),

                  builder.CardAction.imBack(session, "Book Table", "Book Table")
                ]);
            })
          );
        session.send(menuCard);
      });
    }
  ])
  .triggerAction({
    matches: "NameOfRestaurant"
  });

//No Of Individuals

bot
  .dialog("NoOfIndividuals", [
    (session, args, next) => {
      if (session.message && session.message.value) {
        function processSubmitAction(session, value) {
          var defaultErrorMessage = "Please enter a value";
          if (!value.noGuests) {
            session.send(defaultErrorMessage);
            return false;
          } else {
            return true;
          }
        }
        // A Card's Submit Action obj was received
        if (processSubmitAction(session, session.message.value)) {
          next(session.message.value);
        }
        return;
      }
      // Display Welcome card with Hotels and Flights search options
      var card = {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.0",
          body: [
            {
              type: "ColumnSet",
              columns: [
                {
                  type: "Column",
                  width: 2,
                  items: [
                    {
                      type: "TextBlock",
                      text: "Please enter the number of guests?",
                      weight: "bolder",
                      size: "medium"
                    },
                    {
                      type: "TextBlock",
                      text: "Number of Guests"
                    },
                    {
                      type: "Input.Number",
                      id: "noGuests",
                      placeholder: "Please enter a value"
                    },
                    {
                      type: "TextBlock",
                      text: "Please enter your booking time"
                    },
                    {
                      type: "Input.Time",
                      id: "bookingTime",
                      placeholder: "Please enter a value"
                    }
                  ]
                }
              ]
            }
          ],
          actions: [
            {
              type: "Action.Submit",
              title: "Submit"
            }
          ]
        }
      };

      var msg = new builder.Message(session).addAttachment(card);
      session.send(msg);
    },
    (session, results) => {
      session.send(
        "Thanks a lot for your valuable time. Your booking has been done!!"
      );
      var otherServices = new builder.Message(session)
        .text("Do you want to have a look at our other services?")
        .suggestedActions(
          builder.SuggestedActions.create(session, [
            builder.CardAction.imBack(session, "Restaurant", "Restaurant"),
            builder.CardAction.imBack(session, "Golf", "Golf"),
            builder.CardAction.imBack(session, "Wine", "Wine"),
            builder.CardAction.imBack(
              session,
              "Not interested",
              "Not interested"
            )
          ])
        );
      session.send(otherServices);
    }
  ])
  .triggerAction({
    matches: "NoOfIndividuals"
  });

//Booking Slot

//Reservation Confirmation

bot
  .dialog("ConfirmReservation", [
    (session, args, next) => {
      session.send("A confirmation mail has been sent to your email ID");
    }
  ])
  .triggerAction({
    matches: "ConfirmReservation"
  });

//Golf
bot
  .dialog("Golf", [
    (session, args, next) => {
      // const golfCard = new builder.Message()
      //   .attachmentLayout(builder.AttachmentLayout.carousel)
      //   .attachments(
      Store.GolfService().then(golfItem => {
        // args
        let message = new builder.Message()
          .attachmentLayout(builder.AttachmentLayout.carousel)
          .attachments(
            golfItem.map(golf => {
              return new builder.HeroCard(session)
                .title(`${golf.courseType}`)
                .text(
                  `Yard range - ${golf.yardRange}\n Number of holes - ${
                    golf.holes
                  }`
                )
                .subtitle(
                  `Driving Range - ${golf.drivingRange}\n Night Golf - ${
                    golf.nightgolf
                  }\n Rental shoes - ${golf.rentalShoes} `
                )
                .images([builder.CardImage.create(session, golf.image)])
                .buttons([
                  builder.CardAction.imBack(session, "Book now", "Book now")
                ]);
            })
          );

        session.send(message);
        // End
        session.endDialog();
      });
      // )();
      // golf.map(golfMenu => {
      //   console.log(golfMenu);
      //   return new builder.HeroCard(session)
      //     .title(golfMenu.courseType)
      //     .subtitle(
      //       `Yard Range - ${golfMenu.yardRange}\n Walking Permitted - ${
      //         golfMenu.walkingPermitted
      //       }\n Driving range - ${golfMenu.drivingRange}\n holes - ${
      //         golf.holes
      //       }\n Night Golf - ${golfMenu.nightGolf}\n Rental shoes - ${
      //         golfMenu.rentalShoes
      //       }`
      //     )
      //     .images([builder.CardImage.create(session, golfMenu.image)])
      //     .buttons([
      //       builder.CardAction.imBack(
      //         session,
      //         "Book Golf Course",
      //         "Book Golf Course"
      //       )
      //     ]);
      // })
      // session.send(golfCard);
    }
  ])
  .triggerAction({
    matches: "Golf"
  });

//Wine
bot
  .dialog("Wine", [
    (session, args, next) => {
      Store.WineService().then(wineItem => {
        // args
        let message = new builder.Message()
          .attachmentLayout(builder.AttachmentLayout.carousel)
          .attachments(
            wineItem.map(wine => {
              return new builder.HeroCard(session)
                .title(`${wine.name}`)
                .text(`Recommended - ${wine.recommended}`)
                .images([builder.CardImage.create(session, wine.image)])
                .buttons([
                  builder.CardAction.imBack(session, wine.name, "Book now")
                ]);
            })
          );

        session.send(message);
        // End
        session.endDialog();
      });
    }
  ])
  .triggerAction({
    matches: "Wine"
  });

//Wine Booking

bot
  .dialog("WineBooking", [
    (session, args, next) => {
      if (session.message && session.message.value) {
        function processSubmitAction(session, value) {
          var defaultErrorMessage = "Please enter a value";
          if (!value.noUnits) {
            session.send(defaultErrorMessage);
            return false;
          } else {
            return true;
          }
        }
        // A Card's Submit Action obj was received
        if (processSubmitAction(session, session.message.value)) {
          next(session.message.value);
        }
        return;
      }
      // Display Welcome card with Hotels and Flights search options
      var card = {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.0",
          body: [
            {
              type: "ColumnSet",
              columns: [
                {
                  type: "Column",
                  width: 2,
                  items: [
                    {
                      type: "TextBlock",
                      text: "Please enter the following details!",
                      weight: "bolder",
                      size: "medium"
                    },
                    {
                      type: "Input.Number",
                      id: "noUnits",
                      placeholder: "Please enter number of units"
                    },
                    {
                      type: "Input.Text",
                      id: "bookingTime",
                      placeholder: "Please enter your Room Number"
                    }
                  ]
                }
              ]
            }
          ],
          actions: [
            {
              type: "Action.Submit",
              title: "Submit"
            }
          ]
        }
      };

      var msg = new builder.Message(session).addAttachment(card);
      session.send(msg);
    },
    (session, results) => {
      session.send(
        "Your booking has been done. You`ll receive the order in the next 30 mins."
      );
      var otherServices = new builder.Message(session)
        .text("Do you want to have a look at our other services?")
        .suggestedActions(
          builder.SuggestedActions.create(session, [
            builder.CardAction.imBack(session, "Services", "Services"),
            builder.CardAction.imBack(
              session,
              "Not interested",
              "Not interested"
            )
          ])
        );
      session.send(otherServices);
    }
  ])
  .triggerAction({
    matches: "WineBooking"
  });

//End Greetings

bot
  .dialog("EndGreetings", [
    (session, args, next) => {
      if (session.message.text === "Not interested") {
        session.send("Have a nice day");
      } else {
        session.send("Thank you! I`m glad I could be of some help!!");
      }
    }
  ])
  .triggerAction({
    matches: "EndGreetings"
  });

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

const reviewAsAttachment = review => {
  return new builder.ThumbnailCard()
    .title(review.title)
    .text(review.text)
    .images([new builder.CardImage().url(review.image)]);
};
