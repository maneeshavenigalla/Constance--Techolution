const ReviewsOptions = [
  "“Very stylish, great stay, great staff”",
  "“good hotel awful meals”",
  "“Need more attention to little things”",
  "“Lovely small hotel ideally situated to explore the area.”",
  "“Positive surprise”",
  "“Beautiful suite and resort”"
];

const hotelDetails = [
  {
    id: 0,
    hotelName: "Constance Belle Mare Plage",
    image:
      "https://www.constancehospitality.com/media/1040/constance-hospitality-management-history-3.jpg",
    Location: "Mauritius",
    typeOfRooms: {
      Deluxe: {
        Price: "$1200",
        NoOfGuests: 3
      },
      Single: {
        Price: "$1650",
        NoOfGuests: 2
      },
      Smoking: {
        Price: "$1850",
        NoOfGuests: 3
      },
      NonSmoking: {
        Price: "$1750",
        NoOfGuests: 2
      }
    },
    Rating: 4.7,

    description:
      "Birth of Belle Mare Plage Hotel with only ten self-catering bungalows. The hotel still set along a stunning 2km white sand beach is in a sheltered bay on the east coast of Mauritius."
  },
  {
    id: 1,
    hotelName: "Legend Golf Course",
    image:
      "https://www.constancehospitality.com/media/1041/constance-hospitality-management-history-4.jpg",
    Location: "Mauritius",
    typeOfRooms: {
      Deluxe: {
        Price: "$1200"
      },
      Single: {
        Price: "$1650"
      },
      Smoking: {
        Price: "$1850"
      },
      NonSmoking: {
        Price: "$1750"
      },
      NoOfGuests: {
        Deluxe: 3,
        Single: 2,
        Smoking: 3,
        NonSmoking: 2
      }
    },
    Rating: 4.9,

    description:
      "Launch of Legend Golf Course and the first edition of the Golf competition: Mauritius Golf Open was announced. Constance Belle Mare Plage added 56 rooms and six suites during this year."
  },
  {
    id: 3,
    hotelName: "Constance Prince Maurice",
    image:
      "https://www.constancehospitality.com/media/1045/constance-hospitality-management-history-8.jpg",
    Location: "Mauritius",
    typeOfRooms: {
      Deluxe: {
        Price: "$1200"
      },
      Single: {
        Price: "$1650"
      },
      Smoking: {
        Price: "$1850"
      },
      NonSmoking: {
        Price: "$1750"
      },
      NoOfGuests: {
        Deluxe: 3,
        Single: 2,
        Smoking: 3,
        NonSmoking: 2
      }
    },
    Rating: 4.9,

    description:
      "The opening of Constance Prince Maurice. A hotel situated in the East Coast of Mauritius,catering for honeymooners and people looking for relaxed holidays."
  },
  {
    id: 4,
    hotelName: "Constance Prince Maurice",
    image:
      "https://www.constancehospitality.com/media/1045/constance-hospitality-management-history-8.jpg",
    Location: "Mauritius",
    typeOfRooms: {
      Deluxe: {
        Price: "$1200"
      },
      Single: {
        Price: "$1650"
      },
      Smoking: {
        Price: "$1850"
      },
      NonSmoking: {
        Price: "$1750"
      },
      NoOfGuests: {
        Deluxe: 3,
        Single: 2,
        Smoking: 3,
        NonSmoking: 2
      }
    },
    Rating: 4.9,

    description:
      "The opening of Constance Prince Maurice. A hotel situated in the East Coast of Mauritius,catering for honeymooners and people looking for relaxed holidays."
  },
  {
    id: 5,
    hotelName: "Constance Lemuria ",
    image:
      "https://www.constancehospitality.com/media/1061/constance-hospitality-management-history-12.jpg",
    Location: "Seychelles",
    typeOfRooms: {
      Deluxe: {
        Price: "$1200"
      },
      Single: {
        Price: "$1650"
      },
      Smoking: {
        Price: "$1850"
      },
      NonSmoking: {
        Price: "$1750"
      },
      NoOfGuests: {
        Deluxe: 3,
        Single: 2,
        Smoking: 3,
        NonSmoking: 2
      }
    },
    Rating: 5,

    description:
      "The opening of Constance Lemuria Seychelles.On Praslin island with a modern approach to design and quality with an 18 hole championship golf course."
  },
  {
    id: 6,
    hotelName: "Constance Tsarabanjina ",
    image:
      "https://www.constancehospitality.com/media/1046/constance-hospitality-management-history-9.jpg",
    Location: "Madagascar",
    typeOfRooms: {
      Deluxe: {
        Price: "$1200"
      },
      Single: {
        Price: "$1650"
      },
      Smoking: {
        Price: "$1850"
      },
      NonSmoking: {
        Price: "$1750"
      },
      NoOfGuests: {
        Deluxe: 3,
        Single: 2,
        Smoking: 3,
        NonSmoking: 2
      }
    },
    Rating: 5,

    description:
      "The opening of Constance Tsarabanjina Madagascar.Eco-friendly, laid back and intimate hotel with 25 beach villas.Creation of Le Spa de Constance."
  },
  {
    id: 7,
    hotelName: " Constance Halaveli",
    image:
      "https://www.constancehospitality.com/media/1043/constance-hospitality-management-history-6.jpg",
    Location: "Maldives",
    typeOfRooms: {
      Deluxe: {
        Price: "$1200"
      },
      Single: {
        Price: "$1650"
      },
      Smoking: {
        Price: "$1850"
      },
      NonSmoking: {
        Price: "$1750"
      },
      NoOfGuests: {
        Deluxe: 3,
        Single: 2,
        Smoking: 3,
        NonSmoking: 2
      }
    },
    Rating: 5,

    description:
      "The opening of Constance Halaveli Maldives, a hotel on the North Ari Atoll with beach and water villas with a luxurious feel."
  },
  {
    id: 8,
    hotelName: "Constance Moofushi ",
    image:
      "https://www.constancehospitality.com/media/1047/constance-hospitality-management-history-10.jpg",
    Location: "Maldives",
    typeOfRooms: {
      Deluxe: {
        Price: "$1200"
      },
      Single: {
        Price: "$1650"
      },
      Smoking: {
        Price: "$1850"
      },
      NonSmoking: {
        Price: "$1750"
      },
      NoOfGuests: {
        Deluxe: 3,
        Single: 2,
        Smoking: 3,
        NonSmoking: 2
      }
    },
    Rating: 5,

    description:
      "Second hotel in the Maldives; Constance Moofushi Maldives sees the light."
  },
  {
    id: 9,
    hotelName: "Constance Ephelia ",
    image:
      "https://www.constancehospitality.com/media/1061/constance-hospitality-management-history-12.jpg",
    Location: "Seychelles",
    typeOfRooms: {
      Deluxe: {
        Price: "$1200"
      },
      Single: {
        Price: "$1650"
      },
      Smoking: {
        Price: "$1850"
      },
      NonSmoking: {
        Price: "$1750"
      },
      NoOfGuests: {
        Deluxe: 3,
        Single: 2,
        Smoking: 3,
        NonSmoking: 2
      }
    },
    Rating: 5,

    description:
      "Spacious and beautifully built on Mahé island, Constance Ephelia Seychelles adds up to the group."
  },
  {
    id: 10,
    hotelName: " C Palmar ",
    image:
      "https://www.constancehospitality.com/media/1152/c-palmar-mauritius-c-bar-terrace.jpg",
    Location: "Mauritius",
    typeOfRooms: {
      Deluxe: {
        Price: "$1200"
      },
      Single: {
        Price: "$1650"
      },
      Smoking: {
        Price: "$1850"
      },
      NonSmoking: {
        Price: "$1750"
      },
      NoOfGuests: {
        Deluxe: 3,
        Single: 2,
        Smoking: 3,
        NonSmoking: 2
      }
    },
    Rating: 5,

    description:
      "The opening of C Palmar Mauritius -  A chic All-inclusive beach hotel on the East Coast of Mauritius."
  },
  {
    id: 11,
    hotelName: "  Constance Aiyana Pemba ",
    image:
      "https://www.constancehospitality.com/media/1153/constance-aiyana-pemba-zanzibar-00.jpg",
    Location: "Zanzibar",
    typeOfRooms: {
      Deluxe: {
        Price: "$1200"
      },
      Single: {
        Price: "$1650"
      },
      Smoking: {
        Price: "$1850"
      },
      NonSmoking: {
        Price: "$1750"
      },
      NoOfGuests: {
        Deluxe: 3,
        Single: 2,
        Smoking: 3,
        NonSmoking: 2
      }
    },
    Rating: 5,

    description:
      "The opening of Constance Aiyana Pemba, Zanzibar . A soulful hotel with a minimalist luxury décor with a Zanzibari touch."
  }
];

const searchHotels = destination => {
  return new Promise((resolve, reject) => {
    // Filling the hotels results manually just for demo purposes
    // let hotels = Array(5).fill({});
    // hotels =
    hotelDetails.map(hotel => {
      console.log(hotel);
      return {
        name: hotel.hotelName,
        Location: hotel.Location,
        rating: hotel.Rating,
        image: hotel.image
      };
      // return {
      //   name: hotel.name,
      //   location: hotel.Location,
      //   rating: Math.ceil(Math.random() * 5),
      //   numberOfReviews: Math.floor(Math.random() * 5000) + 1,
      //   priceStarting: Math.floor(Math.random() * 450) + 80,
      //   image:
      //     "https://cdn1-www.dogtime.com/assets/uploads/2011/03/puppy-development.jpg"
      // };
    });
    // hotelDetails.sort((a, b) => {
    //   return a.priceStarting - b.priceStarting;
    // });
    // complete promise with a timer to simulate async response
    setTimeout(() => {
      resolve(hotelDetails);
    }, 500);
  });
};

const searchHotelReviews = hotelName => {
  return new Promise((resolve, reject) => {
    // Filling the review results manually just for demo purposes
    let reviews = Array(5).fill({});
    reviews = reviews.map(review => {
      return {
        title:
          ReviewsOptions[Math.floor(Math.random() * ReviewsOptions.length)],
        text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Mauris odio magna, sodales vel ligula sit amet, vulputate vehicula velit.
                Nulla quis consectetur neque, sed commodo metus.`,
        image:
          "https://cdn1-www.dogtime.com/assets/uploads/2011/03/puppy-development.jpg"
      };
    });
    // complete promise with a timer to simulate async response
    setTimeout(() => {
      resolve(reviews);
    }, 1000);
  });
};

module.exports = {
  searchHotels,
  searchHotelReviews
};
